// First-run seeding: the 131 shipped appliance types and 19 categories, from
// the transcription in src/utils/shippedTypes.json (T004, FR-022). Runs once,
// atomically; an already-populated catalogue is left exactly as it is.
import type { CatalogueStore } from './catalogueStore';
import catalogue from '../utils/shippedTypes.json';

export function seedIfEmpty(store: CatalogueStore): { seeded: boolean; count: number } {
  if (store.countTypes() > 0) {
    return { seeded: false, count: store.countTypes() };
  }
  store.insertSeed(
    catalogue.types,
    catalogue.categories as Record<string, { label: string; color: string; subcategories: string[] }>,
  );
  return { seeded: true, count: store.countTypes() };
}
