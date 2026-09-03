# Proof of Concept

## Input

All three minimum inputs are inferred from repository context and labelled so.

**User stories** (from `CONTEXT.md`, physical plane): a person places appliances
by their real-world position on a geographic map, then zooms into a to-scale
building floorplan, down to rack position.

**Use cases**: view the site on a map; overlay a building floorplan at its true
size and position; place an appliance symbol on the floorplan; zoom continuously
from region to rack without a mode break; drag the appliance and have it stay
where it was put.

**Core design idea** (from `tech-selection-matrix.md`): MapLibre GL renders the
plane. The floorplan is a georeferenced image source. The appliance is a
draggable marker anchored to geographic coordinates. No tile provider is used,
which simultaneously exercises ADR 0009's offline degradation: the backdrop is
blank and the work continues.

## Validation Question

Can MapLibre GL hold a floorplan image at true scale on geographic coordinates,
zoom continuously from region level to rack level, and keep a draggable
appliance symbol geographically anchored throughout, in this project's own
Electron runtime?

## Hypothesis

We believe MapLibre GL will satisfy the physical plane's region-to-floorplan
requirement under this project's pinned Electron runtime and no network. We will
know this is true when a synthetic floorplan renders at correct scale at
building zoom, the camera reaches rack zoom continuously, and a marker's screen
position tracks its geographic anchor within a few pixels at every zoom tested.

## Success Criteria

| # | Criterion | Measured how |
|---|---|---|
| S1 | Map initialises: WebGL context created, `load` fires, no error | Event capture |
| S2 | Floorplan image renders where georeferenced | Pixel sample at the floorplan's projected centre differs from the background colour |
| S3 | Zoom is continuous to rack level | `getZoom()` reaches 22; corner pixel distance scales by 2^Δz within 5% between zoom 18 and 21 |
| S4 | Marker stays geo-anchored | Marker element centre within 3 px of `project(markerLngLat)` at zooms 17 and 21 |
| S5 | Drag works and is precise | Draggable marker moved 2 m east; `getLngLat` reflects it; screen displacement matches ground resolution within 20% |
| S6 | Evidence captured | Three screenshots (region, building, rack) written and non-empty |

## Minimal Executable Experiment

A disposable Electron page under `discovery/physical-plane-engine/poc/`,
launched with the repository's own Electron 40 binary. Its `package.json`
declares `maplibre-gl` alone, confined to the PoC workspace and touching nothing
in the repository's dependency tree. A blank background style replaces tiles, so
the run needs no network. The renderer runs the assertions and reports through
IPC; the main process captures screenshots and writes `poc/evidence/`.

Marked experimental throughout. Nothing here is production code.

## Execution Preconditions

| Precondition | State |
|---|---|
| Dependencies installed or declared | `electron@40.0.0` declared by the repository. `maplibre-gl` is not, and is declared instead by the PoC workspace's own `package.json`, interpreted as satisfying the confinement this precondition protects. Interpretation recorded here deliberately |
| Commands confined to the PoC workspace | Install runs inside `poc/` only |
| Synthetic inputs | Floorplan is a generated SVG data URI; coordinates are arbitrary; no tiles fetched |
| No production data, live writes, secrets | None involved |
| Runtime under 5 minutes | Scripted sequence, hard 120 s timeout |
| Display available | `DISPLAY=:0.0`, X11 session confirmed |

## Sample Inputs

A 30 m × 20 m building footprint anchored at 39.7392° N, 104.9903° W, drawn as
an SVG with distinct wall and floor colours so S2 can sample pixels. One
appliance marker at a rack position inside the east wing.

## Expected Observations

The floorplan appears as a small rectangle at region zoom, fills the view at
building zoom, and individual rack positions are legible at rack zoom. The
marker's screen position and its projected coordinates agree at every stage. The
2 m drag moves the marker roughly 35 px at zoom 21, the ground resolution at
that latitude.

## Risk Focus

C1 from the selection matrix, the criterion the paper comparison could not
settle: whether the continuous region-to-rack zoom works in practice, in this
project's runtime, without fighting the library's model. Secondarily C7: WebGL
inside this Electron, which is expected to work and has never been exercised.
