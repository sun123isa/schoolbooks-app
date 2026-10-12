// Responsable : Isaac LELO MAKAYA (socle backend) — relecture : Salem KONGOLO
import 'dotenv/config';
import app from './app.js';

const PORT = process.env.PORT || 3000;

// Express 5 transmet l'erreur d'écoute (port déjà utilisé, droits…) au rappel :
// sans ce contrôle, l'API annoncerait « démarrée » puis s'arrêterait en silence.
app.listen(PORT, (erreur) => {
  if (erreur) {
    console.error(`❌ Impossible de démarrer l'API sur le port ${PORT} : ${erreur.message}`);
    process.exit(1);
  }
  console.log(`API démarrée sur http://localhost:${PORT}`);
});
