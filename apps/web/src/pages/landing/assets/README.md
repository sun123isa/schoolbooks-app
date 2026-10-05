# Images de la landing page — à remplacer

Responsable : HIRWA Jean Baptiste.

Les fichiers de ce dossier sont des **images de substitution** générées pour le projet (SVG, sans question de droits). Elles respectent les proportions de la maquette. Il faut les remplacer par les photos définitives, en vérifiant que l'on dispose bien des droits d'utilisation (BR10).

| Fichier actuel | Photo attendue | Proportions | Taille conseillée | Chargement |
|---|---|---|---|---|
| `hero-campus-etudiante.svg` | Étudiante souriante tenant ses livres devant un bâtiment universitaire. **Le sujet doit être dans le tiers droit** : la moitié gauche est couverte par le voile vert et le texte. | 16:9 | 1920 × 1080 px, WebP | prioritaire |
| `ressources-etudiants-revision.svg` | Deux étudiants révisant sur ordinateur dans une bibliothèque | 4:3 | 960 × 720 px, WebP | différé |
| `a-propos-bibliotheque.svg` | Bâtiment universitaire ou bibliothèque, pelouse, étudiants | 6:5 (recadrée en hauteur) | 1200 × 1000 px, WebP | différé |
| `nouveaute-1.svg` | Façade de bibliothèque | 16:10 | 800 × 500 px, WebP | différé |
| `nouveaute-2.svg` | Groupe d'étudiants travaillant autour d'une table | 16:10 | 800 × 500 px, WebP | différé |
| `nouveaute-3.svg` | Salle d'examen ou amphithéâtre | 16:10 | 800 × 500 px, WebP | différé |
| `cta-etudiants-pelouse.svg` | Étudiants assis sur une pelouse de campus (arrière-plan du bandeau final, sous un voile sombre) | 3:1 | 1920 × 640 px, WebP | différé |

## Procédure de remplacement

1. Déposer la photo dans ce dossier, par exemple `hero-campus-etudiante.webp` (qualité 75 à 80 suffit).
2. Mettre à jour l'import correspondant dans `../landing.content.js`, ainsi que `largeur` et `hauteur` si elles changent.
3. Supprimer le fichier SVG de substitution.
