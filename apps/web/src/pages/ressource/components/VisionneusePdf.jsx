// =============================================================================
// Page de consultation — visionneuse PDF intégrée (pdf.js)
// Responsable : Karene MOUSSOUNDA — relecture : Salem KONGOLO
//
// Rendu page par page dans un <canvas> : pas de visionneuse native du
// navigateur, donc pas de bouton de téléchargement caché (BR08).
// Fonctions : page précédente / suivante / numéro, zoom avant / arrière /
// ajusté à la largeur, plein écran, clavier (← → + −) et glissement au doigt.
// pdf.js (≈ 400 Ko) n'est chargé qu'à l'ouverture d'une ressource.
// Le parent passe `key={url}` pour repartir de la page 1, et un `onErreur`
// stable (useCallback) : il est une dépendance des effets de chargement.
// =============================================================================
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  ArrowsInIcon,
  ArrowsOutIcon,
  ArrowsOutLineHorizontalIcon,
  CaretLeftIcon,
  CaretRightIcon,
  MagnifyingGlassMinusIcon,
  MagnifyingGlassPlusIcon
} from '@phosphor-icons/react';
import { TEXTES, ZOOM_MAX, ZOOM_MIN, zoomSuivant } from '../ressource.content.js';

const T = TEXTES.visionneuse;
const MARGE_PAGE = 32; // px de marge autour de la page en mode « ajusté »
const SEUIL_GLISSEMENT = 60; // px

let promessePdfjs;
function chargerPdfjs() {
  promessePdfjs ??= Promise.all([import('pdfjs-dist'), import('pdfjs-dist/build/pdf.worker.min.mjs?url')]).then(
    ([pdfjs, worker]) => {
      pdfjs.GlobalWorkerOptions.workerSrc = worker.default;
      return pdfjs;
    }
  );
  return promessePdfjs;
}

function BoutonOutil({ label, onClick, disabled, children }) {
  return (
    <button type="button" className="outil" onClick={onClick} disabled={disabled} aria-label={label} title={label}>
      {children}
    </button>
  );
}

export function VisionneusePdf({ url, titre, onErreur }) {
  const refConteneur = useRef(null);
  const refZone = useRef(null);
  const refCanvas = useRef(null);
  const refToucher = useRef(null);

  const [documentPdf, setDocumentPdf] = useState(null);
  const [page, setPage] = useState(1);
  const [zoom, setZoom] = useState('ajuste'); // 'ajuste' ou une échelle (1 = 100 %)
  const [echelle, setEchelle] = useState(1); // échelle réellement appliquée
  const [largeurZone, setLargeurZone] = useState(0);
  const [rendu, setRendu] = useState(false);
  const [pleinEcran, setPleinEcran] = useState(false);

  const nombrePages = documentPdf?.numPages ?? 0;

  // Ouverture du document.
  useEffect(() => {
    let annule = false;
    let tache;
    chargerPdfjs()
      .then((pdfjs) => {
        if (annule) return null;
        tache = pdfjs.getDocument({ url });
        return tache.promise;
      })
      .then((docPdf) => {
        if (!annule && docPdf) setDocumentPdf(docPdf);
      })
      .catch(() => {
        if (!annule) onErreur?.();
      });
    return () => {
      annule = true;
      tache?.destroy();
    };
  }, [url, onErreur]);

  // Largeur disponible (mode « ajusté »), suivie au redimensionnement.
  useEffect(() => {
    const zone = refZone.current;
    if (!zone) return undefined;
    const observateur = new ResizeObserver(([entree]) => setLargeurZone(entree.contentRect.width));
    observateur.observe(zone);
    return () => observateur.disconnect();
  }, []);

  // Rendu de la page courante.
  useEffect(() => {
    if (!documentPdf || !largeurZone || !refCanvas.current) return undefined;
    let tache;
    let annule = false;
    documentPdf
      .getPage(page)
      .then((pagePdf) => {
        if (annule) return null;
        const largeurPage = pagePdf.getViewport({ scale: 1 }).width;
        const cible = zoom === 'ajuste' ? Math.max(0.2, (largeurZone - MARGE_PAGE) / largeurPage) : zoom;
        const viewport = pagePdf.getViewport({ scale: cible });
        const ratio = window.devicePixelRatio || 1;
        const canvas = refCanvas.current;
        canvas.width = Math.floor(viewport.width * ratio);
        canvas.height = Math.floor(viewport.height * ratio);
        canvas.style.width = `${Math.floor(viewport.width)}px`;
        canvas.style.height = `${Math.floor(viewport.height)}px`;
        setEchelle(cible);
        tache = pagePdf.render({ canvas, viewport, transform: ratio === 1 ? undefined : [ratio, 0, 0, ratio, 0, 0] });
        return tache.promise;
      })
      .then(() => {
        if (!annule) setRendu(true);
      })
      .catch((erreur) => {
        if (!annule && erreur?.name !== 'RenderingCancelledException') onErreur?.();
      });
    return () => {
      annule = true;
      tache?.cancel();
    };
  }, [documentPdf, page, zoom, largeurZone, onErreur]);

  const allerA = useCallback(
    (numero) => {
      if (!nombrePages) return;
      setPage(Math.min(nombrePages, Math.max(1, numero)));
    },
    [nombrePages]
  );

  const zoomer = (sens) => setZoom(zoomSuivant(echelle, sens));

  // Plein écran : API native si disponible, sinon mode CSS (iOS Safari).
  const basculerPleinEcran = () => {
    const conteneur = refConteneur.current;
    if (document.fullscreenElement) document.exitFullscreen();
    else if (conteneur?.requestFullscreen) conteneur.requestFullscreen().catch(() => setPleinEcran(true));
    else setPleinEcran((actif) => !actif);
  };

  useEffect(() => {
    const surChangement = () => setPleinEcran(document.fullscreenElement === refConteneur.current);
    document.addEventListener('fullscreenchange', surChangement);
    return () => document.removeEventListener('fullscreenchange', surChangement);
  }, []);

  const surTouche = (event) => {
    if (event.target.tagName === 'INPUT') return;
    const actions = {
      ArrowLeft: () => allerA(page - 1),
      PageUp: () => allerA(page - 1),
      ArrowRight: () => allerA(page + 1),
      PageDown: () => allerA(page + 1),
      '+': () => zoomer(1),
      '=': () => zoomer(1),
      '-': () => zoomer(-1),
      Escape: () => pleinEcran && !document.fullscreenElement && setPleinEcran(false)
    };
    if (actions[event.key]) {
      event.preventDefault();
      actions[event.key]();
    }
  };

  // Glissement horizontal (écran tactile), seulement quand la page tient en largeur.
  const surDebutToucher = (event) => {
    refToucher.current = event.touches.length === 1 ? event.touches[0].clientX : null;
  };
  const surFinToucher = (event) => {
    if (refToucher.current === null || zoom !== 'ajuste') return;
    const ecart = event.changedTouches[0].clientX - refToucher.current;
    if (Math.abs(ecart) > SEUIL_GLISSEMENT) allerA(page + (ecart < 0 ? 1 : -1));
    refToucher.current = null;
  };

  const validerNumero = (event) => {
    const numero = Number(event.currentTarget.value);
    if (Number.isInteger(numero)) allerA(numero);
    event.currentTarget.value = String(page);
  };

  return (
    <div
      ref={refConteneur}
      className={`visionneuse ${pleinEcran ? 'visionneuse--plein-ecran' : ''}`}
      role="region"
      aria-label={T.label(titre)}
      tabIndex={0}
      onKeyDown={surTouche}
    >
      <div className="visionneuse__barre" role="toolbar" aria-label={T.label(titre)}>
        <div className="visionneuse__groupe">
          <BoutonOutil label={T.precedente} onClick={() => allerA(page - 1)} disabled={page <= 1}>
            <CaretLeftIcon weight="bold" aria-hidden="true" />
          </BoutonOutil>
          <span className="visionneuse__pages">
            <input
              key={page}
              type="number"
              inputMode="numeric"
              min={1}
              max={nombrePages || 1}
              defaultValue={page}
              aria-label={T.numeroPage}
              className="visionneuse__numero"
              onBlur={validerNumero}
              onKeyDown={(event) => event.key === 'Enter' && validerNumero(event)}
            />
            <span>
              {T.sur} {nombrePages || '…'}
            </span>
          </span>
          <BoutonOutil label={T.suivante} onClick={() => allerA(page + 1)} disabled={!nombrePages || page >= nombrePages}>
            <CaretRightIcon weight="bold" aria-hidden="true" />
          </BoutonOutil>
        </div>

        <div className="visionneuse__groupe">
          <BoutonOutil label={T.zoomMoins} onClick={() => zoomer(-1)} disabled={echelle <= ZOOM_MIN}>
            <MagnifyingGlassMinusIcon weight="bold" aria-hidden="true" />
          </BoutonOutil>
          <span className="visionneuse__zoom" aria-live="polite">
            {Math.round(echelle * 100)} %
          </span>
          <BoutonOutil label={T.zoomPlus} onClick={() => zoomer(1)} disabled={echelle >= ZOOM_MAX}>
            <MagnifyingGlassPlusIcon weight="bold" aria-hidden="true" />
          </BoutonOutil>
          <BoutonOutil label={T.ajuster} onClick={() => setZoom('ajuste')} disabled={zoom === 'ajuste'}>
            <ArrowsOutLineHorizontalIcon weight="bold" aria-hidden="true" />
          </BoutonOutil>
          <span className="visionneuse__separateur" aria-hidden="true" />
          <BoutonOutil label={pleinEcran ? T.quitterPleinEcran : T.pleinEcran} onClick={basculerPleinEcran}>
            {pleinEcran ? <ArrowsInIcon weight="bold" aria-hidden="true" /> : <ArrowsOutIcon weight="bold" aria-hidden="true" />}
          </BoutonOutil>
        </div>
      </div>

      <div
        ref={refZone}
        className={`visionneuse__zone ${zoom === 'ajuste' ? '' : 'visionneuse__zone--zoom'}`}
        onTouchStart={surDebutToucher}
        onTouchEnd={surFinToucher}
      >
        {!rendu && (
          <p className="visionneuse__chargement" role="status">
            <span className="etat__spinner" aria-hidden="true" />
            {T.chargement}
          </p>
        )}
        <canvas
          ref={refCanvas}
          key={page}
          className={`visionneuse__page ${rendu ? 'visionneuse__page--prete' : ''}`}
          onContextMenu={(event) => event.preventDefault()}
        />
      </div>

      <p className="visionneuse__aide">{T.aide}</p>
    </div>
  );
}

// -----------------------------------------------------------------------------
// Note : Karene MOUSSOUNDA n'étant pas disponible, cette tâche a été réalisée par
// HIRWA Jean Baptiste.
// -----------------------------------------------------------------------------
