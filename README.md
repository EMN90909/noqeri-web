# Noqeri Web

Official public website, documentation interface and reference hosted runtime for Noqeri.

The site is React + Vite, with a Go API service and a small Node transport host for static files, registry downloads, and installer endpoints. Noqeri remains the language the website documents and distributes, but deploying the website does not require compiling or running the Noqeri compiler.

## Get the Noqeri source from a terminal

The web host exposes source bootstrap endpoints. Replace YOUR_HOST with the deployed host:

    curl -fsSL https://YOUR_HOST/get/noqeri | sh

Windows PowerShell:

    irm https://YOUR_HOST/get/noqeri.ps1 | iex

Both installers fetch EMN90909/Noqeri and install the selected branch under NOQERI_HOME (default ~/.noqeri/src/current). Set NOQERI_REF to install a different branch. GET /source/noqeri returns machine-readable source/install metadata.

## Local development

    npm install
    npm run test:client
    npm run test:website
    npm run test:go
    npm run build
    npm run smoke

## Go API

The API is implemented in backend/main.go. It serves /api/health, /api/meta, and /api/db-demo. The demo endpoint persists its state atomically beneath GO_API_DATA_ROOT (default ./data). In Docker, the Node transport host starts the compiled Go API and proxies those routes. Local Node-only development uses a lightweight in-process fallback unless GO_API_BIN points to a compiled API binary.

Docker runs Go unit tests, builds a static Go API binary, then builds the React site with Vite. No Noqeri compiler clone, C++ toolchain, .nqr API source, or noqeri web command is needed to build the website. Browser capability helpers remain as checked-in JavaScript bootstrap artifacts, so the frontend build is independent of the language compiler.

Automatic GitHub Actions CI is intentionally disabled/removed so repository pushes do not consume Actions minutes. Build and smoke-test locally before pushing.

## License

GNU GPL v3 only (GPL-3.0-only). See LICENSE.

Made by Noethric.
