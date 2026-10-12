// =============================================================================
// Contrat d'API — ressources (résumé pour les cartes, détail pour la fiche)
// Responsable : Emmanuel AYA — relecture : Salem KONGOLO
// Consommé par : recherche (Graciel, résumé), consultation (Karene, détail).
// =============================================================================
import { z } from 'zod';
import { ReferenceSchema } from './referentiels.schema.js';

// Résumé d'une ressource : ce qu'affiche une carte de résultat.
// BR01/BR03/BR05 : niveau, matière et type sont toujours présents.
// BR04 : annee est non nulle pour un sujet d'examen.
export const RessourceResumeSchema = z.object({
  id: z.uuid(),
  titre: z.string().min(1),
  niveau: ReferenceSchema,
  filiere: ReferenceSchema.nullable(),
  matiere: ReferenceSchema,
  type: ReferenceSchema,
  annee: z.number().int().nullable(),
  format: z.literal('PDF'),
  // BR08 : le bouton « Télécharger » n'est affiché que si true.
  telechargeable: z.boolean()
});

// Détail d'une ressource : GET /api/ressources/:id
export const RessourceDetailSchema = RessourceResumeSchema.extend({
  description: z.string().nullable(),
  auteur: z.string().nullable(),
  tailleOctets: z.number().int().nonnegative().nullable(),
  // BR06 : false si le fichier PDF est absent ou illisible sur le serveur.
  disponible: z.boolean(),
  // BR10 : mention des droits d'utilisation (source, licence, ayant droit).
  droits: z.string().nullable(),
  dateAjout: z.iso.datetime({ offset: true }),
  // Chemins relatifs à l'origine de l'API (ex : /api/ressources/:id/fichier).
  // fichier = null si disponible = false ;
  // telechargement = null si telechargeable = false ou disponible = false.
  urls: z.object({
    fichier: z.string().nullable(),
    telechargement: z.string().nullable()
  })
});

export const RessourceIdParamsSchema = z.object({
  id: z.uuid({ message: 'Identifiant de ressource invalide' })
});
