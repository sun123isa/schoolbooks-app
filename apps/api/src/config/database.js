// Responsable : Isaac LELO MAKAYA (socle backend) — relecture : Salem KONGOLO
import pg from 'pg';

const { Pool } = pg;
// Le Pool maintient plusieurs connexions réutilisables vers PostgreSQL.
// Cela améliore les performances par rapport à une nouvelle connexion à chaque requête.
export const pool = new Pool({
  // La chaîne de connexion est lue depuis la variable d'environnement DATABASE_URL.
  connectionString: process.env.DATABASE_URL
});



// Vérification de la connexion au démarrage (journal du serveur).
// Ignoré pendant les tests automatisés (pas de base de données en CI).
if (process.env.NODE_ENV !== 'test') pool.query('SELECT NOW()', (err, res) => {
  if (err) {
    console.error('❌ Échec connexion PostgreSQL:', err.message);
  } else {
    console.log('✅ Connexion PostgreSQL OK:', res.rows[0].now);
  }
});