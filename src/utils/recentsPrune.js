// Decisions about the recent-plans list (FR-007). Pure: entries in, entries
// out. src/plans/recents.ts does the reading and writing; nothing here touches
// a filesystem or knows whether a file exists — the caller establishes that.
//
// The rule the module exists to hold: a recents entry is never removed on the
// application's initiative. A vanished file makes an entry *offerable* for
// removal; only the person makes it gone.

// The renderer must never receive a reusable path (Process Boundary), so an
// entry crosses as an opaque id. It is derived from the path rather than
// assigned, so it survives a restart without any id table to keep in step.
export function recentId(planPath) {
  let hash = 0x811c9dc5;
  for (let i = 0; i < planPath.length; i += 1) {
    hash ^= planPath.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return hash.toString(16).padStart(8, '0');
}

// Opening a plan moves it to the front. The same plan opened twice is one
// entry, not two: dedup is by path, since that is what identifies a plan.
export function recordOpen(entries, { path: planPath, name, at }) {
  if (typeof planPath !== 'string' || planPath === '') return entries;
  const rest = (entries ?? []).filter((entry) => entry.path !== planPath);
  return [{ path: planPath, name, lastOpened: at }, ...rest];
}

// A plan saved under a new name is the same entry moved, not a second one.
export function recordRename(entries, fromPath, { path: toPath, name, at }) {
  return recordOpen(
    (entries ?? []).filter((entry) => entry.path !== fromPath),
    { path: toPath, name, at },
  );
}

export function removeEntry(entries, id) {
  return (entries ?? []).filter((entry) => recentId(entry.path) !== id);
}

export function findByPath(entries, id) {
  return (entries ?? []).find((entry) => recentId(entry.path) === id) ?? null;
}

// What the renderer is shown: an opaque id, a display name, and whether the
// file is still there. `exists: false` is an invitation to remove, not a
// removal — the entry stays until the person says otherwise (FR-007).
export function forDisplay(entries, existsByPath = {}) {
  return (entries ?? []).map((entry) => ({
    id: recentId(entry.path),
    name: entry.name,
    lastOpened: entry.lastOpened,
    exists: existsByPath[entry.path] !== false,
  }));
}

// Deliberately absent: any function that drops entries by age or count. A cap
// would be a silent removal, which is the one thing FR-007 forbids, and the
// entries are a few dozen bytes each. If the list ever needs shortening, it is
// the person who shortens it.
