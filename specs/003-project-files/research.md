# Phase 0 Research: Project Files

**Feature**: 003-project-files · **Date**: 2026-09-03

## R1. How a save is made atomic

**Decision**: write to a temporary file in the same directory, flush, then
rename over the target. On failure at any step, the target is untouched and the
temporary becomes the preserved partial FR-008 now requires.

**Rationale**: rename within one directory is atomic on the filesystems the
four packaging targets use; writing in place is exactly how a disk-full failure
corrupts. No dependency needed. The preserved partial gets a recognisable
suffix (`.partial-<timestamp>`) beside the plan so the person can see it, which
the folded FR-008 demands.

**Alternatives considered**: write-in-place with backup copy (a window where
neither file is whole); a journal like SQLite's (the catalogue needs queries,
a plan file does not — ADR 0010's reasoning does not transfer).

## R2. The plan file format

**Decision**: JSON, `formatVersion` first, one document holding meta,
placed appliances with their recorded definitions, connections, VLANs,
scratchpad content, and per-type declined-offer memory.

**Rationale**: the interchange discipline is already established by
`libraryFile.js` — version read before anything else is trusted, best-effort
entry collection, the legacy branch pattern. The plan format reuses that shape
and its tests' vocabulary. Diffable text satisfies the version-control
assumption in the spec.

**Declined offers travel in the plan file** deliberately: a decline is a fact
about that plan, and FR-017 must hold when the file moves to another machine.

## R3. Where auxiliary state lives

**Decision**: small JSON files in the per-user data directory, beside the
catalogue database: `recents.json`, `recovery-slot.json`, and the migration
marker. Not new tables in the catalogue.

**Rationale**: different lifecycle, different owner. The catalogue is a
long-lived asset; recents and the recovery slot are disposable machine-local
state a person may clear without loss. Coupling them to the database schema
would put schema-version ceremony around throwaway data.

## R4. The migration's data path runs through the renderer

**Finding, not a choice**: the old topology lives in renderer `localStorage`,
which the main process cannot read. Migration therefore flows renderer → main:
the renderer reads the storage root (via the existing `storage.js`), hands the
raw content across the bridge, and main classifies, salvages if needed
(FR-012), writes the plan file, and reports. The renderer never writes files;
main never touches `localStorage`. The preserved original stays exactly where
it is, in `localStorage`, marked by a key main asks the renderer to set.

## R5. Read-only for newer formats

**Decision**: read-only is a mode the main process declares when classifying
the opened file, and the renderer disables every mutation path when it is set.
Enforcement backstop: main refuses `save` for a plan opened read-only, so a
renderer bug cannot violate never-write-back.

## R6. Two instances on one file

**Decision**: best-effort advisory lock — a `.lock` sidecar carrying pid and
timestamp, taken on open, removed on close, ignored when stale (dead pid or
older than a threshold). Second opener gets read-only with a notice, per the
spec's assumption. No OS-level mandatory locking: it is unreliable across the
platforms and filesystems in play, and the spec asks for best-effort.

## R7. What FR-018's broad apply may touch

**Restated from the spec to bound the design**: reach is the recents list.
The implementation opens each reachable plan file through the same
read-classify path as an ordinary open, applies the accepted definition update,
and saves through R1's atomic path — with the same per-file original-kept
discipline FR-020 uses. A locked or missing file is reported unreachable, never
queued.
