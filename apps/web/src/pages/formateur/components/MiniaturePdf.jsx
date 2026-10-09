// =============================================================================
// Espace formateur — miniature de la première page d'un PDF
// Source : un fichier choisi dans le navigateur (`fichier`, lu localement, rien
// n'est envoyé) ou un PDF déjà publié (`url`, lu avec la session du formateur).
// onInfos({ pages }) : nombre de pages, ou { erreur: true } si le PDF est illisible.
// =============================================================================
import { useEffect, useRef, useState } from 'react';
import { FilePdfIcon } from '@phosphor-icons/react';
import { chargerPdfjs } from '../../../shared/pdf/pdfjs.js';

export function MiniaturePdf({ fichier, url, largeur = 220, onInfos }) {
  const canvas = useRef(null);
  const [etat, setEtat] = useState('chargement');

  useEffect(() => {
    if (!fichier && !url) return undefined;
    let annule = false;
    let tache;
    (async () => {
      try {
        const pdfjs = await chargerPdfjs();
        const source = fichier
          ? { data: new Uint8Array(await fichier.arrayBuffer()) }
          : { url, withCredentials: true };
        tache = pdfjs.getDocument(source);
        const documentPdf = await tache.promise;
        if (annule) return;
        onInfos?.({ pages: documentPdf.numPages });
        const page = await documentPdf.getPage(1);
        const echelle = largeur / page.getViewport({ scale: 1 }).width;
        const ratio = window.devicePixelRatio || 1;
        const vue = page.getViewport({ scale: echelle * ratio });
        const c = canvas.current;
        if (annule || !c) return;
        c.width = vue.width;
        c.height = vue.height;
        c.style.width = `${vue.width / ratio}px`;
        await page.render({ canvas: c, viewport: vue }).promise;
        if (!annule) setEtat('pret');
      } catch {
        if (!annule) {
          setEtat('erreur');
          onInfos?.({ erreur: true });
        }
      }
    })();
    return () => {
      annule = true;
      tache?.destroy();
    };
    // onInfos est volontairement exclu : seule la source déclenche un nouveau rendu.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fichier, url, largeur]);

  return (
    <div className={`miniature miniature--${etat}`} style={{ '--largeur': `${largeur}px` }}>
      <canvas ref={canvas} aria-label="Aperçu de la première page" role="img" />
      {etat !== 'pret' && (
        <span className="miniature__repli" aria-hidden="true">
          <FilePdfIcon weight="duotone" />
        </span>
      )}
    </div>
  );
}
