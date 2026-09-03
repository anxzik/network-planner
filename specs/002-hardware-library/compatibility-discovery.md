# Compatibility Discovery

## Decision Question

Is `node:sqlite`, the SQLite module built into Node, safe to build the hardware
catalogue on across every platform this application ships to, given it is
flagged experimental and has been verified in one environment only?

## Evaluation Mode

`single-approach-readiness`

ADR 0010 already chose `node:sqlite`. This evaluates whether that choice is
ready for the support matrix, not whether a different module would be better.
Fallbacks are recorded because readiness is partly a question of what happens if
the approach fails.

## Scenario Context

The catalogue moves out of application source into a database owned by the
Electron main process (ADR 0010). Every plane reads it, import and export write
to it, and an interrupted write must not damage it (FR-027). It is the
persistence layer for the feature at the top of the build order.

`node:sqlite` was chosen because every alternative is a native module, which
means a rebuild step and a compiled binary per platform across four packaging
targets. A built-in module has neither.

## Success Criteria

- The module loads in the packaged application on every supported platform, not
  only under development.
- The database file is writable at its intended location on every platform.
- A Node upgrade arriving with an Electron upgrade does not silently break
  storage.
- If the module becomes unusable, a replacement is possible without redesigning
  the catalogue.

## Candidate Approaches

Recorded for fallback purposes; the decision itself is already made.

1. **`node:sqlite`** (chosen). No dependency, no build step, experimental API.
2. **`better-sqlite3`**. Mature and synchronous, native, requires rebuilding per
   platform and per Electron version.
3. **`sql.js`**. SQLite compiled to WebAssembly. No native build, but holds the
   database in memory and must be serialised out by hand, which reintroduces the
   whole-file rewrite ADR 0010 rejected.

## Support Matrix

Derived from `forge.config.ts`.

| Platform | Maker | Verified |
|---|---|---|
| Windows | `MakerSquirrel` | No |
| macOS | `MakerZIP`, `darwin` only | No |
| Linux (Debian) | `MakerDeb` | Development only |
| Linux (RPM) | `MakerRpm` | Development only |

## Repository Findings

**Runtime.** `package.json` pins `"electron": "40.0.0"` exactly, with no caret.
The Node version inside it is therefore fixed until someone deliberately changes
it, which is a stronger position than a floating range would give.

**Prior verification.** Availability was established during planning by running
the project's own Electron binary. It reported Node 24.11.1 and resolved
`node:sqlite`, printing `ExperimentalWarning: SQLite is an experimental feature
and might change at any time`.

**That verification used a method the packaged application disables.** The check
ran through `ELECTRON_RUN_AS_NODE`, and `forge.config.ts` sets
`[FuseV1Options.RunAsNode]: false`. The fuse governs whether the binary can run
as a plain Node process; it does not remove modules from the main process. So
the module is expected to remain available, but the evidence gathered so far
cannot be reproduced against a packaged build by the same means. Task T003 has
to verify this a different way than it was verified the first time.

**Asar packaging constrains where the database may live.**
`[FuseV1Options.OnlyLoadAppFromAsar]: true` and
`[FuseV1Options.EnableEmbeddedAsarIntegrityValidation]: true` are both set. An
asar archive is read-only and integrity-checked, so the database file cannot sit
inside the packaged application directory. It has to live in a per-user writable
location. Nothing in the specification, plan, data model or contract currently
says where the database file goes.

**Flag-based escape hatches are closed.**
`[FuseV1Options.EnableNodeOptionsEnvironmentVariable]: false` means runtime
flags cannot be passed through `NODE_OPTIONS`. `node:sqlite` does not currently
require a flag, but if a future Node made the module flag-gated, that route is
unavailable in the packaged build.

**No native build machinery is wired.** `@electron-forge/plugin-auto-unpack-natives`
is present in `package.json` but does not appear in the `plugins` array of
`forge.config.ts`. Switching to a native module later is therefore not a
one-line dependency change; the packaging configuration would need work too.

## Required Support

- Windows, macOS and Linux, since all four makers are configured.
- The module loading in the packaged main process on each.
- A writable database location on each, outside the asar archive.
- Integrity preserved across an unclean shutdown (FR-027).

## Optional Support

- Running the application from a read-only or network-mounted install location.
- Multiple application instances against one catalogue. Nothing in the
  specification says whether that is allowed, and SQLite's behaviour differs by
  platform and filesystem.

## Scenario Risks

| Risk | Likelihood | Impact | Note |
|---|---|---|---|
| Experimental API changes under a Node upgrade | Medium | High | Arrives with an Electron upgrade, not on this project's schedule. Confined to one module by design |
| Module behaves differently in the packaged build | Low | High | Not expected, but never tested, and the original test method no longer applies |
| Database path unspecified, so it lands inside asar | Medium | High | Read-only and integrity-checked. Would fail on first write, in the packaged build only |
| Platform-specific file locking or path behaviour | Medium | Medium | Only Linux has been exercised at all |
| Fallback to a native module is costlier than assumed | Medium | Medium | Packaging plugin present but unwired |
| Network or removable-media install location | Low | Medium | SQLite locking is unreliable on some network filesystems |

## Test Matrix

What would have to be exercised to close this. None of it has been run.

| Check | Windows | macOS | Linux |
|---|---|---|---|
| Module loads in the packaged main process | ✗ | ✗ | ✗ |
| Database created at its intended location | ✗ | ✗ | ✗ |
| Write survives an unclean shutdown | ✗ | ✗ | ✗ |
| Behaviour with the application already running | ✗ | ✗ | ✗ |

Development-mode availability is established on Linux only, and by a method the
packaged build disables.

## Fallbacks or Degradation

- **If the API changes under an Electron upgrade**: the change is confined to
  the single storage module by ADR 0010's design, which is what that
  confinement was for. Pinning Electron exactly, as `package.json` already does,
  means the upgrade is a deliberate act rather than a surprise.
- **If the module proves unusable on a platform**: `better-sqlite3` is the
  fallback. It requires wiring the auto-unpack-natives plugin into
  `forge.config.ts` and accepting a per-platform build. Cost is real but bounded.
- **If a write fails because the location is not writable**: the specification
  requires an interrupted or failed write to leave the catalogue undamaged
  (FR-027). It does not say what a person sees when the catalogue cannot be
  created at all on first run. That is a gap.

## Evidence Gaps

- Whether `node:sqlite` loads in a packaged build on any platform.
- Whether it loads on Windows or macOS at all, in any mode.
- Where the database file is intended to live. Unspecified everywhere.
- The module's current stability status in Node 24. The runtime warning is
  evidence that it is experimental; whether it is progressing toward stable, and
  on what timeline, requires checking current Node documentation and has not
  been done.
- Whether more than one application instance may open the catalogue.
- What the person sees if the catalogue cannot be created or opened.

## Validation Plan

Ordered by decision risk removed. All of it belongs to `/speckit.discovery.poc`
or to task work, not to this command.

1. Build one packaged artifact and confirm the module loads in the main process,
   by a method that does not rely on `ELECTRON_RUN_AS_NODE`. Task T003 covers
   the packaging half but not how the result is observed.
2. Decide and record where the database file lives, before any storage code is
   written. This is a specification gap, not a test.
3. Repeat the packaged check on Windows and macOS.
4. Exercise an unclean shutdown mid-write on each platform, against FR-027.
5. Check the current stability status of `node:sqlite` in Node 24 documentation.

## Recommendation

Keep `node:sqlite`. The reasoning in ADR 0010 holds and nothing found here
contradicts it. The risk is concentrated in verification rather than in the
choice.

Two items should be settled before storage code is written, and neither is a
test. The database file location is unspecified in every artifact, and asar
packaging makes that a correctness question rather than a detail. And task T003
should say how the packaged result is observed, because the method used to
establish availability the first time is disabled by a fuse this project has
deliberately set.

Then run the packaged check on all three platforms before the catalogue is
depended on by later features. It is cheap now and expensive after the plane
architecture is built on top of it.

Recommended follow-up: `/speckit.discovery.poc` for the packaged-build load
check across the support matrix, which is the one piece of executable evidence
that would close most of this.

## Planning Decision

`needs-matrix-test`

The approach is sound and the fallback is bounded. It has been verified on one
platform, in development, by a method the packaged build disables, and the
database file location is not specified anywhere.
