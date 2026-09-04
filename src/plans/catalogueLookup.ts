// The catalogue's current definitions, as a lookup. Plans compare their
// recorded copies against this (FR-016); the library owns the rows, and this is
// only the shape the comparison wants them in.
import { currentStore } from '../library/ipc';

export function catalogueById(): Record<string, unknown> {
  const store = currentStore();
  if (!store) return {};
  const byId: Record<string, unknown> = {};
  for (const row of store.listTypes({})) byId[row.id] = row;
  return byId;
}
