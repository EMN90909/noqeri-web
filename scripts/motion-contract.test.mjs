import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'

const read = path => readFileSync(new URL(path, import.meta.url), 'utf8')
const app = read('../src/App.jsx')
const runtime = read('../src/motion/InteractionRuntime.jsx')
const motionCss = read('../src/motion.css')
const runtimeCss = read('../src/runtime-motion.css')

assert.doesNotMatch(app, /AnimatePresence|SlashTransition/)
assert.match(app, /key=\{l\.pathname\}/)
assert.match(app, /tokens\.duration\.base/)
assert.match(app, /cancelAnimationFrame\(frame\)/)
assert.doesNotMatch(runtime, /routeWipe|heroEntrance|pageEntrance/)
assert.match(runtime, /function animateElement\(el,keyframes,options,bag,persist=false\)/)
assert.match(runtime, /cancelAnimationFrame\(setupFrame\)/)
assert.match(runtime, /cancelAnimationFrame\(scrollFrame\)/)
assert.match(runtime, /pageSpecificAnimations\(reduced,animations\)/)
assert.match(motionCss, /prefers-reduced-motion:reduce/)
assert.match(motionCss, /\.premium-route\{/)
assert.doesNotMatch(runtimeCss, /nq-native-route-wipe/)

console.log('motion contract tests passed')
