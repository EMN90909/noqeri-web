import { createHash, randomBytes } from 'node:crypto'
import { existsSync, mkdirSync, readFileSync, writeFileSync, unlinkSync } from 'node:fs'
import { resolve, relative, sep } from 'node:path'
import { spawnSync } from 'node:child_process'

export function createNoqeriHost({dataRoot,noqeriBin}){
  const root=resolve(dataRoot);mkdirSync(root,{recursive:true})
  const routes=new Map(),staticMounts=[]
  const safe=(input)=>{const full=resolve(root,String(input));const rel=relative(root,full);if(rel.startsWith('..'+sep)||rel==='..'||rel.includes(`..${sep}`))throw new Error('path escapes Noqeri data root');return full}
  const api={
    routes,staticMounts,
    httpRouteText(method,path,status,body){routes.set(`${String(method).toUpperCase()} ${path}`,{status:Number(status),body:String(body),type:'text/plain; charset=utf-8'});return true},
    httpStatic(prefix,directory){staticMounts.push({prefix:String(prefix),directory:String(directory)});return true},
    httpListen(){return true},
    fsReadText(path){return readFileSync(safe(path),'utf8')},
    fsWriteText(path,text){const p=safe(path);mkdirSync(resolve(p,'..'),{recursive:true});writeFileSync(p,String(text),{encoding:'utf8',mode:0o600});return true},
    fsExists(path){return existsSync(safe(path))},
    envGet(name){const key=String(name);if(key==='NODE_ENV'||key==='PORT'||key.startsWith('NOQERI_'))return process.env[key]??'';return ''},
    timeNowMillis(){return Date.now()},
    cryptoRandomHex(bytes){const size=Math.max(0,Math.min(Number(bytes),4096));return randomBytes(size).toString('hex')},
    cryptoSha256(text){return createHash('sha256').update(String(text)).digest('hex')},
    // Explicitly disabled: this invoked the independent legacy NoqeriDB engine.
    // The web demo must not silently claim to use NoeSQL.
    dbOpen(){throw Error('legacy NoqeriDB disabled: NoeSQL provider required')},
    dbExec(){throw Error('legacy NoqeriDB disabled: NoeSQL provider required')}
  }
  return Object.freeze(api)
}
