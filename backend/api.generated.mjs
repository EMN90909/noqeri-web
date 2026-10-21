// Bootstrap web transpilation of backend/api.noqeri. CI/Docker must regenerate via `noqeri web`.
const httpStatic=(prefix,dir)=>globalThis.NoqeriHost.httpStatic(prefix,dir)
export function apiStatus(){return 'ok'}
export function apiLanguage(){return '0.7.0-dev'}
export function apiEdition(){return '2026'}
export function apiCompiler(){return '0.7.0'}
export function apiRegistry(){return '/registry/index.json'}
export function apiSource(){return 'Noqeri'}
export function configureServer(){return httpStatic('/','dist')}
export function serverCanHandle(method,path){return path==='/api/health'||path==='/api/meta'}
export function serverStatus(method,path){return serverCanHandle(method,path)?200:404}
export function serverContentType(){return 'application/json; charset=utf-8'}
export function serverHandle(method,path){
 if(path==='/api/health')return '{"status":"ok","language":"0.7.0-dev","source":"Noqeri"}'
 if(path==='/api/meta')return '{"language":"0.7.0-dev","edition":"2026","compiler":"0.7.0"}'
 return '{"error":"not_found"}'
}
