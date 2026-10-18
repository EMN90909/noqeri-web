import test from 'node:test'
import assert from 'node:assert/strict'
import {compareVersions, selectRelease, downloadPath} from '../src/packageCatalog.js'

test('select latest usable release rather than a withdrawn first version', () => {
  const pkg = {namespace:'noqeri',name:'json',versions:[
    {version:'1.0.0',yanked:true,path:'old'},
    {version:'0.4.0',yanked:false,path:'current'},
    {version:'0.3.0',yanked:false,path:'older'}
  ]}
  assert.equal(selectRelease(pkg).version,'0.4.0')
  assert.equal(downloadPath(pkg,selectRelease(pkg)),'/registry/noqeri/json/0.4.0/download.nqpkg')
})
test('semantic versions sort numerically including prerelease', () => {
  assert.ok(compareVersions('0.10.0','0.9.9')>0)
  assert.ok(compareVersions('1.0.0','1.0.0-rc.2')>0)
  assert.ok(compareVersions('1.0.0-rc.10','1.0.0-rc.2')>0)
  assert.ok(compareVersions('1.0.0+build.2','1.0.0+build.1')===0)
})
test('fails closed for yanked-only/malformed releases and coordinates', () => {
  assert.equal(selectRelease({versions:[{version:'1.0.0',yanked:true,path:'removed'}]}),null)
  assert.equal(selectRelease({versions:[{version:'garbage',path:'bad'}]}),null)
  assert.throws(()=>downloadPath({namespace:'../bad',name:'json'},{version:'0.4.0'}))
})
