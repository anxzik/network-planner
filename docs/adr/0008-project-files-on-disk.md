# 0008. Store topologies as project files on disk

**Status:** Accepted
**Date:** 2026-09-02

## Context

[ADR 0002](0002-localstorage-persistence.md) put all state in a single
`localStorage` key. That suited an app whose state was a modest object graph.

`CONTEXT.md` describes something much larger: floorplans, geographic data, a
full hardware library, symbol sets, RF models, and multiple topologies per
person. `localStorage` caps at roughly 5–10 MB, is synchronous, and is reachable
only from the renderer. This is not a limit that might eventually be hit; it is
one this application's first real site plan will hit.

The application also has to import and export topologies, share pre-built ones,
and let people keep their plans — all of which want a file, not a browser
storage key.

## Decision

A topology is a **project file on disk**. The Electron main process reads and
writes it; the renderer requests operations through the preload bridge.

Import and export stop being conversions and become the native format. Saving is
saving a file.

This supersedes ADR 0002.

## Consequences

The size ceiling is gone, plans are shareable, and a topology can be put in
version control or handed to a colleague. Import and export become nearly free
because the stored form is the interchange form.

The costs are real. File dialogs, path handling, permissions and save-state
tracking are now the application's problem, where `localStorage` had none of
them. The main process grows from 153 lines of shell into a genuine part of the
architecture, which pulls against Principle I's assumption of a thin renderer
boundary — main-process logic still needs to be testable, and the constitution
does not currently say how.

Feature `001-storage-schema-migration` was specified against ADR 0002 and is
substantially invalidated by this decision. Its two underlying problems remain
real — versioned data needs a migration path, and unreadable data must not be
destroyed — but they now apply to project files. That spec needs reworking
before it is planned.

Existing users have topologies in `localStorage` today. A one-time move into a
project file is required, and it is the first migration the new format has to
handle.
