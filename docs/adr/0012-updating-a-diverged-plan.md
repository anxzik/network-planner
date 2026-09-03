# 0012. A plan can be offered the library's current definition

**Status:** Accepted
**Date:** 2026-09-03

## Context

[ADR 0011](0011-plans-snapshot-appliance-types.md) gave every plan its own copy
of the appliance types it places, so that editing the catalogue cannot rewrite
plans made earlier. It recorded a cost in the same breath: a corrected
definition never reaches a plan already built on the old one, and nothing pushes
a fix forward. It said someone would eventually want that.

They did, twice. Comprehension validation asked what should happen when a plan's
recorded definition differs from the library's current one, and the answer both
times was that the application should offer to update the plan. The
specification only required making the difference visible.

A wrong port count is the ordinary case. Someone corrects a switch model in the
catalogue, and every site plan built on it stays wrong, silently, with no route
to the fix short of deleting and re-placing the device.

## Decision

When a plan's recorded definition of an appliance type differs from the
library's current one, the application offers to update the plan's copy.

The offer is a choice, not an action. Declining is a first-class outcome and the
plan keeps what it has. Accepting replaces that plan's copy with the current
definition.

This does not weaken ADR 0011. Nothing updates on its own, and nothing updates
without the person seeing both versions first.

## Consequences

The gap ADR 0011 recorded is closed. A correction can reach the plans that need
it, one plan at a time, with the person deciding each time.

The costs. Divergence now has to be detected on open, which means comparing
every placed appliance against the catalogue rather than trusting the plan's
copy outright. The comparison is pure and testable, but it is work that
happens whenever a plan is opened.

The offer can also become noise. A person who has deliberately kept an older
definition will be asked about it every time they open that plan unless the
decision is remembered, and remembering it is not specified here.

Updating one plan says nothing about the others. There is still no way to push a
correction across every plan at once, and that remains unaddressed.

> Since resolved: [ADR 0013](0013-propagating-a-correction.md) adds a bulk apply
> across plans carrying an old copy. The per-plan offer described here stays as
> the on-open path.
