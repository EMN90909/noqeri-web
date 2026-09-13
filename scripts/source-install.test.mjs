import assert from 'node:assert/strict'
import {shellInstaller,powershellInstaller,sourceArchiveUrl,sourceInfo} from '../runtime/source-install.mjs'

assert.equal(sourceArchiveUrl('main'),'https://github.com/EMN90909/Noqeri/archive/refs/heads/main.tar.gz')
assert.throws(()=>sourceArchiveUrl('../bad'))
const sh=shellInstaller('https://noqeri.example')
assert.match(sh,/curl -fL/)
assert.match(sh,/NOQERI_HOME/)
assert.match(sh,/SELF_HOSTING\.md/)
const ps=powershellInstaller('https://noqeri.example')
assert.match(ps,/Invoke-WebRequest/)
assert.match(ps,/NOQERI_REF/)
assert.match(ps,/SELF_HOSTING\.md/)
const info=sourceInfo('https://noqeri.example')
assert.equal(info.install.posix,'https://noqeri.example/get/noqeri')
console.log('source installer tests passed')
