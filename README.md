# Noqeri Web

Official public website for the Noqeri language and ecosystem.

Canonical domain: `https://noqeri.noethric.xyz`

## Local development

```sh
npm install
npm run dev
```

## Production

```sh
npm run build
docker build -t noqeri-web .
docker run --rm -p 8080:8080 noqeri-web
```

The production container serves the Vite build through nginx with SPA routing.
