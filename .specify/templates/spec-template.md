# Feature Specification: [FEATURE NAME]

**Feature Branch**: `[###-feature-name]`

**Created**: [DATE]

**Status**: Draft

**Input**: User description: "$ARGUMENTS"

## User Scenarios & Testing *(mandatory)*

<!--
  IMPORTANT: User stories should be PRIORITIZED as user journeys ordered by importance.
  Each user story/journey must be INDEPENDENTLY TESTABLE - meaning if you implement just ONE of them,
  you should still have a viable MVP (Minimum Viable Product) that delivers value.

  Assign priorities (P1, P2, P3, etc.) to each story, where P1 is the most critical.
  Think of each story as a standalone slice of functionality that can be:
  - Developed independently
  - Tested independently
  - Deployed independently
  - Demonstrated to users independently
-->

### User Story 1 - [Brief Title] (Priority: P1)

[Describe this user journey in plain language]

**Why this priority**: [Explain the value and why it has this priority level]

**Independent Test**: [Describe how this can be tested independently - e.g., "Can be fully tested by [specific action] and delivers [specific value]"]

**Acceptance Scenarios**:

1. **Given** [initial state], **When** [action], **Then** [expected outcome]
2. **Given** [initial state], **When** [action], **Then** [expected outcome]

---

### User Story 2 - [Brief Title] (Priority: P2)

[Describe this user journey in plain language]

**Why this priority**: [Explain the value and why it has this priority level]

**Independent Test**: [Describe how this can be tested independently]

**Acceptance Scenarios**:

1. **Given** [initial state], **When** [action], **Then** [expected outcome]

---

### User Story 3 - [Brief Title] (Priority: P3)

[Describe this user journey in plain language]

**Why this priority**: [Explain the value and why it has this priority level]

**Independent Test**: [Describe how this can be tested independently]

**Acceptance Scenarios**:

1. **Given** [initial state], **When** [action], **Then** [expected outcome]

---

[Add more user stories as needed, each with an assigned priority]

### Edge Cases

<!--
  ACTION REQUIRED: The content in this section represents placeholders.
  Fill them out with the right edge cases.
-->

- What happens when [boundary condition]?
- How does system handle [error scenario]?

## Requirements *(mandatory)*

<!--
  ACTION REQUIRED: The content in this section represents placeholders.
  Fill them out with the right functional requirements.
-->

### Functional Requirements

- **FR-001**: System MUST [specific capability, e.g., "allow users to create accounts"]
- **FR-002**: System MUST [specific capability, e.g., "validate email addresses"]
- **FR-003**: Users MUST be able to [key interaction, e.g., "reset their password"]
- **FR-004**: System MUST [data requirement, e.g., "persist user preferences"]
- **FR-005**: System MUST [behavior, e.g., "log all security events"]

*Example of marking unclear requirements:*

- **FR-006**: System MUST authenticate users via [NEEDS CLARIFICATION: auth method not specified - email/password, SSO, OAuth?]
- **FR-007**: System MUST retain user data for [NEEDS CLARIFICATION: retention period not specified]

### Key Entities *(include if feature involves data)*

- **[Entity 1]**: [What it represents, key attributes without implementation]
- **[Entity 2]**: [What it represents, relationships to other entities]

## Process Boundary *(include if the feature crosses main/renderer)*

<!--
  network-planner is a three-process Electron app. Most features live entirely
  in the renderer. If this one does not, say so explicitly here — and if it
  does, write "Renderer-only" and move on.
-->

- **Scope**: [Renderer-only | Requires main-process work | Requires preload bridge change]
- **Node/OS capability needed**: [e.g. reading a file from disk, native dialog, or None]
- **Bridge surface**: [If preload changes: what is exposed, and why it cannot stay
  in the renderer. Renderer code must never import from `main.ts` or call Node APIs
  directly.]

## Persistence *(include if the feature holds state)*

<!--
  There is no database. State persists to localStorage through
  `src/utils/storage.js` and `src/hooks/usePersist.js`, under the single
  namespace key `networkPlanner`.

  `storage.js` stamps a `__version` field (`SCHEMA_VERSION = 1`) on every write,
  but nothing ever reads it to branch on. The seam for migration exists; the
  migration logic does not. If this feature changes the shape of stored data,
  that gap becomes yours to close.
-->

- **What persists**: [Which entities survive an app restart, if any]
- **Where**: [Key under the `networkPlanner` namespace, or "Session only — not persisted"]
- **Shape change**: [Does this alter the structure of anything already stored?
  If no, say so. If yes, continue below.]
- **Migration**: [How is data written by an earlier version handled? Users have
  existing topologies saved locally, and a failed read is silent *to the user* —
  `getRoot()` logs to the console and returns an empty root, after which the next
  write overwrites what could not be parsed. Bumping
  `SCHEMA_VERSION` without a read path does not migrate anything.]

## Testability *(mandatory)*

<!--
  Per Constitution Principle I: logic goes in `src/utils/` and is unit-tested;
  components stay thin and are not tested. Vitest runs with environment 'node'
  — there is no DOM.
-->

- **Logic to extract**: [Which parts of this feature are pure functions that
  belong in `src/utils/` with a co-located `*.test.js`]
- **Left in the component**: [What stays as UI wiring, and why it carries no
  logic worth testing]
- **Manual verification**: [What must be checked by running `npm start`, since
  it cannot be covered by a node-environment test]

## Success Criteria *(mandatory)*

<!--
  ACTION REQUIRED: Define measurable success criteria.
  These must be technology-agnostic and measurable.
-->

### Measurable Outcomes

- **SC-001**: [Measurable metric, e.g., "Users can complete account creation in under 2 minutes"]
- **SC-002**: [Measurable metric, e.g., "System handles 1000 concurrent users without degradation"]
- **SC-003**: [User satisfaction metric, e.g., "90% of users successfully complete primary task on first attempt"]
- **SC-004**: [Business metric, e.g., "Reduce support tickets related to [X] by 50%"]

## Assumptions

<!--
  ACTION REQUIRED: The content in this section represents placeholders.
  Fill them out with the right assumptions based on reasonable defaults
  chosen when the feature description did not specify certain details.
-->

- [Assumption about target users, e.g., "Users have stable internet connectivity"]
- [Assumption about scope boundaries, e.g., "Mobile support is out of scope for v1"]
- [Assumption about data/environment, e.g., "Existing authentication system will be reused"]
- [Dependency on existing system/service, e.g., "Requires access to the existing user profile API"]
