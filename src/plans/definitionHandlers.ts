// Handlers for what a plan records about its appliance types: divergence from
// the catalogue, applying a correction here or across other plans, and adopting
// types a plan brought with it (FR-016 to FR-018, FR-025).
//
// Split from ipc.ts to keep that file under the project's 500-line limit. The
// session state these need — the open plan, the recents store, the envelope —
// is passed in rather than duplicated, so there is still one owner of each.
import { ipcMain } from 'electron';
import { preserveCopy, readPlan, savePlan } from './planStore';
import { catalogueById, catalogueStore } from './catalogueLookup';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore -- plain JS module, typed loosely on purpose
import { readPlanFile, serialisePlan } from '../utils/planFile.js';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore -- plain JS module, typed loosely on purpose
import { recentId } from '../utils/recentsPrune.js';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore -- plain JS module, typed loosely on purpose
import { applyUpdate, definitionsDiffer, offerable } from '../utils/planDivergence.js';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore -- plain JS module, typed loosely on purpose
import { adoptable, chosenRows } from '../utils/typeAdoption.js';

export interface DefinitionHandlerContext {
  ok: <T>(value: T) => unknown;
  fail: (code: string, message: string) => unknown;
  recents: () => { readRecents: () => Promise<{ path: string; name: string }[]> } | null;
  openPlanName: () => string | null;
}

export function registerDefinitionHandlers(context: DefinitionHandlerContext): void {
  const { ok, fail, recents, openPlanName } = context;

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
    const state = recents();
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
    const state = recents();
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
    const rows = chosenRows(offer, typeIds, openPlanName(), new Date().toISOString());

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
}
