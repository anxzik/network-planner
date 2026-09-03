# 0009. Geographic maps use online tiles and degrade offline

**Status:** Accepted
**Date:** 2026-09-02

## Context

The physical plane places appliances on a geographic map before zooming into a
building floorplan. Map imagery normally comes from a tile provider over the
network.

An earlier constraint recorded in the plan template stated the application was
"offline-capable (no network dependency)". That was inferred from the app being
an Electron desktop binary with local storage, not decided. It has never been a
requirement anyone stated.

The environments this application targets pull both ways. Radio and alarm work
often happens on secure or disconnected sites. Ordinary network planning usually
happens somewhere with connectivity.

## Decision

Fetch map tiles from an online provider when a network is available. Every other
capability — floorplans, the logical, cloud, RF and alarm planes, the hardware
library, project files — works without one.

Losing connectivity degrades the geographic backdrop. It does not stop work.

The inferred "no network dependency" constraint is retired and replaced by this
record.

## Consequences

The geographic plane can use real map data without shipping or licensing an
imagery set.

The costs: the physical plane is the one place where a person's experience
depends on their connection, and a disconnected site sees appliances positioned
against an empty backdrop. A tile provider also means a third-party dependency
with terms, possible API keys, and possible cost — none of which is currently
chosen.

Air-gapped users are served only partially. If that becomes a real requirement
rather than a possibility, offline imagery or user-supplied georeferenced site
plans is the change, and it supersedes this record.
