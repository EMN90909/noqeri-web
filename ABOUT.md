# About Noqeri

Noqeri is a compact, statically typed general-purpose language designed to keep systems capability explicit without making ordinary application code ceremonial.

The project separates language semantics from execution environment. Native targets, host services, package registries, browser modules and server adapters are explicit boundaries rather than hidden assumptions in the language core.

## Design principles

- Familiar syntax, strict static typing.
- Safe integer widening can be implicit; narrowing and signedness changes are explicit.
- `[T; N]` is owned fixed storage; `[]T` is a borrowed span with lifetime checks.
- Raw pointers, volatile memory, atomics, intrinsics and inline assembly are visible capabilities.
- Constrained generic functions are monomorphized per concrete type binding.
- `Option<T>` and `Result<T,E>` provide typed absence and failure at the application layer.
- Low-level integer status propagation remains available where ABI simplicity matters.
- Native and web backends consume the same checked program model.
- Package locks are content-addressed with SHA-256 identities.

The public website lives in this repository. Compiler source lives at https://github.com/EMN90909/Noqeri and the official package source/registry lives at https://github.com/EMN90909/noqeri-registry.

Made by Noethic.
