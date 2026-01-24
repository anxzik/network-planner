import { defineConfig } from 'vite';

// https://vitejs.dev/config
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        // Use .cjs extension for CommonJS compatibility with "type": "module" in package.json
        entryFileNames: '[name].cjs',
      },
    },
  },
});
