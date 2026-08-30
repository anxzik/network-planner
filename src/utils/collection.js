// CRUD over an array of id-bearing records.
//
// VLANs and network objects are stored and edited identically, so they share
// these rather than each carrying their own copy.

// Append a record.
export function addItem(items, item) {
  return [...items, item];
}

// Merge updates into the matching record, stamping the edit time.
export function updateItem(items, id, updates) {
  return items.map((item) =>
    item.id === id
      ? {...item, ...updates, updatedAt: new Date().toISOString()}
      : item
  );
}

// Drop the matching record.
export function removeItem(items, id) {
  return items.filter((item) => item.id !== id);
}

// Look up a record by id.
export function findById(items, id) {
  return items.find((item) => item.id === id);
}
