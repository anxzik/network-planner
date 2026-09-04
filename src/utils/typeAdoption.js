// Taking the appliance types a plan carries into your own catalogue (FR-025).
// Pure: definitions in, decisions out. The offer follows opening and never
// gates it — a plan renders complete from its recorded definitions whether or
// not the person ever adopts anything (FR-015).

// A type already in the catalogue is skipped, never overwritten. Adoption adds
// what you do not have; it is not a route by which someone else's plan can
// quietly rewrite a definition you already rely on.
export function adoptable(recordedDefinitions = {}, catalogueById = {}) {
  const offered = [];
  const skipped = [];
  for (const [typeId, definition] of Object.entries(recordedDefinitions)) {
    if (!definition || typeof definition !== 'object') continue;
    if (typeId in catalogueById) {
      skipped.push({ typeId, name: definition.name ?? typeId, reason: 'already-present' });
    } else {
      offered.push({ typeId, name: definition.name ?? typeId, definition });
    }
  }
  return { offered, skipped };
}

// What an adopted definition becomes in the catalogue: a locally-created type,
// recording the plan it came from so its origin stays visible later.
export function asCatalogueRow(definition, planName, at) {
  return {
    ...definition,
    origin: 'local',
    approved: false,
    editedFromShipped: false,
    adoptedFromPlan: planName ?? null,
    createdAt: at,
    updatedAt: at,
  };
}

// Which of the offered types the person actually chose, resolved against the
// offer so a stale or invented id cannot introduce anything.
export function chosenRows(offer, typeIds = [], planName, at) {
  const wanted = new Set(typeIds);
  return offer.offered
    .filter((item) => wanted.has(item.typeId))
    .map((item) => asCatalogueRow(item.definition, planName, at));
}
