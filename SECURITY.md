# Security policy

The Noqeri website is part of the distribution boundary: it serves source-install instructions, registry metadata/package archives, generated Noqeri web modules and documentation. Treat path parsing, package coordinates, generated modules, HTTP headers and install-script parameters as untrusted input.

Do not publish exploit details in a public issue before maintainers can triage a credible vulnerability. Use the security contact published by the Noqeri project and coordinate a disclosure date when practical.

For website changes touching request parsing or downloads, run at minimum:

```sh
npm run quality
npm run repro
```

`npm run quality` builds the site, runs smoke/source-install tests and exercises malformed HTTP/path/header inputs. This is defense-in-depth, not a claim of an external security audit.

Release-facing pages must not state that Noqeri is faster than Rust, Zig, C, C++, Go, or another language unless the linked benchmark result contains the reproducible methodology and raw evidence supporting that exact claim.
