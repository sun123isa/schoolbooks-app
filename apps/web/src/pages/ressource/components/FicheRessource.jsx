// =============================================================================
// Page de consultation — fiche de la ressource (informations, description, droits)
// Responsable : Karene MOUSSOUNDA — relecture : Salem KONGOLO
// BR10 : les droits d'utilisation sont toujours affichés.
// =============================================================================
import {
  BankIcon,
  BookOpenTextIcon,
  CalendarBlankIcon,
  CalendarCheckIcon,
  FileIcon,
  GraduationCapIcon,
  HardDrivesIcon,
  ShieldCheckIcon,
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

      {ressource.description && (
        <section className="fiche__bloc">
          <h2 className="fiche__titre">{TEXTES.description}</h2>
          <p className="fiche__texte">{ressource.description}</p>
        </section>
      )}

      <section className="fiche__bloc fiche__bloc--droits">
        <h2 className="fiche__titre">
          <ShieldCheckIcon weight="duotone" aria-hidden="true" />
          {TEXTES.droits}
        </h2>
        <p className="fiche__texte">{ressource.droits ?? TEXTES.droitsInconnus}</p>
      </section>
    </aside>
  );
}
