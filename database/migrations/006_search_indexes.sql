-- =============================================================================
-- Migration 006 : recherche insensible à la casse et aux accents, et index
-- Responsable : Salem KONGOLO (recherche) — relecture : Isaac LELO MAKAYA
-- Prérequis : migrations 001 à 005.
-- Utilisée par apps/api/src/modules/recherche/recherche.repository.js :
--   « economie » trouve « Économie » (README § 5.5, tâche 3) ;
--   les index rendent la recherche rapide (tâche 6).
-- Migration idempotente : peut être rejouée.
-- =============================================================================

-- unaccent : retire les accents ; pg_trgm : index trigrammes pour LIKE '%mot%'.
CREATE EXTENSION IF NOT EXISTS unaccent;
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- unaccent() est seulement STABLE (son dictionnaire pourrait changer) : on
-- l'enveloppe dans une fonction IMMUTABLE, avec le dictionnaire explicite,
-- pour pouvoir l'utiliser dans un index d'expression.
CREATE OR REPLACE FUNCTION immutable_unaccent(texte text)
  RETURNS text
  LANGUAGE sql IMMUTABLE PARALLEL SAFE STRICT
AS $$ SELECT public.unaccent('public.unaccent'::regdictionary, texte) $$;

-- Texte normalisé : minuscules, sans accents. Utilisé à l'identique par
-- l'index ci-dessous et par la requête de recherche.
-- Nom qualifié (public.) obligatoire : depuis PostgreSQL 17, la construction
-- d'un index s'exécute avec un search_path restreint à pg_catalog.
CREATE OR REPLACE FUNCTION texte_normalise(texte text)
  RETURNS text
  LANGUAGE sql IMMUTABLE PARALLEL SAFE
AS $$ SELECT lower(public.immutable_unaccent(COALESCE(texte, ''))) $$;

-- Mot-clé : index trigramme sur titre + description normalisés.
CREATE INDEX IF NOT EXISTS idx_books_recherche_trgm
  ON books USING gin (texte_normalise(title || ' ' || COALESCE(description, '')) gin_trgm_ops);

-- Ressources publiées (is_active) : index partiels pour les tris « recent » et « pertinence ».
CREATE INDEX IF NOT EXISTS idx_books_publiees_annee
  ON books (year DESC NULLS LAST, created_at DESC)
  WHERE is_active = TRUE;

CREATE INDEX IF NOT EXISTS idx_books_publiees_ajout
  ON books (created_at DESC)
  WHERE is_active = TRUE;
