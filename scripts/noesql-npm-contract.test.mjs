import test from 'node:test'
import assert from 'node:assert/strict'
import {readFileSync} from 'node:fs'
const read=p=>readFileSync(new URL('../'+p,import.meta.url),'utf8')
test('NoeSQL npm section is clearly unverified, not a fake published archive',()=>{
  for(const file of ['src/pages/Packages.jsx','src/pages/Install.jsx']){
    const source=read(file)
    assert.match(source,/npm install noesql@0\.7\.6/)
    assert.match(source,/not (yet )?verified/)
    assert.match(source,/NoeSQL/)
  }
  assert.match(read('README.md'),/future publication command/)
})
