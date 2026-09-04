// Reading what the old browser storage holds, including when it no longer
// parses (FR-010, FR-012, FR-013). Pure: a raw string in, a classification and
// whatever could be recovered out. Nothing here writes anywhere — the renderer
// hands the raw content across and main decides what to do with the result.
//
// The raw string matters. storage.js's getRoot() swallows a parse failure and
// returns an empty root, so damaged storage looks *empty* to the running
// application. Migration must not inherit that blindness: an empty start and a
// corrupted one call for completely different things to be said to the person.

export const STORAGE_KEY = 'networkPlanner';
export const MIGRATION_MARKER_KEY = '__migration';

// How the old keys map onto a plan document.
const FIELDS = [
  ['nodes', 'appliances'],
  ['edges', 'connections'],
  ['vlans', 'vlans'],
  ['networkObjects', 'networkObjects'],
];

function emptyDocument() {
  return {
    appliances: [], connections: [], vlans: [], networkObjects: [],
    scratchpad: { notes: '', calculations: [] },
  };
}

function isEmptyDocument(document) {
  return FIELDS.every(([, to]) => document[to].length === 0)
    && document.scratchpad.notes === ''
    && document.scratchpad.calculations.length === 0;
}

function toDocument(root) {
  const document = emptyDocument();
  for (const [from, to] of FIELDS) {
    if (Array.isArray(root[from])) document[to] = root[from];
  }
  if (typeof root.scratchpad_notes === 'string') document.scratchpad.notes = root.scratchpad_notes;
  if (Array.isArray(root.scratchpad_calculations)) {
    document.scratchpad.calculations = root.scratchpad_calculations;
  }
  return document;
}

// Pull one key's value out of text that does not parse as a whole, by matching
// brackets from the value's opening one. A truncated tail is retried shorter
// and shorter until something parses, so a file cut off mid-write still yields
// the devices written before the cut.
function extractValue(text, key) {
  const at = text.indexOf(`"${key}"`);
  if (at === -1) return undefined;
  const colon = text.indexOf(':', at + key.length + 2);
  if (colon === -1) return undefined;

  let start = colon + 1;
  while (start < text.length && /\s/.test(text[start])) start += 1;
  const opener = text[start];

  if (opener === '"') {
    const slice = text.slice(start);
    const match = /^"(?:[^"\\]|\\.)*"/.exec(slice);
    if (!match) return undefined;
    try { return JSON.parse(match[0]); } catch { return undefined; }
  }
  if (opener !== '[' && opener !== '{') return undefined;

  const closer = opener === '[' ? ']' : '}';
  let depth = 0;
  let inString = false;
  let escaped = false;
  let end = -1;
  for (let i = start; i < text.length; i += 1) {
    const char = text[i];
    if (escaped) { escaped = false; continue; }
    if (char === '\\') { escaped = true; continue; }
    if (char === '"') { inString = !inString; continue; }
    if (inString) continue;
    if (char === opener) depth += 1;
    else if (char === closer) {
      depth -= 1;
      if (depth === 0) { end = i + 1; break; }
    }
  }

  if (end !== -1) {
    try { return JSON.parse(text.slice(start, end)); } catch { /* fall through to salvage */ }
  }

  // Unbalanced: the write was cut off. Recover the entries that completed by
  // closing the structure after the last complete element.
  if (opener !== '[') return undefined;
  const tail = text.slice(start);
  for (let cut = tail.length; cut > 1; cut -= 1) {
    if (tail[cut - 1] !== '}' && tail[cut - 1] !== ']') continue;
    try {
      const value = JSON.parse(`${tail.slice(0, cut)}]`);
      if (Array.isArray(value)) return value;
    } catch { /* keep shortening */ }
  }
  return undefined;
}

function salvage(text) {
  const root = {};
  const recovered = [];
  const lost = [];
  for (const key of ['nodes', 'edges', 'vlans', 'networkObjects', 'scratchpad_notes', 'scratchpad_calculations']) {
    const value = extractValue(text, key);
    if (value === undefined) {
      if (text.includes(`"${key}"`)) lost.push(key);
    } else {
      root[key] = value;
      recovered.push(key);
    }
  }
  return { root, recovered, lost };
}

function preview(document) {
  return {
    appliances: document.appliances.length,
    connections: document.connections.length,
    vlans: document.vlans.length,
    networkObjects: document.networkObjects.length,
    notes: document.scratchpad.notes.length,
    calculations: document.scratchpad.calculations.length,
  };
}

// `raw` is exactly what localStorage held, or null when the key was absent.
export function classifyOldStorage(raw) {
  if (raw === null || raw === undefined || raw === '') {
    // Nothing was ever stored. An ordinary empty start: no prompt, no warning,
    // no mention that migration exists (FR-013, SC-007).
    return { kind: 'none' };
  }
  if (typeof raw !== 'string') {
    return { kind: 'unreadable', message: 'The old storage could not be read.' };
  }

  let parsed = null;
  try {
    parsed = JSON.parse(raw);
  } catch { /* damaged: fall through to salvage */ }

  if (parsed !== null && typeof parsed === 'object' && !Array.isArray(parsed)) {
    const marker = parsed[MIGRATION_MARKER_KEY];
    if (marker && typeof marker === 'object') {
      // Already crossed. Say so plainly rather than offering the crossing again.
      return { kind: 'migrated', marker, document: toDocument(parsed), preview: preview(toDocument(parsed)) };
    }
    const document = toDocument(parsed);
    if (isEmptyDocument(document)) return { kind: 'none' };
    return { kind: 'intact', document, preview: preview(document) };
  }

  const { root, recovered, lost } = salvage(raw);
  const document = toDocument(root);
  if (recovered.length === 0 || isEmptyDocument(document)) {
    return {
      kind: 'unreadable',
      message: 'The old storage could not be read, and nothing could be recovered from it. '
        + 'It has been left exactly as it is.',
    };
  }
  return {
    kind: 'salvageable',
    document,
    preview: preview(document),
    recovered,
    lost,
    message: 'The old storage is damaged. This is what could be read from it. '
      + 'Whatever you choose, the original is kept untouched.',
  };
}

// The marker the renderer writes back once a migration has been accepted. Main
// asks for it; main never touches localStorage itself (R4).
export function migrationMarker(fileName, at) {
  return { [MIGRATION_MARKER_KEY]: { migratedTo: fileName, migratedAt: at } };
}
