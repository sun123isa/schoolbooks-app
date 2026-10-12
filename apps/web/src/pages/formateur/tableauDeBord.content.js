// =============================================================================
// Espace formateur — calculs du tableau de bord (fonctions pures, testées)
// Toutes les valeurs affichées viennent des livres du formateur
// (GET /api/books/trainer/mine) : aucune donnée inventée.
// =============================================================================
import { ROUTES, cheminLivre } from '../../app/routes.js';

export const JOURS = ['L', 'M', 'M', 'J', 'V', 'S', 'D']; // lundi → dimanche
export const JOURS_COMPLETS = ['lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi', 'dimanche'];

// Index lundi = 0 … dimanche = 6.
export const indexJour = (date) => (new Date(date).getDay() + 6) % 7;

export function initiales(utilisateur) {
  return `${utilisateur?.prenom?.[0] ?? ''}${utilisateur?.nom?.[0] ?? ''}`.toUpperCase() || '?';
}

export function statistiques(items, totalMatieres = null, maintenant = new Date()) {
  const ceMois = (l) => {
    const d = new Date(l.dateAjout);
    return d.getFullYear() === maintenant.getFullYear() && d.getMonth() === maintenant.getMonth();
  };
  const total = items.length;
  const telechargements = items.reduce((somme, l) => somme + l.telechargements, 0);
  const actifs = items.filter((l) => l.actif).length;
  return {
    total,
    ajoutesCeMois: items.filter(ceMois).length,
    telechargements,
    moyenne: total ? Math.round(telechargements / total) : 0,
    actifs,
    desactives: total - actifs,
    matieres: new Set(items.map((l) => l.matiere.code)).size,
    totalMatieres
  };
}

// Publications par jour de la semaine (date d'ajout), lundi → dimanche.
// pourcentage : part du total des publications.
export function publicationsParJour(items) {
  const nombres = Array(7).fill(0);
  for (const livre of items) nombres[indexJour(livre.dateAjout)] += 1;
  const total = items.length;
  const max = Math.max(0, ...nombres);
  return nombres.map((nombre, index) => ({
    jour: JOURS[index],
    nomJour: JOURS_COMPLETS[index],
    nombre,
    pourcentage: total ? Math.round((nombre / total) * 100) : 0,
    estMax: nombre > 0 && nombre === max
  }));
}

// Jauge : actifs téléchargeables, actifs en lecture seule, désactivés.
export function repartition(items) {
  const total = items.length;
  const telechargeables = items.filter((l) => l.actif && l.telechargeable).length;
  const lectureSeule = items.filter((l) => l.actif && !l.telechargeable).length;
  const desactives = total - telechargeables - lectureSeule;
  return {
    total,
    telechargeables,
    lectureSeule,
    desactives,
    pourcentageActifs: total ? Math.round(((telechargeables + lectureSeule) / total) * 100) : 0
  };
}

export const plusRecents = (items, n = 5) =>
  [...items].sort((a, b) => new Date(b.dateAjout) - new Date(a.dateAjout)).slice(0, n);

export const plusTelecharges = (items, n = 4) =>
  [...items].sort((a, b) => b.telechargements - a.telechargements || new Date(b.dateAjout) - new Date(a.dateAjout)).slice(0, n);

// Statut affiché dans les listes : actif, lecture seule ou désactivé.
export function statut(livre) {
  if (!livre.actif) return { cle: 'desactive', libelle: 'Désactivé' };
  return livre.telechargeable ? { cle: 'actif', libelle: 'Actif' } : { cle: 'lecture', libelle: 'Lecture seule' };
}

// Notifications de la cloche : uniquement des faits vérifiables.
export function notifications(items) {
  const messages = [];
  const desactives = items.filter((l) => !l.actif).length;
  if (desactives > 0) {
    messages.push({
      texte: `${desactives} livre${desactives > 1 ? 's' : ''} désactivé${desactives > 1 ? 's' : ''} à restaurer ou supprimer`,
      to: `${ROUTES.mesLivres}?filtre=inactifs`
    });
  }
  const [meilleur] = plusTelecharges(items, 1);
  if (meilleur?.telechargements > 0) {
    messages.push({
      texte: `« ${meilleur.titre} » est votre livre le plus téléchargé (${meilleur.telechargements})`,
      to: cheminLivre(meilleur.id)
    });
  }
  return messages;
}

const BOM = String.fromCharCode(0xfeff); // Excel reconnaît ainsi l’UTF-8

// Export CSV (séparateur « ; » pour Excel en français, BOM UTF-8).
export function versCsv(items) {
  const entetes = ['Titre', 'Auteur', 'Niveau', 'Matière', 'Type', 'Année', 'Téléchargements', 'Statut', 'Ajouté le'];
  const cellule = (valeur) => `"${String(valeur ?? '').replace(/"/g, '""')}"`;
  const lignes = items.map((l) =>
    [
      l.titre,
      l.auteur,
      l.niveau.libelle,
      l.matiere.libelle,
      l.type.libelle,
      l.annee,
      l.telechargements,
      statut(l).libelle,
      new Date(l.dateAjout).toLocaleDateString('fr-FR')
    ]
      .map(cellule)
      .join(';')
  );
  return BOM + `${[entetes.map(cellule).join(';'), ...lignes].join('\r\n')}`;
}

export const formatDateCourte = (iso) =>
  new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
