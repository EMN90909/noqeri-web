import test from 'node:test'
import assert from 'node:assert/strict'
import {createHash} from 'node:crypto'
import {packageArchive,registryIndex,RegistryError,registryOrigin} from '../runtime/registry-download.mjs'

test('registry website uses ONLY /v1 API, verifies archive bytes and allows pinned yanked releases',async()=>{
 const original=globalThis.fetch,was=process.env.NOQERI_REGISTRY_URL
 process.env.NOQERI_REGISTRY_URL='https://registry.test'
 const archive=Buffer.from('compressed-package-content')
 const hash='sha256:'+createHash('sha256').update(archive).digest('hex')
 const index={protocol:'v1',packages:[{namespace:'noqeri',name:'new-test',versions:[
  {version:'0.4.0',yanked:true,integrity:hash},
  {version:'1.0.0',yanked:false,integrity:hash}
 ]}]}
 const paths=[]
 globalThis.fetch=async url=>{
  const u=String(url);paths.push(u)
  if(u==='https://registry.test/v1/index')return new Response(JSON.stringify(index))
  if(u==='https://registry.test/v1/packages/noqeri/new-test/0.4.0')return new Response(JSON.stringify({namespace:'noqeri',name:'new-test',version:'0.4.0',yanked:true,integrity:hash}))
  if(u==='https://registry.test/v1/packages/noqeri/new-test/0.4.0/download')return new Response(archive)
  throw Error('unexpected API request '+u)
 }
 try{
  assert.equal(registryOrigin(),'https://registry.test')
  assert.equal((await registryIndex()).protocol,'v1')
  assert.deepEqual(await packageArchive('noqeri','new-test','0.4.0'),archive)
  assert.equal(paths.length,3)
  assert.ok(paths.every(x=>x.startsWith('https://registry.test/v1/')))
  await assert.rejects(packageArchive('..','new-test','0.4.0'),e=>e instanceof RegistryError&&e.status===400)
 }finally{globalThis.fetch=original;if(was===undefined)delete process.env.NOQERI_REGISTRY_URL;else process.env.NOQERI_REGISTRY_URL=was}
})
test('remote HTTP registry URLs are refused',()=>{
 const old=process.env.NOQERI_REGISTRY_URL;process.env.NOQERI_REGISTRY_URL='http://untrusted.example'
 try{assert.throws(registryOrigin,/HTTPS/)}finally{if(old===undefined)delete process.env.NOQERI_REGISTRY_URL;else process.env.NOQERI_REGISTRY_URL=old}
})
