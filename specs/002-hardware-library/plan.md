# Implementation Plan: Hardware Library

**Branch**: `002-hardware-library` | **Date**: 2026-09-02 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/002-hardware-library/spec.md`

## Summary

Move the 131 appliance types out of application source and into a catalogue the
person owns: create, edit, delete, approve, import, export, and symbols. The
catalogue lives in SQLite in the Electron main process; decision logic stays
pure in `src/utils/`; the renderer reaches it through the first context bridge
this application has had.

Two parts of the specification do not ship in this feature and are recorded
below rather than quietly dropped: restricting approved equipment (blocked on an
unanswered question) and plans recording their own type definitions (blocked on
a format that does not exist yet).

## Technical Context

**Language/Version**: JSX / JavaScript (ES modules) for the renderer;
TypeScript 7 for `src/main.ts` and `src/preload.ts`

**Primary Dependencies**: Electron 40 (Node 24.11.1, verified), React 19.2,
ReactFlow 11.11, TailwindCSS 4.1, lucide-react. No new runtime dependency: the
database is `node:sqlite`, built in.

**Storage**: SQLite via `node:sqlite`, main process only
([ADR 0010](../../docs/adr/0010-hardware-library-database.md)). Import and
export are JSON. Topologies remain on `localStorage` until
[ADR 0008](../../docs/adr/0008-project-files-on-disk.md) lands; this feature
does not change them.

**Testing**: Vitest 4.1, `environment: 'node'`, co-located `*.test.js` in
`src/utils/`

**Target Platform**: Desktop, Linux, macOS, Windows (deb / rpm / squirrel / zip)

**Project Type**: Electron desktop application (main, preload, renderer)

**Performance Goals**: browsing and filtering stay responsive at several
thousand appliance types. Application start no slower than today, though there
is no baseline yet (SC-007).

**Constraints**: the renderer must not use Node APIs directly, must not receive
reusable filesystem paths, and must not hold a database handle. Map tiles aside
([ADR 0009](../../docs/adr/0009-map-data-source.md)), this feature needs no
network.

**Scale/Scope**: 131 types to migrate, 19 categories, 16 port kinds, one new
main-process module, one preload bridge, roughly six new `src/utils/` modules
with tests, and the Hardware tab UI.

## Constitution Check

*GATE: evaluated before Phase 0 and re-evaluated after Phase 1.*

| Principle | Pre-design | Post-design |
|---|---|---|
| **I.** Logic in `src/utils/`, tested | Risk: a database is not pure | **PASS**, see R3 and Complexity Tracking |
| **II.** Node-environment, co-located tests | PASS | **PASS**, no DOM introduced |
| **III.** Three-process boundary respected | Risk: first bridge in this app | **PASS**, contract forbids paths and handles |
| **IV.** Naming by file role | PASS | **PASS** |
| **V.** Shared state in `src/context/` | PASS | **PASS**, catalogue state via context, logic from utils |
| Dependencies point downward | PASS | **PASS**, `src/utils/` imports nothing from `src/` |
| Quality gates run | PASS | **PASS**, see quickstart |

**Post-design verdict**: passes with one recorded deviation, below.

## Project Structure

### Documentation (this feature)

```text
specs/002-hardware-library/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/
│   └── preload-bridge.md
├── checklists/requirements.md
├── product/             # after_specify hook output
└── wireframes/
```

### Source Code (repository root)

```text
src/
├── main.ts                          # CHANGED: register library IPC handlers
├── preload.ts                       # CHANGED: currently empty, gains the bridge
├── library/                          # NEW: main-process only
│   ├── catalogueStore.ts            # every node:sqlite call lives here
│   ├── schema.ts                    # tables and schema version
│   ├── seed.ts                      # the 131 shipped types on first run
│   └── ipc.ts                       # handlers, dialogs, path handling
├── utils/                            # NEW pure modules, each with a test
│   ├── applianceValidation.js       # FR-001, FR-020, FR-024
│   ├── libraryFile.js               # read formatVersion, parse, serialise
│   ├── importMerge.js               # collisions, resolution, report
│   ├── symbolValidation.js          # FR-014, FR-015
│   ├── catalogueQuery.js            # search and filter predicates
│   └── shippedTypes.js              # transcribed from data/devices.js
├── context/
│   └── LibraryContext.jsx           # NEW: catalogue state for the renderer
├── components/Hardware/              # NEW: the Hardware tab
│   ├── HardwareTab.jsx
│   ├── CategoryRail.jsx
│   ├── ApplianceGrid.jsx
│   ├── ApplianceEditor.jsx
│   ├── ImportReportPanel.jsx
│   └── index.js
└── data/devices.js                   # REMOVED once seed.ts is verified
```

**Structure Decision**: the pure modules go in `src/utils/` with co-located
tests, per Principle I. `src/library/` is new and main-process only; it exists
because a database handle cannot live in `src/utils/` without dragging a
side-effecting dependency into the tested core. See Complexity Tracking.

`src/data/devices.js.backup` is currently tracked in git and should be deleted
with `devices.js`.

## Phases

**Phase 0** (complete): `research.md`. Resolved the database choice, the file
format, and the Principle I split. Left R4 open and recorded R5.

**Phase 1** (complete): `data-model.md`, `contracts/preload-bridge.md`,
`quickstart.md`.

**Phase 2** (next, `/speckit-tasks`): task breakdown. Suggested order is seed
and migration first, since every other scenario depends on the 131 types being
present and correct.

## Complexity Tracking

| Violation | Why needed | Simpler alternative rejected because |
|---|---|---|
| New `src/library/` outside the constitution's described layout | A database handle is side-effecting and cannot live in `src/utils/` without making the tested core impure | Injecting a handle into `src/utils/` was considered and rejected: it turns unit tests into integration tests wearing a disguise, and breaks the rule that `src/utils/` imports nothing from `src/` |
| `node:sqlite` is flagged experimental | Every alternative is a native module needing `electron-rebuild` across four packaging targets | `better-sqlite3` is more mature but adds a compiled binary per platform to the build; the API risk is confined to `catalogueStore.ts` |
| Main process grows substantially | ADR 0008 and 0010 both require it; the renderer cannot open files or hold a database | Keeping everything in the renderer is not possible under Principle III |

## Deferred from this feature

Recorded so they are not mistaken for oversights:

- **FR-029, FR-030** (restricting change to approved equipment). Blocked on R4:
  there is no established identity in a single-user desktop application, and the
  three possible mechanisms differ enormously in cost. FR-028, marking equipment
  approved, still ships, and the flag is designed so a mechanism attaches later.
- **FR-005a to FR-005d** (a plan recording the definition it was placed with,
  and being offered the current one when they diverge). Blocked on R5: the
  project file format does not exist yet. Until this lands, editing a type still
  changes what existing plans resolve, which is exactly what ADR 0011 exists to
  prevent.
- **SC-007** cannot be evaluated without a start-time baseline. Measure before
  implementing.
