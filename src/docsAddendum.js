const s=(title,paragraphs,points=[])=>({title,paragraphs:Array.isArray(paragraphs)?paragraphs:[paragraphs],points})
const d=(slug,group,title,summary,sections,code='',note='')=>({slug,group,title,summary,sections,code,note})

export const addedDocGroups=['Release + distribution','Quality + evidence']
export const addedDocs=[
  d('string-literals','Language','String literals + escapes','Use decoded string escapes consistently in the interpreter, imports and generated .nqo output.',[
    s('Escapes','Noqeri 1.0 decodes `\\\\`, `\\"`, `\\n`, `\\r`, `\\t` and `\\0` in the language frontend before interpretation or target code generation.'),
    s('Why this matters','The parser owns literal semantics. A JSON string written in Noqeri therefore reaches a web host as actual JSON rather than a string containing literal backslashes.')
  ],'export function health(): string {\n  return "{\\"status\\":\\"ok\\"}"\n}'),
  d('database-verification','Data + NoqeriDB','Database verification','Understand what the release test suite actually proves about the current embedded database.',[
    s('Release gate','Compiler verification creates a fresh `.nqdb`, declares a typed table, inserts rows, updates a row, selects by a predicate, then opens the same database from a second `.nqd` script.'),
    s('Constraint gate','The release test also attempts a duplicate primary/key value and requires the command to fail.'),
    s('Still not claimed','These checks establish current CRUD/persistence/constraint behavior. They do not establish WAL durability, concurrent transaction isolation, index performance or SQLite parity.')
  ],'noqeri db app.nqd data/app.nqdb'),
  d('package-downloads','Release + distribution','Package downloads','Download an exact deterministic `.nqpkg` from the public website on Linux, macOS or Windows.',[
    s('Browser + terminal','The Packages page exposes a direct download button plus shell-specific commands for each published release.'),
    s('Linux + macOS','Use `curl -fL` to follow the registry route and fail on HTTP errors.'),
    s('Windows','PowerShell uses `Invoke-WebRequest` with an explicit output filename.'),
    s('Scope','These are download commands. They are deliberately not documented as a complete package-manager install command unless the CLI path has matching install/integrity evidence.')
  ],'curl -fL "https://noqeri.onrender.com/registry/noqeri/json/1.0.0/download.nqpkg" -o "noqeri-json-1.0.0.nqpkg"\n\nInvoke-WebRequest -Uri "https://noqeri.onrender.com/registry/noqeri/json/1.0.0/download.nqpkg" -OutFile "noqeri-json-1.0.0.nqpkg"'),
  d('license','Release + distribution','License','Noqeri source, registry and official website are distributed under GNU GPL v3 only.',[
    s('Identifier','The project license identifier is `GPL-3.0-only`.'),
    s('Project identity','The software license covers code rights; Noqeri/Noethric names and branding remain separate project identity/trademark concerns.'),
    s('Source','Each repository includes its license notice and points to the complete GNU GPL v3 terms published by the Free Software Foundation.')
  ],'', 'Made by Noethric — https://noethric.xyz'),
  d('safety-modes','Quality + evidence','Safety diagnostic modes','Keep ordinary Noqeri simple while making expensive diagnostics explicit and repeatable.',[
    s('Memory','`run --check-memory` is backed by an AddressSanitizer/UBSan-instrumented host build. It is a diagnostic mode, not a different language semantics mode.'),
    s('Races','`test --race` uses a ThreadSanitizer-instrumented runtime/host build to surface data races reachable through the current implementation. A future Noqeri-native race detector may add language-aware task/source diagnostics; the current mode must not be described as that future detector.'),
    s('Overflow','`test --overflow` enables checked integer execution so arithmetic overflow becomes a failing diagnostic instead of wrapped execution where wrapping is otherwise defined.'),
    s('Safe-language boundary','Dynamic safe indexing and null-sensitive raw accesses have explicit NIR checks; raw-pointer operations that bypass normal guarantees require an explicit `unsafe { ... }` boundary. These are implementation facts, not a universal all-backend safety claim.')
  ],'node Runtime/noqeri-quality.mjs run --check-memory app.nqr\nnode Runtime/noqeri-quality.mjs test --race tests\nnode Runtime/noqeri-quality.mjs test --overflow tests'),
  d('performance-evidence','Quality + evidence','Performance evidence','Measure first; compare second; market last.',[
    s('Suite','The maintained benchmark plan covers binary trees, JSON, regex, HTTP, filesystem, database, matrix operations, allocation, strings, sorting, startup, compilation and foundational structures.'),
    s('Comparators','Comparative implementations target C, C++, Rust, Zig and Go using equivalent work and validated outputs.'),
    s('Claim rule','A broad statement such as “faster than Rust/Zig” is not acceptable without a checked-in result bundle containing versions, flags, hardware/OS metadata, raw samples and the published methodology.'),
    s('Unmeasured is useful','A benchmark fixture may exist before measurements do. It must stay labelled `unmeasured` until samples and machine metadata are attached; source presence is not a speed result.'),
    s('Regression rule','Important workloads have explicit percentage thresholds. A same-host candidate crossing its threshold fails performance validation.')
  ]),
  d('evidence-states','Quality + evidence','Evidence states','Separate source implementation, executable tests and measured results so users can see exactly what has been proved.',[
    s('planned','Accepted direction with no implementation claim.'),
    s('implemented','Reviewable source exists. This does not mean the current release target has executed it successfully.'),
    s('test-contract','Positive or negative executable tests exist and are wired into the project gate, but no result bundle is attached for the stated environment.'),
    s('verified','The named test suite passed for a stated commit, backend, target and safety mode.'),
    s('measured','Performance samples include raw data and environment metadata.'),
    s('regression-gated','A comparable baseline and threshold are enforced automatically.')
  ],'', 'Never promote implemented/test-contract to verified merely because a source file or test fixture exists.'),
  d('stdlib-maturity','Quality + evidence','Standard-library maturity','Track real module depth without rewarding filler, comments or alias farms.',[
    s('Three tiers','The repository auditor classifies modules as `placeholder`, `developing` or `substantial` from code/API structure rather than filename presence.'),
    s('What is counted','The report includes bytes, nonblank code lines, exported functions, records/private helpers and control-flow surface.'),
    s('30 KiB request','The 30 KiB target is displayed for transparency because it is a project goal, but it is not sufficient evidence of maturity. A narrow complete algorithm can be smaller; a padded 30 KiB file can still be a placeholder.'),
    s('Current teaching split','`duration` now means elapsed amount, `calendar` means civil date, and `clock` means time of day. `crc` provides actual CRC algorithms while `hash` provides explicitly non-cryptographic deterministic hashes.'),
    s('Gate','Use `--strict` when you want remaining placeholder-shaped std modules to make the audit fail.')
  ],'node scripts/stdlib-audit.mjs\nnode scripts/stdlib-audit.mjs --json\nnode scripts/stdlib-audit.mjs --strict'),
  d('package-quality-levels','Quality + evidence','Package quality levels','Know what a package label promises before depending on it.',[
    s('experimental','Exploration. APIs may change and production compatibility is not promised.'),
    s('preview','Meaningful implementation, tests, examples and documented failures; suitable for real evaluation.'),
    s('stable','Production-oriented compatibility, negative tests, security/performance evidence where relevant, and deprecation discipline. Provider stubs cannot be stable.'),
    s('core','Stable plus a deliberately higher compatibility, security, migration, offline-build and maintenance burden.')
  ]),
  d('beginner-path','Quality + evidence','Beginner path','Power stays opt-in; ordinary programs stay boring and predictable.',[
    s('Core sequence','Learn print, variables, decisions, loops, functions, records, collections, files, JSON, HTTP, database and concurrency in that order.'),
    s('Advanced later','Pointers, explicit unsafe blocks, atomics, FFI, native layouts and assembly belong after the application track.'),
    s('Usability is measured','Time-to-first-program and time-to-first-real-app should be studied against Python, Go, Lua and JavaScript with a published protocol rather than asserted from syntax alone.'),
    s('Kid-test rule','A first example should answer: what value did I create, what obvious operation happened, what mistake is prevented, and can I change one value and predict the result?'),
    s('Complexity budget','If a proposed feature can be a library, prefer the library. Do not add multiple spellings for the same idea merely because another language has them.')
  ])
]
