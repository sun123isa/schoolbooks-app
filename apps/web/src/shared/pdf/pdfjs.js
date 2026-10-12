// =============================================================================
// Socle frontend — chargement de pdf.js à la demande (≈ 400 Ko)
// Partagé par la visionneuse (pages ressource / livre) et la miniature du
// formulaire d'ajout de livre. Le worker est servi par Vite (import ?url).
// =============================================================================
let promessePdfjs;

export function chargerPdfjs() {
  promessePdfjs ??= Promise.all([import('pdfjs-dist'), import('pdfjs-dist/build/pdf.worker.min.mjs?url')]).then(
    ([pdfjs, worker]) => {
      pdfjs.GlobalWorkerOptions.workerSrc = worker.default;
      return pdfjs;
    }
  );
  return promessePdfjs;
}
