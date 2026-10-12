// Configuration Vitest du backend — responsable : Salem KONGOLO (tests des routes).
// Les tests tournent sans PostgreSQL (CI) : test/setup/base-fictive.js remplace
// les repositories par des versions en mémoire construites sur les données
// fictives du contrat. Les PDF servis viennent de test/fixtures/storage.
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    setupFiles: ['./test/setup/base-fictive.js'],
    env: {
      NODE_ENV: 'test',
      STORAGE_DIR: 'test/fixtures/storage'
    }
  }
});
