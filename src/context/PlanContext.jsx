// Which plan is open, whether it has unsaved changes, and the route to the
// plan handlers in the main process. Holds state and calls the bridge;
// decisions about plan data belong in src/utils/, and the bridge itself is
// defined in specs/003-project-files/contracts/plans-bridge.md.
import {createContext, useCallback, useContext, useEffect, useMemo, useRef, useState} from 'react';
import {planSnapshot} from '../utils/planFile';
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

  const plans = () => window.networkPlanner?.plans;

  // The current canvas as a document. Recomputed only when the canvas actually
  // changes, since both seams are memoised on their own state.
  const planDocument = useMemo(
    () => ({
      ...network.serialiseToDocument(),
      scratchpad: scratchpad.serialiseToDocument(),
    }),
    [network, scratchpad],
  );

  // Dirty is *derived*, never synchronised. A flag kept in step by an effect
  // drifts the moment a path forgets to set it, and this repo has already
  // removed one such effect (commit 9966aef). Comparing against the document as
  // last written is a fact about the two values, not a state machine.
  const [savedSnapshot, setSavedSnapshot] = useState(() => planSnapshot());
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
    markClean(planSnapshot({ ...value.document, scratchpad: value.document.scratchpad }));
  }, [network, scratchpad, markClean]);

  const refreshRecents = useCallback(async () => {
    const bridge = plans();
    if (!bridge) return;
    const result = await bridge.listRecents();
    if (result.ok) setRecents(result.value.recents);
  }, []);

  const openRecent = useCallback(async (id) => {
    const bridge = plans();
    if (!bridge) return { ok: false, error: { code: 'UNAVAILABLE', message: 'No bridge.' } };
    const result = await bridge.openRecent(id);
    if (result.ok) {
      applyOpened(result.value);
      await refreshRecents();
    }
    return result;
  }, [applyOpened, refreshRecents]);

  const removeRecent = useCallback(async (id) => {
    const bridge = plans();
    if (!bridge) return;
    await bridge.removeRecent(id);
    await refreshRecents();
  }, [refreshRecents]);

  // FR-006a: a discard sets work aside rather than destroying it, so the
  // recovery slot is written *before* the canvas is cleared.
  const discardInto = useCallback(async () => {
    const bridge = plans();
    if (bridge) await bridge.saveRecovery({ document: planDocument, reason: 'discarded' });
  }, [planDocument]);

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
    name, dirty, readOnly, source, notice, recents, recovery, available,
    document: planDocument,
    openRecent, removeRecent, refreshRecents,
    discardInto, restoreRecovery, declineRecovery,
    markClean, applyOpened,
    clearNotice: () => setNotice(null),
  }), [
    name, dirty, readOnly, source, notice, recents, recovery, available, planDocument,
    openRecent, removeRecent, refreshRecents, discardInto, restoreRecovery,
    declineRecovery, markClean, applyOpened,
  ]);

  return <PlanContext.Provider value={value}>{children}</PlanContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function usePlan() {
  const context = useContext(PlanContext);
  if (!context) throw new Error('usePlan must be used within a PlanProvider');
  return context;
}
