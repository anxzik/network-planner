import {useEffect, useMemo} from 'react';
import {debounce} from '../utils/debounce';
import {saveData} from '../utils/storage';

// Write a value to storage under `key` whenever it changes, debounced so that
// rapid updates cost one write rather than many.
//
// Write-only by design: state is loaded once via loadData() where it is
// declared, which keeps this usable for state this app does not own, such as
// the nodes and edges held by ReactFlow.
export function usePersist(key, value, delay = 300) {
  const persist = useMemo(
    () => debounce((next) => saveData(key, next), delay),
    [key, delay]
  );

  useEffect(() => {
    persist(value);
  }, [value, persist]);
}
