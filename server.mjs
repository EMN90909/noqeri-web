import { createServer } from 'node:http'
import { existsSync, mkdirSync } from 'node:fs'
import { readFile, mkdir, writeFile, rename } from 'node:fs/promises'
import { spawn } from 'node:child_process'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { registryIndex, packageArchive } from './runtime/registry-download.mjs'
import { shellInstaller, powershellInstaller, sourceInfo } from './runtime/source-install.mjs'
import { registryAdvisories, packageQuality, compatibilityPolicy, compatibilityResults, qualityEvidence } from './runtime/quality-evidence.mjs'
import { createStaticFileHandler } from './runtime/static-files.mjs'

const base = fileURLToPath(new URL('.', import.meta.url))
const root = join(base, 'dist')
const dataRoot = join(base, 'data')
const port = Number(process.env.PORT || 8080)
const goApiBin = process.env.GO_API_BIN || '/usr/local/bin/noqeri-api'
const goApiAddr = process.env.GO_API_ADDR || '127.0.0.1:8081'
const goApiOrigin = 'http://' + goApiAddr
mkdirSync(dataRoot, { recursive: true })

const security = {
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  'Cross-Origin-Opener-Policy': 'same-origin',
  'Cross-Origin-Resource-Policy': 'same-origin',
  'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self' https://fonts.googleapis.com 'unsafe-inline'; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'"
}
function send(req, res, status, headers, body) {
  res.writeHead(status, { ...security, ...headers })
  res.end(req.method === 'HEAD' || status === 304 ? undefined : body)
}
function json(req, res, status, value) {
  send(req, res, status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }, JSON.stringify(value))
}
const staticFile = createStaticFileHandler({ root, security, maxEntries: 128 })

async function localDatabaseDemo() {
  await mkdir(dataRoot, { recursive: true })
  const path = join(dataRoot, 'site-demo.json')
  let state = {}
  try {
    state = JSON.parse(await readFile(path, 'utf8'))
  } catch (error) {
    if (error.code !== 'ENOENT') throw error
  }
  state.status = 'ok'
  const temp = path + '.' + process.pid + '.tmp'
  await writeFile(temp, JSON.stringify(state) + '\n', { encoding: 'utf8', mode: 0o600 })
  await rename(temp, path)
  return 'key\tvalue\nstatus\t' + String(state.status).replace(/[\r\n]/g, '') + '\n'
}

function localAPI(req, res, path) {
  if (path === '/api/health') return json(req, res, 200, { status: 'ok', language: '1.4', source: 'Noqeri' })
  if (path === '/api/meta') return json(req, res, 200, { language: '1.4', edition: '2026', backend: 'Go', compiler: 'Go API (local fallback)' })
  if (path === '/api/db-demo') {
    return localDatabaseDemo().then(body => send(req, res, 200, { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'no-store' }, body))
  }
  return json(req, res, 404, { error: 'not_found' })
}

let goApiProcess = null
let shuttingDown = false

async function waitForGoAPI(child) {
  for (let attempt = 0; attempt < 60; attempt++) {
    if (child.exitCode !== null) throw new Error('Go API exited before it became ready (code ' + child.exitCode + ')')
    try {
      const response = await fetch(goApiOrigin + '/api/health', { signal: AbortSignal.timeout(250) })
      if (response.ok) return
    } catch {}
    await new Promise(resolve => setTimeout(resolve, 100))
  }
  child.kill('SIGTERM')
  throw new Error('Go API did not become ready at ' + goApiAddr)
}

if (existsSync(goApiBin)) {
  goApiProcess = spawn(goApiBin, [], {
    env: { ...process.env, GO_API_ADDR: goApiAddr, GO_API_DATA_ROOT: dataRoot },
    stdio: 'inherit'
  })
  goApiProcess.on('error', error => console.error('Go API process error:', error))
  await waitForGoAPI(goApiProcess)
}

const server = createServer(async (req, res) => {
  const method = req.method || 'GET'
  if (method !== 'GET' && method !== 'HEAD') return json(req, res, 405, { error: 'method_not_allowed' })
  let url
  try {
    url = new URL(req.url || '/', 'http://' + (req.headers.host || 'localhost'))
  } catch {
    return json(req, res, 400, { error: 'bad_url' })
  }
  const forwarded = (req.headers['x-forwarded-proto'] || '').split(',')[0].trim()
  const protocol = forwarded === 'https' ? 'https' : 'http'
  const origin = protocol + '://' + (req.headers.host || 'localhost')
  try {
    if (url.pathname === '/get/noqeri') return send(req, res, 200, { 'Content-Type': 'text/x-shellscript; charset=utf-8', 'Cache-Control': 'public, max-age=300' }, shellInstaller(origin, url.searchParams.get('ref') || 'main'))
    if (url.pathname === '/get/noqeri.ps1') return send(req, res, 200, { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=300' }, powershellInstaller(origin, url.searchParams.get('ref') || 'main'))
    if (url.pathname === '/source/noqeri') return json(req, res, 200, sourceInfo(origin, url.searchParams.get('ref') || 'main'))
    if (url.pathname === '/registry/index.json') return json(req, res, 200, await registryIndex())
    if (url.pathname === '/registry/advisories/index.json') return json(req, res, 200, await registryAdvisories())
    if (url.pathname === '/registry/quality.json') return json(req, res, 200, await packageQuality())
    if (url.pathname === '/registry/compatibility/releases.json') return json(req, res, 200, await compatibilityPolicy())
    if (url.pathname === '/registry/compatibility/results.json') {
      const results = await compatibilityResults()
      return results ? json(req, res, 200, results) : json(req, res, 404, { schema: 1, status: 'not_published', message: 'No executed compatibility result bundle is published yet.' })
    }
    if (url.pathname === '/quality/evidence.json') return json(req, res, 200, await qualityEvidence())
    const pkg = url.pathname.match(/^\/registry\/([a-z0-9-]+)\/([a-z0-9-]+)\/([0-9][a-z0-9.-]*)\/download\.nqpkg$/i)
    if (pkg) {
      const archive = await packageArchive(pkg[1], pkg[2], pkg[3])
      return send(req, res, 200, {
        'Content-Type': 'application/vnd.noqeri.package+gzip',
        'Content-Disposition': 'attachment; filename="' + pkg[1] + '-' + pkg[2] + '-' + pkg[3] + '.nqpkg"',
        'Cache-Control': 'public, max-age=300'
      }, archive)
    }
    if (url.pathname === '/api/health' || url.pathname === '/api/meta' || url.pathname === '/api/db-demo') {
      if (!goApiProcess) return await localAPI(req, res, url.pathname)
      const upstream = await fetch(goApiOrigin + url.pathname, { method, signal: AbortSignal.timeout(3000) })
      const body = method === 'HEAD' ? '' : await upstream.text()
      return send(req, res, upstream.status, {
        'Content-Type': upstream.headers.get('content-type') || 'application/json; charset=utf-8',
        'Cache-Control': 'no-store'
      }, body)
    }
    return await staticFile(req, res, url.pathname)
  } catch (error) {
    console.error(error)
    return json(req, res, 502, { error: 'upstream_or_internal_error' })
  }
})

server.requestTimeout = 10_000
server.headersTimeout = 12_000
server.keepAliveTimeout = 5_000
server.maxHeadersCount = 80
server.listen(port, '0.0.0.0', () => console.log('noqeri web listening on ' + port))

function shutdown(signal) {
  if (shuttingDown) return
  shuttingDown = true
  server.close(() => {
    if (goApiProcess && goApiProcess.exitCode === null) goApiProcess.kill(signal)
    process.exit(0)
  })
  setTimeout(() => {
    if (goApiProcess && goApiProcess.exitCode === null) goApiProcess.kill('SIGKILL')
    process.exit(1)
  }, 3000).unref()
}
process.on('SIGTERM', () => shutdown('SIGTERM'))
process.on('SIGINT', () => shutdown('SIGINT'))
