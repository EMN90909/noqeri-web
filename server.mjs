import { createServer } from 'node:http'
import { readFile, stat } from 'node:fs/promises'
import { extname, join, normalize } from 'node:path'
import { fileURLToPath } from 'node:url'
import { gzipSync } from 'node:zlib'
import { apiStatus, apiLanguage, apiEdition, apiCompiler, apiRegistry, apiSource } from './backend/api.generated.mjs'

const root=join(fileURLToPath(new URL('.',import.meta.url)),'dist')
const port=Number(process.env.PORT||8080)
const cache=new Map()
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.ico':'image/x-icon','.txt':'text/plain; charset=utf-8'}
const security={
  'X-Content-Type-Options':'nosniff','Referrer-Policy':'strict-origin-when-cross-origin',
  'Permissions-Policy':'camera=(), microphone=(), geolocation=()',
  'Cross-Origin-Opener-Policy':'same-origin','Cross-Origin-Resource-Policy':'same-origin',
  'Content-Security-Policy':"default-src 'self'; script-src 'self'; style-src 'self' https://fonts.googleapis.com 'unsafe-inline'; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'"
}
function send(res,status,headers,body){res.writeHead(status,{...security,...headers});res.end(body)}
function json(res,status,value){send(res,status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'},JSON.stringify(value))}
function safePath(urlPath){const decoded=decodeURIComponent(urlPath.split('?')[0]);const cleaned=normalize(decoded).replace(/^(\.\.[/\\])+/, '').replace(/^[/\\]+/,'');return join(root,cleaned)}
async function staticFile(req,res){
  let path=safePath(req.url||'/')
  try{if((await stat(path)).isDirectory())path=join(path,'index.html')}catch{}
  try{
    const info=await stat(path);if(!info.isFile())throw new Error('not file')
    const key=`${path}:${info.mtimeMs}:${info.size}`;let data=cache.get(key);if(!data){data=await readFile(path);cache.clear();cache.set(key,data)}
    const type=types[extname(path)]||'application/octet-stream';const immutable=path.includes('/assets/')
    if(/^(text\/|application\/(javascript|json))/.test(type)&&data.length>1024&&(req.headers['accept-encoding']||'').includes('gzip')){
      return send(res,200,{'Content-Type':type,'Content-Encoding':'gzip','Cache-Control':immutable?'public, max-age=31536000, immutable':'public, max-age=300'},gzipSync(data,{level:6}))
    }
    send(res,200,{'Content-Type':type,'Cache-Control':immutable?'public, max-age=31536000, immutable':'public, max-age=300'},data)
  }catch{
    const index=await readFile(join(root,'index.html'));send(res,200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-cache'},index)
  }
}
const server=createServer(async(req,res)=>{
  const method=req.method||'GET';if(method!=='GET'&&method!=='HEAD')return json(res,405,{error:'method_not_allowed'})
  if(req.url==='/api/health'||req.url==='/healthz')return json(res,200,{status:apiStatus(),language:apiLanguage(),edition:apiEdition(),compiler:apiCompiler(),registry:apiRegistry(),source:apiSource()})
  if(req.url==='/api/meta')return json(res,200,{language:apiLanguage(),edition:apiEdition(),compiler:apiCompiler(),source:apiSource()})
  try{await staticFile(req,res)}catch{json(res,500,{error:'internal_error'})}
})
server.requestTimeout=10_000
server.headersTimeout=12_000
server.keepAliveTimeout=5_000
server.listen(port,'0.0.0.0',()=>console.log(`noqeri web listening on ${port}`))
