# 0010. Keep the hardware library in a local database

**Status:** Accepted
**Date:** 2026-09-02

## Context

[ADR 0008](0008-project-files-on-disk.md) moved topologies to project files on
disk. It did not say where the hardware catalogue lives, and the hardware
library specification assumed only that the catalogue persists independently of
any one plan.

The catalogue is a different kind of data from a plan. It starts at 131
appliance types and is expected to reach several hundred or several thousand as
people add their own equipment and import sets from colleagues. It is queried
constantly — every plane browses and filters it — where a topology is opened
whole. It also accumulates value over years, which a single plan does not.

A flat file holding thousands of appliance types would be read and rewritten in
full for every edit, offers no way to query without loading everything, and
gives no protection against a partial write leaving the catalogue damaged.

## Decision

The hardware catalogue lives in a **local database**, managed by the Electron
main process. Topologies remain portable project files under ADR 0008 and refer
to appliance types by identifier.

Import and export stay file-based: a library file is how a catalogue moves
between machines, and the database is how it is held and queried on one.

## Consequences

The catalogue can be searched and filtered without loading all of it, edits
touch one record rather than rewriting the whole file, and a failed write cannot
corrupt the entire library.

The costs are real. The main process gains a database dependency and the
schema-versioning duty that comes with it, on top of the project-file format
from ADR 0008 — the application now has two persistence mechanisms with two
migration stories. Backing up the catalogue stops being "copy a file", which
matters because the library is exactly the asset a person accumulates over
years. And the 131 shipped types now need a defined path into the database on
first run, and a defined behaviour when a later release changes them.

## Security

The decision was motivated in part by keeping catalogue data organised **and
secure**. What "secure" requires here is not yet settled, and the range is wide:

- **Integrity** — the catalogue cannot be left half-written or silently
  corrupted. This much is implied by choosing a database and is treated as in
  scope.
- **Encryption at rest** — protecting the catalogue from anyone with access to
  the machine. Not decided.
- **Access control** — restricting who may edit approved equipment, which would
  suit an organisation curating a standard set. Not decided, and related to the
  open question about locking shipped types.

**Resolved**: integrity and access control are both in scope. An organisation
curating a standard set of equipment must be able to mark it approved and
restrict who may change it, which is the concern that motivated the database.
This also settles the separate open question about locking shipped types: the
same mechanism covers both, since approved equipment is approved regardless of
whether it shipped with the application or was added locally.

Encryption at rest stays open. It defends a different threat, someone with the
machine's storage rather than someone using the application, and no one has
stated that threat yet.
