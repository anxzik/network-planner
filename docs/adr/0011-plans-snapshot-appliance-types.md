# 0011. A plan keeps its own copy of every appliance type it places

**Status:** Accepted
**Date:** 2026-09-02

## Context

The hardware library specification assumed a plan refers to appliance types by
identifier, and the library resolves them at open time. That left a known hole:
a plan opened on another machine may reference types that machine does not have,
and the specification answered it only by suggesting the types be exported
alongside.

It left a second hole that comprehension validation exposed. If a plan resolves
types live, then editing a type changes every plan that placed it, retroactively
and invisibly. Someone correcting a port count on a switch model would silently
alter site plans signed off months earlier.

## Decision

When an appliance type is placed, the plan records the definition it was placed
with. That copy belongs to the plan and does not change when the library
changes.

Editing a type in the library affects new placements. Plans built earlier keep
the definition they were built against.

## Consequences

Plans become self-contained. One opens correctly on a machine whose library has
never seen the equipment, which removes the need to ship a library file
alongside a topology and closes the open question the specification could not
answer.

Old plans also stay truthful. A site plan describes the equipment as it was
understood when the plan was made, which is what a plan is for.

The costs. A plan is larger, carrying a definition per distinct type rather than
an identifier. Corrections do not propagate, so a genuine error in a type,
a wrong port count, stays wrong in every plan already built on it, and there is
no mechanism here to push a fix forward. Someone will eventually want one.

Two definitions of the same model can now coexist: the library's current one and
an older copy inside a plan. The interface has to make clear which is being
shown, or people will edit the library and wonder why the canvas disagrees.

This narrows [ADR 0010](0010-hardware-library-database.md) rather than
contradicting it. The database remains the catalogue of what can be placed. It
is no longer the authority on what an already-placed appliance is.
