import { spawn } from 'node:child_process'
const port=18080
const child=spawn(process.execPath,['server.mjs'],{env:{...process.env,PORT:String(port)},stdio:['ignore','pipe','inherit']})
const stop=()=>child.kill('SIGTERM')
process.on('exit',stop)
try{
  await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error('server start timeout')),8000);child.stdout.on('data',data=>{if(String(data).includes('listening')){clearTimeout(timer);resolve()}});child.on('exit',code=>reject(new Error(`server exited ${code}`)))})
  const health=await fetch(`http://127.0.0.1:${port}/api/health`).then(r=>r.json())
  if(health.status!=='ok'||health.source!=='Noqeri')throw new Error('Noqeri API health mismatch')
  const docs=await fetch(`http://127.0.0.1:${port}/docs/generics`)
  if(!docs.ok||(await docs.text()).indexOf('<div id="root"></div>')<0)throw new Error('SPA docs fallback failed')
  const home=await fetch(`http://127.0.0.1:${port}/`)
  if(!home.headers.get('content-security-policy'))throw new Error('security headers missing')
  console.log('web smoke tests passed')
} finally {stop()}
