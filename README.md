# Le monde tient dans une valise

Jeu expérimental de découverte fantastique, créé pour l'**Indie Park Game Jam #6** (thème : **Voyage**).

> **Statut :** étape 2 — préparation de la valise. L'accueil ouvre une valise à deux emplacements et une palette de dix éléments. Placement, remplacement et retrait sont fonctionnels ; les doublons sont refusés. Les destinations, la boussole et le carnet restent à implémenter.

> **Évolution documentée, non implémentée :** [boussole à aiguilles et autocollants](docs/COMPASS_AND_STICKERS.md). Cette proposition reste à prototyper et à valider en jeu ; les instructions ci-dessous décrivent le prototype actuel.

## Lancer le prototype

Prérequis : **Node.js 24 LTS** recommandé (versions compatibles précisées dans `package.json`) et npm.

```sh
npm install
npm run dev
```

Ouvrir l'adresse locale indiquée par Vite. Sous Windows, si PowerShell bloque `npm.ps1`, utiliser **`npm.cmd`** à la place de `npm` dans ces commandes, sans changer la politique d'exécution.

```sh
npm run typecheck  # TypeScript strict
npm test          # Tests Vitest, une exécution
npm run test:watch
npm run build     # Vérification TypeScript puis build dans dist/
npm run preview   # Servir le build localement
```

Le build utilise des chemins relatifs (`base: './'`). Pour une future publication HTML5 sur itch.io, archiver le **contenu** de `dist/`, avec `index.html` à la racine du ZIP. La publication et sa vérification sur itch.io ne font pas partie de cette étape.

### Utiliser la valise

1. Cliquer sur **Commencer un voyage**.
2. Choisir un élément dans la palette, puis cliquer/toucher un emplacement pour le placer. Recliquer sur l'élément sélectionné annule sa sélection.
3. Pour remplacer un objet, sélectionner un autre élément et toucher l'emplacement occupé. **Retirer 1 / Retirer 2** vide l'emplacement correspondant.
4. **Voyager** s'active uniquement lorsque deux éléments différents sont placés. Dans cette étape, il confirme le choix avec un message ; il ne résout aucune recette et ne consomme aucune charge.
5. **Accueil** permet de revenir au menu. Un nouveau départ ouvre une valise vide. Le redimensionnement de la fenêtre conserve la préparation en cours.

### Choix techniques actuels

- Trois scènes : `HomeScene`, `PreparationScene` et `PlaceholderScene`, partagée entre carnet et paramètres. Pas de scène de chargement sans assets à charger.
- La logique pure de préparation est dans `src/domain/preparation.ts` : deux emplacements typés, contrôle des identifiants, refus des doublons, remplacement, retrait et validité du départ. La scène gère uniquement l'affichage et les interactions.
- Affichage Phaser en mode `RESIZE` : panneau centré et largeur bornée sur desktop, texte redisposé et boutons conservant une taille tactile sur petit écran. Les décorations secondaires sont masquées sur les fenêtres peu hautes.
- Formes et police système temporaires, sans téléchargement de police, image ou autre ressource distante. La valise est dessinée en perspective ; les objets sont provisoirement représentés par leurs noms. La palette suit le catalogue JSON existant.
- Textes d'interface dans `src/data/fr.json` et `en.json`. L'affichage reste en français pour cette étape ; choix de langue et persistance seront ajoutés ultérieurement.
- Huit tests protègent l'intégrité des catalogues et la préparation, dont les 45 paires distinctes dans les deux ordres, les doublons, les retraits, les remplacements et les noms FR/EN. Aucun module de résolution, boussole, sauvegarde ou carnet n'est encore implémenté.
- Vite peut signaler un bundle supérieur à 500 Ko : le moteur Phaser représente l'essentiel du fichier. Cet avertissement n'empêche pas le build.

### Vérifications de l'étape 1

- Installation npm, vérification TypeScript, build Vite et deux tests Vitest exécutés avec succès.
- Navigation des trois boutons et retours contrôlée dans Chrome headless : 1280 × 720, 1920 × 1080, 800 × 600, 360 × 640, 320 × 568 et 640 × 360 ; toucher simulé sur les trois derniers formats.
- Rechargement, aperçu de production et chargement du build sous `/jam/` vérifiés sans erreur JavaScript ni ressource HTTP manquante. Captures contrôlées visuellement sur desktop, portrait et paysage.
- Firefox, appareil tactile réel et iframe publiée sur itch.io restent à vérifier avant publication.

### Vérifications de l'étape 2

- TypeScript strict, build Vite et **8 tests Vitest** réussis.
- Dans Chrome headless, les dix éléments ont été placés dans la valise, puis les doublons, remplacements, retraits et l'activation de Voyager ont été contrôlés à la souris et au toucher simulé.
- Formats contrôlés : 1280 × 720, 1920 × 1080, 800 × 600, 900 × 500, 600 × 568, 360 × 640, 320 × 568 et 640 × 360. Les zones tactiles des deux emplacements ne se chevauchent pas.
- Le redimensionnement conserve les objets et la sélection ; retour à l'accueil, nouveau départ, rechargement, carnet et paramètres restent fonctionnels.
- Le build servi sous `/jam/` a passé les parcours desktop et mobile sans erreur JavaScript ni ressource HTTP manquante. Les illustrations et les objets restent des visuels temporaires.

## Concept

Une valise magique permet de voyager vers des destinations fantastiques. Le joueur choisit **deux éléments** parmi une palette de **dix**, les place dans les deux emplacements de la valise, puis déclenche un voyage. La combinaison révèle un lieu, ou mène au **Néant** si aucune destination ne correspond.

Le but est de découvrir le plus de lieux possible au fil des parties et de remplir un **carnet de voyage permanent**.

## Boucle de jeu prévue

La sélection par palette décrite ici correspond au prototype actuel. Pour la cible à prototyper, les [deux aiguilles de la boussole](docs/COMPASS_AND_STICKERS.md) sélectionnent les éléments et remplissent automatiquement la valise.

1. Depuis l'accueil, choisir **Commencer un voyage**.
2. Découvrir une valise vide et la palette de dix éléments.
3. Placer deux éléments (ordre indifférent), puis cliquer sur **Voyager**.
4. La valise se referme ; une courte animation révèle le résultat.
5. Si la combinaison est valide, afficher la destination, son nom et son illustration ; sinon, afficher le Néant.
6. Déduire les charges de la boussole, puis revenir à la valise tant qu'il reste de l'énergie.
7. Lorsque la boussole est épuisée, afficher le récapitulatif des lieux visités pendant cette partie.
8. Depuis l'accueil, consulter le carnet permanent : destinations débloquées, illustrations et petites histoires.

### Règles provisoires à tester

- **10 charges** au début d'une partie.
- **−1 charge** pour une destination valide, même déjà découverte.
- **−2 charges** pour le Néant.
- La boussole ne descend jamais sous zéro ; la partie s'achève lorsqu'elle atteint zéro.
- Les découvertes sont conservées entre les parties dans le navigateur.

Ces valeurs sont des hypothèses de prototype, **pas un équilibrage définitif**.

### Extension à prototyper : aiguilles et autocollants

- **Phase A — priorité haute :** sélectionner une aiguille puis la déplacer par crans de 36° avec des commandes précédent/suivant. Les dix symboles correspondent aux dix éléments existants ; les deux emplacements reflètent les choix. Tourner est gratuit ; Voyager reste désactivé si les choix sont identiques. La palette peut servir de repli pendant le prototype.
- **Phase B — priorité moyenne :** chaque première découverte permanente débloque un autocollant cosmétique. Maximum 30, sans doublon lors des revisites et sans récompense pour le Néant. Les déblocages se déduisent du carnet.
- **Phase C — après la boucle jouable :** décorer le couvercle fermé, avec **6 positions fixes proposées**. Placement, remplacement et retrait sans perte de l'autocollant ; disposition persistante et anciennes sauvegardes compatibles.

Les recettes, les charges et la fin de session restent inchangées. La position initiale des aiguilles, l'emplacement du bouton de décoration et le nombre final de positions décoratives restent à déterminer. Chaque phase sera validée avant de commencer la suivante ; aucune de ces fonctionnalités n'est encore disponible dans le prototype.

## Contenu prévu

- **10 éléments** : arbre, champignon, eau, feu, rocher, palmier, neige, nuage, ruines, cristal.
- **30 destinations** fantastiques, chacune associée à une paire unique d'éléments.
- **15 paires sans destination** conduisant au Néant (sur les 45 paires possibles de deux éléments distincts).
- **2 emplacements seulement** ; pas de recettes à trois éléments dans le périmètre retenu.
- **FR et EN** dès la première version.

Les identifiants, recettes et références d'assets et de traductions sont déjà présents dans `src/data/destinations.json` et `src/data/elements.json`. Ces catalogues sont conservés tels quels. Les illustrations et textes de destinations restent à produire et à valider.

## Direction artistique

- **2D en perspective isométrique** (illustrations en fausse 3D, sans simulation 3D).
- **Cartoon minimaliste** : formes arrondies, silhouettes lisibles, peu de détails.
- Couleurs joyeuses et ambiance légèrement magique.
- Valise centrale, objets façon miniatures, illustrations de destinations comme des cartes postales.
- Animations courtes et légères : placement, fermeture, voyage, révélation et Néant.

## Stack

- **Phaser 4.2.1** pour le jeu Web en 2D.
- **TypeScript 7.0.2**, mode strict.
- **Vite 8.3.5** pour le développement et la compilation.
- **PNG / WebP** pour les assets.
- **localStorage** pour le carnet et les préférences.
- **JSON** pour les données et traductions.
- **Vitest 5.0.5** pour les tests des catalogues et de la préparation (résolution et charges aux étapes suivantes).

Le jeu doit être **jouable directement dans le navigateur sur itch.io**, sans téléchargement d'exécutable.

Les versions exactes et leurs dépendances transitives sont verrouillées dans `package-lock.json`. Les API utilisées pour les scènes, les zones interactives, les textes, les formes et le redimensionnement ont été vérifiées dans les sources et types du paquet Phaser installé.

## Documentation et catalogues

| Fichier | Rôle |
| --- | --- |
| `AGENTS.md` | Consignes de travail pour Codex |
| `docs/GAME_DESIGN.md` | Règles détaillées, écrans, progression et cas limites |
| [`docs/COMPASS_AND_STICKERS.md`](docs/COMPASS_AND_STICKERS.md) | Extension à prototyper : sélection par aiguilles, autocollants et décoration persistante |
| `docs/ART_DIRECTION.md` | Style, interface, animations et ressources visuelles |
| `docs/TECHNICAL.md` | Architecture, sauvegarde, tests et export itch.io |
| `src/data/destinations.json` | Catalogue des 30 destinations et recettes |
| `src/data/elements.json` | Palette des 10 éléments |

## Priorités de production

L'extension ajoute une phase A prioritaire pour prototyper la sélection par aiguilles en réutilisant la préparation existante. Le déblocage des autocollants dépendra des premières découvertes et du carnet ; la décoration viendra après la boucle jouable. Voir les [phases et critères d'acceptation](docs/COMPASS_AND_STICKERS.md) avant de planifier chaque étape.

1. Prototype jouable avec graphismes temporaires : deux emplacements, choix des éléments, résolution d'une recette.
2. Boucle complète : boussole, Néant, écran de résultat, fin de partie.
3. Carnet persistant et traduction FR/EN.
4. Intégration de l'art cartoon isométrique, transitions et effets sonores.
5. Tests d'équilibrage, compatibilité navigateur et mise en ligne sur itch.io.

**Principe directeur :** garder une mécanique simple et une découverte satisfaisante ; éviter la simulation d'écosystème, les interactions en chaîne et toute complexité non nécessaire à la Game Jam.
