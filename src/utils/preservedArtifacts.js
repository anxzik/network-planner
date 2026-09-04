// Naming and retention decisions for the copies the application keeps on a
// person's behalf (FR-024). Pure: no filesystem here — this module decides what
// a slot is called, whether an occurrence may take it, and whether a copy has
// become redundant. src/plans/planStore.ts executes those decisions.
//
// The rule the whole module serves: one predictably named slot per plan per
// kind. A folder must never fill with timestamped debris nobody asked for, and
// nothing is ever removed without the person's word.

export const ARTIFACT_KINDS = ['partial', 'upgradeOriginal', 'preapplyOriginal'];

// What each copy holds, in the words the person is shown. FR-008 requires
// telling them which file holds which content, so the sentence lives with the
// naming rather than being reinvented at each call site.
const KINDS = {
  partial: {
    suffix: () => '.partial',
    // A failed save's temp file: newer than the plan, possibly truncated.
    // Deliberately not `.bak` — that name means "the previous good copy" and
    // would invite restoring from exactly the wrong file.
    onOccupied: 'replace',
    description: 'What you were saving. Newer than the plan file, and possibly incomplete.',
  },
  upgradeOriginal: {
    suffix: (options) => `.${options.fromVersion}.original`,
    // The first copy is the true original; a later open would only preserve an
    // already-upgraded intermediate, so an occupied slot is left alone.
    onOccupied: 'leave',
    description: 'The plan as it was before it was brought forward to this format.',
  },
  preapplyOriginal: {
    suffix: () => '.preapply.original',
    // Each broad apply should be undoable from the state it changed, so the
    // most recent pre-apply copy is the useful one.
    onOccupied: 'replace',
    description: 'The plan as it was before the last library correction was applied.',
  },
};

function kindOf(kind) {
  const entry = KINDS[kind];
  if (!entry) throw new Error(`Unknown preserved artifact kind: ${kind}`);
  return entry;
}

// `planName` is the plan's file name, not a path — this module never sees or
// returns a location, only the name a slot takes beside its plan.
export function slotName(planName, kind, options = {}) {
  const entry = kindOf(kind);
  if (typeof planName !== 'string' || planName === '') {
    throw new Error('A preserved artifact needs the name of the plan it belongs to.');
  }
  if (kind === 'upgradeOriginal' && !options.fromVersion) {
    throw new Error('An upgrade original needs the version it was brought forward from.');
  }
  return `${planName}${entry.suffix(options)}`;
}

// Whether a new occurrence may take a slot that already holds a copy.
export function claimOccupiedSlot(kind) {
  return kindOf(kind).onOccupied;
}

export function describeArtifact(kind) {
  return kindOf(kind).description;
}

// Redundant means only that the person can now safely be *asked*. It never
// authorises removal: clearing is an explicit act (FR-024), so a caller that
// treats `true` as permission to delete has misread this module.
export function isRedundant(kind, state = {}) {
  switch (kind) {
    case 'partial':
      // The content it held has since been written whole.
      return state.savedSince === true;
    case 'upgradeOriginal':
      // The brought-forward plan has been saved whole at least once.
      return state.upgradedPlanSaved === true;
    case 'preapplyOriginal':
      // Only the person can say the applied correction looks right; there is no
      // signal the application can read for this, so it never assumes one.
      return state.verifiedByPerson === true;
    default:
      return kindOf(kind) && false;
  }
}

// What to show for a plan: every slot that exists, what it holds, and whether
// clearing may be offered. Input is what the caller found on disk.
export function describePreserved(found = []) {
  return found.map(({ kind, name, state }) => ({
    kind,
    name,
    description: describeArtifact(kind),
    redundant: isRedundant(kind, state),
  }));
}
