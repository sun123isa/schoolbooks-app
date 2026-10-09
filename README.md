# Schoolbooks

Plateforme web qui centralise les **sujets d'examens, livres et supports pédagogiques** des lycéens et des étudiants. Les ressources sont classées par niveau, série/filière, matière, année et type de document.

> **Sommaire**
> 1. [Présentation du projet](#1-présentation-du-projet)
> 2. [Architecture](#2-architecture)
> 3. [Installation et lancement](#3-installation-et-lancement)
> 4. [Équipe et rôles](#4-équipe-et-rôles)
> 5. [Délégation des responsabilités](#5-délégation-des-responsabilités)
> 6. [Référence de l'API](#6-référence-de-lapi)
> 7. [Routes frontend](#7-routes-frontend)
> 8. [Workflow Git](#8-workflow-git)

---

## 1. Présentation du projet

### Problématique

Les sujets d'examens et autres ressources pédagogiques sont dispersés : groupes de discussion, fichiers partagés, camarades, enseignants, bibliothèques. Ils sont aussi mal organisés. Pour les lycéens et les étudiants, cela entraîne :

- une perte de temps ;
- des recherches répétitives ;
- des difficultés à identifier la bonne ressource ;
- une dépendance aux camarades.

### Solution

Une plateforme unique où l'on choisit son niveau et sa série/filière. On cherche ensuite par mot-clé et par filtres, puis on consulte le document en ligne. On peut le télécharger quand c'est autorisé.

### Périmètre MVP

| Fonctionnalité | Page |
|---|---|
| Sélection du niveau (lycée / université) | Landing page |
| Sélection de la série / filière correspondant au niveau | Landing page |
| Recherche par mot-clé | Recherche |
| Filtres : niveau, série/filière, matière, année, type de document | Recherche |
| Affichage des résultats (+ message si aucun résultat) | Recherche |
| Fiche document (métadonnées) | Consultation |
| Consultation du PDF en ligne | Consultation |
| Téléchargement (si autorisé) | Consultation |

### Hors MVP — rien n'est prévu pour ces sujets

Favoris, historique, recommandations, commentaires, notation, réseau social, IA, notifications, application mobile native.

> **Ajouté après le MVP** : seuls les formateurs ont un tableau de bord ; un apprenant crée un compte uniquement pour lire ou télécharger un document (fiches et recherche restent publiques). Comptes apprenant / formateur (cookies HTTP-only, access et refresh tokens), publication de livres PDF par les formateurs, tableau de bord formateur. Voir [§ 6](#6-référence-de-lapi) (« Comptes et authentification », « Livres des formateurs ») et [§ 7](#7-routes-frontend).

### Règles métier

| Code | Règle | Où elle est garantie |
|---|---|---|
| BR01, BR03, BR05 | Toute ressource a obligatoirement un **niveau**, une **matière** et un **type**. | Intégration au catalogue (Emmanuel) ; seules les ressources complètes sont publiées (Salem, Emmanuel) |
| BR02 | La série/filière est **compatible avec le niveau**. | Base (clé étrangère composite, migration 005), API référentiels et recherche (Isaac, Salem), filtres (Graciel) |
| BR04 | Un sujet d'examen a obligatoirement une **année**. | Intégration au catalogue (Emmanuel) via `document_types.requires_year` |
| BR06 | Une ressource proposée à la consultation a un **document réellement ouvrable**. | Indicateur `disponible` (Emmanuel), message adapté (Karene) |
| BR07 | Les résultats respectent **strictement** les filtres appliqués. | Recherche (Salem), synchronisation URL ↔ filtres (Graciel) |
| BR08 | « Télécharger » n'est proposé que si le fichier est **téléchargeable**. | Route `/telechargement` en 403 (Emmanuel), bouton conditionnel (Karene) |
| BR09 | **Contrôle des doublons** avant intégration au catalogue. | Empreinte SHA-256 unique (migration 005), contrôle à l'intégration (Emmanuel) |
| BR10 | **Respect des droits** d'utilisation des documents. | Champ `droits` obligatoire, téléchargement interdit par défaut, PDF jamais servis en statique (Emmanuel) |

### Exigences non fonctionnelles

| Exigence | Responsable principal |
|---|---|
| Chargement rapide des pages principales | Jean Baptiste (socle web), Salem (requêtes indexées) |
| Interface utilisable sans assistance | Les 3 développeurs frontend |
| Responsive (ordinateur, tablette, smartphone) | Jean Baptiste (base responsive), chaque page |
| Compatibilité avec les principaux navigateurs | Les 3 développeurs frontend |
| Documents protégés contre les manipulations non autorisées | Emmanuel |
| Catalogue facile à mettre à jour | Isaac (schéma, seeds), Emmanuel (intégration) |
| Métadonnées lisibles | Karene (fiche), Graciel (cartes) |

---

## 2. Architecture

### Stack

| Partie | Technologie | Version | Rôle |
|---|---|---|---|
| Monorepo | npm workspaces | npm 10 | `apps/*` et `packages/*` partagent une installation |
| Frontend | React + Vite | React 19, Vite 8 | Interface utilisateur |
| Routage frontend | React Router | 7 | Pages `/`, `/recherche`, `/ressources/:id` |
| Backend | Node.js + Express | Node 22, Express 5 | API REST, ES modules |
| Base de données | PostgreSQL | 14+ (testé en 17) | Catalogue et référentiels |
| Accès BD | pg | 8 | Requêtes SQL paramétrées, sans ORM |
| Contrat d'API | Zod (`@schoolbooks/shared`) | 4 | Schémas partagés front/back, validation, mocks |
| Sécurité | Helmet, CORS | — | En-têtes HTTP, origines autorisées |
| Tests | Vitest, Supertest | 5, 7 | Tests du contrat, des routes et du socle web |
| Qualité | ESLint, Prettier | 10, 3 | Lint par workspace, format commun |
| CI | GitHub Actions | — | Lint, tests, build, migrations sur chaque PR |

### Arborescence commentée

```text
schoolbooks/
├── .github/
│   ├── CODEOWNERS                    # Qui approuve quoi (Isaac)
│   ├── pull_request_template.md      # Modèle de PR (Isaac)
│   └── workflows/ci.yml              # CI : lint, tests, build, migrations (Isaac)
├── docs/
│   └── revue-de-code.md              # Checklist et critères de validation des PR (Salem)
├── database/                         # (Isaac)
│   ├── migrations/
│   │   ├── 001_create_learners.sql   # Historique (hors MVP : comptes)
│   │   ├── 002_create_trainers.sql   # Historique (hors MVP : comptes)
│   │   ├── 003_create_books.sql      # Table books = catalogue des ressources
│   │   ├── 004_create_referentiels.sql          # levels, tracks, subjects, document_types
│   │   └── 005_extend_books_for_resources.sql   # Clés vers les référentiels, année, téléchargeable…
│   └── seeds/
│       ├── 001_seed_schoolbooks.sql             # Historique (livres collège, non publiés)
│       └── 002_seed_referentiels_ressources.sql # Référentiels + 11 ressources lycée/université
├── packages/
│   └── shared/                       # @schoolbooks/shared — CONTRAT D'API (Jean Baptiste)
│       ├── src/contract/             # Schémas Zod, routes, codes d'erreur
│       ├── src/mocks/                # Données fictives conformes au contrat
│       └── test/contract.test.js     # Les mocks respectent le contrat et les règles métier
├── apps/
│   ├── api/                          # Backend Express
│   │   ├── .env.example
│   │   ├── scripts/generer-pdf-demo.js         # Crée les PDF de démo dans STORAGE_DIR (Isaac)
│   │   ├── storage/                  # PDF du catalogue — HORS GIT (créé par storage:demo)
│   │   ├── test/                     # Tests des routes, un fichier par domaine (Salem)
│   │   └── src/
│   │       ├── app.js                # Montage des modules (Isaac)
│   │       ├── server.js
│   │       ├── config/               # database.js, env.js (Isaac)
│   │       ├── middlewares/          # erreurs, 404, validation (Isaac)
│   │       ├── utils/http-error.js   # Erreur métier → format commun (Isaac)
│   │       └── modules/
│   │           ├── referentiels/     # Isaac  — /api/niveaux, /matieres, /annees, /types-documents
│   │           ├── recherche/        # Salem  — GET /api/ressources
│   │           ├── ressources/       # Emmanuel — /api/ressources/:id[/fichier|/telechargement]
│   │           └── books/            # Emmanuel — /api/books (code historique conservé)
│   └── web/                          # Frontend React
│       ├── .env.example
│       ├── public/mocks/exemple.pdf  # PDF servi en mode mock (Karene)
│       └── src/
│           ├── main.jsx              # Point d'entrée (Jean Baptiste)
│           ├── app/                  # App, routeur, chemins des pages (Jean Baptiste)
│           ├── shared/               # SOCLE (Jean Baptiste)
│           │   ├── api/client.js     #   client API unique + mode mock
│           │   ├── hooks/useApi.js   #   chargement / erreur / annulation
│           │   ├── layout/           #   en-tête, pied de page, gabarit responsive
│           │   ├── components/       #   Loader, ErrorMessage, EmptyState, 404, erreur globale
│           │   └── styles/index.css  #   thème (variables CSS)
│           ├── pages/
│           │   ├── landing/          # Jean Baptiste — /
│           │   ├── recherche/        # Graciel — /recherche
│           │   └── ressource/        # Karene — /ressources/:id
│           └── legacy/               # Code historique conservé (liste de livres, gabarit Vite)
├── package.json                      # Scripts du monorepo
└── README.md
```

### Principe de découpage

- **Frontend : un dossier par page.** Chaque page a son composant, ses composants internes (`components/`) et son fichier d'appels API (`<page>.api.js`). Les éléments transverses sont dans `shared/` et appartiennent au Lead Dev.
- **Backend : un module par domaine.** Chaque module contient `*.routes.js` → `*.controller.js` (HTTP uniquement) → `*.service.js` (règles métier) → `*.repository.js` (SQL uniquement). `app.js` ne fait que monter les modules : une ligne par domaine.
- **Contrat partagé.** `packages/shared` est la source unique des chemins d'API, des paramètres, des formats de réponse et des codes d'erreur. Le backend valide ses entrées avec ces schémas, et les tests vérifient ses sorties avec eux. Le frontend les utilise pour ses appels et ses mocks.
- **Conventions de nommage.** Les routes, les paramètres et les champs JSON sont **en français** (`/api/ressources`, `niveau`, `telechargeable`). Le SQL reste **en anglais**, comme les tables existantes (`books`, `level_id`, `is_downloadable`). Le repository fait la correspondance entre les deux.
- **Identifiants lisibles.** Les référentiels sont désignés par un `code` (`lycee`, `serie-c`, `sujet-examen`) pour que les URL de recherche soient partageables. Les ressources gardent leur UUID.

### Circulation des données

```text
 Navigateur                       Vite (dev)              API Express                         PostgreSQL
 ─────────                        ──────────              ───────────                         ──────────
 Page React ── <page>.api.js ── apiGet() ── /api/* ──proxy──► routes ─► validate(schéma du contrat)
                                                                   └─► controller ─► service ─► repository ──► books + référentiels
 ◄────────────── { success: true, data } ou { success: false, error: { code, message } } ◄───────┘
 Visionneuse PDF ──────────────── /api/ressources/:id/fichier ────► service ressources ─► STORAGE_DIR/…pdf
```

- **Mode mock** (`npm run dev:web:mocks`) : `apiGet()` n'appelle pas le réseau et renvoie les données de `@schoolbooks/shared/mocks`. Le frontend avance ainsi sans backend.
- **Backend** : toutes les routes lisent PostgreSQL et le stockage, au même format que les mocks. Les tests (`apps/api/test`) tournent sans base : `test/setup/base-fictive.js` remplace les repositories par des versions en mémoire construites sur ces données fictives.
- **Stockage des PDF** : sur disque, dans `apps/api/storage/` (variable `STORAGE_DIR`), **hors Git**. `books.file_path` est relatif à ce dossier. Les fichiers ne sont jamais servis en statique, uniquement par les routes `/fichier` et `/telechargement`.

---

## 3. Installation et lancement

### Prérequis

- Node.js **22** (minimum 20.11) et npm 10
- PostgreSQL **14+** avec `psql` dans le `PATH`
- Git

### Étapes

```bash
# 1. Cloner et se placer sur la branche d'intégration
git clone https://github.com/sun123isa/schoolbooks.git
cd schoolbooks
git checkout dev

# 2. Installer toutes les dépendances (racine + apps/api + apps/web + packages/shared)
npm install

# 3. Créer la base
psql -U postgres -c "CREATE DATABASE schoolbooks_db;"

# 4. Configurer l'API : copier l'exemple puis renseigner le mot de passe PostgreSQL
cp apps/api/.env.example apps/api/.env

# 5. Exécuter les migrations puis les seeds non encore joués (table schema_migrations)
npm run db:migrate -- --seed

# 6. Générer les PDF de démonstration dans apps/api/storage/
npm run storage:demo

# 7. Lancer l'API (http://localhost:3000) et le frontend (http://localhost:5173)
npm run dev
```

Ouvrir **http://localhost:5173**. En développement, le frontend appelle `/api/...` et Vite relaie ces appels vers `http://localhost:3000`.

> `db:migrate` n'exécute chaque fichier qu'une fois. Les migrations 004 à 006 et les seeds 002 et 003 sont en plus **rejouables** à la main avec `psql -f` ; le seed 001 (historique) ne l'est pas. Sur une base créée avant `db:migrate` (sans table `schema_migrations`), jouer seulement la migration 006 et le seed 003 avec `psql -f`, puis `npm run db:migrate` sans `--seed`.
>
> La migration 006 utilise les extensions `unaccent` et `pg_trgm` (fournies avec PostgreSQL ; droit de création d'extension requis).

### Mise en production (base vide)

En production, la base démarre **sans aucune donnée de démonstration** :

```bash
npm run db:migrate          # migrations 001 à 008 : schéma + référentiels (niveaux, filières, matières, types)
# NE PAS lancer --seed ni storage:demo : les seeds et les PDF de démonstration sont réservés au développement local.
```

Le catalogue se remplit ensuite par les formateurs (`/inscription?role=formateur` puis « Ajouter un livre ») ou par `npm run catalogue:importer`. Renseigner `JWT_ACCESS_SECRET` et `JWT_REFRESH_SECRET` (obligatoires en production).

### Déployer le frontend (Netlify ou Vercel)

Le frontend est une application React statique (Vite) ; l'API Express et PostgreSQL s'hébergent à part (Render, Railway, VPS…). Les fichiers de configuration sont prêts à la racine : `netlify.toml` et `vercel.json`.

| Réglage | Valeur |
|---|---|
| Dossier de base | racine du dépôt (npm workspaces) |
| Installation | `npm ci` |
| Build | `npm run build --workspace=apps/web` |
| Dossier publié | `apps/web/dist` |
| Node | 22 |

1. **Renseigner l'URL de l'API** : dans `netlify.toml` (règle `/api/*`) et `vercel.json` (`rewrites`), remplacer `https://API-A-RENSEIGNER.example.com` par l'URL publique de l'API.
2. **Importer le dépôt** sur Netlify (« Add new site → Import an existing project ») ou Vercel (« Add New → Project ») : les réglages sont lus automatiquement depuis ces fichiers.
3. **Côté API** : `NODE_ENV=production`, `DATABASE_URL`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `CLIENT_URL=https://votre-site.netlify.app` (ou `.vercel.app`), puis `npm run db:migrate` (sans `--seed`).

Pourquoi un proxy `/api` : le navigateur ne parle qu'au domaine du site, donc les cookies de session HTTP-only (`SameSite=Lax`) sont envoyés sans réglage CORS. Toutes les URL du site (`/livres/…`, `/formateur`…) renvoient vers `index.html` : React Router affiche la bonne page.

> Variante sans proxy (frontend qui appelle l'API sur un autre domaine) : définir `VITE_API_URL=https://api.exemple.com/api` dans les variables du site, et côté API `COOKIE_SAMESITE=none` (HTTPS obligatoire) avec `CLIENT_URL` égal à l'URL du site. Certains navigateurs bloquant les cookies tiers, le proxy reste recommandé.

### Variables d'environnement

| Fichier | Variable | Exemple | Rôle |
|---|---|---|---|
| `apps/api/.env` | `NODE_ENV` | `development` | Environnement |
| | `PORT` | `3000` | Port de l'API |
| | `DATABASE_URL` | `postgresql://postgres:MOT_DE_PASSE@localhost:5432/schoolbooks_db` | Connexion PostgreSQL (sans guillemets) |
| | `CLIENT_URL` | `http://localhost:5173` | Origine du frontend (pour CORS) |
| | `STORAGE_DIR` | `storage` | Dossier des PDF, relatif à `apps/api` (PDF des formateurs : `uploads/books/`) |
| | `JWT_ACCESS_SECRET` / `JWT_REFRESH_SECRET` | longue chaîne aléatoire | Signature des jetons (obligatoires en production) |
| | `ACCESS_TOKEN_TTL` / `REFRESH_TOKEN_TTL` | `900` / `604800` | Durées de vie en secondes |
| | `COOKIE_SAMESITE` | `lax` | `none` seulement si le frontend appelle l'API sur un autre domaine (HTTPS) |
| `apps/web/.env.local` (facultatif) | `VITE_USE_MOCKS` | `false` | `true` = données fictives sans backend |
| | `VITE_API_PROXY_TARGET` | `http://localhost:3000` | Cible du proxy `/api` de Vite |
| | `VITE_API_URL` | *(vide)* | URL de l'API en production, si elle est sur une autre origine |

### Commandes utiles (depuis la racine)

| Commande | Effet |
|---|---|
| `npm run dev` | API + frontend en parallèle |
| `npm run dev:api` / `npm run dev:web` | Un seul des deux |
| `npm run dev:web:mocks` | Frontend seul, avec les données fictives (aucun backend requis) |
| `npm run db:migrate` | Joue les migrations non encore appliquées (`-- --seed` : les seeds aussi) |
| `npm run storage:demo` | (Re)génère les PDF de démonstration (copie les vrais sujets du seed 003) |
| `npm run catalogue:importer -- fichier.json` | Intègre des ressources au catalogue après contrôle BR01–BR06, BR09, BR10 (format en tête de `apps/api/scripts/importer-catalogue.js`) |
| `npm run lint` | ESLint sur tous les workspaces |
| `npm test` | Tests : contrat (`packages/shared`), routes (`apps/api`), socle web (`apps/web`) |
| `npm run build` | Build de production du frontend |
| `npm run format` / `npm run format:check` | Prettier (`.prettierrc.json`). Le code historique n'est pas encore formaté : ne formater que ses propres fichiers (`npx prettier --write <fichiers>`), jamais tout le dépôt dans une PR fonctionnelle |

### Problèmes fréquents

| Symptôme | Cause et solution |
|---|---|
| `SASL: SCRAM-SERVER-FIRST-MESSAGE: client password must be a string` | `DATABASE_URL` absent ou mot de passe incorrect dans `apps/api/.env`. |
| La page affiche « Impossible de joindre le serveur » | L'API n'est pas démarrée : lancer `npm run dev`, ou travailler en `npm run dev:web:mocks`. |
| Le PDF d'une ressource ne s'affiche pas | Lancer `npm run storage:demo`. Remarque : la ressource « Histoire-Géographie 2020 » est volontairement sans fichier (test de BR06). |
| `npm run dev` ne lance que l'API (ancienne version) | Mettre à jour la branche : le script utilise maintenant `concurrently`, compatible Windows. |

---

## 4. Équipe et rôles

| Rôle | Personne | Responsabilité |
|---|---|---|
| Lead Projet (PM) | **Gloire MASSENGO** | Planifier, suivre l'avancement, coordonner l'équipe |
| Lead Dev | **HIRWA Jean Baptiste** | Définir l'architecture, encadrer les développeurs, résoudre les problèmes techniques |
| Lead Repo | **Isaac LELO MAKAYA** | Gérer le dépôt, les branches, les PR, les conventions Git et le CI/CD |
| Lead Reviewer | **Salem KONGOLO** | Qualité du code, relecture des PR, détection des bugs, validation des merges |

| Développeur | Côté | Périmètre |
|---|---|---|
| HIRWA Jean Baptiste | Frontend | Landing page `/` + socle frontend partagé |
| Graciel MBEMBA | Frontend | Page de recherche `/recherche` |
| Karene MOUSSOUNDA | Frontend | Page de consultation `/ressources/:id` |
| Isaac LELO MAKAYA | Backend | Socle backend, base de données, référentiels |
| Salem KONGOLO | Backend | Recherche et filtrage |
| Emmanuel AYA | Backend | Ressources, fichiers PDF, catalogue |

---

## 5. Délégation des responsabilités

Chaque responsabilité correspond à **un dossier**. On ne modifie le dossier d'un autre qu'avec son accord : il est automatiquement demandé en relecture via `CODEOWNERS`. Les fichiers squelettes portent en en-tête leur responsable, leur périmètre et une liste `TODO`.

### Correspondance avec les tickets Jira

| Ticket Jira | Frontend | Backend |
|---|---|---|
| Parcours utilisateur : accéder aux ressources adaptées | Jean Baptiste | Isaac |
| Télécharger uniquement les documents disponibles au téléchargement | Karene | Emmanuel |
| Recherche par mot-clé | Graciel | Salem |
| Filtres par niveau, série/filière, matière, année, type | Graciel | Salem, Isaac (référentiels) |
| Résultats de recherche | Graciel | Salem |
| Message en l'absence de résultat | Graciel | Salem |
| Consulter la fiche d'une ressource | Karene | Emmanuel |

### Contrat partagé — règle commune

`packages/shared` appartient au Lead Dev. Chaque fichier de schéma a aussi pour co-propriétaire le développeur backend du domaine. Toute modification du contrat :

1. passe par une PR dédiée (`feat(shared): …`) ;
2. met à jour les mocks dans la même PR (le test `contract.test.js` doit passer) ;
3. est annoncée aux consommateurs (voir les dépendances ci-dessous).

---

### 5.1 HIRWA Jean Baptiste — Landing page et socle frontend

**Périmètre.** La page d'accueil, point d'entrée du parcours utilisateur, et tout ce qui est partagé par les pages : gabarit, navigation, thème, client API, gestion des erreurs, base responsive. En tant que Lead Dev, il est aussi garant de l'architecture et du contrat partagé.

**Dossiers et fichiers**
- `apps/web/src/pages/landing/` — `LandingPage.jsx`, `landing.api.js`, `components/`
- `apps/web/src/app/` — `App.jsx`, `router.jsx`, `routes.js` (+ `routes.test.js`)
- `apps/web/src/shared/` — `api/client.js`, `hooks/useApi.js`, `layout/`, `components/`, `styles/`
- `apps/web/src/main.jsx`, `apps/web/index.html`, `apps/web/vite.config.js`, `apps/web/eslint.config.js`
- `packages/shared/` (avec les co-propriétaires backend), `package.json` racine

**Tâches**
1. **Présentation du concept** sur la landing page : le problème, la solution, les types de ressources disponibles (sujets d'examens, corrigés, livres, supports de cours, exercices) et le fonctionnement en 3 ou 4 étapes.
2. **Parcours utilisateur.** L'utilisateur choisit un niveau parmi `GET /api/niveaux`. Les séries/filières de ce niveau s'affichent ensuite (`GET /api/niveaux/:code/filieres`). La validation redirige vers `cheminRecherche({ niveau, filiere })`, soit `/recherche?niveau=…&filiere=…`. Le choix de la filière est facultatif (« tout le niveau »). Si l'utilisateur veut continuer sans niveau, un message l'invite à en choisir un.
3. **Socle partagé.**
   - En-tête avec navigation (menu adapté au smartphone) et pied de page avec mention des droits d'utilisation (BR10).
   - Thème : variables CSS, typographie, couleurs, focus visible.
   - Composants communs (bouton, carte, sélecteur…), à ajouter dans `shared/components` quand deux pages en ont besoin.
4. **Client API et erreurs.** Maintenir `apiGet()` et `ApiError`, ainsi que les messages par code d'erreur (`StatusMessages.jsx`), la page 404 et la page d'erreur globale.
5. **Responsive et performance.** Fournir la base responsive (points de rupture communs). Veiller au poids du bundle : charger les mocks à la demande, découper le code par route si nécessaire.
6. **Encadrement.** Arbitrer les questions d'architecture, relire les PR qui touchent le socle ou le contrat, débloquer les développeurs.

**Routes**
- Implémente : `/` (frontend), socle de toutes les routes frontend.
- Consomme : `GET /api/niveaux`, `GET /api/niveaux/:code/filieres`.

**Règles métier et exigences** : BR02 (seules les filières du niveau choisi sont proposées), BR10 (mention des droits), chargement rapide, responsive, interface utilisable sans assistance, compatibilité navigateurs.

**Ticket Jira** : Parcours utilisateur : accéder aux ressources adaptées.

**Dépendances**
- Isaac fournit les référentiels. Ils sont déjà disponibles sous forme de mocks.
- Graciel et Karene utilisent le socle : toute modification de `shared/` doit être annoncée avant le merge.

**Critères de fin**
- [ ] Les 4 blocs de présentation sont visibles et lisibles sur smartphone, tablette et ordinateur.
- [ ] Niveau → filière → redirection vers `/recherche` avec les bons paramètres, vérifié en mode mock et avec l'API.
- [ ] Message affiché si l'utilisateur tente de continuer sans niveau.
- [ ] Le gabarit, la navigation, la 404 et l'erreur globale sont utilisés par les 3 pages.
- [ ] Lint, tests et build verts ; aucune régression sur les pages de Graciel et Karene.

---

### 5.2 Graciel MBEMBA — Page de recherche

**Périmètre.** Toute l'expérience de recherche : mot-clé, filtres, résultats, pagination, états vides et d'erreur.

**Dossiers et fichiers**
- `apps/web/src/pages/recherche/` — `RecherchePage.jsx`, `recherche.api.js`, `useCriteresUrl.js`, `components/`

**Tâches**
1. **Barre de recherche** par mot-clé (critère `q`, 100 caractères maximum), soumise par la touche Entrée ou un bouton.
2. **Panneau de filtres** : niveau, série/filière, matière, année, type de document.
   - Les listes viennent de `fetchReferentielsFiltres()`.
   - Les séries/filières sont rechargées avec `fetchFilieres(niveau)` à chaque changement de niveau, et la liste est désactivée tant qu'aucun niveau n'est choisi (BR02). Changer de niveau efface la filière (déjà géré par `useCriteresUrl`).
   - Bouton « Réinitialiser les filtres ».
   - Sur smartphone, le panneau est repliable.
3. **Synchronisation avec l'URL.** L'URL est la source de vérité : on lit et on écrit uniquement via `useCriteresUrl()`. Une recherche se partage par lien, et les critères venant de la landing page sont repris. Tout changement de filtre revient à la page 1.
4. **Résultats sous forme de cartes** (`components/`). Chaque carte affiche :
   - le titre ;
   - le niveau, la série/filière, la matière ;
   - l'année (si présente) et le type ;
   - un badge « Téléchargeable » si `telechargeable`.

   La carte entière mène à `cheminRessource(id)` avec `state={{ retour: location.search }}`, pour permettre le retour aux mêmes résultats.
5. **Pagination** (`page`, `totalPages`) ou chargement progressif, et **tri** (`pertinence`, `recent`, `titre`). Afficher le nombre de résultats (`total`).
6. **États.**
   - Pendant le chargement : `Loader`.
   - En erreur : `ErrorMessage`, avec réessai.
   - Aucun résultat : afficher `data.message` et proposer d'élargir la recherche (retirer un filtre).

**Routes**
- Implémente : `/recherche` (frontend).
- Consomme :
  - `GET /api/ressources` ;
  - `GET /api/niveaux`, `GET /api/niveaux/:code/filieres` ;
  - `GET /api/matieres`, `GET /api/annees`, `GET /api/types-documents`.

**Règles métier et exigences** : BR02, BR07 (l'interface ne retire ni n'ajoute jamais de critère sans action de l'utilisateur), responsive, chargement rapide, interface utilisable sans assistance, métadonnées lisibles.

**Tickets Jira** : Recherche par mot-clé · Filtres par niveau, série/filière, matière, année, type · Résultats de recherche · Message en l'absence de résultat.

**Dépendances**
- Salem fournit la recherche ; Isaac les référentiels (mocks disponibles en attendant).
- Jean Baptiste fournit le socle.
- Karene reçoit l'état `retour` pour le lien « Retour aux résultats ».

**Critères de fin**
- [ ] Chaque filtre et le mot-clé modifient l'URL. Recharger la page ou partager le lien redonne exactement la même recherche.
- [ ] `/recherche?niveau=lycee&filiere=serie-c` (venant de la landing page) pré-remplit les filtres.
- [ ] Les filières proposées appartiennent toujours au niveau sélectionné.
- [ ] Pagination et tri fonctionnels ; message clair quand aucun résultat.
- [ ] Rendu correct sur smartphone (panneau de filtres utilisable), tablette et ordinateur.
- [ ] Fonctionne en mode mock et avec l'API ; lint et build verts.

---

### 5.3 Karene MOUSSOUNDA — Page de consultation

**Périmètre.** La fiche d'une ressource, la lecture du PDF dans la page et le téléchargement quand il est autorisé.

**Dossiers et fichiers**
- `apps/web/src/pages/ressource/` — `RessourcePage.jsx`, `ressource.api.js`, `components/`
- `apps/web/public/mocks/` — PDF d'exemple du mode mock

**Tâches**
1. **Fiche** : titre et métadonnées lisibles (niveau, série/filière, matière, année, type, format), plus la description, l'auteur, la taille et les droits d'utilisation (BR10).
2. **Visionneuse PDF intégrée** (`components/`), alimentée par `data.urls.fichier` :
   - zoom avant / arrière / ajusté ;
   - navigation entre les pages (précédente, suivante, numéro) ;
   - plein écran.

   Utiliser une bibliothèque de rendu, par exemple `react-pdf` (pdf.js), à valider avec le Lead Dev. **Ne pas utiliser la visionneuse native du navigateur** (`<iframe>`/`<embed>`) : elle affiche son propre bouton de téléchargement, ce qui contournerait BR08.
3. **Bouton « Télécharger »** affiché **uniquement** si `data.telechargeable` est vrai et `data.urls.telechargement` non nul (BR08). C'est un lien vers cette URL.
4. **Messages adaptés.**
   - Ressource inexistante (`RESSOURCE_INTROUVABLE`, 404) : message et lien vers la recherche.
   - PDF inaccessible : `data.disponible === false` ou échec de chargement dans la visionneuse. Afficher un message, garder la fiche visible et ne pas afficher « Télécharger ».
5. **Retour aux résultats** en conservant la recherche, via `cheminRetourRecherche(location.state)` (déjà branché).
6. **Responsive** : visionneuse utilisable au doigt sur smartphone.

**Routes**
- Implémente : `/ressources/:id` (frontend).
- Consomme : `GET /api/ressources/:id`, `GET /api/ressources/:id/fichier`, `GET /api/ressources/:id/telechargement`.

**Règles métier et exigences** : BR06, BR08, BR10, documents protégés, responsive, compatibilité navigateurs, métadonnées lisibles.

**Tickets Jira** : Consulter la fiche d'une ressource · Télécharger uniquement les documents disponibles au téléchargement.

**Dépendances**
- Emmanuel fournit le détail et les fichiers ; en mode mock, `/mocks/exemple.pdf` est utilisé.
- Graciel fournit l'état `retour`.
- Jean Baptiste valide le choix de la bibliothèque PDF (ajout de dépendance).

**Critères de fin**
- [ ] Les 11 ressources fictives s'affichent correctement, y compris celle sans filière et celle sans fichier.
- [ ] Zoom, navigation entre les pages et plein écran fonctionnels sur ordinateur et smartphone.
- [ ] Le bouton « Télécharger » est absent pour les ressources non téléchargeables (ex. Philosophie 2024).
- [ ] Les messages « ressource introuvable » et « PDF inaccessible » sont testés.
- [ ] « Retour aux résultats » ramène à la recherche d'origine.
- [ ] Lint et build verts.

---

### 5.4 Isaac LELO MAKAYA — Socle backend, base de données, référentiels (et Lead Repo)

**Périmètre.**
- Le serveur : configuration, middlewares, format d'erreur, CORS.
- La base de données : schéma, migrations, données de démonstration.
- Les référentiels qui alimentent les filtres, avec la cohérence niveau ↔ série/filière.
- En tant que Lead Repo : le dépôt, les branches, les PR, les conventions et la CI.

**Dossiers et fichiers**
- `apps/api/src/app.js`, `server.js`, `config/`, `middlewares/`, `utils/`, `apps/api/scripts/`, `apps/api/eslint.config.js`, `apps/api/package.json`
- `apps/api/src/modules/referentiels/`
- `database/` (migrations et seeds)
- `packages/shared/src/contract/referentiels.schema.js`, `errors.js`, `src/mocks/referentiels.mock.js` (avec Jean Baptiste)
- `.github/` (CODEOWNERS, modèle de PR, CI), `.gitignore`, `.gitattributes`

**Tâches**
1. **Référentiels.** Brancher `referentiels.service.js` sur `referentiels.repository.js` (requêtes déjà rédigées sur les tables de la migration 004) à la place des mocks. Garder exactement le format du contrat.
   - `GET /api/annees` ne renvoie que les années des ressources publiées.
   - `verifierCompatibiliteFiliere()` (BR02), utilisée par la recherche, doit interroger la base.
2. **Schéma et migrations.**
   - Maintenir les migrations : une nouvelle migration numérotée pour chaque changement ; on ne modifie jamais une migration déjà mergée.
   - Ajouter un script d'exécution automatique des migrations et seeds (ex. `npm run db:migrate`), avec une table de suivi des migrations jouées.
3. **Jeu de données de démonstration.** Compléter `002_seed_referentiels_ressources.sql` avec des ressources réalistes, cohérentes avec les mocks (mêmes codes), et maintenir `storage:demo`.
4. **Socle serveur.**
   - Restreindre CORS à `CLIENT_URL`.
   - Masquer le message des erreurs 500 en production.
   - Garder le format d'erreur commun ; ajouter un code dans `ERROR_CODES` pour chaque nouveau cas.
5. **Lead Repo.**
   - Remplacer les pseudos de `CODEOWNERS` par les comptes GitHub.
   - Protéger `main` et `dev` (voir [§ 8](#8-workflow-git)) et faire respecter les conventions de branches et de commits.
   - Maintenir la CI et préparer les PR de livraison `dev` → `main`.

**Routes**
- Implémente :
  - `GET /api/niveaux`, `GET /api/niveaux/:code/filieres` ;
  - `GET /api/matieres`, `GET /api/annees`, `GET /api/types-documents` ;
  - `GET /api/health`.
- Consomme : aucune.

**Règles métier et exigences** : BR02 (base et API), socle de BR01/BR03/BR04/BR05 (schéma : `requires_year`, clés étrangères), catalogue facile à mettre à jour.

**Tickets Jira** : Parcours utilisateur : accéder aux ressources adaptées · Filtres (référentiels).

**Dépendances**
- Jean Baptiste et Graciel consomment les référentiels.
- Salem utilise `verifierCompatibiliteFiliere()`.
- Emmanuel et Salem dépendent du schéma : toute migration leur est signalée.

**Critères de fin**
- [ ] Les 5 routes de référentiels lisent la base, et leurs réponses passent les tests de `referentiels.routes.test.js`.
- [ ] Niveau inconnu → 404 `NIVEAU_INTROUVABLE` ; filière hors niveau → 400 `FILIERE_INCOMPATIBLE`.
- [ ] Migrations et seeds rejouables, vérifiés par la CI (job `migrations`).
- [ ] CORS restreint ; CODEOWNERS avec les vrais comptes ; protections de branches actives.

---

### 5.5 Salem KONGOLO — Recherche et filtrage (et Lead Reviewer)

**Périmètre.** La route de recherche : mot-clé, filtres, tri, pagination, validation, performance. En tant que Lead Reviewer : la qualité, la relecture et les tests des routes.

**Dossiers et fichiers**
- `apps/api/src/modules/recherche/`
- `packages/shared/src/contract/recherche.schema.js` (avec Jean Baptiste)
- `apps/api/test/` (tous les tests de routes, avec les propriétaires de chaque domaine)
- `docs/revue-de-code.md`

**Tâches**
1. **Requête de recherche** dans `recherche.repository.js`. Les repères sont dans l'en-tête du fichier.
   - Une requête SQL paramétrée sur `books` jointe aux référentiels.
   - Elle ne renvoie que les ressources publiées et complètes : `is_active` vrai, et niveau, matière et type renseignés (BR01/BR03/BR05).
2. **Filtres stricts (BR07).** Chaque paramètre fourni (`niveau`, `filiere`, `matiere`, `annee`, `type`) restreint les résultats par égalité. Un paramètre absent ou vide n'a aucun effet, et un paramètre inconnu est refusé (déjà géré par le schéma).
3. **Mot-clé** `q` : recherche insensible à la casse et aux accents dans le titre et la description (ex. extension `unaccent` + `ILIKE`, ou recherche plein texte `tsvector` en français).
4. **Tri** (`pertinence` par défaut, `recent` = année décroissante, `titre`) et **pagination** (`page`, `limit` ≤ 50). La réponse contient `items`, `total`, `page`, `limit`, `totalPages`, `filtres`, `tri` et `message`.
5. **Aucun résultat** : 200 avec `items: []`, `total: 0` et `message` explicite (jamais de 404).
6. **Performance** : index adaptés (plein texte, trigrammes ou composites) dans une nouvelle migration, et requête vérifiée avec `EXPLAIN ANALYZE`.
7. **Lead Reviewer.**
   - Appliquer `docs/revue-de-code.md` à chaque PR et valider les merges.
   - Faire compléter les tests de routes de chaque domaine : cas nominal, erreurs, règles métier.

**Routes**
- Implémente : `GET /api/ressources?q=&niveau=&filiere=&matiere=&annee=&type=&page=&limit=&tri=`.
- Consomme : `verifierCompatibiliteFiliere()` du module référentiels (Isaac).

**Règles métier et exigences** : BR07, BR02 (400 si incompatibilité), BR01/BR03/BR05 (seules les ressources complètes sont exposées), chargement rapide.

**Tickets Jira** : Recherche par mot-clé · Filtres · Résultats de recherche · Message en l'absence de résultat.

**Dépendances**
- Isaac fournit le schéma et les référentiels.
- Graciel consomme la route : tout changement de réponse passe par le contrat.

**Critères de fin**
- [ ] La recherche lit la base ; `recherche.routes.test.js` passe, complété par des tests de combinaison de filtres, de tri et de pagination.
- [ ] Le mot-clé trouve « Économie » en tapant « economie ».
- [ ] Temps de réponse inférieur à 300 ms sur le jeu de démonstration, index documentés.
- [ ] Checklist de relecture appliquée à toutes les PR.

---

### 5.6 Emmanuel AYA — Ressources, fichiers et catalogue

**Périmètre.** Le détail d'une ressource, la consultation et le téléchargement de son PDF, la protection des fichiers, et la qualité du catalogue à l'intégration.

**Dossiers et fichiers**
- `apps/api/src/modules/ressources/` — routes, contrôleur, service, repository, `storage.js`, `catalogue.validator.js`, `ressource.sql.js` (fragments SQL partagés avec la recherche)
- `apps/api/src/modules/books/` (code historique `/api/books`)
- `packages/shared/src/contract/ressources.schema.js`, `src/mocks/ressources.mock.js` (avec Jean Baptiste)

**Tâches**
1. **Détail** (`GET /api/ressources/:id`). Implémenter `findRessourceById` (jointures sur les référentiels, ressources publiées uniquement) et mettre les données au format du contrat.
   - `telechargeable` = `is_downloadable`.
   - `disponible` = fichier présent et lisible (`fichierLisible()` dans `storage.js`).
   - `urls` construites avec `API_ROUTES`. Ne jamais renvoyer `file_path`.
2. **Consultation** (`/fichier`) : servir le vrai fichier, `resoudreChemin(file_path)` remplaçant la fixture, en `inline`. Si la ressource est inconnue : 404 `RESSOURCE_INTROUVABLE`. Si le fichier est absent ou illisible : 404 `FICHIER_INDISPONIBLE` (BR06).
3. **Téléchargement** (`/telechargement`) : en pièce jointe, uniquement si `is_downloadable` est vrai, sinon 403 `TELECHARGEMENT_NON_AUTORISE` (BR08). Incrémenter `download_count` après un envoi réussi.
4. **Protection des fichiers** (BR10, documents protégés) :
   - pas de service statique, chemins confinés à `STORAGE_DIR` (déjà assuré par `resoudreChemin`) ;
   - en-têtes `no-store` et `nosniff` ;
   - nom de fichier assaini ;
   - à étudier avec le Lead Dev : limitation du débit sur les routes de fichiers.
5. **Intégration au catalogue.**
   - Compléter `catalogue.validator.js` : BR01/BR03/BR05 (codes existants), BR02 (compatibilité), BR04 (année si le type l'exige), BR06 (PDF lisible), BR10 (droits renseignés).
   - Contrôle des doublons BR09 : empreinte SHA-256 du fichier et même titre/niveau/matière/type/année.
   - Exposer ces contrôles dans un script d'import (ex. `npm run catalogue:importer -- fichier.json`) ; pas de route publique d'upload (hors MVP).
6. **Code historique `/api/books`** : le maintenir en état de marche (le bug de téléchargement a été corrigé), sans l'étendre.

**Routes**
- Implémente :
  - `GET /api/ressources/:id` ;
  - `GET /api/ressources/:id/fichier` ;
  - `GET /api/ressources/:id/telechargement` ;
  - `/api/books` (historique).
- Consomme : `verifierCompatibiliteFiliere()` (Isaac) pour l'intégration.

**Règles métier et exigences** : BR01, BR03, BR04, BR05 (intégration), BR06, BR08, BR09, BR10, documents protégés, catalogue facile à mettre à jour.

**Tickets Jira** : Consulter la fiche d'une ressource · Télécharger uniquement les documents disponibles au téléchargement.

**Dépendances**
- Isaac fournit le schéma (colonnes `is_downloadable`, `usage_rights`, `file_checksum`).
- Karene consomme les 3 routes : tout changement de réponse passe par le contrat.

**Critères de fin**
- [ ] Les 3 routes lisent la base et le stockage, et `ressources.routes.test.js` passe.
- [ ] La ressource « Histoire-Géographie 2020 » (fichier absent) renvoie `disponible: false` et 404 `FICHIER_INDISPONIBLE` sur `/fichier`.
- [ ] La ressource « Philosophie 2024 » renvoie 403 sur `/telechargement`.
- [ ] Une tentative de chemin `../` est refusée ; aucune réponse ne contient de chemin disque.
- [ ] Un import en doublon est refusé (409 `DOUBLON`), un sujet d'examen sans année aussi (422 `RESSOURCE_INCOMPLETE`).

---

### 5.7 Gloire MASSENGO — Lead Projet

**Rôle.**
- Tenir le tableau Jira à jour : un ticket « En cours » par branche, « En revue » à l'ouverture de la PR, « Terminé » au merge.
- Planifier les jalons et animer le point d'avancement.
- Arbitrer les priorités du MVP et coordonner les dépendances listées ci-dessus.

Gloire est co-propriétaire du README, qui sert de référence pour la répartition.

---

## 6. Référence de l'API

Toutes les routes sont préfixées par `/api` et renvoient du JSON, sauf les routes de fichiers.

**Enveloppes**

```jsonc
// Succès
{ "success": true, "data": { /* … */ } }
// Erreur
{ "success": false, "error": { "code": "VALIDATION_ERROR", "message": "…", "details": [{ "champ": "annee", "message": "…" }] } }
```

Les schémas exacts sont dans `packages/shared/src/contract/`. Les codes d'erreur sont dans `ERROR_CODES`.

| Méthode | Route | Responsable | Statut actuel |
|---|---|---|---|
| GET | `/api/health` | Isaac | ✅ réel |
| GET | `/api/niveaux` | Isaac | ✅ réel |
| GET | `/api/niveaux/:code/filieres` | Isaac | ✅ réel |
| GET | `/api/matieres` | Isaac | ✅ réel |
| GET | `/api/annees` | Isaac | ✅ réel |
| GET | `/api/types-documents` | Isaac | ✅ réel |
| GET | `/api/ressources` | Salem | ✅ réel |
| GET | `/api/ressources/:id` | Emmanuel | ✅ réel |
| GET | `/api/ressources/:id/fichier` | Emmanuel | ✅ réel |
| GET | `/api/ressources/:id/telechargement` | Emmanuel | ✅ réel |
| GET/POST | `/api/books`, `/api/books/:id`, `/api/books/:id/download` | Emmanuel | ✅ historique |

Toutes les routes lisent la base PostgreSQL (migrations 004 à 006) et le stockage `STORAGE_DIR`.

### Erreurs communes à toutes les routes

| HTTP | Code | Quand |
|---|---|---|
| 400 | `VALIDATION_ERROR` | Paramètre de requête ou d'URL invalide (`details` liste les champs) |
| 404 | `ROUTE_INTROUVABLE` | Route inconnue |
| 500 | `INTERNAL_ERROR` | Erreur inattendue |

### GET `/api/niveaux` — Isaac

Liste des niveaux, dans l'ordre d'affichage. Aucun paramètre.

```json
{ "success": true, "data": [ { "code": "lycee", "libelle": "Lycée" }, { "code": "universite", "libelle": "Université" } ] }
```

### GET `/api/niveaux/:code/filieres` — Isaac

Séries/filières d'un niveau (BR02).

| Paramètre | Où | Type | Obligatoire |
|---|---|---|---|
| `code` | chemin | code de niveau (`lycee`) | oui |

```json
{ "success": true, "data": [ { "code": "serie-c", "libelle": "Série C — Mathématiques et sciences physiques", "niveau": "lycee" } ] }
```

Erreurs : **404 `NIVEAU_INTROUVABLE`** (code de niveau inconnu), 400 `VALIDATION_ERROR` (code mal formé).

### GET `/api/matieres` — Isaac

```json
{ "success": true, "data": [ { "code": "mathematiques", "libelle": "Mathématiques" } ] }
```

### GET `/api/annees` — Isaac

Années pour lesquelles au moins une ressource publiée existe, par ordre décroissant.

```json
{ "success": true, "data": [2024, 2023, 2022, 2021, 2020] }
```

### GET `/api/types-documents` — Isaac

`requiertAnnee` indique les types soumis à BR04.

```json
{ "success": true, "data": [ { "code": "sujet-examen", "libelle": "Sujet d'examen", "requiertAnnee": true } ] }
```

### GET `/api/ressources` — Salem

Recherche par mot-clé et filtres. Les noms de paramètres sont identiques dans l'URL de la page `/recherche`.

| Paramètre | Type | Défaut | Règle |
|---|---|---|---|
| `q` | texte ≤ 100 | — | Mot-clé (titre, description), insensible à la casse et aux accents |
| `niveau` | code | — | Filtre strict (BR07) |
| `filiere` | code | — | Filtre strict ; doit appartenir à `niveau` s'il est fourni (BR02) |
| `matiere` | code | — | Filtre strict |
| `annee` | entier 1950–2100 | — | Filtre strict |
| `type` | code | — | Filtre strict |
| `page` | entier ≥ 1 | `1` | — |
| `limit` | entier 1–50 | `12` | — |
| `tri` | `pertinence` \| `recent` \| `titre` | `pertinence` | — |

Un paramètre vide (`?niveau=`) est ignoré ; un paramètre inconnu est refusé (400).

```json
{
  "success": true,
  "data": {
    "items": [
      {
        "id": "0b6f2a4e-1c3d-4e5f-8a9b-000000000001",
        "titre": "Baccalauréat série C 2023 — Mathématiques (sujet)",
        "niveau": { "code": "lycee", "libelle": "Lycée" },
        "filiere": { "code": "serie-c", "libelle": "Série C — Mathématiques et sciences physiques" },
        "matiere": { "code": "mathematiques", "libelle": "Mathématiques" },
        "type": { "code": "sujet-examen", "libelle": "Sujet d'examen" },
        "annee": 2023,
        "format": "PDF",
        "telechargeable": true
      }
    ],
    "total": 1, "page": 1, "limit": 12, "totalPages": 1,
    "filtres": { "niveau": "lycee", "filiere": "serie-c", "annee": 2023 },
    "tri": "pertinence",
    "message": null
  }
}
```

Sans résultat : `200` avec `items: []`, `total: 0`, `totalPages: 0` et `"message": "Aucune ressource ne correspond à vos critères."`.

Erreurs :
- **400 `VALIDATION_ERROR`** : paramètre invalide ou inconnu ;
- **400 `FILIERE_INCOMPATIBLE`** : filière hors du niveau (BR02) ;
- **404 `NIVEAU_INTROUVABLE`** : niveau inconnu.

### GET `/api/ressources/:id` — Emmanuel

| Paramètre | Où | Type |
|---|---|---|
| `id` | chemin | UUID |

```json
{
  "success": true,
  "data": {
    "id": "0b6f2a4e-1c3d-4e5f-8a9b-000000000004",
    "titre": "Baccalauréat série A 2024 — Philosophie (sujet)",
    "niveau": { "code": "lycee", "libelle": "Lycée" },
    "filiere": { "code": "serie-a", "libelle": "Série A — Lettres et philosophie" },
    "matiere": { "code": "philosophie", "libelle": "Philosophie" },
    "type": { "code": "sujet-examen", "libelle": "Sujet d'examen" },
    "annee": 2024,
    "format": "PDF",
    "telechargeable": false,
    "description": "Sujets de dissertation et commentaire de texte, session 2024. Consultation en ligne uniquement.",
    "auteur": "Direction des examens et concours",
    "tailleOctets": 210000,
    "disponible": true,
    "droits": "Consultation seule — reproduction soumise à l'accord de l'ayant droit.",
    "dateAjout": "2026-09-04T08:00:00.000Z",
    "urls": {
      "fichier": "/api/ressources/0b6f2a4e-1c3d-4e5f-8a9b-000000000004/fichier",
      "telechargement": null
    }
  }
}
```

- `urls.fichier` vaut `null` si `disponible` est faux.
- `urls.telechargement` vaut `null` si `telechargeable` ou `disponible` est faux.

Erreurs : **404 `RESSOURCE_INTROUVABLE`**, 400 `VALIDATION_ERROR` (id qui n'est pas un UUID).

### GET `/api/ressources/:id/fichier` — Emmanuel

**Réservé aux comptes connectés** (401 `NON_AUTHENTIFIE` sinon) : la fiche est publique, le document ne l'est pas.

Renvoie le PDF à afficher dans la page : `Content-Type: application/pdf`, `Content-Disposition: inline`, `Cache-Control: private, no-store`.

Erreurs (JSON) : **404 `RESSOURCE_INTROUVABLE`**, **404 `FICHIER_INDISPONIBLE`** (BR06), 400 `VALIDATION_ERROR`.

### GET `/api/ressources/:id/telechargement` — Emmanuel

**Réservé aux comptes connectés** (401 `NON_AUTHENTIFIE` sinon).

Renvoie le PDF en pièce jointe (`Content-Disposition: attachment; filename="…"`).

Erreurs (JSON) :
- **403 `TELECHARGEMENT_NON_AUTORISE`** (BR08) ;
- **404 `RESSOURCE_INTROUVABLE`** ;
- **404 `FICHIER_INDISPONIBLE`** ;
- 400 `VALIDATION_ERROR`.

### Codes réservés à l'intégration au catalogue — Emmanuel

| HTTP | Code | Quand |
|---|---|---|
| 422 | `RESSOURCE_INCOMPLETE` | BR01/BR03/BR04/BR05 non respectées |
| 409 | `DOUBLON` | BR09 : ressource déjà présente |

### Comptes et authentification — `/api/auth`

Les jetons ne figurent **jamais** dans le corps des réponses : l'API pose deux cookies **HTTP-only** (`SameSite=Lax`, `Secure` en production).

| Cookie | Contenu | Chemin | Durée (défaut) |
|---|---|---|---|
| `sb_access` | access token (JWT HS256) | `/api` | 15 min (`ACCESS_TOKEN_TTL`) |
| `sb_refresh` | refresh token, stocké haché (SHA-256) en base, à usage unique | `/api/auth` | 7 jours (`REFRESH_TOKEN_TTL`) |

| Méthode | Route | Corps | Réponse |
|---|---|---|---|
| POST | `/api/auth/register/learner` | `prenom, nom, email, motDePasse, niveau` (code de `/api/school-levels`), `telephone?` | 201 `{ utilisateur }` + cookies |
| POST | `/api/auth/register/trainer` | `prenom, nom, email, motDePasse, specialite`, `telephone?`, `bio?` | 201 `{ utilisateur }` + cookies |
| POST | `/api/auth/login` | `email, motDePasse` | 200 `{ utilisateur }` + cookies |
| POST | `/api/auth/refresh` | — (cookie `sb_refresh`) | 200 `{ utilisateur }` + nouveaux cookies (rotation) |
| GET | `/api/auth/me` | — (cookie `sb_access`) | 200 `{ utilisateur }` (restauration de session) |
| POST | `/api/auth/logout` | — | 200, session révoquée et cookies effacés |

`utilisateur` : `{ id, role: 'learner' | 'trainer', prenom, nom, email, niveau, specialite }`. Mot de passe : 8 caractères minimum, au moins une lettre et un chiffre, haché avec scrypt. Connexion et inscription limitées à 20 tentatives par IP et par quart d'heure.

Erreurs : 401 `NON_AUTHENTIFIE` (access token absent/expiré : le frontend appelle alors `/refresh` puis rejoue la requête), 401 `SESSION_EXPIREE`, 401 `IDENTIFIANTS_INVALIDES`, 403 `ACCES_INTERDIT`, 409 `EMAIL_DEJA_UTILISE`, 429 `TROP_DE_REQUETES`.

### Référentiels des formulaires

- `GET /api/school-levels` → `[{ id, code, libelle, filieres: [{ id, code, libelle }] }]`
- `GET /api/subjects` → `[{ id, code, libelle }]`

### Livres des formateurs — `/api/books`

Un livre est une ligne de `books` rattachée aux référentiels **et publiée par un formateur** (`trainer_id`) : il apparaît aussi dans la recherche `/api/ressources`, tandis que `/api/books` ne liste que les livres des formateurs. Les PDF sont rangés sous `STORAGE_DIR/uploads/books/<uuid>.pdf` et ne sont jamais servis en statique.

| Méthode | Route | Accès | Rôle |
|---|---|---|---|
| GET | `/api/books?q=&niveau=&matiere=&page=&limit=&tri=` | public | Catalogue : mot-clé (sans casse ni accents), filtres, pagination, tri `recent` / `titre` / `telechargements` |
| GET | `/api/books/:id` | public | Fiche (`disponible`, `urls.fichier`, `urls.telechargement`, `telechargements`) |
| GET | `/api/uploads/books/:fileName` | connecté | Lecture du PDF dans le navigateur (`inline`) |
| GET | `/api/books/:id/download` | connecté | Téléchargement (`attachment`), compteur incrémenté ; 403 si non téléchargeable |
| GET | `/api/books/trainer/mine` | formateur | `{ items, statistiques: { livres, telechargements, actifs, matieres } }` |
| POST | `/api/books` | formateur | Création, `multipart/form-data` : `titre, niveau, matiere`, `filiere?, type?` (défaut `livre`), `annee?, auteur?, description?, droits?, telechargeable?` + PDF dans `fichier` (25 Mo max) |
| PATCH | `/api/books/trainer/:id` | propriétaire | Modification (JSON ou multipart ; nouveau PDF facultatif, l'ancien est supprimé) |
| DELETE | `/api/books/trainer/:id` | propriétaire | Désactivation (retiré du catalogue, visible du seul propriétaire) |
| PATCH | `/api/books/trainer/:id/restore` | propriétaire | Restauration |
| DELETE | `/api/books/trainer/:id/permanent` | propriétaire | Suppression définitive (ligne et PDF) |

Erreurs : 404 `LIVRE_INTROUVABLE`, 400 `FICHIER_REQUIS` / `FICHIER_INVALIDE` (signature `%PDF-` vérifiée) / `REFERENTIEL_INCONNU` / `FILIERE_INCOMPATIBLE`, 413 `FICHIER_TROP_VOLUMINEUX`, 422 `RESSOURCE_INCOMPLETE` (année exigée par le type), 409 `DOUBLON` (BR09 : même PDF, ou même titre / niveau / matière / type / année), 403 `ACCES_INTERDIT` (livre d'un autre formateur), 403 `TELECHARGEMENT_NON_AUTORISE`.

---

## 7. Routes frontend

| Route | Page | Responsable | Paramètres |
|---|---|---|---|
| `/` | Landing page : présentation et choix niveau → série/filière | HIRWA Jean Baptiste | — |
| `/recherche` | Recherche, filtres, résultats | Graciel MBEMBA | `?q=&niveau=&filiere=&matiere=&annee=&type=&page=&tri=` (mêmes noms que l'API) |
| `/ressources/:id` | Fiche, visionneuse PDF, téléchargement | Karene MOUSSOUNDA | `id` = UUID ; état de navigation `retour` (recherche d'origine) |
| `/connexion` | Connexion plein écran (retour à la page demandée) | — | `?role=formateur`, état `depuis` |
| `/inscription` | Inscription apprenant (depuis un document) ou formateur | — | `?role=formateur`, état `depuis` et `titre` |
| `/livres` | Catalogue des livres : mot-clé, niveau, matière, tri, pagination | — | `?q=&niveau=&matiere=&tri=&page=` |
| `/livres/:id` | Fiche, lecture du PDF, téléchargement (connecté) | — | `id` = UUID |
| `/formateur` | Tableau de bord formateur : statistiques, publications par jour, rappel, livres récents et populaires, état du catalogue, chronomètre, export CSV | — | réservé aux formateurs (gabarit à barre latérale) |
| `/formateur/livres` | Gestion : modifier, désactiver, restaurer, supprimer | — | réservé aux formateurs |
| `/formateur/livres/nouveau` | Ajout d'un livre (upload PDF) | — | réservé aux formateurs |
| `/formateur/livres/:id/modifier` | Modification d'un livre | — | réservé au propriétaire |
| `*` | Page 404 | HIRWA Jean Baptiste | — |

Les liens se construisent avec `cheminRecherche()`, `cheminRessource()`, `cheminRetourRecherche()`, `cheminLivre()`, `cheminLivres()`, `cheminModifierLivre()` et `cheminInscription()` (`apps/web/src/app/routes.js`), jamais en dur.

---

## 8. Workflow Git

### Branches

| Branche | Rôle | Qui y merge |
|---|---|---|
| `main` | Version livrée, stable | Isaac, via PR `dev` → `main` à chaque jalon |
| `dev` | Intégration continue de l'équipe | Tous, via PR relue |
| `feature/<scope>-<sujet>` | Nouvelle fonctionnalité | — |
| `fix/<scope>-<sujet>` | Correction de bug | — |
| `chore/<sujet>`, `docs/<sujet>` | Outillage, configuration, documentation | — |

On crée sa branche **depuis `dev` à jour**, en minuscules avec des tirets, par exemple :

```bash
git switch dev && git pull
git switch -c feature/web-recherche-filtres
```

### Scopes (un par périmètre)

| Scope | Périmètre |
|---|---|
| `web-socle` | Layout, routeur, client API, composants communs |
| `web-landing` | Landing page |
| `web-recherche` | Page de recherche |
| `web-ressource` | Page de consultation |
| `api-socle` | Socle backend |
| `api-referentiels` | Module référentiels |
| `api-recherche` | Module recherche |
| `api-ressources` | Module ressources |
| `shared` | Contrat d'API |
| `db` | Base de données |
| `ci` | Intégration continue |
| `docs` | Documentation |

### Commits — [Conventional Commits](https://www.conventionalcommits.org/fr/)

```text
<type>(<scope>): <description à l'impératif, en minuscules, sans point final>
```

- **Types** : `feat`, `fix`, `refactor`, `test`, `docs`, `style`, `chore`, `perf`, `ci`.
- **Exemples** :
  - `feat(web-recherche): ajoute le panneau de filtres`
  - `fix(api-ressources): refuse le téléchargement des ressources non téléchargeables`
  - `feat(db): ajoute l'index plein texte sur les ressources`
- Des commits petits et cohérents ; on mentionne le ticket Jira dans le corps si utile.

### Pull requests

1. **Ouvrir la PR vers `dev`**, avec un titre au format Conventional Commits. Remplir le modèle : ticket Jira, règles métier, comment tester, captures pour le frontend. Une PR en cours se marque en *Draft*.
2. **Relecture automatique** : `CODEOWNERS` demande le propriétaire du dossier et Salem KONGOLO. Si Salem est l'auteur, Jean Baptiste relit.
3. **Relecture** selon [`docs/revue-de-code.md`](docs/revue-de-code.md). Délai cible : 24 h ouvrées.
4. **Merge** en *Squash and merge* par l'auteur, une fois les conditions remplies ; la branche est ensuite supprimée.

### Conditions de merge (protection de branche, à configurer par Isaac)

Sur `dev` et `main` :
- [ ] Pas de push direct : passage obligatoire par une PR.
- [ ] CI verte : jobs « Lint, tests et build » et « Migrations et seeds PostgreSQL ».
- [ ] Au moins **1 approbation d'un Code Owner** (autre que l'auteur) ; sur `main`, approbation de Salem **et** de Jean Baptiste.
- [ ] Branche à jour avec la cible et conversations résolues.
- [ ] Pas de force-push ni de suppression de la branche.

### Fichiers à ne jamais committer

`.env`, `apps/web/.env.local`, `apps/api/storage/` (PDF du catalogue), `node_modules/`, `dist/`. Ils sont déjà dans `.gitignore`.
