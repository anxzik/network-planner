// IPC handlers for the hardware library. Dialogs, paths and the store stay on
// this side of the boundary; the renderer sees only the envelope defined in
// specs/002-hardware-library/contracts/preload-bridge.md.
import { app, ipcMain } from 'electron';
import path from 'node:path';
import { CatalogueStore } from './catalogueStore';
// The same pure validation the renderer runs, run again here: the main process
// owns the data, so it cannot rely on the renderer having asked politely.
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore -- plain JS module, typed loosely on purpose
import { validateApplianceType } from '../utils/applianceValidation.js';
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
}

export function closeLibrary(): void {
  store?.close();
  store = null;
}
