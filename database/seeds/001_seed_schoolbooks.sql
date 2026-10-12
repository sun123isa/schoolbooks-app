-- =============================================================================
-- Seed 001 : données de test pour la base schoolbooks_db
-- Ce fichier insère des apprenants, formateurs et livres (PDF) de démonstration.
-- Il suppose que les migrations 001, 002 et 003 ont déjà été exécutées.
-- =============================================================================

-- On encapsule toutes les insertions dans une transaction.
-- Avantages :
--   - soit toutes les lignes sont insérées, soit aucune (atomicité) ;
--   - plus rapide car un seul commit à la fin.
BEGIN;

-- -----------------------------------------------------------------------------
-- 1. Insertion de formateurs (trainers)
-- -----------------------------------------------------------------------------
-- On commence par les formateurs car la table books référence trainer_id.
-- Cela évite les erreurs de clé étrangère lors de l'insertion des livres.

INSERT INTO trainers (
  first_name,
  last_name,
  email,
  phone,
  specialty,
  bio,
  levels_taught,
  status
) VALUES
  -- Formateur 1 : professeur de mathématiques, niveaux collège et lycée.
  (
    'Aminata',
    'Diallo',
    'aminata.diallo@schoolbooks.example',
    '+225 07 01 02 03 04',
    'Mathématiques',
    'Professeure de mathématiques avec 10 ans d''expérience au collège et au lycée.',
    '6e,5e,4e,3e,Seconde,Première,Terminale',
    'active'
  ),
  -- Formateur 2 : professeur de français, principalement collège.
  (
    'Koffi',
    'Yao',
    'koffi.yao@schoolbooks.example',
    '+225 07 05 06 07 08',
    'Français',
    'Enseignant spécialisé en littérature et expression écrite au collège.',
    '6e,5e,4e,3e',
    'active'
  ),
  -- Formateur 3 : informatique, lycée et Université.
  (
    'Fatou',
    'Koné',
    'fatou.kone@schoolbooks.example',
    '+225 07 09 10 11 12',
    'Informatique',
    'Développeuse et enseignante en algorithmique et programmation web.',
    'Seconde,Première,Terminale,Université',
    'active'
  ),
  -- Formateur 4 : physique-chimie, tous niveaux secondaire.
  (
    'Moussa',
    'Traoré',
    'moussa.traore@schoolbooks.example',
    '+225 07 13 14 15 16',
    'Physique-Chimie',
    'Professeur de physique-chimie, passionné par les travaux pratiques.',
    '6e,5e,4e,3e,Seconde,Première,Terminale',
    'active'
  ),
  -- Formateur 5 : histoire-géo, collège et lycée.
  (
    'Aïcha',
    'Sow',
    'aicha.sow@schoolbooks.example',
    '+225 07 17 18 19 20',
    'Histoire-Géo',
    'Enseignante d''histoire-géographie, spécialisée en Afrique contemporaine.',
    '6e,5e,4e,3e,Seconde,Première,Terminale',
    'active'
  );

-- -----------------------------------------------------------------------------
-- 2. Insertion d''apprenants (learners)
-- -----------------------------------------------------------------------------
-- On insère des apprenants de différents niveaux et classes.

INSERT INTO learners (
  first_name,
  last_name,
  email,
  phone,
  birth_date,
  level,
  class_group,
  status
) VALUES
  -- Apprenant 1 : niveau 6e, groupe A.
  (
    'Ibrahim',
    'Camara',
    'ibrahim.camara@student.schoolbooks.example',
    '+225 05 01 02 03 04',
    '2014-03-15',
    '6e',
    'A',
    'active'
  ),
  -- Apprenant 2 : niveau 3e, groupe B.
  (
    'Mariam',
    'Diop',
    'mariam.diop@student.schoolbooks.example',
    '+225 05 05 06 07 08',
    '2011-07-22',
    '3e',
    'B',
    'active'
  ),
  -- Apprenant 3 : niveau Seconde, groupe A.
  (
    'Jean',
    'Kouassi',
    'jean.kouassi@student.schoolbooks.example',
    '+225 05 09 10 11 12',
    '2009-11-05',
    'Seconde',
    'A',
    'active'
  ),
  -- Apprenant 4 : niveau Première, groupe C.
  (
    'Awa',
    'Bamba',
    'awa.bamba@student.schoolbooks.example',
    '+225 05 13 14 15 16',
    '2008-02-18',
    'Première',
    'C',
    'active'
  ),
  -- Apprenant 5 : niveau Terminale, groupe B.
  (
    'Patrick',
    'N''Guessan',
    'patrick.nguessan@student.schoolbooks.example',
    '+225 05 17 18 19 20',
    '2007-09-30',
    'Terminale',
    'B',
    'active'
  ),
  -- Apprenant 6 : niveau Université (Licence 1 Informatique).
  (
    'Esther',
    'Adjoua',
    'esther.adjoua@student.schoolbooks.example',
    '+225 05 21 22 23 24',
    '2006-05-12',
    'Université',
    'L1 Info',
    'active'
  ),
  -- Apprenant 7 : niveau CM2, groupe A (primaire).
  (
    'David',
    'Kouamé',
    'david.kouame@student.schoolbooks.example',
    '+225 05 25 26 27 28',
    '2015-12-01',
    'CM2',
    'A',
    'active'
  ),
  -- Apprenant 8 : niveau CE1, groupe B (primaire).
  (
    'Ruth',
    'Yao',
    'ruth.yao@student.schoolbooks.example',
    '+225 05 29 30 31 32',
    '2017-04-20',
    'CE1',
    'B',
    'active'
  );

-- -----------------------------------------------------------------------------
-- 3. Insertion de livres (books)
-- -----------------------------------------------------------------------------
-- Chaque livre représente un manuel ou cahier scolaire au format PDF.
-- Les chemins file_path sont fictifs et correspondent à un stockage local.
-- Dans un environnement réel, ces fichiers devraient exister dans apps/api/uploads/books/.

-- Pour récupérer les IDs des formateurs, on utilise des sous-requêtes.
-- Cela permet de lier chaque livre à un formateur sans connaître son UUID à l''avance.

INSERT INTO books (
  title,
  author,
  isbn,
  category,
  description,
  level,
  subject,
  file_name,
  file_path,
  file_size,
  mime_type,
  download_count,
  is_active,
  trainer_id
) VALUES
  -- Livre 1 : Mathématiques 6e
  (
    'Mathématiques 6e - Manuel de l''élève',
    'Aminata Diallo',
    '978-2-123456-01-1',
    'Manuel',
    'Manuel complet de mathématiques pour la classe de 6e, conforme au programme officiel.',
    '6e',
    'Mathématiques',
    'math-6e-manuel.pdf',
    'uploads/books/math-6e-manuel.pdf',
    5242880,
    'application/pdf',
    0,
    TRUE,
    (SELECT id FROM trainers WHERE email = 'aminata.diallo@schoolbooks.example' LIMIT 1)
  ),
  -- Livre 2 : Mathématiques 3e
  (
    'Mathématiques 3e - Cahier d''exercices',
    'Aminata Diallo',
    '978-2-123456-02-2',
    'Cahier d''exercices',
    'Recueil d''exercices corrigés pour préparer le brevet en mathématiques.',
    '3e',
    'Mathématiques',
    'math-3e-exercices.pdf',
    'uploads/books/math-3e-exercices.pdf',
    3145728,
    'application/pdf',
    0,
    TRUE,
    (SELECT id FROM trainers WHERE email = 'aminata.diallo@schoolbooks.example' LIMIT 1)
  ),
  -- Livre 3 : Français 6e
  (
    'Français 6e - Lecture et expression',
    'Koffi Yao',
    '978-2-123456-03-3',
    'Manuel',
    'Manuel de français pour la 6e : grammaire, conjugaison, vocabulaire et textes.',
    '6e',
    'Français',
    'francais-6e-manuel.pdf',
    'uploads/books/francais-6e-manuel.pdf',
    4194304,
    'application/pdf',
    0,
    TRUE,
    (SELECT id FROM trainers WHERE email = 'koffi.yao@schoolbooks.example' LIMIT 1)
  ),
  -- Livre 4 : Informatique Seconde
  (
    'Informatique Seconde - Algorithmique et programmation',
    'Fatou Koné',
    '978-2-123456-04-4',
    'Manuel',
    'Introduction à l''algorithmique et à la programmation en Python pour la classe de Seconde.',
    'Seconde',
    'Informatique',
    'info-seconde-python.pdf',
    'uploads/books/info-seconde-python.pdf',
    6291456,
    'application/pdf',
    0,
    TRUE,
    (SELECT id FROM trainers WHERE email = 'fatou.kone@schoolbooks.example' LIMIT 1)
  ),
  -- Livre 5 : Physique-Chimie 3e
  (
    'Physique-Chimie 3e - Manuel et TP',
    'Moussa Traoré',
    '978-2-123456-05-5',
    'Manuel',
    'Manuel de physique-chimie avec protocoles de travaux pratiques pour la 3e.',
    '3e',
    'Physique-Chimie',
    'physique-3e-manuel.pdf',
    'uploads/books/physique-3e-manuel.pdf',
    7340032,
    'application/pdf',
    0,
    TRUE,
    (SELECT id FROM trainers WHERE email = 'moussa.traore@schoolbooks.example' LIMIT 1)
  ),
  -- Livre 6 : Histoire-Géo Première
  (
    'Histoire-Géographie Première - Programme officiel',
    'Aïcha Sow',
    '978-2-123456-06-6',
    'Manuel',
    'Manuel d''histoire-géographie conforme au programme de Première générale.',
    'Première',
    'Histoire-Géo',
    'histgeo-premiere-manuel.pdf',
    'uploads/books/histgeo-premiere-manuel.pdf',
    8388608,
    'application/pdf',
    0,
    TRUE,
    (SELECT id FROM trainers WHERE email = 'aicha.sow@schoolbooks.example' LIMIT 1)
  ),
  -- Livre 7 : Mathématiques Terminale
  (
    'Mathématiques Terminale - Spécialité',
    'Aminata Diallo',
    '978-2-123456-07-7',
    'Manuel',
    'Manuel de mathématiques pour la spécialité Mathématiques en Terminale.',
    'Terminale',
    'Mathématiques',
    'math-terminale-specialite.pdf',
    'uploads/books/math-terminale-specialite.pdf',
    9437184,
    'application/pdf',
    0,
    TRUE,
    (SELECT id FROM trainers WHERE email = 'aminata.diallo@schoolbooks.example' LIMIT 1)
  ),
  -- Livre 8 : Informatique Université (Licence 1)
  (
    'Introduction à l''informatique - Licence 1',
    'Fatou Koné',
    '978-2-123456-08-8',
    'Manuel',
    'Cours d''introduction à l''informatique pour la première année de licence.',
    'Université',
    'Informatique',
    'info-licence1-intro.pdf',
    'uploads/books/info-licence1-intro.pdf',
    10485760,
    'application/pdf',
    0,
    TRUE,
    (SELECT id FROM trainers WHERE email = 'fatou.kone@schoolbooks.example' LIMIT 1)
  ),
  -- Livre 9 : Français 3e - Annales brevet
  (
    'Français 3e - Annales du brevet',
    'Koffi Yao',
    '978-2-123456-09-9',
    'Annales',
    'Sujets corrigés du brevet de français pour s''entraîner efficacement.',
    '3e',
    'Français',
    'francais-3e-annales.pdf',
    'uploads/books/francais-3e-annales.pdf',
    2097152,
    'application/pdf',
    0,
    TRUE,
    (SELECT id FROM trainers WHERE email = 'koffi.yao@schoolbooks.example' LIMIT 1)
  ),
  -- Livre 10 : Physique-Chimie Seconde
  (
    'Physique-Chimie Seconde - Manuel',
    'Moussa Traoré',
    '978-2-123456-10-0',
    'Manuel',
    'Manuel de physique-chimie pour la classe de Seconde générale.',
    'Seconde',
    'Physique-Chimie',
    'physique-seconde-manuel.pdf',
    'uploads/books/physique-seconde-manuel.pdf',
    6815744,
    'application/pdf',
    0,
    TRUE,
    (SELECT id FROM trainers WHERE email = 'moussa.traore@schoolbooks.example' LIMIT 1)
  );

-- Validation de la transaction : toutes les insertions sont confirmées.
-- Si une erreur survient avant ce COMMIT, aucune donnée ne sera insérée.
COMMIT;

-- -----------------------------------------------------------------------------
-- Requêtes de vérification (optionnelles, pour tester manuellement)
-- -----------------------------------------------------------------------------
-- Tu peux exécuter ces requêtes après le seed pour vérifier les données.

-- Compter le nombre de formateurs insérés.
-- SELECT COUNT(*) AS total_trainers FROM trainers;

-- Compter le nombre d''apprenants insérés.
-- SELECT COUNT(*) AS total_learners FROM learners;

-- Compter le nombre de livres insérés.
-- SELECT COUNT(*) AS total_books FROM books;

-- Lister tous les livres avec leur formateur responsable.
-- SELECT
--   b.title,
--   b.level,
--   b.subject,
--   t.first_name || ' ' || t.last_name AS trainer_name
-- FROM books b
-- LEFT JOIN trainers t ON b.trainer_id = t.id
-- ORDER BY b.level, b.subject;