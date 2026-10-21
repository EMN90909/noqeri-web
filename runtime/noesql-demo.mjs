// Reference-only NoeSQL-backed website demo. Requires an installed, authorized
// private NoeSQL package; never silently falls back to NoqeriDB or SQLite.
import { resolve } from 'node:path'
export async function runNoeSQLDemo(dataRoot) {
  let database
  try { ({database}=await import('noesql/session')) }
  catch(error) {
    if(error.code==='ERR_MODULE_NOT_FOUND' || error.code==='ERR_PACKAGE_PATH_NOT_EXPORTED')
      return {status:503,body:{error:'noesql_runtime_unavailable',detail:'Install private NoeSQL session package before enabling the demo'}}
    throw error
  }
  const db=database(resolve(dataRoot,'site-demo.noedb'))
  const state=await db.snapshot()
  if(!state.tables.health){
    await db.execute('table health { id: int key auto\n key: text required unique\n value: text required }\nquery healthy() { health get key, value where key == "status" }\nhealth add {key:"status",value:"ok"}')
  }
  const result=await db.query('healthy')
  const verified=await db.verify()
  return {status:200,body:{engine:'NoeSQL',storage:verified.format,rows:result.rows}}
}
