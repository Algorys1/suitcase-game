# Le monde tient dans une valise

Jeu expérimental de découverte fantastique, créé pour l'**Indie Park Game Jam #6** (thème : **Voyage**).

**Projet itch.io :** [The world in a suitcase](https://algorys1.itch.io/the-world-in-a-suitcase). **Format d'intégration prévu : 960 × 540 px (16:9)**, référence principale pour la composition et la lisibilité de l'interface. Le jeu conserve son adaptation aux autres tailles de fenêtre.

> **Statut :** étape 6 — paramètres et interface FR/EN. La langue se choisit dans les paramètres, s'applique immédiatement et reste enregistrée avec le carnet. Accueil, préparation, résultats, bilan, carnet et fiches utilisent le même choix. Histoires, illustrations et titres anglais des destinations restent provisoires ; les autocollants ne sont pas encore implémentés.

> **Extension :** [boussole à aiguilles et autocollants](docs/COMPASS_AND_STICKERS.md). La phase A est implémentée avec des visuels temporaires et reste à valider en playtest. Les phases B/C ne sont pas commencées.

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
2. **Faire glisser une aiguille** depuis sa pointe ou son contrepoids pour l'orienter. La lance ajourée **▲ 1** est turquoise ; l'aiguille **◆ 2** est violette et porte une petite lentille saisissable. L'aiguille suit le geste puis s'aligne sur le symbole le plus proche au relâchement. On peut aussi sélectionner l'aiguille avec son bouton de nom, puis cliquer/toucher un symbole du cadran. Les dix positions suivent l'ordre de `elements.json`, depuis Arbre en haut, dans le sens horaire.
3. Les emplacements reflètent immédiatement le symbole le plus proche, même si les deux choix sont identiques : un message signale alors le doublon et Voyager reste désactivé. **Palette** affiche une sélection directe pour l'aiguille active et conserve les boutons **↶ / ↷** par crans de 36° ; **Boussole** revient au cadran sans changer les choix. Les boutons de noms permettent de choisir sans ambiguïté une aiguille lorsque les deux se superposent. Pendant un glisser, les autres commandes sont verrouillées. Échap, sortie du cadre, perte de focus ou redimensionnement terminent le geste sur le dernier symbole sélectionné.
4. **Voyager** s'active uniquement pour deux éléments différents et une boussole non épuisée. Le départ ferme la valise, verrouille les commandes et résout la paire une seule fois. Une destination coûte **1 charge**, une revisite aussi ; le Néant coûte **2 charges**, avec un minimum de zéro.
5. **Accueil** permet de revenir au menu. Chaque nouvelle préparation commence sur **Arbre / Arbre**, aiguille 1 active : le départ est donc bloqué jusqu'à un choix distinct. Ce réglage de prototype est constant et reste à évaluer en playtest. Le redimensionnement conserve les choix, l'aiguille active et le mode d'affichage.
6. Au clavier : **1 / 2** choisit l'aiguille, **← / →** la déplace, **Tab / Maj+Tab** déplace le focus et **Entrée / Espace** active le bouton. Un contour marque le focus ; Tab peut quitter le jeu aux extrémités du parcours.
7. Le résultat affiche le nom, le coût et les charges restantes. **Continuer** ouvre une préparation Arbre / Arbre avec les charges restantes ; à zéro, **Voir le bilan** présente les lieux de la session, le nombre de visites et les passages au Néant. Les listes longues se parcourent avec **Autres lieux**.
8. Un nouveau voyage depuis l'accueil repart toujours à **10 charges**, avec une liste de visites de session vide ; le carnet permanent est conservé. Chaque première découverte est sauvegardée dès le départ accepté, avant sa révélation. Un rechargement perd la session en cours et revient à l'accueil, en conservant les découvertes sauvegardées.
9. **Carnet de voyage** présente les 30 lieux sur plusieurs pages : les lieux inconnus restent masqués, sans nom ni recette. Cliquer/toucher un lieu connu ouvre sa fiche avec une vignette et une histoire provisoires ; le retour conserve la page consultée. L'accueil et le bilan affichent la progression sur 30 ; les nouveaux lieux de la session sont marqués **★ Nouveau**.
10. Le carnet est enregistré **dans ce navigateur**. Effacer les données du site le supprime aussi. Si le stockage est indisponible, un message indique que le carnet reste uniquement en mémoire jusqu'au rechargement ; le jeu continue de fonctionner.
11. Dans **Paramètres / Settings**, choisir **Français** ou **English**. Une coche et une bordure indiquent la langue active ; tout l'écran se traduit immédiatement. Le retour à l'accueil puis les voyages et le carnet conservent ce choix. La préférence est sauvegardée sans modifier les découvertes ; si le stockage est bloqué, elle reste valable en mémoire jusqu'au rechargement, avec un avertissement.

### Choix techniques actuels

- Sept scènes : accueil, préparation, résultat, bilan, carnet, fiche de destination et `SettingsScene`. La transition de voyage reste dans la préparation. `JournalScene` gère la grille paginée et `JournalEntryScene` les fiches connues ; la scène temporaire des paramètres a été remplacée.
- La logique pure de préparation est dans `src/domain/preparation.ts` ; `src/domain/compassSelection.ts` ajoute le réglage initial, la rotation par crans et l'aimantation d'un angle vers un élément, sans Phaser. Boussole et palette partagent les mêmes emplacements et la même validation du départ. Une sélection provisoire en doublon est visible mais ne permet pas de voyager.
- `recipes.ts` charge et valide les 30 recettes, indexées par paire non ordonnée. `compass.ts` centralise les valeurs provisoires 10 / 1 / 2 ; `session.ts` gère les phases préparation → voyage → résultat → préparation ou fin. Le débit a lieu à l'acceptation du départ, jamais dans une animation ou un redimensionnement.
- Affichage Phaser en mode `RESIZE` : panneau centré et largeur bornée sur desktop, texte redisposé et boutons conservant une taille tactile sur petit écran. Les décorations secondaires sont masquées sur les fenêtres peu hautes.
- Formes et police système temporaires, sans téléchargement de police, image ou autre ressource distante. La valise est dessinée en perspective ; la boussole présente un cercle de laiton, un cadran crème, une rose des vents et dix pictogrammes. Deux aiguilles indépendantes, une lance ajourée et une flèche avec lentille, se manipulent directement par des prises de 44 × 44 px. Les molettes latérales ont été retirées après le retour du joueur. Les noms des choix restent visibles sous le cadran et dans la valise ; les noms autour du cadran sont réservés aux grands formats.
- `services/i18n.ts` sélectionne `fr.json` ou `en.json` à partir de la préférence sauvegardée (`fr` par défaut). Les scènes lisent les textes à leur création ou au rendu, sans conserver un catalogue français figé. La page applique aussi la langue au titre de l'onglet et à l'attribut HTML `lang` dès le démarrage.
- Les clés d'interface sont typées et vérifiées dans les deux catalogues, avec les mêmes paramètres `{…}`. Les clés dynamiques des destinations passent par un résolveur avec repli français, puis texte générique lisible si la clé est inconnue.
- Les 30 noms français sont repris du tableau approuvé dans `GAME_DESIGN.md`, sans changer les catalogues. Les histoires sont explicitement des textes d'attente ; les titres anglais portent la mention courte « title pending », adaptée aux cartes du carnet. Aucun récit ni traduction éditoriale définitive n'est inventé.
- **45 tests** protègent les catalogues, les 45 combinaisons dans les deux ordres, la sélection (dont l'aimantation et le passage par le nord), le cycle de session, la progression permanente et les langues : clés manquantes, paramètres, repli de traduction, sauvegarde du choix, stockage bloqué et préservation des découvertes.
- `services/storage.ts` conserve uniquement `{ schemaVersion: 1, discoveredDestinationIds, language }` sous la clé `suitcase-game.progress.v1`. L'accès à `localStorage`, la lecture et l'écriture sont protégés ; une indisponibilité utilise la progression en mémoire. Aucune session ni charge n'est sauvegardée.
- Le résultat distingue désormais **Nouvelle découverte ! / Déjà visité** selon le carnet global. `session.ts` conserve séparément les nouveaux IDs de la session pour le bilan. Le Néant ne débloque rien et les revisites coûtent toujours 1 charge.
- La transition dure 350 ms ; la préférence système de réduction des animations supprime le fondu. La boussole affiche ses charges numériquement dans la préparation, y compris en mode palette.
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

### Vérifications de la phase A (historique)

- **15 tests Vitest** réussis, ainsi que TypeScript strict et le build Vite.
- Chrome headless : 1280 × 720, 1920 × 1080, 800 × 600, 900 × 500, 600 × 568, 360 × 640, 320 × 568 et 640 × 360. Rotations complètes, rebouclage, correspondance aiguilles/valise, blocage des doublons, palette et nouveau départ contrôlés à la souris et au toucher simulé.
- Navigation clavier, focus visible, conservation de l'état au redimensionnement, rechargement et menus existants vérifiés. Textes et zones interactives restent dans le cadre ; les boutons ne se chevauchent pas sur les formats testés.
- Build servi sous `/jam/` vérifié en desktop, portrait et paysage, sans erreur JavaScript ni ressource HTTP manquante. Captures contrôlées visuellement.
- Firefox, un appareil tactile réel et la publication itch.io restent à tester. L'ergonomie et le réglage initial attendent la validation en playtest ; la résolution et les charges ne sont pas encore disponibles.

### Vérifications de l'étape 4 (historique)

- **25 tests Vitest** réussis ; vérification TypeScript et build Vite réussis.
- Parcours complets dans Chrome headless en 1280 × 720, 800 × 600, 320 × 568, 360 × 640 et 640 × 360 : sept voyages avec revisite, Néant, épuisement, bilan paginé puis nouveau départ.
- Build servi sous `/jam/` vérifié en desktop, portrait et paysage, y compris titre long, absence de chevauchement avec les boutons et poursuite du résultat au clavier.
- Doubles clics, coûts 1 / 2, passage de 1 à 0 avant le Néant, nouvelle session à 10, préférence de réduction des animations, retour aux menus et rechargement vérifiés sans erreur JavaScript ni ressource HTTP manquante.
- Les catalogues et dépendances sont inchangés. Firefox, appareil tactile réel et page itch.io publiée restent à vérifier avant publication.

### Vérifications de l'étape 5 (historique)

- **38 tests Vitest** réussis ; TypeScript strict et build Vite réussis.
- Chrome headless en 1280 × 720, 800 × 600, 320 × 568, 360 × 640 et 640 × 360 : trente fiches, pagination complète, titres longs, retour à la bonne page et clavier vérifiés. Les lieux inconnus restent masqués et inactifs.
- Découverte sauvegardée avant la révélation et conservée après rechargement, revisite entre deux sessions, absence de doublon et de découverte pour le Néant, nouveaux lieux du bilan et compteur permanent vérifiés.
- Sauvegardes absentes, corrompues ou contenant des IDs inconnus/dupliqués, préférence de langue préservée, carnet complet toujours jouable et stockage entièrement bloqué testés. Le repli en mémoire conserve les découvertes pendant la navigation et affiche l'indisponibilité.
- Les mêmes parcours passent sur le build sous `/jam/` en desktop, portrait et paysage, sans erreur JavaScript ni ressource HTTP manquante. Les captures ont été contrôlées visuellement ; les illustrations et histoires restent provisoires.
- Catalogues et dépendances inchangés. Firefox, appareil tactile réel et publication itch.io restent à vérifier avant publication.

### Vérifications de l'étape 6

- **44 tests Vitest** réussis ; TypeScript strict et build Vite réussis. Les deux catalogues ont les mêmes clés non vides et les mêmes paramètres ; le repli français et la conservation des découvertes lors d'un changement de langue sont testés.
- Chrome headless en FR puis EN : 1280 × 720, 800 × 600, 320 × 568 et 640 × 360. Paramètres, trente fiches du carnet, titres longs, préparation, résultats, Néant et bilan vérifiés à la souris et au toucher simulé, sans texte hors du cadre ni description superposée aux boutons.
- La préférence survit au rechargement ; les changements répétés n'accumulent pas d'écouteurs d'événements. Le clavier, le titre de l'onglet, l'attribut HTML `lang`, les sauvegardes invalides et le repli en mémoire lorsque le stockage est bloqué sont vérifiés.
- Les mêmes parcours passent sur le build sous `/jam/` en 1280 × 720, 320 × 568 et 640 × 360, sans erreur JavaScript ni ressource HTTP manquante. Les captures ont été contrôlées visuellement. Firefox et appareil tactile réel restent à vérifier avant publication.
- Titres anglais de destinations raccourcis en « Destination 01 (title pending) » pour rester lisibles sur les cartes ; les histoires restent des textes d'attente dans les deux langues.

### Vérifications du prototype de boussole à molettes (historique)

- **Format itch.io 960 × 540 px :** build local servi sous `/jam/` vérifié dans Chrome headless en FR/EN : molettes, sélection, palette, départ, retour, clavier et redimensionnement. Captures contrôlées visuellement, sans dépassement des textes ni chevauchement des commandes, et sans erreur JavaScript/HTTP. Ce contrôle local ne valide pas encore l'iframe publiée sur itch.io.
- **44 tests Vitest**, TypeScript strict et build Vite réussis. Recettes, coûts, catalogue et sauvegarde inchangés ; aucune dépendance ajoutée.
- Chrome headless en FR/EN : 1280 × 720, 1920 × 1080, 800 × 600, 900 × 500, 600 × 568, 360 × 640, 320 × 568 et 640 × 360. Rotations indépendantes complètes, rebouclage dans les deux sens, absence de dépense, doublons bloqués, synchronisation avec les emplacements, palette, départ verrouillé et retour à la préparation vérifiés à la souris ou au toucher simulé.
- Clavier 1/2, flèches, Tab, Entrée/Espace, focus, état conservé au redimensionnement et rechargement vérifiés. Les zones interactives ne se chevauchent pas ; textes, commandes et aide clavier restent dans l'espace disponible. Captures contrôlées sur desktop, portrait et paysage.
- La version finale passe les mêmes huit formats dans les deux langues depuis le build sous `/jam/`, sans erreur JavaScript ni ressource HTTP manquante. Firefox, appareil tactile réel et iframe itch.io restent à vérifier avant publication. La compréhension des molettes attend le retour du joueur.

### Vérifications de la manipulation directe des aiguilles

- **45 tests Vitest**, TypeScript strict et build Vite réussis. Un test couvre l'aimantation aux dix symboles, les frontières de crans, le passage par le nord et les angles invalides. Les recettes, coûts et sauvegardes sont conservés.
- Build servi sous `/jam/` dans Chrome headless en FR/EN : 960 × 540, 1280 × 720, 800 × 600, 320 × 568, 360 × 640 et 640 × 360. Glisser des deux aiguilles et de la lentille, sélection des dix symboles par clic/toucher, indépendance des choix, absence de coût, palette et commandes par crans, départ verrouillé pendant le geste et retour au jeu vérifiés. Les essais tactiles démarrent avec l'émulation activée avant le chargement de Phaser.
- Clavier, passage par le nord, zone neutre du pivot, Échap, perte de focus, redimensionnement pendant le geste, sortie du cadre, annulation tactile et rechargement vérifiés. Aucun blocage ni erreur JavaScript/HTTP ; Chrome signale toutefois une intervention interne à Phaser lors du `preventDefault` sur un `touchcancel` non annulable. L'annulation fonctionne malgré ce message.
- Après ajustement de la superposition des aiguilles, les parcours passent à nouveau en FR/EN en 960 × 540, 320 × 568 et 640 × 360. Captures desktop, portrait et paysage contrôlées visuellement. L'essai du joueur, Firefox, un appareil tactile réel et l'iframe itch.io restent à vérifier.

## Concept

Une valise magique permet de voyager vers des destinations fantastiques. Le joueur choisit **deux éléments** parmi **dix**, avec les deux aiguilles de la boussole, puis déclenche un voyage. La combinaison révèle un lieu, ou mène au **Néant** si aucune destination ne correspond.

Le but est de découvrir le plus de lieux possible au fil des parties et de remplir un **carnet de voyage permanent**.

## Boucle de jeu prévue

Les [deux aiguilles de la boussole](docs/COMPASS_AND_STICKERS.md) sélectionnent les éléments et remplissent automatiquement la valise ; la palette reste un repli provisoire. La boucle ci-dessous et le carnet permanent sont jouables, avec des visuels et histoires temporaires.

1. Depuis l'accueil, choisir **Commencer un voyage**.
2. Découvrir la valise et les dix symboles du cadran.
3. Choisir deux éléments différents avec les aiguilles (ordre indifférent), puis cliquer sur **Voyager**.
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
- Les découvertes sont conservées entre les parties dans ce navigateur, si le stockage local est disponible.

Ces valeurs sont des hypothèses de prototype, **pas un équilibrage définitif**.

### Extension : aiguilles et autocollants

- **Phase A — implémentée, à valider en playtest :** orienter directement les aiguilles par glisser ou choisir un symbole pour l'aiguille active. La sélection s'aimante aux dix crans de 36° ; les deux emplacements reflètent les choix. Tourner ne déclenche aucune dépense ; Voyager reste désactivé pendant le geste ou si les choix sont identiques. Le clavier et la palette avec commandes par crans servent de repli.
- **Phase B — priorité moyenne :** chaque première découverte permanente débloque un autocollant cosmétique. Maximum 30, sans doublon lors des revisites et sans récompense pour le Néant. Les déblocages se déduisent du carnet.
- **Phase C — après la boucle jouable :** décorer le couvercle fermé, avec **6 positions fixes proposées**. Placement, remplacement et retrait sans perte de l'autocollant ; disposition persistante et anciennes sauvegardes compatibles.

Les recettes, les coûts prévus et la fin de session restent inchangés. Le réglage initial provisoire est Arbre / Arbre, aiguille 1 active ; le bouton de décoration et le nombre final de positions décoratives restent à déterminer. Chaque phase sera validée avant de commencer la suivante ; les autocollants ne sont pas encore disponibles.

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
- **Vitest 5.0.5** pour les tests des catalogues, de la préparation et de la sélection par boussole (résolution et charges aux étapes suivantes).

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

La sélection par aiguilles, les voyages, le carnet permanent et les paramètres FR/EN sont implémentés. Les phases d'autocollants et de décoration pourront suivre après validation des étapes correspondantes ; les textes éditoriaux et les assets définitifs restent à produire. Voir les [phases et critères d'acceptation](docs/COMPASS_AND_STICKERS.md). Après essai, le joueur juge la manipulation directe des aiguilles beaucoup mieux et plus intuitive que les molettes. Cette direction est retenue ; les détails visuels, les animations et les essais sur appareil tactile réel restent à travailler.

1. Prototype jouable avec graphismes temporaires : deux emplacements, choix des éléments, résolution d'une recette.
2. Boucle complète : boussole, Néant, écran de résultat, fin de partie.
3. Carnet persistant et traduction FR/EN.
4. Intégration de l'art cartoon isométrique, transitions et effets sonores.
5. Tests d'équilibrage, compatibilité navigateur et mise en ligne sur itch.io.

**Principe directeur :** garder une mécanique simple et une découverte satisfaisante ; éviter la simulation d'écosystème, les interactions en chaîne et toute complexité non nécessaire à la Game Jam.
