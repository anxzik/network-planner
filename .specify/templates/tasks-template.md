---

description: "Task list template for feature implementation"
---

# Tasks: [FEATURE NAME]

**Input**: Design documents from `/specs/[###-feature-name]/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: The examples below include test tasks. Tests are OPTIONAL - only include them if explicitly requested in the feature specification.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Pure logic + tests**: `src/utils/<name>.js` with co-located `src/utils/<name>.test.js`
- **Hooks**: `src/hooks/use<Name>.js` (camelCase)
- **Shared state**: `src/context/<Name>Context.jsx`
- **UI**: `src/components/<Feature>/<Component>.jsx` (PascalCase dir + file)
- **Static data**: `src/data/`
- **Electron processes**: `src/main.ts`, `src/preload.ts` (TypeScript)

Per Constitution Principle I, logic goes in `src/utils/` with a test; components
stay thin. A task that puts branching logic inside a `.jsx` file is a smell.

<!--
  ============================================================================
  IMPORTANT: The tasks below are SAMPLE TASKS for illustration purposes only.

  The /speckit-tasks command MUST replace these with actual tasks based on:
  - User stories from spec.md (with their priorities P1, P2, P3...)
  - Feature requirements from plan.md
  - Entities from data-model.md
  - Endpoints from contracts/

  Tasks MUST be organized by user story so each story can be:
  - Implemented independently
  - Tested independently
  - Delivered as an MVP increment

  DO NOT keep these sample tasks in the generated tasks.md file.
  ============================================================================
-->

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [ ] T001 Confirm `npm install` is current and `npm start` launches the app
- [ ] T002 Add any new dependencies to `package.json` (renderer deps go in
      `dependencies`, tooling in `devDependencies`)
- [ ] T003 [P] Verify baseline is green: `npm run lint && npm test && npm run typecheck`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

Examples of foundational tasks (adjust based on your project):

- [ ] T004 Setup database schema and migrations framework
- [ ] T005 [P] Implement authentication/authorization framework
- [ ] T006 [P] Setup API routing and middleware structure
- [ ] T007 Create base models/entities that all stories depend on
- [ ] T008 Configure error handling and logging infrastructure
- [ ] T009 Setup environment configuration management

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - [Title] (Priority: P1) 🎯 MVP

**Goal**: [Brief description of what this story delivers]

**Independent Test**: [How to verify this story works on its own]

### Tests for User Story 1 (OPTIONAL - only if tests requested) ⚠️

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T010 [P] [US1] Unit test for [logic module] in src/utils/[name].test.js
- [ ] T011 [P] [US1] Unit test for [factory/validator] in src/utils/[name].test.js

> Note: Vitest runs with `environment: 'node'` — there is no DOM. Test pure
> modules in `src/utils/`, not React components.

### Implementation for User Story 1

- [ ] T012 [P] [US1] Implement [logic] in src/utils/[name].js (pure, no React imports)
- [ ] T013 [P] [US1] Implement [factory] in src/utils/[name]Factory.js
- [ ] T014 [US1] Wire state transitions into src/context/[Name]Context.jsx (depends on T012, T013)
- [ ] T015 [US1] Build [Component] in src/components/[Feature]/[Component].jsx
- [ ] T016 [US1] Add input validation in src/utils/ (not in the component)
- [ ] T017 [US1] Persist via src/hooks/usePersist.js if the feature holds state

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - [Title] (Priority: P2)

**Goal**: [Brief description of what this story delivers]

**Independent Test**: [How to verify this story works on its own]

### Tests for User Story 2 (OPTIONAL - only if tests requested) ⚠️

- [ ] T018 [P] [US2] Unit test for [logic module] in src/utils/[name].test.js
- [ ] T019 [P] [US2] Unit test for [factory/validator] in src/utils/[name]Factory.test.js

### Implementation for User Story 2

- [ ] T020 [P] [US2] Implement [logic] in src/utils/[name].js (pure, no React imports)
- [ ] T021 [P] [US2] Implement [factory] in src/utils/[name]Factory.js
- [ ] T022 [US2] Wire state transitions into src/context/[Name]Context.jsx (depends on T020, T021)
- [ ] T023 [US2] Build [Component] in src/components/[Feature]/[Component].jsx
- [ ] T024 [US2] Integrate with User Story 1 components (if needed)

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - [Title] (Priority: P3)

**Goal**: [Brief description of what this story delivers]

**Independent Test**: [How to verify this story works on its own]

### Tests for User Story 3 (OPTIONAL - only if tests requested) ⚠️

- [ ] T025 [P] [US3] Unit test for [logic module] in src/utils/[name].test.js
- [ ] T026 [P] [US3] Unit test for [factory/validator] in src/utils/[name]Factory.test.js

### Implementation for User Story 3

- [ ] T027 [P] [US3] Implement [logic] in src/utils/[name].js (pure, no React imports)
- [ ] T028 [US3] Wire state transitions into src/context/[Name]Context.jsx (depends on T027)
- [ ] T029 [US3] Build [Component] in src/components/[Feature]/[Component].jsx

**Checkpoint**: All user stories should now be independently functional

---

[Add more user story phases as needed, following the same pattern]

---

## Phase N: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] TXXX [P] Documentation updates in docs/
- [ ] TXXX Extract any logic that accumulated in components back into src/utils/
- [ ] TXXX [P] Additional unit tests in src/utils/*.test.js
- [ ] TXXX Run `npm run lint` — must pass
- [ ] TXXX Run `npm test` — must pass
- [ ] TXXX Run `npm run typecheck` — must pass
- [ ] TXXX Verify in the packaged app: `npm start`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - User stories can then proceed in parallel (if staffed)
  - Or sequentially in priority order (P1 → P2 → P3)
- **Polish (Final Phase)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P2)**: Can start after Foundational (Phase 2) - May integrate with US1 but should be independently testable
- **User Story 3 (P3)**: Can start after Foundational (Phase 2) - May integrate with US1/US2 but should be independently testable

### Within Each User Story

- Tests (if included) MUST be written and FAIL before implementation
- Models before services
- Services before endpoints
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, all user stories can start in parallel (if team capacity allows)
- All tests for a user story marked [P] can run in parallel
- Models within a story marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together (if tests requested):
Task: "Unit test for [logic module] in src/utils/[name].test.js"
Task: "Unit test for [factory/validator] in src/utils/[name]Factory.test.js"

# Launch independent utils modules together (no shared files):
Task: "Implement [logic] in src/utils/[name].js"
Task: "Implement [factory] in src/utils/[name]Factory.js"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: Test User Story 1 independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1
   - Developer B: User Story 2
   - Developer C: User Story 3
3. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
