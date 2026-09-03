# Specification Quality Checklist: Hardware Library

**Purpose**: Validate specification completeness and quality before proceeding to planning
**Created**: 2026-09-02
**Feature**: [spec.md](../spec.md)

## Content Quality

- [x] No implementation details (languages, frameworks, APIs)
- [x] Focused on user value and business needs
- [x] Written for non-technical stakeholders
- [x] All mandatory sections completed

## Requirement Completeness

- [x] No [NEEDS CLARIFICATION] markers remain
- [x] Requirements are testable and unambiguous
- [x] Success criteria are measurable
- [x] Success criteria are technology-agnostic (no implementation details)
- [x] All acceptance scenarios are defined
- [x] Edge cases are identified
- [x] Scope is clearly bounded
- [x] Dependencies and assumptions identified

## Feature Readiness

- [x] All functional requirements have clear acceptance criteria
- [x] User scenarios cover primary flows
- [x] Feature meets measurable outcomes defined in Success Criteria
- [x] No implementation details leak into specification

## Notes

Qualifications recorded rather than glossed:

**FR-021** names concrete port kinds (SFP, QSFP, RJ11 and so on). These are
domain vocabulary in networking, not implementation detail, and the requirement
exists because the port generator already supports exactly this set — a library
that could not express them would silently lose capability.

**SC-007** ("start is not noticeably slower") has no baseline. Application start
time should be measured before planning, or the criterion cannot be evaluated.
The same gap was recorded against SC-005 of feature 001.

**The most challengeable assumption** is that the library belongs to the person
rather than to a topology. It follows the pattern of component libraries in
design tools, and it is what makes a catalogue worth curating. The cost is that
a topology can reference types the receiving machine lacks. The alternative —
embedding types into each project file — guarantees a plan always opens, at the
price of duplicating the catalogue everywhere and losing a single place to
curate it. Worth confirming before planning, because it shapes the project file
format that ADR 0008 introduces.

**Revised after comprehension validation.** The first validation run scored
1 of 7 on the Edge Cases section. The misses were not misreadings: every one was
a defensible product choice the spec had decided differently. Six requirements
were rewritten to match, and two edge cases that no requirement covered (port
count limits, and a release changing an edited type) gained FR-024 and FR-025.
The catalogue also moved to a local database, recorded as ADR 0010.

Two consequences of those revisions are worth watching. Imports are now
permissive rather than atomic, so the library can reach a state the person did
not review record by record; FR-011 compensates by requiring a report. And
"secure" is adopted only as integrity, with encryption and access control left
open in ADR 0010 until a threat model exists.

**Second validation run scored 4 of 8**, up from 1 of 7. Three of the four
misses were product preferences rather than misreadings and have since been
folded in: plans now keep their own copy of every type they place (ADR 0011),
a portless type requires confirmation before saving, and "secure" now includes
access control over approved equipment, which also settles whether shipped types
can be locked.

ADR 0011 changes the shape of this feature more than its wording suggests. Plans
became self-contained, which answered the open question about a plan arriving on
a machine that lacks its equipment. It also introduced a new one: a corrected
definition no longer reaches plans already built on the old one, and nothing
here pushes a fix forward.

**Deliberately out of scope**: integration with GNU Radio, GNS3 and similar
tooling, named in CONTEXT.md as item 12. This feature is the foundation those
would import into.
