// IPC handlers for plan files. Dialogs, paths and file handles stay on this
// side of the boundary; the renderer sees only the envelope defined in
// specs/003-project-files/contracts/plans-bridge.md, and never a reusable path
// — recents cross as opaque ids.
import { app, dialog, ipcMain } from 'electron';
import fs from 'node:fs/promises';
import path from 'node:path';
import { PlanState, type RecentEntry, type RecoverySlot } from './recents';
import { readPlan, releaseLock, savePlan, takeLock } from './planStore';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore -- plain JS module, typed loosely on purpose
import { readPlanFile, serialisePlan } from '../utils/planFile.js';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore -- plain JS module, typed loosely on purpose
import { findByPath, forDisplay, recordOpen, removeEntry } from '../utils/recentsPrune.js';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore -- plain JS module, typed loosely on purpose
import { classifyOldStorage, migrationMarker } from '../utils/storageSalvage.js';

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
  if (classified.kind === 'older') {
    // Bringing a file forward is a separate step with its own copy-aside
    // obligation, so this build declines to open it rather than silently
    // showing content it has not upgraded.
    return fail(
      'FILE_UNREADABLE',
      classified.message ?? 'This plan was written in an older format.',
    );
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
    document: classified.document,
    name,
    readOnly,
    notice: lockedOut
      ? 'This plan is open in another window, so it is read-only here.'
      : classified.message,
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
