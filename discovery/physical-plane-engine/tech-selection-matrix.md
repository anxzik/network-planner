# Technology Selection Matrix

## Decision

Which rendering engine should the physical plane use for its geographic map,
the zoom into a to-scale building floorplan, and appliance placement on both?

Placed under `discovery/` rather than the active feature directory because the
subject is build-order item 5, not the hardware library. The selection is made
now because the plane architecture (item 3) has to know whether one canvas
engine serves all five planes or the physical plane brings its own.

## Evaluation Mode

`comparison`

## Candidates

1. **Stretch ReactFlow.** Keep the one engine already in the repository and
   simulate a map beneath it.
2. **Leaflet** with its React bindings. The long-standing DOM-based map library.
3. **MapLibre GL** with React bindings. WebGL vector rendering, community fork
   of Mapbox GL under an open licence.
4. **OpenLayers.** The heavyweight open map library, strongest on projections.

## Criteria

Weightings are assumptions and are labelled. C1, C2 and C8 are weighted highest:
C1 and C2 because `CONTEXT.md` defines the plane by exactly those behaviours,
and C8 because the feasibility study established one intermittent contributor as
the delivery constraint.

| # | Criterion | Source | Weight |
|---|---|---|---|
| C1 | Continuous zoom from region to to-scale floorplan | `CONTEXT.md` physical plane row | High |
| C2 | Appliance interaction parity: place, drag, select many, bulk move | `CONTEXT.md` "How it is used" | High |
| C3 | React 19 integration quality | 30 JSX components, renderer is React | Medium |
| C4 | Offline degradation, map fades but work continues | ADR 0009 | Medium |
| C5 | Serves the later RF and alarm planes, which share this geography | `CONTEXT.md` items 10 and 11 | Medium |
| C6 | Licence and cost of the engine itself | Tile provider cost is ADR 0009's separate open item | Medium |
| C7 | Fit inside Electron | Chromium 144 fixed by the pinned Electron | Low |
| C8 | Learning curve against one intermittent contributor | `discovery/network-planner-vision/feasibility.md` | High |

## Matrix

Ratings: **strong**, **adequate**, **weak**, **none**, each with its reason.
External facts below are stable properties of these libraries; current version
numbers were deliberately not asserted and are listed as an evidence gap.

| Criterion | 1. Stretch ReactFlow | 2. Leaflet | 3. MapLibre GL | 4. OpenLayers |
|---|---|---|---|---|
| C1 Region to floorplan zoom | **weak** — no geographic coordinates, no projections, no tiles; all of it would be hand-built | adequate — tiles and image overlays are core, but deep indoor zoom pushes past the raster tile model it was built around | **strong** — WebGL vector rendering with continuous zoom and image sources; deep zoom is the model, not an extension | strong — projections are its speciality, including custom and image-based coordinate systems |
| C2 Appliance interaction | **strong** — this is what it does today: drag, select, multi-select, custom nodes | adequate — DOM markers drag well; multi-select and bulk move are plugin or hand-rolled territory | adequate — markers as DOM elements integrate with React; selection semantics are hand-rolled | weak — interactions are configured through its own abstraction layer, furthest from the existing code's idiom |
| C3 React integration | **strong** — already a React library, already in use in 3 files | strong — mature bindings, hooks-based | strong — maintained bindings with hooks | weak — bindings exist but thin; most usage is imperative |
| C4 Offline degradation | strong — nothing to degrade, but only because there is no map | strong — missing tiles render grey, everything else works | strong — same, and vector styles can fall back further | strong — same |
| C5 RF and alarm planes later | weak — coverage overlays and geographic heat need a real map | adequate — raster overlay plugins exist for coverage-style display | **strong** — heatmap and raster layers are built in, which is what antenna coverage display wants | strong — equally capable |
| C6 Licence | already licensed (MIT) | BSD-2, no cost | BSD-3, no cost | BSD-2, no cost |
| C7 Electron fit | strong — running today | strong — DOM rendering, nothing exotic | adequate — needs a WebGL context, which Chromium 144 provides; worth one packaged check | strong — canvas rendering |
| C8 Learning curve | **none to learn** — but C1 means building a map engine by hand, which dwarfs any learning curve | **low** — the smallest API of the three map libraries, vast examples | medium — style specification and source model are real concepts to absorb | high — the largest API and its own vocabulary |

## Trade-offs

**Candidate 1 is the false economy.** Zero new learning and perfect interaction
parity, purchased by hand-building projections, tiling and georeferencing —
the exact work map libraries exist to have already done. Its true cost lands on
C1, invisible at selection time and enormous at build time. It is in the matrix
because "one engine everywhere" is genuinely appealing under ADR 0007's
one-object model, and the appeal deserved an honest scoring rather than
dismissal.

**The real contest is Leaflet against MapLibre GL.** Leaflet wins C8 and loses
C1's deep end: it is the fastest path to appliances on a map, and the most
likely to hit a wall when "to-scale floorplan, down to rack and rack unit"
meets a raster tile pyramid. MapLibre carries a real learning curve but its
rendering model matches the requirement's shape: one continuous zoom from
region to room.

**OpenLayers is capable everywhere and preferred nowhere.** Its projection
strength solves problems this project does not have, at the cost of the API
furthest from the codebase's React idiom and the steepest curve under C8.

**A hybrid remains available and is not a candidate here.** The physical plane
could use a map engine for geography and hand floorplan editing to a
`CRS.Simple`-style flat view or even ReactFlow. That is a plane-architecture
question (build-order item 3), not an engine selection, and choosing MapLibre or
Leaflet keeps both paths open.

## Risks

| Risk | Likelihood | Impact | Note |
|---|---|---|---|
| Floorplan zoom outgrows Leaflet if chosen | Medium | High | The requirement says "to scale, down to rack and rack unit"; raster pyramids get awkward exactly there |
| MapLibre's curve stalls an intermittent contributor | Medium | Medium | The feasibility study's central constraint, applied to a library with real concepts to learn |
| WebGL behaves differently in a packaged build | Low | Medium | Same shape as the node:sqlite finding: verified nowhere but development |
| Two interaction models diverge across planes | High | Medium | Whichever map engine is chosen, selection and bulk-edit must feel identical to the ReactFlow planes, per ADR 0007; that parity is hand-built either way |
| Tile provider choice contaminates engine choice | Medium | Low | ADR 0009 left the provider open; all three map candidates consume standard tile sources, so the decisions stay separable |

## Recommendation

**A short-listed set needing PoC validation: MapLibre GL first, Leaflet as the
fallback.** Not a final selection, because the deciding question is executable.

The one thing to prove is the requirement's hardest sentence: a georeferenced
building floorplan, overlaid to scale, zoomed from street level down to rack
position, with a draggable appliance symbol on it. If MapLibre demonstrates that
without fighting its model, its C1 and C5 strength justifies its C8 cost, and it
also serves the RF plane's coverage display later. If the PoC stalls on
learning-curve grounds, Leaflet's answer to the same exercise decides whether
its ceiling is actually reached by this requirement or only reachable in theory.

Candidate 1 is not recommended: its C1 cost is the map libraries' entire reason
to exist. Candidate 4 is not recommended: nothing in the requirement needs its
projection depth, and it scores worst on the two criteria weighted highest.

ReactFlow stays exactly where it is, as the engine of the logical, cloud and
alarm-wiring views. This selection adds an engine for geography; it does not
replace one.

## Evidence Gaps

- No map library has ever been in this repository, so C8 ratings rest on the
  libraries' public reputations rather than local experience. Labelled
  assumption.
- Current major versions, maintenance tempo and React-19 compatibility of all
  three map libraries. Stable properties were used for scoring; versions were
  not asserted and need checking against current documentation.
- WebGL inside the packaged, fused Electron build: expected fine, verified
  never. Same gap class as `compatibility-discovery.md` records for
  `node:sqlite`.
- Whether floorplans arrive as images to georeference or as drawings made
  in-app. `CONTEXT.md` does not say, and the answer moves work between the
  engine and the application.
- Real tile sources and their terms, deliberately left with ADR 0009.

## Follow-up Validation

1. `/speckit.discovery.poc`: the georeferenced floorplan exercise above, in
   MapLibre GL, timeboxed. It answers C1, C2, C3 and C8 in one artifact and is
   the single decisive piece of missing evidence.
2. Repeat in Leaflet only if the MapLibre result is negative on curve rather
   than capability.
3. Fold the outcome into the plane-architecture decision (build-order item 3),
   which owns the question of how floorplan editing and the map relate.
4. Check current versions and React-19 support for whichever engine the PoC
   selects, before it enters package.json.
