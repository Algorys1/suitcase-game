# AGENTS.md — Instructions pour Codex

## Mission

Développer **Le monde tient dans une valise**, un petit jeu de découverte fantastique pour l'Indie Park Game Jam #6 (thème « Voyage »), jouable directement dans un navigateur sur itch.io. Privilégier un prototype **complet, fiable et agréable** plutôt qu'une accumulation de fonctionnalités.

## Documents de référence et priorités

Lire avant de modifier le projet :

1. `docs/GAME_DESIGN.md` — règles du jeu, contenu et critères d'acceptation.
2. `docs/COMPASS_AND_STICKERS.md` — extension à prototyper : sélection par aiguilles et autocollants cosmétiques.
3. `docs/TECHNICAL.md` — stack, architecture, tests, publication.
4. `docs/ART_DIRECTION.md` — identité graphique et animations.
5. `README.md` — présentation et instructions de lancement.

Priorité explicitement définie par [l'extension](docs/COMPASS_AND_STICKERS.md) : les deux aiguilles remplacent la palette comme **méthode de sélection cible**. La palette actuelle peut rester provisoirement comme solution de repli ou outil de debug. `GAME_DESIGN.md` reste la référence pour les recettes, l'énergie, le carnet et la fin de session. Cette extension est une **proposition à prototyper, non encore validée en jeu** ; distinguer ses phases A (aiguilles), B (déblocage des autocollants) et C (décoration, après la boucle jouable), et attendre la validation de chaque phase avant la suivante.

Les données implémentées dans `src/data/elements.json` et `src/data/destinations.json` doivent être la source de vérité du catalogue une fois créées. Si deux documents se contredisent, **ne pas improviser une règle** : signaler le conflit et demander confirmation. Distinguer les décisions validées des paramètres provisoires à tester.

## Stack et contraintes

- **DA obligatoire sur chaque nouvel écran**, y compris tutoriel, confirmations, erreurs et outils de test : reprendre les décors illustrés, papiers, matières, typographies et étiquettes du jeu. Aucun écran générique, panneau pastel ou bouton standard hors thème. Réutiliser les composants de mise en page validés. Créer des assets dédiés quand le rendu demandé l’exige ; ne pas détourner un pictogramme ni recycler un visuel inadapté par économie. Retirer les anciens rendus génériques et leurs ressources devenues inutiles. Vérifier visuellement le résultat avant de le présenter.

- **Phaser 4 + TypeScript strict + Vite** ; **Vitest** pour la logique métier.
- Vérifier la version de Phaser effectivement installée et ses API avant de coder ; verrouiller les dépendances avec un lockfile. Ne pas supposer qu'une API Phaser 3 fonctionne inchangée.
- Jeu entièrement **client-side** : pas de backend, API distante, authentification, React ou moteur 3D.
- Export statique pour itch.io : `dist/index.html` à la racine de l'archive ZIP ; vérifier les chemins d'assets en hébergement relatif.
- Sauvegarder les découvertes permanentes et la langue dans `localStorage`, avec validation et récupération gracieuse en cas de données absentes ou invalides.
- Interface utilisable à la souris et au toucher ; texte et boutons lisibles dans les deux langues.

## Règles métier à préserver

- Une valise **2D en perspective isométrique illustrée**, avec **exactement deux emplacements** ; pas de placement libre sur une grille.
- **10 éléments distincts** ; le joueur choisit **deux éléments différents** pour voyager.
- L'ordre des deux éléments est indifférent : une paire non ordonnée ne doit correspondre qu'à une recette.
- **30 destinations** à découvrir au fil des parties ; les autres paires mènent au **Néant**.
- **Boussole, valeurs provisoires :** 10 charges au départ, −1 pour une destination valide (même déjà connue), −2 pour le Néant ; jamais de valeur négative. Fin de session à zéro. Ces chiffres devront être ajustés après playtests.
- Pas d'autre ressource, de recettes à trois éléments, de crafting, de simulation écologique ni d'exploration libre des destinations.
- Le carnet permanent présente les destinations découvertes avec leur nom, illustration et courte histoire. La fin de session présente un récapitulatif.
- Extension à prototyper : tourner les aiguilles ne consomme aucune charge ; une sélection identique sur les deux aiguilles bloque Voyager. Réutiliser la logique de sélection commune, sans créer de règles parallèles pour la palette.
- Les autocollants proposés sont purement cosmétiques : un par destination découverte, aucun pour le Néant. Déduire leur déblocage du carnet ; sauvegarder seulement leur disposition en supplément. Les **6 emplacements décoratifs provisoires** sont distincts des **2 emplacements d'éléments**.
- Textes FR/EN externalisés ; éviter les chaînes visibles codées en dur dans les scènes.

## Organisation du code

- Garder la **logique pure** (résolution des recettes, coût de la boussole, état de session) indépendante de Phaser et couverte par des tests.
- Les scènes Phaser gèrent l'affichage et les interactions, pas la logique de résolution.
- Utiliser des identifiants techniques stables et des structures de données typées ; valider l'unicité des recettes et la validité des références.
- Ne pas multiplier les abstractions ou fichiers vides. Préférer de petits modules lisibles et des fonctions explicites.
- Les visuels temporaires sont acceptés pour le prototype ; conserver une séparation claire entre données, logique et assets définitifs.

## Méthode de travail attendue

1. Examiner les fichiers existants avant toute modification ; préserver les décisions déjà prises.
2. Avancer par **petites étapes jouables** : socle technique → choix des deux objets → résolution/charges → résultats/Néant → fin de session/carnet → FR/EN → polish.
3. Pour chaque étape, indiquer brièvement ce qui a été fait, les fichiers modifiés, les tests exécutés et ce qui reste à faire.
4. Ne pas déclarer un test réussi sans l'avoir exécuté. Si un outil, une dépendance ou un asset manque, le dire clairement et proposer une solution minimale.
5. Ne pas ajouter de fonctionnalité, dépendance ou règle importante non demandée ; demander validation si une décision produit un impact sur le gameplay.
6. Tester les parcours réels dans un navigateur avant publication, pas uniquement les fonctions unitaires.

## Tests minimum

- Les 30 recettes sont uniques, ne contiennent que des éléments connus et correspondent à des paires de deux éléments distincts.
- La résolution est identique quel que soit l'ordre des deux éléments.
- Une combinaison inconnue renvoie le Néant.
- La boussole débite une seule fois par voyage, ne devient jamais négative et déclenche la fin de session à zéro.
- Une destination déjà connue reste un voyage valide mais n'est pas ajoutée deux fois au carnet.
- Les découvertes et le choix de langue survivent à un rechargement ; une sauvegarde invalide ne bloque pas le jeu.
- Le bouton Voyager est désactivé tant que la sélection n'est pas valide et pendant l'animation de voyage.
- Le build Vite fonctionne et la version publiée s'ouvre sur itch.io sans téléchargement.

## Hors périmètre pour le MVP

Multijoueur, comptes, cloud, monétisation, génération procédurale de mondes, déplacement dans les destinations, système complexe d'inventaire, animations longues, fonctionnalités sociales et refonte de l'architecture sans nécessité.

**Principe directeur :** la simplicité de la valise doit laisser toute la place à la curiosité et à la magie des destinations.
