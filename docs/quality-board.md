# Noqeri Quality Board

The Noqeri website must describe the language at the level that the compiler and test suite can actually prove.

## Board

The ecosystem uses six review seats for language-facing releases:

1. **Planning** — scans compiler/library gaps and proposes priorities.
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
- raw operations should move behind explicit `unsafe { ... }` boundaries once parser enforcement and internal migration can land together;
- standard-library maturity is measured by coherent APIs, tests and examples, not by artificially forcing each source file over a byte threshold;
- performance claims require reproducible benchmark metadata.

## What is implemented now

The reference execution pipeline has explicit `CheckBounds` and `CheckNonNull` NIR operations. Slice/fixed-bound indexing and raw dereference paths lower through these checks. The reference interpreter supports `NOQERI_CHECKED_OVERFLOW=1` for trapping integer overflow.

`std/ascii`, `std/arena` and `std/backoff` were the first placeholder-sized modules expanded in this tranche into cohesive APIs rather than aliases added for line count.

## What is not yet a public claim

Do not describe the project as having “full Rust-class borrow safety”, “zero-cost checks”, or complete safety across every backend until the corresponding release gate passes. Explicit unsafe blocks and full aggregate/interprocedural borrow summaries are approved work, but they should be called complete only after compiler enforcement and tests land.

## Evidence cards for the website

When the site presents a safety or performance card it should include:

- feature or benchmark name;
- commit SHA;
- backend (`interpreter`, `native`, `web`);
- target OS/architecture;
- safety mode;
- input/sample count;
- measured median and tail statistic for performance;
- link to the exact benchmark/test source;
- status: `implemented`, `verified`, or `planned`.

The status label is important. It prevents roadmap work from visually blending into shipped guarantees.

## Teachability test

Before publishing a language example, ask a new learner to answer:

- What value is being created?
- What operation happens next?
- What mistake is the example protecting me from?
- What does the error tell me to change?
- Can I edit one value and predict what happens?

If those questions require explaining NIR, borrow-analysis internals or ABI machinery first, the example belongs in advanced documentation rather than the main getting-started path.
