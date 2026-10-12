-- =============================================================================
-- Migration 001 : création de la table des apprenants (learners)
-- Cette table stocke les informations de base sur chaque élève / étudiant.
-- =============================================================================

-- Extension nécessaire pour générer des identifiants UUID aléatoires.
-- gen_random_uuid() sera utilisé comme valeur par défaut pour les colonnes id.
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Création de la table learners si elle n'existe pas déjà.
-- Chaque ligne représente un apprenant unique dans le système.
CREATE TABLE IF NOT EXISTS learners (
  -- Identifiant unique de l'apprenant, généré automatiquement sous forme d'UUID.
  -- UUID est préférable à un entier pour des raisons de sécurité et de distribution.
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

  -- Prénom de l'apprenant, obligatoire, longueur maximale 100 caractères.
  first_name VARCHAR(100) NOT NULL,

  -- Nom de famille de l'apprenant, obligatoire, longueur maximale 100 caractères.
  last_name VARCHAR(100) NOT NULL,

  -- Adresse e-mail de l'apprenant, obligatoire et unique pour éviter les doublons.
  -- Utilisé potentiellement pour l'authentification ou les notifications.
  email VARCHAR(255) UNIQUE NOT NULL,

  -- Numéro de téléphone de l'apprenant, facultatif, longueur maximale 30 caractères.
  -- Peut contenir des espaces, des "+" ou des formats internationaux.
  phone VARCHAR(30),

  -- Date de naissance de l'apprenant, facultative.
  -- Permet de calculer l'âge ou de vérifier l'éligibilité à certains niveaux.
  birth_date DATE,

  -- Niveau scolaire actuel de l'apprenant (CE1, CM2, 6e, Terminale, Université, etc.).
  -- Stocké en texte libre pour permettre une grande flexibilité selon le pays / système.
  -- Pourrait être transformé en ENUM plus tard si la liste devient fixe.
  level VARCHAR(50) NOT NULL,

  -- Classe ou groupe de l'apprenant au sein du niveau, facultatif.
  -- Exemple : "A", "B", "Groupe 1", etc.
  class_group VARCHAR(50),

  -- Statut de l'apprenant dans le système : 'active', 'inactive', 'suspended', etc.
  -- Valeur par défaut 'active' pour simplifier l'insertion initiale.
  status VARCHAR(30) NOT NULL DEFAULT 'active',

  -- Date et heure de création de la fiche apprenant, automatiquement renseignées.
  -- TIMESTAMPTZ = timestamp avec fuseau horaire, recommandé pour les applications multi-régions.
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  -- Date et heure de dernière modification de la fiche apprenant, automatiquement mises à jour.
  -- Par défaut, on met NOW(), mais l'application devra mettre à jour cette colonne à chaque UPDATE.
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index sur la colonne level pour accélérer les recherches par niveau scolaire.
-- Utile quand on filtrera les apprenants par niveau (ex : tous les élèves de 3e).
CREATE INDEX IF NOT EXISTS idx_learners_level ON learners (level);

-- Index sur la colonne status pour accélérer les filtres par statut.
-- Utile pour lister rapidement les apprenants actifs, inactifs, etc.
CREATE INDEX IF NOT EXISTS idx_learners_status ON learners (status);

-- Index sur email pour accélérer les recherches par adresse e-mail.
-- Même si email est UNIQUE, un index explicite peut aider certains plans de requête.
CREATE INDEX IF NOT EXISTS idx_learners_email ON learners (email);