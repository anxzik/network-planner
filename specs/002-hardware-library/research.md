# Phase 0 Research: Hardware Library

**Feature**: 002-hardware-library
**Date**: 2026-09-02

Four unknowns came out of Technical Context. Each is resolved below with what
was verified rather than assumed.

## R1. Which database

**Decision**: `node:sqlite`, the SQLite module built into Node, used from the
Electron main process.

**Rationale**: Verified directly against this project's Electron build rather
than inferred. Electron 40.0.0 bundles Node 24.11.1, and `require('node:sqlite')`
resolves inside it:

```
{"node":"24.11.1","electron":"40.0.0","chrome":"144.0.7559.60"}
node:sqlite available: true
```

This matters more than it first appears. Every other SQLite option for Electron
is a native module, which means `electron-rebuild` in the toolchain, a compiled
binary per platform in the packaging step, and a rebuild whenever the Electron
version moves. The deb, rpm, squirrel and zip makers in `forge.config.ts` would
each carry that weight. A built-in module has none of it.

**Caveat, and it is a real one**: Node prints
`ExperimentalWarning: SQLite is an experimental feature and might change at any
time`. The API can change under a Node upgrade, which arrives with an Electron
upgrade rather than on our schedule. Confining every call behind one module
(`src/utils/` cannot hold it, see R3) keeps the blast radius to a single file.

**Alternatives considered**:

- `better-sqlite3`: mature, synchronous, excellent API. Rejected for the native
  build chain across four packaging targets.
- A JSON file: rejected by ADR 0010 already. Rewrites the whole catalogue per
  edit and offers no partial-write protection.
- `sql.js` (SQLite compiled to WebAssembly): no native build, but holds the
  database in memory and must be serialised out by hand, which reintroduces the
  whole-file rewrite that ADR 0010 rejected.

## R2. Library file format

**Decision**: JSON, with a `formatVersion` field at the top level.

**Rationale**: The product owner named JSON directly. It also matches the shape
the existing catalogue already has in `src/data/devices.js`, where each of the
131 records is a plain object, so the migration in FR-022 is a transcription
rather than a redesign.

`formatVersion` sits at the top so FR-013 can read it before parsing the rest,
and warn about an unrecognised version while still importing what it can.

**Alternatives considered**: YAML, rejected as a dependency for no gain over
JSON; a zip bundle carrying symbols as separate files, deferred because symbols
are SVG text and embed in JSON without trouble.

## R3. Where the database code lives, given Principle I

**Decision**: a single main-process module owns every database call. Pure
decision logic stays in `src/utils/` and never touches the database.

**Rationale**: This is the tension the constitution does not currently resolve.
Principle I puts logic in `src/utils/` with co-located tests under
`environment: 'node'`. A database handle is not pure and cannot live there.

The split that satisfies both: `src/utils/` holds the functions that decide
things, and they take plain data and return plain data. Validating an appliance
type, reading a format version, detecting collisions, deciding what a merge
should do, comparing a plan's recorded definition against the catalogue. The
main-process module executes those decisions against SQLite and holds no logic
of its own worth testing.

Concretely, collision resolution is a pure function from (incoming entries,
existing entries, chosen strategy) to (apply, skip, report). It is fully
testable without a database, which is what makes FR-009, FR-010 and FR-011
verifiable at all.

**Alternatives considered**: putting query logic in `src/utils/` behind an
injected handle, rejected because it drags a database dependency into the tested
core and makes the tests integration tests wearing a disguise.

## R4. What access control means in a single-user desktop application

**Status**: NEEDS CLARIFICATION, and it blocks FR-029 and FR-030 only.

FR-028 to FR-030 require approved equipment to be restricted from change. In a
desktop application with no accounts and no server, there is no established
identity to check against. Three shapes are possible and they are not close
together:

1. **A passphrase set on the approved set.** Changing approved equipment
   prompts for it. Simple, offline, and weak against anyone determined; it
   stops mistakes rather than people.
2. **The operating system user.** Approved equipment is marked with the user
   who approved it, and only that account may change it. No secret to manage,
   but useless on a shared login and unenforceable once the file is copied.
3. **A signed catalogue.** The organisation signs its approved set; the
   application verifies and refuses local modification. Strongest, and much the
   largest piece of work.

The right answer depends on whether the concern is a colleague making a careless
edit or one making a deliberate one. The spec does not say, and this research
cannot settle it.

**Effect on the plan**: FR-028 (marking equipment approved) is unaffected and
proceeds. FR-029 and FR-030 are deferred to a follow-up, and Phase 1 designs the
`approved` flag so a mechanism can be attached later without reshaping the data.

## R5. Sequencing conflict with ADR 0011

**Finding**: FR-005a requires a plan to record the definition of every type it
places. Plans are still held in `localStorage` today. Project files on disk are
[ADR 0008](../../docs/adr/0008-project-files-on-disk.md) and are item 2 in the
`CONTEXT.md` build order, after this feature.

So this feature carries a requirement that the next feature's format has to
satisfy. Two orders are possible:

- Build the snapshot into the current `localStorage` shape now, and migrate it
  again when project files arrive. Two migrations for one idea.
- Ship the catalogue now and add snapshots with project files, leaving FR-005a
  to FR-005c unimplemented in this feature.

**Decision**: the second. This feature delivers the catalogue, the database, and
import and export. Snapshotting moves to the project-file feature, where the
format it depends on actually exists.

This is a change to what the specification promises, not a detail, and it is
recorded here rather than absorbed silently. Until it lands, editing a type in
the library still changes what existing plans resolve, which is the behaviour
ADR 0011 exists to prevent.
