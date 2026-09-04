---
type: decision
updated: 2026-09-03
sources: [S004, S005]
---

# The migration's data path runs through the renderer

A fact found in planning, and the design followed it: the pre-file topology
lives in renderer `localStorage`, which the main process cannot read (S004).

The one-time migration therefore flows renderer to main. The renderer reads its
own storage root and hands the raw content across the bridge; main classifies
it, attempts salvage when it is unreadable, writes the plan file, and asks the
renderer to set the preserved-and-migrated marker back in `localStorage`
(S004). Neither side crosses its boundary, and the original is never the thing
being operated on (S004).

The rejected alternative was main parsing the renderer's profile storage from
disk directly, which would bind the application to browser-engine internals
(S005).

Worth remembering because the natural assumption is the opposite: main owns
files, so surely main reads the old data. One repository check during planning
prevented an architecture built on that wrong guess (S005). Related:
[[decision-plan-files]], [[decision-pure-logic-split]].
