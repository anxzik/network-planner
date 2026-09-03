// IPC handlers for the hardware library. Dialogs, paths and the store stay on
// this side of the boundary; the renderer sees only the envelope defined in
// specs/002-hardware-library/contracts/preload-bridge.md.
import { app, ipcMain } from 'electron';
import path from 'node:path';
import { CatalogueStore } from './catalogueStore';
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
}

export function closeLibrary(): void {
  store?.close();
  store = null;
}
