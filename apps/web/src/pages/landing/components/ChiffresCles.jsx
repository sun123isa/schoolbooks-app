// =============================================================================
// Landing page — bandeau de chiffres clés (carte blanche qui chevauche le hero)
// Responsable : HIRWA Jean Baptiste — relecture : Salem KONGOLO
// Valeurs calculées à partir de l'API ; en cas d'erreur, valeurs provisoires
// de landing.content.js. Pendant le chargement, un tiret réserve la place.
// Les nombres défilent de 0 à leur valeur (useCompteur).
// =============================================================================
import { BankIcon, BooksIcon, BookOpenTextIcon, StackIcon } from '@phosphor-icons/react';
import { useApi } from '../../../shared/hooks/useApi.js';
import { fetchChiffres } from '../landing.api.js';
import { useCompteur } from '../useCompteur.js';

const ICONES = { niveaux: BankIcon, ressources: BooksIcon, matieres: BookOpenTextIcon, types: StackIcon };

function Chiffre({ item, valeur, index }) {
  const Icone = ICONES[item.icone];
  const affiche = useCompteur(valeur, { delai: index * 120 });
  return (
    <div className="chiffres__item">
      <span className="chiffres__icon" aria-hidden="true" style={{ '--i': index }}>
        <Icone weight="duotone" />
      </span>
      <div className="chiffres__text">
        {/* La valeur finale est lue par les lecteurs d'écran, pas le défilement. */}
        <dd className="chiffres__value">
          <span aria-hidden="true">{affiche}</span>
          <span className="visually-hidden">{valeur}</span>
        </dd>
        <dt className="chiffres__label">{item.libelle}</dt>
      </div>
    </div>
  );
}

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
          {contenu.map((item, index) => (
            <Chiffre key={item.id} item={item} valeur={valeur(item)} index={index} />
          ))}
        </dl>
      </div>
    </section>
  );
}
