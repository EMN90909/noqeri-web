const s=(title,paragraphs,points=[])=>({title,paragraphs:Array.isArray(paragraphs)?paragraphs:[paragraphs],points})
const d=(slug,group,title,summary,sections,code='',note='')=>({slug,group,title,summary,sections,code,note})

export const addedDocGroups=['Release + distribution']
export const addedDocs=[
  d('string-literals','Language','String literals + escapes','Use decoded string escapes consistently in the interpreter, imports and generated .nqo output.',[
    s('Escapes','Noqeri 1.0 decodes `\\\\`, `\\"`, `\\n`, `\\r`, `\\t` and `\\0` in the language frontend before interpretation or target code generation.'),
    s('Why this matters','The parser owns literal semantics. A JSON string written in Noqeri therefore reaches a web host as actual JSON rather than a string containing literal backslashes.')
  ],'export function health(): string {\n  return "{\\"status\\":\\"ok\\"}"\n}'),
  d('database-verification','Data + NoqeriDB','Database verification','Understand what the release test suite actually proves about the current embedded database.',[
    s('Release gate','Compiler CI creates a fresh `.nqdb`, declares a typed table, inserts rows, updates a row, selects by a predicate, then opens the same database from a second `.nqd` script.'),
    s('Constraint gate','The release test also attempts a duplicate primary/key value and requires the command to fail.'),
    s('Still not claimed','These checks establish current CRUD/persistence/constraint behavior. They do not establish WAL durability, concurrent transaction isolation, index performance or SQLite parity.')
  ],'noqeri db app.nqd data/app.nqdb'),
  d('package-downloads','Release + distribution','Package downloads','Download an exact deterministic `.nqpkg` from the public website on Linux, macOS or Windows.',[
    s('Browser + terminal','The Packages and Registry pages read the live index, choose the highest non-withdrawn release, and expose direct archive links. Withdrawn versions must return HTTP 404.'),
    s('Linux + macOS','Use `curl -fL` to follow the registry route and fail on HTTP errors.'),
    s('Windows','PowerShell uses `Invoke-WebRequest` with an explicit output filename.'),
    s('Scope','The CLI also supports `noqeri add namespace/name@version` for project dependency resolution, cache integrity checks and lockfiles. A `.nqpkg` archive downloaded by hand is not installed automatically.')
  ],'curl -fL "https://noqeri.onrender.com/registry/noqeri/json/0.4.0/download.nqpkg" -o "noqeri-json-0.4.0.nqpkg"\n\nInvoke-WebRequest -Uri "https://noqeri.onrender.com/registry/noqeri/json/0.4.0/download.nqpkg" -OutFile "noqeri-json-0.4.0.nqpkg"'),
  d('license','Release + distribution','License','Noqeri source, registry and official website are distributed under GNU GPL v3 only.',[
    s('Identifier','The project license identifier is `GPL-3.0-only`.'),
    s('Project identity','The software license covers code rights; Noqeri/Noethric names and branding remain separate project identity/trademark concerns.'),
    s('Source','Each repository includes its license notice and points to the complete GNU GPL v3 terms published by the Free Software Foundation.')
  ],'', 'Made by Noethric — https://noethric.xyz')
]

addedDocGroups.push('NoeSQL engine')
addedDocs.push(
  d('noesql-engine','NoeSQL engine','NoeSQL: Noqeri + Zig','Architecture, compatibility and why the native migration is gated.',[
    s('Noqeri is the language layer','NoeSQL uses Noqeri (.nqr) modules for lexing, typed IR, policy and execution. The compiled native query callback is not yet wired into the production CLI.'),
    s('Zig is the native bridge','The Zig 0.15.2 bridge validates the versioned callback ABI and buffer safety. The experimental native page store is still C++ and cannot be removed safely until Zig achieves the same WAL, recovery and authentication behavior.'),
    s('Keep formats distinct','Native .nqd pages, reference .nqd snapshots and the SQLite-backed embedded adapter are not interchangeable. Back up existing data before experimenting with a new backend.'),
    s('Release state','NoeSQL 0.7.5-rc.2 is experimental. The compiler bootstrap, integrated Noqeri/Zig runtime, native database conformance and storage fault gates remain blockers.')
  ],'cd Native/zig\nzig build test\nzig build -Doptimize=ReleaseSafe\n\n# from the NoeSQL repository root\nnpm run qualify:zig',
  'The NoeSQL GitHub repository is currently private. A public NoeSQL package has not been published to the registry. The website does not claim a public binary download for it.'),
  d('noesql-embedded','NoeSQL engine','NoeSQL embedded storage','Use the experimental SQLite adapter in Node.js apps without claiming a production native engine.',[
    s('Local Node.js adapter','In a checked-out NoeSQL workspace running compatible Node.js, the optional runtime exports openNoeSQLEmbedded. The file path must refer to local persistent storage.'),
    s('Database credentials','Keep database paths, principals and service credentials server-side. Never package database service keys in browser JavaScript.'),
    s('Verification','Run NoeSQL npm tests and test:embedded locally. SQLite interoperation results are not performance or durability proof for the unintegrated Zig native database.')
  ],'import {openNoeSQLEmbedded} from "./Runtime/noesql-embedded.mjs"\n\nconst db = await openNoeSQLEmbedded({file:"./app.sqlite"})\ntry {\n  console.log(db.query("from users\\nselect id, name\\nwhere id == $id", {id: 1}))\n} finally {\n  db.close()\n}',
  'This API is experimental and requires a local copy of NoeSQL. See the NoeSQL repository Doc/NOESQL_EMBEDDED_WEB.md for its supported dialect and constraints.')
)
