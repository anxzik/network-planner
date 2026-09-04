import {describe, expect, it} from 'vitest';
import {
  ARTIFACT_KINDS, claimOccupiedSlot, describeArtifact, describePreserved, isRedundant, slotName,
} from './preservedArtifacts';

describe('slotName', () => {
  it('names a failed save partial as one slot beside the plan', () => {
    expect(slotName('warehouse-b.netplan', 'partial')).toBe('warehouse-b.netplan.partial');
  });

  it('never names a partial .bak, which would mean the previous good copy', () => {
    expect(slotName('a.netplan', 'partial')).not.toContain('.bak');
  });

  it('carries no timestamp, so a repeat failure cannot accumulate a second file', () => {
    expect(slotName('a.netplan', 'partial')).toBe(slotName('a.netplan', 'partial'));
  });

  it('names an upgrade original by the version it came from', () => {
    expect(slotName('a.netplan', 'upgradeOriginal', { fromVersion: '0.9' }))
      .toBe('a.netplan.0.9.original');
  });

  it('refuses to name an upgrade original without the version it came from', () => {
    expect(() => slotName('a.netplan', 'upgradeOriginal')).toThrow(/version/);
  });

  it('names a pre-apply original', () => {
    expect(slotName('a.netplan', 'preapplyOriginal')).toBe('a.netplan.preapply.original');
  });

  it('refuses an unknown kind rather than inventing a name', () => {
    expect(() => slotName('a.netplan', 'scratch')).toThrow(/Unknown preserved artifact kind/);
  });

  it('refuses to name a slot with no plan to belong to', () => {
    expect(() => slotName('', 'partial')).toThrow();
    expect(() => slotName(undefined, 'partial')).toThrow();
  });

  it('names a slot for every kind it declares', () => {
    for (const kind of ARTIFACT_KINDS) {
      expect(typeof slotName('a.netplan', kind, { fromVersion: '0.9' })).toBe('string');
    }
  });
});

describe('claimOccupiedSlot', () => {
  it('replaces a partial, so the newest failed write is the one kept', () => {
    expect(claimOccupiedSlot('partial')).toBe('replace');
  });

  it('leaves an upgrade original alone, because the first copy is the true original', () => {
    expect(claimOccupiedSlot('upgradeOriginal')).toBe('leave');
  });

  it('replaces a pre-apply original, so the copy matches the state last changed', () => {
    expect(claimOccupiedSlot('preapplyOriginal')).toBe('replace');
  });
});

describe('isRedundant', () => {
  it('is false by default for every kind, so nothing is offered for clearing unasked', () => {
    for (const kind of ARTIFACT_KINDS) expect(isRedundant(kind)).toBe(false);
  });

  it('marks a partial redundant once its content has been written whole', () => {
    expect(isRedundant('partial', { savedSince: true })).toBe(true);
    expect(isRedundant('partial', { savedSince: false })).toBe(false);
  });

  it('marks an upgrade original redundant once the upgraded plan is saved whole', () => {
    expect(isRedundant('upgradeOriginal', { upgradedPlanSaved: true })).toBe(true);
  });

  it('never decides a pre-apply original is redundant on its own', () => {
    expect(isRedundant('preapplyOriginal', { upgradedPlanSaved: true, savedSince: true })).toBe(false);
    expect(isRedundant('preapplyOriginal', { verifiedByPerson: true })).toBe(true);
  });

  it('treats only a literal true as the signal, never a truthy value', () => {
    expect(isRedundant('partial', { savedSince: 'yes' })).toBe(false);
    expect(isRedundant('partial', { savedSince: 1 })).toBe(false);
  });
});

describe('describeArtifact', () => {
  it('says a partial holds newer, possibly incomplete content (FR-008)', () => {
    const text = describeArtifact('partial');
    expect(text).toMatch(/newer/i);
    expect(text).toMatch(/incomplete/i);
  });

  it('describes every kind it declares', () => {
    for (const kind of ARTIFACT_KINDS) expect(describeArtifact(kind).length).toBeGreaterThan(0);
  });
});

describe('describePreserved', () => {
  it('reports what exists, what each holds, and whether clearing may be offered', () => {
    const listed = describePreserved([
      { kind: 'partial', name: 'a.netplan.partial', state: { savedSince: true } },
      { kind: 'upgradeOriginal', name: 'a.netplan.0.9.original', state: {} },
    ]);
    expect(listed).toEqual([
      { kind: 'partial', name: 'a.netplan.partial', redundant: true, description: describeArtifact('partial') },
      { kind: 'upgradeOriginal', name: 'a.netplan.0.9.original', redundant: false, description: describeArtifact('upgradeOriginal') },
    ]);
  });

  it('reports nothing when a plan has no preserved copies', () => {
    expect(describePreserved([])).toEqual([]);
    expect(describePreserved()).toEqual([]);
  });
});

describe('edge cases the spec names (T048)', () => {
  it('a plan saved over a path that already held a different plan keeps one partial slot', () => {
    // Overwriting is an ordinary save after the dialog's own confirmation; the
    // preserved-artifact rules do not change because the target was occupied.
    expect(slotName('other.netplan', 'partial')).toBe('other.netplan.partial');
    expect(claimOccupiedSlot('partial')).toBe('replace');
  });

  it('a plan whose file was renamed outside the application names slots from its new name', () => {
    // Slot names are derived from the plan's name, so a renamed file gets its
    // own slots rather than orphaning the old ones onto a path nothing uses.
    expect(slotName('renamed.netplan', 'preapplyOriginal')).toBe('renamed.netplan.preapply.original');
  });

  it('never claims a slot is redundant on a state it was not told about', () => {
    expect(isRedundant('upgradeOriginal', { savedSince: true })).toBe(false);
  });
});
