import test from 'node:test'
import assert from 'node:assert/strict'
import { gunzipSync } from 'node:zlib'
import { packageArchive, RegistryError } from '../runtime/registry-download.mjs'

test('download archive contains the real registry manifest and entry; yanked releases fail',async()=>{
  const original=globalThis.fetch
  const base='packages/noqeri/package-test/0.4.0'
  const manifest=Buffer.from('package {\n  entry: "src/main.nqr"\n}\n')
  const source=Buffer.from('export function ready(): bool { return true }\n')
  const index={packages:[{namespace:'noqeri',name:'package-test',versions:[
    {version:'1.0.0',yanked:true,path:'packages/noqeri/package-test/1.0.0'},
    {version:'0.4.0',yanked:false,path:base}
  ]}]}
  const files=[
    {type:'file',path:base+'/package.nqr',download_url:'https://raw.githubusercontent.com/EMN90909/noqeri-registry/main/'+base+'/package.nqr'},
    {type:'file',path:base+'/src/main.nqr',download_url:'https://raw.githubusercontent.com/EMN90909/noqeri-registry/main/'+base+'/src/main.nqr'}
  ]
  globalThis.fetch=async url=>{
    const u=String(url)
    if(u.endsWith('/registry/index.json'))return new Response(JSON.stringify(index))
    if(u.includes('/contents/'+base+'?ref=main'))return new Response(JSON.stringify(files))
    if(u.endsWith(base+'/package.nqr'))return new Response(manifest)
    if(u.endsWith(base+'/src/main.nqr'))return new Response(source)
    throw new Error('unexpected registry request: '+u)
  }
  try{
    const archive=await packageArchive('noqeri','package-test','0.4.0')
    const bytes=gunzipSync(archive)
    assert.equal(bytes.toString('utf8',0,100).replace(/\0.*$/s,''),'package.nqr')
    assert.ok(bytes.includes(manifest))
    assert.ok(bytes.includes(source))
    await assert.rejects(packageArchive('noqeri','package-test','1.0.0'),e=>e instanceof RegistryError&&e.status===404)
    await assert.rejects(packageArchive('..','package-test','0.4.0'),e=>e instanceof RegistryError&&e.status===400)
  }finally{globalThis.fetch=original}
})
