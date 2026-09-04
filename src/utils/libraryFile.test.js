import {describe, expect, it} from 'vitest';
import {CURRENT_FORMAT_VERSION, readLibraryFile, serialiseLibrary} from './libraryFile';

const type = (id, extra = {}) => ({
  id, name: `Type ${id}`, manufacturer: 'Acme', model: id.toUpperCase(),
  category: 'Generic', planes: ['physical'],
  specifications: { ports: { ethernet: { count: 4 } } }, ...extra,
});

describe('serialiseLibrary', () => {
  it('writes the current format version first, so it can be read before parsing the rest', () => {
    const text = serialiseLibrary({ applianceTypes: [type('a')] });
    expect(text.trimStart().startsWith(`{\n "formatVersion": "${CURRENT_FORMAT_VERSION}"`)).toBe(true);
  });

  it('round-trips: what was serialised reads back complete and current', () => {
    const text = serialiseLibrary({ applianceTypes: [type('a'), type('b')] });
    const result = readLibraryFile(text);
    expect(result.kind).toBe('current');
    expect(result.entries.map((e) => e.id)).toEqual(['a', 'b']);
    expect(result.skipped).toEqual([]);
    expect(result.formatWarning).toBeNull();
  });
});

describe('readLibraryFile: unreadable input (FR-011)', () => {
  it('classifies non-JSON with a stated reason', () => {
    const result = readLibraryFile('not json at all {');
    expect(result.kind).toBe('unreadable');
    expect(result.message).toMatch(/could not be read/i);
  });

  it('classifies JSON that is not a library file', () => {
    expect(readLibraryFile('42').kind).toBe('unreadable');
    expect(readLibraryFile('{"hello":"world"}').kind).toBe('unreadable');
  });
});

describe('readLibraryFile: the legacy shape (FR-013a)', () => {
  it('recognises the pre-feature devices.js shape and brings it forward', () => {
    const legacy = JSON.stringify({
      source: 'src/data/devices.js',
      deviceCategories: { Generic: { name: 'Generic', label: 'Generic', color: '#666', subcategories: [] } },
      devices: [{ id: 'gen-1', name: 'Router', manufacturer: 'Generic', model: 'R1',
        category: 'Generic', viewType: 'logical', specifications: { ports: {} } }],
    });
    const result = readLibraryFile(legacy);
    expect(result.kind).toBe('legacy');
    expect(result.entries).toHaveLength(1);
    expect(result.entries[0].planes).toEqual(['logical']);
    expect(result.formatWarning).toBeNull();
  });

  it('defaults a legacy record with no viewType to the physical plane', () => {
    const legacy = JSON.stringify({ devices: [
      { id: 'x', name: 'X', manufacturer: 'M', model: 'X1', category: 'Generic' }] });
    expect(readLibraryFile(legacy).entries[0].planes).toEqual(['physical']);
  });

  it('upgrades in place: the entries come back in the current shape, not the old one', () => {
    const legacy = JSON.stringify({ devices: [
      { id: 'x', name: 'X', manufacturer: 'M', model: 'X1', category: 'Generic', viewType: 'physical' }] });
    const upgraded = readLibraryFile(legacy).entries[0];
    expect(upgraded.planes).toBeDefined();
  });
});

describe('readLibraryFile: an unrecognised version (FR-013)', () => {
  const newer = JSON.stringify({
    formatVersion: '99.0',
    applianceTypes: [
      type('ok-1'),
      { id: 'bad-1', futureField: { shape: 'unknown' } },
      type('ok-2'),
    ],
  });

  it('imports what it can read and warns, rather than refusing', () => {
    const result = readLibraryFile(newer);
    expect(result.kind).toBe('unknownVersion');
    expect(result.formatWarning).toContain('99.0');
    expect(result.entries.map((e) => e.id)).toEqual(['ok-1', 'ok-2']);
  });

  it('names each unreadable entry and why (FR-011)', () => {
    const result = readLibraryFile(newer);
    expect(result.skipped).toHaveLength(1);
    expect(result.skipped[0].id).toBe('bad-1');
    expect(result.skipped[0].reason).toBeTruthy();
  });

  it('never silently discards the whole file', () => {
    const empty = JSON.stringify({ formatVersion: '99.0', applianceTypes: [{ mystery: true }] });
    const result = readLibraryFile(empty);
    expect(result.kind).toBe('unknownVersion');
    expect(result.entries).toEqual([]);
    expect(result.skipped).toHaveLength(1);
  });
});

describe('readLibraryFile: the captured legacy fixture (T002)', () => {
  it('brings all 131 shipped types forward from the real pre-feature capture', async () => {
    const fs = await import('node:fs');
    const text = fs.readFileSync(
      'specs/002-hardware-library/fixtures/legacy-catalogue-v0.json', 'utf8');
    const result = readLibraryFile(text);
    expect(result.kind).toBe('legacy');
    expect(result.entries).toHaveLength(131);
    expect(result.skipped).toEqual([]);
    for (const entry of result.entries) {
      expect(Array.isArray(entry.planes) && entry.planes.length === 1, entry.id).toBe(true);
    }
  });
});
