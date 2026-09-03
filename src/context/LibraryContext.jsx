// Catalogue state for the renderer. Reads through the preload bridge and holds
// what came back; decisions about the data belong in src/utils/, and the
// bridge itself is defined in specs/002-hardware-library/contracts/.
import {createContext, useCallback, useContext, useEffect, useMemo, useState} from 'react';

const LibraryContext = createContext(null);

// Whether the preload bridge exists is knowable synchronously, so it is the
// initial state rather than something an effect discovers (tests and a plain
// browser have no bridge).
const bridgeAvailable = () => Boolean(window.networkPlanner?.library);

export function LibraryProvider({ children }) {
  const [types, setTypes] = useState([]);
  const [categories, setCategories] = useState([]);
  // 'loading' | 'ready' | 'error' | 'unavailable'
  const [status, setStatus] = useState(() => (bridgeAvailable() ? 'loading' : 'unavailable'));
  const [error, setError] = useState(null);

  const applyResult = useCallback((result) => {
    if (result.ok) {
      setTypes(result.value.types);
      setCategories(result.value.categories);
      setError(null);
      setStatus('ready');
    } else {
      setError(result.error);
      setStatus('error');
    }
  }, []);

  // Event-handler path: a person pressing refresh may see the loading state.
  const refresh = useCallback(async () => {
    const bridge = window.networkPlanner?.library;
    if (!bridge) return;
    setStatus('loading');
    applyResult(await bridge.list());
  }, [applyResult]);

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

  const value = useMemo(
    () => ({ types, categories, status, error, refresh }),
    [types, categories, status, error, refresh],
  );

  return <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useLibrary() {
  const ctx = useContext(LibraryContext);
  if (!ctx) throw new Error('useLibrary must be used inside a LibraryProvider');
  return ctx;
}
