import js from '@eslint/js';
import globals from 'globals';
import { defineConfig } from 'eslint/config';

export default defineConfig([
  {
    files: ['**/*.js'],
    extends: [js.configs.recommended],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      // Le contrat est importé à la fois par Node (API) et par le navigateur (web).
      globals: { ...globals.node, ...globals.browser }
    }
  }
]);
