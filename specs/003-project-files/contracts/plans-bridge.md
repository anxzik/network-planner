# Contract: Plans over the Bridge

**Feature**: 003-project-files. Extends `window.networkPlanner` with a `plans`
namespace beside `library`. Same envelope, same constraints: no reusable paths
to the renderer (plan *names* and opaque recent-ids cross; paths do not), every
call async, failure is a returned envelope.

## Methods

| Method | Takes | Returns | Reqs |
|---|---|---|---|
| `state()` | — | `{ name, dirty, readOnly, source }` | FR-005 |
| `newPlan()` | — | `{ ok }` after unsaved-prompt flow | FR-003, FR-006 |
| `open()` | dialog | plan document + `{ readOnly, notice? }` | FR-002, FR-021 |
| `openRecent(id)` | recent-id | as `open()` | FR-007 |
| `save(document)` | plan content | `{ name }` | FR-001, FR-008 |
| `saveAs(document)` | dialog | `{ name }` | FR-004, FR-021 copy path |
| `listRecents()` | — | `[ { id, name, exists } ]` | FR-007 |
| `removeRecent(id)` | — | `{ removed }` | FR-007 |
| `checkOldStorage(raw)` | renderer's storage root | `{ offer: none\|migrate\|salvage, preview }` | FR-010, FR-012, R4 |
| `migrate(raw, accept)` | — | plan document + marker instruction | FR-011, FR-012 |
| `recoverySlot()` / `saveRecovery(document)` / `clearRecovery()` | — | slot ops | FR-009 |
| `divergences(document)` | — | `[ { typeId, planCopy, current } ]` | FR-016 |
| `applyUpdate(document, typeId)` | — | updated document | FR-016 |
| `broadApplyPreview(typeId)` | — | `{ reachable:[{id,name}], unreachable:[{name,reason}] }` | FR-018 |
| `broadApply(typeId, ids)` | chosen recents | per-plan results | FR-018 |
| `adoptable(document)` | open plan | `[ { typeId, name, inCatalogue } ]` | FR-025 |
| `adopt(document, typeIds)` | chosen types | `{ adopted:[typeId], skipped:[{typeId,reason}] }` | FR-025 |
| `listPreserved(planId)` | — | `[ { kind, name, redundant } ]` | FR-024 |
| `clearPreserved(planId, kind)` | — | `{ cleared }` | FR-024 |

## Error codes

`CANCELLED` (normal), `FILE_UNREADABLE`, `NEWER_FORMAT` (info, with read-only),
`SAVE_FAILED` (with partial-kept notice), `LOCKED` (read-only fallback),
`NOT_MIGRATED` — plus the library's existing codes unchanged.

## Hard rules

- A document opened with `readOnly` refuses `save` in **main**, not only in UI
  (R5). `saveAs` is the sole exit and its result is a new file.
- `save` is atomic (R1); on failure the envelope names the preserved partial —
  one `<plan>.partial` slot, replaced on a repeat failure, never accumulated.
- Preserved artifacts (FR-024) are listed by kind, never by path. `redundant`
  says clearing may be *offered*; nothing is cleared without `clearPreserved`.
- Divergence math is pure (`planDivergence.js`) and identical on both sides.
- `adopt` writes to the catalogue, never to the plan: the document passed in is
  read-only input, and the response says what entered the catalogue. A type
  already present is `skipped`, not overwritten — adoption never silently
  replaces a definition the person already has.
