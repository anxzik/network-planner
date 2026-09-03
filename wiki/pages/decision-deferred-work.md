---
type: decision
updated: 2026-09-02
sources: [S001, S002]
---

# Work deferred, and why

Two requirements were specified and then deliberately not built. Both are
recorded so they are not mistaken for oversights (S002).

## Restricting who may change approved equipment

A desktop application with no accounts and no server has no established
identity to check against (S001). Three shapes are possible and they are far
apart: a passphrase on the approved set, the operating system user, or a signed
catalogue verified by the application (S001).

The right answer depends on whether the concern is a colleague making a
careless edit or a deliberate one, and that has not been stated (S001).
Marking equipment approved still ships; only enforcement waits (S002).

## Plans recording the definitions they were placed with

A plan is meant to keep its own copy of every appliance type it places, so that
editing the catalogue does not rewrite plans made earlier (S001). Plans are
still held in browser storage, and the file format that would carry those
copies belongs to a later effort (S001).

Building it into the current storage shape would mean migrating the same idea
twice (S001).

> ⚠ Consequence worth remembering: until that lands, editing a type still
> changes what existing plans resolve, which is the exact behaviour the
> snapshot decision exists to prevent (S001).

See [[decision-pure-logic-split]] and [[concept-appliance-type]].
