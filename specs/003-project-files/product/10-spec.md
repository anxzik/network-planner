# Product Spec: Project Files

**Feature**: Project Files
**Created**: 2026-09-03
**Status**: Draft

## Headline

People keep their plans; this application finally lets them. A design that took
an afternoon currently lives in one hidden slot that cannot be named, copied,
backed up or shared, and this feature turns it into a file the person owns.
Plans travel between machines complete, because each one carries its own copies
of the equipment definitions it uses. The bar throughout: no failure, crash,
damaged file or format change destroys work the person had not already chosen
to discard.

## Glossary

- **Plan**: One site's design: equipment, wiring, notes.
- **Recorded definition**: The equipment description a plan carries itself.
- **Migration**: The one-time move out of hidden storage.
- **Recovery slot**: Where unsaved work survives a crash.

## Users

- **Network planner**: Designs sites. Wants plans safe, portable, nameable.
- **Colleague receiving a plan**: Opens it complete, without the sender's catalogue.
- **Existing user**: Crosses the migration once. Must lose nothing.

## Problem (Job to Be Done)

> When I finish designing a site,
> I want to keep the plan as a thing I own,
> so I can back it up, revisit it, and hand it over.

**Why now**: The equipment catalogue just became real data with corrections;
plans must be able to receive those corrections, and hidden storage cannot.

## Assumptions

- One plan open at a time.
  Wrong if people need side-by-side plans.
- Saving is deliberate; a recovery slot guards crashes.
  Wrong if silent autosave is expected to continue.
- A broad update reaches recently opened plans only.
  Wrong if people expect disk-wide discovery.

## Scope

**In scope**:

- Save, open, Save As, new plan, recents.
- Unsaved-changes protection and crash recovery.
- The one-time migration, original preserved.
- Plans carrying recorded equipment definitions.
- Update offers, single plan and across recents.
- Format versioning, upgrades, damaged-file safety.

**Out of scope**:

- Multiple plans open at once. Later, if needed.
- Disk scanning for plan files. Invasive, unreliable.
- Merging two plans. A different feature.
- Cloud sync itself. Files make it possible; providers do it.

## Use Cases

### Use Case 1: Keeping a finished design

**Given** a person has laid out a site on the canvas.
**When** they save it as a named file where they choose.
**Then** it reopens later, on any machine, exactly as saved.

### Use Case 2: Crossing the migration

**Given** an existing user opens the updated application for the first time.
**When** they accept the offered move of their current work.
**Then** their plan appears as a file, and the original stays kept until they clear it.

### Use Case 3: Sending a plan to a colleague

**Given** a plan uses equipment the colleague's catalogue has never seen.
**When** the colleague opens the file.
**Then** every device renders complete from the definitions the plan carries.

### Use Case 4: Receiving a correction

**Given** the library fixed a wrong port count after a plan was made.
**When** the person opens that plan.
**Then** they see which version is shown and choose whether to take the fix, and a decline is remembered.

### Use Case 5: Surviving trouble

**Given** a save fails, a file is damaged, or the application crashes.
**When** the person returns.
**Then** their previous work is intact, and unsaved changes are offered back.

## Success Metrics

**North star**:

- **Nothing lost**: Zero work-loss reports across migration and failures.

**Supporting**:

- **Plans travel**: A saved plan opens complete elsewhere. Always.
- **Migration completes**: Existing users cross once, original recoverable.
- **Corrections reach plans**: Only with consent, declines remembered.
- **Upgrades covered**: Every released format upgrades under test.

## Risks and Open Questions

**Risks**:

- The save-behaviour change may surprise long-time users.
- Cloud-synced folders can deliver conflicting copies.
- Two instances editing one file needs clear handling.

**Open questions**:

- Should a declined update offer be reversible somewhere visible?
- How long should crash-recovered work be kept?
