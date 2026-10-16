FROM --platform=$BUILDPLATFORM golang:1.27-alpine AS go-api-build
WORKDIR /src
COPY backend/go.mod backend/main.go backend/main_test.go ./
RUN go test ./...
ARG TARGETOS
ARG TARGETARCH
RUN mkdir -p /out && CGO_ENABLED=0 GOOS=$TARGETOS GOARCH=$TARGETARCH go build -trimpath -ldflags="-s -w" -o /out/noqeri-api .

FROM node:22-alpine AS build
WORKDIR /app
COPY package.json ./
RUN npm install --no-audit --no-fund
COPY . .
RUN npm run build

FROM node:22-alpine AS runtime
ENV NODE_ENV=production PORT=8080 GO_API_BIN=/usr/local/bin/noqeri-api GO_API_ADDR=127.0.0.1:8081
WORKDIR /app
COPY --from=go-api-build /out/noqeri-api /usr/local/bin/noqeri-api
COPY --from=build /app/dist ./dist
COPY --from=build /app/runtime ./runtime
COPY --from=build /app/server.mjs ./server.mjs
RUN mkdir -p /app/data && chown -R node:node /app/data
USER node
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=4s --start-period=8s --retries=3 CMD wget -qO- http://127.0.0.1:8080/api/health || exit 1
CMD ["node","server.mjs"]
