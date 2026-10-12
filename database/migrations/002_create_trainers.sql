-- =============================================================================
-- Migration 002 : création de la table des formateurs (trainers)
-- Cette table stocke les informations sur les enseignants / formateurs.
-- =============================================================================

-- Création de la table trainers si elle n'existe pas déjà.
-- Chaque ligne représente un formateur unique dans le système.
CREATE TABLE IF NOT EXISTS trainers (
  -- Identifiant unique du formateur, généré automatiquement sous forme d'UUID.
  -- Permet d'avoir des IDs non séquentiels et difficiles à deviner.
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Prénom du formateur, obligatoire, longueur maximale 100 caractères.
  first_name VARCHAR(100) NOT NULL,

  -- Nom de famille du formateur, obligatoire, longueur maximale 100 caractères.
  last_name VARCHAR(100) NOT NULL,

  -- Adresse e-mail du formateur, obligatoire et unique.
  -- Peut servir à l'authentification, aux notifications, ou comme identifiant.
  email VARCHAR(255) UNIQUE NOT NULL,

  -- Numéro de téléphone du formateur, facultatif, longueur maximale 30 caractères.
  phone VARCHAR(30),

  -- Spécialité principale du formateur, obligatoire.
  -- Exemples : "Mathématiques", "Français", "Informatique", "Physique-Chimie".
  -- Peut correspondre à une matière enseignée ou à un domaine de compétence.
  specialty VARCHAR(100) NOT NULL,

  -- Biographie ou présentation courte du formateur, facultative.
  -- Peut être affichée sur un profil public ou dans l'interface administrateur.
  bio TEXT,

  -- Niveaux scolaires que le formateur peut enseigner, stockés sous forme de texte.
  -- Exemple : "6e,5e,4e,3e" ou "Seconde,Première,Terminale".
  -- Stocké en texte libre pour flexibilité ; pourrait devenir une table de liaison plus tard.
  levels_taught TEXT,

  -- Statut du formateur dans le système : 'active', 'inactive', 'suspended', etc.
  -- Valeur par défaut 'active' pour simplifier l'insertion initiale.
  status VARCHAR(30) NOT NULL DEFAULT 'active',

  -- Date et heure de création de la fiche formateur, automatiquement renseignées.
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Date et heure de dernière modification de la fiche formateur, automatiquement mises à jour.
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index sur la colonne specialty pour accélérer les recherches par spécialité.
-- Utile pour lister tous les formateurs de "Mathématiques", "Informatique", etc.
CREATE INDEX IF NOT EXISTS idx_trainers_specialty ON trainers (specialty);

-- Index sur la colonne status pour accélérer les filtres par statut.
-- Utile pour lister rapidement les formateurs actifs, inactifs, etc.
CREATE INDEX IF NOT EXISTS idx_trainers_status ON trainers (status);

-- Index sur email pour accélérer les recherches par adresse e-mail.
-- Même si email est UNIQUE, cet index peut aider certains plans de requête.
CREATE INDEX IF NOT EXISTS idx_trainers_email ON trainers (email);