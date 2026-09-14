# Noqeri Quality Board

The website must describe Noqeri at the level the compiler, libraries and tests can actually prove. Source size, filenames and benchmark fixtures are not substitutes for behavior.

## Board roles

1. **Planning** — find language/library gaps and choose leverage rather than cosmetic breadth.
2. **Kid tester** — judge whether the first example and error make sense without compiler-internals knowledge.
3. **Design** — own syntax, naming, diagnostics and the safe/advanced boundary.
4. **Development** — implement compiler semantics and real library behavior.
5. **Testing** — own positive, negative, safety, portability and performance evidence.
6. **Marketing** — publish only claims supported by the current evidence state.

## September 2026 design rules

- ordinary application syntax stays small;
- advanced systems features remain available but are not prerequisites for beginner work;
- dynamic safe indexing stays checked;
- raw operations that bypass normal guarantees require explicit `unsafe { ... }` boundaries;
- runtime bounds/null behavior is represented explicitly in compiler IR;
- stdlib/package maturity means coherent state/algorithms + tests + examples, not a 30 KB quota;
- performance claims require reproducible samples and environment metadata;
- a small syntax feature is acceptable when it removes frequent ceremony and desugars to the existing core rather than creating a parallel semantic model.

## Language simplicity: `repeat`

The beginner-facing counted loop is now:

```nqr
let total = 0
repeat 4 {
    total = total + 3
}
```

Use `repeat` when the count is the idea; use `while` when a condition is the idea. The parser evaluates the count once, converts it to the ordinary `int` loop count, creates compiler-private index/limit bindings and lowers the construct to the existing `while` AST. Zero/negative counts execute zero times. There is no `repeat` NIR instruction or separate runtime.

This retains all existing systems/control-flow capability while making the most common beginner counted-loop task require less ceremony.

### Local evidence for `repeat`

The modified C++ lexer/parser was reconstructed in the local execution environment, compiled with `g++ -std=c++17 -Wall -Wextra -Wpedantic`, and the focused executable was run locally. It verified keyword lexing plus AST desugaring for positive and negative counts. This is **local frontend verification**.

`tests/repeat_loop.nqr` is also checked in and wired into `scripts/test_maturity.sh`. Because the environment cannot obtain a normal full repository checkout from `github.com`, the full Noqeri compiler/runtime maturity suite has not been executed here. The runtime fixture therefore remains a **test contract** until a complete local release build runs it.

## Safety implementation

The reference pipeline contains explicit bounds and non-null checks. The safety gate separately covers:

- dynamic fixed-array/slice out-of-bounds runtime failure;
- null raw-pointer access failure;
- raw pointer indexing rejected outside `unsafe`;
- checked integer-overflow mode;
- aggregate field borrow escape;
- interprocedural borrow escape;
- checked indexing in the web backend.

The lifetime pass includes aggregate field-path tracking and interprocedural summaries. This supports strong concrete safety statements, but it is still not a license to claim complete Rust-equivalent safety across every aliasing pattern/backend.

## Real standard-library tranches

### Structures

- `std/bitset` — bit mutation/scans/ranges/rank/select/set algebra/shifts/import/export;
- `std/bloom` — configurable Bloom filter with deterministic hashing and saturation/copy helpers;
- `std/deque` — generic fixed-capacity ring deque;
- `std/heap` — generic min/max binary heap;
- `std/priority_queue` — stable generic priority queue;
- `std/ring` — circular overwrite/non-overwrite storage;
- `std/pool` — caller-owned reusable slots with generation-safe handles;
- `std/cache` — fixed-capacity LRU behavior.

### Time

- `std/duration` — elapsed amounts, normalization/arithmetic/conversion/rounding;
- `std/calendar` — Gregorian civil dates, weekdays, business days, date/month/year movement;
- `std/clock` — time-of-day arithmetic and wraparound.

Mental model: **duration = how long; calendar = which date; clock = what time of day.**

### Data integrity + interchange

- `std/crc` — CRC32, CRC32C, CRC16-CCITT, CRC8 and incremental state;
- `std/hash` — deterministic non-cryptographic FNV/DJB2/SDBM/polynomial families;
- `std/endian` — bounded fixed-width byte-order codecs/cursors;
- `std/varint` — base-128 integers, canonical checks and ZigZag signed mapping;
- `std/encoding` — ASCII/UTF-8/UTF-16 detection/validation/transcoding.

`std/hash` is explicitly non-cryptographic.

### State, traversal and parsing foundations

The former placeholder-shaped modules are now distinct abstractions instead of copies of four generic helpers:

- `std/channel` — bounded non-blocking mailbox;
- `std/event` — manual/auto-reset signal with generation/counters;
- `std/future<T>` — pending/ready/failed/cancelled completion value;
- `std/iterator<T>` — bidirectional cursor over caller-owned contiguous storage;
- `std/metrics` — counter, gauge, running stats and histogram;
- `std/numeric` — aggregate/integer helpers, GCD/LCM/power/search/prefix/difference/checked arithmetic;
- `std/lexer` — allocation-free span tokenizer with identifiers/numbers/strings/comments/punctuation;
- `std/parser` — grammar-neutral token cursor, checkpoints/recovery and primitive literal parsing.

`tests/stdlib_foundations2.nqr` exercises multi-operation behavior across these modules and is part of the maturity gate.

## Registry packages deepened

Three portable packages were upgraded from tiny validation surfaces to useful codecs/parsers:

- `noqeri/base64` — standard Base64 and Base64URL encoding/decoding, padded/unpadded URL output, validation and sizing;
- `noqeri/hex` — byte encode/decode plus `u64` parse/format helpers;
- `noqeri/csv` — quoted-field scanning, custom delimiters, escape/unescape and row composition without hidden allocation.

Each package now has a real example, round-trip/malformed-input tests and README documentation matching the implementation. They should not be called release-verified until those tests execute with the named release compiler/target.

## Standard-library/package auditors

`Noqeri/scripts/stdlib-audit.mjs` reports bytes, nonblank code lines, exports, records/private helpers, control-flow signals and a maturity tier (`placeholder`, `developing`, `substantial`). `--strict` can fail on remaining placeholder-shaped modules.

`noqeri-registry/tools/package-depth-audit.mjs` performs the analogous registry scan. These tools make shallow debt visible without turning byte count into a target that rewards filler.

## Evidence states

- `planned` — accepted direction, no implementation claim;
- `implemented` — reviewable source exists;
- `test-contract` — executable positive/negative tests exist but no release result bundle is attached;
- `verified` — named tests passed for a stated commit/backend/target/mode;
- `measured` — raw benchmark samples + environment metadata are published;
- `regression-gated` — a comparable baseline and automatic threshold are enforced.

Never promote `implemented` or `test-contract` to `verified` because a file exists.

### Current evidence summary

| Area | State | Meaning |
|---|---|---|
| `repeat` lexer/parser/desugaring | locally frontend-verified | focused C++ frontend build/run passed |
| `repeat` Noqeri runtime fixture | test-contract | wired into maturity gate; full local compiler suite not run in this environment |
| new stdlib modules | implemented + test-contract | substantive APIs and imported behavior tests exist |
| Base64/Hex/CSV registry packages | implemented + test-contract | real codecs/parsers/examples/tests exist |
| foundational/storage benchmark fixtures | unmeasured | workload exists; no performance claim |
| universal safety/performance superiority | not established | requires broader release evidence |

## What must not be marketed yet

Do not claim “full Rust-class borrow safety”, “memory-safe on every backend”, “zero-cost checks”, “all stdlib modules mature”, “every module is 30 KB”, or “faster than C/C++/Rust/Zig/Go” without the corresponding named release evidence.

A 30 KB file can be filler. A smaller complete algorithm can be mature. Capability + failure behavior + tests + compatibility + measured evidence is the product claim.

## Beginner/teachability rule

Teach in this order:

1. create a value;
2. do one obvious operation;
3. read the result;
4. show one safe mistake;
5. then explain storage/capacity/unsafe/compiler internals.

The first course sequence is now: print → variables → decisions → `repeat` → `while` → functions → records → collections → files/data formats → HTTP → database → concurrency. Pointers, `unsafe`, atomics, FFI, native layout and assembly remain available in the advanced track.

When comparing ease-of-learning with Go/Python/Lua/JavaScript, publish task-based usability evidence rather than claiming the ranking from aesthetics alone.
