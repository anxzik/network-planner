// What a plan records about the appliance types it places, and what to do when
// the catalogue's copy has since changed (FR-014 to FR-018, ADR 0011-0013).
// Pure: definitions in, decisions out. Nothing here writes a plan or a
// catalogue; the caller does that once the person has agreed.

// One full definition per distinct placed type, taken from the nodes
// themselves. A node carries the definition it was placed with, so this is
// literally "fixed at placement time" (ADR 0011) rather than a fresh look at
// today's catalogue.
export function collectRecordedDefinitions(nodes = []) {
  const recorded = {};
  for (const node of nodes) {
    const device = node?.data?.device;
    if (!device || typeof device.id !== 'string') continue;
    // First placement wins: two nodes of one type were placed from the same
    // definition, and if they somehow differ the earlier is the one the plan
    // has been built against.
    if (!(device.id in recorded)) recorded[device.id] = device;
  }
  return recorded;
}

// Which fields make two definitions meaningfully different. Timestamps and
// bookkeeping are excluded: a catalogue row touched by an unrelated edit must
// not present itself to the person as a correction worth applying.
const MEANINGFUL = [
  'name', 'manufacturer', 'model', 'category', 'description',
  'planes', 'icon', 'color', 'specifications',
];

function meaningfulPart(definition) {
  const part = {};
  for (const field of MEANINGFUL) {
    if (definition && field in definition) part[field] = definition[field];
  }
  return JSON.stringify(part);
}

export function definitionsDiffer(a, b) {
  if (!a || !b) return false;
  return meaningfulPart(a) !== meaningfulPart(b);
}

// Which fields actually changed, so the person can be told what they would be
// accepting rather than just that something did.
export function changedFields(recorded, current) {
  if (!recorded || !current) return [];
  return MEANINGFUL.filter(
    (field) => JSON.stringify(recorded[field]) !== JSON.stringify(current[field]),
  );
}

// A decline is remembered against the catalogue version it refused, so a later,
// genuinely different correction is a new question (FR-017). A boolean decline
// would silence the type forever and SC-005 would stop holding.
export function versionOf(definition) {
  return definition?.updatedAt ?? null;
}

export function findDivergences(document, catalogueById = {}) {
  const recorded = document?.recordedDefinitions ?? {};
  const declined = document?.declinedOffers ?? {};
  const divergences = [];

  for (const [typeId, planCopy] of Object.entries(recorded)) {
    const current = catalogueById[typeId];
    if (!current) continue; // Absent locally: the plan still renders (FR-015).
    if (!definitionsDiffer(planCopy, current)) continue;
    divergences.push({
      typeId,
      planCopy,
      current,
      changed: changedFields(planCopy, current),
      // Declined *this* version before? Then it is an answered question.
      offered: declined[typeId] !== versionOf(current),
    });
  }
  return divergences;
}

// Only the ones still worth asking about.
export function offerable(document, catalogueById = {}) {
  return findDivergences(document, catalogueById).filter((d) => d.offered);
}

// Accepting: the plan's copy becomes the catalogue's, and any decline recorded
// for that type is cleared — the question has been answered the other way.
export function applyUpdate(document, typeId, current) {
  if (!current) return document;
  const recordedDefinitions = { ...(document.recordedDefinitions ?? {}), [typeId]: current };
  const declinedOffers = { ...(document.declinedOffers ?? {}) };
  delete declinedOffers[typeId];
  // Placed nodes carry their own copy, and that copy is what renders, so it
  // must move with the record or the canvas would keep showing the old one.
  const appliances = (document.appliances ?? []).map((node) =>
    node?.data?.device?.id === typeId
      ? { ...node, data: { ...node.data, device: current } }
      : node,
  );
  return { ...document, recordedDefinitions, declinedOffers, appliances };
}

// Declining: remembered against the version refused, and nothing else changes.
export function declineUpdate(document, typeId, current) {
  return {
    ...document,
    declinedOffers: { ...(document.declinedOffers ?? {}), [typeId]: versionOf(current) },
  };
}
