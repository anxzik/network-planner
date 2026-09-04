// IPC handlers for plan files. Dialogs, paths and file handles stay on this
// side of the boundary; the renderer sees only the envelope defined in
// specs/003-project-files/contracts/plans-bridge.md, and never a reusable path
// — recents cross as opaque ids.
import { app, dialog, ipcMain } from 'electron';
import fs from 'node:fs/promises';
import path from 'node:path';
import { PlanState, type RecentEntry, type RecoverySlot } from './recents';
import { catalogueById, catalogueStore } from './catalogueLookup';
import { preserveCopy, readPlan, releaseLock, savePlan, takeLock } from './planStore';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore -- plain JS module, typed loosely on purpose
import { readPlanFile, serialisePlan, upgradePlan } from '../utils/planFile.js';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore -- plain JS module, typed loosely on purpose
import { findByPath, forDisplay, recentId, recordOpen, removeEntry } from '../utils/recentsPrune.js';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore -- plain JS module, typed loosely on purpose
import { classifyOldStorage, migrationMarker } from '../utils/storageSalvage.js';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore -- plain JS module, typed loosely on purpose
import { applyUpdate, definitionsDiffer, offerable } from '../utils/planDivergence.js';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore -- plain JS module, typed loosely on purpose
import { adoptable, chosenRows } from '../utils/typeAdoption.js';

type Envelope<T> =
  | { ok: true; value: T }
  | { ok: false; error: { code: string; message: string } };

const ok = <T>(value: T): Envelope<T> => ({ ok: true, value });
const fail = (code: string, message: string): Envelope<never> => ({
  ok: false,
  error: { code, message },
});

let state: PlanState | null = null;

// What this window currently has open. The path lives here and never crosses
// the bridge; `readOnly` is the flag main enforces `save` against (R5).
interface OpenPlan {
  path: string;
  name: string;
  readOnly: boolean;
}
let openPlan: OpenPlan | null = null;

async function exists(target: string): Promise<boolean> {
  try {
    await fs.access(target);
    return true;
  } catch {
    return false;
  }
}

// Opening a file: read, classify, then decide what the renderer may do with it.
// Every branch here is a classification planFile.js already made; this function
// only turns those into a lock, a mode and a notice.
async function openAtPath(target: string): Promise<Envelope<unknown>> {
  const read = await readPlan(target);
  if (!read.ok) return fail('FILE_UNREADABLE', read.message);

  const classified = readPlanFile(read.text);
  if (classified.kind === 'unreadable') {
    // The file is left exactly as it is; nothing here writes to it (FR-022).
    return fail('FILE_UNREADABLE', classified.message ?? 'The plan could not be read.');
  }
  let document = classified.document;
  let upgradeNotice: string | null = null;

  if (classified.kind === 'older') {
    const fromVersion: string = classified.version ?? 'an older format';
    const upgraded = upgradePlan(classified.document, fromVersion);
    if (!upgraded.ok) {
      // A version this build has no path from is left alone and reported,
      // never opened as though it had been understood (FR-022).
      return fail('FILE_UNREADABLE', upgraded.message ?? 'This plan could not be brought forward.');
    }
    // The original is copied aside before the upgraded plan can be written
    // over it — one copy per plan, and an existing one is left alone because
    // it is the older and truer original (FR-020, FR-024).
    let keptAs: string | null = null;
    try {
      const kept = await preserveCopy(target, 'upgradeOriginal', { fromVersion });
      keptAs = kept.name;
    } catch {
      // If the original cannot be preserved, the upgrade does not happen:
      // FR-020's promise is the copy, not the convenience.
      return fail(
        'SAVE_FAILED',
        'This plan is in an older format, but a copy of the original could not be '
          + 'kept beside it, so it was not brought forward.',
      );
    }
    document = upgraded.document;
    upgradeNotice = `This plan was brought forward from format ${fromVersion}. `
      + `The original was kept as ${keptAs}.`;
  }

  // A second window on the same plan reads it but may not write it (R6).
  const lock = await takeLock(target);
  const lockedOut = !lock.held;
  // A newer format is read-only and never written back (FR-021).
  const readOnly = classified.kind === 'newer' || lockedOut;

  if (openPlan && openPlan.path !== target) await releaseLock(openPlan.path);
  const name = path.basename(target);
  openPlan = { path: target, name, readOnly };

  if (state) {
    const entries = await state.readRecents();
    await state.writeRecents(
      recordOpen(entries, { path: target, name, at: new Date().toISOString() }) as RecentEntry[],
    );
  }

  return ok({
    document,
    name,
    readOnly,
    notice: lockedOut
      ? 'This plan is open in another window, so it is read-only here.'
      : upgradeNotice ?? classified.message,
    notUnderstood: classified.notUnderstood ?? [],
  });
}

const PLAN_FILTERS = [{ name: 'Network plans', extensions: ['netplan'] }];

// Write a document to a path through the atomic path, then make it the open
// plan. Everything that can fail here is reported in an envelope; nothing
// throws across the bridge.
async function writeTo(target: string, document: Record<string, unknown>) {
  const text = serialisePlan({ ...document, name: path.basename(target, '.netplan') });
  const written = await savePlan(target, text as string);
  if (!written.ok) {
    // The plan's previous content is untouched and the interrupted write was
    // kept; the envelope names it so the person can be told (FR-008).
    return fail('SAVE_FAILED', written.message);
  }
  if (openPlan && openPlan.path !== target) await releaseLock(openPlan.path);
  const name = path.basename(target);
  const lock = await takeLock(target);
  openPlan = { path: target, name, readOnly: !lock.held };
  if (state) {
    const entries = await state.readRecents();
    await state.writeRecents(
      recordOpen(entries, { path: target, name, at: new Date().toISOString() }) as RecentEntry[],
    );
  }
  return ok({ name });
}

export function initPlans(): void {
  // Beside the catalogue database, not inside it (R3).
  state = new PlanState(app.getPath('userData'));

  // What main knows about the open plan. `dirty` is not here: it is derived in
  // the renderer by comparing the canvas against the document last written
  // (planSnapshot), and main has no view of unsaved edits. Recorded as a
  // deviation from contracts/plans-bridge.md.
  ipcMain.handle('plans:state', () => ok({
    name: openPlan ? openPlan.name : null,
    readOnly: openPlan ? openPlan.readOnly : false,
    source: openPlan ? 'file' : 'untitled',
  }));

  // Starting a new plan is main letting go of the old one. Whether there were
  // unsaved changes to prompt about is the renderer's question, asked before
  // this is called (FR-006).
  ipcMain.handle('plans:newPlan', async () => {
    if (openPlan) await releaseLock(openPlan.path);
    openPlan = null;
    return ok({ name: null, source: 'untitled' });
  });

  ipcMain.handle('plans:open', async () => {
    const picked = await dialog.showOpenDialog({
      title: 'Open a plan',
      filters: PLAN_FILTERS,
      properties: ['openFile'],
    });
    // Cancelling is an ordinary outcome, not a failure to report as one.
    if (picked.canceled || picked.filePaths.length === 0) {
      return fail('CANCELLED', 'No plan was opened.');
    }
    return openAtPath(picked.filePaths[0]);
  });

  ipcMain.handle('plans:save', async (_event, document: unknown) => {
    if (typeof document !== 'object' || document === null) {
      return fail('VALIDATION_FAILED', 'A save needs a plan to write.');
    }
    // Never write back to a plan opened read-only. Enforced here rather than
    // only in the UI, so a renderer bug cannot violate it (R5, FR-021).
    if (openPlan?.readOnly) {
      return fail(
        'LOCKED',
        'This plan is open read-only and is never written to. Use Save As to keep an editable copy.',
      );
    }
    // A plan that has never had a file needs somewhere to go.
    if (!openPlan) return saveAsFlow(document as Record<string, unknown>);
    return writeTo(openPlan.path, document as Record<string, unknown>);
  });

  ipcMain.handle('plans:saveAs', async (_event, document: unknown) => {
    if (typeof document !== 'object' || document === null) {
      return fail('VALIDATION_FAILED', 'A save needs a plan to write.');
    }
    return saveAsFlow(document as Record<string, unknown>);
  });

  // The migration crosses the boundary twice, and has to (R4). The old topology
  // lives in renderer localStorage, which main cannot read; plan files live on
  // disk, which the renderer must not write. So the renderer hands the raw
  // content across, main classifies and writes, and main asks the renderer to
  // set the marker. Neither side reaches into the other's territory.
  ipcMain.handle('plans:checkOldStorage', (_event, payload: unknown) => {
    const { raw, marker } = (payload ?? {}) as { raw?: unknown; marker?: unknown };
    const found = classifyOldStorage(
      typeof raw === 'string' ? raw : null,
      typeof marker === 'string' ? marker : null,
    );
    // 'none' is the answer for a first-time user, and it must reach them as
    // silence rather than as a notice saying nothing was found (FR-013).
    return ok({
      offer: found.kind,
      preview: found.preview ?? null,
      recovered: found.recovered ?? [],
      lost: found.lost ?? [],
      marker: found.marker ?? null,
      message: found.message ?? null,
    });
  });

  ipcMain.handle('plans:migrate', async (_event, payload: unknown) => {
    const { raw, marker } = (payload ?? {}) as { raw?: unknown; marker?: unknown };
    // Classified again here rather than trusting what the renderer decided:
    // main owns the data it is about to write.
    const found = classifyOldStorage(
      typeof raw === 'string' ? raw : null,
      typeof marker === 'string' ? marker : null,
    );
    if (found.kind === 'none' || found.kind === 'unreadable') {
      return fail('NOT_MIGRATED', found.message ?? 'There is nothing to migrate.');
    }

    const picked = await dialog.showSaveDialog({
      title: 'Save your existing plan as a file',
      defaultPath: 'my-plan.netplan',
      filters: PLAN_FILTERS,
    });
    // Declining leaves everything exactly as it was, including the old storage.
    if (picked.canceled || !picked.filePath) {
      return fail('CANCELLED', 'Nothing was migrated. Your existing plan is untouched.');
    }
    const target = picked.filePath.endsWith('.netplan') ? picked.filePath : `${picked.filePath}.netplan`;

    const written = await writeTo(target, found.document as Record<string, unknown>);
    if (!written.ok) return written;

    // The instruction, not the act: main never touches localStorage. The marker
    // goes in its own key so the old root is never rewritten (FR-011, FR-012).
    return ok({
      document: found.document,
      name: written.value.name,
      salvaged: found.kind === 'salvageable',
      recovered: found.recovered ?? [],
      lost: found.lost ?? [],
      marker: migrationMarker(written.value.name, new Date().toISOString()),
    });
  });

  // The same pure divergence maths the renderer runs, run again here against
  // the catalogue main owns — the renderer never sees the catalogue rows it
  // would need to decide this alone.
  ipcMain.handle('plans:divergences', (_event, document: unknown) => {
    if (typeof document !== 'object' || document === null) {
      return fail('VALIDATION_FAILED', 'A plan is needed to compare against.');
    }
    try {
      return ok({ divergences: offerable(document, catalogueById()) });
    } catch (err) {
      return fail('STORAGE_FAILED', `The catalogue could not be read: ${String(err)}`);
    }
  });

  ipcMain.handle('plans:applyUpdate', (_event, payload: unknown) => {
    const { document, typeId } = (payload ?? {}) as { document?: unknown; typeId?: unknown };
    if (typeof document !== 'object' || document === null || typeof typeId !== 'string') {
      return fail('VALIDATION_FAILED', 'An update needs a plan and a type.');
    }
    const current = catalogueById()[typeId];
    if (!current) return fail('VALIDATION_FAILED', 'That type is no longer in the catalogue.');
    return ok({ document: applyUpdate(document, typeId, current) });
  });

  // A correction can be carried to the plans the application knows about, and
  // that reach is the recent list and nothing else (R7). The application never
  // scans a disk looking for plans: what a person has opened is what it knows.
  ipcMain.handle('plans:broadApplyPreview', async (_event, typeId: unknown) => {
    if (!state) return fail('STORAGE_FAILED', 'Plan state is not open.');
    if (typeof typeId !== 'string') return fail('VALIDATION_FAILED', 'A type is needed.');
    const current = catalogueById()[typeId];
    if (!current) return fail('VALIDATION_FAILED', 'That type is no longer in the catalogue.');

    const reachable: { id: string; name: string; changed: string[] }[] = [];
    const unreachable: { name: string; reason: string }[] = [];

    for (const entry of await state.readRecents()) {
      const read = await readPlan(entry.path);
      if (!read.ok) {
        unreachable.push({ name: entry.name, reason: 'The file could not be read.' });
        continue;
      }
      const classified = readPlanFile(read.text);
      if (classified.kind === 'unreadable' || classified.kind === 'newer') {
        unreachable.push({
          name: entry.name,
          reason: classified.kind === 'newer'
            ? 'Written in a newer format, and never written back to.'
            : 'The file could not be read as a plan.',
        });
        continue;
      }
      const planCopy = classified.document?.recordedDefinitions?.[typeId];
      // A plan that does not place this type is not unreachable; it simply has
      // nothing to change, and listing it would be noise.
      if (!planCopy || !definitionsDiffer(planCopy, current)) continue;
      reachable.push({ id: recentId(entry.path), name: entry.name, changed: [] });
    }
    return ok({ reachable, unreachable });
  });

  ipcMain.handle('plans:broadApply', async (_event, payload: unknown) => {
    if (!state) return fail('STORAGE_FAILED', 'Plan state is not open.');
    const { typeId, ids } = (payload ?? {}) as { typeId?: unknown; ids?: unknown };
    if (typeof typeId !== 'string' || !Array.isArray(ids)) {
      return fail('VALIDATION_FAILED', 'A type and the plans to change are needed.');
    }
    const current = catalogueById()[typeId];
    if (!current) return fail('VALIDATION_FAILED', 'That type is no longer in the catalogue.');

    const results: { name: string; ok: boolean; reason?: string }[] = [];
    for (const entry of await state.readRecents()) {
      if (!ids.includes(recentId(entry.path))) continue;
      const read = await readPlan(entry.path);
      if (!read.ok) {
        results.push({ name: entry.name, ok: false, reason: 'The file could not be read.' });
        continue;
      }
      const classified = readPlanFile(read.text);
      if (classified.kind !== 'current' && classified.kind !== 'older') {
        results.push({ name: entry.name, ok: false, reason: 'The file is not one this version writes to.' });
        continue;
      }
      // The same original-kept discipline an upgrade uses (FR-020, FR-024):
      // a copy goes aside before the plan is changed.
      try {
        await preserveCopy(entry.path, 'preapplyOriginal');
      } catch {
        results.push({ name: entry.name, ok: false, reason: 'A copy could not be kept, so nothing was changed.' });
        continue;
      }
      const updated = applyUpdate(classified.document, typeId, current);
      const written = await savePlan(entry.path, serialisePlan(updated) as string);
      results.push(written.ok
        ? { name: entry.name, ok: true }
        : { name: entry.name, ok: false, reason: written.message });
    }
    return ok({ results });
  });

  // What of this plan's equipment your catalogue does not have (FR-025). The
  // offer follows opening and never gates it: the plan already renders.
  ipcMain.handle('plans:adoptable', (_event, document: unknown) => {
    if (typeof document !== 'object' || document === null) {
      return fail('VALIDATION_FAILED', 'A plan is needed.');
    }
    const recorded = (document as { recordedDefinitions?: unknown }).recordedDefinitions ?? {};
    return ok(adoptable(recorded, catalogueById()));
  });

  ipcMain.handle('plans:adopt', (_event, payload: unknown) => {
    const { document, typeIds } = (payload ?? {}) as { document?: unknown; typeIds?: unknown };
    if (typeof document !== 'object' || document === null || !Array.isArray(typeIds)) {
      return fail('VALIDATION_FAILED', 'A plan and the types to adopt are needed.');
    }
    const store = catalogueStore();
    if (!store) return fail('STORAGE_FAILED', 'The catalogue is not open.');

    const recorded = (document as { recordedDefinitions?: unknown }).recordedDefinitions ?? {};
    const offer = adoptable(recorded, catalogueById());
    const rows = chosenRows(offer, typeIds, openPlan ? openPlan.name : null, new Date().toISOString());

    const adopted: string[] = [];
    const failed: { typeId: string; reason: string }[] = [];
    for (const row of rows) {
      try {
        store.createType(row);
        adopted.push(row.id);
      } catch (err) {
        failed.push({ typeId: row.id, reason: String(err) });
      }
    }
    // The plan itself is untouched: adoption adds catalogue rows and nothing
    // else, so the document that came in is the document still open.
    return ok({ adopted, skipped: offer.skipped, failed });
  });

  ipcMain.handle('plans:listRecents', async () => {
    if (!state) return fail('STORAGE_FAILED', 'Plan state is not open.');
    const entries = await state.readRecents();
    const existsByPath: Record<string, boolean> = {};
    for (const entry of entries) existsByPath[entry.path] = await exists(entry.path);
    // A vanished file is marked, never dropped (FR-007).
    return ok({ recents: forDisplay(entries, existsByPath) });
  });

  ipcMain.handle('plans:removeRecent', async (_event, id: unknown) => {
    if (!state) return fail('STORAGE_FAILED', 'Plan state is not open.');
    if (typeof id !== 'string') return fail('VALIDATION_FAILED', 'A recent entry needs an id.');
    const entries = await state.readRecents();
    await state.writeRecents(removeEntry(entries, id) as RecentEntry[]);
    return ok({ removed: true });
  });

  ipcMain.handle('plans:openRecent', async (_event, id: unknown) => {
    if (!state) return fail('STORAGE_FAILED', 'Plan state is not open.');
    if (typeof id !== 'string') return fail('VALIDATION_FAILED', 'A recent entry needs an id.');
    const entry = findByPath(await state.readRecents(), id);
    if (!entry) return fail('FILE_UNREADABLE', 'That plan is no longer in the recent list.');
    return openAtPath(entry.path);
  });

  ipcMain.handle('plans:recoverySlot', async () => {
    if (!state) return fail('STORAGE_FAILED', 'Plan state is not open.');
    const slot = await state.readRecoverySlot();
    // The slot names no path to the renderer, only whether it had a home.
    return ok(
      slot
        ? {
            document: slot.document,
            capturedAt: slot.capturedAt,
            reason: slot.reason,
            name: slot.sourcePath ? path.basename(slot.sourcePath) : null,
          }
        : null,
    );
  });

  ipcMain.handle('plans:saveRecovery', async (_event, payload: unknown) => {
    if (!state) return fail('STORAGE_FAILED', 'Plan state is not open.');
    if (typeof payload !== 'object' || payload === null) {
      return fail('VALIDATION_FAILED', 'A recovery capture needs a document.');
    }
    const { document, reason } = payload as { document?: unknown; reason?: unknown };
    if (typeof document !== 'object' || document === null) {
      return fail('VALIDATION_FAILED', 'A recovery capture needs a document.');
    }
    const slot: RecoverySlot = {
      document: document as Record<string, unknown>,
      sourcePath: openPlan ? openPlan.path : null,
      capturedAt: new Date().toISOString(),
      reason: reason === 'discarded' ? 'discarded' : 'crash',
    };
    await state.writeRecoverySlot(slot);
    return ok({ captured: true });
  });

  // Cleared by a successful save or by the person declining the restore offer
  // — never by a discard, which is what keeps Escape safe (FR-006a).
  ipcMain.handle('plans:clearRecovery', async () => {
    if (!state) return fail('STORAGE_FAILED', 'Plan state is not open.');
    await state.clearRecoverySlot();
    return ok({ cleared: true });
  });
}

// Save As is its own flow because it is also the only exit from a read-only
// plan (FR-021): the result is always a new file, and it becomes the open one.
async function saveAsFlow(document: Record<string, unknown>) {
  const picked = await dialog.showSaveDialog({
    title: 'Save the plan',
    defaultPath: openPlan ? openPlan.name : 'untitled.netplan',
    filters: PLAN_FILTERS,
  });
  if (picked.canceled || !picked.filePath) return fail('CANCELLED', 'The plan was not saved.');
  const target = picked.filePath.endsWith('.netplan') ? picked.filePath : `${picked.filePath}.netplan`;
  return writeTo(target, document);
}

export async function closePlans(): Promise<void> {
  if (openPlan) {
    await releaseLock(openPlan.path);
    openPlan = null;
  }
  state = null;
}

// Used by the handlers this module gains later: save must refuse a plan opened
// read-only in main, not only in the UI (R5).
export function currentPlan(): OpenPlan | null {
  return openPlan;
}
