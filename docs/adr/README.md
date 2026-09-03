# Architecture Decision Records

Each file records one decision: the context that forced it, what was decided,
and what following it costs. They are append-only — a decision that stops being
true is superseded by a new record, not edited in place.

Referenced by `CLAUDE.md`. The project constitution at
`.specify/memory/constitution.md` states the rules currently in force, and
`CONTEXT.md` describes the domain; these records explain how the decisions
behind both were arrived at.

| # | Decision | Status |
|---|----------|--------|
| [0001](0001-domain-logic-in-utils.md) | Domain logic lives in `src/utils/`; components stay thin and untested | Accepted |
| [0002](0002-localstorage-persistence.md) | Persist to `localStorage` under one namespaced, versioned key | Superseded by 0008 |
| [0003](0003-commonjs-main-process.md) | Build the Electron main process as CommonJS despite `"type": "module"` | Accepted |
| [0004](0004-adopt-spec-kit.md) | Adopt spec-kit and commit `.specify/` to the repository | Accepted |
| [0005](0005-private-extension-catalog.md) | Install vetted extensions from a private catalog | Accepted |
| [0006](0006-feature-branch-naming.md) | Name feature branches `NNN-slug`, matching their spec directory | Accepted |
| [0007](0007-single-object-many-planes.md) | An appliance is one object with a facet per plane | Accepted |
| [0008](0008-project-files-on-disk.md) | Store topologies as project files on disk | Accepted |
| [0009](0009-map-data-source.md) | Geographic maps use online tiles and degrade offline | Accepted |
| [0010](0010-hardware-library-database.md) | Keep the hardware library in a local database | Accepted |
| [0011](0011-plans-snapshot-appliance-types.md) | A plan keeps its own copy of every appliance type it places | Accepted |
| [0012](0012-updating-a-diverged-plan.md) | A plan can be offered the library's current definition | Accepted |

## Open

- Whether the hardware catalogue needs encryption at rest (see 0010; integrity
  and access control are settled)

These are recorded in the constitution as undecided. Each needs a record here
once settled:

- Whether components stay untested long term (see 0001)
- Continuous integration — the quality gates are defined but unenforced

## Format

Nygard-style: Context, Decision, Consequences. Number sequentially, never reuse
a number. Use `template.md` as the starting point.
