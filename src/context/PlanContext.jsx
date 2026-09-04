// Which plan is open, whether it has unsaved changes, and the route to the
// plan handlers in the main process. Holds state and calls the bridge;
// decisions about plan data belong in src/utils/, and the bridge itself is
// defined in specs/003-project-files/contracts/plans-bridge.md.
import {createContext, useCallback, useContext, useEffect, useMemo, useRef, useState} from 'react';
import {emptyPlanDocument, planSnapshot} from '../utils/planFile';
import {applyUpdate as applyUpdateToDocument, declineUpdate} from '../utils/planDivergence';
import {MARKER_STORAGE_KEY, STORAGE_KEY} from '../utils/storageSalvage';
import {useNetwork} from './NetworkContext';
import {useScratchpad} from './ScratchpadContext';

const PlanContext = createContext(null);

// Knowable synchronously, so it is the initial state rather than something an
// effect discovers (tests and a plain browser have no bridge).
const bridgeAvailable = () => Boolean(window.networkPlanner?.plans);

// How often unsaved work is copied to the recovery slot. Long enough that
// typing does not cause a write per keystroke, short enough that a crash costs
// seconds of work rather than an afternoon.
const RECOVERY_INTERVAL_MS = 5000;

export function PlanProvider({ children }) {
  const network = useNetwork();
  const scratchpad = useScratchpad();

  // 'untitled' until a plan has a file behind it.
  const [source, setSource] = useState('untitled');
  const [name, setName] = useState('Untitled plan');
  const [readOnly, setReadOnly] = useState(false);
  const [notice, setNotice] = useState(null);
  const [recents, setRecents] = useState([]);
  const [recovery, setRecovery] = useState(null);
  const [available] = useState(bridgeAvailable);
  // What the old browser storage turned out to hold, once asked (US2).
  const [migration, setMigration] = useState(null);
  // Declines travel in the plan file (research R2), so they live beside the
  // canvas rather than in the application's own storage.
  const [declinedOffers, setDeclinedOffers] = useState({});
  const [divergences, setDivergences] = useState([]);

  const plans = () => window.networkPlanner?.plans;

  // The current canvas as a document. Recomputed only when the canvas actually
  // changes, since both seams are memoised on their own state.
  const planDocument = useMemo(
    () => ({
      ...network.serialiseToDocument(),
      scratchpad: scratchpad.serialiseToDocument(),
      declinedOffers,
    }),
    [network, scratchpad, declinedOffers],
  );

  // Dirty is *derived*, never synchronised. A flag kept in step by an effect
  // drifts the moment a path forgets to set it, and this repo has already
  // removed one such effect (commit 9966aef). Comparing against the document as
  // last written is a fact about the two values, not a state machine.
  // The baseline is the canvas as it stood on the first render, not an empty
  // document. NetworkContext seeds a default VLAN, so measuring against empty
  // would make a freshly started application report unsaved changes it does not
  // have — and stand a save prompt in front of the first New or Open.
  const [savedSnapshot, setSavedSnapshot] = useState(() => planSnapshot({
    ...network.serialiseToDocument(),
    scratchpad: scratchpad.serialiseToDocument(),
  }));
  const currentSnapshot = useMemo(() => planSnapshot(planDocument), [planDocument]);
  const dirty = currentSnapshot !== savedSnapshot;

  // Marks the canvas as matching what is on disk. Called after a save, an open,
  // or a new plan — the three moments where the two genuinely agree.
  const markClean = useCallback((snapshot) => {
    setSavedSnapshot(snapshot ?? planSnapshot());
  }, []);

  const applyOpened = useCallback((value) => {
    network.loadFromDocument(value.document);
    scratchpad.loadFromDocument(value.document.scratchpad);
    setName(value.name);
    setReadOnly(Boolean(value.readOnly));
    setNotice(value.notice ?? null);
    setSource('file');
    setDeclinedOffers(value.document.declinedOffers ?? {});
    markClean(planSnapshot({ ...value.document, scratchpad: value.document.scratchpad }));
  }, [network, scratchpad, markClean]);

  // The pending action a save-prompt is standing in front of (FR-006). Null
  // when nothing is waiting; otherwise the thing to do once the person answers.
  const [pending, setPending] = useState(null);

  const refreshRecents = useCallback(async () => {
    const bridge = plans();
    if (!bridge) return;
    const result = await bridge.listRecents();
    if (result.ok) setRecents(result.value.recents);
  }, []);

  const applySaved = useCallback((value) => {
    setName(value.name);
    setSource('file');
    setReadOnly(false);
    markClean(currentSnapshot);
  }, [markClean, currentSnapshot]);

  const save = useCallback(async () => {
    const bridge = plans();
    if (!bridge) return { ok: false, error: { code: 'UNAVAILABLE', message: 'No bridge.' } };
    const result = await bridge.save(planDocument);
    if (result.ok) applySaved(result.value);
    return result;
  }, [planDocument, applySaved]);

  const saveAs = useCallback(async () => {
    const bridge = plans();
    if (!bridge) return { ok: false, error: { code: 'UNAVAILABLE', message: 'No bridge.' } };
    const result = await bridge.saveAs(planDocument);
    if (result.ok) applySaved(result.value);
    return result;
  }, [planDocument, applySaved]);

  const openDialog = useCallback(async () => {
    const bridge = plans();
    if (!bridge) return { ok: false, error: { code: 'UNAVAILABLE', message: 'No bridge.' } };
    const result = await bridge.open();
    if (result.ok) {
      applyOpened(result.value);
      await refreshRecents();
      await bridge.divergences(result.value.document).then((d) => {
        if (d.ok) setDivergences(d.value.divergences);
      });
    }
    return result;
  }, [applyOpened, refreshRecents]);

  const newPlan = useCallback(async () => {
    const bridge = plans();
    network.loadFromDocument(emptyPlanDocument());
    scratchpad.loadFromDocument({});
    setName('Untitled plan');
    setSource('untitled');
    setReadOnly(false);
    setNotice(null);
    markClean(planSnapshot());
    if (bridge) await bridge.newPlan();
    return { ok: true };
  }, [network, scratchpad, markClean]);


  const openRecent = useCallback(async (id) => {
    const bridge = plans();
    if (!bridge) return { ok: false, error: { code: 'UNAVAILABLE', message: 'No bridge.' } };
    const result = await bridge.openRecent(id);
    if (result.ok) {
      applyOpened(result.value);
      await refreshRecents();
      await bridge.divergences(result.value.document).then((d) => {
        if (d.ok) setDivergences(d.value.divergences);
      });
    }
    return result;
  }, [applyOpened, refreshRecents]);

  const removeRecent = useCallback(async (id) => {
    const bridge = plans();
    if (!bridge) return;
    await bridge.removeRecent(id);
    await refreshRecents();
  }, [refreshRecents]);

  // Which recorded definitions the catalogue now disagrees with, and what to do
  // about each. The divergence maths is pure and identical on both sides of the
  // bridge (planDivergence.js); this is only the asking and the applying.
  const checkDivergences = useCallback(async () => {
    const bridge = plans();
    if (!bridge) return [];
    const result = await bridge.divergences(planDocument);
    if (!result.ok) return [];
    setDivergences(result.value.divergences);
    return result.value.divergences;
  }, [planDocument]);

  // Accepting replaces the plan's copy and the placed nodes that render from
  // it, then clears any decline: the question has been answered the other way.
  const acceptUpdate = useCallback((typeId, current) => {
    const updated = applyUpdateToDocument(planDocument, typeId, current);
    network.loadFromDocument(updated);
    setDeclinedOffers(updated.declinedOffers ?? {});
    setDivergences((rest) => rest.filter((d) => d.typeId !== typeId));
  }, [planDocument, network]);

  // Declining changes nothing about the plan and is remembered against the
  // version refused, so a later, genuinely different correction still asks.
  const declineOffer = useCallback((typeId, current) => {
    const declined = declineUpdate(planDocument, typeId, current);
    setDeclinedOffers(declined.declinedOffers);
    setDivergences((rest) => rest.filter((d) => d.typeId !== typeId));
  }, [planDocument]);

  // Anything that would replace the canvas asks first when there is unsaved
  // work (FR-006). Clean canvases go straight through: a prompt that appears
  // when there is nothing to lose teaches people to dismiss prompts.
  const guard = useCallback((action) => {
    if (!dirty) return action();
    setPending(() => action);
    return Promise.resolve({ ok: true, pending: true });
  }, [dirty]);

  // FR-006a: a discard sets work aside rather than destroying it, so the
  // recovery slot is written *before* the canvas is cleared.
  const discardInto = useCallback(async () => {
    const bridge = plans();
    if (bridge) await bridge.saveRecovery({ document: planDocument, reason: 'discarded' });
  }, [planDocument]);

  // The three outcomes of the prompt, and nothing else. Escape resolves to
  // 'discard' at the component; there is no fourth answer here to reach.
  const resolvePending = useCallback(async (answer) => {
    const action = pending;
    setPending(null);
    if (!action) return;
    if (answer === 'cancel') return;
    if (answer === 'save') {
      const result = await save();
      // A save that failed or was cancelled must not go on to replace the
      // canvas: the person asked to keep this work first.
      if (!result.ok) return;
    }
    if (answer === 'discard') await discardInto();
    await action();
  }, [pending, save, discardInto]);

  const restoreRecovery = useCallback(() => {
    if (!recovery) return;
    network.loadFromDocument(recovery.document);
    scratchpad.loadFromDocument(recovery.document.scratchpad);
    setName(recovery.name ?? 'Recovered plan');
    setSource(recovery.name ? 'file' : 'untitled');
    setRecovery(null);
  }, [recovery, network, scratchpad]);

  // Declining is the only thing that clears the slot (FR-006a); a discard never
  // does, which is what makes the fast gesture safe.
  const declineRecovery = useCallback(async () => {
    const bridge = plans();
    if (bridge) await bridge.clearRecovery();
    setRecovery(null);
  }, []);

  // Reading the old storage is the renderer's job: localStorage is only
  // reachable from here (R4). The raw string is what crosses — not the parsed
  // root — so main can tell damaged storage from empty storage, which the
  // ordinary read path cannot.
  const readOldStorage = useCallback(() => {
    try {
      return {
        raw: window.localStorage.getItem(STORAGE_KEY),
        marker: window.localStorage.getItem(MARKER_STORAGE_KEY),
      };
    } catch {
      // Storage can be unavailable entirely (private mode, blocked cookies).
      // That is not a migration to offer; it is nothing to say.
      return { raw: null, marker: null };
    }
  }, []);

  const migrate = useCallback(async () => {
    const bridge = plans();
    if (!bridge) return { ok: false, error: { code: 'UNAVAILABLE', message: 'No bridge.' } };
    const result = await bridge.migrate(readOldStorage());
    if (!result.ok) return result;

    network.loadFromDocument(result.value.document);
    scratchpad.loadFromDocument(result.value.document.scratchpad);
    setName(result.value.name);
    setSource('file');
    setReadOnly(false);
    markClean(planSnapshot(result.value.document));

    // Main's instruction, carried out here because only the renderer can. It
    // writes a sibling key and never rewrites the old root, so what was
    // migrated from stays exactly as it was (FR-011, FR-012).
    try {
      window.localStorage.setItem(
        result.value.marker.key,
        JSON.stringify(result.value.marker.value),
      );
    } catch { /* an unwritable marker costs a repeat offer, not any data */ }

    setMigration(null);
    await refreshRecents();
    return result;
  }, [readOldStorage, network, scratchpad, markClean, refreshRecents]);

  // Declining changes nothing at all, so the offer returns next start. A person
  // who is not ready has not said no forever.
  const dismissMigration = useCallback(() => setMigration(null), []);

  // One fetch on mount: what was left behind last time, and where plans are.
  useEffect(() => {
    const bridge = window.networkPlanner?.plans;
    if (!bridge) return;
    let cancelled = false;
    bridge.recoverySlot().then((result) => {
      if (!cancelled && result.ok && result.value) setRecovery(result.value);
    });
    bridge.listRecents().then((result) => {
      if (!cancelled && result.ok) setRecents(result.value.recents);
    });
    let stored = { raw: null, marker: null };
    try {
      stored = {
        raw: window.localStorage.getItem(STORAGE_KEY),
        marker: window.localStorage.getItem(MARKER_STORAGE_KEY),
      };
    } catch { /* no storage to ask about */ }
    bridge.checkOldStorage(stored).then((result) => {
      if (cancelled || !result.ok) return;
      // 'none' and 'migrated' are silence: a person with nothing to move must
      // never learn that migration exists (FR-013, SC-007).
      if (result.value.offer === 'none' || result.value.offer === 'migrated') return;
      setMigration(result.value);
    });
    return () => { cancelled = true; };
  }, []);

  // Continuous crash protection (FR-009), paired with deliberate saving. The
  // latest document is read from a ref so the timer is established once rather
  // than torn down and rebuilt on every keystroke.
  const documentRef = useRef(planDocument);
  const dirtyRef = useRef(dirty);
  useEffect(() => { documentRef.current = planDocument; }, [planDocument]);
  useEffect(() => { dirtyRef.current = dirty; }, [dirty]);

  useEffect(() => {
    const bridge = window.networkPlanner?.plans;
    if (!bridge) return undefined;
    const timer = setInterval(() => {
      if (dirtyRef.current) {
        void bridge.saveRecovery({ document: documentRef.current, reason: 'crash' });
      }
    }, RECOVERY_INTERVAL_MS);
    return () => clearInterval(timer);
  }, []);

  const value = useMemo(() => ({
    name, dirty, readOnly, source, notice, recents, recovery, available, pending,
    migration, migrate, dismissMigration,
    divergences, checkDivergences, acceptUpdate, declineOffer,
    document: planDocument,
    save, saveAs, openDialog, newPlan,
    openRecent, removeRecent, refreshRecents,
    guard, resolvePending,
    restoreRecovery, declineRecovery,
    markClean, applyOpened,
    clearNotice: () => setNotice(null),
  }), [
    name, dirty, readOnly, source, notice, recents, recovery, available, pending,
    migration, migrate, dismissMigration,
    divergences, checkDivergences, acceptUpdate, declineOffer,
    planDocument, save, saveAs, openDialog, newPlan,
    openRecent, removeRecent, refreshRecents, guard, resolvePending,
    restoreRecovery, declineRecovery, markClean, applyOpened,
  ]);

  return <PlanContext.Provider value={value}>{children}</PlanContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function usePlan() {
  const context = useContext(PlanContext);
  if (!context) throw new Error('usePlan must be used within a PlanProvider');
  return context;
}
