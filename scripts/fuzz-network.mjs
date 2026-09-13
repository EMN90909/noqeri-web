#!/usr/bin/env node
import { existsSync } from 'node:fs'
import { spawn } from 'node:child_process'
import { createConnection } from 'node:net'
import { resolve } from 'node:path'

if (!existsSync(resolve('dist', 'index.html'))) {
  console.error('fuzz-network: dist/index.html is missing; run npm run build first')
  process.exit(2)
}
const port = Number(process.env.NOQERI_FUZZ_PORT || (18000 + (process.pid % 1000)))
const base = `http://127.0.0.1:${port}`
const child = spawn(process.execPath, ['server.mjs'], { env: { ...process.env, PORT: String(port) }, stdio: ['ignore', 'pipe', 'pipe'] })
let stderr = ''
child.stderr.on('data', chunk => { stderr += String(chunk) })

const sleep = ms => new Promise(r => setTimeout(r, ms))
async function ready() {
  for (let i = 0; i < 50; i++) {
    if (child.exitCode !== null) return false
    try { const r = await fetch(base + '/', { signal: AbortSignal.timeout(300) }); if (r.status > 0) return true } catch {}
    await sleep(50)
  }
  return false
}
async function request(path, headers = {}) {
  try { await fetch(base + path, { headers, redirect: 'manual', signal: AbortSignal.timeout(1000) }) } catch {}
  if (child.exitCode !== null) throw new Error(`server exited while handling ${JSON.stringify(path)} code=${child.exitCode}`)
}
function raw(payload) {
  return new Promise(resolvePromise => {
    const socket = createConnection({ host: '127.0.0.1', port })
    const done = () => { socket.destroy(); resolvePromise() }
    socket.setTimeout(700, done)
    socket.on('error', done)
    socket.on('data', () => {})
    socket.on('close', resolvePromise)
    socket.on('connect', () => { socket.write(payload); setTimeout(done, 80) })
  })
}

try {
  if (!await ready()) throw new Error(`server did not become ready; ${stderr.slice(-1000)}`)
  const paths = [
    '/', '/%', '/%ZZ', '/%00', '/..', '/%2e%2e/', '/%2e%2e%2fpackage.json',
    '/' + 'a'.repeat(4096), '/registry/../index.json', '/registry/%2e%2e/index.json',
    '/get/noqeri?ref=' + encodeURIComponent('../'.repeat(100)), '/source/noqeri?ref=' + encodeURIComponent('\u0000')
  ]
  for (const path of paths) await request(path)
  await request('/', { 'x-forwarded-proto': 'https,http', 'x-fuzz': 'x'.repeat(2048) })

  const rawCases = [
    'GET /% HTTP/1.1\r\nHost: localhost\r\nConnection: close\r\n\r\n',
    'GET / HTTP/1.1\r\nHost: localhost\r\nX-Fuzz: ' + 'x'.repeat(20000) + '\r\n\r\n',
    'BREW / HTTP/1.1\r\nHost: localhost\r\nConnection: close\r\n\r\n',
    'GET / HTTP/1.1\r\nHost: localhost\r\nBad Header\r\n\r\n'
  ]
  for (const payload of rawCases) {
    await raw(payload)
    if (child.exitCode !== null) throw new Error(`server exited during raw HTTP fuzz code=${child.exitCode}`)
  }
  console.log(JSON.stringify({ result: 'ok', http_cases: paths.length + 1, raw_cases: rawCases.length, port }))
} catch (error) {
  console.error(`fuzz-network: ${error.message}`)
  if (stderr) console.error(stderr.slice(-2000))
  process.exitCode = 1
} finally {
  child.kill('SIGTERM')
  await sleep(80)
  if (child.exitCode === null) child.kill('SIGKILL')
}
