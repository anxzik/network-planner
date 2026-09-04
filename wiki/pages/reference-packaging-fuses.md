---
type: reference
updated: 2026-09-03
sources: [S003]
---

# Packaging fuses and what they constrain

The packaged application carries Electron fuses set in the forge configuration,
and several of them quietly constrain architecture rather than only hardening
security (S003).

**RunAsNode is disabled.** The binary cannot run as a plain Node process, so
`ELECTRON_RUN_AS_NODE` probing works only against the development binary. Any
verification of the packaged main process has to observe it from inside, which
is exactly how the storage module was eventually verified (S003). See
[[reference-electron-runtime]].

**The asar archive is read-only and integrity-checked.** `OnlyLoadAppFromAsar`
and embedded integrity validation are both on, so nothing writable can live in
the packaged application directory. This is why the catalogue database sits in
the per-user data directory (S003). See [[decision-catalogue-database]].

**`NODE_OPTIONS` is disabled.** If a future Node ever gated a built-in module
behind a flag, that route into the packaged app is already closed (S003).

**A trap for later:** the auto-unpack-natives packaging plugin is present in
`package.json` but not wired into the forge plugins array, so adopting a native
module is a packaging-configuration change, not a one-line dependency swap
(S003).

The general lesson: fuses set for security become constraints on storage and
verification, and nothing connects them except reading both configurations at
once (S003).
