import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root=join(dirname(fileURLToPath(import.meta.url)),'..')
const source=await readFile(join(root,'src/noqeri/client.nqr'),'utf8')
const generated=await readFile(join(root,'src/noqeri/client.generated.nqo'),'utf8')
const exports=[
  'clientVersion',
  'writeNoqeriBadge',
  'clientReducedMotion',
  'clientFinePointer',
  'clientViewportWidth',
  'clientViewportHeight',
  'clientScrollY',
  'clientMotionNow',
  'clientMotionProfile'
]

assert.match(source,/clientVersion\(\): string \{ return "1\.4" \}/)
assert.match(source,/domText\("\[data-noqeri-client\]", "Noqeri 1\.4"\)/)
assert.match(generated,/export function clientVersion\(\)\s*\{\s*return\s+['\"]1\.4['\"]\s*;?\s*\}/)
for(const name of exports){
  assert.match(source,new RegExp('export function '+name+'\\('),'Noqeri source is missing '+name)
  assert.match(generated,new RegExp('export function '+name+'\\('),'Generated browser artifact is missing '+name)
}

const originalWindow=globalThis.window
const originalDocument=globalThis.document
const node={textContent:''}
globalThis.window={
  innerWidth:1280,
  innerHeight:720,
  scrollY:42,
  matchMedia(query){return {matches:query.includes('pointer: fine')}}
}
globalThis.document={querySelector(selector){return selector==='[data-noqeri-client]'?node:null}}

try{
  const encoded=Buffer.from(generated).toString('base64')
  const client=await import('data:text/javascript;base64,'+encoded)
  assert.equal(client.clientVersion(),'1.4')
  assert.equal(client.clientReducedMotion(),false)
  assert.equal(client.clientFinePointer(),true)
  assert.equal(client.clientViewportWidth(),1280)
  assert.equal(client.clientViewportHeight(),720)
  assert.equal(client.clientScrollY(),42)
  assert.ok(Number.isFinite(client.clientMotionNow()))
  const profile=JSON.parse(client.clientMotionProfile())
  assert.equal(profile.reducedMotion,false)
  assert.equal(profile.finePointer,true)
  assert.equal(profile.viewportWidth,1280)
  assert.equal(profile.viewportHeight,720)
  assert.equal(profile.scrollY,42)
  assert.ok(Number.isFinite(profile.now))
  assert.equal(client.writeNoqeriBadge(),true)
  assert.equal(node.textContent,'Noqeri 1.4')
  console.log('Generated Noqeri client exports and host adapters are consistent.')
}finally{
  if(originalWindow===undefined)delete globalThis.window
  else globalThis.window=originalWindow
  if(originalDocument===undefined)delete globalThis.document
  else globalThis.document=originalDocument
}
