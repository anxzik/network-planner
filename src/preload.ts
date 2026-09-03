// The context bridge: the renderer's only route to the main process. Exposes
// the library surface from specs/002-hardware-library/contracts/preload-bridge.md.
// No paths, no handles, no Node APIs cross this line.
import { contextBridge, ipcRenderer } from 'electron';

const library = {
  list: () => ipcRenderer.invoke('library:list'),
  get: (id: string) => ipcRenderer.invoke('library:get', id),
  create: (draft: unknown) => ipcRenderer.invoke('library:create', draft),
  update: (id: string, changes: unknown) => ipcRenderer.invoke('library:update', id, changes),
  remove: (id: string) => ipcRenderer.invoke('library:remove', id),
  restoreShipped: (id: string) => ipcRenderer.invoke('library:restoreShipped', id),
  markApproved: (id: string, approved: boolean) =>
    ipcRenderer.invoke('library:markApproved', id, approved),
};

contextBridge.exposeInMainWorld('networkPlanner', { library });

export type LibraryBridge = typeof library;
