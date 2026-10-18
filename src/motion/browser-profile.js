// Browser capabilities belong to the host, not to a checked-in generated Noqeri module.
// Keep this module dependency-free so it also works while compiler bootstrap is unavailable.
export function clientReducedMotion() {
  return typeof window !== 'undefined' && Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches)
}
export function clientFinePointer() {
  return typeof window !== 'undefined' && Boolean(window.matchMedia?.('(hover: hover) and (pointer: fine)')?.matches)
}
export function clientMotionProfile() {
  const reduced = clientReducedMotion()
  const finePointer = clientFinePointer()
  const saveData = typeof navigator !== 'undefined' && Boolean(navigator.connection?.saveData)
  return JSON.stringify({ reduced: reduced || saveData, finePointer, saveData })
}
