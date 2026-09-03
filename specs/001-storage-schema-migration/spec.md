# Feature Specification: Storage Schema Migration and Safe Recovery

**Feature Branch**: `001-storage-schema-migration`
**Created**: 2026-09-02
**Status**: Draft

## User Scenarios & Testing *(mandatory)*

Everything a person builds in this application — devices placed on the canvas,
the links between their ports, VLAN definitions, scratchpad notes, and settings
— lives only on their own machine. There is no account, no server, and no copy
anywhere else. If that stored data is lost, the work is gone.

Two situations currently destroy it silently, and this feature addresses both.

### User Story 1 - Saved work survives an application update (Priority: P1)

A person has spent an afternoon laying out a site's network. They close the app.
Some weeks later the app updates, and the newer version stores topologies in a
different shape. They reopen the app expecting their site to be there.

**Why this priority**: This is the failure that will eventually affect every
user who keeps the application installed. It needs no unusual conditions — only
time and a release.

**Independent Test**: Write data in the old shape, load it with the newer
application, and confirm the topology appears intact and correct.

**Acceptance Scenarios**:

1. **Given** stored data written by an earlier version, **When** the person
   opens the application, **Then** their topology loads with every device, link,
   port assignment and VLAN preserved.
2. **Given** stored data already in the current shape, **When** the person opens
   the application, **Then** it loads unchanged and nothing is rewritten
   unnecessarily.
3. **Given** stored data that has been upgraded, **When** the person reopens the
   application again, **Then** the upgrade is not applied a second time.

### User Story 2 - Damaged data is preserved, not overwritten (Priority: P1)

A person opens the application and their canvas is empty. Today the stored data
is unreadable, the application quietly starts from nothing, and the next change
they make overwrites the damaged data — destroying any chance of recovery.

**Why this priority**: The current behaviour converts a recoverable problem into
a permanent loss, and does so within seconds of opening the app. Preserving the
data must land at the same time as US1, because a migration that goes wrong
would otherwise cause exactly this.

**Independent Test**: Corrupt the stored data, open the application, then
confirm the original content still exists afterwards and that continuing to use
the app does not erase it.

**Acceptance Scenarios**:

1. **Given** stored data that cannot be read, **When** the person opens the
   application, **Then** the original content is preserved and remains
   retrievable after further use of the app.
2. **Given** preserved data exists, **When** the person uses the application
   normally, **Then** their new work saves successfully and does not overwrite
   what was preserved.
3. **Given** stored data that cannot be read, **When** the person opens the
   application, **Then** they are told their previous work could not be opened
   and that a copy has been kept — rather than being shown an empty canvas with
   no explanation.

### User Story 3 - Recovering what was preserved (Priority: P2)

Having been told a copy was kept, the person wants to do something about it.

**Why this priority**: Preservation without any route to the data is only half
an answer, but the preservation itself is what prevents the loss. This can
follow.

**Independent Test**: With preserved data present, exercise the recovery route
and confirm the person ends up with either their restored work or a file they
can keep.

**Acceptance Scenarios**:

1. **Given** preserved data exists, **When** the person chooses to recover it,
   **Then** they obtain the preserved content in a form they can keep or hand to
   someone who can help.
2. **Given** the person has dealt with the preserved copy, **When** they dismiss
   it, **Then** they are not told about it again.

### Edge Cases

- Stored data records a **newer** version than the application understands —
  the person has opened an older build after using a newer one. The application
  cannot know what the newer shape means.
- Stored data is absent entirely — a first run. This must remain silent and
  produce no warning, since nothing is wrong.
- Stored data is readable but records no version at all, having been written
  before versioning existed.
- An upgrade step itself fails partway through.
- The storage area is full, or writing is refused by the browser, when
  attempting to preserve a copy.
- Preserved data already exists from an earlier incident when a second one
  occurs.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The application MUST read the version recorded in stored data
  before using that data.
- **FR-002**: When the stored version is older than the current one, the
  application MUST bring the data forward to the current shape before use,
  applying each intervening step in order.
- **FR-003**: The application MUST record the new version after a successful
  upgrade, so that reopening it does not repeat the work.
- **FR-004**: When stored data records a version newer than the application
  understands, the application MUST NOT attempt to read or overwrite it, MUST
  preserve it, and MUST tell the person that their data was written by a newer
  version.
- **FR-005**: When stored data cannot be read at all, the application MUST
  preserve the original content before proceeding.
- **FR-006**: The application MUST NOT overwrite preserved content during
  ordinary use.
- **FR-007**: The application MUST tell the person, in the application itself,
  when their previous work could not be opened and a copy has been kept. A
  console message alone does not satisfy this.
- **FR-008**: The application MUST NOT warn the person when there is simply no
  stored data, which is the ordinary first-run case.
- **FR-009**: Stored data carrying no version MUST be treated as the earliest
  known version and brought forward accordingly.
- **FR-010**: When an upgrade step fails, the application MUST leave the
  original data untouched and preserve it, rather than saving a half-upgraded
  result.
- **FR-011**: When a copy cannot be preserved because storage is unavailable or
  full, the application MUST NOT overwrite the original, and MUST tell the
  person what happened.
- **FR-012**: When a second incident occurs while a preserved copy already
  exists, the application MUST NOT discard the earlier copy.
- **FR-013**: The person MUST be able to obtain the preserved content in a form
  they can keep.
- **FR-014**: The person MUST be able to dismiss the notice about preserved
  content, and MUST NOT be shown it again once dismissed.
- **FR-015**: Bringing data forward MUST be deterministic — the same input
  always produces the same result — and MUST NOT depend on the current time,
  random values, or anything outside the stored data itself.

### Key Entities

- **Stored topology**: everything the person has built — devices, links, ports,
  VLANs, scratchpad contents, and settings — held together under a single
  stored record.
- **Schema version**: a number recorded alongside the stored topology, marking
  which shape the data is in.
- **Upgrade step**: a single move from one version to the next, which takes data
  in the older shape and returns it in the newer one.
- **Preserved copy**: the original stored content, kept aside untouched when it
  could not be read or upgraded, together with the reason it was kept and when.

## Persistence

- **What persists**: the stored topology and its schema version; and, when an
  incident occurs, the preserved copy and the reason it was kept.
- **Where**: within the application's existing local storage area. The preserved
  copy is kept separately from live data so that ordinary saving cannot reach
  it.
- **Shape change**: yes — this feature introduces the concept of a preserved
  copy alongside the existing record, and makes the existing version number
  meaningful for the first time.
- **Migration**: this feature *is* the migration path. Data written before it
  existed carries version 1 or no version at all, and both must be brought
  forward. Existing saved topologies must survive the introduction of this
  feature, which is the first case its own upgrade path has to handle.

## Testability

- **Logic to extract**: reading the recorded version, deciding whether data is
  older, current, or newer, applying upgrade steps in order, and deciding
  whether an incident has occurred and what to preserve. All of this takes
  stored content and returns a result, and belongs in `src/utils/` with
  co-located tests.
- **Left in the component**: showing the notice, and the control the person uses
  to recover or dismiss it. These carry no decision-making — they display what
  the logic reports and pass the person's choice back.
- **Manual verification**: that the notice actually appears, reads clearly, and
  that recovery produces something usable. Whether a person understands the
  message cannot be settled by a test.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: No person loses saved work as a result of an application update.
  Data written by any earlier released version opens successfully in the
  current one.
- **SC-002**: Unreadable stored data is never destroyed. After an incident, the
  original content is still retrievable no matter how long the person continues
  using the application.
- **SC-003**: A person who opens the application and does not find their work
  is told why, within the application, on the same visit — rather than
  discovering an empty canvas with no explanation.
- **SC-004**: A first-time user sees no warnings, notices, or errors relating
  to stored data.
- **SC-005**: Opening the application with data that is already current is no
  slower than before this feature existed.
- **SC-006**: Every upgrade path from every previously released data shape to
  the current one is covered by an automated test.

## Assumptions

- Everything continues to be stored locally on the person's own machine. This
  feature does not introduce accounts, servers, or copies held elsewhere. It
  reduces the chance of loss; it is not a backup service.
- Data written by a **newer** version cannot be safely interpreted by an older
  one, so the application refuses rather than guessing. Refusing and preserving
  is treated as clearly correct here and is specified in FR-004 rather than
  raised as an open question.
- The preserved copy is kept until the person dismisses it. It is not expired
  on a timer, because the person may not open the application again for weeks
  and the copy is the only remaining record of their work.
- Only one incident's copy needs to be independently retrievable at a time;
  FR-012 requires that an earlier copy is not discarded, not that an unlimited
  history is kept.
- The stored record is small enough that copying it aside is not itself a
  performance concern. This follows from ADR 0002, which notes that storage
  volume has not been measured; if that assumption fails it affects this
  feature too.
- There is one current schema version at any time, moving forward only. Data is
  never downgraded.

## Dependencies

- ADR 0002 records the persistence decision this feature amends, including the
  two defects it addresses.
- Constitution Principle I governs where the logic lives and how it is tested.
