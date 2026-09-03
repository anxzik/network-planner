---
type: reference
updated: 2026-09-02
sources: [S001]
---

# Electron runtime facts

Verified by running the project's own Electron binary rather than read from
documentation (S001).

Electron 40.0.0 bundles Node 24.11.1, Chrome 144, and V8 14.4 (S001).

`node:sqlite` resolves inside that runtime (S001). It prints
`ExperimentalWarning: SQLite is an experimental feature and might change at any
time`, so its API can move under a Node upgrade, and Node upgrades arrive with
Electron upgrades rather than on this project's schedule (S001).

This fact is what makes [[decision-catalogue-database]] possible without a
native module.

## Why it is worth re-checking

The availability was confirmed under `npm start`. Whether it holds in a
packaged build is a separate question, because the development runtime is not
the shipped one (S002).
