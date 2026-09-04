import { defineConfig } from 'vite';

// https://vitejs.dev/config
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        // Every emitted file needs the .cjs extension, not just the entry.
        // package.json sets "type": "module", so a chunk left as .js would be
        // loaded as ESM inside a CommonJS bundle and fail at startup.
        entryFileNames: '[name].cjs',
        chunkFileNames: '[name].cjs',
      },
    },
  },
});
