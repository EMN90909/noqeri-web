import { createServer } from 'node:http'
import { mkdtemp, mkdir, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { createStaticFileHandler, safeStaticPath } from '../runtime/static-files.mjs'

function require(ok, message) { if (!ok) throw new Error(message) }
const root = await mkdtemp(join(tmpdir(), 'noqeri-static-'))
try {
  await mkdir(join(root, 'assets'), { recursive: true })
  await writeFile(join(root, 'index.html'), '<div id="root"></div>')
  await writeFile(join(root, 'assets', 'app.js'), 'console.log("noqeri");'.repeat(100))

  let escaped = false
  try { safeStaticPath(root, '/%2e%2e/secret.txt') } catch { escaped = true }
  require(escaped, 'encoded path traversal was accepted')

  const handler = createStaticFileHandler({ root, security: { 'X-Test-Security':'yes' }, maxEntries: 4 })
  const server = createServer((req, res) => handler(req, res, new URL(req.url, 'http://localhost').pathname))
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve))
  const port = server.address().port
  try {
    const first = await fetch(`http://127.0.0.1:${port}/assets/app.js`, { headers: { 'Accept-Encoding':'gzip' } })
    require(first.status === 200, 'static asset failed')
    require(first.headers.get('etag'), 'ETag missing')
    require(first.headers.get('cache-control')?.includes('immutable'), 'fingerprinted asset policy missing')
    require(first.headers.get('x-test-security') === 'yes', 'security headers missing')
    const etag = first.headers.get('etag')
    await first.text()

    const cached = await fetch(`http://127.0.0.1:${port}/assets/app.js`, { headers: { 'If-None-Match':etag } })
    require(cached.status === 304, 'conditional request did not return 304')

    const missingAsset = await fetch(`http://127.0.0.1:${port}/missing.js`)
    require(missingAsset.status === 404, 'missing asset incorrectly fell back to SPA')

    const route = await fetch(`http://127.0.0.1:${port}/docs/http-server`)
    require(route.status === 200 && (await route.text()).includes('id="root"'), 'SPA navigation fallback failed')
    console.log('Noqeri web static-file tests passed')
  } finally {
    await new Promise(resolve => server.close(resolve))
  }
} finally {
  await rm(root, { recursive: true, force: true })
}
