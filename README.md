# Noqeri Web

Official public website, documentation interface and reference hosted runtime for Noqeri.

The site is React + Vite with a small Node transport host. Noqeri-authored `.nqr` remains the application/API language layer; Node owns HTTP transport and static-file delivery.

## Get the Noqeri source from a terminal

The web host now exposes first-class source bootstrap endpoints. Replace `https://your-noqeri-host.example` with the deployed host:

```sh
curl -fsSL https://your-noqeri-host.example/get/noqeri | sh
```

Windows PowerShell:

```powershell
irm https://your-noqeri-host.example/get/noqeri.ps1 | iex
```

Both installers fetch `EMN90909/Noqeri` and install the selected branch under `$NOQERI_HOME` (default `~/.noqeri/src/current`). Set `NOQERI_REF` to install a different branch. `GET /source/noqeri` returns machine-readable source/install metadata.

## Local development

```sh
npm install
npm run test:source
npm run build
npm run smoke
```

To try generating **restricted browser ES modules** locally (requires a verified Stage-2 compiler; backend support is not production-ready):

```sh
noqeri web backend/api.nqr backend/api.generated.mjs
noqeri web src/noqeri/client.nqr src/noqeri/client.generated.mjs
```

Automatic GitHub Actions CI is intentionally disabled/removed so repository pushes do not consume Actions minutes. Build and smoke-test locally before pushing.

## License

GNU GPL v3 only (`GPL-3.0-only`). See `LICENSE`.

Made by [Noethric](https://noethric.xyz).

## Compiler compatibility and distribution status (2026-10-17)

The Noqeri language is **pre-release**. Having website installers and a download endpoint does not prove the compiler boots on a clean machine. `Noqeri/scripts/build.sh` requires a trusted Stage-0 seed that can compile `Compiler/selfhost/main.nqr` to the **Stage-2 ES module** expected by the portable host, and now checks the output's JS syntax and exported ABI before accepting it. That end-to-end bootstrap has **not** been verified. Binary NQO2 objects are not JavaScript modules.

For the website, React/Vite can run independently of a verified Noqeri compiler. Noqeri-generated API/client modules should only be deployed after compiler checks, import tests and host-capability tests pass. Do not present generated `.nqo` as importable JS. Source installation endpoints fetch source; they do not supply a proven executable or verified release archive. Avoid claiming native Windows/Linux/macOS parity until tested installers, signatures/hashes, and smoke results exist.

Registry package listings are not equivalent to tested package compatibility. The registry index and package manager should be verified with a local release gate and offline integrity tests before distribution is called stable.

## Build verification update

The latest Noqeri source audit found and corrected literal escaped-newline corruption in the main repository POSIX build script. The build script now requests a JavaScript Stage-2 module and validates its ABI, but no completed clean-machine Stage-2 bootstrap has yet been demonstrated. On the available build worker, `git ls-remote` failed because `github.com` could not be resolved. Accordingly **the website must not advertise Noqeri's compiler or native targets as verified for v1.0.0**.

For an independent local qualification, check out `Noqeri`, `noqeri-web`, and `noqeri-registry` as sibling directories, configure `NOQERI_STAGE0` using a trusted executable, and run `node scripts/qualify-release.mjs` from Noqeri. That runner stores a JSON pass/fail report and does not require GitHub Actions. Missing seed/compiler/checkout checks are explicit failures, not passing tests.

## Registry downloads and NoeSQL documentation (2026-10-18)

The package pages now read the public registry index and select the highest **non-yanked** semantic version. For example, `noqeri/json@0.4.0` is the current published release; the older `1.0.0` was withdrawn and must not be advertised or downloaded by this website. Archive routes reject withdrawn releases with HTTP 404, validate every relative path and required `package.nqr` manifest, reject mismatched upstream file URLs, and check the registry's file-level `sha256:` integrity value when provided. Successful responses include the archive's SHA-256 checksum in `X-Archive-SHA256`.

`.nqpkg` is a gzip-compressed USTAR archive for an exact published version. Direct downloads do not modify a Noqeri project. Run `noqeri add noqeri/json@0.4.0` from a configured project for dependency resolution and lockfile handling. **NoeSQL itself is not a public registry package**: its source repository is private, and the documentation pages do not claim a public release or verified Noqeri/Zig native engine.

Motion now reads browser pointer/reduced-motion capabilities from a checked-in JS adapter rather than nonexistent exports in a generated compiler artifact. Global scroll-driven parallax and redundant animations were removed; the package catalog limits layout animations to expanded items.

### Verification commands

```sh
npm run test:packages   # offline release ordering and mocked tar download
npm run test:motion     # static motion lifecycle contract
npm run test:source     # installer generation contract
npm run build
npm run smoke           # requires GitHub API/raw access and a built dist/
```

These checks are not all equivalent. Static and mocked tests do **not** certify live end-to-end archive availability, real browser frame time, accessibility, compiler bootstrap or native database durability. The `npm run smoke` test requires an accessible network and real registry files; run it from a deployment-like environment before claiming production readiness. No GitHub Actions CI is automatically enabled.


## NoeSQL npm integration status (v0.7.6)

The Packages and Install pages now document NoeSQL's versioned npm source contract and clearly label `npm install noesql@0.7.6` as a **future publication command**. The NoeSQL repo remains private and there is no verified published npm tarball or public registry entry; the site deliberately does not create a fake downloadable package. Noqeri's self-hosted native SQL engine and Zig pager integration remain release-gated. Website automation must only advertise a working npm installation after a real registry response and an authorized, integrity-verified package release.
