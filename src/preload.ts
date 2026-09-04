// The context bridge: the renderer's only route to the main process. Exposes
// the library surface from specs/002-hardware-library/contracts/preload-bridge.md
// and the plans surface from specs/003-project-files/contracts/plans-bridge.md.
// No paths, no handles, no Node APIs cross this line.
import { contextBridge, ipcRenderer } from 'electron';

const library = {
  list: (filters?: unknown) => ipcRenderer.invoke('library:list', filters),
  get: (id: string) => ipcRenderer.invoke('library:get', id),
  create: (draft: unknown) => ipcRenderer.invoke('library:create', draft),
  update: (id: string, changes: unknown) => ipcRenderer.invoke('library:update', id, changes),
  remove: (id: string) => ipcRenderer.invoke('library:remove', id),
  restoreShipped: (id: string) => ipcRenderer.invoke('library:restoreShipped', id),
  markApproved: (id: string, approved: boolean) =>
    ipcRenderer.invoke('library:markApproved', id, approved),
  exportLibrary: (ids?: string[]) => ipcRenderer.invoke('library:export', ids),
  previewImport: () => ipcRenderer.invoke('library:previewImport'),
  importLibrary: (payload: unknown) => ipcRenderer.invoke('library:import', payload),
  importSymbols: () => ipcRenderer.invoke('library:importSymbols'),
};

// Only the methods main actually handles. The contract names more, and they
// appear here as their handlers are implemented: a bridge method that resolves
// to nothing is worse than an absent one, because the renderer cannot tell the
// difference between "not built yet" and "returned nothing".
const plans = {
  state: () => ipcRenderer.invoke('plans:state'),
  newPlan: () => ipcRenderer.invoke('plans:newPlan'),
  open: () => ipcRenderer.invoke('plans:open'),
  save: (document: unknown) => ipcRenderer.invoke('plans:save', document),
  saveAs: (document: unknown) => ipcRenderer.invoke('plans:saveAs', document),
  checkOldStorage: (payload: { raw: string | null; marker: string | null }) =>
    ipcRenderer.invoke('plans:checkOldStorage', payload),
  migrate: (payload: { raw: string | null; marker: string | null }) =>
    ipcRenderer.invoke('plans:migrate', payload),
  divergences: (document: unknown) => ipcRenderer.invoke('plans:divergences', document),
  applyUpdate: (payload: { document: unknown; typeId: string }) =>
    ipcRenderer.invoke('plans:applyUpdate', payload),
  broadApplyPreview: (typeId: string) => ipcRenderer.invoke('plans:broadApplyPreview', typeId),
  broadApply: (payload: { typeId: string; ids: string[] }) =>
    ipcRenderer.invoke('plans:broadApply', payload),
  adoptable: (document: unknown) => ipcRenderer.invoke('plans:adoptable', document),
  adopt: (payload: { document: unknown; typeIds: string[] }) =>
    ipcRenderer.invoke('plans:adopt', payload),
  listPreserved: () => ipcRenderer.invoke('plans:listPreserved'),
  clearPreserved: (kind: string) => ipcRenderer.invoke('plans:clearPreserved', kind),
  listRecents: () => ipcRenderer.invoke('plans:listRecents'),
  removeRecent: (id: string) => ipcRenderer.invoke('plans:removeRecent', id),
  openRecent: (id: string) => ipcRenderer.invoke('plans:openRecent', id),
  recoverySlot: () => ipcRenderer.invoke('plans:recoverySlot'),
  saveRecovery: (payload: { document: unknown; reason?: 'crash' | 'discarded' }) =>
    ipcRenderer.invoke('plans:saveRecovery', payload),
  clearRecovery: () => ipcRenderer.invoke('plans:clearRecovery'),
};

contextBridge.exposeInMainWorld('networkPlanner', { library, plans });

export type LibraryBridge = typeof library;
export type PlansBridge = typeof plans;
