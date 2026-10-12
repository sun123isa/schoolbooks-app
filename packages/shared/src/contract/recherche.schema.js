// =============================================================================
// Contrat d'API — recherche de ressources
// Responsable : Salem KONGOLO — relecture : HIRWA Jean Baptiste
// Consommé par : page de recherche (Graciel).
// Les noms de paramètres sont identiques dans l'URL du frontend (/recherche?...)
// et dans l'appel API (/api/ressources?...) : une recherche se partage par lien.
// =============================================================================
import { z } from 'zod';
import { CodeSchema } from './referentiels.schema.js';
import { RessourceResumeSchema } from './ressources.schema.js';

export const TRIS = ['pertinence', 'recent', 'titre'];
export const LIMITE_PAR_DEFAUT = 12;
export const LIMITE_MAX = 50;

// Une chaîne vide dans l'URL (?niveau=) équivaut à un filtre absent.
const vide = (value) => (typeof value === 'string' && value.trim() === '' ? undefined : value);
const optionnel = (schema) => z.preprocess(vide, schema.optional());

// GET /api/ressources?q=&niveau=&filiere=&matiere=&annee=&type=&page=&limit=&tri=
// Un paramètre inconnu est refusé (400) : BR07, les filtres sont stricts.
export const RechercheQuerySchema = z
  .object({
    q: optionnel(z.string().trim().max(100)),
    niveau: optionnel(CodeSchema),
    filiere: optionnel(CodeSchema),
    matiere: optionnel(CodeSchema),
    annee: optionnel(z.coerce.number().int().min(1950).max(2100)),
    type: optionnel(CodeSchema),
    page: z.preprocess(vide, z.coerce.number().int().min(1).default(1)),
    limit: z.preprocess(vide, z.coerce.number().int().min(1).max(LIMITE_MAX).default(LIMITE_PAR_DEFAUT)),
    tri: z.preprocess(vide, z.enum(TRIS).default('pertinence'))
  })
  .strict();

// Réponse : { success: true, data: RechercheResultat }
export const RechercheResultatSchema = z.object({
  items: z.array(RessourceResumeSchema),
  total: z.number().int().nonnegative(),
  page: z.number().int().min(1),
  limit: z.number().int().min(1),
  totalPages: z.number().int().nonnegative(),
  // Rappel des critères réellement appliqués (après validation), sans page/limit/tri.
  filtres: z.object({
    q: z.string().optional(),
    niveau: CodeSchema.optional(),
    filiere: CodeSchema.optional(),
    matiere: CodeSchema.optional(),
    annee: z.number().int().optional(),
    type: CodeSchema.optional()
  }),
  tri: z.enum(TRIS),
  // Message explicite quand total = 0, sinon null.
  message: z.string().nullable()
});

export const MESSAGE_AUCUN_RESULTAT = 'Aucune ressource ne correspond à vos critères.';
