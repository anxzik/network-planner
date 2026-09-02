# Implementation Plan: [FEATURE]

**Branch**: `[###-feature-name]` | **Date**: [DATE] | **Spec**: [link]

**Input**: Feature specification from `/specs/[###-feature-name]/spec.md`

**Note**: This template is filled in by the `/speckit-plan` command; its definition describes the execution workflow.

## Summary

[Extract from feature spec: primary requirement + technical approach from research]

## Technical Context

<!--
  Pre-filled from the project profile. Change a value only when the feature
  actually diverges from it; otherwise leave as-is.
-->

**Language/Version**: JSX / JavaScript (ES modules) for the renderer;
TypeScript 7 for `src/main.ts` and `src/preload.ts`

**Primary Dependencies**: Electron 40, React 19.2, ReactFlow 11.11,
TailwindCSS 4.1, lucide-react

**Storage**: Browser localStorage via `src/utils/storage.js` + `src/hooks/usePersist.js`
(no database)

**Testing**: Vitest 4.1, `environment: 'node'`, co-located `*.test.js` in `src/utils/`

**Target Platform**: Desktop — Linux, macOS, Windows (deb / rpm / squirrel / zip)

**Project Type**: Electron desktop application (three-process: main, preload, renderer)

**Performance Goals**: [feature-specific — e.g. canvas remains interactive at N nodes,
or NEEDS CLARIFICATION]

**Constraints**: Offline-capable (no network dependency); renderer must not use
Node APIs directly — anything crossing the process boundary goes through preload

**Scale/Scope**: [feature-specific — e.g. number of new components, affected
`src/utils/` modules, or NEEDS CLARIFICATION]

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

[Gates determined based on constitution file]

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit-plan command output)
├── research.md          # Phase 0 output (/speckit-plan command)
├── data-model.md        # Phase 1 output (/speckit-plan command)
├── quickstart.md        # Phase 1 output (/speckit-plan command)
├── contracts/           # Phase 1 output (/speckit-plan command)
└── tasks.md             # Phase 2 output (/speckit-tasks command - NOT created by /speckit-plan)
```

### Source Code (repository root)
<!--
  This is the actual repository layout. Mark which of these directories the
  feature touches; do not invent new top-level structure without a reason
  recorded under Complexity Tracking.
-->

```text
src/
├── main.ts                 # Electron main process (TypeScript)
├── preload.ts              # Context bridge (TypeScript)
├── main.jsx                # Renderer entry
├── App.jsx                 # Root component
├── components/             # UI, grouped by feature (PascalCase dirs + files)
│   ├── Canvas/             # ReactFlow topology surface
│   ├── DeviceLibrary/      # Placeable device palette
│   ├── ListView/           # Tabular view + object form
│   ├── NodeConfig/         # Per-node / per-port configuration
│   ├── PortSelector/       # Port connection modal
│   ├── VlanConfig/         # VLAN editor
│   ├── SubnetCalculator/   # Subnet math UI
│   ├── Scratchpad/         # Calculations + notes
│   ├── Settings/           # Canvas / library / UI preferences
│   └── nodes/              # Custom ReactFlow node types
├── context/                # Shared state (Network, Scratchpad, Settings)
├── hooks/                  # Reusable React hooks (camelCase)
├── utils/                  # Pure logic + co-located *.test.js  <-- tests live here
└── data/                   # Static device catalogue

vite.main.config.mts        # Build config per process
vite.preload.config.mts
vite.renderer.config.mts
forge.config.ts             # Electron Forge packaging
```

**Structure Decision**: [Name the directories this feature adds to or changes.
Per Constitution Principle I, new domain logic belongs in `src/utils/` with a
co-located test, not inside a component.]

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
