// =============================================================================
// @schoolbooks/shared — point d'entrée du contrat d'API
// Responsable : HIRWA Jean Baptiste (Lead Dev) — relecture : Salem KONGOLO
// Importé par apps/api (validation des entrées) et apps/web (appels, mocks).
// Les données fictives sont exposées séparément : import ... from '@schoolbooks/shared/mocks'.
// =============================================================================
import { z } from 'zod';

// Messages de validation par défaut en français (détails des erreurs 400).
z.config(z.locales.fr());

export * from './contract/api-routes.js';
export * from './contract/errors.js';
export * from './contract/referentiels.schema.js';
export * from './contract/ressources.schema.js';
export * from './contract/recherche.schema.js';
export * from './contract/auth.schema.js';
export * from './contract/livres.schema.js';
