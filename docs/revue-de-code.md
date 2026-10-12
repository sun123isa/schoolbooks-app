# Revue de code — checklist et critères de validation

Responsable : **Salem KONGOLO** (Lead Reviewer). Relecture : HIRWA Jean Baptiste.

Ce document s'applique à toute PR vers `dev`. Le relecteur parcourt la checklist ; un seul point bloquant suffit pour demander des modifications.

## 1. Critères bloquants (la PR ne peut pas être mergée)

- [ ] CI verte : lint, tests, build et migrations.
- [ ] Approbation d'au moins un propriétaire du code (CODEOWNERS) autre que l'auteur.
- [ ] Branche à jour avec `dev` et sans conflit.
- [ ] Périmètre respecté : les fichiers modifiés appartiennent à l'auteur, ou leurs propriétaires ont approuvé.
- [ ] Contrat d'API respecté : les réponses suivent les schémas de `packages/shared`, et toute modification du contrat est faite dans une PR dédiée, approuvée par le Lead Dev.
- [ ] Règles métier : aucune régression sur BR01 à BR10 ; chaque règle touchée est couverte par un test (backend) ou une vérification manuelle décrite (frontend).
- [ ] Sécurité :
  - requêtes SQL paramétrées uniquement ;
  - aucun chemin de fichier (`file_path`) ni chemin disque exposé au client ;
  - aucun secret ni `.env` committé ;
  - aucun PDF du catalogue versionné.
- [ ] Erreurs : format commun `{ success: false, error: { code, message } }`, codes issus de `ERROR_CODES`.

## 2. Points de qualité (à corriger sauf justification)

**Backend**
- La couche est respectée : routes → contrôleur (HTTP seulement) → service (règles métier) → repository (SQL seulement).
- Les entrées sont validées avec `validate({ query | params })` et un schéma du contrat.
- Les cas d'erreur sont testés : 400, 403 et 404 selon la route.
- Les requêtes de recherche s'appuient sur des index (vérifier avec `EXPLAIN` si la requête est nouvelle).

**Frontend**
- Aucun `fetch` direct : on passe par `<page>.api.js` puis `apiGet`.
- Les liens sont construits avec `cheminRecherche` / `cheminRessource`, jamais en dur.
- Les trois états (chargement, erreur, vide) sont gérés avec les composants communs.
- Le rendu reste correct sur smartphone (≈ 375 px), tablette et ordinateur.
- L'interface est accessible : libellés de formulaire, boutons utilisables au clavier, texte alternatif.

**Commun**
- Les noms sont explicites, sans code mort ni `console.log` oublié.
- Le README est mis à jour si une route, une commande ou une variable change.
- Le titre de la PR respecte Conventional Commits.

## 3. Déroulé d'une relecture

1. Lire la description de la PR et le ticket Jira.
2. Vérifier la CI.
3. Lancer la branche en local si elle touche l'interface ou un fichier (`npm run dev`).
4. Commenter :
   - **bloquant** : doit être corrigé ;
   - **suggestion** : facultatif ;
   - **question** : demande d'explication.
5. Approuver, ou demander des modifications. Délai cible : 24 h ouvrées.
6. L'auteur merge en « Squash and merge » une fois toutes les conditions remplies.

## 4. Tests des routes (backend)

Les tests se trouvent dans `apps/api/test/<domaine>.routes.test.js` (Vitest + Supertest). Chaque route doit avoir au minimum :

- un cas nominal, dont la réponse est validée avec le schéma du contrat ;
- chaque code d'erreur documenté dans le README ;
- un test par règle métier qu'elle garantit.
