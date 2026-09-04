---
type: reference
updated: 2026-09-03
sources: [S001, S003]
---

# Electron runtime facts

Verified by running the project's own Electron binary rather than read from
documentation (S001).

Electron 40.0.0 bundles Node 24.11.1, Chrome 144, and V8 14.4 (S001).
`package.json` pins Electron exactly, with no caret, so the Node inside it
moves only when someone deliberately upgrades (S003).

`node:sqlite` resolves inside that runtime (S001). It prints
`ExperimentalWarning: SQLite is an experimental feature and might change at any
time`, so its API can move under a Node upgrade, and Node upgrades arrive with
Electron upgrades rather than on this project's schedule (S001).

## Verified in the packaged build

The open question from the first ingest is answered. A probe compiled into the
packaged, fused binary opened an in-memory database and answered a query:
`{"node":"24.11.1","electron":"40.0.0","sqliteVersion":"3.50.4","packaged":true}`
(S003). The fuses were read back from that binary before the run, RunAsNode
disabled among them, so the evidence can only have come from inside the packaged
main process — the development-mode probing route is closed there, see
[[reference-packaging-fuses]] (S003).

SQLite 3.50.4 ships inside this Electron (S003).

**Still unexercised:** Windows and macOS, in any mode; and whether more than one
application instance may open the catalogue at once (S003).

This fact base is what makes [[decision-catalogue-database]] hold without a
native module.
