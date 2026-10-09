// =============================================================================
// Inscription depuis un document — visuel de gauche
// Montre le document que l'élève est sur le point de débloquer (couverture
// stylisée, cadenas, classement), puis le parcours en trois étapes.
// =============================================================================
import {
  BookOpenTextIcon,
  DownloadSimpleIcon,
  FileTextIcon,
  LockKeyIcon,
  UserPlusIcon
} from '@phosphor-icons/react';

export function VisuelDocument({ document }) {
  const pastilles = [document.niveau, document.matiere, document.annee].filter(Boolean).map(String);
  const etapes = [
    { icone: UserPlusIcon, titre: 'Créez votre compte', texte: 'Gratuit, en moins d’une minute' },
    { icone: BookOpenTextIcon, titre: 'Lisez en ligne', texte: 'Le document s’ouvre aussitôt' },
    {
      icone: DownloadSimpleIcon,
      titre: document.telechargeable ? 'Téléchargez le PDF' : 'Retrouvez-le à tout moment',
      texte: document.telechargeable ? 'Pour réviser hors connexion' : 'Depuis n’importe quel appareil'
    }
  ];

  return (
    <div className="auth-doc">
      <p className="auth-doc__surtitre">Vous y êtes presque</p>

      <div className="auth-doc__pile" aria-hidden="true">
        <span className="auth-doc__feuille auth-doc__feuille--2" />
        <span className="auth-doc__feuille auth-doc__feuille--1" />
        <div className="auth-doc__couverture">
          <div className="auth-doc__haut">
            <span className="auth-doc__type">
              <FileTextIcon weight="duotone" /> {document.type ?? 'Document'}
            </span>
            <span className="auth-doc__cadenas">
              <LockKeyIcon weight="fill" />
            </span>
          </div>
          <p className="auth-doc__titre">{document.titre}</p>
          <div className="auth-doc__lignes">
            {Array.from({ length: 7 }, (_, i) => (
              <span key={i} />
            ))}
          </div>
          {pastilles.length > 0 && (
            <div className="auth-doc__pastilles">
              {pastilles.map((p) => (
                <span key={p}>{p}</span>
              ))}
            </div>
          )}
        </div>
      </div>

      <p className="visually-hidden">Document demandé : {document.titre}</p>

      <ol className="auth-doc__etapes">
        {etapes.map(({ icone: Icone, titre, texte }, index) => (
          <li key={titre} className={index === 0 ? 'auth-doc__etape--active' : ''}>
            <span className="auth-doc__numero" aria-hidden="true">
              <Icone weight="bold" />
            </span>
            <span>
              <strong>{titre}</strong>
              <small>{texte}</small>
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
