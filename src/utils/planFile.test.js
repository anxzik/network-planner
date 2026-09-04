import {describe, expect, it} from 'vitest';
import {CURRENT_PLAN_FORMAT_VERSION, emptyPlanDocument, planSnapshot, readPlanFile, serialisePlan} from './planFile';

const plan = (extra = {}) => ({
  name: 'warehouse-b',
  appliances: [{ id: 'n1', type: 'switch-24', position: { x: 10, y: 20 } }],
  connections: [{ id: 'e1', source: 'n1', target: 'n2' }],
  vlans: [{ id: 10, name: 'voice' }],
  networkObjects: [{ id: 'o1', name: 'patch panel A', manual: true }],
  scratchpad: { notes: 'riser is on the north wall' },
  recordedDefinitions: { 'switch-24': { id: 'switch-24', name: 'Switch 24' } },
  declinedOffers: { 'switch-24': '2026-08-01T00:00:00Z' },
  ...extra,
});

describe('serialisePlan', () => {
  it('writes the format version first, so it can be read before the rest is trusted', () => {
    const text = serialisePlan(plan());
    expect(text.trimStart().startsWith(`{\n "formatVersion": "${CURRENT_PLAN_FORMAT_VERSION}"`)).toBe(true);
  });

  it('round-trips every part of a plan', () => {
    const source = plan();
    const result = readPlanFile(serialisePlan(source));
    expect(result.kind).toBe('current');
    expect(result.document.name).toBe('warehouse-b');
    expect(result.document.appliances).toEqual(source.appliances);
    expect(result.document.connections).toEqual(source.connections);
    expect(result.document.vlans).toEqual(source.vlans);
    expect(result.document.networkObjects).toEqual(source.networkObjects);
    expect(result.document.scratchpad).toEqual(source.scratchpad);
    expect(result.document.recordedDefinitions).toEqual(source.recordedDefinitions);
    expect(result.document.declinedOffers).toEqual(source.declinedOffers);
  });

  it('serialises an empty plan, which is a legitimate plan and not a damaged one', () => {
    const result = readPlanFile(serialisePlan());
    expect(result.kind).toBe('current');
    expect(result.document.appliances).toEqual([]);
    expect(result.document.name).toBe('');
  });

  it('records when it was saved', () => {
    const text = serialisePlan(plan({ savedAt: '2026-09-03T12:00:00Z' }));
    expect(readPlanFile(text).document.savedAt).toBe('2026-09-03T12:00:00Z');
  });

  it('is deterministic for the same input, so a plan is diffable in version control (FR-023)', () => {
    const source = plan({ savedAt: '2026-09-03T12:00:00Z' });
    expect(serialisePlan(source)).toBe(serialisePlan(source));
  });
});

describe('readPlanFile classification', () => {
  it('classifies the current version as current', () => {
    const result = readPlanFile(JSON.stringify({ formatVersion: CURRENT_PLAN_FORMAT_VERSION }));
    expect(result.kind).toBe('current');
    expect(result.message).toBeNull();
  });

  it('classifies a lower minor version as older', () => {
    const result = readPlanFile(JSON.stringify({ formatVersion: '0.9', name: 'old' }));
    expect(result.kind).toBe('older');
    expect(result.version).toBe('0.9');
    expect(result.document.name).toBe('old');
  });

  it('classifies a lower major version as older', () => {
    expect(readPlanFile(JSON.stringify({ formatVersion: '0.1' })).kind).toBe('older');
  });

  it('tells the person an older file will be brought forward and the original kept (FR-020)', () => {
    const result = readPlanFile(JSON.stringify({ formatVersion: '0.9' }));
    expect(result.message).toContain('0.9');
    expect(result.message).toContain('copy of the original');
  });

  it('classifies a higher version as newer', () => {
    const result = readPlanFile(JSON.stringify({ formatVersion: '99.0' }));
    expect(result.kind).toBe('newer');
    expect(result.version).toBe('99.0');
  });

  it('classifies a higher minor of the same major as newer', () => {
    expect(readPlanFile(JSON.stringify({ formatVersion: '1.1' })).kind).toBe('newer');
  });

  it('orders by major before minor, so 2.0 is newer than 1.9', () => {
    expect(readPlanFile(JSON.stringify({ formatVersion: '2.0' })).kind).toBe('newer');
    expect(readPlanFile(JSON.stringify({ formatVersion: '0.99' })).kind).toBe('older');
  });
});

describe('readPlanFile on a newer format (FR-021)', () => {
  it('still reads everything this version does understand', () => {
    const result = readPlanFile(JSON.stringify({
      formatVersion: '2.0', name: 'from the future', appliances: [{ id: 'n1' }],
    }));
    expect(result.document.name).toBe('from the future');
    expect(result.document.appliances).toEqual([{ id: 'n1' }]);
  });

  it('names the parts it does not understand rather than dropping them silently', () => {
    const result = readPlanFile(JSON.stringify({
      formatVersion: '2.0', name: 'x', rfPlane: {}, alarmZones: [],
    }));
    expect(result.notUnderstood).toEqual(['rfPlane', 'alarmZones']);
    expect(result.message).toContain('rfPlane');
    expect(result.message).toContain('alarmZones');
  });

  it('says so plainly when a newer file holds nothing it cannot read', () => {
    const result = readPlanFile(JSON.stringify({ formatVersion: '2.0', name: 'x' }));
    expect(result.notUnderstood).toEqual([]);
    expect(result.message).toContain('Everything it holds is shown');
  });

  it('says the plan is read-only, which is the state that requires never writing back', () => {
    const result = readPlanFile(JSON.stringify({ formatVersion: '2.0' }));
    expect(result.message).toContain('read-only');
  });
});

describe('readPlanFile on files it cannot read (FR-022)', () => {
  it('reports text that is not JSON', () => {
    const result = readPlanFile('this is not a plan');
    expect(result.kind).toBe('unreadable');
    expect(result.message).toContain('could not be read');
  });

  it('reports truncated JSON, the shape a failed save leaves behind', () => {
    expect(readPlanFile('{"formatVersion": "1.0", "appli').kind).toBe('unreadable');
  });

  it('reports JSON that is not an object', () => {
    expect(readPlanFile('[]').kind).toBe('unreadable');
    expect(readPlanFile('null').kind).toBe('unreadable');
    expect(readPlanFile('"a string"').kind).toBe('unreadable');
    expect(readPlanFile('42').kind).toBe('unreadable');
  });

  it('reports a plan declaring no format version', () => {
    const result = readPlanFile(JSON.stringify({ name: 'x', appliances: [] }));
    expect(result.kind).toBe('unreadable');
    expect(result.message).toContain('no format version');
  });

  it('refuses to guess at a version it cannot order itself against', () => {
    for (const formatVersion of ['1', 'one.zero', '1.0.0', '', 'v1.0', '1.x', null, 2]) {
      expect(readPlanFile(JSON.stringify({ formatVersion })).kind).toBe('unreadable');
    }
  });
});

describe('readPlanFile defaults', () => {
  it('defaults every collection when a file omits it', () => {
    const { document } = readPlanFile(JSON.stringify({ formatVersion: '1.0' }));
    expect(document.appliances).toEqual([]);
    expect(document.connections).toEqual([]);
    expect(document.vlans).toEqual([]);
    expect(document.networkObjects).toEqual([]);
    expect(document.scratchpad).toEqual({});
    expect(document.recordedDefinitions).toEqual({});
    expect(document.declinedOffers).toEqual({});
    expect(document.savedAt).toBeNull();
  });

  it('defaults a field of the wrong type rather than passing it through', () => {
    const { document } = readPlanFile(JSON.stringify({
      formatVersion: '1.0', appliances: 'not a list', scratchpad: [], name: 7,
    }));
    expect(document.appliances).toEqual([]);
    expect(document.scratchpad).toEqual({});
    expect(document.name).toBe('');
  });

  it('classifies identically however many times it reads the same text (FR-023)', () => {
    const text = JSON.stringify({ formatVersion: '0.9', name: 'x' });
    expect(readPlanFile(text)).toEqual(readPlanFile(text));
  });
});

describe('planSnapshot', () => {
  it('is equal for documents that differ only in window state', () => {
    const a = { appliances: [{ id: 'n1' }], selectedNode: 'n1', panelHeight: 300 };
    const b = { appliances: [{ id: 'n1' }], selectedNode: null, panelHeight: 120 };
    expect(planSnapshot(a)).toBe(planSnapshot(b));
  });

  it('differs when the plan itself changes', () => {
    expect(planSnapshot({ appliances: [{ id: 'n1' }] }))
      .not.toBe(planSnapshot({ appliances: [{ id: 'n2' }] }));
  });

  it('notices a change in any part that belongs to the plan', () => {
    const base = planSnapshot({});
    for (const change of [
      { appliances: [{ id: 'x' }] }, { connections: [{ id: 'e' }] },
      { vlans: [{ id: 1 }] }, { networkObjects: [{ id: 'o' }] },
      { scratchpad: { notes: 'hello' } },
    ]) {
      expect(planSnapshot(change)).not.toBe(base);
    }
  });

  it('treats an empty document and no document alike, so a new plan starts clean', () => {
    expect(planSnapshot()).toBe(planSnapshot(emptyPlanDocument()));
  });
});

describe('emptyPlanDocument', () => {
  it('serialises to a readable current-format plan', () => {
    expect(readPlanFile(serialisePlan(emptyPlanDocument())).kind).toBe('current');
  });

  it('is a fresh object each time, so callers cannot share and mutate one', () => {
    const first = emptyPlanDocument();
    first.appliances.push({ id: 'leak' });
    expect(emptyPlanDocument().appliances).toEqual([]);
  });
});
