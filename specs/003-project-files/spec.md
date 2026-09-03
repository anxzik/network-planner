# Feature Specification: Project Files

**Feature Branch**: `003-project-files`
**Created**: 2026-09-03
**Status**: Draft

## User Scenarios & Testing *(mandatory)*

A plan is the most valuable thing a person makes in this application, and today
it lives in one invisible browser-storage slot: one plan, no name, no way to
hand it to anyone, trapped in the application's profile directory. This feature
makes a plan a file — something a person can name, keep, back up, put in
version control, and send to a colleague.

It also settles three debts recorded when the hardware library shipped: a plan
carrying its own copies of the appliance types it places, the offer to update a
diverged copy, and the safe-migration promises originally specified for the old
storage before it was superseded.

### User Story 1 - A plan is a file (Priority: P1)

A person designs a site, saves it as a named file where they choose, closes the
application, and opens the file next week — or on a different machine.

**Why this priority**: Everything else in this feature and the two planes that
follow it assume a plan is an addressable thing. This is the capability itself.

**Independent Test**: Save a topology to a chosen location, reopen the
application, open the file, and confirm every device, connection, VLAN and note
is exactly as saved.

**Acceptance Scenarios**:

1. **Given** a topology on the canvas, **When** the person saves it, **Then**
   they choose a name and location, and the plan is written there.
2. **Given** a saved plan, **When** the person opens it, **Then** the canvas
   shows every appliance, connection, port assignment, VLAN and scratchpad note
   as saved, and the application shows which plan is open.
3. **Given** an open plan with unsaved changes, **When** the person tries to
   close it, open another, or start a new one, **Then** they are asked whether
   to save first, and declining loses nothing until they confirm.
4. **Given** an open plan, **When** the person chooses Save As, **Then** a copy
   is written to the new location and that copy becomes the open plan.
5. **Given** recently opened plans, **When** the person looks for them, **Then**
   the application lists them for reopening without a file dialog.

### User Story 2 - The existing plan moves out of browser storage (Priority: P1)

A person who has been using the application opens this version for the first
time. Their existing topology is waiting for them, now as a file.

**Why this priority**: Every current user crosses this bridge exactly once, and
a failure here is the destroyed-work scenario this project has twice written
requirements against. It ships with US1 or existing users lose the feature's
benefit — or worse, their work.

**Independent Test**: With a topology in the old storage, start the updated
application, and confirm the plan appears intact as a file, with the original
storage preserved until the person confirms the migration succeeded.

**Acceptance Scenarios**:

1. **Given** a topology in the old browser storage, **When** the updated
   application first starts, **Then** the plan is offered as a file migration,
   not silently converted.
2. **Given** the person accepts, **Then** the topology becomes a named file,
   opens on the canvas, and the old storage is kept, marked migrated, until
   they choose to clear it.
3. **Given** the old storage cannot be read, **Then** its raw content is
   preserved untouched, the person is told a copy was kept, and the application
   starts with an empty canvas rather than destroying anything.
4. **Given** a first-run with no old storage, **Then** no migration prompt, no
   warning — an ordinary empty start.

### User Story 3 - A plan opens anywhere and stays truthful (Priority: P2)

A person sends their site plan to a colleague whose catalogue has never seen
the equipment in it. It opens complete. Later, the library corrects a port
count; plans built on the old definition are offered the fix, one by one, and
nothing changes without consent.

**Why this priority**: This is the deferred FR-005 family from the hardware
library, buildable only now that a plan is a file with a place to carry copies.

**Independent Test**: Place a locally-created type, save, delete the type from
the catalogue, reopen the plan — it renders completely. Edit a placed type in
the library, reopen — the divergence is shown and the offer appears.

**Acceptance Scenarios**:

1. **Given** a plan placing an appliance type, **When** it is saved, **Then**
   the file records the full definition it was placed with.
2. **Given** a plan whose recorded definitions are absent from the opening
   machine's catalogue, **When** it opens, **Then** every appliance renders
   from its recorded definition, complete.
3. **Given** a placed type whose recorded definition differs from the
   catalogue's current one, **When** the plan opens, **Then** the application
   makes clear which is shown and offers to update the plan's copy; declining
   changes nothing and is remembered for that plan.
4. **Given** a corrected definition and several recent plans carrying the old
   copy, **When** the person chooses to apply it broadly, **Then** they are
   shown which plans would change and choose all, some, or none before
   anything is written.

### User Story 4 - Old and damaged files are handled safely (Priority: P2)

Months from now, the file format has grown. A person opens a plan written by
an older version — or a file that got corrupted in a sync folder.

**Why this priority**: These are the promises of the superseded
storage-migration feature, re-homed to files where they were always going to
matter. The format versioning must exist from the first file written, or there
is nothing to upgrade from later.

**Acceptance Scenarios**:

1. **Given** a plan written by an older version of the application, **When** it
   opens, **Then** it is brought forward to the current form and a copy of the
   original file is kept beside it until the person removes it.
2. **Given** a plan recording a version newer than the application understands,
   **Then** it is not opened, not modified, and the person is told it needs a
   newer application.
3. **Given** a file that cannot be read at all, **Then** it is left untouched,
   the person is told what happened, and nothing overwrites it.
4. **Given** a save that fails partway — disk full, permission lost — **Then**
   the previous file content survives intact.

### Edge Cases

- The person saves onto a path that already holds a different plan.
- The open plan's file is renamed, moved or deleted outside the application
  while it is open.
- A recent-files entry points at a file that no longer exists.
- The same plan file is opened by two application instances.
- A recorded appliance definition in a plan fails today's validation rules.
- The old browser storage holds data marked migrated, and the person triggers
  migration again.
- A plan is saved onto a cloud-synced folder that later delivers a conflicting
  copy.
- The application is force-quit with unsaved changes on the canvas.

## Requirements *(mandatory)*

### Functional Requirements

**Files**

- **FR-001**: A person MUST be able to save the open plan as a file, choosing
  its name and location.
- **FR-002**: A person MUST be able to open a plan file, replacing the canvas
  content after any unsaved-changes prompt.
- **FR-003**: A person MUST be able to start a new, empty plan.
- **FR-004**: Save As MUST write a copy to a new location and make it the open
  plan, leaving the original file as it was.
- **FR-005**: The application MUST always show which plan is open and whether
  it has unsaved changes.
- **FR-006**: Closing, opening or starting a new plan with unsaved changes MUST
  prompt to save, and nothing is lost until the person chooses.
- **FR-007**: The application MUST list recently opened plans; an entry whose
  file has vanished is offered for removal, never silently dropped.
- **FR-008**: A failed or interrupted save MUST leave the previous file content
  intact.
- **FR-009**: The application MUST recover unsaved work after a crash or
  force-quit, offering it on next start.

**Migration from browser storage**

- **FR-010**: On first start after this feature, an existing topology in the
  old storage MUST be offered as a migration to a file, never converted
  silently.
- **FR-011**: The old storage MUST be preserved, marked migrated, after a
  successful migration, until the person chooses to clear it.
- **FR-012**: Old storage that cannot be read MUST be preserved untouched, with
  the person told a copy was kept; the application MUST NOT overwrite it.
- **FR-013**: A first run with no old storage MUST show no migration prompt and
  no warning.

**Recorded definitions (the FR-005 family, delivered)**

- **FR-014**: A saved plan MUST record the full definition of every appliance
  type it places.
- **FR-015**: A plan MUST open completely on a machine whose catalogue lacks
  its types, rendering from recorded definitions.
- **FR-016**: When a recorded definition differs from the catalogue's current
  one, the application MUST make clear which is shown and MUST offer to update
  the plan's copy; nothing changes unless the person accepts.
- **FR-017**: A declined update offer MUST be remembered per plan and per type,
  and not re-asked on every open.
- **FR-018**: The application MUST be able to apply a corrected definition
  across the plans it knows about, showing which would change and applying only
  to those chosen; a plan it cannot reach is listed as unreachable, not
  guessed at.

**Format lifecycle**

- **FR-019**: Every plan file MUST record the format version it was written in.
- **FR-020**: A file in an older format the application understands MUST be
  brought forward on open, with the original file copied aside first and kept
  until the person removes it.
- **FR-021**: A file recording a newer format MUST NOT be opened or modified;
  the person MUST be told it needs a newer application.
- **FR-022**: A file that cannot be read MUST be left untouched and reported;
  nothing MUST ever overwrite it.
- **FR-023**: Bringing a file forward MUST be deterministic, depending only on
  the file's content.

### Key Entities

- **Plan file**: a person's topology as a portable file — appliances,
  connections, VLANs, scratchpad content, recorded appliance definitions, and
  a format version.
- **Recorded definition**: the full appliance-type definition a plan carries
  for each type it places, fixed at placement time (ADR 0011).
- **Recent plans**: the application's memory of where a person's plans are,
  which is also the reach of a broad update (FR-018).
- **Migration marker**: what the old storage becomes after its content moves to
  a file — preserved, labelled, clearable.

## Process Boundary

- **Scope**: Requires main-process work throughout.
- **Node/OS capability needed**: file dialogs, reading and writing plan files,
  the atomic-save discipline of FR-008, and the crash-recovery slot of FR-009.
- **Bridge surface**: the renderer requests operations and receives results and
  plan content. Paths stay in the main process; the renderer sees plan names,
  not reusable paths — the same constraint the hardware library's bridge
  already enforces.

## Persistence

- **What persists**: plans as files wherever the person puts them; the
  recent-plans list, the crash-recovery slot, and per-plan declined-offer
  memory in the application's own storage.
- **Where**: plan files are the person's; everything else lives beside the
  catalogue database in the per-user data directory.
- **Shape change**: the topology leaves browser storage permanently. The
  catalogue database (ADR 0010) is unaffected.
- **Migration**: US2 is the migration, and it is the last obligation of the old
  storage: after it, browser storage holds only a preserved, labelled copy.

## Testability

- **Logic to extract**: serialising and reading a plan file, format-version
  classification and upgrade steps, divergence detection between recorded and
  current definitions, the update-offer decision including remembered
  declines, migration classification of old storage, and recent-list pruning
  decisions. All pure, all in `src/utils/` with co-located tests.
- **Left in the component**: dialogs, the unsaved-changes prompt, the title-bar
  state, the migration and update-offer surfaces.
- **Manual verification**: dialog flows, crash recovery, two-instance
  behaviour, and cloud-sync conflict handling.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A plan saved on one machine opens on another with every element
  intact, including appliances whose types the second machine has never seen.
- **SC-002**: No existing user loses their topology crossing the migration, and
  the old storage remains recoverable until they clear it.
- **SC-003**: No failure mode — failed save, damaged file, newer format, crash
  — destroys a byte the person had not already chosen to discard.
- **SC-004**: A person always knows which plan is open and whether it is saved.
- **SC-005**: A correction in the library can reach every reachable plan built
  on the old definition, without any plan changing on its own.
- **SC-006**: Every upgrade path from every released format version to the
  current one is covered by an automated test.
- **SC-007**: A first-time user sees no migration prompts, warnings or errors.

## Assumptions

Decided rather than left open; each is challengeable.

- **One plan open at a time.** File > New / Open / Save / Save As, one canvas.
  Multiple windows are out of scope until someone needs them.
- **Explicit save with continuous crash protection.** The person saves
  deliberately (FR-005's dirty flag is meaningful), while a recovery slot
  captures unsaved work continuously (FR-009). Silent autosave to the person's
  file would make "unsaved changes" meaningless and turn mistakes permanent.
- **Plan files use the `.netplan` extension**, visible in dialogs and file
  managers. The content is a versioned text format, diffable in version
  control.
- **"Plans it knows about" (FR-018) means the recent list.** The application
  never scans a disk for plan files; reach is what the person has opened.
  ADR 0013 recorded reversal of a bulk apply as open; per-plan file copies
  made before applying (FR-020's discipline) are the answer inherited here.
- **Two instances on one file**: second opener gets read-only with a notice.
  Detected best-effort; cloud-sync conflicts surface as ordinary conflicting
  copies (edge case), not corruption, because saves are atomic.
- **The library remains app-level** (002's assumption stands); recorded
  definitions make plans self-contained without bundling the catalogue.

## Dependencies

- Builds on the hardware library (PR #15): the bridge pattern, the catalogue as
  the source of current definitions, and `importMerge`-style pure-module
  discipline.
- Delivers the deferred FR-005a–e family from
  `specs/002-hardware-library/spec.md`.
- [ADR 0008](../../docs/adr/0008-project-files-on-disk.md) — the decision this
  feature implements; [ADR 0011](../../docs/adr/0011-plans-snapshot-appliance-types.md),
  [0012](../../docs/adr/0012-updating-a-diverged-plan.md),
  [0013](../../docs/adr/0013-propagating-a-correction.md) — the recorded-definition
  behaviours; [ADR 0002](../../docs/adr/0002-localstorage-persistence.md)
  (superseded) — whose two defects US2 and US4 finally retire.
