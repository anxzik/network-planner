# Tasks: Hardware Library

**Feature**: 002-hardware-library | **Branch**: `002-hardware-library`
**Input**: [spec.md](spec.md), [plan.md](plan.md), [research.md](research.md), [data-model.md](data-model.md), [contracts/](contracts/), [quickstart.md](quickstart.md)

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

- **Pure logic + tests**: `src/utils/<name>.js` with co-located `src/utils/<name>.test.js`
- **Hooks**: `src/hooks/use<Name>.js` (camelCase)
- **Shared state**: `src/context/<Name>Context.jsx`
- **UI**: `src/components/<Feature>/<Component>.jsx` (PascalCase dir + file)
- **Main process only**: `src/library/*.ts` (new, see plan.md Complexity Tracking)
- **Electron processes**: `src/main.ts`, `src/preload.ts` (TypeScript)

Per Constitution Principle I, logic goes in `src/utils/` with a test; components
stay thin. Tests are not optional here: the constitution requires every
behavioural module in `src/utils/` to carry a co-located test.

---

## Phase 1: Setup

**Purpose**: Establish a known-good starting point and settle the two facts the plan could not.

- [x] T001 Verify baseline is green: `npm run lint && npm test && npm run typecheck`
- [x] T002 Export the current catalogue and keep it in specs/002-hardware-library/ as an older-format fixture, so FR-013a can be tested against a real file
- [x] T003 [P] Confirm `node:sqlite` loads in a packaged build, not only under `npm start`, using `npm run package` on one target

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: The catalogue, the bridge, and the shipped data. No user story can proceed until these exist.

- [x] T004 [P] Transcribe the 131 shipped appliance types from src/data/devices.js into src/utils/shippedTypes.js, preserving every id, category and port group, and mapping the existing physical and logical viewType values onto plane membership for FR-019
- [x] T005 [P] Write src/utils/shippedTypes.test.js asserting 131 types, 19 categories, ids unchanged, all 16 port kinds still representable, and every type carrying at least one plane
- [x] T006 Define the catalogue schema and its schema version in src/library/schema.ts per data-model.md, including the required `planes` field for FR-019
- [x] T007 Implement the SQLite-backed store in src/library/catalogueStore.ts, confining every `node:sqlite` call to this file
- [x] T008 Implement first-run seeding in src/library/seed.ts, loading src/utils/shippedTypes.js into the catalogue
- [x] T009 Create the context bridge in src/preload.ts exposing `window.networkPlanner.library` per contracts/preload-bridge.md
- [x] T010 Register IPC handlers in src/library/ipc.ts and wire them into src/main.ts, keeping all dialogs and paths in the main process
- [x] T011 Create src/context/LibraryContext.jsx holding catalogue state and calling the bridge
- [x] T012 Create the Hardware tab shell in src/components/Hardware/HardwareTab.jsx and src/components/Hardware/index.js

**Checkpoint**: the application starts, the catalogue seeds with 131 types, and the renderer can read them through the bridge.

---

## Phase 3: User Story 1 - Adding hardware that is not in the catalogue (P1) 🎯 MVP

**Goal**: A person can add, edit, delete and restore appliance types, and place their own hardware on the canvas.

**Independent Test**: Add a type the application does not know, place it, and confirm its ports generate correctly from what was entered.

### Tests for User Story 1

- [ ] T013 [P] [US1] Write src/utils/applianceValidation.test.js covering required fields, plane membership, portless types, and the port-count limit

### Implementation for User Story 1

- [ ] T014 [P] [US1] Implement src/utils/applianceValidation.js for FR-001, FR-019, FR-020 and FR-024, pure, no React imports
- [ ] T015 [US1] Add create, update and delete to src/library/catalogueStore.ts (depends on T007, T014)
- [ ] T016 [US1] Add `restoreShipped` to src/library/catalogueStore.ts using the stored `shippedDefinition` for FR-003
- [ ] T017 [US1] Add `usage(id)` to src/library/catalogueStore.ts so FR-005 can refuse deletion and name the plans
- [ ] T018 [US1] Return `TYPE_IN_USE` from delete in src/library/ipc.ts when a type is placed, per contracts/preload-bridge.md
- [ ] T019 [US1] Build the type editor in src/components/Hardware/ApplianceEditor.jsx
- [ ] T020 [US1] Build the appliance grid in src/components/Hardware/ApplianceGrid.jsx, marking edited and locally added types for FR-018
- [ ] T021 [US1] Implement the portless confirmation flow for FR-020 in src/components/Hardware/ApplianceEditor.jsx, passing `confirmedNoPorts` through src/preload.ts
- [ ] T022 [US1] Add the approved flag to src/library/schema.ts and `markApproved` to src/library/catalogueStore.ts for FR-028, leaving enforcement to a later feature

**Checkpoint**: User Story 1 is fully functional and testable on its own.

---

## Phase 4: User Story 2 - Exchanging hardware definitions (P1)

**Goal**: A person can export a selection or the whole catalogue and import one elsewhere, with collisions and failures handled visibly.

**Independent Test**: Export a selection, delete a type, reimport, and confirm it returns complete.

### Tests for User Story 2

- [ ] T023 [P] [US2] Write src/utils/libraryFile.test.js covering format version reading, upgrading an older format, malformed input, and round-trip serialisation
- [ ] T024 [P] [US2] Write src/utils/importMerge.test.js covering collision detection, all three resolutions, skip reasons, and the report shape

### Implementation for User Story 2

- [ ] T025 [P] [US2] Implement src/utils/libraryFile.js to read `formatVersion` before parsing, and to bring an older known format forward, per FR-012, FR-013 and FR-013a
- [ ] T026 [P] [US2] Implement src/utils/importMerge.js as a pure function from incoming, existing and strategy to apply, skip and report, per FR-009 to FR-011
- [ ] T027 [US2] Implement export with a save dialog in src/library/ipc.ts for FR-006 and FR-007, returning no reusable path to the renderer
- [ ] T028 [US2] Implement `previewImport` in src/library/ipc.ts so collisions are shown before anything is written
- [ ] T029 [US2] Implement `importLibrary` in src/library/ipc.ts applying the chosen resolutions and returning an ImportReport
- [ ] T030 [US2] Surface the unrecognised-version warning for FR-013 in src/components/Hardware/ImportReportPanel.jsx without discarding the file
- [ ] T031 [US2] Build src/components/Hardware/ImportReportPanel.jsx showing added, replaced and skipped with a reason for each

**Checkpoint**: User Stories 1 and 2 both work independently.

---

## Phase 5: User Story 3 - Using an organisation's own symbols (P2)

**Goal**: A person can import a symbol set and assign symbols, so plans follow a house style.

**Independent Test**: Import a symbol set, assign a symbol, place the type, and confirm the imported symbol draws.

### Tests for User Story 3

- [ ] T032 [P] [US3] Write src/utils/symbolValidation.test.js covering well-formed SVG, malformed input, and oversized content

### Implementation for User Story 3

- [ ] T033 [P] [US3] Implement src/utils/symbolValidation.js for FR-014, rejecting anything that is not a usable symbol
- [ ] T034 [US3] Add symbol and symbol-set tables to src/library/schema.ts and their access to src/library/catalogueStore.ts
- [ ] T035 [US3] Implement `importSymbols` and `listSymbols` in src/library/ipc.ts
- [ ] T036 [US3] Add symbol selection to src/components/Hardware/ApplianceEditor.jsx
- [ ] T037 [US3] Resolve symbols when drawing in src/components/nodes/DeviceNode.jsx, falling back to a default for FR-015
- [ ] T038 [US3] Assign the shipped industry-standard symbols to the 131 seeded types for FR-016 in src/library/seed.ts

**Checkpoint**: User Stories 1, 2 and 3 all work independently.

---

## Phase 6: User Story 4 - Browsing and organising the catalogue (P2)

**Goal**: A person can find one appliance among several hundred by search and filter.

**Independent Test**: With a large catalogue, locate a specific appliance by manufacturer, by category, and by searching its model.

### Tests for User Story 4

- [ ] T039 [P] [US4] Write src/utils/catalogueQuery.test.js covering search matching, category and plane filters, and origin filtering

### Implementation for User Story 4

- [ ] T040 [P] [US4] Implement src/utils/catalogueQuery.js as pure predicates and query shaping for FR-017
- [ ] T041 [US4] Implement `list(query)` in src/library/catalogueStore.ts so filtering happens in SQL rather than by loading everything, per FR-026
- [ ] T042 [US4] Build src/components/Hardware/CategoryRail.jsx with category counts
- [ ] T043 [US4] Add search and plane filtering to src/components/Hardware/HardwareTab.jsx
- [ ] T044 [US4] Distinguish person-created and edited types visually in src/components/Hardware/ApplianceGrid.jsx for FR-018

**Checkpoint**: all four user stories are independently functional.

---

## Phase 7: Polish & Cross-Cutting Concerns

- [ ] T045 Point src/components/DeviceLibrary/DeviceLibrary.jsx at LibraryContext instead of src/data/devices.js
- [ ] T046 Point src/components/Settings/DeviceLibrarySettings.jsx at LibraryContext instead of src/data/devices.js
- [ ] T047 Delete src/data/devices.js and the tracked src/data/devices.js.backup once T045 and T046 are verified
- [ ] T048 Verify FR-027 against src/library/catalogueStore.ts by interrupting a large import and confirming the catalogue is intact on restart
- [ ] T049 Extract any logic that accumulated in components back into src/utils/
- [ ] T050 Run every scenario in specs/002-hardware-library/quickstart.md
- [ ] T051 Run `npm run lint` — must pass
- [ ] T052 Run `npm test` — must pass
- [ ] T053 Run `npm run typecheck` — must pass
- [ ] T054 Verify in the packaged app: `npm start`

---

## Dependencies & Execution Order

### Phase Dependencies

```
Setup (T001-T003)
  └─> Foundational (T004-T012)   BLOCKING: nothing proceeds without this
        ├─> US1 (T013-T022)  P1  MVP
        ├─> US2 (T023-T031)  P1  needs T007 store, independent of US1
        ├─> US3 (T032-T038)  P2  needs T006 schema
        └─> US4 (T039-T044)  P2  needs T007 store
              └─> Polish (T045-T054)
```

### User Story Dependencies

All four stories depend only on Phase 2. None depends on another, so they can be
built in any order or in parallel once foundations land. US1 is the MVP because
it is the story that makes the catalogue a catalogue.

### Within Each Story

Tests before implementation. Pure `src/utils/` modules before the store methods
that call them. Store before IPC. IPC before UI.

### Parallel Opportunities

- **T004 and T005** together: transcription and its test are separate files.
- **T013, T023, T024, T032, T039**: every `src/utils/` test is a distinct file.
- **T014, T025, T026, T033, T040**: every pure module is a distinct file.
- **Whole stories**: US2, US3 and US4 can run alongside US1 after Phase 2.

## Parallel Example: User Story 2

```bash
# Launch both tests for User Story 2 together:
Task: "Write src/utils/libraryFile.test.js"
Task: "Write src/utils/importMerge.test.js"

# Then both pure modules together (no shared files):
Task: "Implement src/utils/libraryFile.js"
Task: "Implement src/utils/importMerge.js"
```

## Implementation Strategy

### MVP First (User Story 1 only)

Phases 1, 2 and 3 give a person the ability to add hardware the application has
never heard of and place it. That alone is the difference between a catalogue
and a fixed list, and it is shippable on its own.

### Incremental Delivery

US2 next, because export is also how a person protects a catalogue that exists
nowhere else. US3 and US4 improve a working feature rather than enabling one.

### Ordering note

T004, transcribing the 131 shipped types, comes first inside Phase 2 for a
reason: every quickstart scenario and every story assumes those types are
present and unchanged. Getting it wrong invalidates all later verification.

## Not in this breakdown

Deferred in plan.md and deliberately absent here:

- **FR-029 and FR-030**, restricting change to approved equipment. Blocked on R4
  in research.md. T022 ships the flag only.
- **FR-005a to FR-005e**, plans recording the definition they were placed with,
  being offered the library's current one when the two diverge, and having a
  correction applied across every plan that carries an old copy. Blocked on R5:
  project files do not exist yet.
