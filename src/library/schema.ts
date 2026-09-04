// Catalogue schema for the hardware library (main process only).
// Every node:sqlite call in the application lives in catalogueStore.ts;
// this module only declares the shape it creates. See ADR 0010 and
// specs/002-hardware-library/data-model.md.

export const SCHEMA_VERSION = 1;

// One statement per table so a failure names its table.
export const SCHEMA_STATEMENTS: readonly string[] = [
  `CREATE TABLE IF NOT EXISTS meta (
     key   TEXT PRIMARY KEY,
     value TEXT NOT NULL
   ) STRICT`,

  // Appliance types, one row per kind of hardware (FR-001, FR-019, FR-028).
  // planes and specifications are JSON text: they are read whole, never
  // queried into, and their shape is owned by the pure modules in src/utils/.
  `CREATE TABLE IF NOT EXISTS appliance_types (
     id                 TEXT PRIMARY KEY,
     name               TEXT NOT NULL,
     manufacturer       TEXT NOT NULL,
     model              TEXT NOT NULL,
     category           TEXT NOT NULL,
     description        TEXT NOT NULL DEFAULT '',
     planes             TEXT NOT NULL,
     icon               TEXT NOT NULL DEFAULT '',
     color              TEXT NOT NULL DEFAULT '',
     specifications     TEXT NOT NULL DEFAULT '{}',
     origin             TEXT NOT NULL CHECK (origin IN ('shipped', 'local')),
     approved           INTEGER NOT NULL DEFAULT 0,
     edited_from_shipped INTEGER NOT NULL DEFAULT 0,
     shipped_definition TEXT,
     created_at         TEXT NOT NULL,
     updated_at         TEXT NOT NULL
   ) STRICT`,

  `CREATE INDEX IF NOT EXISTS idx_types_category ON appliance_types (category)`,
  `CREATE INDEX IF NOT EXISTS idx_types_manufacturer ON appliance_types (manufacturer)`,

  // Categories carry display metadata (label, colour, subcategories as JSON).
  `CREATE TABLE IF NOT EXISTS categories (
     id            TEXT PRIMARY KEY,
     label         TEXT NOT NULL,
     color         TEXT NOT NULL DEFAULT '',
     subcategories TEXT NOT NULL DEFAULT '[]'
   ) STRICT`,

  // Symbol sets and symbols (FR-014 to FR-016) arrive with US3; the tables
  // exist from the start so the schema version does not bump for them.
  `CREATE TABLE IF NOT EXISTS symbol_sets (
     id     TEXT PRIMARY KEY,
     name   TEXT NOT NULL,
     origin TEXT NOT NULL CHECK (origin IN ('shipped', 'imported'))
   ) STRICT`,

  `CREATE TABLE IF NOT EXISTS symbols (
     id      TEXT PRIMARY KEY,
     set_id  TEXT NOT NULL REFERENCES symbol_sets (id),
     name    TEXT NOT NULL,
     content TEXT NOT NULL,
     origin  TEXT NOT NULL CHECK (origin IN ('shipped', 'imported'))
   ) STRICT`,
];
