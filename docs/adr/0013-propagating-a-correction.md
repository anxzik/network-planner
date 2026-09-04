# 0013. A correction can be pushed to every plan carrying an old copy

**Status:** Accepted
**Date:** 2026-09-03

## Context

[ADR 0012](0012-updating-a-diverged-plan.md) let a person update one plan whose
recorded definition had diverged from the catalogue. It closed a gap ADR 0011
had recorded, and left another open in the same paragraph: updating one plan
says nothing about the others, and there is still no way to push a correction
across every plan at once.

That limit does not survive contact with the ordinary case. A wrong port count
on a common switch model is not wrong in one plan. It is wrong in every plan
that placed it, which for a standard access switch could be most of them.
Offering the fix one plan at a time means the person opens plans they were not
otherwise working on, purely to accept a prompt.

## Decision

The application can apply a corrected definition to every plan that carries an
older copy of that appliance type, as one action the person chooses.

The person is shown which plans would change before anything happens, and may
apply to all, to a subset, or to none. Nothing is written without that choice.

This supersedes the "one plan at a time" limit recorded in ADR 0012. The
per-plan offer stays: it is what happens when a plan is opened, and it remains
the only path for a plan the person does not want changed in bulk.

## Consequences

A correction can now actually reach the work it affects, which is what makes
correcting a shipped definition worth doing at all.

The costs are larger than the per-plan offer's. Finding which plans carry an old
copy means reading plans that are not open, so the application has to know where
a person's plans live and be able to inspect them without loading them into the
canvas. That is a capability this project does not have and did not previously
need.

Applying a change to a plan that is not open is also the first time this
application modifies a plan the person is not looking at. If one of those writes
fails partway, the person finds out later, on a plan they were not watching. The
same integrity requirement that covers the catalogue now has to cover these
writes.

And a bulk apply is harder to undo than a single one. Nothing here specifies how
a person reverses it, which is left open rather than assumed away.
