# Feature Specification: Hardware Library

**Feature Branch**: `002-hardware-library`
**Created**: 2026-09-02
**Status**: Draft

## UI Mockup

Signed off: 2026-09-03

- Hardware tab, desktop and mobile: [`wireframes/01-hardware-library.svg`](./wireframes/01-hardware-library.svg) (light theme)
- Import, collisions and export: [`wireframes/02-import-export.svg`](./wireframes/02-import-export.svg) (light theme)
- Symbol sets and assignment: [`wireframes/03-symbols.svg`](./wireframes/03-symbols.svg) (light theme)

These wireframes are spec constraints. Implementation should match their layout,
component structure, and interaction flow. Deviations require spec revision.

Two things they draw are not built in this round, and the drawings show intended
behaviour rather than shipped behaviour: the locked approved type on 01
(FR-029, FR-030, deferred pending research R4) and the plan opening without the
receiving catalogue on 02 (FR-005b, FR-005c, deferred to the project file work).

## User Scenarios & Testing *(mandatory)*

Every plane in Network Planner places hardware. The hardware library is the
catalogue those appliances come from: what exists, what each thing has on it,
and how it is drawn.

Today that catalogue is 131 appliance types across 19 categories, written into
the application's source and unchangeable by the person using it. If the switch
they actually own is not in the list, they cannot add it. If their organisation
standardises on a symbol set, they cannot use it. Nothing can be shared with a
colleague.

This feature makes the catalogue something a person owns, edits, and exchanges.

### User Story 1 - Adding hardware that is not in the catalogue (Priority: P1)

Someone is planning a site around a switch model the application has never heard
of. They add it — manufacturer, model, its port layout, what it can do — and
from then on it is available to place like anything else.

**Why this priority**: This is the difference between a catalogue and a fixed
list. Until someone can add their own hardware, they can only plan networks
built from equipment the application happened to ship with.

**Independent Test**: Add an appliance type that does not exist, then place it
on the canvas and confirm its ports are generated correctly from what was
entered.

**Acceptance Scenarios**:

1. **Given** an appliance type that is not in the catalogue, **When** the person
   creates it with a manufacturer, model, and port layout, **Then** it appears in
   the library and can be placed.
2. **Given** a newly created appliance type, **When** it is placed on the canvas,
   **Then** its ports are generated from the layout that was entered, labelled
   according to its manufacturer's convention.
3. **Given** an appliance type in use in a topology, **When** the person edits
   the type's details, **Then** the change is reflected without invalidating the
   topology that uses it.
4. **Given** an appliance type shipped with the application, **When** the person
   edits it, **Then** their version is used, and the original can be restored.

### User Story 2 - Exchanging hardware definitions (Priority: P1)

Someone has built up definitions for their organisation's standard equipment.
A colleague needs the same set. They export it, hand over the file, and the
colleague imports it.

**Why this priority**: Export is also how a person protects work that currently
exists nowhere but their own machine, and how pre-built topologies become
shareable at all. It ships with US1 because a catalogue that cannot leave the
machine is barely better than a fixed one.

**Independent Test**: Export a selection of appliance types, import the file on
a clean installation, and confirm the types arrive complete and usable.

**Acceptance Scenarios**:

1. **Given** appliance types in the library, **When** the person exports them,
   **Then** they receive a file containing everything needed to recreate those
   types elsewhere.
2. **Given** an exported file, **When** it is imported on another installation,
   **Then** the types appear complete, including their symbols.
3. **Given** an import containing a type that already exists, **When** the person
   imports it, **Then** they are told about the collision and choose whether to
   replace, keep both, or skip.
4. **Given** a file that is not a valid library export, **When** the person
   imports it, **Then** they are told what is wrong with it and nothing in their
   library changes.
5. **Given** an import that partly fails, **When** it completes, **Then** the
   library is either fully updated or entirely unchanged — never half-applied.

### User Story 3 - Using an organisation's own symbols (Priority: P2)

A person's organisation draws firewalls a particular way. They import their
symbol set and their plans look like their organisation's plans.

**Why this priority**: Real value, but the library is useful before it is met —
appliances can be placed and configured with the shipped symbols.

**Independent Test**: Import a symbol set, assign a symbol to an appliance type,
and confirm it draws on the canvas and survives export and reimport.

**Acceptance Scenarios**:

1. **Given** a symbol file, **When** the person imports it, **Then** it becomes
   available to assign to appliance types.
2. **Given** an imported symbol assigned to a type, **When** that type is placed,
   **Then** the canvas draws the imported symbol.
3. **Given** an appliance type with no symbol assigned, **When** it is placed,
   **Then** a recognisable default is drawn rather than nothing.

### User Story 4 - Browsing and organising the catalogue (Priority: P2)

With hundreds of types, finding the right one matters.

**Why this priority**: The existing library UI already groups by category. This
extends it rather than enabling anything previously impossible.

**Independent Test**: With a large library, locate a specific appliance by
manufacturer, by category, and by searching for its model.

**Acceptance Scenarios**:

1. **Given** a library of several hundred types, **When** the person searches by
   model or manufacturer, **Then** matches appear as they type.
2. **Given** the library, **When** the person filters by category or by the plane
   a type belongs to, **Then** only matching types are listed.
3. **Given** a type the person created themselves, **When** they browse the
   library, **Then** it is distinguishable from types that shipped with the
   application.

### Edge Cases

- An appliance type is deleted while topologies still place it.
- An imported file declares a library format version the application does not
  recognise.
- Two appliance types are imported carrying the same identifier but different
  content.
- A symbol file is malformed, enormous, or contains something other than a
  symbol.
- An appliance type is created with no ports at all — valid for some logical and
  cloud entities.
- A port layout is entered that would generate an unreasonable number of ports.
- Editing a shipped type, then a later application release changes that same
  type.
- A library file written by an older version of this application is imported.
- A plan is opened whose recorded definition of a type differs from the
  library's current one, and the person declines the offer to update it.
- Someone without permission attempts to change equipment marked approved.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: A person MUST be able to create a new appliance type, supplying at
  minimum a name, manufacturer, model, category, and port layout.
- **FR-002**: A person MUST be able to edit any appliance type, including those
  that shipped with the application.
- **FR-003**: A person MUST be able to restore a shipped appliance type to its
  original definition after editing it.
- **FR-004**: A person MUST be able to delete an appliance type they created.
- **FR-005**: The application MUST refuse to delete an appliance type that any
  topology still places, and MUST tell the person where it is in use.
- **FR-005a**: When an appliance type is placed, the topology MUST record the
  definition it was placed with. Editing the type in the library MUST NOT change
  topologies built earlier.
- **FR-005b**: A topology MUST open correctly on a machine whose library does not
  contain the types it places.
- **FR-005c**: When a placed appliance's recorded definition differs from the
  library's current one, the application MUST make clear which is shown.
- **FR-005d**: When a placed appliance's recorded definition differs from the
  library's current one, the application MUST offer to update the plan's copy to
  the current definition, and MUST NOT change it unless the person accepts.
- **FR-005e**: The application MUST be able to apply a corrected definition to
  every plan carrying an older copy of that type, as one action. It MUST show
  which plans would change before anything is written, and MUST allow applying
  to all, some, or none.
- **FR-006**: The application MUST be able to export appliance types to a file,
  either the whole library or a selection.
- **FR-007**: An export MUST contain everything needed to recreate the types
  elsewhere, including their symbols.
- **FR-008**: The application MUST be able to import a library file.
- **FR-009**: When an import collides with an existing type, the application
  MUST tell the person and let them replace, keep both, or skip.
- **FR-010**: An import MUST apply every entry it can read and skip those it
  cannot, rather than abandoning the whole file for one bad entry.
- **FR-011**: After an import, the application MUST report what was applied and
  what was skipped, and why each skipped entry was skipped.
- **FR-012**: A library file MUST record the format version it was written in.
- **FR-013**: When a library file declares a format version the application does
  not recognise, the application MUST import what it can read, MUST warn the
  person that the file came from a version it does not fully understand, and
  MUST NOT silently discard the file.
- **FR-013a**: When a library file declares an older format version the
  application does understand, it MUST bring those entries forward to the
  current format as they are imported, so that an old file does not stay old
  once it is in the catalogue.
- **FR-014**: A person MUST be able to import a symbol set and assign symbols to
  appliance types.
- **FR-015**: An appliance type with no assigned symbol MUST still draw as
  something recognisable.
- **FR-016**: The application MUST ship with the industry-standard networking
  symbols already assigned.
- **FR-017**: A person MUST be able to find an appliance type by searching model
  or manufacturer text, and by filtering on category and plane.
- **FR-018**: Types a person created or edited MUST be distinguishable from
  those that shipped with the application.
- **FR-019**: An appliance type MUST record which plane or planes it belongs to.
- **FR-020**: An appliance type MUST be able to have no ports. Before saving one,
  the application MUST ask the person to confirm, stating that it will not be
  connectable until ports are added.
- **FR-021**: The port layout on an appliance type MUST support the port kinds
  the application already generates — copper ethernet at several speeds, the SFP
  and QSFP families, fibre, coax, RJ11 and WAN — and per-port-group speed and
  power-over-Ethernet settings.
- **FR-022**: The 131 appliance types currently built into the application MUST
  be present after this feature ships, unchanged in behaviour.
- **FR-023**: The library MUST be available to every plane, not scoped to one.
- **FR-024**: The application MUST reject a port layout that would generate an
  unreasonable number of ports, and MUST say what the limit is.
- **FR-025**: When a release changes an appliance type the person has edited,
  the person's version MUST be kept. They MUST be told the shipped definition
  changed, and MUST be able to take the new one.
- **FR-026**: The catalogue MUST be held so that it can be searched and filtered
  without loading all of it, and so that one edit does not rewrite the whole
  library.
- **FR-027**: An interrupted or failed write MUST NOT leave the catalogue
  damaged or partly written.
- **FR-028**: An appliance type MUST be markable as approved.
- **FR-029**: The application MUST restrict who may change or delete an approved
  appliance type, whether it shipped with the application or was added locally.
- **FR-030**: An attempt to change an approved type without permission MUST be
  refused and MUST say why.

### Key Entities

- **Appliance type**: a kind of hardware that can be placed — its identity
  (manufacturer, model, name), its category, the planes it belongs to, its port
  layout, its capabilities, and its symbol. Distinct from a placed appliance,
  which is an instance of a type positioned in a topology.
- **Port layout**: the ports an appliance type has, grouped by kind, each group
  carrying a count, a speed, and whether it supplies power over Ethernet.
- **Category**: how types are grouped for browsing — currently manufacturer and
  role groupings such as Cisco, SOHO, Enterprise, SDN and Cloud.
- **Symbol**: the drawing used for a type on the canvas. Either shipped, or
  imported by the person.
- **Library file**: an exported set of appliance types with their symbols and a
  format version, suitable for import elsewhere.

## Process Boundary

- **Scope**: Requires main-process work.
- **Storage**: the catalogue is held in a local database owned by the main
  process ([ADR 0010](../../docs/adr/0010-hardware-library-database.md)). The
  renderer never reaches it directly.
- **Node/OS capability needed**: choosing a file to import, choosing where to
  write an export, and reading and writing the library itself. None of this is
  available to the renderer.
- **Bridge surface**: the renderer asks for a library to be read, written,
  imported or exported, and receives results. File paths, dialogs and disk
  access stay in the main process. The renderer must not gain direct file
  access, and the paths it is given must not be usable to reach arbitrary files.

## Persistence

- **What persists**: the appliance-type catalogue, including edits to shipped
  types, types the person created, and imported symbols.
- **Where**: a local database managed by the main process, independent of any
  single topology and available to every plan ([ADR 0010](../../docs/adr/0010-hardware-library-database.md)).
  It is not stored inside a project file. Library files remain how a catalogue
  moves between machines; the database is how it is held and queried on one.
  Separately, each project file carries its own copy of every type it places
  ([ADR 0011](../../docs/adr/0011-plans-snapshot-appliance-types.md)), so a plan
  does not depend on the receiving machine's catalogue.
- **Shape change**: yes. The catalogue moves from application source to data the
  person owns, and gains a recorded format version.
- **Migration**: the 131 shipped types must be carried into the new form
  unchanged, and topologies already referencing them by identifier must continue
  to resolve. This is the first case the library's own format version has to
  handle.

## Testability

- **Logic to extract**: validating an appliance type, deciding whether an import
  is well-formed and what version it declares, detecting collisions and applying
  the chosen resolution, merging a library, distinguishing shipped from edited
  types, comparing a plan's recorded definition against the catalogue, and
  searching and filtering. All of it takes data and returns data, and
  belongs in `src/utils/` with co-located tests.
- **Left in the component**: the library browser, the type editor form, the
  import collision prompt, and file pickers. These display what the logic
  reports and pass choices back.
- **Manual verification**: that an imported symbol actually draws correctly at
  canvas scale, that the collision prompt is understandable, and that file
  dialogs behave — none of which a node-environment test can reach.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A person can add hardware the application has never heard of and
  place it in a plan, without editing application source.
- **SC-002**: A library exported on one installation imports on another with
  every type and symbol intact.
- **SC-003**: After any import, a person can see exactly what was added and what
  was skipped, and why.
- **SC-004**: All 131 appliance types available before this feature are still
  available after it, with the same ports and symbols.
- **SC-005**: Opening a topology that uses an edited appliance type never loses
  placed appliances, and a type still in use cannot be deleted out from under a
  plan.
- **SC-006**: A person can locate a specific appliance type in a library of
  several hundred within a few seconds.
- **SC-008**: An interrupted write never damages the catalogue.
- **SC-009**: A plan opens correctly on a machine that has never seen the
  equipment it places.
- **SC-010**: Editing a type in the library never alters a plan made earlier.
- **SC-011**: Equipment marked approved cannot be changed by someone without
  permission.
- **SC-012**: A correction made in the library can reach every plan built on the
  old definition, without any plan changing on its own.

## Assumptions

These were decided rather than left open. Each is recorded so it can be
challenged.

- **The library belongs to the person, not to a topology.** It persists across
  every plan they make. A topology refers to appliance types by identifier
  rather than embedding them. The consequence is that a topology opened on
  another machine may reference types that machine does not have — handled by
  exporting the types alongside it, which US2 provides. Making the library
  project-scoped instead would guarantee topologies always open, at the cost of
  duplicating the catalogue into every plan.
- Symbols are vector drawings, so they stay sharp at any canvas zoom. The
  physical plane zooms from a geographic map to a floorplan, which raster images
  would not survive.
- Shipped types are editable rather than locked, with the original restorable.
  Locking them would force people to clone a type to correct a detail.
- An appliance type is a *kind* of hardware. Serial numbers, asset tags and
  anything else belonging to a specific unit belong to the placed appliance, not
  the type.
- Plane membership reuses the existing `physical` and `logical` distinction
  already recorded on all 131 types, extended to the five planes in
  `CONTEXT.md`.
- **Imports are permissive rather than atomic.** A file with one bad entry
  applies the rest and reports what it skipped. This was chosen deliberately
  over refusing the whole file, on the grounds that a person importing a large
  set should not lose all of it to one bad record. The cost is that the library
  can end up in a state the person did not review entry by entry, which is why
  FR-011 requires a report of exactly what happened.
- **"Secure" currently means integrity only.** The catalogue cannot be left
  half-written or silently corrupted (FR-027). Encryption at rest and access
  control are recorded as undecided in [ADR 0010](../../docs/adr/0010-hardware-library-database.md),
  because the right answer depends on the threat being defended against, which
  has not been stated.
- **Application start time is deliberately not a criterion.** An earlier
  criterion required start to be no slower with a large catalogue. It was
  withdrawn: no baseline was ever measured, so it could not be judged, and
  holding an unjudgeable criterion is worse than holding none. FR-026 still
  requires the catalogue to be searchable without loading all of it, which is
  the property that actually protects start.
- Extending toward GNU Radio, GNS3 and similar tooling is out of scope here.
  This feature is the foundation those integrations would later import into.

## Dependencies

- `CONTEXT.md` — the five planes and the build order that places this first.
- [ADR 0007](../../docs/adr/0007-single-object-many-planes.md) — a placed
  appliance is one object with a facet per plane; this feature defines the types
  those objects instantiate.
- [ADR 0008](../../docs/adr/0008-project-files-on-disk.md) — establishes
  main-process file handling, which this feature is the first to require.
- Constitution Principle I and III — where the logic lives, and the process
  boundary it must respect.
