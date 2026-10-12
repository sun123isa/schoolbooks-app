// =============================================================================
// Socle frontend — lecture d'un PDF protégé par la session
// Les PDF ne sont servis qu'aux comptes connectés. Si l'access token a expiré
// pendant la visite, la visionneuse échoue (401) : on renouvelle la session une
// fois puis on recharge la visionneuse ; un second échec est définitif.
//   const lecture = useLectureProtegee(url);
//   <VisionneusePdf key={lecture.cle} url={url} onErreur={lecture.signalerErreur} />
//   lecture.enErreur → afficher « document inaccessible »
// =============================================================================
import { useCallback, useState } from 'react';
import { rafraichirSession } from '../api/client.js';

export function useLectureProtegee(url) {
  const [etat, setEtat] = useState({ url: null, tentative: 0, echec: false });
  const courant = etat.url === url ? etat : { url, tentative: 0, echec: false };

  const signalerErreur = useCallback(async () => {
    if (courant.tentative === 0 && (await rafraichirSession())) {
      setEtat({ url, tentative: 1, echec: false });
    } else {
      setEtat({ url, tentative: courant.tentative, echec: true });
    }
  }, [url, courant.tentative]);

  return { cle: `${url}#${courant.tentative}`, enErreur: courant.echec, signalerErreur };
}
