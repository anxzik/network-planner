# Product Spec: Hardware Library

**Feature**: Hardware Library
**Created**: 2026-09-02
**Status**: Draft

## Headline

Network engineers plan around the equipment they actually have. Today Network
Planner only knows about the 131 appliances compiled into it, so anyone whose
kit falls outside that list ends up approximating, and nothing they build up can
leave their machine. This feature turns the fixed list into a catalogue people
own: add your own equipment, draw it with your own symbols, and hand a set to a
colleague. A plan made from real hardware is worth trusting; one made from
near-enough substitutes is not.

## Glossary

- **Appliance type**: A kind of equipment available to place.
- **Placed appliance**: One instance of a type in a plan.
- **Port layout**: Which ports a type has, and their speeds.
- **Symbol**: The drawing used for a type on screen.
- **Plane**: One of five views of the same network.

## Users

- **Network planner**: Designs sites. Cares that plans match real equipment.
- **Organisation standard-setter**: Curates approved kit and drawing conventions.
- **Instructor and learner**: Teaches networking. Wants shareable, prepared examples.

## Problem (Job to Be Done)

> When I am planning around equipment my organisation already owns,
> I want to define that equipment once and reuse it,
> so I can produce plans that match what gets installed.

**Why now**: Every other part of the application places hardware. Until the
catalogue is something a person owns, each later capability inherits the same
fixed list, and the cost of changing it grows with each one.

## Assumptions

- The catalogue belongs to the person; plans keep copies.
  Wrong if corrections must reach existing plans.
- Symbols stay sharp at any zoom level.
  Wrong if flat images prove good enough.
- Approved equipment is locked; everything else is editable.
  Wrong if teams need to fork approved kit freely.
- Serial numbers belong to a placed unit.
  Wrong if planning tracks individual assets.

## Scope

**In scope**:

- Creating, editing and deleting appliance types.
- Restoring a shipped type after editing it.
- Exporting a selection, or the whole catalogue.
- Importing, with a prompt when definitions collide.
- Importing symbols and assigning them to types.
- Searching and filtering a catalogue of several hundred.

**Out of scope**:

- Connecting to other tooling. That builds on this foundation.
- Running equipment operating systems. A later goal, deliberately deferred.
- Tracking individual units. Types are kinds, not assets.
- Editing a plan's contents. This covers the catalogue only.

## Use Cases

### Use Case 1: Planning with equipment that is not in the catalogue

**Given** a person is planning a site around a switch model the application does not know.
**When** they add it to the catalogue with its manufacturer, model and ports.
**Then** it becomes available to place, and its ports appear correctly on the plan.

### Use Case 2: Handing a catalogue to a colleague

**Given** a person has built up definitions for their organisation's standard equipment.
**When** they export those definitions and send the file to a colleague.
**Then** the colleague imports it and sees every definition and symbol intact.

### Use Case 3: Importing over definitions that already exist

**Given** a person imports a file containing equipment already present in their catalogue.
**When** the collision is detected.
**Then** they are asked whether to replace, keep both, or skip, before anything changes.

### Use Case 4: Drawing plans in a house style

**Given** an organisation draws certain equipment its own particular way.
**When** a person imports that symbol set and assigns it to the relevant types.
**Then** plans they produce look like their organisation's plans.

### Use Case 5: Recovering from a bad import file

**Given** a person imports a file that turns out to be damaged or wrongly formatted.
**When** the import fails partway through.
**Then** they are told what was wrong, and their catalogue is exactly as before.

## Success Metrics

**North star**:

- **Plans built on real equipment**: Target half, at ninety days.
  Share of plans using at least one person-defined type.

**Supporting**:

- **Catalogue exchange**: Every export imports elsewhere complete.
- **Nothing lost in the move**: All 131 shipped appliances unchanged.
- **Finding equipment**: Seconds to locate one among hundreds.
- **Imports never half-applied**: A failure changes nothing.

## Risks and Open Questions

**Risks**:

- People may not curate a catalogue if exporting feels laborious.
- Locking approved equipment may frustrate people mid-task.
- Edits to shipped equipment may conflict with a later release.
- A catalogue of thousands may slow the application at start.

**Open questions**:

- How long should application start take before people notice?
- Should the catalogue be encrypted on disk, and against whom?
- How does a corrected definition reach plans already built on it?
