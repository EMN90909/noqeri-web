// Shared, side-effect-free release selection for the public registry UI.
const versionPattern = /^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/
const partPattern = /^[a-z0-9][a-z0-9-]*$/

function parseVersion(version) {
  if (!versionPattern.test(version)) return null
  const match = /^(\d+\.\d+\.\d+)(?:-([0-9A-Za-z.-]+))?(?:\+[0-9A-Za-z.-]+)?$/.exec(version)
  return { components: match[1].split('.').map(BigInt), prerelease: match[2]?.split('.') || [] }
}
export function compareVersions(a, b) {
  const left = parseVersion(a), right = parseVersion(b)
  if (!left || !right) throw new Error('invalid package version')
  for (let i = 0; i < 3; i++) {
    if (left.components[i] !== right.components[i]) return left.components[i] > right.components[i] ? 1 : -1
  }
  const l = left.prerelease, r = right.prerelease
  if (l.length === 0 || r.length === 0) return l.length === r.length ? 0 : l.length === 0 ? 1 : -1
  for (let i = 0; i < Math.max(l.length, r.length); i++) {
    if (i >= l.length) return -1
    if (i >= r.length) return 1
    const ln = /^\d+$/.test(l[i]), rn = /^\d+$/.test(r[i])
    if (ln && rn) {
      const x = BigInt(l[i]), y = BigInt(r[i])
      if (x !== y) return x > y ? 1 : -1
    } else if (ln !== rn) return ln ? -1 : 1
    else if (l[i] !== r[i]) return l[i] > r[i] ? 1 : -1
  }
  return 0
}
export function selectRelease(pkg) {
  if (!pkg || !Array.isArray(pkg.versions)) return null
  return pkg.versions.filter(v => v && !v.yanked && typeof v.version === 'string' && versionPattern.test(v.version) && typeof v.path === 'string')
    .sort((a, b) => compareVersions(b.version, a.version))[0] || null
}
export function downloadPath(pkg, release) {
  if (!partPattern.test(pkg?.namespace || '') || !partPattern.test(pkg?.name || '') || !release || !versionPattern.test(release.version)) throw new Error('invalid package coordinate')
  return `/registry/${pkg.namespace}/${pkg.name}/${release.version}/download.nqpkg`
}
