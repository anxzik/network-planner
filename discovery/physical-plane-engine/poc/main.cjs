// EXPERIMENTAL - disposable PoC harness. Not production code.
const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('node:path');
const fs = require('node:fs');

const evidenceDir = path.join(__dirname, 'evidence');
let win;
const hardStop = setTimeout(() => { console.error('POC TIMEOUT'); app.exit(2); }, 120000);

app.whenReady().then(() => {
  win = new BrowserWindow({
    width: 1200, height: 800, show: true,
    webPreferences: { nodeIntegration: false, contextIsolation: true,
      // PoC-only: file:// is an opaque origin, so ESM imports are CORS-blocked
      // without this. Never carry this flag into production code.
      webSecurity: false,
      preload: path.join(__dirname, 'preload.cjs') },
  });
  const consoleLog = fs.createWriteStream(path.join(evidenceDir, 'console.log'));
  win.webContents.on('console-message', (_e, level, message, line, source) => {
    consoleLog.write(`[${level}] ${message} (${source}:${line})\n`);
  });
  win.webContents.on('did-fail-load', (_e, code, desc) => {
    consoleLog.write(`DID-FAIL-LOAD ${code} ${desc}\n`);
  });
  win.loadFile(path.join(__dirname, 'index.html'));
});

ipcMain.handle('capture', async (_e, name) => {
  const img = await win.webContents.capturePage();
  const file = path.join(evidenceDir, `${name}.png`);
  fs.writeFileSync(file, img.toPNG());
  return { file, bytes: fs.statSync(file).size };
});

ipcMain.handle('done', async (_e, results) => {
  fs.writeFileSync(path.join(evidenceDir, 'results.json'), JSON.stringify(results, null, 2));
  clearTimeout(hardStop);
  setTimeout(() => app.exit(results.allPassed ? 0 : 1), 300);
  return true;
});

ipcMain.handle('fatal', async (_e, message) => {
  fs.writeFileSync(path.join(evidenceDir, 'results.json'),
    JSON.stringify({ fatal: message, allPassed: false }, null, 2));
  clearTimeout(hardStop);
  setTimeout(() => app.exit(3), 300);
  return true;
});
