-- =============================================================================
-- Migration 005 : création des livres scolaires
-- =============================================================================

-- Crée la table des livres.
CREATE TABLE IF NOT EXISTS books (
  -- Identifiant unique du livre.
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Titre obligatoire.
  title VARCHAR(255) NOT NULL,

  -- Auteur facultatif.
  author VARCHAR(255),

  -- ISBN facultatif.
  isbn VARCHAR(50),

  -- Catégorie du document.
  category VARCHAR(100),

  -- Description facultative.
  description TEXT,

  -- Relation obligatoire vers le niveau scolaire.
  school_level_id UUID NOT NULL,

  -- Relation obligatoire vers la matière.
  subject_id UUID NOT NULL,

  -- Formateur ayant ajouté le livre, facultatif.
  trainer_id UUID,

  -- Nom technique du fichier PDF.
  file_name VARCHAR(255) NOT NULL,

  -- Chemin ou clé du fichier.
  file_path VARCHAR(500) NOT NULL,

  -- Taille du fichier en octets.
  file_size BIGINT,

  -- Type MIME du fichier.
  mime_type VARCHAR(100) NOT NULL DEFAULT 'application/pdf',

  -- Nombre de téléchargements.
  download_count INTEGER NOT NULL DEFAULT 0,

  -- Indique si le livre est visible.
  is_active BOOLEAN NOT NULL DEFAULT TRUE,

  -- Date de création.
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Date de modification.
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Relation vers school_levels.
  CONSTRAINT books_school_level_fk
  FOREIGN KEY (school_level_id)
  REFERENCES school_levels(id)
  ON DELETE RESTRICT,

  -- Relation vers subjects.
  CONSTRAINT books_subject_fk
  FOREIGN KEY (subject_id)
  REFERENCES subjects(id)
  ON DELETE RESTRICT,

  -- Relation facultative vers trainers.
  CONSTRAINT books_trainer_fk
  FOREIGN KEY (trainer_id)
  REFERENCES trainers(id)
  ON DELETE SET NULL,

  -- Tous les fichiers de la plateforme doivent être des PDF.
  CONSTRAINT books_mime_type_check
  CHECK (mime_type = 'application/pdf'),

  -- La taille ne peut pas être négative.
  CONSTRAINT books_file_size_check
  CHECK (file_size IS NULL OR file_size >= 0),

  -- Le compteur ne peut pas être négatif.
  CONSTRAINT books_download_count_check
  CHECK (download_count >= 0)
);

-- Index pour les filtres par niveau.
CREATE INDEX IF NOT EXISTS idx_books_school_level
ON books (school_level_id);

-- Index pour les filtres par matière.
CREATE INDEX IF NOT EXISTS idx_books_subject
ON books (subject_id);

-- Index pour les filtres par formateur.
CREATE INDEX IF NOT EXISTS idx_books_trainer
ON books (trainer_id);

-- Index pour les livres actifs.
CREATE INDEX IF NOT EXISTS idx_books_active
ON books (is_active);

-- Index pour les tris par date.
CREATE INDEX IF NOT EXISTS idx_books_created_at
ON books (created_at DESC);