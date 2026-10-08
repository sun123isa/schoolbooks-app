INSERT INTO subjects (
  name,
  code,
  description,
  is_active
)
VALUES
  (
    'Mathématiques',
    'MATH',
    'Calcul, géométrie, algèbre, analyse et probabilités.',
    TRUE
  ),
  (
    'Français',
    'FR',
    'Lecture, grammaire, conjugaison, expression et littérature.',
    TRUE
  ),
  (
    'Informatique',
    'INFO',
    'Algorithmique, programmation, systèmes et technologies numériques.',
    TRUE
  ),
  (
    'Physique-Chimie',
    'PC',
    'Matière, énergie, mécanique, électricité et chimie.',
    TRUE
  ),
  (
    'Histoire-Géographie',
    'HIST-GEO',
    'Histoire des sociétés et étude des territoires.',
    TRUE
  ),
  (
    'Sciences de la Vie et de la Terre',
    'SVT',
    'Étude du vivant, de la Terre et de l’environnement.',
    TRUE
  ),
  (
    'Économie',
    'ECO',
    'Principes économiques, marchés et organisations.',
    TRUE
  ),
  (
    'Philosophie',
    'PHILO',
    'Réflexion critique, concepts et argumentation.',
    TRUE
  )
ON CONFLICT DO NOTHING;