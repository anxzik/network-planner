# 0006. Name feature branches `NNN-slug`, matching their spec directory

**Status:** Accepted
**Date:** 2026-09-02

## Context

`origin` carries three incompatible branch conventions at once: bare kebab-case
descriptions (`ip-functions`, `dynamic-linking-and-scratchpad`), a `feature/`
prefix (`feature/update-readme`), and tool-generated `copilot/*` branches. It
also carries a casing collision — `Electron-Wrapper` and `electron-wrapper` are
separate remote branches differing only in case, which is a merge hazard on
case-insensitive filesystems.

Adopting spec-kit forces the question, because `/speckit-specify` creates a
branch on every run. Whatever the first invocation produces becomes the de facto
standard.

Stock `create-new-feature.sh` builds `NNN-slug`, zero-padded and sequential from
the highest existing `specs/` directory. `--timestamp` substitutes
`YYYYMMDD-HHMMSS`, and `--short-name` overrides the slug. There is no prefix
option; `feature_numbering: sequential` in `.specify/init-options.json` is the
only knob. A `feat/` prefix would require the `branch-convention` extension.

## Decision

Accept the stock format. A feature branch is named `NNN-slug` — `001-storage-schema-migration` — identical to its `specs/NNN-slug/` directory.

This is a decision to keep the default, not an absence of one. Do not install
`branch-convention`, and do not pass `--timestamp`.

Existing branches are left as they are. The convention applies to branches
created from this point forward.

## Consequences

A branch name and its spec directory are the same string, so moving between the
two needs no translation and no lookup. Branches sort in creation order.

The costs: branch names carry no type information, so `feat`/`fix`/`chore`
cannot be distinguished from the branch name the way they can from commit
messages — the spec is the place to look instead. Numbering is derived from
directories on disk, so two people creating features on separate branches can
both claim the same number and collide on merge. And the convention only holds
for spec-kit-created branches; a hand-made branch is unconstrained, since
nothing enforces this.
