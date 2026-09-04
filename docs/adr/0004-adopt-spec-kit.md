# 0004. Adopt spec-kit and commit `.specify/` to the repository

**Status:** Accepted
**Date:** 2026-09-02

## Context

The project had `CLAUDE.md` and `docs/agents/` but no structured way to take a
feature from description to plan to tasks. `CLAUDE.md` referenced `CONTEXT.md`
and `docs/adr/`, neither of which existed.

spec-kit provides that workflow. Its extensions are not tools but project
configuration: they register hooks that change what happens when anyone runs
`/speckit-specify`, and they bind to this project's specific conventions.

## Decision

Install spec-kit at the repository root and commit `.specify/` — templates,
constitution, scripts, and installed extensions — to version control. Derive
the constitution from what the code actually does, using the brownfield
extension's scan, rather than accepting stock defaults.

## Consequences

A clone reproduces the workflow exactly: same templates, same extensions, same
hooks. That is the point, and it is only achievable by committing the directory.

The costs are real and worth stating. `.specify/` is now roughly 50,000 lines
of vendored third-party tooling against about 13,000 lines of application code,
making it the dominant surface in any repo-wide diff, blame, or search.
`.specify/extensions.yml` and `.registry` are shared mutable files rewritten by
every install, so two branches adding different extensions will conflict in a
way git cannot resolve structurally. And `auto_execute_hooks` is on, so the
15 registered hooks prompt during specify, clarify, plan and implement for
everyone working in the repository, not just the person who installed them.
