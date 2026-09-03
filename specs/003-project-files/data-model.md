# Phase 1 Data Model: Project Files

**Feature**: 003-project-files · **Date**: 2026-09-03

## PlanFile (the `.netplan` document)

`formatVersion` first, per the discipline `libraryFile.js` established.

```
{
 "formatVersion": "1.0",
 "savedAt": "<ISO 8601>",
 "name": "<display name>",
 "appliances":   [ PlacedAppliance, ... ],
 "connections":  [ Connection, ... ],
 "vlans":        [ Vlan, ... ],
 "scratchpad":   { ... as ScratchpadContext persists today ... },
 "recordedDefinitions": { "<typeId>": ApplianceType, ... },
 "declinedOffers": { "<typeId>": "<catalogue updatedAt declined>", ... }
}
```

| Field | Notes |
|---|---|
| `appliances` | The ReactFlow node shape the canvas already uses, unchanged |
| `recordedDefinitions` | One full definition per distinct placed type (ADR 0011); the shape `shippedTypes.json` and the catalogue already share |
| `declinedOffers` | FR-017's memory, travelling with the plan (R2); keyed by type, valued by the catalogue version declined, so a *newer* correction re-offers |

## RecoverySlot (`recovery-slot.json`, userData)

The unsaved-changes capture (FR-009): the same document shape as PlanFile plus
`sourcePath` (null for untitled) and `capturedAt`. Cleared on clean save/exit.

## RecentsList (`recents.json`, userData)

`[ { path, name, lastOpened } ]`, newest first, pruned only through FR-007's
offer-to-remove — never silently.

## MigrationMarker (in the old `localStorage` root)

`{ migratedTo: "<file name>", migratedAt }` written by the renderer at main's
request after a successful US2 migration. Presence suppresses re-offers
(edge case: re-trigger shows "already migrated", offers re-export).

## LockSidecar (`<plan>.lock`)

`{ pid, hostname, openedAt }` — advisory, stale-tolerant (R6).

## Adopted type (FR-025)

A recorded definition promoted into the catalogue. It enters as a
locally-created type (`origin: 'local'`, the shape 002 already stores) with
`adoptedFromPlan` recording the plan name it came from. The plan is not
modified by adoption; the catalogue gains a row, and subsequent opens of that
plan simply find the type present. A type whose id already exists is skipped,
never overwritten.

## Preserved artifacts (FR-024)

One predictably named slot per plan per kind. A repeat occurrence **replaces**
the slot; nothing accumulates. All three are listable and clearable on request,
and none is ever removed unasked.

| Artifact | Name | Holds | Cleared when |
|---|---|---|---|
| PartialSave | `<plan>.partial` | The interrupted write — newer than the plan file, possibly incomplete (FR-008) | The person clears it; offered after a later save succeeds |
| UpgradeOriginal | `<plan>.<fromVersion>.original` | The pre-upgrade file, one per plan regardless of how often it is reopened (FR-020) | Offered once the upgraded plan has been saved whole |
| BroadApplyOriginal | `<plan>.preapply.original` | The pre-broad-apply copy (FR-018/R7) | Offered after the applied plan is verified by the person |

None is ever opened as a plan. A reopen that finds its slot already occupied
leaves the existing copy alone — the older content is the one worth keeping.

## Classification result (pure, from planFile.js)

`current | older(version) | newer(version) | unreadable` — mirroring
`readLibraryFile`'s kinds; `older` carries the upgraded document plus the
copied-aside original path obligation (FR-020).
