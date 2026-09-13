const RAW_REGISTRY='https://raw.githubusercontent.com/EMN90909/noqeri-registry/main'
const RAW_NOQERI='https://raw.githubusercontent.com/EMN90909/Noqeri/main'
const cache=new Map()
const CACHE_MS=5*60*1000
const MAX_JSON_BYTES=2*1024*1024

const sources=Object.freeze({
  advisories:`${RAW_REGISTRY}/advisories/index.json`,
  package_quality:`${RAW_REGISTRY}/registry/quality.json`,
  compatibility_policy:`${RAW_REGISTRY}/compatibility/releases.json`,
  compatibility_results:`${RAW_REGISTRY}/compatibility/results.json`,
  benchmark_suite:`${RAW_NOQERI}/Benchmarks/suite.json`,
  benchmark_results:`${RAW_NOQERI}/Benchmarks/results/latest.json`
})

async function fixedJson(key,url,{optional=false}={}){
  const hit=cache.get(key)
  if(hit&&Date.now()-hit.time<CACHE_MS)return hit.value
  const response=await fetch(url,{headers:{Accept:'application/json','User-Agent':'noqeri-web-quality-evidence'},redirect:'error',signal:AbortSignal.timeout(8000)})
  if(response.status===404&&optional){cache.set(key,{time:Date.now(),value:null});return null}
  if(!response.ok)throw new Error(`quality evidence fetch ${key} returned ${response.status}`)
  const declared=Number(response.headers.get('content-length')||0)
  if(declared>MAX_JSON_BYTES)throw new Error(`quality evidence ${key} exceeds size limit`)
  const text=await response.text()
  if(Buffer.byteLength(text)>MAX_JSON_BYTES)throw new Error(`quality evidence ${key} exceeds size limit`)
  const value=JSON.parse(text)
  cache.set(key,{time:Date.now(),value})
  return value
}

export function qualityEvidenceSources(){return sources}
export async function registryAdvisories(){return fixedJson('advisories',sources.advisories)}
export async function packageQuality(){return fixedJson('package-quality',sources.package_quality)}
export async function compatibilityPolicy(){return fixedJson('compatibility-policy',sources.compatibility_policy)}
export async function compatibilityResults(){return fixedJson('compatibility-results',sources.compatibility_results,{optional:true})}
export async function benchmarkSuite(){return fixedJson('benchmark-suite',sources.benchmark_suite)}
export async function benchmarkResults(){return fixedJson('benchmark-results',sources.benchmark_results,{optional:true})}

function compatibilityState(results){
  if(!results)return 'test-contract'
  const rows=Array.isArray(results.rows)?results.rows:[]
  if(!rows.length)return 'test-contract'
  return rows.every(row=>row.status==='pass'&&row.evidence_state==='verified')?'verified':'test-contract'
}
function performanceState(results){
  if(!results)return 'unmeasured'
  return String(results.evidence_state||results.state||'published')
}

export async function qualityEvidence(){
  const [advisories,packageLevels,compatibility,compatResults,suite,perfResults]=await Promise.all([
    registryAdvisories(),packageQuality(),compatibilityPolicy(),compatibilityResults(),benchmarkSuite(),benchmarkResults()
  ])
  const perfState=performanceState(perfResults)
  const claimStates=new Set(['measured','regression-gated'])
  return {
    schema:1,
    generated_at:new Date().toISOString(),
    policy:'Evidence is configuration-specific. Missing measurements are never converted into performance or maturity claims.',
    sources,
    security:{
      evidence_state:'implemented',
      advisory_count:Array.isArray(advisories?.advisories)?advisories.advisories.length:0,
      feed:advisories
    },
    packages:{
      evidence_state:'declared',
      default_level:packageLevels?.default_level||'experimental',
      levels:packageLevels?.levels||['experimental','preview','stable','core'],
      declarations:packageLevels,
      note:'A missing package-specific override resolves to the conservative published default; it is never inferred as stable.'
    },
    compatibility:{
      evidence_state:compatibilityState(compatResults),
      policy:compatibility,
      results:compatResults,
      results_status:compatResults?'published':'not_published'
    },
    performance:{
      evidence_state:perfState,
      suite,
      results:perfResults,
      results_status:perfResults?'published':'not_published',
      comparative_claims_allowed:claimStates.has(perfState)
    }
  }
}
