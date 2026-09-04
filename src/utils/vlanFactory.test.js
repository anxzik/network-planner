import {describe, expect, it} from 'vitest';
import {
  createVlan,
  formatVlanList,
  getDefaultVlan,
  isDefaultVlan,
  isReservedVlan,
  validateVlanId,
} from './vlanFactory';

describe('validateVlanId', () => {
  it('accepts an id inside the 1-4094 range', () => {
    expect(validateVlanId(10)).toEqual({valid: true, warning: null});
  });

  it('accepts the range boundaries', () => {
    expect(validateVlanId(1).valid).toBe(true);
    expect(validateVlanId(4094).valid).toBe(true);
  });

  it('rejects ids outside the range', () => {
    expect(validateVlanId(0)).toEqual({
      valid: false,
      error: 'VLAN ID must be between 1 and 4094',
    });
    expect(validateVlanId(4095).valid).toBe(false);
    expect(validateVlanId(-1).valid).toBe(false);
  });

  it('rejects values that are not numeric', () => {
    expect(validateVlanId('abc')).toEqual({
      valid: false,
      error: 'VLAN ID must be a number',
    });
    expect(validateVlanId(undefined).error).toBe('VLAN ID must be a number');
  });

  it('coerces numeric strings before validating', () => {
    expect(validateVlanId('10').valid).toBe(true);
  });

  it('treats null and empty string as 0, so they fail on range not type', () => {
    expect(validateVlanId(null).error).toBe('VLAN ID must be between 1 and 4094');
    expect(validateVlanId('').error).toBe('VLAN ID must be between 1 and 4094');
  });

  it('warns but still accepts the Token Ring / FDDI reserved block', () => {
    const result = validateVlanId(1002);
    expect(result.valid).toBe(true);
    expect(result.warning).toMatch(/reserved for Token Ring and FDDI/);
    expect(validateVlanId(1005).warning).toBeTruthy();
    expect(validateVlanId(1001).warning).toBeNull();
    expect(validateVlanId(1006).warning).toBeNull();
  });

  it('rejects an id that already exists', () => {
    const existing = [{vlanId: 10}, {vlanId: 20}];
    expect(validateVlanId(10, existing)).toEqual({
      valid: false,
      error: 'VLAN 10 already exists',
    });
    expect(validateVlanId(30, existing).valid).toBe(true);
  });

  it('matches duplicates after coercion, so "10" collides with 10', () => {
    expect(validateVlanId('10', [{vlanId: 10}]).valid).toBe(false);
  });

  it('reports the duplicate error rather than the reserved warning', () => {
    const result = validateVlanId(1002, [{vlanId: 1002}]);
    expect(result.valid).toBe(false);
    expect(result.warning).toBeUndefined();
  });
});

describe('createVlan', () => {
  it('builds a VLAN with a unique id and numeric vlanId', () => {
    const vlan = createVlan(10, 'Voice');
    expect(vlan.id).toMatch(/^vlan-\d+-[a-z0-9]+$/);
    expect(vlan.vlanId).toBe(10);
    expect(vlan.name).toBe('Voice');
  });

  it('coerces a string vlanId to a number', () => {
    expect(createVlan('20', 'Data').vlanId).toBe(20);
  });

  it('derives a name when none is given', () => {
    expect(createVlan(30).name).toBe('VLAN 30');
    expect(createVlan(30, '').name).toBe('VLAN 30');
  });

  it('assigns a colour from the palette by vlanId modulo 10', () => {
    expect(createVlan(1, 'a').color).toBe(createVlan(11, 'b').color);
    expect(createVlan(3, 'a').color).not.toBe(createVlan(4, 'b').color);
  });

  it('honours an explicit colour', () => {
    expect(createVlan(10, 'Voice', {color: '#ABCDEF'}).color).toBe('#ABCDEF');
  });

  it('defaults description to empty and subnet to null', () => {
    const vlan = createVlan(10, 'Voice');
    expect(vlan.description).toBe('');
    expect(vlan.subnet).toBeNull();
  });

  it('normalises a subnet, filling absent mask and gateway with empty strings', () => {
    const vlan = createVlan(10, 'Voice', {
      subnet: {network: '10.0.0.0', cidr: 24},
    });
    expect(vlan.subnet).toEqual({
      network: '10.0.0.0',
      cidr: 24,
      mask: '',
      gateway: '',
    });
  });

  it('stamps an ISO createdAt', () => {
    expect(() => new Date(createVlan(10, 'Voice').createdAt).toISOString()).not.toThrow();
  });

  it('produces distinct ids for successive calls', () => {
    const ids = new Set(Array.from({length: 50}, () => createVlan(10, 'x').id));
    expect(ids.size).toBe(50);
  });
});

describe('getDefaultVlan', () => {
  it('is VLAN 1, named Default, in grey', () => {
    const vlan = getDefaultVlan();
    expect(vlan.vlanId).toBe(1);
    expect(vlan.name).toBe('Default');
    expect(vlan.color).toBe('#94A3B8');
    expect(vlan.description).toBe('Default VLAN');
  });

  it('is recognised as the default VLAN', () => {
    expect(isDefaultVlan(getDefaultVlan())).toBe(true);
  });
});

describe('isDefaultVlan', () => {
  it('is true only for VLAN 1', () => {
    expect(isDefaultVlan({vlanId: 1})).toBe(true);
    expect(isDefaultVlan({vlanId: 2})).toBe(false);
  });
});

describe('isReservedVlan', () => {
  it('treats VLAN 1 as reserved', () => {
    expect(isReservedVlan(1)).toBe(true);
  });

  it('treats 1002-1005 as reserved', () => {
    expect(isReservedVlan(1002)).toBe(true);
    expect(isReservedVlan(1005)).toBe(true);
    expect(isReservedVlan(1001)).toBe(false);
    expect(isReservedVlan(1006)).toBe(false);
  });

  it('treats ordinary ids as unreserved', () => {
    expect(isReservedVlan(10)).toBe(false);
  });
});

describe('formatVlanList', () => {
  it('returns an empty string for no VLANs', () => {
    expect(formatVlanList([])).toBe('');
    expect(formatVlanList(null)).toBe('');
    expect(formatVlanList(undefined)).toBe('');
  });

  it('formats a single VLAN', () => {
    expect(formatVlanList([10])).toBe('10');
  });

  it('collapses a run of three or more into a range', () => {
    expect(formatVlanList([30, 31, 32])).toBe('30-32');
  });

  it('lists a run of exactly two as a pair, not a range', () => {
    expect(formatVlanList([30, 31])).toBe('30,31');
  });

  it('mixes singles, pairs and ranges', () => {
    expect(formatVlanList([10, 20, 30, 31, 32, 40])).toBe('10,20,30-32,40');
  });

  it('sorts numerically before formatting', () => {
    expect(formatVlanList([32, 10, 31, 30])).toBe('10,30-32');
  });

  it('does not mutate the input array', () => {
    const input = [30, 10, 20];
    formatVlanList(input);
    expect(input).toEqual([30, 10, 20]);
  });

  it('repeats duplicates rather than collapsing them', () => {
    expect(formatVlanList([10, 10])).toBe('10,10');
  });
});
