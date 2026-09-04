# 03 Adoption and Preserved Copies — Review

**Status:** PASS
**Date:** 2026-09-03
**Structural issues:** 0
**Visual issues:** 0
**Coverage issues:** 0

## Why this drawing exists

FR-024 and FR-025 were folded into the spec *after* drawings 01 and 02 were
signed off on 2026-09-03. Neither requirement had a surface in any approved
drawing, and coverage check COV-002 failed for both. This drawing closes that
gap rather than amending an already-approved drawing.

## Checks

| Check | Result |
|---|---|
| STR-001 canvas 1920×1080 | PASS |
| STR-002 title y=28 centered | PASS |
| STR-003 signature `003:03 \| Project Files \| SpecKit` y=1060 | PASS |
| STR-004 desktop 40,60 1280×720 | PASS |
| STR-005 mobile 1360,60 360×720 | PASS |
| STR-006 annotation panel y=800 full width | PASS |
| STR-007 all fonts ≥ 14px | PASS (0 below) |
| STR-008 panel `#e8d4b8`, no `#ffffff` fills | PASS (`#fff` used only for badge/check glyphs) |
| STR-009 badge containment | PASS |
| STR-010 US anchoring | PASS — US badge leads each topic block, continuation groups follow it. Same pattern as approved drawing 02 (groups 2/3/5/6 there carry no US badge). |
| VIS-001…007 | PASS — light theme throughout, no truncation, no collisions, no overflow |
| COV-001 US coverage | PASS — US-001, US-003, US-004 anchored here; US-002 covered by drawing 01 |
| COV-002 FR coverage | PASS — 25/25 across the drawing set, restored by this drawing |
| COV-003 SC coverage | PASS — 7/7 across the set |

## What it depicts

- **Adopt offer** (FR-025): after-open, per-type checkboxes; a type already in
  the catalogue shown greyed and labelled skipped, never overwritten; "Not now"
  beside "Adopt", with the plan unchanged either way.
- **Preserved copies** (FR-024): the three slots by name, each with its own
  Clear action; the redundant one distinguished (green, primary Clear) to show
  that redundancy only makes the offer, and a note that repeats replace.
- **Save As caveat** (FR-021, both halves): content dropped, and the copy is
  not a substitute for the original.
- **Unsaved prompt** (FR-006): Save / Discard / Cancel, with the dismissal rule
  stated on the drawing.

---

## Re-review 2026-09-03 (post FR-006a fold)

**Status:** PASS
**Trigger:** FR-006 was amended after this drawing was signed off — Escape now
maps to Discard, and the new FR-006a makes a discard recoverable. The drawing
stated the superseded rule ("Escape... means Cancel - never Discard") on its
face, which would have made an approved drawing actively contradict the spec.

**Changed:** the caveat line under the three buttons; the Discard button now
carries its `Esc` accelerator; the mobile note; annotation 5 retitled and
re-badged with FR-006a and FR-009.

**Checks:** STR-001…010 PASS (0 fonts below 14px; badges within bounds — column
5 ends at x=910 of 1840). VIS-001…007 PASS. COV-002 PASS — FR-006a badged here.

Sign-off carried forward: 2026-09-03.
