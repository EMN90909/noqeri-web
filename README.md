# Noqeri Web

Official website, documentation and Registry/package browser for Noqeri. The **website itself is React + Vite**, served by a small Node HTTP transport. The application's Noqeri source files are `backend/api.noqeri`, `src/noqeri/client.noqeri`, and `public/noqeri/hello.noqeri`. Their browser-compatible transport output uses **`.mjs`**; this is **not** a binary `.nqri` object.

## Runtime architecture and versions

The website can run without a qualified Noqeri Stage-2 native toolchain. Its active API and client browser shims are standard ES modules; the original `.nqr` and `.nqo` files have moved to `tests/fixtures/legacy/`. The web API reports Noqeri's current verified development identity from the checked-in transport, not a falsely certified language release. Noqeri's separate `1.0.0` stabilization branch is **not** a published production release.

As of October 21, 2026, the only three `.nqr` and two `.nqo` paths remaining on `main` are **test fixtures under `tests/fixtures/legacy/`**. Active Noqeri source consists of three `.noqeri` files, and the website's generated browser modules use `.mjs` rather than `.nqri`.

The `/api/db-demo` route no longer opens the legacy NoqeriDB `.nqdb` format. It uses `runtime/noesql-demo.mjs` and fails with **503** if the private NoeSQL module is not installed. This prevents silently persisting unrelated database formats.

## Registry migration without breaking the website

When `NOQERI_REGISTRY_API_URL` points to a reachable deployed Registry v1 host, the website uses `runtime/registry-api-download.mjs` for index, metadata and `.nqpkg` downloads. It verifies SHA-256 on the exact archive bytes, refuses yanked downloads, and only allows HTTPS (or localhost HTTP).

**Compatibility status:** Until that deployment is configured, the current website uses the existing GitHub-sourced legacy registry adapter. It is intentionally retained so existing public package pages do not break during the migration. Direct GitHub Registry reads are **not yet fully removed**. Remove that adapter only after a live, credentialed NoeSQL-to-Registry end-to-end check and website deployment smoke test pass.

## Local development

Requires Node.js 22+ and the dependencies in `package.json`:

```sh
npm install
npm run test:packages
npm run test:source
npm run build
npm start
```

The optional source compiler outputs browser `.mjs`, not an `.nqri` binary:

```sh
noqeri web backend/api.noqeri backend/api.generated.mjs
noqeri web src/noqeri/client.noqeri src/noqeri/client.generated.mjs
```

Current main-branch CI builds the React site, checks all migrated browser/transport modules, and runs package contract tests. Full live Registry deployment and private NoeSQL persistence remain separate release gates.

## Installer caveats

`/get/noqeri`, `/get/noqeri.ps1`, and `/source/noqeri` provide source installer/bootstrap endpoints. Source download is **not proof of a fully qualified compiler**; users should review scripts before execution and verify hashes and the source revision. Supported OS/architecture claims require actual native executable tests.

## Noqeri-only web applications

The language repository also includes an experimental standalone `view { ... }` frontend with reactive state, Noqeri components and explicit JavaScript interop. It builds sites from `main.noqeri` without writing React or HTML by hand. **This website has not itself been rewritten from React to that experimental frontend.**

## License

GPL-3.0-only. See [LICENSE](LICENSE). Created by [Noethric](https://noethric.xyz).
