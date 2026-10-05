// =============================================================================
// Page de consultation — fiche de la ressource (informations)
// Responsable : Karene MOUSSOUNDA — relecture : Salem KONGOLO
// Les cartes « Description » et « Droits d'utilisation » ont été retirées à la
// demande du Lead Dev ; la mention générale des droits reste dans le pied de page.
// =============================================================================
import {
  BankIcon,
  BookOpenTextIcon,
  CalendarBlankIcon,
  CalendarCheckIcon,
  FileIcon,
  GraduationCapIcon,
  HardDrivesIcon,
  StackIcon,
  UserIcon
} from '@phosphor-icons/react';
import { TEXTES, informations } from '../ressource.content.js';

const ICONES = {
  niveau: BankIcon,
  filiere: GraduationCapIcon,
  matiere: BookOpenTextIcon,
  annee: CalendarBlankIcon,
  type: StackIcon,
  format: FileIcon,
  taille: HardDrivesIcon,
  auteur: UserIcon,
  ajout: CalendarCheckIcon
};

export function FicheRessource({ ressource }) {
  return (
    <aside className="fiche" aria-label={TEXTES.informations}>
      <section className="fiche__bloc">
        <h2 className="fiche__titre">{TEXTES.informations}</h2>
        <dl className="fiche__liste">
          {informations(ressource).map((ligne, index) => {
            const Icone = ICONES[ligne.id];
            return (
              <div key={ligne.id} className="fiche__ligne" style={{ '--i': index }}>
                <dt>
                  <Icone weight="duotone" aria-hidden="true" />
                  {ligne.label}
                </dt>
                <dd>{ligne.valeur}</dd>
              </div>
            );
          })}
        </dl>
      </section>
    </aside>
  );
}

// -----------------------------------------------------------------------------
// Note : Karene MOUSSOUNDA n'étant pas disponible, cette tâche a été réalisée par
// HIRWA Jean Baptiste.
// -----------------------------------------------------------------------------
