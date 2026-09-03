# 0002. Persist to `localStorage` under one namespaced, versioned key

**Status:** Accepted
**Date:** 2026-09-02

## Context

Users build network topologies that must survive closing the app. The app ships
as an installed desktop binary with no server and no account, so persistence has
to be local. A real database would mean bundling and migrating an engine for
what is a modest object graph.

## Decision

All state persists to `localStorage` through `src/utils/storage.js`, under the
single namespace key `networkPlanner`. `src/hooks/usePersist.js` debounces
writes. Every write stamps `__version` from `SCHEMA_VERSION`.

## Consequences

Persistence is a few dozen lines with no dependency, and works identically in
the browser and the packaged app.

Three costs follow, and the third is the sharp one:

Storage is synchronous and size-limited, so a very large topology will
eventually hit a wall that has not been measured.

`__version` is written but never read. The seam for migration exists; the
migration logic does not. Bumping `SCHEMA_VERSION` today migrates nothing.

`getRoot()` treats malformed data and absent data identically — it catches a
parse error, logs to the console, and returns an empty root, after which the
next write overwrites what could not be read. A user whose stored data is
damaged, or whose shape this app changes without a migration path, loses their
saved topologies with only a console line as evidence.
