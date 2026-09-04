# Network Planner — Domain Context

The document `CLAUDE.md` and `docs/agents/domain.md` refer to. It describes what
this application is for, the vocabulary it uses, and where its boundaries sit.
Decisions are recorded in `docs/adr/`; rules currently in force are in
`.specify/memory/constitution.md`.

## Purpose

Network Planner is a desktop application for building and testing complex
networks from the ground up. A person uses it to take a site — a building, a
campus, a region — and plan the network that will serve it: what hardware goes
where physically, how it is wired and configured logically, how it reaches into
cloud, how radio coverage works across it, and how life-safety systems run
alongside it.

It is a planning and design tool, not a monitoring or management tool. It does
not talk to live equipment.

## The five planes

A network is planned across five planes. The same site is seen differently in
each, and the planes are switched between rather than opened separately.

| Plane | What is planned there |
|---|---|
| **Physical** | Where appliances sit in the real world — position on a geographic map, then zoomed into a to-scale building floorplan, down to rack and rack unit |
| **Logical** | Wiring and L4–L8 processing: routing, switching, VLANs, security policy |
| **Cloud** | The hybrid environment — SDN and cloud networks, how they are wired within cloud modules and how they connect back to on-premises |
| **RF** | Antenna and transceiver placement, and RF logical planning for digital trunked systems such as P25 and DMR, where digital encoding and multiple channels exist |
| **Alarm** | Fire alarm and burglar alarm infrastructure, planned geographically alongside the network |

The application is not limited to Internet and intranet networking. RF and alarm
networks are first-class planes, not add-ons.

## Core concepts

**Appliance** — a piece of hardware in the plan. An appliance exists **once** and
carries data for each plane it participates in: a floorplan position, an
interface configuration, a cloud attachment, an antenna pattern. Switching
planes changes which facet is shown, not which object is selected. Deleting an
appliance removes it from every plane. See [ADR 0007](docs/adr/0007-single-object-many-planes.md).

**Symbol** — how an appliance is drawn. Industry-standard networking notation by
default, with user-supplied symbol sets importable.

**Connection** — a link between two units on the same plane. What a connection
means differs per plane: a cable run physically, a configured link logically, a
peering relationship in cloud, an RF path.

**Hardware library** — the catalogue of appliance types available to place, with
their port layouts, capabilities, and symbols. Editable, importable and
exportable, primarily as JSON, and extensible toward external systems.

**Topology** — a complete plan. Saved as a project file, importable and
exportable. Pre-built topologies (star, hub-and-spoke, and others) can be
dragged in fully preconfigured, for learning networking.

**Plane facet** — the per-plane data an appliance carries. An appliance may have
no facet on a plane it does not participate in.

## How it is used

Working on the canvas, a person can draw or insert symbols on the fly, edit and
remove what they have already placed, add appliances from the hardware library,
and connect units on the same plane. They can select one item or many and move,
edit or delete them together. Switching between physical, logical, cloud, RF and
alarm views is seamless — the plan is one thing seen five ways.

Progress saves. Defaults can be set. Topologies import and export.

## Beyond the canvas

**Hardware tab** — the whole library, with editing, import and export in several
formats, JSON foremost. Designed to extend toward other networking tooling —
GNU Radio, GNS3 and similar.

**Calculators** — RF planning calculations, and the existing subnet and IP work.

**Naming generator** — takes cloud naming conventions as input and produces URLs
and IP allocations with names attached, to speed cloud deployment.

**Infrastructure as Code** — configurations and topologies planned in the cloud
plane can be emitted as Terraform and Helm, so a plan becomes a deployment.

**Emulator** — running an appliance's native operating system so configurations
can be built and networks genuinely tested. Explicitly a later goal, not part of
current scope.

## Boundaries

Network Planner does **not**:

- monitor, manage, or configure live equipment — it plans, and emits artifacts
- require an account or a server; a plan lives in a file on the person's machine
- guarantee map imagery offline. Map tiles need network access; every other
  plane, including floorplans, works without it. See [ADR 0009](docs/adr/0009-map-data-source.md)

## Build order

Sequenced by what other work depends on, not by visibility.

| # | Capability | Why here |
|---|---|---|
| 1 | **Hardware library foundation** — the catalogue, JSON import/export, symbol handling | Every plane consumes it; nothing else is properly buildable first |
| 2 | **Project files on disk** — save, load, import, export a topology | Unblocks scale; supersedes the current storage approach ([ADR 0008](docs/adr/0008-project-files-on-disk.md)) |
| 3 | **Plane architecture** — the appliance object model and switching between planes | The structural decision the rest of the planes hang from |
| 4 | **Logical plane depth** — routing, switching, security policy, richer VLAN work | Extends what already works today |
| 5 | **Physical plane** — geographic map, floorplan zoom, rack placement | Largest new capability |
| 6 | **Cloud plane** — SDN, cloud networks, hybrid wiring | Prerequisite for IaC output |
| 7 | **Pre-built topologies** — drag in a preconfigured star or hub-and-spoke | Needs the library and project format settled |
| 8 | **Naming generator** — URL and IP generation from cloud conventions | Needs the cloud plane |
| 9 | **Infrastructure as Code** — Terraform and Helm generation | Needs the cloud plane complete |
| 10 | **RF plane** — antenna and transceiver placement, P25 and DMR planning | Independent of 4–9; can move earlier if priorities change |
| 11 | **Alarm plane** — fire and burglar alarm infrastructure | Independent; shares the physical plane |
| 12 | **External tooling** — GNU Radio, GNS3 and similar integration | Needs the library extensible and stable |
| 13 | **Emulator** — appliance native OS for config building and testing | Deferred by intent |

Items 10 and 11 are sequenced late because they depend on the physical plane,
not because they matter less. They are core to what this application is.
