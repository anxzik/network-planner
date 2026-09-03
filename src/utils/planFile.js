// Reading and writing plan files (FR-019, FR-022, FR-023). Pure: text in,
// classified document out. The format version is the first key written and the
// first thing read, so nothing else in the file is trusted before the shape it
// claims is known — the same discipline libraryFile.js established.

export const CURRENT_PLAN_FORMAT_VERSION = '1.0';

// Everything a plan file may hold. Anything outside this list in a file from a
// newer version is content this build does not understand, and FR-021 requires
// the person be told about it by name rather than have it silently dropped.
const KNOWN_FIELDS = [
  'formatVersion',
  'savedAt',
  'name',
  'appliances',
  'connections',
  'vlans',
  'scratchpad',
  'recordedDefinitions',
  'declinedOffers',
];

export function serialisePlan({
  name = '',
  appliances = [],
  connections = [],
  vlans = [],
  scratchpad = {},
  recordedDefinitions = {},
  declinedOffers = {},
  savedAt = new Date().toISOString(),
} = {}) {
  return JSON.stringify(
    {
      formatVersion: CURRENT_PLAN_FORMAT_VERSION,
      savedAt,
      name,
      appliances,
      connections,
      vlans,
      scratchpad,
      recordedDefinitions,
      declinedOffers,
    },
    null,
    1,
  );
}

// "1.0" -> { major: 1, minor: 0 }. Anything that is not two integers is not a
// version this application can order itself against, and a file it cannot place
// is unreadable rather than guessed at.
function parseVersion(value) {
  if (typeof value !== 'string') return null;
  const match = /^(\d+)\.(\d+)$/.exec(value);
  if (!match) return null;
  return { major: Number(match[1]), minor: Number(match[2]) };
}

function compareVersions(a, b) {
  if (a.major !== b.major) return a.major < b.major ? -1 : 1;
  if (a.minor !== b.minor) return a.minor < b.minor ? -1 : 1;
  return 0;
}

// Pull the known shape out of a parsed file, defaulting anything absent or of
// the wrong type. A plan with no appliances is a legitimate empty plan (FR-003),
// not a damaged file.
function readDocument(parsed) {
  const object = (value) =>
    typeof value === 'object' && value !== null && !Array.isArray(value) ? value : {};
  const list = (value) => (Array.isArray(value) ? value : []);
  return {
    name: typeof parsed.name === 'string' ? parsed.name : '',
    savedAt: typeof parsed.savedAt === 'string' ? parsed.savedAt : null,
    appliances: list(parsed.appliances),
    connections: list(parsed.connections),
    vlans: list(parsed.vlans),
    scratchpad: object(parsed.scratchpad),
    recordedDefinitions: object(parsed.recordedDefinitions),
    declinedOffers: object(parsed.declinedOffers),
  };
}

function unknownFields(parsed) {
  return Object.keys(parsed).filter((key) => !KNOWN_FIELDS.includes(key));
}

export function readPlanFile(text) {
  let parsed;
  try {
    parsed = JSON.parse(text);
  } catch {
    return { kind: 'unreadable', message: 'The file could not be read as a plan.' };
  }
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
    return {
      kind: 'unreadable',
      message: 'The file could not be read as a plan: it does not have the shape of one.',
    };
  }

  const version = parseVersion(parsed.formatVersion);
  if (!version) {
    return {
      kind: 'unreadable',
      message: 'The file could not be read as a plan: it declares no format version.',
    };
  }

  const current = parseVersion(CURRENT_PLAN_FORMAT_VERSION);
  const order = compareVersions(version, current);

  if (order === 0) {
    return {
      kind: 'current',
      version: parsed.formatVersion,
      document: readDocument(parsed),
      message: null,
    };
  }

  if (order < 0) {
    // Older: readable, and brought forward before use. The upgrade itself is a
    // separate concern; classification only says which one is needed.
    return {
      kind: 'older',
      version: parsed.formatVersion,
      document: readDocument(parsed),
      message:
        `This plan was written in format ${parsed.formatVersion}. It will be brought ` +
        `forward to ${CURRENT_PLAN_FORMAT_VERSION}, and a copy of the original kept.`,
    };
  }

  // Newer: read what this build understands, name what it does not, and never
  // write back (FR-021). Enforcement of that lives in the main process; this
  // module only reports the state that requires it.
  const notUnderstood = unknownFields(parsed);
  return {
    kind: 'newer',
    version: parsed.formatVersion,
    document: readDocument(parsed),
    notUnderstood,
    message:
      `This plan was written in format ${parsed.formatVersion}, which is newer than ` +
      `this version understands (${CURRENT_PLAN_FORMAT_VERSION}). It is open read-only` +
      (notUnderstood.length
        ? `, and ${notUnderstood.length === 1 ? 'this part is' : 'these parts are'} not ` +
          `shown: ${notUnderstood.join(', ')}.`
        : '. Everything it holds is shown.'),
  };
}
