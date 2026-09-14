import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { createNoqeriHost } from './runtime/noqeri-host.mjs'
import { registryIndex, packageArchive } from './runtime/registry-download.mjs'
import { shellInstaller, powershellInstaller, sourceInfo } from './runtime/source-install.mjs'
import { registryAdvisories, packageQuality, compatibilityPolicy, compatibilityResults, qualityEvidence } from './runtime/quality-evidence.mjs'
import { createStaticFileHandler } from './runtime/static-files.mjs'

const base=fileURLToPath(new URL('.',import.meta.url))
const root=join(base,'dist')
const dataRoot=join(base,'data')
const port=Number(process.env.PORT||8080)
const noqeriBin=process.env.NOQERI_BIN||'/usr/local/bin/noqeri'
const security={
  'X-Content-Type-Options':'nosniff',
  'Referrer-Policy':'strict-origin-when-cross-origin',
  'Permissions-Policy':'camera=(), microphone=(), geolocation=()',
  'Cross-Origin-Opener-Policy':'same-origin',
  'Cross-Origin-Resource-Policy':'same-origin',
  'Content-Security-Policy':"default-src 'self'; script-src 'self'; style-src 'self' https://fonts.googleapis.com 'unsafe-inline'; font-src 'self' https://fonts.gstatic.com; img-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'"
}
function send(req,res,status,headers,body){res.writeHead(status,{...security,...headers});res.end(req.method==='HEAD'||status===304?undefined:body)}
function json(req,res,status,value){send(req,res,status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'},JSON.stringify(value))}
const staticFile=createStaticFileHandler({root,security,maxEntries:128})

const host=createNoqeriHost({dataRoot,noqeriBin})
globalThis.NoqeriHost=host
const nqo=await readFile(join(base,'backend','api.generated.nqo'),'utf8')
const api=await import(`data:text/javascript;base64,${Buffer.from(nqo).toString('base64')}`)
api.configureServer?.()

const server=createServer(async(req,res)=>{
  const method=req.method||'GET'
  if(method!=='GET'&&method!=='HEAD')return json(req,res,405,{error:'method_not_allowed'})
  let url
  try{url=new URL(req.url||'/',`http://${req.headers.host||'localhost'}`)}catch{return json(req,res,400,{error:'bad_url'})}
  const forwarded=(req.headers['x-forwarded-proto']||'').split(',')[0].trim()
  const protocol=forwarded==='https'?'https':'http'
  const origin=`${protocol}://${req.headers.host||'localhost'}`
  try{
    if(url.pathname==='/get/noqeri')return send(req,res,200,{'Content-Type':'text/x-shellscript; charset=utf-8','Cache-Control':'public, max-age=300'},shellInstaller(origin,url.searchParams.get('ref')||'main'))
    if(url.pathname==='/get/noqeri.ps1')return send(req,res,200,{'Content-Type':'text/plain; charset=utf-8','Cache-Control':'public, max-age=300'},powershellInstaller(origin,url.searchParams.get('ref')||'main'))
    if(url.pathname==='/source/noqeri')return json(req,res,200,sourceInfo(origin,url.searchParams.get('ref')||'main'))
    if(url.pathname==='/registry/index.json')return json(req,res,200,await registryIndex())
    if(url.pathname==='/registry/advisories/index.json')return json(req,res,200,await registryAdvisories())
    if(url.pathname==='/registry/quality.json')return json(req,res,200,await packageQuality())
    if(url.pathname==='/registry/compatibility/releases.json')return json(req,res,200,await compatibilityPolicy())
    if(url.pathname==='/registry/compatibility/results.json'){
      const results=await compatibilityResults()
      return results?json(req,res,200,results):json(req,res,404,{schema:1,status:'not_published',message:'No executed compatibility result bundle is published yet.'})
    }
    if(url.pathname==='/quality/evidence.json')return json(req,res,200,await qualityEvidence())
    const pkg=url.pathname.match(/^\/registry\/([a-z0-9-]+)\/([a-z0-9-]+)\/([0-9][a-z0-9.-]*)\/download\.nqpkg$/i)
    if(pkg){
      const archive=await packageArchive(pkg[1],pkg[2],pkg[3])
      return send(req,res,200,{
        'Content-Type':'application/vnd.noqeri.package+gzip',
        'Content-Disposition':`attachment; filename="${pkg[1]}-${pkg[2]}-${pkg[3]}.nqpkg"`,
        'Cache-Control':'public, max-age=300'
      },archive)
    }
    const staticRoute=host.routes.get(`${method} ${url.pathname}`)||host.routes.get(`GET ${url.pathname}`)
    if(staticRoute)return send(req,res,staticRoute.status,{'Content-Type':staticRoute.type,'Cache-Control':'no-store'},staticRoute.body)
    if(api.serverCanHandle?.(method,url.pathname)){
      const status=api.serverStatus(method,url.pathname)
      const type=api.serverContentType(method,url.pathname)
      const body=api.serverHandle(method,url.pathname)
      return send(req,res,status,{'Content-Type':type,'Cache-Control':'no-store'},body)
    }
    return await staticFile(req,res,url.pathname)
  }catch(error){
    console.error(error)
    return json(req,res,500,{error:'internal_error'})
  }
})
server.requestTimeout=10_000
server.headersTimeout=12_000
server.keepAliveTimeout=5_000
server.maxHeadersCount=80
server.listen(port,'0.0.0.0',()=>console.log(`noqeri web listening on ${port}`))
