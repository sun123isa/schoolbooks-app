<!--
Titre de la PR = message de commit Conventional Commits, ex :
  feat(web-recherche): ajoute le panneau de filtres
Branche source : feature/… , fix/… , chore/… ou docs/…  →  branche cible : dev
-->

## Objet

<!-- Ce que fait cette PR, en 2 ou 3 phrases. -->

## Ticket(s) Jira

<!-- Ex : « Recherche par mot-clé » — lien vers le ticket -->

## Périmètre

- [ ] Je n'ai modifié que les fichiers de mon périmètre (voir README, section « Délégation ») **ou** j'ai prévenu les propriétaires concernés
- [ ] Si le contrat d'API (`packages/shared`) change : les données fictives sont à jour et le frontend/backend concernés sont prévenus

## Règles métier concernées

<!-- Cocher celles que la PR implémente ou impacte -->

- [ ] BR01 / BR03 / BR05 — niveau, matière et type obligatoires
- [ ] BR02 — série/filière compatible avec le niveau
- [ ] BR04 — année obligatoire pour un sujet d'examen
- [ ] BR06 — document réellement ouvrable
- [ ] BR07 — résultats strictement conformes aux filtres
- [ ] BR08 — « Télécharger » seulement si téléchargeable
- [ ] BR09 — contrôle des doublons
- [ ] BR10 — droits d'utilisation
- [ ] Aucune

## Comment tester

<!-- Étapes précises : commande, URL, données, résultat attendu. -->

1.
2.

## Captures d'écran (frontend)

<!-- Ordinateur et smartphone. Supprimer la section si backend uniquement. -->

## Vérifications

- [ ] `npm run lint` passe
- [ ] `npm test` passe (tests ajoutés ou mis à jour si une route ou une règle change)
- [ ] `npm run build` passe
- [ ] Aucun secret, fichier `.env` ou PDF du catalogue dans la PR
- [ ] Les états chargement / erreur / vide sont gérés (frontend)
- [ ] Les erreurs suivent le format commun `{ success: false, error: { code, message } }` (backend)
- [ ] README mis à jour si une route, une commande ou une variable d'environnement change
