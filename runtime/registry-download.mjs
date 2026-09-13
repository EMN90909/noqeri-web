import { gzipSync } from 'node:zlib'

const INDEX='https://raw.githubusercontent.com/EMN90909/noqeri-registry/main/registry/index.json'
const API='https://api.github.com/repos/EMN90909/noqeri-registry/contents/'
const cache=new Map()
const validPart=value=>/^[a-z0-9][a-z0-9-]*$/i.test(value)
const validVersion=value=>/^[0-9]+\.[0-9]+\.[0-9]+(?:-[0-9A-Za-z.-]+)?(?:\+[0-9A-Za-z.-]+)?$/.test(value)
const compareText=(a,b)=>a<b?-1:a>b?1:0
const oct=(value,length)=>`${Math.max(0,value).toString(8)}`.padStart(length-1,'0')+'\0'
const MAX_FILES=256,MAX_BYTES=8*1024*1024,MAX_FILE_BYTES=2*1024*1024

function safeArchiveName(name){
  if(!name||name.startsWith('/')||name.startsWith('\\')||name.includes('\\')||name.split('/').some(p=>p===''||p==='.'||p==='..'))throw new Error('unsafe package archive path')
  return name
}
function tarHeader(name,size){
  safeArchiveName(name)
  if(Buffer.byteLength(name)>100)throw new Error('package path exceeds USTAR limit')
  const h=Buffer.alloc(512)
  h.write(name,0,100,'utf8');h.write(oct(0o644,8),100,8,'ascii');h.write(oct(0,8),108,8,'ascii');h.write(oct(0,8),116,8,'ascii')
  h.write(oct(size,12),124,12,'ascii');h.write(oct(0,12),136,12,'ascii');h.fill(0x20,148,156);h[156]='0'.charCodeAt(0)
  h.write('ustar\0',257,6,'ascii');h.write('00',263,2,'ascii')
  let sum=0;for(const b of h)sum+=b;h.write(oct(sum,8),148,8,'ascii');return h
}
function tar(entries){
  const chunks=[]
  for(const entry of entries){const data=Buffer.from(entry.data);chunks.push(tarHeader(entry.name,data.length),data);const pad=(512-data.length%512)%512;if(pad)chunks.push(Buffer.alloc(pad))}
  chunks.push(Buffer.alloc(1024));return Buffer.concat(chunks)
}
async function getJson(url){
  const response=await fetch(url,{headers:{Accept:'application/vnd.github+json','User-Agent':'noqeri-web'},redirect:'error',signal:AbortSignal.timeout(8000)})
  if(!response.ok)throw new Error(`registry fetch ${response.status}`)
  const declared=Number(response.headers.get('content-length')||0);if(declared>2*1024*1024)throw new Error('registry metadata too large')
  const text=await response.text();if(Buffer.byteLength(text)>2*1024*1024)throw new Error('registry metadata too large')
  return JSON.parse(text)
}
async function getBytes(url,limit){
  const response=await fetch(url,{redirect:'error',signal:AbortSignal.timeout(8000)})
  if(!response.ok)throw new Error('package file fetch failed')
  const declared=Number(response.headers.get('content-length')||0);if(declared>limit)throw new Error('package file size limit exceeded')
  const data=Buffer.from(await response.arrayBuffer());if(data.length>limit)throw new Error('package file size limit exceeded');return data
}
async function listFiles(path,base,files,state){
  const listing=await getJson(`${API}${encodeURI(path)}?ref=main`)
  if(!Array.isArray(listing))throw new Error('invalid package directory listing')
  for(const item of listing){
    if(item.type==='dir')await listFiles(item.path,base,files,state)
    else if(item.type==='file'){
      if(++state.files>MAX_FILES)throw new Error('package file limit exceeded')
      const name=safeArchiveName(item.path.slice(base.length+1))
      const remaining=Math.min(MAX_FILE_BYTES,MAX_BYTES-state.bytes);if(remaining<=0)throw new Error('package size limit exceeded')
      const data=await getBytes(item.download_url,remaining);state.bytes+=data.length;if(state.bytes>MAX_BYTES)throw new Error('package size limit exceeded')
      files.push({name,data})
    }
  }
}
export async function registryIndex(){
  const now=Date.now(),hit=cache.get('index');if(hit&&now-hit.time<300000)return hit.value
  const value=await getJson(INDEX);cache.set('index',{time:now,value});return value
}
export async function packageArchive(namespace,name,version){
  if(!validPart(namespace)||!validPart(name)||!validVersion(version))throw new Error('invalid package identity')
  const key=`${namespace}/${name}@${version}`,hit=cache.get(key);if(hit&&Date.now()-hit.time<300000)return hit.value
  const index=await registryIndex();const pkg=index.packages.find(p=>p.namespace===namespace&&p.name===name)
  const release=pkg?.versions?.find(v=>v.version===version&&!v.yanked);if(!release)throw new Error('package not found')
  const files=[],state={files:0,bytes:0};await listFiles(release.path,release.path,files,state);files.sort((a,b)=>compareText(a.name,b.name))
  if(!files.some(f=>f.name==='package.nqr'))throw new Error('package manifest missing')
  const value=gzipSync(tar(files),{level:9,mtime:0});cache.set(key,{time:Date.now(),value});return value
}
