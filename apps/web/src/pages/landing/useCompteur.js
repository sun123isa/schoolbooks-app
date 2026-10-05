// =============================================================================
// Landing page — compteur animé (0 → valeur) pour le bandeau de chiffres
// Responsable : HIRWA Jean Baptiste — relecture : Salem KONGOLO
// Seule la partie numérique en tête est animée (« 10+ » : 0+ → 10+) ; une valeur
// non numérique (« Lycée & Université ») est rendue telle quelle. Sans
// animation autorisée, la valeur finale est affichée directement.
// =============================================================================
import { useEffect, useState } from 'react';
import { mouvementAutorise } from '../../shared/hooks/useMouvement.js';

// « 10+ » → { nombre: 10, suffixe: '+' } ; « Lycée » → null.
export function decouperValeur(valeur) {
  const correspondance = /^(\d+)(.*)$/.exec(String(valeur ?? ''));
  return correspondance ? { nombre: Number(correspondance[1]), suffixe: correspondance[2] } : null;
}

const adoucir = (t) => 1 - (1 - t) ** 3;

export function useCompteur(valeur, { duree = 1400, delai = 0 } = {}) {
  const decoupe = decouperValeur(valeur);
  const nombre = decoupe?.nombre;
  const [courant, setCourant] = useState(null);

  useEffect(() => {
    if (nombre === undefined || !mouvementAutorise()) return undefined;
    let image = 0;
    let debut = 0;
    const etape = (temps) => {
      debut ||= temps;
      const progression = Math.min(1, Math.max(0, (temps - debut - delai) / duree));
      setCourant(Math.round(adoucir(progression) * nombre));
      if (progression < 1) image = requestAnimationFrame(etape);
    };
    image = requestAnimationFrame(etape);
    // Filet de sécurité : si le navigateur suspend les images (onglet en
    // arrière-plan, économie d'énergie), la valeur finale s'affiche quand même.
    const garde = setTimeout(() => setCourant(nombre), delai + duree + 300);
    return () => {
      cancelAnimationFrame(image);
      clearTimeout(garde);
    };
  }, [nombre, duree, delai]);

  if (!decoupe || courant === null) return valeur;
  return `${courant}${decoupe.suffixe}`;
}
