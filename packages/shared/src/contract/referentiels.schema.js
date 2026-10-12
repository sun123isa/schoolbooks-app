// =============================================================================
// Contrat d'API — référentiels (niveaux, séries/filières, matières, années, types)
// Responsable : Isaac LELO MAKAYA — relecture : Salem KONGOLO
// Consommé par : landing page (Jean Baptiste), recherche (Graciel).
// =============================================================================
import { z } from 'zod';

// Code lisible utilisé dans les URL : minuscules, chiffres et tirets.
export const CodeSchema = z
  .string()
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Code invalide (minuscules, chiffres, tirets)');

// Forme réduite d'un élément de référentiel, réutilisée dans les ressources.
export const ReferenceSchema = z.object({
  code: CodeSchema,
  libelle: z.string().min(1)
});

// GET /api/niveaux
export const NiveauSchema = ReferenceSchema;
export const NiveauxSchema = z.array(NiveauSchema);

// GET /api/niveaux/:code/filieres — BR02 : chaque filière appartient à un niveau.
export const FiliereSchema = ReferenceSchema.extend({
  niveau: CodeSchema
});
export const FilieresSchema = z.array(FiliereSchema);

// GET /api/matieres
export const MatiereSchema = ReferenceSchema;
export const MatieresSchema = z.array(MatiereSchema);

// GET /api/annees — années pour lesquelles au moins une ressource existe, ordre décroissant.
export const AnneesSchema = z.array(z.number().int());

// GET /api/types-documents — BR04 : requiertAnnee = true pour les sujets d'examen.
export const TypeDocumentSchema = ReferenceSchema.extend({
  requiertAnnee: z.boolean()
});
export const TypesDocumentsSchema = z.array(TypeDocumentSchema);
