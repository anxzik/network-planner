import {describe, expect, it} from 'vitest';
import {
  applyUpdate, changedFields, collectRecordedDefinitions, declineUpdate,
  definitionsDiffer, findDivergences, offerable, versionOf,
} from './planDivergence';

const type = (id, extra = {}) => ({
  id, name: `Type ${id}`, manufacturer: 'Acme', model: id.toUpperCase(),
  category: 'Switch', description: '', planes: ['physical'], icon: 'Network',
  color: '#2563eb', specifications: { ports: { ethernet: { count: 24 } } },
  updatedAt: '2026-01-01T00:00:00Z', ...extra,
});

const node = (id, device) => ({ id, type: 'deviceNode', data: { device, label: device.name } });

describe('collectRecordedDefinitions', () => {
  it('records one definition per distinct placed type', () => {
    const a = type('a');
    const recorded = collectRecordedDefinitions([node('n1', a), node('n2', a), node('n3', type('b'))]);
    expect(Object.keys(recorded).sort()).toEqual(['a', 'b']);
  });

  it('records the full definition, not a reference to it', () => {
    const recorded = collectRecordedDefinitions([node('n1', type('a'))]);
    expect(recorded.a.specifications.ports.ethernet.count).toBe(24);
    expect(recorded.a.manufacturer).toBe('Acme');
  });

  it('takes the definition from the node, which is the one it was placed with', () => {
    const asPlaced = type('a', { name: 'As placed' });
    expect(collectRecordedDefinitions([node('n1', asPlaced)]).a.name).toBe('As placed');
  });

  it('ignores nodes carrying nothing usable rather than failing the whole save', () => {
    const recorded = collectRecordedDefinitions([
      node('n1', type('a')), { id: 'n2' }, { id: 'n3', data: {} }, { id: 'n4', data: { device: {} } }, null,
    ]);
    expect(Object.keys(recorded)).toEqual(['a']);
  });

  it('records nothing for an empty canvas', () => {
    expect(collectRecordedDefinitions([])).toEqual({});
    expect(collectRecordedDefinitions()).toEqual({});
  });
});

describe('definitionsDiffer', () => {
  it('sees a changed port count', () => {
    const current = type('a', { specifications: { ports: { ethernet: { count: 48 } } } });
    expect(definitionsDiffer(type('a'), current)).toBe(true);
  });

  it('ignores a touched timestamp, which is not a correction', () => {
    expect(definitionsDiffer(type('a'), type('a', { updatedAt: '2026-06-01T00:00:00Z' }))).toBe(false);
  });

  it('ignores catalogue bookkeeping the plan never cared about', () => {
    expect(definitionsDiffer(type('a'), type('a', { origin: 'local', approved: true }))).toBe(false);
  });

  it('sees a renamed or recoloured type', () => {
    expect(definitionsDiffer(type('a'), type('a', { name: 'Renamed' }))).toBe(true);
    expect(definitionsDiffer(type('a'), type('a', { color: '#ff0000' }))).toBe(true);
  });
});

describe('changedFields', () => {
  it('names what would change, so the person knows what they are accepting', () => {
    const current = type('a', { name: 'Renamed', specifications: { ports: { ethernet: { count: 48 } } } });
    expect(changedFields(type('a'), current).sort()).toEqual(['name', 'specifications']);
  });

  it('names nothing when the definitions agree', () => {
    expect(changedFields(type('a'), type('a'))).toEqual([]);
  });
});

describe('findDivergences (FR-016)', () => {
  const document = (extra = {}) => ({
    recordedDefinitions: { a: type('a'), b: type('b') },
    declinedOffers: {},
    appliances: [node('n1', type('a'))],
    ...extra,
  });

  it('finds a type whose catalogue copy has changed', () => {
    const catalogue = { a: type('a', { name: 'Corrected' }), b: type('b') };
    const found = findDivergences(document(), catalogue);
    expect(found).toHaveLength(1);
    expect(found[0].typeId).toBe('a');
    expect(found[0].changed).toEqual(['name']);
  });

  it('says nothing about a type the catalogue does not have (FR-015)', () => {
    expect(findDivergences(document(), {})).toEqual([]);
  });

  it('says nothing when the copies agree', () => {
    expect(findDivergences(document(), { a: type('a'), b: type('b') })).toEqual([]);
  });

  it('carries both copies, so which is shown can be made clear', () => {
    const catalogue = { a: type('a', { name: 'Corrected' }) };
    const [found] = findDivergences(document(), catalogue);
    expect(found.planCopy.name).toBe('Type a');
    expect(found.current.name).toBe('Corrected');
  });
});

describe('a decline is version-scoped, not permanent (FR-017, SC-005)', () => {
  const base = {
    recordedDefinitions: { a: type('a') }, appliances: [node('n1', type('a'))], declinedOffers: {},
  };

  it('stops offering the version that was declined', () => {
    const corrected = type('a', { name: 'Corrected', updatedAt: '2026-02-01T00:00:00Z' });
    const declined = declineUpdate(base, 'a', corrected);
    expect(offerable(declined, { a: corrected })).toEqual([]);
  });

  it('offers again when a LATER correction arrives', () => {
    const first = type('a', { name: 'Corrected', updatedAt: '2026-02-01T00:00:00Z' });
    const declined = declineUpdate(base, 'a', first);
    const second = type('a', { name: 'Corrected twice', updatedAt: '2026-03-01T00:00:00Z' });
    expect(offerable(declined, { a: second })).toHaveLength(1);
  });

  it('remembers per type, so declining one does not silence another', () => {
    const doc = { ...base, recordedDefinitions: { a: type('a'), b: type('b') } };
    const declined = declineUpdate(doc, 'a', type('a', { name: 'X', updatedAt: '2026-02-01T00:00:00Z' }));
    const catalogue = {
      a: type('a', { name: 'X', updatedAt: '2026-02-01T00:00:00Z' }),
      b: type('b', { name: 'Y', updatedAt: '2026-02-01T00:00:00Z' }),
    };
    expect(offerable(declined, catalogue).map((d) => d.typeId)).toEqual(['b']);
  });

  it('changes nothing else about the plan', () => {
    const declined = declineUpdate(base, 'a', type('a', { name: 'X' }));
    expect(declined.recordedDefinitions.a.name).toBe('Type a');
    expect(declined.appliances[0].data.device.name).toBe('Type a');
  });
});

describe('applyUpdate (FR-016)', () => {
  const corrected = type('a', { name: 'Corrected', updatedAt: '2026-02-01T00:00:00Z' });
  const base = {
    recordedDefinitions: { a: type('a'), b: type('b') },
    declinedOffers: { a: '2026-01-01T00:00:00Z' },
    appliances: [node('n1', type('a')), node('n2', type('b'))],
  };

  it('replaces the plan’s recorded copy', () => {
    expect(applyUpdate(base, 'a', corrected).recordedDefinitions.a.name).toBe('Corrected');
  });

  it('updates the placed nodes too, since it is their copy that renders', () => {
    const updated = applyUpdate(base, 'a', corrected);
    expect(updated.appliances[0].data.device.name).toBe('Corrected');
  });

  it('leaves other types alone', () => {
    const updated = applyUpdate(base, 'a', corrected);
    expect(updated.recordedDefinitions.b.name).toBe('Type b');
    expect(updated.appliances[1].data.device.name).toBe('Type b');
  });

  it('clears a previous decline, because the question has now been answered', () => {
    expect(applyUpdate(base, 'a', corrected).declinedOffers.a).toBeUndefined();
  });

  it('does nothing without a definition to apply', () => {
    expect(applyUpdate(base, 'a', null)).toBe(base);
  });
});

describe('versionOf', () => {
  it('is the catalogue timestamp a decline is measured against', () => {
    expect(versionOf(type('a'))).toBe('2026-01-01T00:00:00Z');
    expect(versionOf(undefined)).toBeNull();
  });
});

describe('edge cases the spec names (T048)', () => {
  it('a recorded definition that fails today’s rules still renders, and still diverges', () => {
    // FR-015 is unconditional: the plan shows what it recorded, whether or not
    // today's validation would accept it. Divergence still reports the
    // difference so the person can choose the catalogue's version.
    const invalid = { id: 'a', name: '', planes: [], specifications: null, updatedAt: '2026-01-01T00:00:00Z' };
    const current = type('a');
    const document = {
      recordedDefinitions: { a: invalid }, declinedOffers: {},
      appliances: [node('n1', invalid)],
    };
    const [found] = findDivergences(document, { a: current });
    expect(found.planCopy).toBe(invalid);
    expect(found.changed.length).toBeGreaterThan(0);
  });

  it('a plan placing a type twice records it once and updates both nodes', () => {
    const document = {
      recordedDefinitions: { a: type('a') }, declinedOffers: {},
      appliances: [node('n1', type('a')), node('n2', type('a'))],
    };
    const corrected = type('a', { name: 'Corrected' });
    const updated = applyUpdate(document, 'a', corrected);
    expect(updated.appliances.every((n) => n.data.device.name === 'Corrected')).toBe(true);
  });

  it('a node carrying no device survives an update untouched', () => {
    const document = {
      recordedDefinitions: { a: type('a') }, declinedOffers: {},
      appliances: [{ id: 'n1' }, node('n2', type('a'))],
    };
    const updated = applyUpdate(document, 'a', type('a', { name: 'X' }));
    expect(updated.appliances[0]).toEqual({ id: 'n1' });
  });
});
