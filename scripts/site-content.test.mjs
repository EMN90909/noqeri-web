import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const read = path => readFile(join(root, path), 'utf8')
const [app, language, about, playground, packageText, dockerfile, goSource] = await Promise.all([
  read('src/App.jsx'),
  read('src/pages/Language.jsx'),
  read('src/pages/About.jsx'),
  read('src/pages/Playground.jsx'),
  read('package.json'),
  read('Dockerfile'),
  read('backend/main.go')
])
const packageJson = JSON.parse(packageText)

assert.match(app, /const Docs = lazy\(\(\) => import\('\.\/pages\/Docs\.jsx'\)/)
assert.match(app, /<Suspense fallback=/)
assert.ok(app.includes("element.style.transform = 'translate3d(' + x + 'px, ' + y + 'px, 0)'"))
assert.match(language, /repeat 4/)
assert.match(language, /import package "noqeri\/base64"/)
assert.match(language, /syntax\/token check/)
assert.match(language, /does not promise full type-checking/)
assert.match(about, /Made by Emmanuel Nasong'o/)
assert.match(about, /teen developer inspired to make coding easier to learn/)
assert.match(about, /implementation parity and tooling/)
assert.match(playground, /noqeri\/base64/)
assert.match(playground, /These are lightweight declaration counts, not compiler results\./)
assert.match(packageJson.scripts.quality, /npm run test:website/)
assert.match(dockerfile, /golang:1\.27-alpine AS go-api-build/)
assert.doesNotMatch(dockerfile, /noqeri web|git clone .*Noqeri|FROM alpine:.* AS noqeri/i)
assert.match(dockerfile, /npm run build/)
assert.match(goSource, /case "\/api\/health"/)
assert.match(goSource, /case "\/api\/meta"/)
assert.match(goSource, /case "\/api\/db-demo"/)
console.log('Website content and compiler-free Go Docker build contracts passed.')
