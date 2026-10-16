package main

import (
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"strings"
	"testing"
)

func TestHealthEndpoint(t *testing.T) {
	handler := newHandler(t.TempDir())
	response := httptest.NewRecorder()
	handler.ServeHTTP(response, httptest.NewRequest(http.MethodGet, "/api/health", nil))
	if response.Code != http.StatusOK {
		t.Fatalf("health status = %d, want %d", response.Code, http.StatusOK)
	}
	var body map[string]string
	if err := json.Unmarshal(response.Body.Bytes(), &body); err != nil {
		t.Fatalf("decode health response: %v", err)
	}
	if body["status"] != "ok" || body["source"] != "Noqeri" || body["language"] != "1.4" {
		t.Fatalf("unexpected health response: %#v", body)
	}
}

func TestMetadataIdentifiesGoBackend(t *testing.T) {
	response := httptest.NewRecorder()
	newHandler(t.TempDir()).ServeHTTP(response, httptest.NewRequest(http.MethodGet, "/api/meta", nil))
	var body map[string]string
	if err := json.Unmarshal(response.Body.Bytes(), &body); err != nil {
		t.Fatalf("decode metadata: %v", err)
	}
	if response.Code != http.StatusOK || body["backend"] != "Go" || !strings.HasPrefix(body["compiler"], "go") {
		t.Fatalf("unexpected Go metadata: status=%d body=%#v", response.Code, body)
	}
}

func TestRejectsMutatingMethods(t *testing.T) {
	response := httptest.NewRecorder()
	newHandler(t.TempDir()).ServeHTTP(response, httptest.NewRequest(http.MethodPost, "/api/health", nil))
	if response.Code != http.StatusMethodNotAllowed {
		t.Fatalf("POST status = %d, want %d", response.Code, http.StatusMethodNotAllowed)
	}
	if response.Header().Get("Allow") != "GET, HEAD" {
		t.Fatalf("Allow header = %q", response.Header().Get("Allow"))
	}
}

func TestDatabaseDemoPersistsState(t *testing.T) {
	root := t.TempDir()
	handler := newHandler(root)
	for i := 0; i < 2; i++ {
		response := httptest.NewRecorder()
		handler.ServeHTTP(response, httptest.NewRequest(http.MethodGet, "/api/db-demo", nil))
		if response.Code != http.StatusOK || !strings.Contains(response.Body.String(), "status\tok") {
			t.Fatalf("unexpected database demo response: status=%d body=%q", response.Code, response.Body.String())
		}
	}
	content, err := os.ReadFile(filepath.Join(root, "site-demo.json"))
	if err != nil {
		t.Fatalf("read persisted demo state: %v", err)
	}
	var body map[string]string
	if err := json.Unmarshal(content, &body); err != nil || body["status"] != "ok" {
		t.Fatalf("unexpected persisted state: body=%s err=%v", content, err)
	}
}

func TestUnknownAPIPathIsNotFound(t *testing.T) {
	response := httptest.NewRecorder()
	newHandler(t.TempDir()).ServeHTTP(response, httptest.NewRequest(http.MethodGet, "/api/unknown", nil))
	if response.Code != http.StatusNotFound {
		t.Fatalf("unknown route status = %d, want %d", response.Code, http.StatusNotFound)
	}
}
