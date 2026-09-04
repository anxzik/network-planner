# Implementation Plan: Project Files

**Branch**: `003-project-files` | **Date**: 2026-09-03 | **Spec**: [spec.md](spec.md)

## Summary

Plans become `.netplan` files. Pure modules decide (format classification,
upgrades, divergence, salvage, recents pruning); the main process executes
(dialogs, atomic writes, locks, the recovery slot); the renderer displays and
consents. The deferred FR-005 family from the hardware library ships here,
and browser storage retires to a preserved, marked copy.

## Technical Context

**Language/Dependencies**: unchanged from 002 — no new runtime dependency.
File I/O is `node:fs` in main; the bridge and envelope extend the existing
pattern.

**Storage**: plan files where the person puts them; `recents.json`,
`recovery-slot.json`, migration marker per R3/R4; catalogue DB untouched.

**Testing**: node-env vitest; every new decision module in `src/utils/` with
co-located tests, per Principle I.

**Constraints**: renderer sees names and opaque ids, never reusable paths;
read-only enforced in main (R5); saves atomic (R1); SC-003 is the spine.

**Scale/Scope**: ~7 new pure modules + tests, one main-process module
(`src/plans/`), bridge additions, and renderer surfaces (title state, prompts,
migration/salvage/divergence/broad-apply panels, recents).

## Constitution Check

| Principle | Verdict |
|---|---|
| I. Logic in utils, tested | PASS — classification, upgrade, divergence, salvage, pruning all pure |
| II. Node-env co-located tests | PASS |
| III. Process boundary | PASS — extends the proven bridge; read-only backstopped in main |
| IV/V, downward deps, gates | PASS |

Deviation carried forward: `src/plans/` joins `src/library/` as main-process
homes outside the constitution's original layout — same justification as 002's
Complexity Tracking entry, now precedent.

## Project Structure

```text
src/
├── plans/                    NEW, main-process only
│   ├── planStore.ts          open/save/atomic-write/partial-keep/locks
│   ├── recents.ts            recents.json + recovery-slot.json access
│   └── ipc.ts                handlers per contracts/plans-bridge.md
├── utils/                    NEW pure modules, each with a test
│   ├── planFile.js           serialise/classify/upgrade (mirrors libraryFile)
│   ├── planDivergence.js     recorded vs current, offer/decline logic
│   ├── storageSalvage.js     FR-012 best-effort recovery of old storage
│   ├── recentsPrune.js       FR-007 decisions
│   ├── preservedArtifacts.js FR-024 slot naming + retention decisions
│   └── typeAdoption.js       FR-025 adoptable/skipped decisions
├── context/PlanContext.jsx   NEW: open-plan state, dirty flag, bridge calls
└── components/Plans/         NEW: prompts, migration & salvage, divergence,
                              broad-apply, recents surfaces
```

`NetworkContext`/`ScratchpadContext` gain load-from/serialise-to document
seams; `usePersist`'s continuous localStorage write is retired after US2.

## Phases

**Phase 0** (complete): research.md — R1 atomic saves, R2 format, R3 auxiliary
state, R4 the renderer-side migration path, R5 read-only enforcement, R6 locks,
R7 broad-apply bounds.

**Phase 1** (complete): data-model.md, contracts/plans-bridge.md, quickstart.md.

**Phase 2** (`/speckit-tasks`, complete — 47 tasks): suggested order — planFile.js first
(everything trusts classification), then atomic save, then migration, then the
FR-005 family.

## Complexity Tracking

| Concern | Justification |
|---|---|
| Second main-process module tree | Same R3-split reasoning as `src/library/`; merging them would couple plan and catalogue lifecycles ADR 0010/0008 deliberately separated |
| Migration crosses the boundary twice | Forced by fact R4: localStorage is renderer-only; the alternative (main parsing renderer profile files on disk) would bind to Chromium internals |
| Advisory locks only | Mandatory locks are unreliable cross-platform; spec asks best-effort and the read-only fallback bounds the damage |

## Deferred / open

- Multi-window, plan merging: out of scope per spec.
- Crash-recovery retention duration: open question from the product spec;
  default "until restored or discarded" until answered.
- SC-006 grows one test per future format version — a standing obligation, not
  a this-feature task.
