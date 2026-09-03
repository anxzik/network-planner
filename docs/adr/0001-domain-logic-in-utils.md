# 0001. Keep domain logic in `src/utils/` and leave components untested

**Status:** Accepted
**Date:** 2026-09-02

## Context

This is an Electron desktop app whose renderer is a React SPA built on
ReactFlow. Testing React components needs a DOM, a component-testing library,
and fixtures for ReactFlow's canvas — expensive to set up and brittle to
maintain for a UI that changes often.

The behaviour actually worth protecting is not the UI. It is subnet arithmetic,
port generation, VLAN range formatting, edge operations, and IP validation —
pure functions with real branching. `portFactory.js` alone is 317 lines with 43
branching constructs.

Two refactors moved in this direction before it was written down: `5887560`
extracted NetworkContext state transitions into tested modules, and `653d781`
extracted a `usePersist` hook and moved debounce out of storage. The strategy
existed in the commit log and nowhere else.

## Decision

Domain logic lives in `src/utils/` as pure modules with no React imports, each
with a co-located `*.test.js`. Components consume that logic and do not contain
it. Vitest runs with `environment: 'node'` — there is no DOM, by design.

When a component starts accumulating branching logic, extract it rather than
reaching for a component test.

## Consequences

Tests are fast and stable: 260 of them run in under a second, with no DOM, no
fixtures, and no async flushing.

The cost is that component behaviour is genuinely unverified. A component can
render the wrong thing, wire the wrong handler, or drop a prop, and nothing
fails. That risk is accepted on the basis that components here stay thin — and
that assumption needs re-checking whenever one grows.

Introducing jsdom or a component-testing library reverses this decision and
requires a new record; it is not an incidental config change.

`deviceHelpers.js` currently violates the no-React-imports rule by importing
`lucide-react` to map device names to icons. It is either an exception to
document or a module to move into `src/components/`; unresolved as of this
record.
