// =============================================================================
// Landing page — bandeau de chiffres clés (carte blanche qui chevauche le hero)
// Responsable : HIRWA Jean Baptiste — relecture : Salem KONGOLO
// Valeurs calculées à partir de l'API ; en cas d'erreur, valeurs provisoires
// de landing.content.js. Pendant le chargement, un tiret réserve la place.
// =============================================================================
import { BookOpen, Files, Landmark, Library } from 'lucide-react';
import { useApi } from '../../../shared/hooks/useApi.js';
import { fetchChiffres } from '../landing.api.js';

const ICONES = { niveaux: Landmark, ressources: Library, matieres: BookOpen, types: Files };

export function ChiffresCles({ contenu }) {
  const chiffres = useApi((signal) => fetchChiffres(signal), []);

  const valeur = (item) => {
    if (chiffres.data) return chiffres.data[item.id];
    if (chiffres.error) return item.provisoire;
    return '—';
  };

  return (
    <section className="chiffres" aria-label="ScolaRead en chiffres">
      <div className="container">
        <dl className="chiffres__card" aria-busy={chiffres.isLoading}>
          {contenu.map((item) => {
            const Icone = ICONES[item.icone];
            return (
              <div key={item.id} className="chiffres__item">
                <span className="chiffres__icon" aria-hidden="true">
                  <Icone />
                </span>
                <div className="chiffres__text">
                  <dd className="chiffres__value">{valeur(item)}</dd>
                  <dt className="chiffres__label">{item.libelle}</dt>
                </div>
              </div>
            );
          })}
        </dl>
      </div>
    </section>
  );
}
