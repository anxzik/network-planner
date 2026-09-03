// The import merge (FR-009, FR-010, FR-011): pure from (incoming, existing,
// resolutions) to (add, replace, skipped, report). This being a pure function
// is what makes the import requirements testable at all - research R3's
// worked example, implemented.
import {validateApplianceType} from './applianceValidation';

export function detectCollisions(incoming, existing) {
  const byId = new Map(existing.map((t) => [t.id, t]));
  return incoming
    .filter((entry) => byId.has(entry.id))
    .map((entry) => ({ incoming: entry, existing: byId.get(entry.id) }));
}

function freshId(baseId, taken) {
  let candidate = `${baseId}-imported`;
  let n = 2;
  while (taken.has(candidate)) candidate = `${baseId}-imported-${n++}`;
  return candidate;
}

export function mergeImport(incoming, existing, resolutions) {
  const existingIds = new Set(existing.map((t) => t.id));
  const taken = new Set(existingIds);
  const add = [];
  const replace = [];
  const skipped = [];

  for (const entry of incoming) {
    // Imported portless entries need no interactive confirmation: shipping
    // logical and cloud entities in a library file is normal (FR-020 guards
    // the editor, not the interchange path).
    const verdict = validateApplianceType({ ...entry, confirmedNoPorts: true });
    if (!verdict.valid) {
      skipped.push({ id: entry.id ?? '(no id)', reason: verdict.errors.map((e) => e.message).join(' ') });
      continue;
    }

    if (!existingIds.has(entry.id)) {
      const id = taken.has(entry.id) ? freshId(entry.id, taken) : entry.id;
      taken.add(id);
      add.push(id === entry.id ? entry : { ...entry, id });
      continue;
    }

    const decision = resolutions[entry.id];
    if (decision === 'replace') {
      replace.push(entry);
    } else if (decision === 'keepBoth') {
      const id = freshId(entry.id, taken);
      taken.add(id);
      add.push({ ...entry, id });
    } else if (decision === 'skip') {
      skipped.push({ id: entry.id, reason: 'Skipped at your decision during the import.' });
    } else {
      // Guessing is the one thing a collision must never get (FR-009).
      skipped.push({ id: entry.id, reason: 'Collided with an existing type and no decision was given.' });
    }
  }

  return {
    add, replace, skipped,
    report: { added: add.length, replaced: replace.length, skipped: skipped.length },
  };
}
