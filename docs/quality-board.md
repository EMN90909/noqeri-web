# Noqeri Quality Board

The Noqeri website must describe the language at the level that the compiler and test suite can actually prove.

## Board

The ecosystem uses six review seats for language-facing releases:

1. **Planning** — scans compiler/library gaps, checks external language/tooling practice and proposes priorities.
2. **Kid tester** — tries to learn the feature from its name, first example and error messages without relying on compiler-internals knowledge.
3. **Design** — reviews syntax, naming, diagnostics and documentation hierarchy.
4. **Development** — implements semantics and library behaviour.
5. **Testing** — validates success paths, failures, safety, targets and benchmarks.
6. **Marketing** — turns only verified results into public claims.

A feature can be technically clever and still lose the vote when the normal path is difficult to teach.

## September 2026 vote

The board approved these principles:

- ordinary arrays and slices use ordinary indexing syntax and remain checked;
- runtime bounds/null checks are explicit compiler IR operations rather than hidden backend accidents;
- checked integer-overflow execution is an opt-in diagnostic mode while default integer execution remains defined;
- operations that bypass ordinary memory guarantees require explicit `unsafe { ... }` boundaries;
- aggregate/field-sensitive and interprocedural lifetime analysis is part of the compiler safety model and must be regression-tested before stronger public claims are made;
- standard-library maturity is measured by coherent APIs, tests and examples, not by artificially forcing each source file over a byte threshold;
- performance claims require reproducible benchmark metadata and an explicit evidence state.

## What is implemented now

The reference execution pipeline has explicit `CheckBounds` and `CheckNonNull` NIR operations. Slice/fixed-bound indexing and raw dereference paths lower through these checks. The reference interpreter supports `NOQERI_CHECKED_OVERFLOW=1` for trapping integer overflow.

The safety checker enforces explicit `unsafe { ... }` boundaries for raw-pointer operations. The lifetime pass contains aggregate field-path tracking and interprocedural function summaries; these are implementation facts, not a claim that every possible borrow pattern across every backend is already proven complete.

The first foundational-structure tranche replaces placeholder-shaped modules with real caller-owned abstractions:

- `std/bitset` — indexed bit mutation, scans, ranges, rank/select, set algebra, shifts and byte import/export;
- `std/bloom` — configurable Bloom filter with byte/u64 insertion/query, saturation/copy helpers and deterministic hashing;
- `std/deque` — generic fixed-capacity ring deque with front/back operations, rotations, removal and copying;
- `std/heap` — generic min/max binary heap with build, push/pop, update/remove and validation;
- `std/priority_queue` — stable generic priority queue with deterministic equal-priority ordering and priority updates.

Behavioral import tests live with the compiler test suite. Their presence is evidence that the feature has a test contract; a release should only say `verified` after those tests have actually been executed for that release configuration.

## What is not yet a public claim

Do not describe the project as having “full Rust-class borrow safety”, “zero-cost checks”, “all standard-library modules mature”, or complete safety across every backend until the corresponding release gates pass.

Do not turn source size into a marketing metric. A 30 KB file can still be filler; a smaller module can be complete for a narrow domain. The public claim is capability + tests + compatibility + measured evidence, not line count.

## Evidence states

Website feature/performance cards use these states:

- `planned` — accepted direction, no implementation claim;
- `implemented` — source implementation exists and is reviewable;
- `test-contract` — executable positive/negative tests exist but no result bundle is attached for the current release environment;
- `verified` — the relevant test suite passed for the stated commit/backend/target/mode;
- `measured` — benchmark samples and environment metadata are published;
- `regression-gated` — a comparable baseline and threshold are automatically enforced.

Never promote `implemented` or `test-contract` to `verified` simply because a source file or test fixture exists.

## Evidence cards for the website

When the site presents a safety or performance card it should include:

- feature or benchmark name;
- commit SHA;
- backend (`interpreter`, `native`, `web`);
- target OS/architecture;
- safety/overflow mode;
- input/sample count;
- measured median and tail statistic for performance, when measured;
- link to the exact benchmark/test source;
- status from the evidence-state list above.

The status label prevents roadmap work, implementation work and measured guarantees from visually blending together.

## Kid-tester review: what still feels hard

The beginner seat reviewed the current low-level collection direction as if learning Noqeri for the first time. The major friction points are:

1. **Storage ownership appears too early.** A learner asking for a deque first meets backing pointers/capacity. Keep caller-owned storage for systems users, but documentation should show a small safe recipe before explaining representation.
2. **`Copy`, `Eq` and `Ord` are useful but unexplained at first sight.** Getting-started examples should name what each constraint means in one sentence and defer monomorphisation details.
3. **Boolean failure is simple but sometimes mysterious.** `false` is good for low-level/freestanding code, while beginner/application docs need a path toward descriptive `Result`-style errors for operations where the reason matters.
4. **Safety modes are hard to discover by environment variable alone.** Docs/CLI help should give one memorable checked-development recipe and explain production trade-offs.
5. **Advanced words arrive before the mental model.** Terms such as borrow, aggregate, ABI and monomorphisation belong after examples that first answer “what value do I have, what can I do to it, what mistake is prevented?”
6. **Placeholder modules trained the wrong expectation.** Four identical helpers named after unrelated domains made modules look complete when they were not. Public docs should distinguish `experimental`, `preview`, `stable` and `core` clearly.

## Design vote for teachability

Normal APIs should prefer short verbs (`push`, `pop`, `set`, `get`, `clear`) and predictable failure semantics. Advanced variants can expose storage, pointer and performance controls, but should not be the first thing a beginner must understand.

A teaching example should fit this order:

1. create a value;
2. perform one obvious operation;
3. read the result;
4. show one safe failure;
5. only then explain capacity, storage layout, unsafe escape hatches or compiler internals.

## Marketing vote

Market the evidence, not aspiration. Useful claims include “dynamic indexing is checked in the reference execution pipeline” or “this release contains behavioral tests for the foundational structures.” Avoid “memory-safe everywhere”, “zero-cost”, “30 KB modules”, “faster than Rust/Zig/C++”, or similar statements unless a release-specific evidence bundle supports them.

## Testing vote

A foundational feature is not done when its source gets longer. The acceptance sequence is:

`implementation -> imported behavior tests -> failure tests -> safety-mode tests -> target compatibility -> benchmark fixture -> measured release evidence`

The repository may move through these stages incrementally; the website must show the actual stage.

## Teachability test

Before publishing a language example, ask a new learner to answer:

- What value is being created?
- What operation happens next?
- What mistake is the example protecting me from?
- What does the error tell me to change?
- Can I edit one value and predict what happens?

If those questions require explaining NIR, borrow-analysis internals or ABI machinery first, the example belongs in advanced documentation rather than the main getting-started path.
