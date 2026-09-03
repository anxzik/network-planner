// Catalogue state for the renderer. Reads through the preload bridge and holds
// what came back; decisions about the data belong in src/utils/, and the
// bridge itself is defined in specs/002-hardware-library/contracts/.
import {createContext, useCallback, useContext, useEffect, useMemo, useRef, useState} from 'react';
import {useNetwork} from './NetworkContext';

const LibraryContext = createContext(null);

// Whether the preload bridge exists is knowable synchronously, so it is the
// initial state rather than something an effect discovers (tests and a plain
// browser have no bridge).
const bridgeAvailable = () => Boolean(window.networkPlanner?.library);

export function LibraryProvider({ children }) {
  const [types, setTypes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [symbolSets, setSymbolSets] = useState([]);
  const [counts, setCounts] = useState({ byCategory: {}, local: 0 });
  const [filters, setFiltersState] = useState({});
  // 'loading' | 'ready' | 'error' | 'unavailable'
  const [status, setStatus] = useState(() => (bridgeAvailable() ? 'loading' : 'unavailable'));
  const [error, setError] = useState(null);

  const applyResult = useCallback((result) => {
    if (result.ok) {
      setTypes(result.value.types);
      setCategories(result.value.categories);
      setSymbolSets(result.value.symbolSets ?? []);
      setCounts(result.value.counts ?? { byCategory: {}, local: 0 });
      setError(null);
      setStatus('ready');
    } else {
      setError(result.error);
      setStatus('error');
    }
  }, []);

  // The only topology that exists today lives in this renderer (ADR 0008 is a
  // later feature), so FR-005's in-use check happens here, against the live
  // plan, before a delete is allowed to reach the main process.
  const { nodes } = useNetwork();

  // Event-handler path: a person pressing refresh may see the loading state.
  // Filters ride along in a ref so mutations refetch with the current search
  // without refresh changing identity on every keystroke.
  const filtersRef = useRef(filters);
  filtersRef.current = filters;
  const refresh = useCallback(async (nextFilters) => {
    const bridge = window.networkPlanner?.library;
    if (!bridge) return;
    setStatus('loading');
    applyResult(await bridge.list(nextFilters ?? filtersRef.current));
  }, [applyResult]);

  const setFilters = useCallback(async (nextFilters) => {
    setFiltersState(nextFilters);
    await refresh(nextFilters);
  }, [refresh]);

  // Mount path: everything happens after the await, and a result that lands
  // after unmount is dropped rather than applied.
  useEffect(() => {
    const bridge = window.networkPlanner?.library;
    if (!bridge) return undefined;
    let cancelled = false;
    bridge.list().then((result) => {
      if (!cancelled) applyResult(result);
    });
    return () => {
      cancelled = true;
    };
  }, [applyResult]);

  const placementsOf = useCallback(
    (typeId) => nodes
      .filter((n) => n.data?.device?.id === typeId)
      .map((n) => n.data?.label || n.id),
    [nodes],
  );

  const createType = useCallback(async (draft) => {
    const bridge = window.networkPlanner?.library;
    if (!bridge) return { ok: false, error: { code: 'STORAGE_FAILED', message: 'The catalogue is not available here.' } };
    const result = await bridge.create(draft);
    if (result.ok) await refresh();
    return result;
  }, [refresh]);

  const updateType = useCallback(async (id, changes) => {
    const bridge = window.networkPlanner?.library;
    if (!bridge) return { ok: false, error: { code: 'STORAGE_FAILED', message: 'The catalogue is not available here.' } };
    const result = await bridge.update(id, changes);
    if (result.ok) await refresh();
    return result;
  }, [refresh]);

  const removeType = useCallback(async (id) => {
    // FR-005: refused while placed, naming where it is in use.
    const placed = placementsOf(id);
    if (placed.length > 0) {
      return { ok: false, error: {
        code: 'TYPE_IN_USE',
        message: `This type is placed in the current topology as ${placed.join(', ')}. Remove those first.`,
      } };
    }
    const bridge = window.networkPlanner?.library;
    if (!bridge) return { ok: false, error: { code: 'STORAGE_FAILED', message: 'The catalogue is not available here.' } };
    const result = await bridge.remove(id);
    if (result.ok) await refresh();
    return result;
  }, [placementsOf, refresh]);

  const restoreShipped = useCallback(async (id) => {
    const bridge = window.networkPlanner?.library;
    if (!bridge) return { ok: false, error: { code: 'STORAGE_FAILED', message: 'The catalogue is not available here.' } };
    const result = await bridge.restoreShipped(id);
    if (result.ok) await refresh();
    return result;
  }, [refresh]);

  const markApproved = useCallback(async (id, approved) => {
    const bridge = window.networkPlanner?.library;
    if (!bridge) return { ok: false, error: { code: 'STORAGE_FAILED', message: 'The catalogue is not available here.' } };
    const result = await bridge.markApproved(id, approved);
    if (result.ok) await refresh();
    return result;
  }, [refresh]);

  const exportLibrary = useCallback(async (ids) => {
    const bridge = window.networkPlanner?.library;
    if (!bridge) return { ok: false, error: { code: 'STORAGE_FAILED', message: 'The catalogue is not available here.' } };
    return bridge.exportLibrary(ids);
  }, []);

  const previewImport = useCallback(async () => {
    const bridge = window.networkPlanner?.library;
    if (!bridge) return { ok: false, error: { code: 'STORAGE_FAILED', message: 'The catalogue is not available here.' } };
    return bridge.previewImport();
  }, []);

  const importSymbols = useCallback(async () => {
    const bridge = window.networkPlanner?.library;
    if (!bridge) return { ok: false, error: { code: 'STORAGE_FAILED', message: 'The catalogue is not available here.' } };
    const result = await bridge.importSymbols();
    if (result.ok) await refresh();
    return result;
  }, [refresh]);

  // Imported symbol content by id, for the canvas to draw (FR-015 falls back
  // to the built-in mapping when this returns nothing).
  const symbolById = useCallback((id) => {
    for (const set of symbolSets) {
      const found = set.symbols.find((sym) => sym.id === id && sym.content !== '');
      if (found) return found;
    }
    return null;
  }, [symbolSets]);

  const importLibrary = useCallback(async (payload) => {
    const bridge = window.networkPlanner?.library;
    if (!bridge) return { ok: false, error: { code: 'STORAGE_FAILED', message: 'The catalogue is not available here.' } };
    const result = await bridge.importLibrary(payload);
    if (result.ok) await refresh();
    return result;
  }, [refresh]);

  const value = useMemo(
    () => ({
      types, categories, symbolSets, counts, filters, setFilters, status, error, refresh,
      createType, updateType, removeType, restoreShipped, markApproved, placementsOf,
      exportLibrary, previewImport, importLibrary, importSymbols, symbolById,
    }),
    [types, categories, symbolSets, counts, filters, setFilters, status, error, refresh,
     createType, updateType, removeType, restoreShipped, markApproved, placementsOf,
     exportLibrary, previewImport, importLibrary, importSymbols, symbolById],
  );

  return <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useLibrary() {
  const ctx = useContext(LibraryContext);
  if (!ctx) throw new Error('useLibrary must be used inside a LibraryProvider');
  return ctx;
}
