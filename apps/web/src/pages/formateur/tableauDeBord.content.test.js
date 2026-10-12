// Tests — calculs du tableau de bord formateur.
import { describe, expect, it } from 'vitest';
import { notifications, publicationsParJour, repartition, statistiques, statut, versCsv } from './tableauDeBord.content.js';

const livre = (extra) => ({
  id: crypto.randomUUID(),
  titre: 'Livre',
  auteur: null,
  niveau: { code: 'lycee', libelle: 'Lycée' },
  matiere: { code: 'mathematiques', libelle: 'Mathématiques' },
  type: { code: 'livre', libelle: 'Livre' },
  annee: null,
  telechargements: 0,
  actif: true,
  telechargeable: true,
  dateAjout: '2026-10-05T10:00:00.000Z', // lundi
  ...extra
});

const LIVRES = [
  livre({ telechargements: 6 }),
  livre({ telechargements: 3, telechargeable: false, matiere: { code: 'svt', libelle: 'SVT' } }),
  livre({ telechargements: 1, actif: false, dateAjout: '2026-09-02T10:00:00.000Z' }) // mercredi
];

describe('tableau de bord', () => {
  it('statistiques : totaux, ce mois-ci, moyenne, actifs, matières', () => {
    expect(statistiques(LIVRES, 10, new Date('2026-10-09T12:00:00Z'))).toEqual({
      total: 3,
      ajoutesCeMois: 2,
      telechargements: 10,
      moyenne: 3,
      actifs: 2,
      desactives: 1,
      matieres: 2,
      totalMatieres: 10
    });
  });

  it('publications par jour de la semaine (lundi en premier)', () => {
    const jours = publicationsParJour(LIVRES);
    expect(jours.map((j) => j.nombre)).toEqual([2, 0, 1, 0, 0, 0, 0]);
    expect(jours[0]).toMatchObject({ jour: 'L', pourcentage: 67, estMax: true });
  });

  it('répartition et statut', () => {
    expect(repartition(LIVRES)).toEqual({ total: 3, telechargeables: 1, lectureSeule: 1, desactives: 1, pourcentageActifs: 67 });
    expect(repartition([]).pourcentageActifs).toBe(0);
    expect(LIVRES.map((l) => statut(l).cle)).toEqual(['actif', 'lecture', 'desactive']);
  });

  it('notifications fondées sur les données', () => {
    expect(notifications(LIVRES).map((n) => n.to)).toEqual(['/formateur/livres?filtre=inactifs', `/livres/${LIVRES[0].id}`]);
    expect(notifications([])).toEqual([]);
  });

  it('export CSV : en-têtes, séparateur « ; », guillemets échappés', () => {
    const csv = versCsv([livre({ titre: 'Le "grand" livre' })]);
    expect(csv.startsWith('\uFEFF"Titre";"Auteur"')).toBe(true);
    expect(csv).toContain('"Le ""grand"" livre"');
  });
});
