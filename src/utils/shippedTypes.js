// The 131 appliance types and 19 categories shipped with the application,
// transcribed from src/data/devices.js with viewType mapped onto plane
// membership (FR-019, FR-022). Generated data lives in shippedTypes.json;
// this module is the accessor the seed and the tests share.
import catalogue from './shippedTypes.json';

export const shippedCategories = catalogue.categories;
export const shippedTypes = catalogue.types;

export function shippedTypeById(id) {
  return shippedTypes.find((t) => t.id === id) || null;
}
