# 0007. An appliance is one object with a facet per plane

**Status:** Accepted
**Date:** 2026-09-02

## Context

Network Planner plans across five planes — physical, logical, cloud, RF and
alarm (see `CONTEXT.md`). A firewall has a rack position on a floorplan, an
interface configuration in the logical plane, possibly a peering relationship in
cloud, and — if it is a repeater — an antenna pattern in RF.

Two structures are possible. Either the firewall is one object carrying data for
each plane, or each plane holds its own record and the records reference one
another.

The choice determines what bulk edit selects, what switching planes does, what
`delete` means, what the export format looks like, and whether IaC generation
can see a whole device or must reassemble it.

## Decision

An appliance exists once. It carries a **facet** per plane it participates in,
and may have no facet on a plane it does not.

Switching planes changes which facet is displayed, not which object is selected.
Selecting an appliance selects the appliance, so a bulk edit can span planes.
Deleting an appliance removes it from every plane.

## Consequences

Identity is unambiguous. A device has one name, one hardware type, one entry in
the topology, and cannot drift out of sync with itself. Bulk operations, plane
switching, import/export and IaC generation all operate on whole devices.

The cost is that one object accumulates every plane's concerns, and will grow
large. Plane-specific logic has to stay in plane-specific modules rather than
migrating onto the object, or it becomes the place where all five planes tangle
together.

Deleting is now consequential in a way it was not: removing a symbol from a
floorplan silently discards its routing configuration too. The interface has to
make that clear before it happens, and this is the sharp edge of the decision.

An appliance also cannot participate twice in one plane — one physical position,
one interface set. Should a genuine case appear for two positions, this decision
has to be revisited rather than worked around.
