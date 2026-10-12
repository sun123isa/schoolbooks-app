// =============================================================================
// Contrat d'API — livres publiés par les formateurs (/api/books)
// Consommé par : catalogue des livres, fiche livre, espace formateur.
// Un livre est une ligne de la table books rattachée aux référentiels : il est
// donc aussi visible dans la recherche de ressources (/api/ressources).
// =============================================================================
import { z } from 'zod';
import { CodeSchema } from './referentiels.schema.js';

export const TRIS_LIVRES = ['recent', 'titre', 'telechargements'];
export const LIMITE_LIVRES_PAR_DEFAUT = 12;
export const LIMITE_LIVRES_MAX = 50;
export const TAILLE_MAX_PDF = 25 * 1024 * 1024; // 25 Mo

const vide = (value) => (typeof value === 'string' && value.trim() === '' ? undefined : value);
const optionnel = (schema) => z.preprocess(vide, schema.optional());
// Les formulaires multipart envoient des chaînes : « true » / « false ».
const booleen = z.preprocess(
  (v) => (v === 'true' || v === true ? true : v === 'false' || v === false ? false : v),
  z.boolean()
);

// GET /api/books?q=&niveau=&matiere=&page=&limit=&tri=
export const LivresQuerySchema = z
  .object({
    q: optionnel(z.string().trim().max(100)),
    niveau: optionnel(CodeSchema),
    matiere: optionnel(CodeSchema),
    page: z.preprocess(vide, z.coerce.number().int().min(1).default(1)),
    limit: z.preprocess(
      vide,
      z.coerce.number().int().min(1).max(LIMITE_LIVRES_MAX).default(LIMITE_LIVRES_PAR_DEFAUT)
    ),
    tri: z.preprocess(vide, z.enum(TRIS_LIVRES).default('recent'))
  })
  .strict();

const champsLivre = {
  titre: z.string().trim().min(3, 'Au moins 3 caractères').max(255),
  auteur: optionnel(z.string().trim().max(255)),
  description: optionnel(z.string().trim().max(5000)),
  niveau: CodeSchema,
  matiere: CodeSchema,
  filiere: optionnel(CodeSchema),
  type: optionnel(CodeSchema), // « livre » par défaut
  annee: optionnel(z.coerce.number().int().min(1950).max(2100)),
  telechargeable: z.preprocess(vide, booleen.default(true)),
  droits: optionnel(z.string().trim().max(2000))
};

// POST /api/books (multipart/form-data, fichier PDF dans le champ « fichier »)
export const CreationLivreSchema = z.object(champsLivre).strict();

// PATCH /api/books/trainer/:id (multipart, tous les champs facultatifs, nouveau PDF facultatif).
// Envoyer une chaîne vide pour effacer un champ facultatif (auteur, description, filière, année, droits).
export const ModificationLivreSchema = z
  .object({
    titre: champsLivre.titre.optional(),
    auteur: z.string().trim().max(255).optional(),
    description: z.string().trim().max(5000).optional(),
    niveau: CodeSchema.optional(),
    matiere: CodeSchema.optional(),
    filiere: z.union([z.literal(''), CodeSchema]).optional(),
    type: CodeSchema.optional(),
    annee: z.union([z.literal(''), z.coerce.number().int().min(1950).max(2100)]).optional(),
    telechargeable: booleen.optional(),
    droits: z.string().trim().max(2000).optional()
  })
  .strict();

export const LivreIdParamsSchema = z.object({
  id: z.uuid({ message: 'Identifiant de livre invalide' })
});

// GET /api/uploads/books/:fileName — noms générés par l'API (UUID + .pdf).
export const NomFichierLivreParamsSchema = z.object({
  fileName: z.string().regex(/^[0-9a-f-]{36}\.pdf$/i, 'Nom de fichier invalide')
});

// --- Réponses -------------------------------------------------------------------
const ReferenceSchema = z.object({ code: z.string(), libelle: z.string() });
const DateIsoSchema = z.iso.datetime({ offset: true });

// Élément des listes (catalogue, « Mes livres »). Jamais de chemin disque.
export const LivreResumeSchema = z
  .object({
    id: z.uuid(),
    titre: z.string().min(1),
    auteur: z.string().nullable(),
    description: z.string().nullable(),
    niveau: ReferenceSchema,
    filiere: ReferenceSchema.nullable(),
    matiere: ReferenceSchema,
    type: ReferenceSchema,
    annee: z.number().int().nullable(),
    telechargeable: z.boolean(),
    telechargements: z.number().int().min(0),
    actif: z.boolean(),
    formateur: z.object({ id: z.uuid(), nom: z.string() }).nullable(),
    dateAjout: DateIsoSchema,
    dateModification: DateIsoSchema,
    dateDesactivation: DateIsoSchema.nullable()
  })
  .strict();

// GET /api/books/:id (et réponses de création, modification, désactivation, restauration).
export const LivreDetailSchema = LivreResumeSchema.extend({
  droits: z.string().nullable(),
  tailleOctets: z.number().int().nullable(),
  disponible: z.boolean(),
  estProprietaire: z.boolean(),
  urls: z.object({ fichier: z.string().nullable(), telechargement: z.string().nullable() })
}).strict();

// GET /api/books
export const ListeLivresSchema = z.object({
  items: z.array(LivreResumeSchema),
  total: z.number().int().min(0),
  page: z.number().int().min(1),
  limit: z.number().int().min(1),
  totalPages: z.number().int().min(1),
  message: z.string().nullable()
});

// GET /api/books/trainer/mine
export const MesLivresSchema = z.object({
  items: z.array(LivreResumeSchema),
  statistiques: z.object({
    livres: z.number().int().min(0),
    telechargements: z.number().int().min(0),
    actifs: z.number().int().min(0),
    matieres: z.number().int().min(0)
  })
});
