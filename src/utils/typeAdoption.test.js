import {describe, expect, it} from 'vitest';
import {adoptable, asCatalogueRow, chosenRows} from './typeAdoption';

const type = (id, extra = {}) => ({
  id, name: `Type ${id}`, manufacturer: 'Acme', model: 'M1', category: 'Switch',
  planes: ['physical'], icon: 'Network', color: '#2563eb',
  specifications: { ports: { ethernet: { count: 24 } } }, ...extra,
});

describe('adoptable', () => {
  it('offers the types the catalogue does not have', () => {
    const { offered } = adoptable({ a: type('a'), b: type('b') }, { b: type('b') });
    expect(offered.map((o) => o.typeId)).toEqual(['a']);
  });

  it('skips a type already present, never overwriting it (FR-025)', () => {
    const { skipped } = adoptable({ b: type('b', { name: 'Theirs' }) }, { b: type('b', { name: 'Mine' }) });
    expect(skipped).toEqual([{ typeId: 'b', name: 'Theirs', reason: 'already-present' }]);
  });

  it('offers nothing when the catalogue already has everything', () => {
    expect(adoptable({ a: type('a') }, { a: type('a') }).offered).toEqual([]);
  });

  it('offers nothing for a plan that records nothing', () => {
    expect(adoptable({}, {}).offered).toEqual([]);
    expect(adoptable().offered).toEqual([]);
  });

  it('ignores a record that is not a definition', () => {
    expect(adoptable({ a: null, b: 'nope', c: type('c') }, {}).offered.map((o) => o.typeId)).toEqual(['c']);
  });

  it('carries the definition, so adopting needs nothing else', () => {
    const [offer] = adoptable({ a: type('a') }, {}).offered;
    expect(offer.definition.specifications.ports.ethernet.count).toBe(24);
  });
});

describe('asCatalogueRow', () => {
  it('enters as a locally created type', () => {
    const row = asCatalogueRow(type('a'), 'from-colleague.netplan', '2026-09-03T00:00:00Z');
    expect(row.origin).toBe('local');
    expect(row.editedFromShipped).toBe(false);
  });

  it('records which plan it came from', () => {
    expect(asCatalogueRow(type('a'), 'theirs.netplan', 'now').adoptedFromPlan).toBe('theirs.netplan');
  });

  it('is not approved on arrival: someone else vouched for it, not you', () => {
    expect(asCatalogueRow(type('a'), 'theirs.netplan', 'now').approved).toBe(false);
  });

  it('keeps everything that describes the type', () => {
    const row = asCatalogueRow(type('a'), 'p', 'now');
    expect(row.name).toBe('Type a');
    expect(row.specifications.ports.ethernet.count).toBe(24);
  });
});

describe('chosenRows', () => {
  const offer = adoptable({ a: type('a'), b: type('b') }, {});

  it('takes only what the person chose', () => {
    expect(chosenRows(offer, ['a'], 'p', 'now').map((r) => r.id)).toEqual(['a']);
  });

  it('takes nothing when nothing was chosen', () => {
    expect(chosenRows(offer, [], 'p', 'now')).toEqual([]);
  });

  it('ignores an id that was never offered, so nothing unasked-for arrives', () => {
    expect(chosenRows(offer, ['a', 'never-offered'], 'p', 'now').map((r) => r.id)).toEqual(['a']);
  });

  it('cannot be used to adopt a type that was skipped as already present', () => {
    const partial = adoptable({ a: type('a'), b: type('b') }, { b: type('b') });
    expect(chosenRows(partial, ['b'], 'p', 'now')).toEqual([]);
  });
});
