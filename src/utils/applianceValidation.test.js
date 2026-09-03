import {describe, expect, it} from 'vitest';
import {
  KNOWN_PLANES,
  KNOWN_PORT_KINDS,
  PORT_LIMIT,
  validateApplianceType,
} from './applianceValidation';

const draft = (overrides = {}) => ({
  name: 'Access Switch',
  manufacturer: 'Acme',
  model: 'AS-24',
  category: 'Generic',
  planes: ['physical'],
  specifications: { ports: { ethernet: { count: 24, speed: '1Gbps' } } },
  ...overrides,
});

describe('validateApplianceType: required fields (FR-001)', () => {
  it('accepts a complete draft', () => {
    expect(validateApplianceType(draft())).toEqual({ valid: true, errors: [], portless: false });
  });

  it.each(['name', 'manufacturer', 'model', 'category'])('rejects a missing %s', (field) => {
    const result = validateApplianceType(draft({ [field]: '' }));
    expect(result.valid).toBe(false);
    expect(result.errors.map((e) => e.field)).toContain(field);
  });

  it('rejects whitespace-only values, not just empty ones', () => {
    expect(validateApplianceType(draft({ name: '   ' })).valid).toBe(false);
  });

  it('names every failing field at once rather than the first', () => {
    const result = validateApplianceType(draft({ name: '', model: '' }));
    expect(result.errors.map((e) => e.field).sort()).toEqual(['model', 'name']);
  });
});

describe('validateApplianceType: plane membership (FR-019)', () => {
  it('requires at least one plane', () => {
    const result = validateApplianceType(draft({ planes: [] }));
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.field === 'planes')).toBe(true);
  });

  it('rejects a plane outside the known five', () => {
    expect(validateApplianceType(draft({ planes: ['physical', 'astral'] })).valid).toBe(false);
  });

  it('accepts every known plane', () => {
    for (const plane of KNOWN_PLANES) {
      expect(validateApplianceType(draft({ planes: [plane] })).valid, plane).toBe(true);
    }
  });
});

describe('validateApplianceType: portless types (FR-020)', () => {
  it('flags a draft with no ports as portless, needing confirmation', () => {
    const result = validateApplianceType(draft({ specifications: { ports: {} } }));
    expect(result.valid).toBe(false);
    expect(result.portless).toBe(true);
    expect(result.errors.some((e) => e.code === 'NO_PORTS_CONFIRM')).toBe(true);
  });

  it('treats absent specifications as portless too', () => {
    expect(validateApplianceType(draft({ specifications: undefined })).portless).toBe(true);
  });

  it('accepts a portless draft once confirmed', () => {
    const result = validateApplianceType(
      draft({ specifications: { ports: {} }, confirmedNoPorts: true }));
    expect(result).toEqual({ valid: true, errors: [], portless: true });
  });

  it('does not demand confirmation when ports exist', () => {
    expect(validateApplianceType(draft()).portless).toBe(false);
  });
});

describe('validateApplianceType: port layout (FR-021, FR-024)', () => {
  it('accepts all seventeen known port kinds', () => {
    // confirmedNoPorts isolates kind-acceptance from portlessness: a type
    // whose only group is module slots has zero connectable ports, and
    // demanding confirmation for it is FR-020 behaving correctly.
    for (const kind of KNOWN_PORT_KINDS) {
      const result = validateApplianceType(
        draft({ specifications: { ports: { [kind]: { count: 1 } } }, confirmedNoPorts: true }));
      expect(result.valid, kind).toBe(true);
    }
  });

  it('treats a slots-only layout as portless, since slots do not connect', () => {
    const result = validateApplianceType(
      draft({ specifications: { ports: { slots: { count: 4 } } } }));
    expect(result.portless).toBe(true);
    expect(result.errors.some((e) => e.code === 'NO_PORTS_CONFIRM')).toBe(true);
  });

  it('rejects an unknown port kind by name', () => {
    const result = validateApplianceType(
      draft({ specifications: { ports: { thunderbolt: { count: 2 } } } }));
    expect(result.valid).toBe(false);
    expect(result.errors[0].message).toContain('thunderbolt');
  });

  it('rejects a negative or fractional count', () => {
    expect(validateApplianceType(
      draft({ specifications: { ports: { ethernet: { count: -1 } } } })).valid).toBe(false);
    expect(validateApplianceType(
      draft({ specifications: { ports: { ethernet: { count: 2.5 } } } })).valid).toBe(false);
  });

  it('accepts a layout at exactly the limit', () => {
    expect(validateApplianceType(
      draft({ specifications: { ports: { ethernet: { count: PORT_LIMIT } } } })).valid).toBe(true);
  });

  it('rejects a layout one over the limit, and states the limit (FR-024)', () => {
    const result = validateApplianceType(
      draft({ specifications: { ports: { ethernet: { count: PORT_LIMIT + 1 } } } }));
    expect(result.valid).toBe(false);
    const err = result.errors.find((e) => e.code === 'PORT_LIMIT_EXCEEDED');
    expect(err.message).toContain(String(PORT_LIMIT));
  });

  it('applies the limit to the total across groups, not per group', () => {
    const half = Math.ceil(PORT_LIMIT / 2) + 1;
    const result = validateApplianceType(
      draft({ specifications: { ports: {
        ethernet: { count: half }, sfpPlus: { count: half } } } }));
    expect(result.errors.some((e) => e.code === 'PORT_LIMIT_EXCEEDED')).toBe(true);
  });

  it('excludes module slots from the connectable total', () => {
    const result = validateApplianceType(
      draft({ specifications: { ports: {
        ethernet: { count: PORT_LIMIT }, slots: { count: 4 } } } }));
    expect(result.valid).toBe(true);
  });
});
