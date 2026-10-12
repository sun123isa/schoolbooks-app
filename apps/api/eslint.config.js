// Configuration ESLint du backend — responsable : Isaac LELO MAKAYA.
import js from '@eslint/js';
import globals from 'globals';
import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig([
  globalIgnores(['storage', 'uploads', 'coverage']),
  {
    files: ['**/*.js'],
    extends: [js.configs.recommended],
    languageOptions: {
      ecmaVersion: 'latest',
      sourceType: 'module',
      globals: globals.node
    },
    rules: {
      // Les paramètres non utilisés sont tolérés : signatures Express (req, res, next)
      // et squelettes dont les paramètres documentent le contrat à implémenter.
      'no-unused-vars': ['error', { args: 'none' }]
    }
  }
]);
