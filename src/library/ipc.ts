// IPC handlers for the hardware library. Dialogs, paths and the store stay on
// this side of the boundary; the renderer sees only the envelope defined in
// specs/002-hardware-library/contracts/preload-bridge.md.
import { app, dialog, ipcMain } from 'electron';
import fs from 'node:fs';
import path from 'node:path';
import { CatalogueStore } from './catalogueStore';
// The same pure validation the renderer runs, run again here: the main process
// owns the data, so it cannot rely on the renderer having asked politely.
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore -- plain JS module, typed loosely on purpose
import { validateApplianceType } from '../utils/applianceValidation.js';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore -- plain JS module, typed loosely on purpose
import { readLibraryFile, serialiseLibrary } from '../utils/libraryFile.js';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore -- plain JS module, typed loosely on purpose
import { detectCollisions, mergeImport } from '../utils/importMerge.js';
import { seedIfEmpty } from './seed';

type Envelope<T> =
  | { ok: true; value: T }
  | { ok: false; error: { code: string; message: string } };

const ok = <T>(value: T): Envelope<T> => ({ ok: true, value });
const fail = (code: string, message: string): Envelope<never> => ({
  ok: false,
  error: { code, message },
});

let store: CatalogueStore | null = null;

export function initLibrary(): void {
  // The one decision the compatibility discovery said had to be made before
  // storage code was written: the database lives in the per-user data
  // directory, outside the read-only, integrity-checked asar archive.
  const dbPath = path.join(app.getPath('userData'), 'catalogue.db');
  store = new CatalogueStore(dbPath);
  const result = seedIfEmpty(store);
  console.log(
    `[library] catalogue at ${dbPath}: ${result.count} types` +
      (result.seeded ? ' (seeded on first run)' : ''),
  );

  ipcMain.handle('library:list', () => {
    if (!store) return fail('STORAGE_FAILED', 'The catalogue is not open.');
    try {
      return ok({ types: store.listTypes(), categories: store.listCategories() });
    } catch (err) {
      return fail('STORAGE_FAILED', `The catalogue could not be read: ${String(err)}`);
    }
  });

  ipcMain.handle('library:get', (_event, id: unknown) => {
    if (!store) return fail('STORAGE_FAILED', 'The catalogue is not open.');
    if (typeof id !== 'string') return fail('VALIDATION_FAILED', 'An appliance type id must be text.');
    const type = store.getType(id);
    return type ? ok(type) : fail('VALIDATION_FAILED', `No appliance type is named ${id}.`);
  });

  const validated = (draft: unknown):
    | { ok: true }
    | { ok: false; envelope: Envelope<never> } => {
    const verdict = validateApplianceType(draft as Record<string, unknown>) as {
      valid: boolean;
      errors: Array<{ code: string; message: string }>;
    };
    if (verdict.valid) return { ok: true };
    const first = verdict.errors[0];
    const code = verdict.errors.some((e) => e.code === 'PORT_LIMIT_EXCEEDED')
      ? 'PORT_LIMIT_EXCEEDED'
      : first.code === 'NO_PORTS_CONFIRM' ? 'NO_PORTS_CONFIRM' : 'VALIDATION_FAILED';
    return {
      ok: false,
      envelope: fail(code, verdict.errors.map((e) => e.message).join(' ')),
    };
  };

  ipcMain.handle('library:create', (_event, draft: unknown) => {
    if (!store) return fail('STORAGE_FAILED', 'The catalogue is not open.');
    const check = validated(draft);
    if (!check.ok) return check.envelope;
    try {
      return ok(store.createType(draft as Record<string, unknown>));
    } catch (err) {
      return fail('STORAGE_FAILED', `The type could not be saved: ${String(err)}`);
    }
  });

  ipcMain.handle('library:update', (_event, id: unknown, changes: unknown) => {
    if (!store) return fail('STORAGE_FAILED', 'The catalogue is not open.');
    if (typeof id !== 'string') return fail('VALIDATION_FAILED', 'An appliance type id must be text.');
    const existing = store.getType(id);
    if (!existing) return fail('VALIDATION_FAILED', `No appliance type is named ${id}.`);
    const merged = { ...existing, ...(changes as Record<string, unknown>), confirmedNoPorts: true };
    const check = validated(merged);
    if (!check.ok) return check.envelope;
    const updated = store.updateType(id, changes as Record<string, unknown>);
    return updated ? ok(updated) : fail('STORAGE_FAILED', 'The update did not apply.');
  });

  // Deletion of a type the current plan still places is refused in the
  // renderer, which owns the only topology that exists until plans become
  // files (ADR 0008, research R5); the main process enforces what it can see.
  ipcMain.handle('library:remove', (_event, id: unknown) => {
    if (!store) return fail('STORAGE_FAILED', 'The catalogue is not open.');
    if (typeof id !== 'string') return fail('VALIDATION_FAILED', 'An appliance type id must be text.');
    const result = store.removeType(id);
    if (result.removed) return ok({ removed: true });
    if (result.reason === 'shipped') {
      return fail('VALIDATION_FAILED',
        'Shipped types are restored, not deleted. Edit it, or restore the shipped definition.');
    }
    return fail('VALIDATION_FAILED', `No appliance type is named ${id}.`);
  });

  ipcMain.handle('library:restoreShipped', (_event, id: unknown) => {
    if (!store) return fail('STORAGE_FAILED', 'The catalogue is not open.');
    if (typeof id !== 'string') return fail('VALIDATION_FAILED', 'An appliance type id must be text.');
    const restored = store.restoreShipped(id);
    return restored
      ? ok(restored)
      : fail('VALIDATION_FAILED', 'Only a type that shipped with the application can be restored.');
  });

  ipcMain.handle('library:markApproved', (_event, id: unknown, approved: unknown) => {
    if (!store) return fail('STORAGE_FAILED', 'The catalogue is not open.');
    if (typeof id !== 'string') return fail('VALIDATION_FAILED', 'An appliance type id must be text.');
    const updated = store.markApproved(id, approved === true);
    return updated ? ok(updated) : fail('VALIDATION_FAILED', `No appliance type is named ${id}.`);
  });

  // FR-006, FR-007. The dialog, the path and the write all stay here. The
  // renderer learns the file's name and size, never a reusable path - the
  // contract's table promised { path } and its own constraints forbid it;
  // the constraint wins, recorded as a deviation in the commit.
  ipcMain.handle('library:export', async (_event, ids: unknown) => {
    if (!store) return fail('STORAGE_FAILED', 'The catalogue is not open.');
    const all = store.listTypes();
    const wanted = Array.isArray(ids) && ids.length > 0
      ? all.filter((t) => (ids as unknown[]).includes(t.id))
      : all;
    const picked = await dialog.showSaveDialog({
      title: 'Export the hardware library',
      defaultPath: 'hardware-library.json',
      filters: [{ name: 'Library files', extensions: ['json'] }],
    });
    if (picked.canceled || !picked.filePath) return fail('CANCELLED', 'Nothing was exported.');
    try {
      const text = serialiseLibrary({ applianceTypes: wanted as unknown as never[] }) as string;
      fs.writeFileSync(picked.filePath, text);
      return ok({
        fileName: picked.filePath.split(/[\\/]/).pop(),
        types: wanted.length,
        bytes: Buffer.byteLength(text),
      });
    } catch (err) {
      return fail('STORAGE_FAILED', `The export could not be written: ${String(err)}`);
    }
  });

  // FR-009: collisions are decided before anything is written. The parsed
  // entries travel to the renderer as data; the path does not.
  ipcMain.handle('library:previewImport', async () => {
    if (!store) return fail('STORAGE_FAILED', 'The catalogue is not open.');
    const picked = await dialog.showOpenDialog({
      title: 'Import a library file',
      properties: ['openFile'],
      filters: [{ name: 'Library files', extensions: ['json'] }],
    });
    if (picked.canceled || picked.filePaths.length === 0) {
      return fail('CANCELLED', 'Nothing was imported.');
    }
    let text: string;
    try {
      text = fs.readFileSync(picked.filePaths[0], 'utf8');
    } catch (err) {
      return fail('FILE_UNREADABLE', `The file could not be read: ${String(err)}`);
    }
    const parsed = readLibraryFile(text) as {
      kind: string; message?: string; formatWarning: string | null;
      entries: Array<Record<string, unknown>>; skipped: Array<{ id: string; reason: string }>;
    };
    if (parsed.kind === 'unreadable') return fail('FILE_UNREADABLE', parsed.message ?? 'Unreadable file.');
    const collisions = detectCollisions(parsed.entries, store.listTypes()) as Array<{
      incoming: Record<string, unknown>; existing: Record<string, unknown>;
    }>;
    return ok({
      entries: parsed.entries,
      collisions,
      unreadable: parsed.skipped,
      formatWarning: parsed.formatWarning,
    });
  });

  // FR-010, FR-011: the merge is pure and re-run here against the store's own
  // state; the batch write is atomic in applyImport.
  ipcMain.handle('library:import', (_event, payload: unknown) => {
    if (!store) return fail('STORAGE_FAILED', 'The catalogue is not open.');
    const { entries, resolutions, unreadable } = (payload ?? {}) as {
      entries?: Array<Record<string, unknown>>;
      resolutions?: Record<string, string>;
      unreadable?: Array<{ id: string; reason: string }>;
    };
    if (!Array.isArray(entries)) return fail('VALIDATION_FAILED', 'The import carried no entries.');
    const merged = mergeImport(entries, store.listTypes(), resolutions ?? {}) as {
      add: Array<Record<string, unknown>>; replace: Array<Record<string, unknown>>;
      skipped: Array<{ id: string; reason: string }>;
      report: { added: number; replaced: number; skipped: number };
    };
    try {
      store.applyImport(merged.add, merged.replace);
    } catch (err) {
      return fail('STORAGE_FAILED', `Nothing was applied: ${String(err)}`);
    }
    const skipped = [...(unreadable ?? []), ...merged.skipped];
    return ok({
      added: merged.add.map((t) => ({ id: t.id, name: t.name })),
      replaced: merged.replace.map((t) => ({ id: t.id, name: t.name })),
      skipped,
      report: { ...merged.report, skipped: skipped.length },
    });
  });
}

export function closeLibrary(): void {
  store?.close();
  store = null;
}
