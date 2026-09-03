// The hardware catalogue store. Every node:sqlite call in the application is
// confined to this file, deliberately: the module is experimental and a Node
// upgrade arrives with an Electron upgrade, so a breaking change should touch
// one file (research R1, ADR 0010). This module executes decisions; it does
// not make them. Anything that decides belongs in src/utils/ with a test.
import { DatabaseSync } from 'node:sqlite';
import { SCHEMA_STATEMENTS, SCHEMA_VERSION } from './schema';

export interface ApplianceTypeRow {
  id: string;
  name: string;
  manufacturer: string;
  model: string;
  category: string;
  description: string;
  planes: string[];
  icon: string;
  color: string;
  specifications: Record<string, unknown>;
  origin: 'shipped' | 'local';
  approved: boolean;
  editedFromShipped: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CategoryRow {
  id: string;
  label: string;
  color: string;
  subcategories: string[];
}

type SqlRow = Record<string, string | number | null>;

export class CatalogueStore {
  private db: DatabaseSync;

  constructor(dbPath: string) {
    this.db = new DatabaseSync(dbPath);
    // WAL keeps an interrupted write from damaging what was already on disk
    // (FR-027); the checkpoint on close folds the log back into the file.
    this.db.exec('PRAGMA journal_mode = WAL');
    this.db.exec('PRAGMA foreign_keys = ON');
    for (const statement of SCHEMA_STATEMENTS) this.db.exec(statement);
    this.db
      .prepare(`INSERT OR IGNORE INTO meta (key, value) VALUES ('schemaVersion', ?)`)
      .run(String(SCHEMA_VERSION));
  }

  schemaVersion(): number {
    const row = this.db
      .prepare(`SELECT value FROM meta WHERE key = 'schemaVersion'`)
      .get() as SqlRow;
    return Number(row.value);
  }

  countTypes(): number {
    const row = this.db
      .prepare('SELECT COUNT(*) AS n FROM appliance_types')
      .get() as SqlRow;
    return Number(row.n);
  }

  listTypes(): ApplianceTypeRow[] {
    const rows = this.db
      .prepare('SELECT * FROM appliance_types ORDER BY category, name')
      .all() as SqlRow[];
    return rows.map(rowToType);
  }

  getType(id: string): ApplianceTypeRow | null {
    const row = this.db
      .prepare('SELECT * FROM appliance_types WHERE id = ?')
      .get(id) as SqlRow | undefined;
    return row ? rowToType(row) : null;
  }

  listCategories(): CategoryRow[] {
    const rows = this.db
      .prepare('SELECT * FROM categories ORDER BY id')
      .all() as SqlRow[];
    return rows.map((r) => ({
      id: String(r.id),
      label: String(r.label),
      color: String(r.color),
      subcategories: JSON.parse(String(r.subcategories)) as string[],
    }));
  }

  // Used by the seed only; a single transaction so a half-seeded catalogue
  // cannot exist (FR-027).
  insertSeed(
    types: ReadonlyArray<Record<string, unknown>>,
    categories: Readonly<Record<string, { label: string; color: string; subcategories: string[] }>>,
  ): void {
    const now = new Date().toISOString();
    const insertType = this.db.prepare(
      `INSERT INTO appliance_types
         (id, name, manufacturer, model, category, description, planes, icon,
          color, specifications, origin, approved, edited_from_shipped,
          shipped_definition, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'shipped', 0, 0, ?, ?, ?)`,
    );
    const insertCategory = this.db.prepare(
      'INSERT INTO categories (id, label, color, subcategories) VALUES (?, ?, ?, ?)',
    );
    this.db.exec('BEGIN');
    try {
      for (const [id, c] of Object.entries(categories)) {
        insertCategory.run(id, c.label, c.color ?? '', JSON.stringify(c.subcategories ?? []));
      }
      for (const t of types) {
        const definition = JSON.stringify(t);
        insertType.run(
          String(t.id), String(t.name), String(t.manufacturer), String(t.model),
          String(t.category), String(t.description ?? ''),
          JSON.stringify(t.planes ?? []), String(t.icon ?? ''), String(t.color ?? ''),
          JSON.stringify(t.specifications ?? {}), definition, now, now,
        );
      }
      this.db.exec('COMMIT');
    } catch (err) {
      this.db.exec('ROLLBACK');
      throw err;
    }
  }

  createType(draft: Record<string, unknown>): ApplianceTypeRow {
    const now = new Date().toISOString();
    const id = typeof draft.id === 'string' && draft.id.trim() !== ''
      ? String(draft.id)
      : `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    this.db.prepare(
      `INSERT INTO appliance_types
         (id, name, manufacturer, model, category, description, planes, icon,
          color, specifications, origin, approved, edited_from_shipped,
          shipped_definition, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'local', 0, 0, NULL, ?, ?)`,
    ).run(
      id, String(draft.name), String(draft.manufacturer), String(draft.model),
      String(draft.category), String(draft.description ?? ''),
      JSON.stringify(draft.planes ?? []), String(draft.icon ?? ''),
      String(draft.color ?? ''), JSON.stringify(draft.specifications ?? {}),
      now, now,
    );
    return this.getType(id) as ApplianceTypeRow;
  }

  updateType(id: string, changes: Record<string, unknown>): ApplianceTypeRow | null {
    const existing = this.getType(id);
    if (!existing) return null;
    const next = { ...existing, ...changes };
    // Editing a shipped type marks it, and the original stays in
    // shipped_definition for FR-003; a later release changing the shipped
    // definition does not overwrite this row (FR-025 keeps the person's copy).
    const editedFromShipped = existing.origin === 'shipped' ? 1
      : existing.editedFromShipped ? 1 : 0;
    this.db.prepare(
      `UPDATE appliance_types SET
         name = ?, manufacturer = ?, model = ?, category = ?, description = ?,
         planes = ?, icon = ?, color = ?, specifications = ?,
         edited_from_shipped = ?, updated_at = ?
       WHERE id = ?`,
    ).run(
      String(next.name), String(next.manufacturer), String(next.model),
      String(next.category), String(next.description ?? ''),
      JSON.stringify(next.planes ?? []), String(next.icon ?? ''),
      String(next.color ?? ''), JSON.stringify(next.specifications ?? {}),
      editedFromShipped, new Date().toISOString(), id,
    );
    return this.getType(id);
  }

  // FR-004: a person may delete types they created. Shipped types are
  // restorable, not deletable.
  removeType(id: string): { removed: boolean; reason?: string } {
    const existing = this.getType(id);
    if (!existing) return { removed: false, reason: 'missing' };
    if (existing.origin === 'shipped') return { removed: false, reason: 'shipped' };
    this.db.prepare('DELETE FROM appliance_types WHERE id = ?').run(id);
    return { removed: true };
  }

  // FR-003: the original definition rides in shipped_definition from seeding.
  restoreShipped(id: string): ApplianceTypeRow | null {
    const row = this.db
      .prepare('SELECT shipped_definition FROM appliance_types WHERE id = ?')
      .get(id) as SqlRow | undefined;
    if (!row || row.shipped_definition == null) return null;
    const original = JSON.parse(String(row.shipped_definition)) as Record<string, unknown>;
    this.db.prepare(
      `UPDATE appliance_types SET
         name = ?, manufacturer = ?, model = ?, category = ?, description = ?,
         planes = ?, icon = ?, color = ?, specifications = ?,
         edited_from_shipped = 0, updated_at = ?
       WHERE id = ?`,
    ).run(
      String(original.name), String(original.manufacturer), String(original.model),
      String(original.category), String(original.description ?? ''),
      JSON.stringify(original.planes ?? []), String(original.icon ?? ''),
      String(original.color ?? ''), JSON.stringify(original.specifications ?? {}),
      new Date().toISOString(), id,
    );
    return this.getType(id);
  }

  // FR-028: the flag ships; enforcement is deferred pending research R4.
  markApproved(id: string, approved: boolean): ApplianceTypeRow | null {
    const existing = this.getType(id);
    if (!existing) return null;
    this.db.prepare(
      'UPDATE appliance_types SET approved = ?, updated_at = ? WHERE id = ?',
    ).run(approved ? 1 : 0, new Date().toISOString(), id);
    return this.getType(id);
  }

  // The import batch: adds and replacements in one transaction, so a failure
  // partway leaves the catalogue exactly as it was (FR-027). What to add and
  // replace was decided by the pure merge; this only executes it.
  applyImport(
    add: ReadonlyArray<Record<string, unknown>>,
    replace: ReadonlyArray<Record<string, unknown>>,
  ): void {
    const now = new Date().toISOString();
    const insert = this.db.prepare(
      `INSERT INTO appliance_types
         (id, name, manufacturer, model, category, description, planes, icon,
          color, specifications, origin, approved, edited_from_shipped,
          shipped_definition, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'local', 0, 0, NULL, ?, ?)`,
    );
    const update = this.db.prepare(
      `UPDATE appliance_types SET
         name = ?, manufacturer = ?, model = ?, category = ?, description = ?,
         planes = ?, icon = ?, color = ?, specifications = ?, updated_at = ?
       WHERE id = ?`,
    );
    this.db.exec('BEGIN');
    try {
      for (const t of add) {
        insert.run(
          String(t.id), String(t.name), String(t.manufacturer), String(t.model),
          String(t.category), String(t.description ?? ''),
          JSON.stringify(t.planes ?? []), String(t.icon ?? ''), String(t.color ?? ''),
          JSON.stringify(t.specifications ?? {}), now, now,
        );
      }
      for (const t of replace) {
        update.run(
          String(t.name), String(t.manufacturer), String(t.model), String(t.category),
          String(t.description ?? ''), JSON.stringify(t.planes ?? []),
          String(t.icon ?? ''), String(t.color ?? ''),
          JSON.stringify(t.specifications ?? {}), now, String(t.id),
        );
      }
      this.db.exec('COMMIT');
    } catch (err) {
      this.db.exec('ROLLBACK');
      throw err;
    }
  }

  countSymbolSets(): number {
    const row = this.db.prepare('SELECT COUNT(*) AS n FROM symbol_sets').get() as SqlRow;
    return Number(row.n);
  }

  listSymbolSets(): Array<{
    id: string; name: string; origin: string;
    symbols: Array<{ id: string; name: string; origin: string; content: string }>;
  }> {
    const sets = this.db.prepare('SELECT * FROM symbol_sets ORDER BY name').all() as SqlRow[];
    const bySet = this.db.prepare(
      'SELECT * FROM symbols WHERE set_id = ? ORDER BY name');
    return sets.map((set) => ({
      id: String(set.id), name: String(set.name), origin: String(set.origin),
      symbols: (bySet.all(String(set.id)) as SqlRow[]).map((r) => ({
        id: String(r.id), name: String(r.name), origin: String(r.origin),
        content: String(r.content),
      })),
    }));
  }

  // FR-016: the standard set, one entry per icon name the shipped types use.
  // Content is empty: shipped symbols draw through the built-in icon mapping,
  // and only imported symbols carry markup.
  seedStandardSymbols(iconNames: readonly string[]): void {
    this.db.exec('BEGIN');
    try {
      this.db.prepare(
        `INSERT INTO symbol_sets (id, name, origin) VALUES ('set-standard', 'Standard', 'shipped')`,
      ).run();
      const insert = this.db.prepare(
        `INSERT INTO symbols (id, set_id, name, content, origin)
         VALUES (?, 'set-standard', ?, '', 'shipped')`,
      );
      for (const name of iconNames) insert.run(`sym-std-${name}`, name);
      this.db.exec('COMMIT');
    } catch (err) {
      this.db.exec('ROLLBACK');
      throw err;
    }
  }

  importSymbolSet(
    name: string,
    symbols: ReadonlyArray<{ name: string; content: string }>,
  ): { setId: string; added: number } {
    const setId = `set-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    this.db.exec('BEGIN');
    try {
      this.db.prepare(
        `INSERT INTO symbol_sets (id, name, origin) VALUES (?, ?, 'imported')`,
      ).run(setId, name);
      const insert = this.db.prepare(
        `INSERT INTO symbols (id, set_id, name, content, origin)
         VALUES (?, ?, ?, ?, 'imported')`,
      );
      let n = 0;
      for (const sym of symbols) {
        insert.run(`sym-${setId}-${n++}`, setId, sym.name, sym.content);
      }
      this.db.exec('COMMIT');
      return { setId, added: symbols.length };
    } catch (err) {
      this.db.exec('ROLLBACK');
      throw err;
    }
  }

  close(): void {
    this.db.close();
  }
}

function rowToType(r: SqlRow): ApplianceTypeRow {
  return {
    id: String(r.id),
    name: String(r.name),
    manufacturer: String(r.manufacturer),
    model: String(r.model),
    category: String(r.category),
    description: String(r.description),
    planes: JSON.parse(String(r.planes)) as string[],
    icon: String(r.icon),
    color: String(r.color),
    specifications: JSON.parse(String(r.specifications)) as Record<string, unknown>,
    origin: r.origin === 'local' ? 'local' : 'shipped',
    approved: r.approved === 1,
    editedFromShipped: r.edited_from_shipped === 1,
    createdAt: String(r.created_at),
    updatedAt: String(r.updated_at),
  };
}
