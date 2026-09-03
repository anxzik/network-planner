# 0005. Install vetted extensions from a private catalog

**Status:** Accepted
**Date:** 2026-09-02

## Context

spec-kit resolves extensions per project — every path in the CLI is
`project_root / ".specify" / "extensions"`, found by walking up from the working
directory. There is no user-level extension store, so a second project means
installing everything again.

Worse, all 163 community extensions live in a discovery-only catalog. Each
install needs `--from <url>` and an interactive trust confirmation, and the
pinned URLs go stale: the catalog listed `status-report` at v1.2.5, a tag that
no longer exists upstream.

Extension *catalogs*, unlike extensions, do resolve user-level — from
`~/.specify/extension-catalogs.yml`.

## Decision

Publish a curated catalog at `anxzik/spec-kit-catalog` listing the extensions
already installed and verified here, each pinned to a working release archive.
Register it user-level at priority 1 with `install_allowed: true`.

The catalog is an index, not a mirror: every `download_url` points at the
original author's release. Nothing is re-hosted.

## Consequences

Any project gets `specify extension add wiki` with no URL and no trust prompt,
resolving to a version already run in anger. The trust boundary is preserved
rather than bypassed — `install_allowed` covers exactly these pinned versions,
and the community catalog stays discovery-only.

Two costs. The user-level config replaces the built-in catalog stack instead of
extending it, so the upstream `default` and `community` catalogs must be
re-declared in that file; deleting an entry silently removes a catalog.

And the pins are static. Every extension change is now a two-repository
operation — the project and the catalog — or the catalog starts lying about
what is vetted.
