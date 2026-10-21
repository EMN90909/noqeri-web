// Explicit Node HTTP transport adapter during compiler stabilization.
// Never label this as Noqeri-compiled Stage-2 output.
export function createV1ApiTransport(host) {
  const handlers = new Map([
    ['/api/health', {status:'ok',language:'1.0.0',source:'Noqeri',qualified:false,transport:'node-compatibility'}],
    ['/api/meta', {language:'1.0.0',edition:'2026',compiler:'1.0.0',release:'stabilization-candidate',qualified:false}]
  ])
  return Object.freeze({
    configureServer:()=>host.httpStatic('/','dist'),
    serverCanHandle:(method,path)=>(method==='GET'||method==='HEAD')&&handlers.has(path),
    serverStatus:()=>200,
    serverContentType:()=> 'application/json; charset=utf-8',
    serverHandle:(method,path)=>JSON.stringify(handlers.get(path)??{error:'not_found'})
  })
}
