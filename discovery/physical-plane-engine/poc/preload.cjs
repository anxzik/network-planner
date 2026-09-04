// EXPERIMENTAL - PoC bridge only.
const { contextBridge, ipcRenderer } = require('electron');
contextBridge.exposeInMainWorld('poc', {
  capture: (name) => ipcRenderer.invoke('capture', name),
  done: (results) => ipcRenderer.invoke('done', results),
  fatal: (m) => ipcRenderer.invoke('fatal', m),
});
