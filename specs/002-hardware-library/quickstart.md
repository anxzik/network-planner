# Quickstart: Hardware Library

**Feature**: 002-hardware-library

How to prove this feature works. Each scenario maps to a user story and can be
run on its own.

## Prerequisites

```bash
npm install
npm start          # launches the Electron app via electron-forge
```

The catalogue database is created on first run and seeded with the 131 shipped
appliance types.

## Gates

These must pass before the feature is considered done, per the constitution:

```bash
npm run lint
npm test
npm run typecheck
```

## Scenario 1: the shipped catalogue survived the move (FR-022, SC-004)

1. Open the Hardware tab.
2. Confirm 131 types across 19 categories.
3. Place a Cisco Catalyst switch on the canvas.
4. Confirm its ports generate with Cisco labelling (`Fa0/0`, `Gi0/8`).

**Expected**: identical to behaviour before this feature. This is the check that
the migration out of `src/data/devices.js` lost nothing.

## Scenario 2: adding hardware the application does not know (US-001, SC-001)

1. Hardware tab, then **New**.
2. Enter a manufacturer, model, category, and a port group of 24 ethernet.
3. Save, then place it on the canvas.

**Expected**: 24 ports generate, labelled by the manufacturer's convention.

## Scenario 3: the port limit (FR-024)

1. Create a type with a port group of 100000.

**Expected**: refused, and the message states the limit. Nothing is saved.

## Scenario 4: a type with no ports (FR-020)

1. Create a type with no port groups and save.

**Expected**: a confirmation asking you to confirm, stating it will not be
connectable. Confirming saves it; declining does not.

## Scenario 5: export and import round trip (US-002, SC-002)

1. Select several types, then **Export**.
2. Delete one of the exported types, then **Import** the file.

**Expected**: the deleted type returns complete, with its symbol.

## Scenario 6: import collisions (FR-009)

1. Export a type, edit it in the library, then import the file.

**Expected**: the collision is shown before anything changes, offering replace,
keep both, or skip. The chosen action is what happens.

## Scenario 7: a damaged import (FR-010, FR-011, SC-003)

1. Take a valid export and corrupt one entry, leaving the rest intact.
2. Import it.

**Expected**: readable entries are applied, the bad one is skipped, and the
report names what was added, replaced and skipped, with a reason for each.

## Scenario 8: an unrecognised format version (FR-013)

1. Change `formatVersion` in an export to `99.0`, then import.

**Expected**: it imports what it can read and warns that the file came from a
version it does not fully understand. It is not silently discarded.

## Scenario 9: deletion is blocked while in use (FR-005, SC-005)

1. Place a type on the canvas, then try to delete it from the library.

**Expected**: refused, naming the plans still using it.

## Scenario 10: editing and restoring a shipped type (FR-002, FR-003, FR-018)

1. Edit a shipped type's port count. Confirm it is marked as edited.
2. Choose **Restore shipped definition**.

**Expected**: the original returns and the edited marking clears.

## Scenario 11: symbols (US-003, FR-014, FR-016)

1. Import a symbol set and assign one to a type.
2. Place the type on the canvas.

**Expected**: the imported symbol draws. A type with no symbol still draws a
recognisable default.

## Scenario 12: an interrupted write (FR-027, SC-008)

1. Begin a large import and terminate the application partway through.
2. Reopen it.

**Expected**: the catalogue is intact and readable, either with the import
applied or without it, never half-written.

## Not verifiable here

- **SC-007** was withdrawn. Start time is no longer a criterion; FR-026 carries
  the property that protects it, by not loading the whole catalogue.
- **FR-029, FR-030** (restricting approved equipment) are deferred pending R4 in
  `research.md`.
- **FR-005a to FR-005c** (plans recording their own definitions) move to the
  project-file feature. See R5.
