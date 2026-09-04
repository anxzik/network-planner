import {describe, expect, it} from 'vitest';
import {detectCollisions, mergeImport} from './importMerge';

const type = (id, extra = {}) => ({
  id, name: `Type ${id}`, manufacturer: 'Acme', model: id.toUpperCase(),
  category: 'Generic', planes: ['physical'],
  specifications: { ports: { ethernet: { count: 4 } } }, ...extra,
});

describe('detectCollisions (FR-009)', () => {
  it('pairs an incoming entry with the existing type sharing its id', () => {
    const collisions = detectCollisions([type('a'), type('b')], [type('b'), type('c')]);
    expect(collisions).toHaveLength(1);
    expect(collisions[0].incoming.id).toBe('b');
    expect(collisions[0].existing.id).toBe('b');
  });

  it('finds nothing when ids are disjoint', () => {
    expect(detectCollisions([type('a')], [type('b')])).toEqual([]);
  });
});

describe('mergeImport: resolutions (FR-009)', () => {
  const existing = [type('b', { name: 'Existing B' })];

  it('adds non-colliding entries without being asked', () => {
    const result = mergeImport([type('a')], existing, {});
    expect(result.add.map((e) => e.id)).toEqual(['a']);
    expect(result.replace).toEqual([]);
  });

  it('replace: the incoming entry wins', () => {
    const result = mergeImport([type('b', { name: 'Incoming B' })], existing, { b: 'replace' });
    expect(result.replace).toHaveLength(1);
    expect(result.replace[0].name).toBe('Incoming B');
  });

  it('keepBoth: the incoming entry arrives under a new id, the existing one untouched', () => {
    const result = mergeImport([type('b')], existing, { b: 'keepBoth' });
    expect(result.add).toHaveLength(1);
    expect(result.add[0].id).not.toBe('b');
    expect(result.add[0].id).toContain('b');
    expect(result.replace).toEqual([]);
  });

  it('keepBoth ids never collide, even repeated', () => {
    const result = mergeImport(
      [type('b'), { ...type('b'), model: 'B2' }], existing, { b: 'keepBoth' });
    const ids = [...result.add.map((e) => e.id), 'b'];
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('skip: the entry is skipped with the person\'s decision as the reason', () => {
    const result = mergeImport([type('b')], existing, { b: 'skip' });
    expect(result.add).toEqual([]);
    expect(result.replace).toEqual([]);
    expect(result.skipped[0]).toMatchObject({ id: 'b' });
  });

  it('an unresolved collision defaults to skip rather than guessing', () => {
    const result = mergeImport([type('b')], existing, {});
    expect(result.skipped[0].reason).toMatch(/no decision/i);
  });
});

describe('mergeImport: entry validation (FR-010, FR-011)', () => {
  it('applies what it can and skips invalid entries with the validator\'s message', () => {
    const bad = { id: 'bad', name: '', manufacturer: 'M', model: 'X', category: 'C', planes: ['physical'] };
    const result = mergeImport([type('a'), bad], [], {});
    expect(result.add.map((e) => e.id)).toEqual(['a']);
    expect(result.skipped[0].id).toBe('bad');
    expect(result.skipped[0].reason).toMatch(/name/i);
  });

  it('a portless import needs no interactive confirmation: shipping logical entities is normal', () => {
    const portless = type('vlan-x', { specifications: { ports: {} } });
    const result = mergeImport([portless], [], {});
    expect(result.add.map((e) => e.id)).toEqual(['vlan-x']);
  });
});

describe('mergeImport: the report (FR-011, SC-003)', () => {
  it('accounts for every incoming entry exactly once', () => {
    const incoming = [type('a'), type('b'), type('c'), { id: 'bad' }];
    const existing = [type('b'), type('c')];
    const result = mergeImport(incoming, existing, { b: 'replace', c: 'skip' });
    const accounted = result.add.length + result.replace.length + result.skipped.length;
    expect(accounted).toBe(incoming.length);
    expect(result.report).toMatchObject({ added: 1, replaced: 1, skipped: 2 });
  });

  it('every skip carries a reason, never a blank', () => {
    const incoming = [{ id: 'bad1' }, type('b')];
    const result = mergeImport(incoming, [type('b')], {});
    for (const s of result.skipped) expect(s.reason).toBeTruthy();
  });
});
