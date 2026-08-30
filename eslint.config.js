import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import {defineConfig, globalIgnores} from 'eslint/config'

// The .ts entrypoints are type-checked by tsc (npm run typecheck) rather than
// linted here: typescript-eslint does not support TypeScript 7, whose package
// no longer exposes the JS compiler API it parses with.
export default defineConfig([
  globalIgnores(['dist', '.vite', 'out', 'networkplanner', 'dev-stuff']),

  // React renderer sources
  {
    files: ['src/**/*.{js,jsx}'],
    extends: [
      js.configs.recommended,
      reactHooks.configs.flat.recommended,
      reactRefresh.configs.vite,
    ],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
      parserOptions: {
        ecmaVersion: 'latest',
        ecmaFeatures: {jsx: true},
        sourceType: 'module',
      },
    },
    rules: {
      'no-unused-vars': ['error', {varsIgnorePattern: '^[A-Z_]'}],
    },
  },

  // Build and tooling config files run in Node
  {
    files: ['*.config.js', 'vitest.config.js'],
    extends: [js.configs.recommended],
    languageOptions: {globals: globals.node, parserOptions: {sourceType: 'module'}},
  },
])
