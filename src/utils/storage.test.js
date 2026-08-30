import {beforeEach, describe, expect, it, vi} from 'vitest';
import {exportAll, importAll, loadData, saveData} from './storage';

const NAMESPACE = 'networkPlanner';

// The suite runs in the node environment, so stand up a minimal localStorage.
function stubLocalStorage() {
  const store = new Map();
  globalThis.localStorage = {
    getItem: (key) => (store.has(key) ? store.get(key) : null),
    setItem: (key, value) => store.set(key, String(value)),
    removeItem: (key) => store.delete(key),
    clear: () => store.clear(),
  };
  return store;
}

let store;
beforeEach(() => {
  store = stubLocalStorage();
  vi.restoreAllMocks();
});

describe('saveData / loadData', () => {
  it('round-trips a value', () => {
    saveData('nodes', [{id: 'a'}]);
    expect(loadData('nodes')).toEqual([{id: 'a'}]);
  });

  it('returns the fallback for a key that was never written', () => {
    expect(loadData('missing', 'fallback')).toBe('fallback');
  });

  it('defaults the fallback to null', () => {
    expect(loadData('missing')).toBeNull();
  });

  it('keeps unrelated keys when writing', () => {
    saveData('a', 1);
    saveData('b', 2);
    expect(loadData('a')).toBe(1);
    expect(loadData('b')).toBe(2);
  });

  it('overwrites an existing key', () => {
    saveData('a', 1);
    saveData('a', 2);
    expect(loadData('a')).toBe(2);
  });

  it('distinguishes a stored null from a missing key', () => {
    saveData('a', null);
    expect(loadData('a', 'fallback')).toBeNull();
  });

  it('writes everything under a single namespaced key', () => {
    saveData('a', 1);
    expect([...store.keys()]).toEqual([NAMESPACE]);
  });

  it('stamps a schema version', () => {
    saveData('a', 1);
    expect(JSON.parse(store.get(NAMESPACE)).__version).toBe(1);
  });
});

describe('recovering from bad stored data', () => {
  it('falls back when the stored value is not JSON', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    store.set(NAMESPACE, 'not json at all');
    expect(loadData('anything', 'fallback')).toBe('fallback');
  });

  it('falls back when the stored JSON is not an object', () => {
    store.set(NAMESPACE, '"a bare string"');
    expect(loadData('anything', 'fallback')).toBe('fallback');
  });

  it('falls back when the stored JSON is null', () => {
    store.set(NAMESPACE, 'null');
    expect(loadData('anything', 'fallback')).toBe('fallback');
  });

  it('reports the parse failure rather than failing silently', () => {
    const spy = vi.spyOn(console, 'error').mockImplementation(() => {});
    store.set(NAMESPACE, '{oops');
    loadData('anything');
    expect(spy).toHaveBeenCalled();
  });

  it('recovers by overwriting corrupt data on the next save', () => {
    vi.spyOn(console, 'error').mockImplementation(() => {});
    store.set(NAMESPACE, '{oops');
    saveData('a', 1);
    expect(loadData('a')).toBe(1);
  });
});

describe('exportAll / importAll', () => {
  it('round-trips a whole snapshot', () => {
    saveData('nodes', [{id: 'a'}]);
    saveData('viewMode', 'logical');
    const snapshot = exportAll();

    store.clear();
    importAll(snapshot);

    expect(loadData('nodes')).toEqual([{id: 'a'}]);
    expect(loadData('viewMode')).toBe('logical');
  });

  it('exports an empty snapshot carrying only the version', () => {
    expect(exportAll()).toEqual({__version: 1});
  });

  it('replaces rather than merges the existing snapshot', () => {
    saveData('stale', 'gone');
    importAll({fresh: 'kept'});
    expect(loadData('stale')).toBeNull();
    expect(loadData('fresh')).toBe('kept');
  });

  it('ignores a non-object snapshot', () => {
    saveData('a', 1);
    importAll('not an object');
    expect(loadData('a')).toBe(1);
  });

  it('ignores a null snapshot', () => {
    saveData('a', 1);
    importAll(null);
    expect(loadData('a')).toBe(1);
  });
});
