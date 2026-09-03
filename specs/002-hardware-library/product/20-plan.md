# Product Plan: Hardware Library

**Feature**: Hardware Library
**Created**: 2026-09-02
**Status**: Draft

## Summary

The catalogue moves out of the application's own source and into storage the
person owns, held in a local database and reached through a narrow, guarded
channel between the interface and the part of the application allowed to touch
files. Decision logic stays separate from storage, so the awkward parts, such as
working out what to do when an imported definition collides with one already
present, can be checked on their own. Two pieces of the specification do not
ship in this round and are named below rather than quietly dropped.

## Goals and Non-Goals

**Goals**:

- A person can add equipment the application has never heard of.
- A catalogue exports to a file and imports elsewhere.
- All 131 existing appliance types survive unchanged.
- An organisation's own symbols can replace the shipped ones.
- Finding one appliance among several hundred stays quick.
- A failed or interrupted write never damages the catalogue.

**Non-goals**:

- Enforcing who may change approved equipment. No answer yet.
- Plans recording their own definitions. Needs a format first.
- Connecting to outside radio and network tooling. Later work.
- Running equipment operating systems. Deferred by intent.
- Changing how plans themselves are stored. Separate effort.

## Delivery Phases

### Phase 0: Research

- Settled which database to use and why it carries no build cost.
- Settled the interchange format for import and export.
- Resolved where storage code may live without spoiling the tested core.
- Left one question open and recorded one sequencing conflict.

### Phase 1: Design

_Depends on_: Phase 0.

- Defined the data shapes for appliance types, symbols and reports.
- Defined the contract between the interface and the file-handling layer.
- Wrote the scenarios that prove the feature works end to end.

### Phase 2: Task breakdown

_Depends on_: Phase 1.

- Turns the design into ordered, independently verifiable work.
- Puts carrying the 131 existing types across first, before anything else.

## Risks and Mitigations

**The built-in database module is marked experimental**

- **What could go wrong**: Behaviour changes under a runtime upgrade.
- **Probability**: Medium
- **Impact**: High
- **Mitigation**: All calls sit in a single place.

**The 131 existing types are carried across incorrectly**

- **What could go wrong**: Later checks pass against wrong data.
- **Probability**: Medium
- **Impact**: High
- **Mitigation**: First task, with a test asserting every identifier.

**The file-handling layer grows faster than it can be checked**

- **What could go wrong**: Logic lands where no testing convention exists.
- **Probability**: Medium
- **Impact**: Medium
- **Mitigation**: Storage holds no decisions, only the tested modules do.

**A requirement here depends on work scheduled after it**

- **What could go wrong**: Two requirements cannot be built yet.
- **Probability**: High
- **Impact**: Medium
- **Mitigation**: Named as non-goals, moved to the unblocking effort.

## Divergences and Edge Cases

- **A definition cannot be read**: readable entries still apply. The
  unreadable one is skipped, with a reason given.
- **A file claims an unknown version**: it imports what it can
  and warns, rather than refusing the file outright.
- **Deleting equipment still in use**: refused, naming the plans.
- **Equipment with no ports**: allowed, once the person confirms.
  Some entries genuinely have none.

## Validation

- All 131 existing appliance types are present and behave as before.
- Equipment a person adds places and generates ports correctly.
- A catalogue exported on one machine imports elsewhere complete.
- A part-failed import reports what applied and what skipped.
- An interrupted write leaves the catalogue readable, never half-written.
- The project's own style, test and type checks all pass.

## Open Questions

- What restricts who may change approved equipment, with no accounts?
- How slow would application start have to be before people notice?
