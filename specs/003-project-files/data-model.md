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

## PartialSave (`<plan>.partial-<ts>`)

The preserved interrupted write (folded FR-008). Never opened as a plan;
listed to the person, removable by them.

## Classification result (pure, from planFile.js)

`current | older(version) | newer(version) | unreadable` — mirroring
`readLibraryFile`'s kinds; `older` carries the upgraded document plus the
copied-aside original path obligation (FR-020).
