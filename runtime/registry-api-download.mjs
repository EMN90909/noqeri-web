import { createHash } from 'node:crypto'

const MAX_INDEX_BYTES = 2 * 1024 * 1024
const MAX_ARCHIVE_BYTES = 16 * 1024 * 1024
const IDENT = /^[a-z0-9][a-z0-9-]*$/
const VERSION = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/
const SHA = /^sha256:[0-9a-f]{64}$/

export class RegistryError extends Error {
  constructor(message, status = 502) {
    super(message)
    this.name = 'RegistryError'
    this.status = status
  }
}

export function registryBaseUrl(env = process.env) {
  const value = env.NOQERI_REGISTRY_API_URL
  if (!value) throw new RegistryError('NOQERI_REGISTRY_API_URL must point to the deployed Registry API', 503)
  let url
  try { url = new URL(value) } catch { throw new RegistryError('invalid Registry API URL', 503) }
  if (url.username || url.password || url.search || url.hash || (url.protocol !== 'https:' && !(url.protocol === 'http:' && ['localhost', '127.0.0.1', '[::1]'].includes(url.hostname)))) {
    throw new RegistryError('Registry API requires HTTPS (except localhost) and no URL credentials', 503)
  }
  return url.href.replace(/\/$/, '')
}

async function request(path, limit, fetchImpl = globalThis.fetch) {
  const response = await fetchImpl(registryBaseUrl() + path, {
    headers: { Accept: path.endsWith('/download') ? 'application/vnd.noqeri.package+gzip' : 'application/json' },
    redirect: 'error', signal: AbortSignal.timeout(10000)
  })
  if (!response.ok) throw new RegistryError('registry service returned ' + response.status, response.status === 404 ? 404 : 502)
  const declared = Number(response.headers.get('content-length') || 0)
  if (!Number.isFinite(declared) || declared < 0 || declared > limit) throw new RegistryError('registry response exceeds size limit', 502)
  const bytes = Buffer.from(await response.arrayBuffer())
  if (bytes.length > limit) throw new RegistryError('registry response exceeds size limit', 502)
  return { bytes, headers: response.headers }
}

export async function registryIndex() {
  const { bytes } = await request('/v1/index', MAX_INDEX_BYTES)
  let result
  try { result = JSON.parse(bytes.toString('utf8')) } catch { throw new RegistryError('invalid registry JSON') }
  if (!result || !Array.isArray(result.packages)) throw new RegistryError('invalid Registry API index')
  return result
}

export async function packageArchive(namespace, name, version) {
  if (![namespace, name].every(v => IDENT.test(v)) || !VERSION.test(version)) throw new RegistryError('invalid package identity', 400)
  const path = '/v1/packages/' + encodeURIComponent(namespace) + '/' + encodeURIComponent(name) + '/' + encodeURIComponent(version)
  const metadata = await request(path, MAX_INDEX_BYTES)
  let release
  try { release = JSON.parse(metadata.bytes.toString('utf8')) } catch { throw new RegistryError('invalid release metadata') }
  if (release.yanked) throw new RegistryError('release withdrawn from public downloads', 404)
  if (release.version !== version || !SHA.test(release.archiveIntegrity || '')) throw new RegistryError('missing or invalid archive integrity metadata')
  const { bytes } = await request(path + '/download', MAX_ARCHIVE_BYTES)
  const actual = 'sha256:' + createHash('sha256').update(bytes).digest('hex')
  if (actual !== release.archiveIntegrity) throw new RegistryError('registry archive integrity mismatch')
  return bytes
}
