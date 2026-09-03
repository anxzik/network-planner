// First-run seeding: the 131 shipped appliance types and 19 categories, from
// the transcription in src/utils/shippedTypes.json (T004, FR-022). Runs once,
// atomically; an already-populated catalogue is left exactly as it is.
import type { CatalogueStore } from './catalogueStore';
import catalogue from '../utils/shippedTypes.json';

export function seedIfEmpty(store: CatalogueStore): { seeded: boolean; count: number } {
  const seededTypes = store.countTypes() === 0;
  if (seededTypes) {
    store.insertSeed(
      catalogue.types,
      catalogue.categories as Record<string, { label: string; color: string; subcategories: string[] }>,
    );
  }
  // Checked separately from types so catalogues created before symbols existed
  // gain the standard set on next start without reseeding anything else.
  if (store.countSymbolSets() === 0) {
    const iconNames = [...new Set(catalogue.types.map((t) => t.icon).filter(Boolean))].sort();
    store.seedStandardSymbols(iconNames);
  }
  return { seeded: seededTypes, count: store.countTypes() };
}
