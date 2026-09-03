import {describe, expect, it} from 'vitest';
import {findByPath, forDisplay, recentId, recordOpen, recordRename, removeEntry} from './recentsPrune';

const entry = (path, name, lastOpened = '2026-09-01T00:00:00Z') => ({ path, name, lastOpened });

describe('recentId', () => {
  it('is stable for the same path, so ids survive a restart', () => {
    expect(recentId('/plans/a.netplan')).toBe(recentId('/plans/a.netplan'));
  });

  it('differs between paths', () => {
    expect(recentId('/plans/a.netplan')).not.toBe(recentId('/plans/b.netplan'));
  });

  it('does not contain the path, which must never reach the renderer', () => {
    const id = recentId('/home/someone/plans/warehouse-b.netplan');
    expect(id).not.toContain('warehouse');
    expect(id).not.toContain('/');
    expect(id).toMatch(/^[0-9a-f]{8}$/);
  });

  it('distinguishes paths that differ only at the end', () => {
    expect(recentId('/a/plan-1.netplan')).not.toBe(recentId('/a/plan-2.netplan'));
  });
});

describe('recordOpen', () => {
  it('puts the opened plan at the front', () => {
    const list = recordOpen([entry('/a', 'a')], { path: '/b', name: 'b', at: 'now' });
    expect(list.map((e) => e.path)).toEqual(['/b', '/a']);
  });

  it('moves an already-known plan to the front rather than adding it twice', () => {
    const list = recordOpen([entry('/a', 'a'), entry('/b', 'b')], { path: '/b', name: 'b', at: 'now' });
    expect(list.map((e) => e.path)).toEqual(['/b', '/a']);
    expect(list).toHaveLength(2);
  });

  it('refreshes the time and name of a re-opened plan', () => {
    const list = recordOpen([entry('/a', 'old name')], { path: '/a', name: 'new name', at: 'later' });
    expect(list[0]).toEqual({ path: '/a', name: 'new name', lastOpened: 'later' });
  });

  it('starts a list when there is none', () => {
    expect(recordOpen(undefined, { path: '/a', name: 'a', at: 'now' })).toEqual([entry('/a', 'a', 'now')]);
  });

  it('ignores an open with no path rather than recording a broken entry', () => {
    const before = [entry('/a', 'a')];
    expect(recordOpen(before, { path: '', name: 'x', at: 'now' })).toBe(before);
  });

  it('keeps every other entry, however long the list', () => {
    const many = Array.from({ length: 50 }, (_, i) => entry(`/p${i}`, `p${i}`));
    expect(recordOpen(many, { path: '/new', name: 'new', at: 'now' })).toHaveLength(51);
  });
});

describe('recordRename', () => {
  it('moves an entry to its new location instead of leaving both', () => {
    const list = recordRename([entry('/a', 'a'), entry('/b', 'b')], '/a', { path: '/c', name: 'c', at: 'now' });
    expect(list.map((e) => e.path)).toEqual(['/c', '/b']);
  });
});

describe('removeEntry', () => {
  it('removes only the entry asked for', () => {
    const list = [entry('/a', 'a'), entry('/b', 'b')];
    expect(removeEntry(list, recentId('/b')).map((e) => e.path)).toEqual(['/a']);
  });

  it('leaves the list alone when the id is unknown', () => {
    const list = [entry('/a', 'a')];
    expect(removeEntry(list, 'deadbeef')).toEqual(list);
  });
});

describe('findByPath', () => {
  it('resolves an opaque id back to its entry', () => {
    const list = [entry('/a', 'a'), entry('/b', 'b')];
    expect(findByPath(list, recentId('/b')).path).toBe('/b');
  });

  it('returns nothing for an id that is not in the list', () => {
    expect(findByPath([entry('/a', 'a')], 'deadbeef')).toBeNull();
  });
});

describe('forDisplay', () => {
  it('sends an id and a name, never a path', () => {
    const shown = forDisplay([entry('/home/me/warehouse-b.netplan', 'warehouse-b')]);
    expect(shown[0]).toEqual({
      id: recentId('/home/me/warehouse-b.netplan'),
      name: 'warehouse-b', lastOpened: '2026-09-01T00:00:00Z', exists: true,
    });
    expect(JSON.stringify(shown)).not.toContain('/home/me');
  });

  it('marks a vanished file without removing its entry (FR-007)', () => {
    const list = [entry('/a', 'a'), entry('/b', 'b')];
    const shown = forDisplay(list, { '/b': false });
    expect(shown).toHaveLength(2);
    expect(shown.find((e) => e.name === 'b').exists).toBe(false);
  });

  it('treats an entry it was told nothing about as present, never guessing it away', () => {
    expect(forDisplay([entry('/a', 'a')], {})[0].exists).toBe(true);
  });

  it('shows an empty list as empty', () => {
    expect(forDisplay([])).toEqual([]);
    expect(forDisplay()).toEqual([]);
  });
});
