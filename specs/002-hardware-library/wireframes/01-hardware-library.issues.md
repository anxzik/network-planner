# 01-hardware-library.svg Review

**Status:** REGENERATE
**Date:** 2026-09-02
**Structural issues:** 0
**Visual issues:** 0
**Coverage issues:** 2

## Issues

| # | Check | Location | Issue | Classification |
|---|-------|----------|-------|----------------|
| 1 | COV-002 | Annotation panel | 17 of 33 functional requirements carry no badge | REGENERATE |
| 2 | COV-003 | Annotation panel | 5 of 11 success criteria carry no badge | REGENERATE |

## Detail

All ten structural checks pass (STR-001 to STR-010). No visual issues found in
the SVG source: no truncation, no overflow, no callout obscuring a control, and
badges sit within their containers.

The failures are coverage, and they have a single cause. This wireframe was
generated when the specification carried 23 functional requirements and 7
success criteria. Two rounds of comprehension validation have since taken it to
33 and 11. The wireframe is not wrong; it is out of date.

**Unbadged functional requirements** (17): FR-002, FR-004, FR-005b, FR-005c,
FR-006, FR-007, FR-008, FR-009, FR-012, FR-013, FR-015, FR-019, FR-022, FR-023,
FR-028, FR-029, FR-030

**Unbadged success criteria** (5): SC-004, SC-007, SC-009, SC-010, SC-011

## Why REGENERATE rather than PATCH

The annotation panel already holds eight groups across two rows, which the
layout rules give as the maximum. Twenty-two more badges do not fit, so this is
a layout change rather than a single-element fix.

The more useful reading is that one wireframe is no longer enough for this
feature. A split covers the requirements properly:

- **01** the Hardware tab: browse, search, filter, create, edit, restore, approve
- **02** the import and export flow: file choice, collision resolution, the
  report of what was applied and skipped
- **03** symbols: importing a set, assigning, and the canvas fallback

Three of the unbadged requirements cannot be drawn at all and should be noted
rather than badged: FR-029 and FR-030 are deferred pending research R4, and
FR-005b to FR-005c belong to the project-file feature, not this one.

## Sign-off

Withheld. The review rules forbid signing off a wireframe with unresolved
REGENERATE issues, so no `## UI Mockup` block is written to spec.md and nothing
downstream is bound to this drawing yet.
