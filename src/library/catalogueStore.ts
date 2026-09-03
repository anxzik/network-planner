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
