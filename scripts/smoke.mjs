import {spawn} from 'node:child_process'
import {createServer} from 'node:http'
import {createHash} from 'node:crypto'
import assert from 'node:assert/strict'
const port=18080, registryPort=18081
const archive=Buffer.from('test-registry-archive')
const integrity='sha256:'+createHash('sha256').update(archive).digest('hex')
const index={packages:[{namespace:'noqeri',name:'json',versions:[{version:'1.0.0',yanked:true},{version:'0.4.0',yanked:false,entry:'src/json.noqeri',archiveIntegrity:integrity}]}]}
const mock=createServer((req,res)=>{
  const path=req.url||'/'
  res.setHeader('Content-Type','application/json')
  if(path==='/v1/index')return res.end(JSON.stringify(index))
  if(path==='/v1/packages/noqeri/json/0.4.0')return res.end(JSON.stringify({version:'0.4.0',yanked:false,entry:'src/json.noqeri',archiveIntegrity:integrity}))
  if(path==='/v1/packages/noqeri/json/0.4.0/download')return res.end(archive)
  if(path==='/v1/packages/noqeri/json/1.0.0')return res.end(JSON.stringify({version:'1.0.0',yanked:true,archiveIntegrity:integrity}))
  res.writeHead(404);res.end('{}')
})
await new Promise(resolve=>mock.listen(registryPort,'127.0.0.1',resolve))
const child=spawn(process.execPath,['server.mjs'],{
  env:{...process.env,PORT:String(port),NOQERI_REGISTRY_API_URL:'http://127.0.0.1:'+registryPort},
  stdio:['ignore','pipe','inherit']
})
const stop=()=>child.kill('SIGTERM')
process.on('exit',stop)
try{
 await new Promise((resolve,reject)=>{
  const timer=setTimeout(()=>reject(Error('server start timeout')),12000)
  child.stdout.on('data',data=>{if(String(data).includes('listening')){clearTimeout(timer);resolve()}})
  child.on('exit',code=>reject(Error('web server exited '+code)))
 })
 const root='http://127.0.0.1:'+port
 const health=await(await fetch(root+'/api/health')).json()
 assert.equal(health.status,'ok')
 const meta=await(await fetch(root+'/api/meta')).json()
 assert.equal(meta.compiler,'0.7.0')
 const db=await fetch(root+'/api/db-demo')
 // When private NoeSQL is unavailable the demo must fail closed, not run NoqeriDB.
 assert.equal(db.status,503)
 assert.equal((await db.json()).error,'noesql_runtime_unavailable')
 const idx=await(await fetch(root+'/registry/index.json')).json()
 assert.equal(idx.packages[0].name,'json')
 const response=await fetch(root+'/registry/noqeri/json/0.4.0/download.nqpkg')
 assert.equal(response.status,200)
 const bytes=Buffer.from(await response.arrayBuffer())
 assert.deepEqual(bytes,archive)
 assert.equal(response.headers.get('x-archive-sha256'),integrity.slice(7))
 const withdrawn=await fetch(root+'/registry/noqeri/json/1.0.0/download.nqpkg')
 assert.equal(withdrawn.status,404)
 assert.equal((await fetch(root+'/assets/does-not-exist.js')).status,404)
 assert.equal((await fetch(root+'/secrets.noedb')).status,404)
 const docs=await fetch(root+'/docs/http-server')
 assert.equal(docs.status,200)
 assert.ok((await docs.text()).includes('<div id="root"></div>'))
 assert.ok((await fetch(root+'/')).headers.get('content-security-policy'))
 console.log('website Registry API smoke passed')
}finally{stop();await new Promise(resolve=>mock.close(resolve))}
