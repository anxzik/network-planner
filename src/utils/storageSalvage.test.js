import {describe, expect, it} from 'vitest';
import {classifyOldStorage, MARKER_STORAGE_KEY, migrationMarker} from './storageSalvage';

const root = (extra = {}) => JSON.stringify({
  __version: 1,
  nodes: [{ id: 'n1', type: 'switch' }, { id: 'n2', type: 'router' }],
  edges: [{ id: 'e1', source: 'n1', target: 'n2' }],
  vlans: [{ id: 10, name: 'voice' }],
  networkObjects: [{ id: 'o1', name: 'patch panel' }],
  scratchpad_notes: 'riser is on the north wall',
  scratchpad_calculations: [{ id: 'c1' }],
  ...extra,
});

describe('an ordinary empty start (FR-013, SC-007)', () => {
  it('says there is nothing when the key was never written', () => {
    expect(classifyOldStorage(null).kind).toBe('none');
    expect(classifyOldStorage(undefined).kind).toBe('none');
    expect(classifyOldStorage('').kind).toBe('none');
  });

  it('says there is nothing when storage exists but holds no work', () => {
    expect(classifyOldStorage(JSON.stringify({ __version: 1 })).kind).toBe('none');
    expect(classifyOldStorage(JSON.stringify({
      __version: 1, nodes: [], edges: [], vlans: [], networkObjects: [],
      scratchpad_notes: '', scratchpad_calculations: [],
    })).kind).toBe('none');
  });

  it('does not treat a view preference alone as work worth migrating', () => {
    expect(classifyOldStorage(JSON.stringify({ __version: 1, viewMode: 'logical' })).kind).toBe('none');
  });
});

describe('intact storage (FR-010)', () => {
  it('recognises a readable topology', () => {
    const result = classifyOldStorage(root());
    expect(result.kind).toBe('intact');
  });

  it('maps the old keys onto a plan document', () => {
    const { document } = classifyOldStorage(root());
    expect(document.appliances).toHaveLength(2);
    expect(document.connections).toHaveLength(1);
    expect(document.vlans).toHaveLength(1);
    expect(document.networkObjects).toHaveLength(1);
    expect(document.scratchpad.notes).toBe('riser is on the north wall');
    expect(document.scratchpad.calculations).toHaveLength(1);
  });

  it('offers a preview the person can check before agreeing', () => {
    expect(classifyOldStorage(root()).preview)
      .toEqual({ appliances: 2, connections: 1, vlans: 1, networkObjects: 1, notes: 26, calculations: 1 });
  });

  it('tolerates a missing key rather than failing the whole reading', () => {
    const partial = JSON.stringify({ __version: 1, nodes: [{ id: 'n1' }] });
    const { document } = classifyOldStorage(partial);
    expect(document.appliances).toHaveLength(1);
    expect(document.connections).toEqual([]);
  });

  it('ignores a key of the wrong type instead of carrying it across', () => {
    const odd = JSON.stringify({ __version: 1, nodes: 'not a list', vlans: [{ id: 1 }] });
    expect(classifyOldStorage(odd).document.appliances).toEqual([]);
  });
});

describe('already migrated', () => {
  const marker = JSON.stringify(migrationMarker('denver.netplan', '2026-09-03T00:00:00Z').value);

  it('reports the marker instead of offering the crossing again', () => {
    const result = classifyOldStorage(root(), marker);
    expect(result.kind).toBe('migrated');
    expect(result.marker.migratedTo).toBe('denver.netplan');
  });

  it('still reports what the storage holds, so it can be exported again', () => {
    expect(classifyOldStorage(root(), marker).document.appliances).toHaveLength(2);
  });

  it('recognises damaged storage that was already migrated, rather than re-offering salvage', () => {
    expect(classifyOldStorage('{"nodes":[{"id":"n1"}],"edges":@@@}', marker).kind).toBe('migrated');
  });

  it('ignores an unreadable marker rather than assuming a crossing happened', () => {
    expect(classifyOldStorage(root(), 'not json').kind).toBe('intact');
    expect(classifyOldStorage(root(), JSON.stringify({ nonsense: true })).kind).toBe('intact');
  });

  it('still tolerates a marker an earlier build wrote inside the root', () => {
    const legacy = root({ __migration: { migratedTo: 'old.netplan', migratedAt: 'then' } });
    expect(classifyOldStorage(legacy).kind).toBe('migrated');
  });
});

describe('damaged storage (FR-012)', () => {
  it('recovers the entries that completed before a write was cut off', () => {
    const cut = '{"__version":1,"nodes":[{"id":"n1"},{"id":"n2"},{"id":"n3';
    const result = classifyOldStorage(cut);
    expect(result.kind).toBe('salvageable');
    expect(result.document.appliances.map((n) => n.id)).toEqual(['n1', 'n2']);
  });

  it('recovers what it can from a file damaged in the middle', () => {
    const broken = '{"__version":1,"nodes":[{"id":"n1"}],"edges":@@@corrupt@@@,"vlans":[{"id":10}]}';
    const result = classifyOldStorage(broken);
    expect(result.kind).toBe('salvageable');
    expect(result.document.appliances).toHaveLength(1);
    expect(result.document.vlans).toHaveLength(1);
  });

  it('names what it recovered and what it could not', () => {
    const broken = '{"nodes":[{"id":"n1"}],"edges":@@@,"vlans":[{"id":10}]}';
    const result = classifyOldStorage(broken);
    expect(result.recovered).toContain('nodes');
    expect(result.recovered).toContain('vlans');
    expect(result.lost).toContain('edges');
  });

  it('recovers scratchpad notes, which are as much the person’s work as the canvas', () => {
    const broken = '{"scratchpad_notes":"do not lose me","nodes":@@@}';
    const result = classifyOldStorage(broken);
    expect(result.document.scratchpad.notes).toBe('do not lose me');
  });

  it('promises the original is kept whatever the person chooses', () => {
    const result = classifyOldStorage('{"nodes":[{"id":"n1"}],"edges":@@@}');
    expect(result.message).toMatch(/original is kept untouched/i);
  });

  it('reports unreadable when nothing at all can be recovered', () => {
    const result = classifyOldStorage('@@@ this was never JSON @@@');
    expect(result.kind).toBe('unreadable');
    expect(result.message).toMatch(/left exactly as it is/i);
  });

  it('reports unreadable rather than offering an empty migration', () => {
    expect(classifyOldStorage('{"nodes":[],"edges":@@@}').kind).toBe('unreadable');
  });

  it('does not mistake a JSON array for a storage root', () => {
    expect(classifyOldStorage('[1,2,3]').kind).toBe('unreadable');
  });

  it('reports non-string input rather than assuming', () => {
    expect(classifyOldStorage(42).kind).toBe('unreadable');
  });
});

describe('migrationMarker', () => {
  it('records where the work went and when, under its own key', () => {
    const marker = migrationMarker('denver.netplan', '2026-09-03T12:00:00Z');
    expect(marker.key).toBe(MARKER_STORAGE_KEY);
    expect(marker.value).toEqual({ migratedTo: 'denver.netplan', migratedAt: '2026-09-03T12:00:00Z' });
  });

  it('never asks for the old root to be rewritten, so the original is untouched', () => {
    expect(migrationMarker('a.netplan', 'now').key).not.toBe('networkPlanner');
  });

  it('produces a marker the classifier recognises', () => {
    const { value } = migrationMarker('a.netplan', 'now');
    expect(classifyOldStorage(root(), JSON.stringify(value)).kind).toBe('migrated');
  });
});
