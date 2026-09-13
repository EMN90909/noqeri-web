#!/usr/bin/env node
import { createHash } from 'node:crypto'
import { existsSync, readdirSync, readFileSync, rmSync, statSync } from 'node:fs'
import { join, relative, resolve } from 'node:path'
import { spawnSync } from 'node:child_process'

const npm = process.platform === 'win32' ? 'npm.cmd' : 'npm'
function build() {
  rmSync(resolve('dist'), { recursive: true, force: true })
  const r = spawnSync(npm, ['run', 'build'], { stdio: 'inherit', env: { ...process.env, TZ: 'UTC', SOURCE_DATE_EPOCH: process.env.SOURCE_DATE_EPOCH || '1704067200' } })
  if (r.error || r.status !== 0) throw new Error('npm run build failed')
}
function files(dir) {
  const out = []
  for (const name of readdirSync(dir).sort()) {
    const path = join(dir, name)
    if (statSync(path).isDirectory()) out.push(...files(path))
    else out.push(path)
  }
  return out
}
function snapshot() {
  const root = resolve('dist')
  if (!existsSync(root)) throw new Error('dist missing after build')
  return Object.fromEntries(files(root).map(path => [relative(root, path).replaceAll('\\', '/'), createHash('sha256').update(readFileSync(path)).digest('hex')]))
}
try {
  build(); const a = snapshot()
  build(); const b = snapshot()
  const names = [...new Set([...Object.keys(a), ...Object.keys(b)])].sort()
  const changed = names.filter(name => a[name] !== b[name]).map(name => ({ file: name, first: a[name] || null, second: b[name] || null }))
  console.log(JSON.stringify({ files: names.length, byte_reproducible: changed.length === 0, changed }, null, 2))
  process.exit(changed.length ? 1 : 0)
} catch (error) {
  console.error(`reproducible-build: ${error.message}`)
  process.exit(2)
}
