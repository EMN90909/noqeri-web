import test from 'node:test'
import assert from 'node:assert/strict'
import { createHash } from 'node:crypto'
import { packageArchive, registryIndex, registryBaseUrl, RegistryError } from '../runtime/registry-download.mjs'

test('Registry API URL must be HTTPS, except for local development', () => {
  assert.throws(() => registryBaseUrl({}), /NOQERI_REGISTRY_API_URL/)
  assert.throws(() => registryBaseUrl({ NOQERI_REGISTRY_API_URL: 'http://evil.test' }), /HTTPS/)
  assert.equal(registryBaseUrl({ NOQERI_REGISTRY_API_URL: 'http://localhost:7070/' }), 'http://localhost:7070')
})

test('Web requests only Registry HTTP API, verifies archive SHA-256 and excludes yanked releases', async () => {
  const previousFetch = globalThis.fetch
  const previousBase = process.env.NOQERI_REGISTRY_API_URL
  const archive = Buffer.from('nqpkg-test-archive')
  const archiveIntegrity = 'sha256:' + createHash('sha256').update(archive).digest('hex')
  const seen = []
  process.env.NOQERI_REGISTRY_API_URL = 'https://registry.example.test'
  globalThis.fetch = async url => {
    const path = new URL(url).pathname
    seen.push(path)
    if (path === '/v1/index') return new Response(JSON.stringify({ packages: [{ namespace: 'noqeri', name: 'test' }] }))
    if (path === '/v1/packages/noqeri/test/1.0.0') return new Response(JSON.stringify({ version: '1.0.0', yanked: false, archiveIntegrity }))
    if (path === '/v1/packages/noqeri/test/1.0.0/download') return new Response(archive)
    if (path === '/v1/packages/noqeri/test/2.0.0') return new Response(JSON.stringify({ version: '2.0.0', yanked: true, archiveIntegrity }))
    return new Response(null, { status: 404 })
  }
  try {
    assert.equal((await registryIndex()).packages[0].name, 'test')
    assert.deepEqual(await packageArchive('noqeri', 'test', '1.0.0'), archive)
    await assert.rejects(packageArchive('noqeri', 'test', '2.0.0'), error => error instanceof RegistryError && error.status === 404)
    await assert.rejects(packageArchive('..', 'test', '1.0.0'), error => error instanceof RegistryError && error.status === 400)
    assert.deepEqual(seen, ['/v1/index', '/v1/packages/noqeri/test/1.0.0', '/v1/packages/noqeri/test/1.0.0/download', '/v1/packages/noqeri/test/2.0.0'])
    globalThis.fetch = async url => new URL(url).pathname.endsWith('/download')
      ? new Response(Buffer.from('tampered')) : new Response(JSON.stringify({ version: '1.0.0', yanked: false, archiveIntegrity }))
    await assert.rejects(packageArchive('noqeri', 'test', '1.0.0'), /integrity mismatch/)
  } finally {
    globalThis.fetch = previousFetch
    if (previousBase === undefined) delete process.env.NOQERI_REGISTRY_API_URL
    else process.env.NOQERI_REGISTRY_API_URL = previousBase
  }
})
