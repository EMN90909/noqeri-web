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
