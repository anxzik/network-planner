import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config
export default defineConfig({
  plugins: [react()],
  // Loopback IPv4, explicitly. Left alone, Vite binds ::1 only on this host
  // while electron-forge always tells Electron to load `http://localhost:<port>`
  // — it builds that URL from the port and discards the address Vite actually
  // bound (plugin-vite's vite.base.config.js). Chromium then resolves localhost
  // to 127.0.0.1, finds nothing, and the window fails with
  // ERR_CONNECTION_REFUSED. Pinning both ends to 127.0.0.1 removes the
  // resolver from the question, and keeps the dev server off the network —
  // binding :: would fix the load too, but by exposing it on every interface.
  server: { host: '127.0.0.1' },
});