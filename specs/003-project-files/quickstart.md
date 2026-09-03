# Quickstart: Project Files

## Gates
`npm run lint && npm test && npm run typecheck` — green before and after.

## Scenarios

1. **Save/reopen round trip** (US1): build a topology, Save as `test.netplan`,
   quit, reopen via recents — identical canvas, title shows name, no dirty mark.
2. **Unsaved-changes guard** (FR-006): modify, then File > New — prompt appears;
   Cancel loses nothing.
3. **Migration** (US2): with a pre-feature localStorage topology, first start
   offers migration; accept → named file opens; old storage still present,
   marked.
4. **Salvage** (FR-012): corrupt the storage root, first start → salvage
   preview, accept or decline; raw content untouched either way.
5. **Travels complete** (US3): plan placing a local-only type; delete the type
   from the catalogue; reopen plan — renders fully from recorded definitions.
6. **Divergence offer** (FR-016/017): edit a placed type in the library, reopen
   plan — which-is-shown clear, offer once; decline, reopen — not re-asked.
7. **Broad apply** (FR-018): after a correction, run apply-to-recents — list
   shows reachable and unreachable; apply to a subset; verify only those changed
   and each has an original copied aside.
8. **Older format** (FR-020): hand-edit a file's formatVersion to a lower
   supported one, open — upgraded, original kept beside it.
9. **Newer format** (FR-021): set formatVersion 99.0, open — read-only with
   notice; Save disabled and refused; Save As produces an editable current-format
   copy with the warned caveat.
10. **Failed save** (FR-008): make the target read-only at the OS level, Save —
    previous content intact, partial preserved beside, message names it.
11. **Crash recovery** (FR-009): modify, kill the app, restart — restore offer.
12. **Two instances** (R6): open the same file twice — second is read-only with
    notice.

Automatable now: 5–9 core logic via unit tests; 1, 10, 11 partially. Manual:
dialogs throughout, 12.
