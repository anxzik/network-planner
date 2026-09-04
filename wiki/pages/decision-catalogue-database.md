---
type: decision
updated: 2026-09-03
sources: [S001, S002, S003]
---

# Catalogue storage: node:sqlite

The hardware catalogue is held in SQLite through `node:sqlite`, used from the
Electron main process (S001).

## Why

Every other SQLite option for Electron is a native module, which means a
rebuild step in the toolchain, a compiled binary per platform in packaging, and
a rebuild whenever the Electron version moves (S001). This project ships four
packaging targets, so each would carry that weight (S001). A built-in module
has none of it, and [[reference-electron-runtime]] confirms it is present.

## Rejected

- **better-sqlite3**: mature and pleasant to use, rejected for the native build
  chain across four targets (S001).
- **A JSON file**: rewrites the whole catalogue per edit and gives no
  protection against a partial write (S001).
- **sql.js**, SQLite compiled to WebAssembly: no native build, but holds the
  database in memory and must be serialised out by hand, which reintroduces the
  whole-file rewrite (S001).

## Where the database lives

In the per-user data directory, as `catalogue.db`, outside the packaged
application archive - the asar is read-only and integrity-checked, so this was
a correctness question rather than a preference, settled before storage code
was written (S003). See [[reference-packaging-fuses]].

## The cost carried

The module is experimental. Confining every call to a single storage module
keeps a breaking change to one file (S001), which is the reasoning recorded in
[[decision-pure-logic-split]].

The fallback is costlier than it looks: switching to a native module such as
better-sqlite3 also requires wiring the auto-unpack-natives plugin into the
forge configuration, which is present in package.json but unwired (S003).

Open: whether two application instances may open the catalogue at once. SQLite's
behaviour differs by platform and filesystem, and nothing specifies it (S003).
