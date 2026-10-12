// =============================================================================
// Contrat d'API — comptes et authentification
// Consommé par : pages connexion / inscription, contexte d'authentification.
// Les jetons (access et refresh) ne transitent JAMAIS dans le corps JSON : ils
// sont posés en cookies HTTP-only par l'API. Le corps ne contient que l'utilisateur.
// =============================================================================
import { z } from 'zod';
import { CodeSchema } from './referentiels.schema.js';

export const ROLES = { apprenant: 'learner', formateur: 'trainer' };
export const MOT_DE_PASSE_MIN = 8;

const texte = (max) => z.string().trim().min(1, 'Champ obligatoire').max(max);
const optionnel = (schema) =>
  z.preprocess((v) => (typeof v === 'string' && v.trim() === '' ? undefined : v), schema.optional());

const EmailSchema = z
  .string()
  .trim()
  .toLowerCase()
  .max(255)
  .pipe(z.email({ message: 'Adresse e-mail invalide' }));

const MotDePasseSchema = z
  .string()
  .min(MOT_DE_PASSE_MIN, `Au moins ${MOT_DE_PASSE_MIN} caractères`)
  .max(128)
  .regex(/[A-Za-z]/, 'Au moins une lettre')
  .regex(/[0-9]/, 'Au moins un chiffre');

const CompteCommun = {
  prenom: texte(100),
  nom: texte(100),
  email: EmailSchema,
  motDePasse: MotDePasseSchema,
  telephone: optionnel(z.string().trim().max(30))
};

// POST /api/auth/register/learner — niveau scolaire choisi parmi /api/school-levels.
export const InscriptionApprenantSchema = z
  .object({ ...CompteCommun, niveau: CodeSchema })
  .strict();

// POST /api/auth/register/trainer
export const InscriptionFormateurSchema = z
  .object({
    ...CompteCommun,
    specialite: texte(100),
    bio: optionnel(z.string().trim().max(2000))
  })
  .strict();

// POST /api/auth/login
export const ConnexionSchema = z
  .object({
    email: EmailSchema,
    motDePasse: z.string().min(1, 'Champ obligatoire').max(128)
  })
  .strict();

// Utilisateur renvoyé par register, login, refresh et me : { success, data: { utilisateur } }.
export const UtilisateurSchema = z.object({
  id: z.uuid(),
  role: z.enum([ROLES.apprenant, ROLES.formateur]),
  prenom: z.string(),
  nom: z.string(),
  email: z.string(),
  niveau: z.string().nullable(), // apprenant uniquement
  specialite: z.string().nullable() // formateur uniquement
});
