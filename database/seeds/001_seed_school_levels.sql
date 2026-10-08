-- =============================================================================
-- Seed 001 : niveaux scolaires
-- =============================================================================

BEGIN;

INSERT INTO school_levels (
  name,
  code,
  education_cycle,
  display_order,
  is_active
)
VALUES
  ('CE1', 'CE1', 'Primaire', 1, TRUE),
  ('CE2', 'CE2', 'Primaire', 2, TRUE),
  ('CM1', 'CM1', 'Primaire', 3, TRUE),
  ('CM2', 'CM2', 'Primaire', 4, TRUE),
  ('6e', '6E', 'Collège', 5, TRUE),
  ('5e', '5E', 'Collège', 6, TRUE),
  ('4e', '4E', 'Collège', 7, TRUE),
  ('3e', '3E', 'Collège', 8, TRUE),
  ('Seconde', '2NDE', 'Lycée', 9, TRUE),
  ('Première', '1ERE', 'Lycée', 10, TRUE),
  ('Terminale', 'TLE', 'Lycée', 11, TRUE),
  ('Université', 'UNIV', 'Université', 12, TRUE)
ON CONFLICT DO NOTHING;

COMMIT;