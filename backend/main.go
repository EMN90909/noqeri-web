package main

import (
	"encoding/json"
	"errors"
	"fmt"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"runtime"
	"strings"
	"sync"
	"time"
)

type apiServer struct {
	dataRoot string
	mu       sync.Mutex
}

func newHandler(dataRoot string) http.Handler {
	api := &apiServer{dataRoot: dataRoot}
	mux := http.NewServeMux()
	mux.HandleFunc("/api/", api.handleAPI)
	return mux
}

func (api *apiServer) handleAPI(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Cache-Control", "no-store")
	if r.Method != http.MethodGet && r.Method != http.MethodHead {
		w.Header().Set("Allow", "GET, HEAD")
		writeJSON(w, http.StatusMethodNotAllowed, map[string]string{"error": "method_not_allowed"})
		return
	}

	switch r.URL.Path {
	case "/api/health":
		writeJSON(w, http.StatusOK, map[string]string{
			"status": "ok",
			"language": "1.4",
			"source": "Noqeri",
		})
	case "/api/meta":
		writeJSON(w, http.StatusOK, map[string]string{
			"language": "1.4",
			"edition": "2026",
			"backend": "Go",
			"compiler": runtime.Version(),
		})
	case "/api/db-demo":
		api.databaseDemo(w)
	default:
		writeJSON(w, http.StatusNotFound, map[string]string{"error": "not_found"})
	}
}

func writeJSON(w http.ResponseWriter, status int, value any) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(status)
	if err := json.NewEncoder(w).Encode(value); err != nil {
		log.Printf("write JSON response: %v", err)
	}
}

func (api *apiServer) databaseDemo(w http.ResponseWriter) {
	api.mu.Lock()
	defer api.mu.Unlock()

	if err := os.MkdirAll(api.dataRoot, 0o750); err != nil {
		http.Error(w, "database storage unavailable", http.StatusInternalServerError)
		return
	}

	path := filepath.Join(api.dataRoot, "site-demo.json")
	state := map[string]string{}
	if content, err := os.ReadFile(path); err == nil {
		if err := json.Unmarshal(content, &state); err != nil {
			http.Error(w, "stored demo data is invalid", http.StatusInternalServerError)
			return
		}
	} else if !errors.Is(err, os.ErrNotExist) {
		http.Error(w, "database storage unavailable", http.StatusInternalServerError)
		return
	}
	state["status"] = "ok"

	file, err := os.CreateTemp(api.dataRoot, ".site-demo-*.tmp")
	if err != nil {
		http.Error(w, "database storage unavailable", http.StatusInternalServerError)
		return
	}
	tmp := file.Name()
	defer os.Remove(tmp)

	if err := file.Chmod(0o600); err != nil {
		file.Close()
		http.Error(w, "database storage unavailable", http.StatusInternalServerError)
		return
	}
	if err := json.NewEncoder(file).Encode(state); err != nil {
		file.Close()
		http.Error(w, "database storage unavailable", http.StatusInternalServerError)
		return
	}
	if err := file.Sync(); err != nil {
		file.Close()
		http.Error(w, "database storage unavailable", http.StatusInternalServerError)
		return
	}
	if err := file.Close(); err != nil {
		http.Error(w, "database storage unavailable", http.StatusInternalServerError)
		return
	}
	if err := os.Rename(tmp, path); err != nil {
		http.Error(w, "database storage unavailable", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "text/plain; charset=utf-8")
	_, _ = fmt.Fprintf(w, "key\tvalue\nstatus\t%s\n", strings.ReplaceAll(state["status"], "\n", ""))
}

func main() {
	addr := os.Getenv("GO_API_ADDR")
	if addr == "" {
		addr = "127.0.0.1:8081"
	}
	dataRoot := os.Getenv("GO_API_DATA_ROOT")
	if dataRoot == "" {
		dataRoot = "./data"
	}

	server := &http.Server{
		Addr:              addr,
		Handler:           newHandler(dataRoot),
		ReadHeaderTimeout: 5 * time.Second,
		IdleTimeout:       30 * time.Second,
	}
	log.Printf("Go API listening on %s", addr)
	if err := server.ListenAndServe(); err != nil && !errors.Is(err, http.ErrServerClosed) {
		log.Fatal(err)
	}
}
