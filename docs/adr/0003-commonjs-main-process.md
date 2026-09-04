# 0003. Build the Electron main process as CommonJS despite `"type": "module"`

**Status:** Accepted
**Date:** 2026-09-02

## Context

`package.json` declares `"type": "module"`, which makes Node treat every `.js`
file in the project as an ES module. The renderer and build tooling want that.
Electron's main process, loaded through Electron Forge and the Vite plugin, did
not start reliably under it.

## Decision

The main process build emits `.vite/build/main.cjs`, and `package.json` points
`main` at that path. The `.cjs` extension overrides the package-level `"type"`
for that one file. Fixed in `407ca16`.

## Consequences

The app packages and launches, and the rest of the project keeps ES modules.

The cost is a genuine inconsistency that will not be obvious to anyone reading
`package.json`: one file in the build output follows a different module system
from every source file that produced it. Anyone changing the main-process build
config needs to preserve the extension, and a build that silently emits `.js`
instead will fail at launch rather than at build time.
