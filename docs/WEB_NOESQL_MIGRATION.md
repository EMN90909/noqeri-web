# Noqeri Web staged NoeSQL + Registry API migration

The canonical source is `backend/api.noqeri`; legacy `backend/api.nqr` and `backend/api.generated.nqo` are retained as compilation/bootstrap fixtures. Regenerate the compiled app from the qualified compiler before removing compatibility output. Do not pretend the new source was compiled when it was not.

The Registry client now talks to `NOQERI_REGISTRY_API_URL` via HTTPS `/v1` endpoints, and the server proxies verified, hashed `.nqpkg` bytes. Web never opens `registry.noedb` or talks to GitHub raw Registry directly.

The `/api/db-demo` route now uses `runtime/noesql-demo.mjs` and canonical `site-demo.noedb` via optional private `noesql/session`. When NoeSQL has not been installed the route responds with HTTP 503 `noesql_runtime_unavailable`; it must not silently use the old NoqeriDB host. Application and data files remain distinct; static serving refuses .noedb, .nqd, .nqdb, WAL and lock extensions.

`npm run test:packages` and `npm run smoke` exercise a mocked live HTTP Registry, integrity checks, yanked and unsafe paths. **Unverified:** live Registry using native NoeSQL, compiled `api.noqeri` under Stage-2, hosted .noedb database demo, and production deployment with private dependency.
