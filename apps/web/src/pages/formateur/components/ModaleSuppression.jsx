// =============================================================================
// Espace formateur — confirmation de suppression définitive (fenêtre modale)
// <dialog> natif : focus piégé, Échap pour fermer, fond assombri. Rappelle ce
// qui sera perdu et propose la désactivation (réversible) comme alternative.
// =============================================================================
import { useEffect, useRef } from 'react';
import {
  ArchiveIcon,
  DownloadSimpleIcon,
  FilePdfIcon,
  TrashIcon,
  WarningIcon,
  XIcon
} from '@phosphor-icons/react';
import { IconeMatiere } from './Widgets.jsx';

export function ModaleSuppression({ livre, enCours, onAnnuler, onConfirmer, onDesactiver }) {
  const dialogue = useRef(null);

  // Ouverture / fermeture pilotées par la présence d'un livre.
  useEffect(() => {
    const d = dialogue.current;
    if (!d) return;
    if (livre && !d.open) d.showModal();
    if (!livre && d.open) d.close();
  }, [livre]);

  // Clic sur le fond (hors de la carte) : annuler, sauf pendant la suppression.
  function surClic(event) {
    if (event.target === dialogue.current && !enCours) onAnnuler();
  }

  return (
    <dialog
      ref={dialogue}
      className="modale"
      aria-labelledby="modale-titre"
      aria-describedby="modale-texte"
      onCancel={(event) => {
        event.preventDefault();
        if (!enCours) onAnnuler();
      }}
      onClick={surClic}
    >
      {livre && (
        <div className="modale__carte">
          <button
            type="button"
            className="modale__fermer"
            onClick={onAnnuler}
            disabled={enCours}
            aria-label="Fermer"
          >
            <XIcon weight="bold" aria-hidden="true" />
          </button>

          <span className="modale__icone" aria-hidden="true">
            <TrashIcon weight="duotone" />
          </span>
          <h2 id="modale-titre" className="modale__titre">
            Supprimer définitivement ce livre ?
          </h2>
          <p id="modale-texte" className="modale__texte">
            Le livre disparaîtra du catalogue et de votre tableau de bord. Cette action est irréversible.
          </p>

          <div className="modale__livre">
            <IconeMatiere code={livre.matiere.code} pastille />
            <div className="modale__livre-texte">
              <strong>{livre.titre}</strong>
              <span>
                {livre.niveau.libelle} · {livre.matiere.libelle}
              </span>
            </div>
          </div>

          <ul className="modale__pertes">
            <li>
              <FilePdfIcon weight="bold" aria-hidden="true" />
              Le fichier PDF sera effacé du serveur
            </li>
            {livre.telechargements > 0 && (
              <li>
                <DownloadSimpleIcon weight="bold" aria-hidden="true" />
                {livre.telechargements > 1
                  ? `Ses ${livre.telechargements} téléchargements comptabilisés seront perdus`
                  : 'Son téléchargement comptabilisé sera perdu'}
              </li>
            )}
          </ul>

          {livre.actif && (
            <p className="modale__conseil">
              <WarningIcon weight="fill" aria-hidden="true" />
              <span>
                Vous voulez seulement le retirer du catalogue ?{' '}
                <button type="button" className="modale__lien" onClick={onDesactiver} disabled={enCours}>
                  <ArchiveIcon weight="bold" aria-hidden="true" /> Désactivez-le plutôt
                </button>{' '}
                : il restera restaurable.
              </span>
            </p>
          )}

          <div className="modale__actions">
            <button
              type="button"
              className="modale__bouton modale__bouton--annuler"
              onClick={onAnnuler}
              disabled={enCours}
              autoFocus
            >
              Annuler
            </button>
            <button
              type="button"
              className="modale__bouton modale__bouton--danger"
              onClick={onConfirmer}
              disabled={enCours}
            >
              <TrashIcon weight="bold" aria-hidden="true" />
              {enCours ? 'Suppression…' : 'Supprimer définitivement'}
            </button>
          </div>
        </div>
      )}
    </dialog>
  );
}
