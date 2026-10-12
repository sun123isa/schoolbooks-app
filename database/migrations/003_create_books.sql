-- =============================================================================
-- Migration 003 : création de la table des livres scolaires (books)
-- Cette table stocke les métadonnées des livres et les informations de fichier PDF.
-- Le fichier PDF lui-même sera stocké sur le disque ou un service objet (S3, MinIO, etc.).
-- =============================================================================

-- Création de la table books si elle n'existe pas déjà.
-- Chaque ligne représente un livre scolaire disponible à la recherche et au téléchargement.
CREATE TABLE IF NOT EXISTS books (
  -- Identifiant unique du livre, généré automatiquement sous forme d'UUID.
  -- Permet d'avoir des IDs non séquentiels et difficiles à deviner.
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Titre du livre, obligatoire, longueur maximale 255 caractères.
  -- Correspond au titre affiché dans les résultats de recherche et les listes.
  title VARCHAR(255) NOT NULL,

  -- Auteur ou auteurs du livre, facultatif, longueur maximale 255 caractères.
  -- Peut contenir plusieurs noms séparés par des virgules si nécessaire.
  author VARCHAR(255),

  -- Code ISBN du livre, facultatif, longueur maximale 50 caractères.
  -- Permet d'identifier de manière standardisée un ouvrage publié.
  isbn VARCHAR(50),

  -- Catégorie générale du livre, facultative, longueur maximale 100 caractères.
  -- Exemples : "Manuel", "Cahier d'exercices", "Annales", "Résumé de cours".
  category VARCHAR(100),

  -- Description détaillée du livre, facultative.
  -- Peut contenir des informations sur le contenu, les chapitres, le public cible, etc.
  description TEXT,

  -- Niveau scolaire ciblé par ce livre, obligatoire.
  -- Exemples : "CE1", "CM2", "6e", "3e", "Seconde", "Terminale", "Université".
  -- Stocké en texte libre pour permettre tous les systèmes éducatifs.
  level VARCHAR(50) NOT NULL,

  -- Matière enseignée associée à ce livre, obligatoire.
  -- Exemples : "Mathématiques", "Français", "Informatique", "Physique-Chimie", "Histoire-Géo".
  subject VARCHAR(100) NOT NULL,

  -- Nom du fichier PDF tel qu'il est stocké sur le serveur ou le service objet.
  -- Obligatoire, longueur maximale 255 caractères.
  -- Exemple : "3e-math-manuel-2024.pdf".
  file_name VARCHAR(255) NOT NULL,

  -- Chemin complet ou clé de stockage du fichier PDF.
  -- Obligatoire, longueur maximale 500 caractères.
  -- Exemples :
  --   - En stockage local : "uploads/books/3e-math-manuel-2024.pdf"
  --   - En stockage S3 : "schoolbooks/books/3e-math-manuel-2024.pdf"
  file_path VARCHAR(500) NOT NULL,

  -- Taille du fichier PDF en octets, facultative.
  -- Permet d'afficher la taille au téléchargement et de faire des statistiques.
  file_size BIGINT,

  -- Type MIME du fichier, par défaut "application/pdf" pour les livres scolaires.
  -- Peut être utilisé pour valider que seul un PDF est accepté à l'upload.
  mime_type VARCHAR(100) DEFAULT 'application/pdf',

  -- Nombre de fois où ce livre a été téléchargé, initialisé à 0.
  -- Mis à jour par l'application à chaque téléchargement réussi.
  download_count INTEGER NOT NULL DEFAULT 0,

  -- Indique si le livre est visible et téléchargeable dans le système.
  -- TRUE = actif et disponible ; FALSE = masqué ou désactivé.
  -- Permet de désactiver un livre sans le supprimer de la base.
  is_active BOOLEAN NOT NULL DEFAULT TRUE,

  -- Identifiant du formateur qui a ajouté ou gère ce livre, facultatif.
  -- Référence la table trainers(id) pour assurer l'intégrité référentielle.
  -- Si NULL, le livre n'est pas rattaché à un formateur spécifique.
  trainer_id UUID REFERENCES trainers(id) ON DELETE SET NULL,

  -- Date et heure de création de la fiche livre, automatiquement renseignées.
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Date et heure de dernière modification de la fiche livre, automatiquement mises à jour.
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index sur la colonne level pour accélérer les recherches par niveau scolaire.
-- Très utile pour filtrer les livres d'un niveau donné (ex : tous les livres de 3e).
CREATE INDEX IF NOT EXISTS idx_books_level ON books (level);

-- Index sur la colonne subject pour accélérer les recherches par matière.
-- Utile pour lister tous les livres de "Mathématiques", "Français", etc.
CREATE INDEX IF NOT EXISTS idx_books_subject ON books (subject);

-- Index sur la colonne title pour accélérer les recherches par titre.
-- Améliore les performances des recherches textuelles simples.
CREATE INDEX IF NOT EXISTS idx_books_title ON books (title);

-- Index sur la colonne category pour accélérer les filtres par catégorie.
-- Utile si on filtre par "Manuel", "Cahier d'exercices", etc.
CREATE INDEX IF NOT EXISTS idx_books_category ON books (category);

-- Index sur la colonne is_active pour accélérer les filtres par statut d'activité.
-- Utile pour n'afficher que les livres actifs dans les listes publiques.
CREATE INDEX IF NOT EXISTS idx_books_is_active ON books (is_active);

-- Index composite sur (level, subject) pour optimiser les recherches combinées.
-- Très utile pour les requêtes du type : "Tous les livres de Mathématiques en 3e".
CREATE INDEX IF NOT EXISTS idx_books_level_subject ON books (level, subject);