# Noqeri Web

Official public website, documentation interface and reference hosted runtime for Noqeri 1.0.

The site is React 18 + Vite 5 with a small Node transport host. CI builds the real Noqeri compiler, regenerates backend/browser `.nqo` artifacts from `.nqr`, builds the site, runs end-to-end smoke checks and builds the production Docker image.

## What the repository proves

- Noqeri-authored `.nqr` can compile to `.nqo` browser/server modules.
- The server can call exported Noqeri functions for API decisions while Node owns HTTP transport/static files.
- A hosted API can invoke the actual NoqeriDB `.nqd`/`.nqdb` engine.
- Registry metadata and deterministic `.nqpkg` archives can be served through the website.
- `/docs/*` deep links use SPA fallback.
- security headers, path containment and bounded host capabilities are tested by smoke checks.

This is a reference host architecture, not a claim that Noqeri itself contains a native TCP/TLS/HTTP stack today.

## Interaction system

The site keeps the paper/ink/electric-blue editorial identity and uses `motion` as its only added animation dependency. Motion is concentrated in route continuity, Home hero choreography, docs reading progress/reveals, shared component feedback and package catalogue transitions. GSAP, Lenis and Three.js are deliberately not loaded because the current interactions do not require their runtime cost.

`prefers-reduced-motion`, coarse pointers, keyboard focus and touch remain supported.

## Local development

```sh
npm install
npm run dev
```

To reproduce CI's Noqeri-generated objects locally, build `EMN90909/Noqeri` first and run:

```sh
noqeri web backend/api.nqr backend/api.generated.nqo
noqeri web src/noqeri/client.nqr src/noqeri/client.generated.nqo
npm run build
npm run smoke
```

## Production

```sh
npm run build
docker build -t noqeri-web .
docker run --rm -p 8080:8080 noqeri-web
```

The production image contains the Vite build, generated `.nqo` backend module, Node transport host and Noqeri CLI used for the reference database capability.

## License

GNU GPL v3 only (`GPL-3.0-only`). See `LICENSE`.

Made by [Noethric](https://noethric.xyz).
