# Phase 1 Data Model: Hardware Library

**Feature**: 002-hardware-library
**Date**: 2026-09-02

Entities derive from the spec's Key Entities section. Field names follow the
existing catalogue in `src/data/devices.js` wherever one already exists, so the
131 shipped types transcribe rather than convert (FR-022).

## ApplianceType

The kind of hardware that can be placed. One row per type.

| Field | Type | Notes |
|---|---|---|
| `id` | text, primary key | Existing catalogue ids carry over (`gen-router-001`) |
| `name` | text, required | Display name |
| `manufacturer` | text, required | Drives vendor port labelling in `portFactory` |
| `model` | text, required | |
| `category` | text, required | One of the 19 existing categories |
| `description` | text | |
| `planes` | text, required | Which planes it belongs to (FR-019) |
| `icon` | text | Symbol identifier, resolves against Symbol |
| `color` | text | Hex, as today |
| `specifications` | json | Port layout, features, layer |
| `origin` | text, required | `shipped` or `local` (FR-018) |
| `approved` | integer | 0 or 1 (FR-028) |
| `editedFromShipped` | integer | 1 when a shipped type has been changed (FR-003) |
| `shippedDefinition` | json | The original, kept so FR-003 can restore it |
| `createdAt`, `updatedAt` | text | ISO 8601 |

**Validation rules**, all pure and testable in `src/utils/`:

- `name`, `manufacturer`, `model`, `category` are non-empty (FR-001)
- `planes` names at least one known plane (FR-019)
- `specifications.ports` may be absent or empty (FR-020)
- total generated port count does not exceed the limit (FR-024)
- `origin` is `shipped` or `local`
- `shippedDefinition` is present when `origin` is `shipped`

**State transitions**:

```
shipped ──edit──> shipped + editedFromShipped=1 ──restore──> shipped
local   ──edit──> local
local   ──delete──> removed, only when no plan places it (FR-005)
any     ──mark approved──> approved=1 (FR-028)
```

## PortGroup

Not a table. A group inside `specifications.ports`, keyed by port kind, matching
what `portFactory.generatePortsForDevice` already reads.

| Field | Type | Notes |
|---|---|---|
| kind | key | One of 16: `ethernet`, `ethernet10g`, `ethernet25g`, `sfp`, `sfpPlus`, `sfp28`, `sfp56`, `qsfp`, `qsfpPlus`, `qsfp28`, `qsfpdd`, `fiber`, `coax`, `rj11`, `wan`, `slots` |
| `count` | integer | Ports in this group |
| `speed` | text | Defaults to `1Gbps` |
| `poe` | boolean | Defaults to false |

`slots` are module slots rather than connectable ports and are excluded from
port generation, which is existing behaviour that must be preserved.

## Symbol

How a type is drawn.

| Field | Type | Notes |
|---|---|---|
| `id` | text, primary key | |
| `setId` | text, required | Owning symbol set |
| `name` | text, required | |
| `content` | text, required | SVG markup |
| `origin` | text, required | `shipped` or `imported` |

A type with no resolvable symbol falls back to a default (FR-015).

## SymbolSet

| Field | Type | Notes |
|---|---|---|
| `id` | text, primary key | |
| `name` | text, required | e.g. "Standard", "Acme house style" |
| `origin` | text, required | `shipped` or `imported` |

## LibraryFile

Not stored. The import and export interchange shape.

```
{
  "formatVersion": "1.0",
  "exportedAt": "<ISO 8601>",
  "applianceTypes": [ ApplianceType, ... ],
  "symbolSets":     [ SymbolSet, ... ],
  "symbols":        [ Symbol, ... ]
}
```

`formatVersion` is read before anything else, so an unrecognised version can be
warned about while still importing what is readable (FR-013).

## ImportReport

Not stored. Returned to the renderer and shown after an import (FR-011).

| Field | Type | Notes |
|---|---|---|
| `added` | ApplianceType[] | |
| `replaced` | ApplianceType[] | |
| `skipped` | `{ entry, reason }[]` | Reason is required, never blank |
| `collisions` | `{ incoming, existing }[]` | Presented before applying (FR-009) |
| `formatWarning` | text or null | Set when the version was unrecognised |

## Relationships

```
SymbolSet 1 ──── * Symbol
Symbol    1 ──── * ApplianceType     (via icon)
ApplianceType 1 ── * PlacedAppliance (in a topology, out of scope here)
```

## Deferred

`PlacedAppliance` and the recorded definition it carries
([ADR 0011](../../docs/adr/0011-plans-snapshot-appliance-types.md), FR-005a to
FR-005c) are **not** modelled here. They belong to the project file, which does
not exist yet. See R5 in `research.md`.
