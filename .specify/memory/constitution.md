# network-planner Constitution

## Project Identity

**network-planner** is an Electron desktop application for designing and
documenting network topologies: placing devices on a canvas, wiring ports
between them, assigning VLANs, and calculating subnets.

- **Architecture**: Electron three-process desktop app (main / preload / renderer)
- **Renderer**: React 19 SPA built on ReactFlow, styled with TailwindCSS 4
- **Build**: Vite 5 via Electron Forge 7
- **Distribution**: deb, rpm, squirrel, zip
- **Not a monorepo**: one `package.json`, no workspaces

## Core Principles

### I. Logic Lives in `src/utils/` (NON-NEGOTIABLE)

Domain logic belongs in pure, dependency-free modules under `src/utils/`.
Components consume that logic; they do not contain it.

This is the project's testability strategy. React components here are not
unit-tested — instead, the logic worth testing is moved out of them into
modules where tests are cheap and fast. Every module in `src/utils/` that
carries real behaviour has a co-located `*.test.js`.

When a component starts accumulating branching logic, extract it rather than
reaching for component tests.

### II. Tests Are Node-Environment and Co-located

- Framework: Vitest, `environment: 'node'`, globals enabled
- Location: co-located `*.test.js` beside the module it covers
- Scope: `src/utils/` — pure functions and factories

There is deliberately no DOM test environment. Introducing jsdom or a
component-testing library is an architectural change and requires an explicit
decision, not an incidental one.

### III. The Three-Process Boundary Is Real

| Process | Entry | Language | Config |
|---|---|---|---|
| Main | `src/main.ts` | TypeScript | `vite.main.config.mts` |
| Preload | `src/preload.ts` | TypeScript | `vite.preload.config.mts` |
| Renderer | `src/main.jsx` → `src/App.jsx` | JSX | `vite.renderer.config.mts` |

Main and preload are TypeScript. The renderer is JSX. Renderer code must not
import from `main.ts`, and must not assume Node APIs are available — anything
crossing the boundary goes through the preload bridge.

Build output is `.vite/build/main.cjs`; the `.cjs` extension intentionally
overrides the package's `"type": "module"` for CommonJS compatibility.

### IV. Naming Follows File Role

- **Components**: PascalCase `.jsx`, inside PascalCase feature directories
  (`src/components/VlanConfig/VlanEditor.jsx`)
- **Logic, hooks, data**: camelCase `.js`
  (`src/utils/edgeOperations.js`, `src/hooks/usePersist.js`)
- **Electron process files**: lowercase `.ts`
- **Barrel re-exports**: `index.js`, lowercase, no other content
  (`src/components/Scratchpad/index.js`)

**Known exception**: `src/components/nodes/` is lowercase. It holds ReactFlow
node-type registrations rather than a UI feature, and the lowercase name marks
that difference. Do not rename it to match the other directories, and do not
treat it as licence to lowercase a genuine feature directory.

### V. Shared State Is React Context in `src/context/`

Cross-cutting state lives in a context under `src/context/` — currently
`NetworkContext`, `ScratchpadContext`, `SettingsContext`. Contexts compose
logic from `src/utils/`; they do not define it inline.

Do not synchronise form state from effects. State transitions belong in
tested modules that the context calls.

## Code Boundaries

| Path | Contains | May depend on |
|---|---|---|
| `src/utils/` | Pure logic, factories, validation | nothing in `src/` |
| `src/hooks/` | Reusable React hooks | `src/utils/` |
| `src/context/` | Shared application state | `src/utils/`, `src/hooks/` |
| `src/components/` | UI, grouped by feature | context, hooks, utils |
| `src/data/` | Static device catalogue | nothing |
| `src/main.ts`, `src/preload.ts` | Electron main/preload | Node + Electron APIs |

Dependencies point downward only. `src/utils/` importing from `src/components/`
is a defect.

## Quality Gates

All three must pass before a change is considered complete:

```bash
npm run lint        # eslint (flat config, react-hooks, react-refresh)
npm test            # vitest run
npm run typecheck   # tsc --noEmit
```

These gates are not currently automated — there is no CI configuration in this
repository. Until that changes, they run locally and the responsibility is the
author's.

## Commit Convention

Conventional Commits: `feat:`, `fix:`, `chore:`, `refactor:`, `docs:`.
Consistently applied across recent history and expected going forward.

## Open Decisions

These are recorded because the codebase has **no** established convention. They
are not rules, and should be resolved rather than guessed at:

1. **Component testing** — Principle I and II describe the current strategy.
   Whether it remains the long-term position is undecided.
2. **Continuous integration** — no CI exists. The quality gates above are
   defined but unenforced.
3. **Documentation root** — `CLAUDE.md` references `CONTEXT.md`, which does not
   exist. `docs/adr/` now does. `ARCHITECTURE.md` and `README.md` live under
   `dev-stuff/`. This constitution overlaps with what `CONTEXT.md` was intended
   to hold; the relationship between the two should be settled.

## Governance

This constitution describes conventions observed in the codebase as of the
ratification date. It is descriptive first: a rule here should be traceable to
actual code, configuration, or git history.

Amendments require updating this file alongside the change that motivates them.
Where this document and the code disagree, that is a defect in one of them —
decide which, and fix it.

**Version**: 1.0.0 | **Ratified**: 2026-09-02 | **Last Amended**: 2026-09-02
