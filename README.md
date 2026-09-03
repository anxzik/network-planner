# Network Planner

A desktop application for planning networks from the ground up: what hardware
goes where, how it is wired and configured, and — as the project grows — how it
reaches into cloud, radio, and life-safety systems.

Built with Electron, React, and ReactFlow. Runs on Linux, macOS, and Windows.
No server, no account: your plans live on your machine.

> **Planning, not managing.** Network Planner designs networks and emits
> artifacts. It never talks to live equipment.

---

## What works today

The current release covers part of the **logical plane** plus the
**hardware library**:

| Area | What you can do |
|---|---|
| **Topology canvas** | Place devices, wire ports between them with vendor-correct interface names (`Fa0/0`, `eth0`, `TenGigabitEthernet 1/0/0`), and switch between physical and logical views |
| **VLANs** | Define VLANs, assign them per port (access/trunk with native VLAN), see membership propagate |
| **Subnet calculator** | Full IPv4 subnet math with a dedicated tab |
| **Scratchpad** | Pin calculations and notes alongside your plan |
| **Hardware library** | An editable catalogue of appliance types, backed by SQLite — see below |

### The hardware library

The catalogue ships with **131 appliance types across 19 categories** (Cisco,
Ubiquiti, Juniper, Palo Alto, Dell, MikroTik, cloud and virtual entities, and
more), and it belongs to you:

- **Add your own hardware** — name, manufacturer, model, category, plane
  membership, and a port layout across 17 port kinds (copper, the SFP/QSFP
  families, fibre, coax, WAN…), up to 512 ports per type.
- **Edit anything**, including shipped types — edited types are marked, and
  the shipped definition is always restorable.
- **Export and import** — hand a JSON library file to a colleague. Collisions
  are shown *before* anything is written (replace / keep both / skip, per
  entry), and the import report names every skipped entry with a reason.
  Files from older versions of the app are upgraded on the way in; files from
  unknown versions import what's readable and warn.
- **Symbol sets** — import your organisation's SVG symbols and assign them to
  types. Imported markup is validated as untrusted (no scripts, no event
  handlers, no external references) before it is ever drawn.
- **Search and filter** — by text, category, plane, or "my hardware", executed
  in SQL rather than by loading the catalogue.
- **Approve equipment** — mark an organisation's standard kit. (Enforcement of
  who may edit approved types is designed but deliberately deferred — see
  `docs/adr/` for why.)

### Where your data lives

| Data | Location |
|---|---|
| Hardware catalogue | `<userData>/catalogue.db` (SQLite, WAL journaling — an interrupted write cannot corrupt it) |
| Current topology | Browser storage under the app's profile (moving to portable project files — see roadmap) |

`<userData>` is `~/.config/network-planner` on Linux, `~/Library/Application
Support/network-planner` on macOS, `%APPDATA%/network-planner` on Windows.

---

## Getting started

### Prerequisites

- **Node.js 20+** and npm (development only — the packaged app bundles its own
  runtime)
- Linux, macOS, or Windows

### Run from source

```bash
git clone https://github.com/anxzik/network-planner.git
cd network-planner
npm install
npm start
```

### Build installers

```bash
npm run package   # unpacked app in out/
npm run make      # platform installers: deb, rpm, Squirrel (Windows), zip (macOS)
```

### Verify a working tree

```bash
npm run lint       # eslint (flat config)
npm test           # vitest — 339 tests, sub-second
npm run typecheck  # tsc --noEmit
```

All three must pass before any change is considered complete. There is no CI
yet (a recorded open decision), so these run locally.

---

## Architecture

Electron's three processes, kept deliberately distinct:

```text
src/
├── main.ts              Electron main — window lifecycle, opens the catalogue
├── preload.ts           The context bridge: the renderer's ONLY route to main
├── library/             Main-process only: SQLite store, schema, seed, IPC
│   └── catalogueStore.ts  ← every node:sqlite call in the app lives here
├── utils/               Pure domain logic, one co-located *.test.js each
├── context/             React contexts: Network, Library, Settings, Scratchpad
├── components/          UI by feature — Canvas, Hardware, VlanConfig, …
└── data/                (retired — the catalogue moved into SQLite)
```

Principles that are enforced, not aspirational (full text in
`.specify/memory/constitution.md`):

1. **Logic lives in `src/utils/` and is tested; components stay thin.**
   Decisions are pure functions over plain data. The same validation runs in
   the renderer for instant feedback and again in the main process before
   anything is written, so the rules cannot drift.
2. **Tests are node-environment, co-located `*.test.js`.** There is no DOM in
   the test suite by design.
3. **The process boundary is real.** The renderer never receives a filesystem
   path it could reuse, never holds a database handle, and everything crossing
   the boundary goes through `preload.ts` behind a typed envelope
   (`{ok: true, value} | {ok: false, error: {code, message}}`).
4. **Dependencies point downward.** `src/utils/` imports nothing from `src/`.

The storage engine is `node:sqlite` — built into the bundled Node, so there is
no native module and no rebuild across the four packaging targets. It is
verified working inside the fused, packaged binary, not just under `npm start`.

---

## Contributing

This project is **spec-driven**: features are specified, validated, planned,
and broken into tasks before implementation, and the paper trail is part of
the deliverable. Reading order for a new contributor:

1. **`CONTEXT.md`** — what this application is, its five planes, its
   vocabulary, and the build order.
2. **`docs/adr/`** — every architectural decision, each with its costs stated.
   Start with the README there; decisions are append-only and superseded, never
   rewritten.
3. **`.specify/memory/constitution.md`** — the rules in force, and the three
   still-open decisions.
4. **`specs/<feature>/`** — a feature's full trail: spec, plan, research, data
   model, contracts, tasks, wireframes.
5. **`wiki/`** — accumulated project knowledge, every claim cited to a source.

### The workflow

Features move through [spec-kit](https://github.com/github/spec-kit)
(`specify` CLI, configured in `.specify/`):

```text
/speckit-specify  →  spec.md          what and why, validated by quiz
/speckit-plan     →  plan.md + design research, data model, contracts
/speckit-tasks    →  tasks.md         ordered, story-grouped, file-pathed
implementation    →  tests first for anything in src/utils/
```

Hooks fire between phases (product briefs, validation, wireframes) — they are
optional prompts, not gates.

### Ground rules

- **Branches**: `NNN-slug`, identical to the feature's `specs/` directory
  (ADR 0006). Branch from `electron`; PRs target `electron`.
- **Commits**: Conventional Commits — `feat:`, `fix:`, `chore:`, `refactor:`,
  `docs:`, `test:`. Write real commit messages; this repo's history explains
  *why*, and that is deliberate.
- **Tests**: anything behavioural in `src/utils/` gets a co-located test,
  written first. Don't add a DOM test environment without an ADR — that's a
  recorded architectural decision, not a config tweak.
- **Gates**: `npm run lint && npm test && npm run typecheck` green before
  every commit. Check exit codes, not output.
- **New decisions**: if your change makes an architectural choice, add an ADR
  (`docs/adr/template.md`) stating what it costs, not just what it buys. If it
  invalidates an old one, supersede it — never edit history.
- **Files under 500 lines**; data belongs in JSON, not source.

### Good first contributions

- The six manual quickstart scenarios in
  `specs/002-hardware-library/quickstart.md` (dialog and canvas flows) need a
  human pass.
- `portFactory` doesn't generate `usb` ports, but the shipped Raspberry Pi
  Zero record carries one — a recorded, unclaimed question.
- Windows and macOS packaged-build verification (the compatibility discovery's
  test matrix has open cells).
- CI: the gates exist and nothing enforces them — a recorded open decision
  waiting for someone to care.

---

## Roadmap

The build order from `CONTEXT.md`, sequenced by dependency:

| # | Capability | Status |
|---|---|---|
| 1 | Hardware library | **Done** (PR #15) |
| 2 | Project files on disk — portable, shareable topologies | Next |
| 3 | Plane architecture — one appliance, five views | |
| 4 | Logical plane depth — routing, security policy | |
| 5 | Physical plane — geographic map → to-scale floorplan → rack (engine selected: MapLibre GL, PoC passed) | |
| 6 | Cloud plane — SDN, hybrid wiring | |
| 7 | Pre-built teaching topologies | |
| 8–9 | Naming generator; Terraform/Helm output | |
| 10–11 | RF plane (P25/DMR) and alarm plane | |
| 12–13 | GNS3/GNU Radio integration; appliance emulator | Deferred by intent |

RF and alarm planning sit late in the order because they depend on the
physical plane — not because they matter less. They are core to what this
application is.

## License

MIT
