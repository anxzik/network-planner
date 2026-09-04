# Product Plan: Project Files

**Feature**: Project Files
**Created**: 2026-09-03
**Status**: Draft

## Summary

The work splits along one line: pure decision logic that can be tested on its
own, a file-handling layer that executes those decisions, and interface
surfaces that display and ask consent. The riskiest fact was settled in
research rather than discovery-by-failure: the old plan data lives where only
the interface side can read it, so the one-time move hands content across the
boundary instead of reaching for it.

## Goals and Non-Goals

**Goals**:

- A plan saves to a named file and reopens identically.
- Every existing user crosses the migration losing nothing.
- Plans open complete on machines lacking their equipment.
- Corrections reach plans only with consent, declines remembered.
- Every failure mode leaves prior work intact.
- Older files upgrade; newer ones stay read-only, unwritten.

**Non-goals**:

- Multiple plans open at once. Deferred until needed.
- Scanning disks for plan files. Invasive, unreliable.
- Merging plans. A separate feature.
- Sync or sharing services. Files enable them; providers do them.

## Delivery Phases

### Phase 0: Research

- Settled how a save survives interruption.
- Settled the file format and where auxiliary state lives.
- Found the migration's one-way data path and designed around it.

### Phase 1: Design

_Depends on_: Phase 0.

- Data shapes for the plan file, recovery slot and recents.
- The boundary contract for every plan operation.
- Twelve scenarios that prove the feature end to end.

### Phase 2: Task breakdown

_Depends on_: Phase 1.

- Orders the work: format classification first, everything trusts it.

## Risks and Mitigations

**The save-behaviour change surprises existing users**

- **What could go wrong**: Deliberate saving feels like lost autosave.
- **Probability**: Medium
- **Impact**: Medium
- **Mitigation**: The recovery slot keeps the crash-safety they had.

**Migration is a single high-stakes crossing**

- **What could go wrong**: One bad step costs someone their only plan.
- **Probability**: Low
- **Impact**: High
- **Mitigation**: Offered, salvageable, original kept until cleared.

**Synced folders deliver conflicting copies**

- **What could go wrong**: Two versions of one plan appear.
- **Probability**: Medium
- **Impact**: Medium
- **Mitigation**: Writes keep each copy whole; conflicts stay visible.

**Read-only enforcement leaks**

- **What could go wrong**: A newer file written back loses content.
- **Probability**: Low
- **Impact**: High
- **Mitigation**: Refusal lives on the file-handling side, not only in buttons.

## Divergences and Edge Cases

- **Unreadable old data**: salvage is offered first; the original is never touched.
- **A failed save**: the previous file survives; the partial is named.
- **A vanished recent entry**: shown and offered for removal, never dropped.
- **Two instances, one file**: the second opens read-only with a notice.

## Validation

- A saved plan reopens identically on another machine.
- The migration preserves the original until the person clears it.
- Every released format version upgrades under automated test.
- No failure scenario destroys undiscarded work.
- The project's style, test and type checks pass.

## Open Questions

- How long should crash-recovered work be kept?
- Should a remembered decline be reversible somewhere visible?
