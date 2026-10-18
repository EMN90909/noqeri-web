import { createHash } from 'node:crypto'
import { gzipSync } from 'node:zlib'

const INDEX='https://raw.githubusercontent.com/EMN90909/noqeri-registry/main/registry/index.json'
const API='https://api.github.com/repos/EMN90909/noqeri-registry/contents/'
const RAW_PREFIX='https://raw.githubusercontent.com/EMN90909/noqeri-registry/main/'
const MAX_FILES=256,MAX_BYTES=8*1024*1024,MAX_INDEX_BYTES=2*1024*1024
const cache=new Map()
const validPart=value=>/^[a-z0-9][a-z0-9-]*$/.test(value)
const validVersion=value=>/^\d+\.\d+\.\d+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/.test(value)
const safePath=path=>typeof path==='string'&&path.length>0&&!path.includes('\\')&&!path.startsWith('/')&&path.split('/').every(p=>p&&p!=='.'&&p!=='..'&&!p.includes('\0'))
export class RegistryError extends Error {
  constructor(message,status=502){super(message);this.name='RegistryError';this.status=status}
}

function oct(value,length){return Math.max(0,value).toString(8).padStart(length-1,'0')+'\0'}
function tarHeader(name,size){
  if(!safePath(name)||Buffer.byteLength(name)>100)throw new RegistryError('invalid package archive path',422)
  const h=Buffer.alloc(512)
  h.write(name,0,100,'utf8');h.write(oct(0o644,8),100,8,'ascii')
  h.write(oct(0,8),108,8,'ascii');h.write(oct(0,8),116,8,'ascii')
  h.write(oct(size,12),124,12,'ascii');h.write(oct(0,12),136,12,'ascii')
  h.fill(0x20,148,156);h[156]='0'.charCodeAt(0)
  h.write('ustar\0',257,6,'ascii');h.write('00',263,2,'ascii')
  let sum=0;for(const b of h)sum+=b
  h.write(oct(sum,8),148,8,'ascii')
  return h
}
function tar(files){
  const chunks=[]
  for(const file of files){
    const data=Buffer.from(file.data)
    chunks.push(tarHeader(file.name,data.length),data)
    const pad=(512-data.length%512)%512
    if(pad)chunks.push(Buffer.alloc(pad))
  }
  chunks.push(Buffer.alloc(1024))
  return Buffer.concat(chunks)
}
async function getBytes(url,limit){
  const response=await fetch(url,{headers:{Accept:'application/vnd.github+json','User-Agent':'noqeri-web'},redirect:'error',signal:AbortSignal.timeout(10000)})
  if(!response.ok)throw new RegistryError('registry upstream returned '+response.status)
  const length=Number(response.headers.get('content-length')||0)
  if(length>limit)throw new RegistryError('registry response size limit exceeded',422)
  const bytes=Buffer.from(await response.arrayBuffer())
  if(bytes.length>limit)throw new RegistryError('registry response size limit exceeded',422)
  return bytes
}
async function getJson(url){
  const bytes=await getBytes(url,MAX_INDEX_BYTES)
  try{return JSON.parse(bytes.toString('utf8'))}catch{throw new RegistryError('invalid registry JSON')}
}
async function listFiles(path,base,files,state,depth=0){
  if(depth>12||++state.directories>256)throw new RegistryError('package directory limit exceeded',422)
  if(!safePath(path)||(!path.startsWith(base+'/')&&path!==base))throw new RegistryError('invalid registry path',422)
  const listing=await getJson(`${API}${encodeURI(path)}?ref=main`)
  if(!Array.isArray(listing))throw new RegistryError('invalid registry directory listing')
  for(const item of listing){
    if(!item||!safePath(item.path)||!item.path.startsWith(base+'/'))throw new RegistryError('invalid registry entry',422)
    const name=item.path.slice(base.length+1)
    if(!safePath(name))throw new RegistryError('invalid package relative path',422)
    if(item.type==='dir'){await listFiles(item.path,base,files,state,depth+1);continue}
    if(item.type!=='file')throw new RegistryError('unsupported registry entry type',422)
    if(++state.files>MAX_FILES)throw new RegistryError('package file limit exceeded',422)
    const expected=RAW_PREFIX+item.path.split('/').map(encodeURIComponent).join('/')
    if(item.download_url!==expected)throw new RegistryError('unsafe package download URL',422)
    const data=await getBytes(expected,MAX_BYTES-state.bytes)
    state.bytes+=data.length
    if(state.bytes>MAX_BYTES)throw new RegistryError('package size limit exceeded',422)
    files.push({name,data})
  }
}
function digest(files){
  const hash=createHash('sha256')
  for(const file of files){
    hash.update(file.name);hash.update('\0');hash.update(file.data);hash.update('\0')
  }
  return 'sha256:'+hash.digest('hex')
}
export async function registryIndex(){
  const hit=cache.get('index')
  if(hit&&Date.now()-hit.time<300000)return hit.value
  const value=await getJson(INDEX)
  if(!value||!Array.isArray(value.packages))throw new RegistryError('invalid registry index')
  cache.set('index',{time:Date.now(),value})
  return value
}
export async function packageArchive(namespace,name,version){
  if(!validPart(namespace)||!validPart(name)||!validVersion(version))throw new RegistryError('invalid package identity',400)
  const index=await registryIndex()
  const pkg=index.packages.find(p=>p.namespace===namespace&&p.name===name)
  const release=pkg?.versions?.find(v=>v.version===version&&!v.yanked)
  if(!release)throw new RegistryError('package release not found or withdrawn',404)
  const base=`packages/${namespace}/${name}/${version}`
  if(release.path!==base)throw new RegistryError('registry release path mismatch',422)
  const key=`${namespace}/${name}@${version}`,hit=cache.get(key)
  if(hit&&Date.now()-hit.time<300000)return hit.value
  const files=[],state={files:0,directories:0,bytes:0}
  await listFiles(base,base,files,state)
  files.sort((a,b)=>a.name<b.name?-1:a.name>b.name?1:0)
  const manifest=files.find(f=>f.name==='package.nqr')
  if(!manifest)throw new RegistryError('package manifest missing',422)
  const entry=/\bentry\s*:\s*"([^"]+)"/.exec(manifest.data.toString('utf8'))?.[1]
  if(!safePath(entry)||!files.some(f=>f.name===entry))throw new RegistryError('package entry missing or unsafe',422)
  const actual=digest(files)
  if(release.integrity&&release.integrity!==actual)throw new RegistryError('registry package integrity mismatch',422)
  const archive=gzipSync(tar(files),{level:9,mtime:0})
  cache.set(key,{time:Date.now(),value:archive})
  return archive
}
