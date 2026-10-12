// =============================================================================
// Script — intégration de ressources au catalogue
// Responsable : Emmanuel AYA — relecture : Salem KONGOLO
// Usage : npm run catalogue:importer --workspace=apps/api -- chemin/vers/ressources.json
//
// Le fichier JSON contient une ressource ou une liste de ressources :
//   {
//     "titre": "Baccalauréat série C 2019 — Mathématiques (sujet)",
//     "niveau": "lycee", "filiere": "serie-c", "matiere": "mathematiques",
//     "type": "sujet-examen", "annee": 2019,
//     "auteur": "...", "description": "...",
//     "droits": "Source, licence ou ayant droit",       (BR10, obligatoire)
//     "telechargeable": false,                          (BR10, false par défaut)
//     "fichier": "pdf/bac-c-2019-maths.pdf"             (relatif au fichier JSON)
//   }
// Chaque ressource est validée (catalogue.validator.js : BR01 à BR06, BR09, BR10),
// son PDF est copié dans STORAGE_DIR/ressources/, puis elle est insérée en base.
// Une ressource refusée n'empêche pas l'import des suivantes ; le code de sortie
// vaut 1 si au moins une ressource a été refusée.
// =============================================================================
import 'dotenv/config';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { env } from '../src/config/env.js';
import { pool } from '../src/config/database.js';
import { validerRessourceCatalogue } from '../src/modules/ressources/catalogue.validator.js';
import { insererRessource } from '../src/modules/ressources/ressources.repository.js';

const slug = (texte) =>
  texte
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase()
    .slice(0, 80);

async function importer(donnees, dossierJson) {
  const ressource = await validerRessourceCatalogue({
    ...donnees,
    fichier: donnees.fichier && path.resolve(dossierJson, donnees.fichier)
  });

  // Nom unique et neutre dans le stockage : jamais le nom d'origine du fichier.
  const nomFichier = `${slug(ressource.titre) || 'ressource'}-${ressource.empreinte.slice(0, 8)}.pdf`;
  const cheminFichier = `ressources/${nomFichier}`;
  const destination = path.join(env.storageDir, cheminFichier);

  await fs.mkdir(path.dirname(destination), { recursive: true });
  await fs.copyFile(ressource.fichier, destination);
  try {
    return await insererRessource({ ...ressource, nomFichier, cheminFichier });
  } catch (error) {
    await fs.rm(destination, { force: true });
    throw error;
  }
}

async function main() {
  const cheminJson = process.argv[2];
  if (!cheminJson) {
    console.error('Usage : npm run catalogue:importer -- chemin/vers/ressources.json');
    process.exit(2);
  }
  const contenu = JSON.parse(await fs.readFile(cheminJson, 'utf8'));
  const liste = Array.isArray(contenu) ? contenu : [contenu];
  const dossierJson = path.dirname(path.resolve(cheminJson));

  let refusees = 0;
  for (const [index, donnees] of liste.entries()) {
    const libelle = donnees?.titre ?? `ressource n°${index + 1}`;
    try {
      const { id } = await importer(donnees, dossierJson);
      console.log(`✅ « ${libelle} » intégrée (${id})`);
    } catch (error) {
      refusees += 1;
      console.error(`❌ « ${libelle} » refusée — ${error.code ?? 'ERREUR'} : ${error.message}`);
      for (const detail of error.details ?? []) console.error(`     • ${detail.champ} : ${detail.message}`);
    }
  }

  console.log(`${liste.length - refusees}/${liste.length} ressource(s) intégrée(s).`);
  await pool.end();
  process.exitCode = refusees > 0 ? 1 : 0;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  main().catch(async (error) => {
    console.error(error);
    await pool.end();
    process.exit(1);
  });
}
