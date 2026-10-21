# Website integration, canonical protocol

The website talks to the **Registry /v1 HTTP service** through `runtime/registry-download.mjs`, never directly to raw GitHub directory listings or `registry.noedb`. `NOQERI_REGISTRY_URL` is a trusted HTTPS origin in production, or `http://localhost` for local integration. The web host exposes `/registry/index.json` and `/registry/{namespace}/{name}/{version}/download.nqpkg` as compatibility-facing proxy routes to the service.

Both the CLI and website use registry metadata. The proxy checks version metadata against the index and hashes the exact `.nqpkg` bytes before download. No source directory is repackaged in the website. Exact pinned yanked releases remain retrievable; the featured-release selector excludes yanked versions.

Noqeri source is `.noqeri`; the browser compiler emits `.mjs` for Vite/React. The historical `.nqo` web files were JavaScript bootstrap stubs, **not** portable native `.nqri` artifacts. The application route module now resides at `backend/api.noqeri` and client source at `src/noqeri/client.noqeri`. Native Noqeri/NoeSQL `.noedb` integration remains pending; `/api/db-demo` fails explicitly with 503 rather than calling the obsolete NoqeriDB host.

React/Vite stays the UI transport. The Node service stays a narrow HTTP/static-file host. The Stage-1/Stage-2 compiler trust chain has not passed native release qualification. `.nqon` configuration parsing is reserved for an independently tested migration and is not falsely advertised as working.
