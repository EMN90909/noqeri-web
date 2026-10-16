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

To regenerate Noqeri browser/server objects locally:

```sh
noqeri web backend/api.nqr backend/api.generated.nqo
noqeri web src/noqeri/client.nqr src/noqeri/client.generated.nqo
```

Automatic GitHub Actions CI is intentionally disabled/removed so repository pushes do not consume Actions minutes. Build and smoke-test locally before pushing.

## License

GNU GPL v3 only (`GPL-3.0-only`). See `LICENSE`.

Made by [Noethric](https://noethric.xyz).
