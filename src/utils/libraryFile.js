// Reading and writing library interchange files (FR-006, FR-007, FR-012,
// FR-013, FR-013a). Pure: text in, classified entries out. The format version
// is the first key written so it can be read before anything else is trusted.

export const CURRENT_FORMAT_VERSION = '1.0';

export function serialiseLibrary({ applianceTypes = [], symbolSets = [], symbols = [] }) {
  return JSON.stringify(
    {
      formatVersion: CURRENT_FORMAT_VERSION,
      exportedAt: new Date().toISOString(),
      applianceTypes,
      symbolSets,
      symbols,
    },
    null,
    1,
  );
}

// A readable entry needs enough identity to exist in the catalogue at all.
// Full validation happens in the merge; this gate only decides readability.
function readableEntry(entry) {
  if (typeof entry !== 'object' || entry === null) {
    return { ok: false, reason: 'The entry is not an object.' };
  }
  for (const field of ['id', 'name', 'manufacturer', 'model', 'category']) {
    if (typeof entry[field] !== 'string' || entry[field] === '') {
      return { ok: false, reason: `The entry has no ${field}.` };
    }
  }
  return { ok: true };
}

function collectEntries(rawList) {
  const entries = [];
  const skipped = [];
  for (const raw of Array.isArray(rawList) ? rawList : []) {
    const check = readableEntry(raw);
    if (check.ok) entries.push(raw);
    else skipped.push({ id: typeof raw?.id === 'string' ? raw.id : '(no id)', reason: check.reason });
  }
  return { entries, skipped };
}

// The pre-feature shape: devices.js records, no formatVersion. Bringing it
// forward means the same viewType-to-planes mapping the seed transcription
// used (FR-013a).
function upgradeLegacy(devices) {
  return devices.map((d) => ({ ...d, planes: [d.viewType || 'physical'] }));
}

export function readLibraryFile(text) {
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    return { kind: 'unreadable', message: 'The file could not be read as a library file.' };
  }
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    return { kind: 'unreadable', message: 'The file could not be read as a library file: it does not have the shape of one.' };
  }

  if (parsed.formatVersion === CURRENT_FORMAT_VERSION) {
    const { entries, skipped } = collectEntries(parsed.applianceTypes);
    return { kind: 'current', entries, skipped, formatWarning: null,
      symbolSets: parsed.symbolSets ?? [], symbols: parsed.symbols ?? [] };
  }

  if (typeof parsed.formatVersion === 'string') {
    // A version this application does not know: import what is readable and
    // warn; never silently discard the file (FR-013).
    const { entries, skipped } = collectEntries(parsed.applianceTypes);
    return {
      kind: 'unknownVersion', entries, skipped,
      formatWarning:
        `This file was written in format ${parsed.formatVersion}, which this ` +
        'application does not fully understand. Readable entries were imported.',
      symbolSets: [], symbols: [],
    };
  }

  if (Array.isArray(parsed.devices)) {
    const { entries, skipped } = collectEntries(upgradeLegacy(parsed.devices));
    return { kind: 'legacy', entries, skipped, formatWarning: null, symbolSets: [], symbols: [] };
  }

  return { kind: 'unreadable', message: 'The file could not be read as a library file: it declares no format and matches no known shape.' };
}
