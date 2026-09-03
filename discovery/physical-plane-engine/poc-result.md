# POC Result

## Experiment Run

3 September 2026, on the repository's own Electron 40.0.0 (Node 24.11.1,
Chromium 144), X11 display, no network at runtime. MapLibre GL 6.7.0, confined
to `poc/package.json`. Final run completed in 568 ms after a 30 ms map
initialisation; the first-ever run took 10.3 s of which most was first-time
shader compilation. Four runs total: one blocked, one partial, one with a
measurement race, one clean.

## Evidence

`poc/evidence/` holds `results.json`, `console.log` and three screenshots:
region (the floorplan a speck on an empty backdrop), building (the full plan
with walls, wings and the rack), and rack (the requirement's "down to rack and
rack unit", with the marker pinned to the rack's north end).

| Check | Result | Measured |
|---|---|---|
| S1 map initialises, WebGL context, no error | passed | load in 30 ms |
| S2 floorplan renders where georeferenced | passed | pixel at plan centre differs from backdrop; the sampled colour turned out to be the "FLOOR 2" label glyph, which is confirmation with a sense of humour |
| S3 zoom continuous to rack level | passed | zoom 22 reached; corner span 130.7 px at z18 to 1045.3 px at z21, ratio 8.000 against a theoretical 8 |
| S4 marker stays geo-anchored | passed | 0.48 px error at z18, 0.50 px at z21 |
| S5 drag precision | passed | 2 m east moved 69.69 px against a scale-derived expectation of 69.69 px; coordinate error 0 |

## Observations

The hypothesis held with unusual margin. Scale tracked the theoretical factor to
three decimal places, anchoring held to half a pixel, and a two-metre move
landed to two decimal places of the expectation. The requirement's hardest
sentence, region to rack in one continuous zoom with a to-scale floorplan, is
what the screenshots show.

Four things failed on the way, and each is worth keeping:

1. **ESM on `file://`.** MapLibre 6 ships ES modules only, and Chromium blocks
   module scripts from `file://` origins. The PoC works around it with
   `webSecurity: false`, acceptable for a disposable page and unacceptable in
   the application. The real physical plane loads through Vite, which serves
   modules properly, so this is a PoC artifact, not a product problem — but it
   is worth knowing the day anyone loads a map page outside the bundler.
2. **SVG image sources.** MapLibre's image source could not decode an SVG data
   URI; rasterising to PNG first fixed it. Floorplans that arrive as vector
   drawings will need that step, which touches the open question in the
   selection matrix about how floorplans arrive at all.
3. **A projection test spanning an `await` is a race.** The drag measurement
   returned minus 19 px in one run purely because the camera can move between
   two `project()` calls separated by an idle. Measured synchronously it is
   exact.
4. **The Mercator constant assumes 256 px tiles.** Expected pixel displacement
   computed from 156543/2^z came out exactly half the measured value; the map
   renders on the 512 px convention. Deriving the expectation from the map's own
   rendered scale removed the assumption instead of patching the constant.

Anchoring semantics: the first run reported a 6 px anchor error at every zoom.
Constant across zooms meant it was not drift, and it was not: the default pin's
shadow padding sat inside the bounding rect. A centre-anchored custom element
took the measurement to half a pixel, and real appliance symbols will be custom
elements anyway.

## Blocking Conditions

None at completion. One precondition interpretation is recorded in the plan:
`maplibre-gl` was declared by the PoC workspace's own manifest rather than the
repository's, which is the confinement the precondition exists to protect.

## Conclusion

MapLibre GL passes the exercise the selection matrix said would decide it, in
this project's own runtime, offline, with margin. C1, C2 within the PoC's
programmatic limits, C3 and C7 are answered; drag-feel and the learning curve
under sustained use remain human questions, though four debugging rounds inside
the library's API are themselves a data point that the curve is climbable.

Per the matrix's own rule, the Leaflet fallback exercise is not required: it was
conditional on MapLibre failing on curve rather than capability, and it did not
fail. The recommendation of the selection matrix can move from short-listed to
selected: MapLibre GL for the physical plane, with the SVG-rasterisation step
and the ESM/file:// note carried into the plane-architecture work.

## Result

`passed`
