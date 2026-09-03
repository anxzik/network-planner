# Feasibility Study

Subject: the Network Planner product vision as described in `CONTEXT.md`.

Placed under `discovery/` rather than the active feature directory because the
subject is the whole product, not the hardware library. Filing a product-scope
study inside a feature about a catalogue would misfile it.

## Goal

Determine whether the application described in `CONTEXT.md` can be built: a
desktop tool that plans networks across five planes (physical, logical, cloud,
RF, alarm), with a hardware library, pre-built teaching topologies, RF and
naming calculators, Infrastructure as Code output, and eventually an emulator
running appliance operating systems.

The decision this supports is whether to continue against the full thirteen-item
build order, or to commit to a reduced scope.

## Context

Facts established from the repository, not estimated:

| | |
|---|---|
| Contributors | 1 (`Anxzik`), across all 45 commits |
| History | 2026-01-07 to 2026-09-03 |
| Commit distribution | 10 across January, none for seven months, 10 on 30 August, 17 on 2 September, 8 on 3 September |
| Application code | 12,261 lines, excluding tests |
| Tests | 260, across 11 files, all covering `src/utils/` |
| Renderer typing | 30 JSX files, 3 TypeScript files |
| Continuous integration | None |
| Build order | 13 capabilities |
| Capabilities complete | Part of one (the logical plane: devices, ports, VLANs, subnet calculation) |

Of the 25 commits across the last two days, exactly one changed anything under
`src/`, and that one added tests to existing modules rather than new capability.
The rest produced specifications, decision records, wireframes, a wiki and
extension configuration. The first item in the build order is fully specified and
not started.

## Constraints

Stated or evidenced:

- One person builds this. No second contributor appears in eight months of history.
- Work is intermittent. A seven-month gap sits between January and August.
- Desktop application, no server, no accounts (ADR 0002, ADR 0008).
- The renderer is untyped JSX; only the Electron process files are TypeScript.
- Nothing enforces the quality gates, because no continuous integration exists.

## Assumptions

Labelled as assumptions because the repository cannot establish them:

- Available capacity going forward is unknown. The commit history evidences
  intermittent solo work, but a person can change how much time they give a
  project, and intent is not visible in a git log.
- No budget for licensed components, third-party map imagery, or vendor
  operating system images is assumed, because none is mentioned anywhere.
- The RF planning intended is engineering-grade (coverage, propagation,
  channel planning for P25 and DMR), not diagrammatic. `CONTEXT.md` says
  "RF Mode Logical Planning" and names digital encoding and multiple channels,
  which reads as the former.

## Existing Evidence

**Supporting feasibility:**

- The domain knowledge is real and unusually specific. The existing catalogue
  distinguishes fifteen connectable port kinds including SFP28, QSFP-DD and
  SFP56, plus module slots which are deliberately excluded from generation, applies
  vendor-correct interface naming for Cisco, Ubiquiti and Dell, and the vision
  names P25, DMR and trunked digital encoding correctly. This is not a generic
  diagramming tool with networking words attached.
- The existing code is well-structured for extension. Domain logic sits in pure
  modules with 260 tests, dependencies point one direction, and the recent
  refactors moved logic out of components deliberately. A codebase in this shape
  absorbs new capability more cheaply than most.
- Items 1 through 4, 7 and 8 of the build order are ordinary application work
  within the demonstrated skill set: a catalogue, file persistence, an object
  model, deeper VLAN and routing configuration, preset topologies, and a naming
  generator.
- The planning apparatus built today is real. Thirteen decision records, a
  specification carried through five validation rounds, a task breakdown and a
  wiki. Knowing what to build is a common failure mode and it is not this
  project's.

**Working against feasibility:**

- Velocity. Forty-five commits in eight months, with a seven-month gap, against
  thirteen capabilities of which roughly a fifth of one is complete.
- Three of the thirteen items are separate specialist domains rather than
  features. RF propagation and channel planning, an emulator running vendor
  operating systems, and Terraform and Helm generation from a topology are each
  the subject of existing standalone products.
- No continuous integration, so the quality gates the constitution defines are
  enforced only by the person who wrote them remembering to run them.

## Evidence Gaps

- **Intended capacity.** The single most decisive input, and the repository
  cannot supply it. Full-time solo effort and occasional-evening effort differ
  by roughly an order of magnitude and lead to different answers.
- **Whether the RF plane means engineering or diagramming.** Placing antenna
  symbols on a map is a modest feature. Modelling coverage and planning channels
  for a trunked digital system is a specialist product.
- **What the emulator is expected to run.** Vendor operating system images carry
  licensing restrictions that are a legal question before they are a technical
  one. GNS3 and EVE-NG solved the technical part and did not solve that.
- **Whether anyone else will contribute.** Nothing in eight months suggests so.
- **Whether a deadline exists.** No milestone, release plan, or date appears
  anywhere in the repository.

## Validation Needed

Ordered by how much decision risk each removes:

1. State the intended capacity in hours per week and over what horizon. Nothing
   else can be judged without it.
2. Decide whether the RF plane is engineering-grade or diagrammatic, and record
   it. This one answer moves item 10 between "a feature" and "a second product".
3. Establish what the emulator would run and under what licence, before any
   design work assumes it.
4. Measure how long the hardware library actually takes end to end. It is fully
   specified, so it is the cleanest available calibration of real throughput
   against a known scope. Every later estimate rests on that number.

## Risk Assessment

| Risk | Likelihood | Impact | Note |
|---|---|---|---|
| Scope exceeds capacity by a wide margin | High | High | Thirteen capabilities, one intermittent contributor, one fifth of one done |
| RF plane is a product, not a feature | Medium | High | Depends entirely on the engineering-versus-diagram question |
| Emulator blocked by licensing rather than engineering | Medium | High | Vendor images are the obstacle, and it is legal |
| Specification outpaces implementation | High | Medium | 25 commits over two days, one touching `src/`, and that one only added tests |
| Quality gates decay without enforcement | Medium | Medium | No continuous integration; constitution names three gates |
| Effort spread thin across planes, none finished | Medium | High | Five planes each partly done is worse than two finished |

## Open Questions

- How many hours per week, over what horizon, is this expected to receive?
- Is the RF plane engineering-grade coverage and channel planning, or symbol
  placement with annotations?
- Which appliance operating systems would the emulator run, and under what
  licence?
- Is there a date, a demonstration, or an audience this has to be ready for?
- Would a narrower product, planning networks well across two planes, satisfy
  the actual need better than five planes each partly built?

## Recommendation

Continue, against a reduced committed scope rather than the full thirteen items.

The vision is coherent and the domain knowledge behind it is genuine, which is
the part that cannot be acquired quickly. The structural risk is not that the
work is impossible; it is that thirteen capabilities against one intermittent
contributor produces five partly-built planes and no finished product.

A defensible committed core is items 1 through 4 plus 7: the hardware library,
project files, the plane architecture, real depth in the logical plane, and
preset topologies. That is a complete, useful network planning tool that nothing
else in the vision is required to make coherent.

Items 5 and 6, the physical and cloud planes, follow once the core is finished
and their cost is understood from real throughput rather than estimate.

Items 10, 11 and 13, the RF plane, alarm plane and emulator, should be held as
explicitly intended but uncommitted until the RF scope question is answered and
the emulator's licensing position is established. They are what make this
product distinctive, which is exactly why committing to them before their cost
is known is the expensive mistake.

Measure the hardware library end to end before committing to anything past item
4. It is fully specified, so it is the one clean calibration available.

Recommended follow-up discovery, in order:

- `/speckit.discovery.decision` on the RF plane scope question, which is the
  single largest unresolved variable in this study.
- `/speckit.discovery.feasibility` on the emulator specifically, once its
  licensing position is understood.
- `/speckit.discovery.techselect` on the access control mechanism already
  blocking FR-029 and FR-030, which is unrelated to this decision but open.

## Decision

`feasible-with-risks`

Feasible as a reduced product built around the logical and physical planes.
Not demonstrated as feasible at thirteen capabilities under the capacity the
repository evidences, and that gap is a scope decision rather than a technical
obstacle.
