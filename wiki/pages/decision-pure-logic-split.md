---
type: decision
updated: 2026-09-02
sources: [S001, S002]
---

# Where logic lives when storage is involved

This project puts domain logic in pure modules with co-located tests, run
without a DOM. A database handle is not pure and cannot live there (S001).

## The split adopted

Pure modules hold the functions that **decide** things, taking plain data and
returning plain data: validating an appliance type, reading a format version,
detecting collisions, deciding what a merge should do (S001). A separate
main-process module **executes** those decisions against storage and holds no
logic of its own worth testing (S001).

The clearest example: collision resolution is a pure function from incoming
entries, existing entries and a chosen strategy, to apply, skip and report
(S001). It is fully testable with no database, which is what makes the import
requirements verifiable at all (S001).

## Rejected

Putting query logic in the pure modules behind an injected handle. It drags a
storage dependency into the tested core and turns unit tests into integration
tests wearing a disguise (S001).

## Consequence

A new main-process location exists that the project's written conventions do
not describe, recorded as a deliberate deviation rather than passed off as
compliant (S002). See [[decision-catalogue-database]].
