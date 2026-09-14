import { readFile, stat } from 'node:fs/promises'
import { extname, join, normalize, resolve, relative, sep } from 'node:path'
import { gzipSync } from 'node:zlib'

const defaultTypes = {
  '.html':'text/html; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.mjs':'text/javascript; charset=utf-8',
  '.nqo':'text/javascript; charset=utf-8', '.css':'text/css; charset=utf-8', '.json':'application/json; charset=utf-8',
  '.svg':'image/svg+xml', '.png':'image/png', '.webp':'image/webp', '.ico':'image/x-icon', '.txt':'text/plain; charset=utf-8'
}

function safePath(root, urlPath) {
  let decoded
  try { decoded = decodeURIComponent(urlPath) } catch { throw new Error('bad path encoding') }
  if (decoded.includes('\0')) throw new Error('nul byte in path')
  const portable = decoded.replace(/\\/g, '/')
  if (portable.split('/').some(part => part === '..')) throw new Error('path escape')
  const clean = normalize(decoded).replace(/^[/\\]+/, '')
  const full = resolve(root, clean)
  const rel = relative(root, full)
  if (rel === '..' || rel.startsWith('..' + sep)) throw new Error('path escape')
  return full
}

function assetLike(urlPath) { return urlPath.startsWith('/assets/') || extname(urlPath) !== '' }

export function createStaticFileHandler({ root, security = {}, maxEntries = 128, types = defaultTypes } = {}) {
  if (!root) throw new Error('static root is required')
  const cache = new Map()

  function send(req, res, status, headers, body) {
    res.writeHead(status, { ...security, ...headers })
    res.end(req.method === 'HEAD' || status === 304 ? undefined : body)
  }

  function remember(path, entry) {
    if (cache.has(path)) cache.delete(path)
    cache.set(path, entry)
    while (cache.size > maxEntries) cache.delete(cache.keys().next().value)
    return entry
  }

  async function load(path) {
    const info = await stat(path)
    if (!info.isFile()) throw new Error('not file')
    const prior = cache.get(path)
    if (prior && prior.mtimeMs === info.mtimeMs && prior.size === info.size) {
      cache.delete(path)
      cache.set(path, prior)
      return prior
    }
    const data = await readFile(path)
    return remember(path, {
      mtimeMs: info.mtimeMs,
      size: info.size,
      data,
      gzip: null,
      etag: `W/"${info.size.toString(16)}-${Math.floor(info.mtimeMs).toString(16)}"`,
      type: types[extname(path)] || 'application/octet-stream',
      immutable: path.includes(`${sep}assets${sep}`)
    })
  }

  return async function staticFile(req, res, urlPath) {
    let path = safePath(root, urlPath)
    try {
      const info = await stat(path)
      if (info.isDirectory()) path = join(path, 'index.html')
    } catch {}

    try {
      const entry = await load(path)
      const cacheControl = entry.immutable ? 'public, max-age=31536000, immutable' : 'public, max-age=300'
      if (req.headers['if-none-match'] === entry.etag) {
        return send(req, res, 304, { 'ETag': entry.etag, 'Cache-Control': cacheControl }, undefined)
      }
      const headers = { 'Content-Type': entry.type, 'Cache-Control': cacheControl, 'ETag': entry.etag }
      const compressible = /^(text\/|application\/(javascript|json))/.test(entry.type) && entry.data.length > 1024
      if (compressible && (req.headers['accept-encoding'] || '').includes('gzip')) {
        if (!entry.gzip) entry.gzip = gzipSync(entry.data, { level: 6 })
        headers['Content-Encoding'] = 'gzip'
        headers['Vary'] = 'Accept-Encoding'
        return send(req, res, 200, headers, entry.gzip)
      }
      return send(req, res, 200, headers, entry.data)
    } catch {
      if (assetLike(urlPath)) {
        return send(req, res, 404, { 'Content-Type':'text/plain; charset=utf-8', 'Cache-Control':'no-store' }, 'Not found\n')
      }
      const index = await load(join(root, 'index.html'))
      return send(req, res, 200, { 'Content-Type':'text/html; charset=utf-8', 'Cache-Control':'no-cache', 'ETag': index.etag }, index.data)
    }
  }
}

export { safePath as safeStaticPath }
