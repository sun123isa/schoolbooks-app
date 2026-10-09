// =============================================================================
// Script — exécution des migrations et des seeds SQL
// Responsable : Isaac LELO MAKAYA — relecture : Salem KONGOLO
// Usage :
//   npm run db:migrate --workspace=apps/api            migrations uniquement
//   npm run db:migrate --workspace=apps/api -- --seed  migrations puis seeds
// Joue, dans l'ordre alphabétique, les fichiers de database/migrations (puis
// database/seeds) qui ne figurent pas encore dans la table schema_migrations.
// Chaque fichier est exécuté une seule fois ; un échec arrête le script.
// =============================================================================
import 'dotenv/config';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';
import { pool } from '../src/config/database.js';

const racineDepot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../..');

async function fichiersSql(dossier) {
  const noms = (await fs.readdir(path.join(racineDepot, 'database', dossier))).filter((nom) => nom.endsWith('.sql'));
  return noms.sort().map((nom) => `${dossier}/${nom}`);
}

async function main() {
  const avecSeeds = process.argv.includes('--seed');

  await pool.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      fichier VARCHAR(255) PRIMARY KEY,
      joue_le TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )`);
  const { rows } = await pool.query('SELECT fichier FROM schema_migrations');
  const dejaJoues = new Set(rows.map((row) => row.fichier));

  const fichiers = [...(await fichiersSql('migrations')), ...(avecSeeds ? await fichiersSql('seeds') : [])];
  let joues = 0;

  for (const fichier of fichiers) {
    if (dejaJoues.has(fichier)) continue;
    const sql = await fs.readFile(path.join(racineDepot, 'database', fichier), 'utf8');
    console.log(`▶ ${fichier}`);
    // Requête simple (sans paramètres) : PostgreSQL accepte plusieurs instructions.
    // Les seeds gèrent eux-mêmes leur transaction (BEGIN ... COMMIT).
    await pool.query(sql);
    await pool.query('INSERT INTO schema_migrations (fichier) VALUES ($1)', [fichier]);
    joues += 1;
  }

  console.log(joues === 0 ? 'Base déjà à jour.' : `${joues} fichier(s) SQL joué(s).`);
}

main()
  .catch((error) => {
    console.error('❌ Migration interrompue :', error.message);
    process.exitCode = 1;
  })
  .finally(() => pool.end());
