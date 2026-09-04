import {describe, expect, it} from 'vitest';
import fs from 'node:fs';
import {shippedCategories, shippedTypeById, shippedTypes} from './shippedTypes';

// The source of truth for faithfulness is the frozen pre-feature capture
// (T002): devices.js itself was deleted once its consumers moved to the
// catalogue (T047), and the fixture is the record of what shipped.
const legacy = JSON.parse(fs.readFileSync(
  'specs/002-hardware-library/fixtures/legacy-catalogue-v0.json', 'utf8'));
const devices = legacy.devices;
const deviceCategories = legacy.deviceCategories;

// The sixteen kinds portFactory generates, plus one this test discovered:
// endpoint-rpizero ships with a usb port group that portFactory has never
// generated, so placing a Pi Zero silently drops its USB port today. The
// catalogue data must still carry it, or FR-022's "unchanged" is violated in
// migration. Whether generation should learn usb is a separate decision.
const KNOWN_PORT_KINDS = new Set([
  'ethernet', 'ethernet10g', 'ethernet25g',
  'sfp', 'sfpPlus', 'sfp28', 'sfp56',
  'qsfp', 'qsfpPlus', 'qsfp28', 'qsfpdd',
  'fiber', 'coax', 'rj11', 'wan', 'slots',
  'usb',
]);

describe('shippedTypes: the transcription is faithful', () => {
  it('carries all 131 types', () => {
    expect(shippedTypes).toHaveLength(131);
    expect(shippedTypes).toHaveLength(devices.length);
  });

  it('carries all 19 categories, unchanged', () => {
    expect(Object.keys(shippedCategories)).toHaveLength(19);
    expect(shippedCategories).toEqual(deviceCategories);
  });

  it('keeps every id, with none added, lost, or renamed', () => {
    expect(shippedTypes.map((t) => t.id).sort())
      .toEqual(devices.map((d) => d.id).sort());
  });

  it('keeps ids unique', () => {
    const ids = shippedTypes.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('preserves every original field on every record', () => {
    for (const original of devices) {
      const t = shippedTypeById(original.id);
      expect(t, original.id).not.toBeNull();
      for (const [key, value] of Object.entries(original)) {
        expect(t[key], `${original.id}.${key}`).toEqual(value);
      }
    }
  });

  it('preserves every port group with count, speed and poe intact', () => {
    for (const original of devices) {
      expect(shippedTypeById(original.id).specifications.ports,
        original.id).toEqual(original.specifications.ports);
    }
  });
});

describe('shippedTypes: plane membership (FR-019)', () => {
  it('gives every type at least one plane', () => {
    for (const t of shippedTypes) {
      expect(Array.isArray(t.planes) && t.planes.length >= 1, t.id).toBe(true);
    }
  });

  it('maps the existing viewType split onto planes exactly', () => {
    for (const t of shippedTypes) {
      expect(t.planes, t.id).toEqual([t.viewType]);
    }
    expect(shippedTypes.filter((t) => t.planes.includes('physical'))).toHaveLength(107);
    expect(shippedTypes.filter((t) => t.planes.includes('logical'))).toHaveLength(24);
  });
});

describe('shippedTypes: port kinds stay representable (FR-021)', () => {
  it('uses no port kind outside the known seventeen', () => {
    for (const t of shippedTypes) {
      for (const kind of Object.keys(t.specifications?.ports ?? {})) {
        expect(KNOWN_PORT_KINDS.has(kind), `${t.id} uses unknown kind ${kind}`).toBe(true);
      }
    }
  });

  it('still exercises the breadth of the catalogue', () => {
    const used = new Set(
      shippedTypes.flatMap((t) => Object.keys(t.specifications?.ports ?? {})));
    expect(used.size).toBeGreaterThanOrEqual(15);
  });
});

describe('shippedTypeById', () => {
  it('finds a known type and returns null for an unknown one', () => {
    expect(shippedTypeById('gen-router-001')?.name).toBe('Router');
    expect(shippedTypeById('nope')).toBeNull();
  });
});
