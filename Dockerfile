FROM alpine:3.21 AS noqeri
RUN apk add --no-cache git cmake g++ make
WORKDIR /src
RUN git clone --depth 1 https://github.com/EMN90909/Noqeri.git . && cmake -S . -B build -DCMAKE_BUILD_TYPE=Release && cmake --build build -j2

FROM node:22-alpine AS build
WORKDIR /app
COPY --from=noqeri /src/build/noqeri /usr/local/bin/noqeri
COPY package.json ./
RUN npm install --no-audit --no-fund
COPY . .
RUN noqeri web backend/api.nqr backend/api.generated.nqo && noqeri web src/noqeri/client.nqr src/noqeri/client.generated.nqo && npm run build

FROM node:22-alpine AS runtime
ENV NODE_ENV=production PORT=8080 NOQERI_BIN=/usr/local/bin/noqeri
RUN apk add --no-cache libstdc++
WORKDIR /app
COPY --from=noqeri /src/build/noqeri /usr/local/bin/noqeri
COPY --from=build /app/dist ./dist
COPY --from=build /app/backend ./backend
COPY --from=build /app/runtime ./runtime
COPY --from=build /app/server.mjs ./server.mjs
RUN mkdir -p /app/data && chown -R node:node /app/data
USER node
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=4s --start-period=8s --retries=3 CMD wget -qO- http://127.0.0.1:8080/api/health || exit 1
CMD ["node","server.mjs"]
