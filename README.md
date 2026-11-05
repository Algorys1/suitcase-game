# Le monde tient dans une valise

> **Reflets de l’Archipel :** les six grandes étincelles déjà peintes sur l’eau font apparaître progressivement le coquillage sur son étiquette. Chaque reflet différent révèle une portion, le dernier débloque le souvenir et son nom. Les étapes se conservent après retour au carnet ou rechargement ; les anciens souvenirs restent acquis. « Revoir l’apparition » permet de rejouer la révélation sans modifier sa collection.

> **Prototype carte d’aventure — 4 novembre 2026 :** carte d’itinéraire, dix badges de charge, escales accessibles et exploration pour trouver les nouveaux souvenirs. Premier lien interactif : clochette des Cimes → Mycélia. Cette évolution est à valider en jeu et prime sur les descriptions historiques ci-dessous. [Règles du prototype](docs/ADVENTURE_MAP.md).

> **Première passe visuelle :** carte sur papier et vignettes illustrées, mouvements des instruments, arrivée en carte postale et découverte de la clochette des Cimes avec envol de son autocollant. Les cadrages d’arrivée et d’exploration sont communs ; les commandes et petits formats ont été retravaillés. La boucle attend un nouvel essai du joueur.

> **Chapitre vivant :** la clochette des Cimes répond au toucher ; son invitation conduit à une Mycélia endormie que l’offrande réveille, avec un petit habitant à saluer. Accueil et autocollants retrouvent leurs étiquettes ; la carte, les charges et les légendes ont leur nouvel habillage. [Assets et sources](docs/ADVENTURE_ASSETS.md).

Jeu expérimental de découverte fantastique, créé pour l'**Indie Park Game Jam #6** (thème : **Voyage**).

**Projet itch.io :** [The world in a suitcase](https://algorys1.itch.io/the-world-in-a-suitcase). **Format d'intégration prévu : 960 × 540 px (16:9)**, référence principale pour la composition et la lisibilité de l'interface. Le jeu conserve son adaptation aux autres tailles de fenêtre.

> **Statut :** boucle jouable, interface FR/EN et collection complète intégrée : **30 destinations illustrées, 30 histoires FR/EN et 30 autocollants souvenirs**. Les trois pilotes validés sont conservés ; les 27 nouvelles propositions attendent la relecture du joueur en jeu. Le [catalogue illustré](docs/DESTINATION_COLLECTION.md) réunit les cartes, récits et souvenirs.

> **Extension :** la manipulation directe des aiguilles et la présentation des souvenirs sur étiquette kraft sont retenues. La phase B couvre désormais les 30 destinations ; le déblocage est déduit du carnet, compatible avec les anciennes sauvegardes. La phase C (décoration de la valise) n’est pas commencée. Les [Escales enchantées](docs/ESCALES_ENCHANTEES.md) sont une étape ultérieure.

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
5. **Pause · Accueil** met l’expédition en pause. **Reprendre le voyage** conserve les charges et l’historique. Chaque préparation commence sur **Arbre / Arbre**, aiguille 1 active ; les choix ne sont pas sauvegardés. Le redimensionnement conserve les choix, l’aiguille active et le mode d’affichage.
6. Au clavier : **1 / 2** choisit l'aiguille, **← / →** la déplace, **Tab / Maj+Tab** déplace le focus et **Entrée / Espace** active le bouton. Un contour marque le focus ; Tab peut quitter le jeu aux extrémités du parcours.
7. Le résultat affiche le nom, le coût et les charges restantes. **Continuer** ouvre une préparation Arbre / Arbre avec les charges restantes ; à zéro, **Voir le bilan** présente les lieux de la session, le nombre de visites et les passages au Néant. Les listes longues se parcourent avec **Autres lieux**.
8. Recharger revient à l’accueil sans perdre l’expédition, si le stockage est disponible. Un départ interrompu se reprend directement à son résultat, avec son coût déjà déduit. À zéro, consulter le bilan puis revenir à l’accueil clôt l’expédition : on peut alors repartir à **10 charges**, avec un historique vide et le carnet permanent conservé. Si le bilan est interrompu par un rechargement, **Voir le bilan** permet de le retrouver.
9. **Carnet de voyage** rapproche le carnet de l'accueil puis ouvre son sommaire. Les 30 lieux sont répartis sur plusieurs pages : noms cliquables pour les découvertes, « ? » inactifs pour les inconnus, sans dévoiler les recettes. Les coins supérieurs et les flèches du clavier feuillettent le sommaire. Une destination s'ouvre avec un effet de page tournée ; ses coins parcourent les destinations déjà découvertes dans l'ordre du catalogue. **Retour au sommaire** conserve la page d'origine. L'accueil et le bilan affichent la progression sur 30 ; les nouveaux lieux de la session sont marqués **★ Nouveau**.
10. Le carnet est enregistré **dans ce navigateur**. Effacer les données du site le supprime aussi. Si le stockage est indisponible, un message indique que le carnet reste uniquement en mémoire jusqu'au rechargement ; le jeu continue de fonctionner.
11. Dans **Paramètres / Settings**, choisir **Français** ou **English**. Une coche et une bordure indiquent la langue active ; tout l'écran se traduit immédiatement. Le retour à l'accueil puis les voyages et le carnet conservent ce choix. La préférence est sauvegardée sans modifier les découvertes ; si le stockage est bloqué, elle reste valable en mémoire jusqu'au rechargement, avec un avertissement.

### Choix techniques actuels

**Pause et reprise — vérifications :** 61 tests Vitest et build TypeScript/Vite réussis. Chrome, build sous `/jam/`, FR/EN en 960 × 540, 320 × 568 et 640 × 360 : allers-retours accueil/préparation, rechargement pendant le départ, au résultat et au bilan, changement de langue, conservation des charges et découvertes, dernier Néant de 1 à 0, puis nouvelle session à 10 après le bilan vérifiés à la souris et au toucher simulé. Une expédition corrompue conserve le carnet et la langue. Aucune erreur JavaScript ou HTTP détectée. Captures desktop et téléphone inspectées. Le stockage bloqué est couvert par les tests unitaires : la pause reste en mémoire jusqu’au rechargement. Appareil tactile réel et iframe itch.io restent à vérifier avant publication.

- Sept scènes : accueil, préparation, résultat, bilan, carnet, fiche de destination et `SettingsScene`. La transition de voyage reste dans la préparation. `JournalScene` gère le sommaire paginé et `JournalEntryScene` les fiches connues ; la scène temporaire des paramètres a été remplacée.
- La logique pure de préparation est dans `src/domain/preparation.ts` ; `src/domain/compassSelection.ts` ajoute le réglage initial, la rotation par crans et l'aimantation d'un angle vers un élément, sans Phaser. Boussole et palette partagent les mêmes emplacements et la même validation du départ. Une sélection provisoire en doublon est visible mais ne permet pas de voyager.
- `recipes.ts` charge et valide les 30 recettes, indexées par paire non ordonnée. `compass.ts` centralise les valeurs provisoires 10 / 1 / 2 ; `session.ts` gère les phases préparation → voyage → résultat → préparation ou fin. Le débit a lieu à l'acceptation du départ, jamais dans une animation ou un redimensionnement.
- Affichage Phaser en mode `RESIZE` : panneau centré et largeur bornée sur desktop, texte redisposé et boutons conservant une taille tactile sur petit écran. Les décorations secondaires sont masquées sur les fenêtres peu hautes.
- Préparation illustrée à partir de la maquette retenue : valise en cuir caramel, cadran crème et laiton, aiguilles peintes indépendantes et dix figurines communes au cadran et aux compartiments. Les prises de 44 × 44 px sur les pointes et contrepoids, les noms FR/EN sous la boussole, le clavier et la palette de repli restent disponibles. En portrait, la valise passe sous le cadran. Images locales WebP et police système, sans service distant ; les formes simples restent un repli en cas de texture absente.
- `services/i18n.ts` sélectionne `fr.json` ou `en.json` à partir de la préférence sauvegardée (`fr` par défaut). Les scènes lisent les textes à leur création ou au rendu, sans conserver un catalogue français figé. La page applique aussi la langue au titre de l'onglet et à l'attribut HTML `lang` dès le démarrage.
- Les clés d'interface sont typées et vérifiées dans les deux catalogues, avec les mêmes paramètres `{…}`. Les clés dynamiques des destinations passent par un résolveur avec repli français, puis texte générique lisible si la clé est inconnue.
- Les 30 noms français sont repris du tableau approuvé dans `GAME_DESIGN.md`. Les 30 destinations ont une histoire FR/EN et un titre anglais, proposés à la relecture du joueur. Les textes affichés restent dans `fr.json` et `en.json`.
- Les 30 illustrations locales WebP sont chargées depuis les chemins de `destinations.json`, sans liste de pilotes séparée. Résultats, vignettes et fiches du carnet partagent le même rendu sans déformation. Le dessin temporaire reste disponible si une texture manque.
- **61 tests** protègent les catalogues, les 30 illustrations et souvenirs, les 45 combinaisons, la sélection, le cycle de session, la progression et les langues. Les tests de reprise couvrent le départ interrompu, le débit unique, les revisites, le dernier Néant à zéro, le bilan, les sauvegardes invalides et le stockage indisponible.
- `services/storage.ts` conserve `{ schemaVersion: 1, discoveredDestinationIds, language, expedition? }` sous la clé `suitcase-game.progress.v1`. L’expédition et les découvertes sont enregistrées ensemble au départ ; les anciennes sauvegardes restent compatibles. Une expédition invalide n’efface pas le carnet ni la langue. Si le stockage est indisponible, la pause reste fonctionnelle en mémoire, jusqu’au rechargement.
- Le résultat distingue désormais **Nouvelle découverte ! / Déjà visité** selon le carnet global. `session.ts` conserve séparément les nouveaux IDs de la session pour le bilan. Le Néant ne débloque rien et les revisites coûtent toujours 1 charge.
- La transition dure 350 ms ; la préférence système de réduction des animations supprime le fondu. La boussole affiche ses charges numériquement dans la préparation, y compris en mode palette.
- Vite peut signaler un bundle supérieur à 500 Ko : le moteur Phaser représente l'essentiel du fichier. Cet avertissement n'empêche pas le build.

### Accueil illustré

La composition validée présente la valise fermée, le carnet prune et une boussole sur la table de préparation. Le titre FR/EN reste du texte net ; l'illustration passe sous le titre en portrait. Le départ utilise la languette de papier existante, le carnet affiche la progression permanente et les paramètres restent accessibles. Souris, toucher et clavier conservent les trois actions du menu.

Illustration produite avec l'outil intégré `image_gen` : [source PNG](designs/home/hero-v1/departure.png), [prompt et références](designs/home/hero-v1/prompt.json), [export WebP transparent](public/assets/home/departure.webp) (366 Kio). Le décor existant est réutilisé. Si l'illustration manque, la valise fermée sert de repli.

### Préférences de voyage — nouvel habillage

Les paramètres prennent la forme d'une fiche crème posée sur la table existante, avec pince en laiton, billet ancien et crayon. Deux étiquettes sélectionnent Français ou English ; un tampon prune avec coche marque le choix actif et apparaît brièvement lors d'un changement. La préférence de réduction des animations affiche le tampon immédiatement. Le retour conserve la languette de papier commune aux autres écrans.

Deux compositions peintes, paysage et portrait, sont générées avec l'outil intégré `image_gen` : [sources PNG et prompts](designs/settings/stationery-v1/), exports WebP transparents dans `public/assets/settings/` (environ 281 Kio au total). La composition s'adapte à la fenêtre ; les textes FR/EN, les zones tactiles et le focus clavier restent rendus par le jeu. La langue et les découvertes conservent leur sauvegarde existante. Une fiche dessinée prend le relais si l'illustration est indisponible. Cette présentation est validée visuellement par le joueur.

Vérifications exécutées : **51 tests Vitest**, TypeScript strict et build Vite réussis. Chrome headless, build sous `/jam/`, FR/EN en 960 × 540, 1280 × 720, 1920 × 1080, 800 × 600, 320 × 568, 360 × 640, 640 × 360 et 600 × 568 : choix et sauvegarde de langue, conservation des découvertes, tampon, retours et rechargement contrôlés à la souris ou au toucher simulé. Clavier, réduction des animations, redimensionnement pendant le tampon, absence de rejeu à la réouverture, texture absente et stockage bloqué vérifiés ; parcours courants sans erreur JavaScript/HTTP. Captures desktop, portrait et paysage contrôlées visuellement. Firefox, appareil tactile réel et iframe itch.io restent à vérifier avant publication.

### Ouverture et feuilletage du carnet — prototype à valider

Le carnet se rapproche en 650 ms, puis sa couverture pivote en 430–520 ms. Les pages se tournent en 480 ms avec deux faces de papier autour de la reliure. Les interactions sont verrouillées pendant ces transitions ; redimensionnement et changement de préférence d'animation terminent proprement l'effet. `prefers-reduced-motion` donne un accès immédiat. Aucune charge ni donnée de sauvegarde ne change lors de la consultation.

La couverture séparée a été dérivée de l'accueil avec l'outil intégré `image_gen` : [source PNG](designs/journal/cover-v2/closed.png), [prompt](designs/journal/cover-v2/prompt.json), [WebP transparent](public/assets/journal/closed.webp) (282 Kio). Le rapprochement utilise un fondu entre le carnet peint dans l'accueil et cette couverture ; l'illustration d'accueil validée reste intacte. Sans la couverture, le sommaire s'ouvre directement.

Les effets sont dans `src/game/ui/notebookMotion.ts`. Les deux textures temporaires de feuilletage sont libérées à la fin, au redimensionnement ou à la sortie. Avec Phaser 4, `DynamicTexture.draw()` met les dessins en attente : `render()` est appelé avant de détruire les objets de la page précédente.

### Habillage de l'écran de préparation

- Fiole illustrée à essayer : verre en goutte, poussière d'étoiles et monture en laiton peinte, sans bouchon, intégrée au bord de la boussole. Le verre et le métal restent fixes tandis que la poussière diminue avec les charges ; compteur conservé. Sources [pleine](designs/preparation/vial-v2/vial_full.png) / [vide](designs/preparation/vial-v2/vial_empty.png), [prompt initial](designs/preparation/vial-v2/prompt-full.json) et [prompts d'édition](designs/preparation/vial-v2/prompts-empty.json), produits avec l'outil intégré `image_gen`. Exports `public/assets/preparation/vial_full.webp` et `vial_empty.webp` (490 Ko au total). Rendu dynamique dans `game/ui/chargeVial.ts`, sans nouvelle règle de jeu.
- Fiole vérifiée dans Chrome, build sous `/jam/`, en FR/EN sur les six formats ci-dessous. Niveaux 10, 9, 2, 1 et 0 contrôlés ; voyages valides/revisites (−1), Néant (−2), passage de 1 à 0 et bilan vérifiés. Aucun avertissement de lecture Canvas2D ni erreur JavaScript/HTTP pendant ces parcours.
- Nouvelle fiole peinte : mêmes six formats et deux langues contrôlés, avec palette et session complète jusqu'au bilan. Captures aux niveaux 10, 9, 5, 2, 1 et 0 ; comparaison des pixels confirmant un cadre et un métal fixes, et une quantité décroissante de poussière visible. Build, TypeScript strict et 51 tests réussis. Le rendu attend le retour du joueur.
- Après déplacement sur la valise : plaques, libellés longs, zones tactiles distinctes, fiole attachée, palette et voyages vérifiés en FR/EN sur les six formats. Clavier et repli sans illustrations contrôlés en 960 × 540 et 320 × 568. Build, TypeScript strict et 51 tests Vitest réussis ; aucun changement de règle ni de sauvegarde.
- Reprise illustrée des inserts en cuivre : noms sur une ligne, inclinaison, clic/toucher, aiguilles, palette et voyages contrôlés en FR/EN à 960 × 540, 320 × 568 et 640 × 360. Session complète avec revisite, Néant et dernier débit de 1 à 0 vérifiée ; build et 51 tests réussis, aucune erreur JavaScript/HTTP ni avertissement de lecture Canvas2D. Le rendu attend l'avis du joueur.
- Après retour du joueur : halo doux sous les symboles sélectionnés, deux plaques de sélection sans scotch (toujours cliquables pour choisir l'aiguille active) et lien discret **Choisir par liste / Choose from list** pour la palette de secours. **Voir la boussole / Show compass** revient au cadran. Les lectures de pixels du cache utilisent `willReadFrequently` dès la création des contextes Canvas2D.

- La [maquette retenue](designs/preparation/concept-v1/preparation.png) est déclinée en quinze images indépendantes : cadran, lance turquoise ajourée, aiguille violette à lentille, valise ouverte/fermée et dix éléments. Les figurines sont communes au cadran et aux deux compartiments. Les noms restent sur les commandes de sélection ; les prises, la palette, le clavier et les règles de voyage sont conservés.
- `game/ui/preparationArt.ts`, `compass.ts`, `suitcase.ts` et `PreparationScene.ts` portent le rendu. Deux colonnes à 960 × 540, valise sous la boussole en portrait ; palette élargie en petit paysage pour garder les libellés lisibles. Aucun nom à l'intérieur du cadran, noms des choix gravés sur deux plaques en cuivre directement peintes dans le rebord de la valise, au-dessus des fermetures. La valise a été réillustrée avec `image_gen` après rejet des plaques géométriques : [source PNG](designs/preparation/inlaid-suitcase-v2/suitcase_open_wide.png), [prompt initial](designs/preparation/inlaid-suitcase-v2/prompt.json), [ajustement de largeur](designs/preparation/inlaid-suitcase-v2/prompt-wide.json). Export transparent `public/assets/preparation/suitcase_open_inlaid.webp` (266 Ko), ancienne illustration conservée. Les plaques restent cliquables, avec un repère turquoise/violet, sans numéro ni icône. Quelques gravures géométriques et une lueur discrète au pivot renforcent le caractère magique du cadran. Textes FR/EN externalisés.
- Nouveau décor à tester après abandon du fond vert : table peinte en bois clair, carte de voyage et papiers en bordure ; textes bruns et plaques en cuivre. Le fond couvre l'écran sans déformation et conserve la carte à gauche en portrait. Source et [prompt](designs/preparation/background-v1/prompt.json) dans `designs/preparation/background-v1/`, générés avec l'outil intégré `image_gen` ; export WebP opaque de 112 Ko dans `public/assets/preparation/travel_desk.webp`. Cache de 2048 px maximum pour ce fond ; repli beige si l'image manque.
- PNG sources et [prompts complets](designs/preparation/assets-v1/prompts.json) dans `designs/preparation/assets-v1/`, produits avec l'outil intégré `image_gen`. Les quinze WebP transparents dans `public/assets/preparation/` et `public/assets/elements/` pèsent **2,66 Mo** au total. Cache lissé de 512 px maximum pour les figurines/aiguilles et 1024 px pour les grandes pièces ; les silhouettes sont cadrées dans le cache, sans modifier les sources.
- Correction du nettoyage lors des rafraîchissements : les objets sont détruits explicitement avant de redessiner la préparation, le carnet ou les menus. L'ancien `DisplayList.removeAll(true)` les détachait sans libérer leurs textures et leurs cibles d'entrée.
- **51 tests Vitest**, TypeScript strict et build Vite réussis. Chrome headless, build sous `/jam/`, FR/EN : dix figurines et quinze textures vérifiées à 960 × 540, 1280 × 720, 800 × 600, 360 × 640, 320 × 568 et 640 × 360. Transparence, filtrage trilinéaire, proportions, placement dans la valise et lisibilité de la palette contrôlés ; cache stable après changements de sélection et retours à l'accueil.
- Session complète avec trois découvertes pilotes, revisite, Néant, bilan et rechargement vérifiée. En retirant les quinze textures, les dessins/libellés de secours permettent encore de sélectionner et voyager ; les images reviennent au passage suivant à l'accueil. Le rendu réel attend l'essai du joueur ; Firefox, appareil tactile réel et publication itch.io restent à vérifier.
- Souris/tactile simulé à 960 × 540, 320 × 568 et 640 × 360 en FR/EN : prises des aiguilles, lentille, dix symboles, palette et départ vérifiés. Clavier, Échap, sortie du cadre, perte de focus, redimensionnement et annulation tactile contrôlés. Après la correction du nettoyage, les révélations du carnet passent aussi avec animation normale/réduite, changement de préférence en cours d'effet, sortie anticipée et navigation clavier, sans erreur JavaScript/HTTP.

### Habillage du résultat et révélation

- Résultats et fiches de destination partagent un carnet crème : grain de papier discret, reliure caramel, pli central discret et cousu, exactement au milieu de deux pages de même largeur en paysage, coins dorés et boutons en languette de papier aux bords déchirés, fixée par deux morceaux de scotch translucide en haut à droite et en bas à gauche. La page se réorganise en portrait sans étirer l'illustration. La grille du carnet et les autres menus restent à habiller après validation de cette première fenêtre.
- La carte apparaît avant le texte ; une première découverte ajoute six étincelles brèves. Les revisites ont un fondu plus court et les fiches du carnet sont immédiates. Continuer fonctionne pendant l'effet. Le redimensionnement, le clavier et la réduction des animations terminent l'effet sans le relancer ; les effets sont nettoyés à la sortie de scène.
- `src/game/ui/notebook.ts`, `menu.ts`, `postcard.ts` et `ResultScene.ts` portent cet habillage. Aucune dépendance, ressource distante, règle métier ou donnée de sauvegarde supplémentaire.
- **46 tests Vitest**, TypeScript strict et build Vite réussis. Chrome headless, build sous `/jam/`, FR/EN : illustrations et textes à 960 × 540, 1280 × 720, 800 × 600, 320 × 568, 360 × 640 et 640 × 360, à la souris et au toucher simulé. Les 30 fiches passent à 960 × 540, 320 × 568 et 640 × 360 ; captures contrôlées visuellement.
- Nouvelle découverte, revisite, sortie pendant le fondu, nettoyage des effets, clavier, redimensionnement, Néant, persistance et préférence de réduction des animations (y compris activée en cours de révélation) vérifiés sans erreur JavaScript/HTTP. La publication itch.io, Firefox et un appareil tactile réel restent à vérifier.

### Autocollants souvenirs — historique du pilote de phase B

- **Coquillage des horizons**, **Lanterne à spores** et **Braise éternelle** : trois objets rapportés des voyages, sous les histoires des résultats et fiches du carnet. Première découverte annoncée en FR/EN, apparition après le texte, vue compacte sur petit écran. Les recettes pour les essayer figurent dans [la présentation des pilotes](docs/SOUVENIR_PILOTS.md).
- Déblocage déduit du carnet existant : les anciennes découvertes donnent leur souvenir immédiatement, sans migration ni nouveau champ sauvegardé. Revisites sans doublon ; aucun souvenir pour le Néant. Les 27 autres souvenirs ont depuis été ajoutés dans la [collection complète](docs/DESTINATION_COLLECTION.md) ; la décoration de la valise reste à développer.
- `data/souvenirs.json`, `domain/souvenirs.ts` et `game/ui/souvenir.ts` portent les données, la disponibilité et le rendu. Noms FR/EN externalisés. Trois WebP locaux transparents, environ 495 Ko ; sources PNG et prompts conservés dans `designs/stickers/pilot-v1/`.
- Après retour du joueur : illustrations et autocollants utilisent un cache avec mipmaps et filtrage trilinéaire pour les petites tailles. Un liseré blanc et une ombre légère distinguent les autocollants du papier crème. Les fichiers d'images restent inchangés. Cache et effets WebGL contrôlés dans Chrome en 960 × 540, 320 × 568 et 640 × 360, y compris retours répétés au carnet sans accumulation de textures.
- Support actuellement à l'essai : étiquette de bagage en kraft brun avec œillet et scotch, nom écrit sur le papier et autocollant incliné entièrement contenu dans le kraft. Le support est dessiné dans `game/ui/souvenir.ts` et accompagne le fondu existant ; aucune ressource supplémentaire n'est chargée.
- **51 tests Vitest**, TypeScript strict et build Vite réussis. Les tests couvrent les associations, assets, noms traduits, absence de déblocage avant découverte, anciennes sauvegardes, revisites, rechargement, choix de langue et repli en mémoire.
- Chrome headless, build servi sous `/jam/`, FR/EN en 960 × 540, 320 × 568 et 640 × 360 : trois découvertes, résultats, revisite, Néant, fin de session, carnet et rechargement vérifiés. Les images et noms restent sous les histoires, dans le cadre et sans chevaucher les commandes.
- Anciennes sauvegardes avec les trois lieux connus vérifiées en FR/EN sur six formats : 960 × 540, 1280 × 720, 800 × 600, 320 × 568, 360 × 640 et 640 × 360. Stockage bloqué, absence de doublons, réduction des animations, redimensionnement pendant la révélation, transparence WebP et repli si une texture manque contrôlés sans erreur JavaScript/HTTP. Firefox, appareil tactile réel et publication itch.io restent à vérifier.

### Vérifications des trois destinations pilotes (historique)

- **46 tests Vitest**, TypeScript strict et build Vite réussis. Présence des trois assets aux chemins du catalogue, textes FR/EN et règles existantes vérifiés ; aucune dépendance ajoutée.
- Build servi sous `/jam/` dans Chrome headless, en FR/EN : 960 × 540, 1280 × 720, 800 × 600, 320 × 568, 360 × 640 et 640 × 360. Trois découvertes, illustrations, histoires, revisite, Néant, bilan, carnet et persistance après rechargement vérifiés à la souris ou au toucher simulé.
- Les 30 fiches du carnet passent en FR/EN à 960 × 540, 320 × 568 et 640 × 360. Textes et contrôles restent dans le cadre ; images sans déformation ni chevauchement avec les textes. Captures contrôlées sur desktop, portrait et paysage.
- Clavier, conservation des charges au redimensionnement et avertissement de stockage indisponible vérifiés sur ces trois formats. Retrait d'une texture du cache avant consultation : dessin temporaire lisible, navigation fonctionnelle, image restaurée après rechargement. Aucun échec de chargement HTTP ni erreur JavaScript sur les parcours applicatifs.
- La cohérence artistique et les histoires attendent le retour du joueur. Firefox, appareil tactile réel et iframe publiée sur itch.io restent à vérifier avant publication.

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

Les [deux aiguilles de la boussole](docs/COMPASS_AND_STICKERS.md) sélectionnent les éléments et remplissent automatiquement la valise ; la palette reste un repli provisoire. La boucle ci-dessous et le carnet permanent sont jouables, avec les 30 destinations illustrées et leurs histoires FR/EN.

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
- **Phase B — 30 souvenirs intégrés :** chaque première découverte permanente donne son autocollant cosmétique. La collection couvre les 30 destinations. Les déblocages se déduisent du carnet, sans doublon lors des revisites ni récompense pour le Néant.
- **Phase C — après la boucle jouable :** décorer le couvercle fermé, avec **6 positions fixes proposées**. Placement, remplacement et retrait sans perte de l'autocollant ; disposition persistante et anciennes sauvegardes compatibles.

Les recettes, les coûts prévus et la fin de session restent inchangés. Le réglage initial provisoire est Arbre / Arbre, aiguille 1 active ; le bouton de décoration et le nombre final de positions décoratives restent à déterminer. Les 30 autocollants sont consultables dans les fiches du carnet ; la présentation des trois pilotes est validée. La collection complète attend maintenant la relecture du joueur.

## Contenu prévu

- **10 éléments** : arbre, champignon, eau, feu, rocher, palmier, neige, nuage, ruines, cristal.
- **30 destinations** fantastiques, chacune associée à une paire unique d'éléments.
- **15 paires sans destination** conduisant au Néant (sur les 45 paires possibles de deux éléments distincts).
- **2 emplacements seulement** ; pas de recettes à trois éléments dans le périmètre retenu.
- **FR et EN** dès la première version.

Les identifiants, recettes et références d'assets et de traductions sont déjà présents dans `src/data/destinations.json` et `src/data/elements.json`. Ces catalogues sont conservés tels quels. Les illustrations, histoires et souvenirs sont intégrés ; les nouveaux contenus restent à relire en jeu.

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

Le carnet s’ouvre maintenant depuis le bas gauche de la carte et revient à l’aventure en conservant son trajet. Trois conseils FR/EN introduisent le départ, l’exploration et les souvenirs ; ils peuvent être passés, restent acquittés après rechargement et se relisent depuis le sommaire. Le carnet distingue les souvenirs cachés, acquis et la piste Cimes → Mycélia.

La prochaine étape de conception est consignée dans [les petits jeux des 30 destinations](docs/DESTINATION_ACTIVITIES.md) : une proposition par illustration, le tutoriel, l’accès au carnet depuis la carte et des animations sans récompense à envisager plus tard. Seules les activités des Cimes et de Mycélia sont actuellement implémentées.

| Fichier | Rôle |
| --- | --- |
| `AGENTS.md` | Consignes de travail pour Codex |
| `docs/GAME_DESIGN.md` | Règles détaillées, écrans, progression et cas limites |
| [`docs/COMPASS_AND_STICKERS.md`](docs/COMPASS_AND_STICKERS.md) | Extension à prototyper : sélection par aiguilles, autocollants et décoration persistante |
| `docs/ART_DIRECTION.md` | Style, interface, animations et ressources visuelles |
| `docs/TECHNICAL.md` | Architecture, sauvegarde, tests et export itch.io |
| [`docs/DESTINATION_COLLECTION.md`](docs/DESTINATION_COLLECTION.md) | Collection illustrée des 30 destinations, récits FR/EN, souvenirs, sources et vérifications |
| `src/data/destinations.json` | Catalogue des 30 destinations et recettes |
| `src/data/elements.json` | Palette des 10 éléments |

## Priorités de production

La sélection par aiguilles, les voyages, le carnet permanent et les paramètres FR/EN sont implémentés. Les 30 autocollants sont intégrés. La collection complète attend la relecture du joueur avant la décoration et les étapes suivantes. Voir les [phases et critères d'acceptation](docs/COMPASS_AND_STICKERS.md). Après essai, le joueur juge la manipulation directe des aiguilles beaucoup mieux et plus intuitive que les molettes. Cette direction est retenue ; les détails visuels, les animations et les essais sur appareil tactile réel restent à travailler.

1. Prototype jouable avec graphismes temporaires : deux emplacements, choix des éléments, résolution d'une recette.
2. Boucle complète : boussole, Néant, écran de résultat, fin de partie.
3. Carnet persistant et traduction FR/EN.
4. Intégration de l'art cartoon isométrique, transitions et effets sonores.
5. Tests d'équilibrage, compatibilité navigateur et mise en ligne sur itch.io.

**Principe directeur :** garder une mécanique simple et une découverte satisfaisante ; éviter la simulation d'écosystème, les interactions en chaîne et toute complexité non nécessaire à la Game Jam.


Dernière passe du prototype : les trois sommets des Cimes déclenchent un lever de soleil ; les cinq fenêtres de Mycélia allument le village. Les gestes partiels persistent, le souvenir inconnu est une enveloppe anonyme et l’offrande garde une commande séparée. Voir [la proposition et ses vérifications](docs/ADVENTURE_MAP.md) et [les assets et prompts](docs/ADVENTURE_ASSETS.md). Les autres escales restent à approfondir après validation de ces deux essais.
