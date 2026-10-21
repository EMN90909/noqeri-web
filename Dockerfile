# The Noqeri compiler's current self-host bootstrap is not a CMake build.
# This site deliberately ships reviewed, checked-in .mjs transport modules until
# the native Stage-2 web generator is release-qualified.
FROM node:22-alpine AS build
WORKDIR /app
COPY package.json ./
RUN npm install --no-audit --no-fund
COPY . .
RUN node --check backend/api.generated.mjs && node --check src/noqeri/client.generated.mjs && npm run build

FROM node:22-alpine
ENV NODE_ENV=production PORT=8080
WORKDIR /app
COPY --from=build /app/dist ./dist
COPY --from=build /app/backend ./backend
COPY --from=build /app/runtime ./runtime
COPY --from=build /app/server.mjs ./server.mjs
RUN mkdir -p /app/data && chown -R node:node /app
USER node
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=5s --start-period=20s --retries=3 CMD wget -qO- http://127.0.0.1:8080/api/health || exit 1
CMD ["node", "server.mjs"]
