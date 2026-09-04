# Contract: Renderer to Main Bridge

**Feature**: 002-hardware-library

`src/preload.ts` is currently empty, so this feature defines the first bridge
this application has. Everything below is exposed on `window.networkPlanner.library`
through `contextBridge`.

## Constraints this contract must hold

From the spec's Process Boundary section and constitution Principle III:

- The renderer never receives a filesystem path it could reuse to reach another
  file. Dialogs open in main; only results cross back.
- The renderer never gets a database handle, a connection, or a query string.
- Every call is asynchronous and every call can fail. Failure is a returned
  result, never an unhandled rejection that reaches the canvas.

## Result shape

Every method resolves to the same envelope, so the renderer has one failure path
rather than one per call.

```
{ ok: true,  value: <payload> }
{ ok: false, error: { code: <string>, message: <string> } }
```

`message` is written for the person, not the log. `code` is stable and
machine-checkable.

## Methods

| Method | Takes | Returns | Requirements |
|---|---|---|---|
| `list(query)` | `{ search?, category?, plane?, origin? }` | `ApplianceType[]` | FR-017, FR-018 |
| `get(id)` | `string` | `ApplianceType` | |
| `create(type)` | `ApplianceType` draft | created `ApplianceType` | FR-001, FR-020, FR-024 |
| `update(id, changes)` | | updated `ApplianceType` | FR-002, FR-025 |
| `remove(id)` | `string` | `{ removed: true }` | FR-004, FR-005 |
| `restoreShipped(id)` | `string` | `ApplianceType` | FR-003 |
| `markApproved(id, approved)` | | `ApplianceType` | FR-028 |
| `usage(id)` | `string` | `{ topologies: string[] }` | FR-005 |
| `exportLibrary(ids?)` | `string[]` optional | `{ path }` | FR-006, FR-007 |
| `importLibrary()` | none, opens a dialog | `ImportReport` | FR-008 to FR-013 |
| `previewImport()` | none, opens a dialog | `{ collisions, formatWarning }` | FR-009 |
| `importSymbols()` | none, opens a dialog | `{ added, skipped }` | FR-014 |
| `listSymbols()` | none | `SymbolSet[]` with symbols | |

`previewImport` exists so FR-009 can present collisions and let the person
choose **before** anything is written. `importLibrary` then applies the chosen
resolution.

## Error codes

| Code | Meaning | Requirement |
|---|---|---|
| `TYPE_IN_USE` | Deletion refused; `usage()` names the plans | FR-005 |
| `VALIDATION_FAILED` | Draft rejected; `message` names the field | FR-001 |
| `PORT_LIMIT_EXCEEDED` | Layout beyond the limit; `message` states it | FR-024 |
| `FILE_UNREADABLE` | Not valid JSON, or not a library file | FR-011 |
| `FORMAT_VERSION_UNKNOWN` | Warning only; import still proceeds | FR-013 |
| `APPROVED_LOCKED` | Change refused on approved equipment | FR-030, deferred |
| `STORAGE_FAILED` | Write failed; catalogue unchanged | FR-027 |
| `CANCELLED` | The person closed the dialog | |

`CANCELLED` is a normal outcome, not an error condition, and the renderer must
not present it as a failure.

## Confirmation flows

Two operations require confirmation before they complete, and the decision
belongs to the renderer:

- **Portless type** (FR-020): `create` returns `VALIDATION_FAILED` with code
  detail `NO_PORTS_CONFIRM` unless the draft carries `confirmedNoPorts: true`.
- **Import collisions** (FR-009): resolved through `previewImport`, then passed
  to `importLibrary` as a per-collision choice of `replace`, `keepBoth` or
  `skip`.

## Not in this contract

Placed appliances, topologies, and the recorded definitions of
[ADR 0011](../../docs/adr/0011-plans-snapshot-appliance-types.md). Those cross
the bridge in the project-file feature, not this one.
