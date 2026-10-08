# Schoolbooks

## Plateforme de bibliothèque scolaire

Schoolbooks est une plateforme web de bibliothèque scolaire permettant de publier, rechercher, consulter et télécharger des ressources pédagogiques au format PDF.

Le projet comprend :

- une API backend développée avec Node.js, Express et PostgreSQL ;
- une application frontend développée avec React et Vite.

La plateforme distingue deux types de comptes :

- les apprenants ;
- les formateurs.

Les apprenants peuvent consulter les livres disponibles. Les formateurs peuvent publier et gérer leurs ressources pédagogiques.

---

## Sommaire

1. [Équipe et répartition des tâches](#1-équipe-et-répartition-des-tâches)
2. [Liste complète des endpoints](#2-liste-complète-des-endpoints)
3. [Fonctionnalités](#3-fonctionnalités)
4. [Technologies](#4-technologies)
5. [Arborescence](#5-arborescence)
6. [Installation locale](#6-installation-locale)
7. [Configuration PostgreSQL](#7-configuration-postgresql)
8. [Variables d'environnement](#8-variables-denvironnement)
9. [Démarrage](#9-démarrage)
10. [Architecture backend](#10-architecture-backend)
11. [Authentification](#11-authentification)
12. [Détail des endpoints](#12-détail-des-endpoints)
13. [Schéma réel des données](#13-schéma-réel-des-données)
14. [Relations entre les tables](#14-relations-entre-les-tables)
15. [Correspondance frontend/backend](#15-correspondance-frontendbackend)
16. [Format des réponses](#16-format-des-réponses)
17. [Tests manuels](#17-tests-manuels)
18. [Sécurité](#18-sécurité)
19. [Dépannage](#19-dépannage)

---

## 1. Équipe et répartition des tâches

| Membre | Rôle principal | Périmètre |
|---|---|---|
| Jean Baptiste | Développeur frontend | Application React, interface, navigation, intégration des endpoints et expérience utilisateur. |
| Sunelson Isaac | Développeur backend — authentification | API Express, comptes, sessions, tokens, rôles, middlewares, sécurité et PostgreSQL. |
| Salem | Développeur backend — bibliothèque | Livres, PDF, recherche, pagination, téléchargement, statistiques et ressources formateur. |

### Jean Baptiste — frontend

- Créer et maintenir les pages React.
- Configurer les routes frontend avec React Router.
- Développer `Navbar`, `BookCard` et les composants réutilisables.
- Intégrer `AuthContext`.
- Connecter les pages aux services `auth.api.js` et `books.api.js`.
- Intégrer les endpoints de connexion, inscription, refresh et déconnexion.
- Développer l'affichage des livres.
- Intégrer la recherche, les filtres et la pagination.
- Développer la page de lecture PDF.
- Intégrer le téléchargement des livres.
- Afficher le compteur `download_count`.
- Développer le dashboard formateur.
- Afficher les statistiques renvoyées par l'API.
- Développer la page de gestion des livres.
- Gérer les états de chargement, d'erreur et de succès.
- Maintenir le responsive design et les styles CSS.

### Sunelson Isaac — backend authentification et comptes

- Configurer le serveur Express.
- Configurer la connexion PostgreSQL.
- Développer l'inscription des apprenants.
- Développer l'inscription des formateurs.
- Développer la connexion.
- Développer la restauration de session.
- Développer la déconnexion.
- Gérer les access tokens.
- Gérer les refresh tokens et leur hash dans `refresh_tokens`.
- Gérer le cookie HTTP-only.
- Développer les middlewares d'authentification.
- Développer les middlewares de rôle et de permissions.
- Valider les données reçues par l'API.
- Gérer CORS et `cookie-parser`.
- Gérer les erreurs globales.
- Documenter les contrats des endpoints d'authentification.

### Salem — backend livres et ressources

- Développer les endpoints des livres.
- Développer la récupération des niveaux scolaires.
- Développer la récupération des matières.
- Développer l'ajout d'un livre.
- Gérer l'upload des fichiers PDF.
- Vérifier le type MIME `application/pdf`.
- Enregistrer `file_name`, `file_path`, `file_size` et `mime_type`.
- Développer la recherche et les filtres.
- Développer la pagination.
- Développer la route `/api/books/trainer/mine`.
- Développer la modification des livres.
- Développer la désactivation et la restauration.
- Développer la suppression définitive.
- Développer l'affichage et le téléchargement des PDF.
- Incrémenter `download_count`.
- Vérifier les permissions du formateur propriétaire.
- Préparer les données nécessaires au dashboard formateur.

### Travail partagé

- Tester les endpoints ensemble.
- Vérifier la correspondance entre les noms de champs backend et frontend.
- Mettre à jour la documentation après chaque modification d'endpoint ou de migration.
- Vérifier les scénarios d'erreur.
- Vérifier l'intégration locale frontend/backend.

---

## 2. Liste complète des endpoints

Cette section liste tous les endpoints avant leur explication détaillée.

### Authentification

| Méthode | Endpoint | Accès |
|---|---|---|
| `POST` | `/api/auth/register/learner` | Public |
| `POST` | `/api/auth/register/trainer` | Public |
| `POST` | `/api/auth/login` | Public |
| `POST` | `/api/auth/refresh` | Cookie de refresh token |
| `GET` | `/api/auth/me` | Access token |
| `POST` | `/api/auth/logout` | Session courante |

### Niveaux scolaires

| Méthode | Endpoint | Accès |
|---|---|---|
| `GET` | `/api/school-levels` | Selon la configuration des routes |

### Matières

| Méthode | Endpoint | Accès |
|---|---|---|
| `GET` | `/api/subjects` | Selon la configuration des routes |

### Livres publics

| Méthode | Endpoint | Accès |
|---|---|---|
| `GET` | `/api/books` | Public |
| `GET` | `/api/books/:id` | Public |
| `GET` | `/api/uploads/books/:fileName` | Lecture du PDF |
| `GET` | `/api/books/:id/download` | Utilisateur authentifié selon la protection activée |

### Livres du formateur

| Méthode | Endpoint | Accès |
|---|---|---|
| `GET` | `/api/books/trainer/mine` | Formateur authentifié |
| `POST` | `/api/books` | Formateur authentifié |
| `PATCH` | `/api/books/trainer/:id` | Formateur propriétaire |
| `DELETE` | `/api/books/trainer/:id` | Formateur propriétaire |
| `PATCH` | `/api/books/trainer/:id/restore` | Formateur propriétaire |
| `DELETE` | `/api/books/trainer/:id/permanent` | Formateur propriétaire |

### Résumé des endpoints

```text
POST   /api/auth/register/learner
POST   /api/auth/register/trainer
POST   /api/auth/login
POST   /api/auth/refresh
GET    /api/auth/me
POST   /api/auth/logout

GET    /api/school-levels
GET    /api/subjects

GET    /api/books
GET    /api/books/:id
GET    /api/uploads/books/:fileName
GET    /api/books/:id/download

GET    /api/books/trainer/mine
POST   /api/books
PATCH  /api/books/trainer/:id
DELETE /api/books/trainer/:id
PATCH  /api/books/trainer/:id/restore
DELETE /api/books/trainer/:id/permanent
```

---

## 3. Fonctionnalités

### Comptes et authentification

- Inscription d'un apprenant.
- Inscription d'un formateur.
- Connexion et déconnexion.
- Restauration de session.
- Access token et refresh token.
- Cookies HTTP-only.
- Contrôle des rôles et des permissions.

### Livres et ressources

- Création d'un livre par un formateur.
- Upload de fichiers PDF.
- Recherche par mot-clé.
- Filtrage par niveau et matière.
- Pagination.
- Consultation des détails d'un livre.
- Lecture du PDF dans le navigateur.
- Téléchargement du PDF.
- Compteur de téléchargements.
- Modification d'un livre.
- Désactivation et restauration.
- Suppression définitive.

### Dashboard formateur

- Nombre de livres du formateur.
- Nombre total de téléchargements.
- Nombre de livres actifs.
- Nombre de matières utilisées.
- Accès à l'ajout d'un livre.
- Accès à la gestion des livres.

---

## 4. Technologies

### Frontend

- React.
- Vite.
- React Router.
- JavaScript moderne avec ES Modules.
- Fetch API.
- React Context API.
- CSS responsive.

### Backend

- Node.js.
- Express.
- PostgreSQL.
- `pg`.
- JWT ou mécanisme équivalent pour l'access token.
- Cookies HTTP-only pour les refresh tokens.
- `cookie-parser`.
- `cors`.
- Nodemon.
- Middleware multipart pour l'upload PDF.

### Base de données

- PostgreSQL.
- Extension `pgcrypto`.
- UUID.
- Clés étrangères.
- Contraintes `UNIQUE` et `CHECK`.
- Index pour les filtres et les recherches.
- Migrations SQL.

---

## 5. Arborescence

```text
schoolbooks-app/
├── apps/
│   ├── api/
│   │   ├── src/
│   │   │   ├── config/
│   │   │   ├── controllers/
│   │   │   ├── middlewares/
│   │   │   ├── routes/
│   │   │   ├── services/
│   │   │   ├── validators/
│   │   │   └── server.js
│   │   ├── uploads/
│   │   │   └── books/
│   │   ├── migrations/
│   │   │   ├── 001_create_school_levels.sql
│   │   │   ├── 002_create_subjects.sql
│   │   │   ├── 003_create_trainers.sql
│   │   │   ├── 004_create_learners.sql
│   │   │   ├── 005_create_books.sql
│   │   │   └── 006_add_authentication.sql
│   │   ├── .env
│   │   └── package.json
│   └── web/
│       ├── src/
│       │   ├── components/
│       │   ├── context/
│       │   ├── pages/
│       │   ├── services/
│       │   ├── routes/
│       │   ├── App.jsx
│       │   └── main.jsx
│       ├── public/
│       ├── .env
│       └── package.json
├── package.json
└── README.md
```

---

## 6. Installation locale

### Prérequis

- Node.js LTS.
- npm.
- PostgreSQL.
- Git.

Vérifier les installations :

```bash
node --version
npm --version
psql --version
```

### Cloner le projet

```bash
git clone <URL_DU_DEPOT>
cd schoolbooks-app
```

### Installer les dépendances

```bash
npm install
```

Si les applications ont des fichiers `package.json` séparés :

```bash
cd apps/api
npm install

cd ../web
npm install
```

---

## 7. Configuration PostgreSQL

### Créer la base

```sql
CREATE DATABASE schoolbooks_db;
```

### Activer `pgcrypto`

La migration 001 active l'extension :

```sql
CREATE EXTENSION IF NOT EXISTS pgcrypto;
```

Elle permet d'utiliser :

```sql
gen_random_uuid()
```

### Exécuter les migrations

Depuis `apps/api` :

```bash
psql -U <utilisateur> -d schoolbooks_db -f migrations/001_create_school_levels.sql
psql -U <utilisateur> -d schoolbooks_db -f migrations/002_create_subjects.sql
psql -U <utilisateur> -d schoolbooks_db -f migrations/003_create_trainers.sql
psql -U <utilisateur> -d schoolbooks_db -f migrations/004_create_learners.sql
psql -U <utilisateur> -d schoolbooks_db -f migrations/005_create_books.sql
psql -U <utilisateur> -d schoolbooks_db -f migrations/006_add_authentication.sql
```

Ordre des migrations :

1. niveaux scolaires ;
2. matières ;
3. formateurs ;
4. apprenants ;
5. livres ;
6. authentification et sessions.

---

## 8. Variables d'environnement

### Backend — `apps/api/.env`

```env
NODE_ENV=development
PORT=3000
DATABASE_URL=postgresql://<utilisateur>:<mot_de_passe>@localhost:5432/schoolbooks_db
FRONTEND_URL=http://localhost:5173
UPLOADS_BOOKS_DIRECTORY=uploads/books
JWT_ACCESS_SECRET=secret_access_local
JWT_REFRESH_SECRET=secret_refresh_local
ACCESS_TOKEN_EXPIRES_IN=15m
REFRESH_TOKEN_EXPIRES_IN=30d
```

### Frontend — `apps/web/.env`

```env
VITE_API_URL=http://localhost:3000/api
```

Ne jamais publier les fichiers `.env`.

---

## 9. Démarrage

### Backend

```bash
cd apps/api
npm run dev
```

API :

```text
http://localhost:3000
```

Base API :

```text
http://localhost:3000/api
```

### Frontend

Dans un autre terminal :

```bash
cd apps/web
npm run dev
```

Frontend :

```text
http://localhost:5173
```

---

## 10. Architecture backend

- Les routes déclarent les endpoints.
- Les middlewares vérifient l'authentification, les rôles, les fichiers et les données.
- Les contrôleurs traitent les requêtes HTTP.
- Les services contiennent la logique métier.
- La couche PostgreSQL exécute les requêtes paramétrées.
- Les migrations versionnent la structure de la base de données.

---

## 11. Authentification

L'application utilise :

- un access token dans l'en-tête `Authorization` ;
- un refresh token envoyé par cookie HTTP-only.

### Access token

```http
Authorization: Bearer <accessToken>
```

### Cookie de refresh

Les requêtes frontend concernées doivent utiliser :

```js
fetch(url, {
  credentials: 'include'
});
```

Le backend doit configurer CORS avec l'origine du frontend et `credentials: true`.

Le refresh token est stocké sous forme de hash dans `refresh_tokens`.

---

## 12. Détail des endpoints

### 12.1 Authentification

#### Inscrire un apprenant

```http
POST /api/auth/register/learner
Content-Type: application/json
```

Corps :

```json
{
  "first_name": "Jean",
  "last_name": "Dupont",
  "email": "jean@example.com",
  "phone": "+22500000000",
  "birth_date": "2010-05-12",
  "school_level_id": "uuid-du-niveau",
  "class_group": "CM2-A",
  "password": "mot-de-passe"
}
```

#### Inscrire un formateur

```http
POST /api/auth/register/trainer
Content-Type: application/json
```

Corps :

```json
{
  "first_name": "Salif",
  "last_name": "Koulibaly",
  "email": "salif@example.com",
  "phone": "+22500000000",
  "specialty": "Français",
  "bio": "Formateur de français",
  "password": "mot-de-passe"
}
```

#### Se connecter

```http
POST /api/auth/login
Content-Type: application/json
```

Corps :

```json
{
  "email": "salif@example.com",
  "password": "mot-de-passe"
}
```

Réponse type :

```json
{
  "success": true,
  "data": {
    "accessToken": "jwt-access-token"
  }
}
```

#### Restaurer la session

```http
POST /api/auth/refresh
```

Le refresh token est lu depuis le cookie HTTP-only. Le backend vérifie son hash, son expiration et sa révocation.

#### Obtenir le compte courant

```http
GET /api/auth/me
Authorization: Bearer <accessToken>
```

#### Se déconnecter

```http
POST /api/auth/logout
```

La session est révoquée et le cookie est supprimé.

### 12.2 Niveaux scolaires

```http
GET /api/school-levels
```

Réponse possible :

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "CM2",
      "code": "CM2",
      "education_cycle": "Primaire",
      "display_order": 5,
      "is_active": true
    }
  ]
}
```

### 12.3 Matières

```http
GET /api/subjects
```

Réponse possible :

```json
{
  "success": true,
  "data": [
    {
      "id": "uuid",
      "name": "Français",
      "code": "FR",
      "description": "Matière de français",
      "is_active": true
    }
  ]
}
```

### 12.4 Lister les livres

```http
GET /api/books
```

Paramètres :

| Paramètre | Description | Exemple |
|---|---|---|
| `q` | Recherche textuelle. | `lecture` |
| `level` | Niveau ou code du niveau. | `CM2` |
| `subject` | Matière ou code de la matière. | `Français` |
| `page` | Numéro de page. | `1` |
| `limit` | Nombre de résultats. | `20` |

Exemple :

```http
GET /api/books?q=lecture&level=CM2&subject=Français&page=1&limit=20
```

Réponse type :

```json
{
  "success": true,
  "data": {
    "items": [],
    "total": 0,
    "page": 1,
    "limit": 20,
    "totalPages": 0
  }
}
```

### 12.5 Obtenir un livre

```http
GET /api/books/:id
```

### 12.6 Afficher un PDF

```http
GET /api/uploads/books/:fileName
```

Headers attendus :

```http
Content-Type: application/pdf
Content-Disposition: inline
```

### 12.7 Télécharger un PDF

```http
GET /api/books/:id/download
Authorization: Bearer <accessToken>
```

Cette route vérifie le livre, vérifie le fichier, augmente `download_count` et renvoie le PDF avec :

```http
Content-Type: application/pdf
Content-Disposition: attachment; filename="livre.pdf"
```

### 12.8 Récupérer les livres du formateur

```http
GET /api/books/trainer/mine
Authorization: Bearer <accessToken>
```

### 12.9 Ajouter un livre

```http
POST /api/books
Authorization: Bearer <accessToken>
Content-Type: multipart/form-data
```

Champs :

| Champ | Obligatoire | Description |
|---|---:|---|
| `title` | Oui | Titre du livre. |
| `author` | Non | Auteur ou auteurs. |
| `isbn` | Non | ISBN. |
| `category` | Non | Catégorie. |
| `description` | Non | Description. |
| `school_level_id` | Oui | Identifiant d'un niveau existant. |
| `subject_id` | Oui | Identifiant d'une matière existante. |
| `file` | Oui | Fichier PDF. |

Champs complétés côté backend :

- `trainer_id` ;
- `file_name` ;
- `file_path` ;
- `file_size` ;
- `mime_type` ;
- `download_count` ;
- `is_active` ;
- `created_at` ;
- `updated_at`.

### 12.10 Modifier un livre

```http
PATCH /api/books/trainer/:id
Authorization: Bearer <accessToken>
Content-Type: application/json
```

### 12.11 Désactiver un livre

```http
DELETE /api/books/trainer/:id
Authorization: Bearer <accessToken>
```

La désactivation met `is_active` à `false`.

### 12.12 Restaurer un livre

```http
PATCH /api/books/trainer/:id/restore
Authorization: Bearer <accessToken>
```

La restauration remet `is_active` à `true`.

### 12.13 Supprimer définitivement un livre

```http
DELETE /api/books/trainer/:id/permanent
Authorization: Bearer <accessToken>
```

---

## 13. Schéma réel des données

Le schéma est créé par six migrations :

```text
001 — school_levels
002 — subjects
003 — trainers
004 — learners
005 — books
006 — authentification et refresh_tokens
```

### 13.1 `school_levels`

| Champ | Type | Description |
|---|---|---|
| `id` | UUID | Clé primaire générée avec `gen_random_uuid()`. |
| `name` | VARCHAR(100) | Nom du niveau, obligatoire et unique. |
| `code` | VARCHAR(30) | Code du niveau, obligatoire et unique. |
| `education_cycle` | VARCHAR(50) | Cycle : Primaire, Collège, Lycée ou Université. |
| `display_order` | INTEGER | Ordre d'affichage, unique et supérieur à zéro. |
| `is_active` | BOOLEAN | Niveau actif ou non, `TRUE` par défaut. |
| `created_at` | TIMESTAMPTZ | Date de création. |
| `updated_at` | TIMESTAMPTZ | Date de modification. |

### 13.2 `subjects`

| Champ | Type | Description |
|---|---|---|
| `id` | UUID | Clé primaire générée automatiquement. |
| `name` | VARCHAR(100) | Nom de la matière, obligatoire et unique. |
| `code` | VARCHAR(50) | Code de la matière, obligatoire et unique. |
| `description` | TEXT | Description facultative. |
| `is_active` | BOOLEAN | Matière active ou non, `TRUE` par défaut. |
| `created_at` | TIMESTAMPTZ | Date de création. |
| `updated_at` | TIMESTAMPTZ | Date de modification. |

### 13.3 `trainers`

| Champ | Type | Description |
|---|---|---|
| `id` | UUID | Clé primaire générée automatiquement. |
| `first_name` | VARCHAR(100) | Prénom obligatoire. |
| `last_name` | VARCHAR(100) | Nom obligatoire. |
| `email` | VARCHAR(255) | E-mail obligatoire et unique. |
| `phone` | VARCHAR(30) | Téléphone facultatif. |
| `specialty` | VARCHAR(100) | Spécialité obligatoire. |
| `bio` | TEXT | Biographie facultative. |
| `status` | VARCHAR(30) | `active`, `inactive` ou `suspended`. |
| `password_hash` | TEXT | Mot de passe haché ajouté par la migration 006. |
| `email_verified_at` | TIMESTAMPTZ | Date de vérification de l'e-mail. |
| `last_login_at` | TIMESTAMPTZ | Date de dernière connexion. |
| `created_at` | TIMESTAMPTZ | Date de création. |
| `updated_at` | TIMESTAMPTZ | Date de modification. |

### 13.4 `learners`

| Champ | Type | Description |
|---|---|---|
| `id` | UUID | Clé primaire générée automatiquement. |
| `first_name` | VARCHAR(100) | Prénom obligatoire. |
| `last_name` | VARCHAR(100) | Nom obligatoire. |
| `email` | VARCHAR(255) | E-mail obligatoire et unique. |
| `phone` | VARCHAR(30) | Téléphone facultatif. |
| `birth_date` | DATE | Date de naissance facultative. |
| `school_level_id` | UUID | Niveau obligatoire, référence `school_levels(id)`. |
| `class_group` | VARCHAR(50) | Classe ou groupe facultatif. |
| `status` | VARCHAR(30) | `active`, `inactive` ou `suspended`. |
| `password_hash` | TEXT | Mot de passe haché ajouté par la migration 006. |
| `email_verified_at` | TIMESTAMPTZ | Date de vérification de l'e-mail. |
| `last_login_at` | TIMESTAMPTZ | Date de dernière connexion. |
| `created_at` | TIMESTAMPTZ | Date de création. |
| `updated_at` | TIMESTAMPTZ | Date de modification. |

### 13.5 `books`

| Champ | Type | Description |
|---|---|---|
| `id` | UUID | Clé primaire générée automatiquement. |
| `title` | VARCHAR(255) | Titre obligatoire. |
| `author` | VARCHAR(255) | Auteur facultatif. |
| `isbn` | VARCHAR(50) | ISBN facultatif. |
| `category` | VARCHAR(100) | Catégorie facultative. |
| `description` | TEXT | Description facultative. |
| `school_level_id` | UUID | Niveau obligatoire, référence `school_levels(id)`. |
| `subject_id` | UUID | Matière obligatoire, référence `subjects(id)`. |
| `trainer_id` | UUID | Formateur propriétaire, référence `trainers(id)`. |
| `file_name` | VARCHAR(255) | Nom technique obligatoire du fichier PDF. |
| `file_path` | VARCHAR(500) | Chemin obligatoire du fichier. |
| `file_size` | BIGINT | Taille en octets, nulle ou positive. |
| `mime_type` | VARCHAR(100) | Doit être `application/pdf`. |
| `download_count` | INTEGER | Compteur, `0` par défaut et jamais négatif. |
| `is_active` | BOOLEAN | Visibilité du livre, `TRUE` par défaut. |
| `created_at` | TIMESTAMPTZ | Date de création. |
| `updated_at` | TIMESTAMPTZ | Date de modification. |

### 13.6 `refresh_tokens`

| Champ | Type | Description |
|---|---|---|
| `id` | UUID | Identifiant de la session. |
| `token_hash` | TEXT | Hash unique du refresh token. |
| `account_type` | VARCHAR(20) | `learner` ou `trainer`. |
| `account_id` | UUID | Identifiant du compte concerné. |
| `expires_at` | TIMESTAMPTZ | Date d'expiration. |
| `revoked_at` | TIMESTAMPTZ | Date de révocation éventuelle. |
| `created_at` | TIMESTAMPTZ | Date de création. |

`account_id` est polymorphe : il correspond à `learners.id` lorsque `account_type` vaut `learner`, ou à `trainers.id` lorsque `account_type` vaut `trainer`. La migration ne crée pas de clé étrangère directe sur cette colonne.

---

## 14. Relations entre les tables

```text
school_levels 1 ──── N learners
school_levels 1 ──── N books
subjects      1 ──── N books
trainers      1 ──── N books
```

Règles de suppression :

- un niveau utilisé par un apprenant ne peut pas être supprimé ;
- un niveau utilisé par un livre ne peut pas être supprimé ;
- une matière utilisée par un livre ne peut pas être supprimée ;
- lorsqu'un formateur est supprimé, `books.trainer_id` devient `NULL` ;
- les refresh tokens sont associés par `account_type` et `account_id`.

---

## 15. Correspondance frontend/backend

| Fonction frontend | Endpoint backend |
|---|---|
| `fetchBooks(filters)` | `GET /api/books` |
| `fetchBookById(id)` | `GET /api/books/:id` |
| `downloadBookRequest(id, accessToken)` | `GET /api/books/:id/download` |
| `fetchTrainerBooks(accessToken)` | `GET /api/books/trainer/mine` |
| `createBookRequest(formData, accessToken)` | `POST /api/books` |
| `updateTrainerBookRequest(id, data, accessToken)` | `PATCH /api/books/trainer/:id` |
| `deactivateTrainerBookRequest(id, accessToken)` | `DELETE /api/books/trainer/:id` |
| `activateTrainerBookRequest(id, accessToken)` | `PATCH /api/books/trainer/:id/restore` |
| `deleteTrainerBookRequest(id, accessToken)` | `DELETE /api/books/trainer/:id/permanent` |

---

## 16. Format des réponses

### Succès

```json
{
  "success": true,
  "data": {}
}
```

### Erreur

```json
{
  "success": false,
  "error": {
    "message": "Livre introuvable",
    "code": "BOOK_NOT_FOUND"
  }
}
```

### Codes d'erreur

| Code | Signification |
|---|---|
| `AUTHENTICATION_REQUIRED` | Access token absent ou invalide. |
| `REFRESH_TOKEN_MISSING` | Cookie de refresh token absent. |
| `BOOK_NOT_FOUND` | Livre introuvable. |
| `BOOK_FILE_NOT_FOUND` | PDF absent du stockage. |
| `VALIDATION_ERROR` | Données invalides. |
| `FORBIDDEN` | Permission insuffisante. |

---

## 17. Tests manuels

### Authentification

1. Créer un apprenant.
2. Créer un formateur.
3. Se connecter.
4. Vérifier la réception de l'access token.
5. Vérifier la création du cookie de refresh token.
6. Appeler `/api/auth/me`.
7. Actualiser le frontend.
8. Vérifier la restauration avec `/api/auth/refresh`.
9. Se déconnecter.
10. Vérifier la révocation de la session.

### Livres

1. Se connecter avec un formateur.
2. Récupérer un `school_level_id` valide.
3. Récupérer un `subject_id` valide.
4. Envoyer un PDF avec `POST /api/books`.
5. Vérifier la création du livre.
6. Vérifier le stockage du PDF.
7. Vérifier l'affichage avec la route PDF.
8. Télécharger le livre.
9. Vérifier l'incrémentation de `download_count`.
10. Modifier le livre.
11. Désactiver le livre.
12. Restaurer le livre.
13. Supprimer définitivement le livre.

### Recherche

Tester :

```text
q
level
subject
page
limit
```

### Dashboard formateur

Vérifier :

- le nombre réel de livres ;
- la somme de `download_count` ;
- le nombre de livres actifs ;
- le nombre de matières différentes.

---

## 18. Sécurité

- Ne jamais stocker les mots de passe en clair.
- Utiliser `password_hash` pour les mots de passe.
- Stocker les refresh tokens sous forme de hash.
- Utiliser un cookie HTTP-only.
- Vérifier l'access token côté backend.
- Vérifier le rôle et le propriétaire du livre.
- Utiliser le `trainer_id` du compte authentifié.
- Vérifier le type MIME et la taille du PDF.
- Utiliser des requêtes SQL paramétrées.
- Ne jamais commiter `.env`.
- Utiliser HTTPS et `secure: true` en production.

---

## 19. Dépannage

### `Refresh token absent`

Cette erreur est normale au premier chargement lorsqu'aucun cookie de session n'existe encore.

Après connexion, vérifier :

- `credentials: 'include'` côté frontend ;
- `credentials: true` côté CORS ;
- `cookie-parser` ;
- le nom du cookie ;
- `sameSite` ;
- `secure` en environnement local.

### `Authentification requise`

Vérifier l'en-tête :

```http
Authorization: Bearer <accessToken>
```

### `does not provide an export named`

L'import frontend doit correspondre exactement à l'export du fichier de service :

```js
export async function fetchTrainerBooks() {}
```

```js
import {
  fetchTrainerBooks
} from '../services/books.api.js';
```

### Dashboard formateur vide

Vérifier :

- que la session est restaurée ;
- que le compte est dans `trainers` ;
- que `accessToken` est disponible ;
- que `/api/books/trainer/mine` existe ;
- que les livres utilisent le bon `trainer_id` ;
- que `download_count` et `is_active` sont retournés.

### PDF affiché au lieu d'être téléchargé

La route de lecture doit utiliser :

```http
Content-Disposition: inline
```

La route de téléchargement doit utiliser :

```http
Content-Disposition: attachment
```

---
