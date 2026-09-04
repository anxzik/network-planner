import {describe, expect, it} from 'vitest';
import {buildTypeQuery} from './catalogueQuery';

describe('buildTypeQuery: no filters', () => {
  it('selects everything with no where clause', () => {
    expect(buildTypeQuery({})).toEqual({ where: '', params: [] });
    expect(buildTypeQuery()).toEqual({ where: '', params: [] });
  });
});

describe('buildTypeQuery: search (FR-017)', () => {
  it('matches name, manufacturer and model, case-insensitively', () => {
    const q = buildTypeQuery({ search: 'cata' });
    expect(q.where).toContain('name LIKE ?');
    expect(q.where).toContain('manufacturer LIKE ?');
    expect(q.where).toContain('model LIKE ?');
    expect(q.params).toEqual(['%cata%', '%cata%', '%cata%']);
  });

  it('escapes LIKE wildcards so a literal percent searches as text', () => {
    const q = buildTypeQuery({ search: '100%_x' });
    expect(q.params[0]).toBe('%100\\%\\_x%');
    expect(q.where).toContain("ESCAPE '\\'");
  });

  it('ignores a whitespace-only search', () => {
    expect(buildTypeQuery({ search: '   ' }).where).toBe('');
  });
});

describe('buildTypeQuery: category, plane and origin filters (FR-017, FR-018)', () => {
  it('filters by exact category', () => {
    const q = buildTypeQuery({ category: 'Cisco' });
    expect(q.where).toBe('WHERE category = ?');
    expect(q.params).toEqual(['Cisco']);
  });

  it('filters by plane membership inside the JSON column', () => {
    const q = buildTypeQuery({ plane: 'logical' });
    expect(q.where).toContain('planes LIKE ?');
    expect(q.params).toEqual(['%"logical"%']);
  });

  it('rejects an unknown plane rather than quietly matching nothing', () => {
    expect(() => buildTypeQuery({ plane: 'astral' })).toThrow(/astral/);
  });

  it('filters by origin', () => {
    expect(buildTypeQuery({ origin: 'local' }).params).toEqual(['local']);
  });

  it('combines filters with AND, in a stable order', () => {
    const q = buildTypeQuery({ search: 'sw', category: 'Cisco', plane: 'physical', origin: 'shipped' });
    expect(q.where.match(/AND/g)).toHaveLength(3);
    expect(q.params).toEqual(['%sw%', '%sw%', '%sw%', 'Cisco', '%"physical"%', 'shipped']);
  });
});
