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
    s('Browser + terminal','The Packages page exposes a direct download button plus shell-specific commands for each published release.'),
    s('Linux + macOS','Use `curl -fL` to follow the registry route and fail on HTTP errors.'),
    s('Windows','PowerShell uses `Invoke-WebRequest` with an explicit output filename.'),
    s('Scope','These are download commands. They are deliberately not documented as a package-manager install command until the CLI has a complete fetch/install workflow.')
  ],'curl -fL "https://noqeri.onrender.com/registry/noqeri/json/1.0.0/download.nqpkg" -o "noqeri-json-1.0.0.nqpkg"\n\nInvoke-WebRequest -Uri "https://noqeri.onrender.com/registry/noqeri/json/1.0.0/download.nqpkg" -OutFile "noqeri-json-1.0.0.nqpkg"'),
  d('license','Release + distribution','License','Noqeri source, registry and official website are distributed under GNU GPL v3 only.',[
    s('Identifier','The project license identifier is `GPL-3.0-only`.'),
    s('Project identity','The software license covers code rights; Noqeri/Noethric names and branding remain separate project identity/trademark concerns.'),
    s('Source','Each repository includes its license notice and points to the complete GNU GPL v3 terms published by the Free Software Foundation.')
  ],'', 'Made by Noethric — https://noethric.xyz')
]
