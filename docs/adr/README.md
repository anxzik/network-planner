# Architecture Decision Records

Each file records one decision: the context that forced it, what was decided,
and what following it costs. They are append-only — a decision that stops being
true is superseded by a new record, not edited in place.

Referenced by `CLAUDE.md`. The project constitution at
`.specify/memory/constitution.md` states the rules currently in force; these
records explain how those rules were arrived at.

| # | Decision | Status |
|---|----------|--------|
| [0001](0001-domain-logic-in-utils.md) | Domain logic lives in `src/utils/`; components stay thin and untested | Accepted |
| [0002](0002-localstorage-persistence.md) | Persist to `localStorage` under one namespaced, versioned key | Accepted |
| [0003](0003-commonjs-main-process.md) | Build the Electron main process as CommonJS despite `"type": "module"` | Accepted |
| [0004](0004-adopt-spec-kit.md) | Adopt spec-kit and commit `.specify/` to the repository | Accepted |
| [0005](0005-private-extension-catalog.md) | Install vetted extensions from a private catalog | Accepted |
| [0006](0006-feature-branch-naming.md) | Name feature branches `NNN-slug`, matching their spec directory | Accepted |

## Open

These are recorded in the constitution as undecided. Each needs a record here
once settled:

- Whether components stay untested long term (see 0001)
- Continuous integration — the quality gates are defined but unenforced
- Whether `CONTEXT.md` exists alongside the constitution, or is replaced by it

## Format

Nygard-style: Context, Decision, Consequences. Number sequentially, never reuse
a number. Use `template.md` as the starting point.
