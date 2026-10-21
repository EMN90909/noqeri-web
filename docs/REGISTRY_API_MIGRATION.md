# Registry HTTP integration (staged)

Configure `NOQERI_REGISTRY_API_URL` to the deployed Registry service base URL (HTTPS; localhost HTTP allowed for development). The website no longer fetches index data or archive files from GitHub. It deliberately fails with HTTP 503 if the Registry service has not been configured.

Required Registry API:
- `GET /v1/index` returns `{ "packages": [...] }`.
- `GET /v1/packages/:namespace/:name/:version` returns `{ "version": "...", "yanked": false, "archiveIntegrity": "sha256:<64 lowercase hex>" }`.
- `GET /v1/packages/:namespace/:name/:version/download` returns the raw deterministic `.nqpkg` bytes.
- An explicitly requested yanked release is refused by the public website's download proxy. Existing locked installations should be handled by a separately authenticated/defined package-manager policy.

The website verifies the SHA-256 hash of the **exact archive bytes** before proxying them. It validates coordinates, limits response sizes, rejects redirects and disallows arbitrary upstream URLs.

**Migration blocker:** The Registry repository does not yet supply a deployed HTTP transport using NoeSQL metadata. Do not deploy this website branch until the service implementing these endpoints is available. This change alone is not an end-to-end Registry or NoeSQL integration.
