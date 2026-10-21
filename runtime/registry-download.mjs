import {createHash} from 'node:crypto'
// The website is an HTTP client only. It cannot read registry.noedb and never
// generates .nqpkg archives from GitHub source directories.
const PART=/^[a-z0-9][a-z0-9-]*$/
const VERSION=/^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/
const MAX_INDEX=2*1024*1024,MAX_ARCHIVE=10*1024*1024
const cache=new Map()
export class RegistryError extends Error {
 constructor(message,status=502){super(message);this.name='RegistryError';this.status=status}
}
export function registryOrigin(){
 const configured=process.env.NOQERI_REGISTRY_URL||'http://127.0.0.1:8080'
 let u;try{u=new URL(configured)}catch{throw new RegistryError('invalid Registry URL',500)}
 if(u.username||u.password||u.search||u.hash||u.pathname!=='/'||!['https:','http:'].includes(u.protocol))
  throw new RegistryError('Registry URL must be a bare origin',500)
 if(u.protocol!=='https:'&&!['127.0.0.1','localhost','[::1]'].includes(u.hostname))
  throw new RegistryError('nonlocal registry requires HTTPS',500)
 return u.origin
}
async function get(path,limit,accept) {
 const url=registryOrigin()+path
 const res=await fetch(url,{headers:{Accept:accept,'User-Agent':'noqeri-web-registry-v1'},redirect:'error',signal:AbortSignal.timeout(10000)})
 if(!res.ok)throw new RegistryError(res.status===404?'package not found':'registry API unavailable',res.status===404?404:502)
 const length=Number(res.headers.get('content-length')||0)
 if(!Number.isFinite(length)||length>limit)throw new RegistryError('registry response too large',422)
 const reader=res.body?.getReader()
 if(!reader)throw new RegistryError('registry response stream unavailable')
 const chunks=[];let total=0
 try{
  for(;;){
   const {value,done}=await reader.read()
   if(done)break
   total+=value.byteLength
   if(total>limit)throw new RegistryError('registry response too large',422)
   chunks.push(Buffer.from(value))
  }
 }catch(e){await reader.cancel().catch(()=>{});throw e}
 return Buffer.concat(chunks,total)
}
async function json(path){
 let v
 try {v=JSON.parse((await get(path,MAX_INDEX,'application/json')).toString('utf8'))}
 catch(e){if(e instanceof RegistryError)throw e;throw new RegistryError('registry returned invalid JSON')}
 return v
}
export async function registryIndex(){
 const hit=cache.get('index')
 if(hit&&Date.now()-hit.time<30000)return hit.value
 const value=await json('/v1/index')
 if(value?.protocol!=='v1'||!Array.isArray(value.packages))throw new RegistryError('unsupported registry index version')
 cache.set('index',{time:Date.now(),value})
 return value
}
export async function packageArchive(namespace,name,version){
 if(!PART.test(namespace)||!PART.test(name)||!VERSION.test(version))throw new RegistryError('invalid package coordinate',400)
 const index=await registryIndex()
 const release=index.packages.find(p=>p.namespace===namespace&&p.name===name)?.versions?.find(v=>v.version===version)
 // Explicit pinned yanked releases remain fetchable for existing lockfiles.
 if(!release)throw new RegistryError('release not found',404)
 const path='/v1/packages/'+namespace+'/'+name+'/'+encodeURIComponent(version)
 const metadata=await json(path)
 if(metadata.namespace!==namespace||metadata.name!==name||metadata.version!==version||
    metadata.integrity!==release.integrity||metadata.yanked!==release.yanked||
    !/^sha256:[0-9a-f]{64}$/.test(metadata.integrity||''))throw new RegistryError('registry metadata mismatch',502)
 const key=namespace+'/'+name+'@'+version,hit=cache.get(key)
 if(hit&&Date.now()-hit.time<30000)return hit.value
 const bytes=await get(path+'/download',MAX_ARCHIVE,'application/vnd.noqeri.package+gzip')
 if('sha256:'+createHash('sha256').update(bytes).digest('hex')!==metadata.integrity)
  throw new RegistryError('package archive integrity mismatch',502)
 cache.set(key,{time:Date.now(),value:bytes})
 return bytes
}
