---

description: "Task list for 003-project-files"
---

# Tasks: Project Files

**Input**: Design documents from `/specs/003-project-files/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/plans-bridge.md, quickstart.md

**Tests**: Included. The constitution (Principle I) requires every pure decision
module in `src/utils/` to ship with a co-located test, and SC-006 explicitly
demands automated coverage of every upgrade path. A "module" task below always
means the module **and** its co-located `*.test.js`.

**Organization**: Tasks are grouped by user story. US1 and US2 are both P1 and
ship together (US2's migration is worthless without US1's files, and existing
users lose work without US2); they are still independently testable.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1–US4)

## Path Conventions

- **Pure logic + tests**: `src/utils/<name>.js` with co-located `src/utils/<name>.test.js`
- **Shared state**: `src/context/<Name>Context.jsx`
- **UI**: `src/components/Plans/<Component>.jsx`
- **Main-process plans module**: `src/plans/` (TypeScript, precedent: `src/library/`)
- **Electron processes**: `src/main.ts`, `src/preload.ts`

Per Constitution Principle I, logic goes in `src/utils/` with a test; components
stay thin. Divergence math, format classification, upgrades, salvage and
pruning decisions are all pure. The wireframes signed off in spec.md
(`wireframes/01-files-and-migration.svg`, `wireframes/02-recorded-definitions.svg`, `wireframes/03-adoption-and-preserved.svg`)
are binding layout constraints on every renderer task.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirm the branch starts green; this feature adds no runtime dependency (plan.md Technical Context).

- [x] T001 Confirm `npm install` is current and `npm start` launches the app on branch `003-project-files`
- [x] T002 Verify baseline is green: `npm run lint && npm test && npm run typecheck` (check exit codes, not output)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: The document format, the atomic write, and the bridge scaffolding that every story trusts. plan.md orders this explicitly: `planFile.js` first — everything trusts classification.

**⚠️ CRITICAL**: No user story work can begin until this phase completes.

- [x] T003 Create `src/utils/planFile.js` + `src/utils/planFile.test.js`: `CURRENT_PLAN_FORMAT_VERSION = '1.0'`, `serialisePlan(document)` producing the PlanFile shape from data-model.md (`formatVersion` first, then `savedAt`, `name`, `appliances`, `connections`, `vlans`, `scratchpad`, `recordedDefinitions`, `declinedOffers`), and `readPlanFile(text)` classifying to `current | older(version) | newer(version) | unreadable` — version read before anything else is trusted, mirroring `src/utils/libraryFile.js` (FR-019, FR-022, FR-023)
- [x] T004 [P] Create `src/plans/planStore.ts` (+ `src/utils/planLock.js` and its test — lock staleness is a decision, so it lives in utils per Principle I): atomic save (write temp in target directory, flush, rename over target; on failure preserve temp as `<plan>.partial` — one slot per plan, replaced not accumulated — and report it), plain read, and advisory lock sidecar `<plan>.lock` with `{ pid, hostname, openedAt }` — take on open, remove on close, ignore when stale (R1, R6, FR-008, FR-024)
- [x] T005 [P] Create `src/plans/recents.ts`: read/write `recents.json` (`[ { path, name, lastOpened } ]`, newest first) and `recovery-slot.json` (PlanFile shape + `sourcePath`, `capturedAt`) in `app.getPath('userData')`, beside the catalogue database (R3, FR-007, FR-009)
- [x] T006 Create `src/plans/ipc.ts`: register the `plans:*` handler surface from contracts/plans-bridge.md with the existing `{ok:true,value}|{ok:false,error:{code,message}}` envelope; wire registration into `src/main.ts` beside `src/library/ipc.ts`; paths never cross to the renderer — recents cross as opaque ids
- [x] T007 Extend `src/preload.ts`: add the `plans` namespace to `window.networkPlanner` beside `library`, one method per contract row, all async, no path exposure
- [x] T008 Add document seams to `src/context/NetworkContext.jsx` and `src/context/ScratchpadContext.jsx`: `serialiseToDocument()` / `loadFromDocument(document)` so a plan can be captured from and restored to the canvas without touching persistence
- [x] T009 Create `src/context/PlanContext.jsx`: open-plan state (`name`, `dirty`, `readOnly`, `source`), dirty tracking from Network/Scratchpad changes, bridge calls through `window.networkPlanner.plans`; mount `PlanProvider` in `src/main.jsx` alongside the existing providers (FR-005)

**Checkpoint**: Bridge callable end-to-end; a document round-trips serialise → classify → load in tests.

---

## Phase 3: User Story 1 — A plan is a file (P1) 🎯 MVP

**Goal**: Save a named `.netplan` file where the person chooses, reopen it intact, with dirty-state honesty, an unsaved-changes guard, recents, and crash recovery.

**Independent Test**: Save a topology to a chosen location, restart the app, open the file, confirm every device, connection, VLAN and note is exactly as saved (quickstart 1, 2, 11).

- [x] T010 [US1] Implement `save`, `saveAs`, `open`, `newPlan`, `state` handlers in `src/plans/ipc.ts`: OS dialogs with the `.netplan` filter, save through the atomic path in `src/plans/planStore.ts`, `CANCELLED` as a normal envelope, opened files added to recents (FR-001, FR-002, FR-003, FR-004, FR-005)
- [x] T011 [P] [US1] Create `src/utils/recentsPrune.js` + `src/utils/recentsPrune.test.js`: pure decisions for the recents list — ordering, deduplication by path, the vanished-entry rule (mark `exists: false`, offer removal, never silently drop) (FR-007)
- [x] T012 [US1] Implement `listRecents`, `openRecent`, `removeRecent` handlers in `src/plans/ipc.ts` using `src/utils/recentsPrune.js` and `src/plans/recents.ts`; ids are opaque, existence checked at list time (FR-007)
- [x] T013 [US1] Implement `recoverySlot`, `saveRecovery`, `clearRecovery` handlers in `src/plans/ipc.ts` over `src/plans/recents.ts`; `PlanContext` captures unsaved work to the slot continuously (debounced) and clears it on clean save. A Discard MUST NOT clear the slot — discarded work stays recoverable and is offered on next start, cleared only by a successful save or the person declining the offer (FR-009, FR-006a)
- [x] T014 [P] [US1] Create `src/components/Plans/PlanMenu.jsx`: New / Open / Save / Save As / recents entries per wireframe 01; disabled states follow `readOnly` and `dirty` from `src/context/PlanContext.jsx`
- [x] T015 [P] [US1] Create `src/components/Plans/UnsavedPrompt.jsx`: the save-first prompt intercepting New, Open, open-recent and window close, with exactly three outcomes — Save (write then proceed), Discard (proceed, changes set aside), Cancel (abandon the pending action, canvas untouched). **Escape maps to Discard**; closing the dialog's window and clicking outside it map to Cancel (FR-006)
- [x] T016 [P] [US1] Create `src/components/Plans/RecentsPanel.jsx`: recent plans with vanished entries marked and removable, never auto-dropped, per wireframe 01 (FR-007)
- [x] T017 [P] [US1] Create `src/components/Plans/RecoveryPrompt.jsx`: on-start offer to restore the recovery slot, whether the work was lost to a crash or set aside by a Discard — restore or decline, nothing silent; declining is what clears the slot (FR-009, FR-006a)
- [x] T018 [US1] Surface open-plan identity in the app chrome: plan name + dirty marker wired from `src/context/PlanContext.jsx` into `src/App.jsx` (and window title via the bridge), per wireframe 01 (FR-005, SC-004)
- [x] T019 [US1] Create `src/components/Plans/index.js` barrel and mount the Plans surfaces in `src/App.jsx`; verify quickstart scenarios 1 and 2 by hand and `npm run lint && npm test && npm run typecheck` green

**Checkpoint**: US1 delivers the MVP — plans are named, portable, guarded files with recents and crash recovery.

---

## Phase 4: User Story 2 — The existing plan moves out of browser storage (P1)

**Goal**: One safe crossing: the localStorage topology is offered as a file migration, salvaged when damaged, preserved always, and never re-prompted.

**Independent Test**: With a topology in old storage, first start offers migration; accept → named file opens, old storage intact and marked. Corrupt storage → salvage preview. Empty profile → silence (quickstart 3, 4).

- [x] T020 [P] [US2] Create `src/utils/storageSalvage.js` + `src/utils/storageSalvage.test.js`: pure classification of a raw storage root into `none | intact | salvageable(preview) | unreadable`, best-effort recovery of readable devices/connections/VLANs/notes from damaged content, and the already-migrated marker check. The original is never rewritten — salvage reads and reports, and the clear-offer is a separate later decision (FR-010, FR-012, FR-013, FR-024)
- [ ] T021 [US2] Implement `checkOldStorage` and `migrate` handlers in `src/plans/ipc.ts`: classify via `src/utils/storageSalvage.js`, write the plan file through the atomic path, return the document plus the marker instruction — main never touches localStorage, the renderer never writes files (R4, FR-010, FR-011, FR-012)
- [ ] T022 [US2] Wire the renderer side of the crossing in `src/context/PlanContext.jsx`: on startup read the storage root via `src/utils/storage.js`, call `checkOldStorage`, and on successful migration write the `{ migratedTo, migratedAt }` marker into localStorage at main's instruction; marker presence suppresses re-offers and a re-trigger shows "already migrated" with a re-export offer (FR-011, FR-013, edge case)
- [ ] T023 [P] [US2] Create `src/components/Plans/MigrationPanel.jsx`: the migration offer per wireframe 01 — never a silent conversion, decline leaves everything as it was (FR-010)
- [ ] T024 [P] [US2] Create `src/components/Plans/SalvagePanel.jsx`: salvage preview showing what was recovered, accept or decline, with the told-a-copy-was-kept notice per wireframe 01 (FR-012)
- [ ] T025 [US2] Retire the continuous localStorage topology write: after migration, `usePersist`'s topology persistence stops (recovery slot replaces it); old storage becomes read-only preserved history in `src/hooks/usePersist.js` / `src/context/NetworkContext.jsx`
- [ ] T026 [US2] Verify quickstart 3 and 4 by hand, confirm a fresh profile shows no prompt or warning (SC-007), and gates green

**Checkpoint**: Every existing user crosses once, loses nothing, and can prove it — old storage is still there, marked.

---

## Phase 5: User Story 3 — A plan opens anywhere and stays truthful (P2)

**Goal**: The deferred FR-005 family: plans carry full recorded definitions, render complete on strange machines, surface divergence honestly, and propagate corrections only by consent.

**Independent Test**: Place a local-only type, save, delete it from the catalogue, reopen — complete render. Edit a placed type, reopen — divergence shown, offer once, decline remembered (quickstart 5, 6, 7).

- [ ] T027 [US3] Record definitions at save: `serialiseToDocument()` in `src/context/NetworkContext.jsx` collects one full definition per distinct placed type into `recordedDefinitions`, fixed at placement time per ADR 0011 (FR-014)
- [ ] T028 [US3] Render from recorded definitions: when a plan's type is absent from the catalogue, the canvas resolves the appliance from the plan's recorded definition — wire the fallback through `src/context/LibraryContext.jsx` / `src/utils/deviceHelpers.js` so `src/components/nodes/DeviceNode.jsx` needs no knowledge of the source (FR-015, SC-001)
- [ ] T029 [P] [US3] Create `src/utils/planDivergence.js` + `src/utils/planDivergence.test.js`: pure divergence detection between a recorded definition and the catalogue's current one, the offer decision honouring `declinedOffers` (keyed by type, valued by the catalogue `updatedAt` declined, so a newer correction re-offers), and the apply-update document transform. Pin a test proving a decline is version-scoped, not permanent: decline version A, then a later version B must re-offer — a boolean decline would break SC-005 (FR-016, FR-017)
- [ ] T030 [US3] Implement `divergences` and `applyUpdate` handlers in `src/plans/ipc.ts` over `src/utils/planDivergence.js` — the same pure math on both sides per the contract's hard rule (FR-016)
- [ ] T031 [US3] Create `src/components/Plans/DivergencePanel.jsx`: which-definition-is-shown made clear, per-type update offer, decline recorded into the document's `declinedOffers`, per wireframe 02 (FR-016, FR-017)
- [ ] T032 [US3] Implement `broadApplyPreview` and `broadApply` handlers in `src/plans/ipc.ts`: reach is the recents list only; each reachable plan goes through the ordinary read-classify path, gets the update, and saves atomically with a per-file original copied aside into the `<plan>.preapply.original` slot; locked or missing files are reported unreachable, never queued (R7, FR-018, FR-024)
- [ ] T033 [US3] Create `src/components/Plans/BroadApplyPanel.jsx`: which plans would change, choose all/some/none, per-plan results with unreachable entries listed honestly, per wireframe 02 (FR-018, SC-005)
- [ ] T034 [P] [US3] Create `src/utils/typeAdoption.js` + `src/utils/typeAdoption.test.js`: pure decisions for FR-025 — which recorded definitions are absent from the catalogue and therefore adoptable, which are already present and must be skipped rather than overwritten, and the locally-created catalogue row an adopted definition becomes (`origin: 'local'`, `adoptedFromPlan`)
- [ ] T035 [US3] Implement `adoptable` and `adopt` handlers in `src/plans/ipc.ts` over `src/utils/typeAdoption.js`, writing through the existing catalogue store in `src/library/catalogueStore.ts`; the plan document is read-only input and MUST be byte-identical after an adopt (FR-025)
- [ ] T036 [US3] Create `src/components/Plans/AdoptTypesPanel.jsx`: the after-open, per-type adopt offer per wireframe 03 — never a precondition of opening, an already-present type shown greyed and labelled skipped, declining changes nothing (FR-025)
- [ ] T037 [US3] Verify quickstart 5, 5b, 6 and 7 (pure logic automated, panels by hand) and gates green

**Checkpoint**: A plan is self-contained and truthful; corrections travel only by consent.

---

## Phase 6: User Story 4 — Old and damaged files are handled safely (P2)

**Goal**: Format lifecycle from the first byte: older files brought forward with the original kept, newer files read-only and never written back, unreadable files untouched, failed saves survivable.

**Independent Test**: Lower a file's formatVersion → upgraded with original beside it. Raise to 99.0 → read-only with notice, save refused in main. Corrupt it → reported, untouched (quickstart 8, 9, 10).

- [ ] T038 [US4] Add the upgrade path to `src/utils/planFile.js` + tests: deterministic `older(version)` → current transform depending only on file content, one test per released format version as the standing SC-006 obligation begins (FR-020, FR-023, SC-006)
- [ ] T039 [US4] Copy-aside on upgrade in `src/plans/planStore.ts`: before an upgraded document is first saved, the original is copied into the `<plan>.<fromVersion>.original` slot and kept until the person removes it. One copy per plan — reopening an older file whose slot is already occupied leaves the existing (older, more valuable) copy alone rather than creating a second (FR-020, FR-024)
- [x] T040 [US4] Enforce read-only in main in `src/plans/ipc.ts`: a plan opened as `newer(version)` or lock-fallback sets `readOnly` in the open envelope, and `save` for a read-only plan is refused in the main process regardless of renderer state; `saveAs` is the sole exit (R5, FR-021)
- [ ] T041 [P] [US4] Create `src/components/Plans/ReadOnlyNotice.jsx`: the newer-format notice per wireframe 02 — what this version can read, what it cannot, and the warned Save As on both counts: unread content is not carried into the copy, and the copy is therefore not a substitute for the original, which stays the only complete version (FR-021)
- [ ] T042 [US4] Handle `unreadable` end to end: `FILE_UNREADABLE` envelope from `src/plans/ipc.ts`, the file left untouched, and a clear report in the renderer through `src/context/PlanContext.jsx` (FR-022, SC-003)
- [ ] T043 [US4] Surface failed saves: `SAVE_FAILED` envelope names the preserved `<plan>.partial`; renderer message in `src/components/Plans/SaveFailedNotice.jsx` tells the person the previous file survived, where the partial is, and which content each one holds — the plan file is the last content written whole, the partial is what they were saving (FR-008)
- [ ] T044 [US4] Verify quickstart 8, 9, 10 and 11 (upgrade, classification and retention decisions automated; dialog flows by hand) and gates green

**Checkpoint**: SC-003 holds — no failure mode destroys a byte the person had not chosen to discard.

---

## Phase 7: Polish & Cross-Cutting Concerns

- [x] T045 [P] Create `src/utils/preservedArtifacts.js` + `src/utils/preservedArtifacts.test.js`: pure naming and retention decisions for FR-024 — the slot name for each kind, whether an occurrence replaces or leaves an existing slot alone, and whether a given artifact has become redundant (upgraded plan saved whole, salvage accepted and written) and may therefore be *offered* for clearing
- [ ] T046 List and clear preserved artifacts: `listPreserved(planId)` / `clearPreserved(planId, kind)` handlers in `src/plans/ipc.ts` over `src/utils/preservedArtifacts.js`, and `src/components/Plans/PreservedArtifactsPanel.jsx` per wireframe 03 — each slot named, its own Clear action, the redundant one distinguished; offered when redundant, never performed unasked (FR-024)
- [ ] T047 [P] Two-instance behaviour: wire the lock sidecar from `src/plans/planStore.ts` into `open` so a second opener gets `LOCKED` → read-only with notice; stale locks (dead pid or aged) are ignored; verify quickstart 13 by hand (R6)
- [ ] T048 [P] Edge-case sweep with tests where pure: save onto a path holding a different plan (ordinary overwrite after the dialog's own confirm), open-plan file renamed/moved/deleted externally (surfaced on next save as `SAVE_FAILED`-style report, not a crash), and a recorded definition failing today's validation rules (rendered anyway per FR-015, flagged in the divergence panel) in `src/utils/planFile.test.js` / `src/utils/planDivergence.test.js`
- [ ] T049 Keep files under 500 lines: check `src/plans/ipc.ts` and `src/context/PlanContext.jsx` sizes; split if breached
- [ ] T050 Run the full quickstart (all 13 scenarios), confirm `npm run lint && npm test && npm run typecheck` green by exit code, and mark completed tasks here

---

## Dependencies & Execution Order

- **Phase 1 → Phase 2**: setup before foundation.
- **Phase 2 blocks all stories**. Within it: T003 first (plan.md: everything trusts classification); T004, T005 parallel after; T006 needs T004+T005; T007 needs T006; T008 parallel with T004–T007; T009 needs T007+T008.
- **US1 (Phase 3)** needs Phase 2 only. T010 → T012/T013; T011 parallel; T014–T017 parallel after T009; T018–T019 last.
- **US2 (Phase 4)** needs Phase 2 + T010 (a migration writes a plan file). T020 parallel; T021 → T022; T023/T024 parallel; T025 after T022.
- **US3 (Phase 5)** needs Phase 2 + T010; T032 also needs T012 (reach = recents). T027/T028/T029 can start together; T030 needs T029; T031 needs T030; T033 needs T032. The FR-025 adopt path (T034–T036) needs T028 (rendering from recorded definitions) and the catalogue store from 002; T036 is blocked on a wireframe pass, since drawing 02 predates FR-025.
- **US4 (Phase 6)** needs Phase 2 + T010. T038 → T039; T040 independent after T010; T041–T043 parallel after T040.
- **Story order**: US1 → US2 ship together (both P1); US3 and US4 are independent of each other after US1.
- **FR-024 (preserved artifacts)** is cross-cutting: T045's naming decisions are consumed by T004, T032 and T039, so land T045 early if those are being written in parallel — it is placed in polish only because its own surface (T046) is not needed to make any story testable.

### Parallel opportunities

- Phase 2: T004 ∥ T005 ∥ T008 after T003.
- US1: T011 ∥ T010; then T014 ∥ T015 ∥ T016 ∥ T017.
- US2: T020 ∥ T023 ∥ T024 once the contract shape from T021 is agreed.
- US3: T027 ∥ T028 ∥ T029; then T034 ∥ T030 (adoption and divergence are independent).
- US4: T041 ∥ T042 ∥ T043 after T040.
- Cross-story: after US1, one track can take US3 while another takes US4.

## Implementation Strategy

**MVP = Phase 1 + Phase 2 + US1** (T001–T019): plans are real files with
guards, recents and recovery. **US2 must ship in the same release** — an
existing user updating to file-plans without the migration is the
destroyed-work scenario SC-002 forbids. US3 and US4 then land as independent
increments; US4's T038 (format versioning) is cheap insurance worth pulling
forward if release timing threatens to slip, since FR-019 is already satisfied
by T003 writing `formatVersion` from the first file.

**No blocked tasks.** Wireframe 03 closed the gap FR-024 and FR-025 opened:
every renderer task in this feature now has an approved drawing behind it.
