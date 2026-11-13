# Spécification technique — Le monde tient dans une valise

## État actuel — 13 novembre 2026

**Nouvelle présentation intégrée, à essayer :** [valise-boussole](SUITCASE_COMPASS.md). La mini-valise remplace le « ? » sur le trajet ; le cadran occupe son couvercle et deux manifestations magiques apparaissent en bas. Les aiguilles et règles sont conservées. Le départ animé selon les éléments est intégré ; charges métalliques dans la doublure, mode liste retiré et fond de carte flouté. Cette nouvelle passe reste à essayer.

Voir [PROJECT_STATUS.md](PROJECT_STATUS.md) pour le bilan consolidé. Les 30 destinations ont leur illustration, histoire FR/EN, souvenir et activité implémentés. La carte, le carnet et le tutoriel sont intégrés. Les validations particulières, dont les derniers essais Faille et Observatoire, sont consignées dans [DESTINATION_ACTIVITIES.md](DESTINATION_ACTIVITIES.md) ; elles ne valent pas validation globale de l’équilibrage ou de tous les textes. La phase C n’est pas commencée et demande validation préalable. Les Escales enchantées restent une proposition distincte à arbitrer, pas une suite automatiquement autorisée.

**Lecture des notes historiques :** les essais et vérifications ci-dessous conservent leurs limites d’origine. Une version explicitement validée plus récemment remplace le statut « essai attendu » de sa note initiale. Les mentions de deux/trois pilotes, de contenus à créer ou d’activités restantes décrivent les étapes antérieures, pas le périmètre actuellement implémenté.

## Historique des versions et décisions

> **Vestiges — trois pierres et porte isolée :** `domain/vestigesStairs.ts` définit trois sources, trois accroches successives et les bandes diagonales qui suivent les contremarches de la nouvelle peinture. `ui/vestigesStairs.ts` extrait trois portions d’escalier et l’intérieur de la porte depuis `adventure-vestiges-complete`, en petites textures transparentes cadrées et mipmappées ; `stairsPostcard()` les compose sur le fond brisé et fermé. L’exploration anime ces mêmes morceaux peints, puis révèle le jardin derrière la porte avant l’envol du souvenir. Les pierres libres utilisent le sprite de grès dédié, avec prises de 44 px minimum et choix du centre le plus proche dans leurs zones communes. Le curseur reste normal. `pilotSteps.vestiges_celestes` contient trois IDs (0–2) ; `vestigesLayout: 2` identifie cette disposition. Le décodeur convertit les anciens dépôts parmi 0–3 en autant de nouveaux dépôts, plafonnés à trois, puis marque la nouvelle version. Les sauvegardes de cette version gardent leurs IDs exacts. Collecte et dépôt partagent l’écriture atomique existante ; anciennes récompenses et relecture locale conservées. Le puzzle rotatif, les dalles bleues et leur chemin ne sont plus chargés. Les règles communes de glisser, annulation et nettoyage restent inchangées.

> **Sanctuaire — puzzle rotatif :** `domain/sanctuaryPuzzle.ts` porte les trois réglages à quatre positions et leur validation, sans Phaser. Champ optionnel `sanctuaryPuzzle` du schéma v1 : positions entières 0–3, tableau de taille trois, `clueSeen` booléen ; les données invalides sont ignorées sans effacer carnet ni langue. Les anciennes récompenses initialisent un motif concordant. `ProgressStore.rotateSanctuary()` sauvegarde atomiquement réglages, résolution et retrait du souvenir en attente ; les animations ne décident pas de la collecte. Les réglages peuvent encore changer après collecte, avec résolution permanente conservée. Les copies de lecture ne partagent pas le tableau des positions.

> **Carnet et conseils depuis la carte :** `travelTutorial.ts` affiche une note papier modale en réutilisant les contrôles accessibles. `tutorialSeen` est un champ optionnel validé du schéma v1 ; il conserve les conseils acquittés ou passés, sans inférer leur état des anciennes collections. Le mode de relecture ne modifie pas ce champ. Les arguments de navigation `returnTo` et `journalPage` gardent le chemin carte → carnet → fiche → exploration → fiche → carnet → carte, sans démarrer ni débiter un voyage. Une actualisation reprend toujours l’expédition sauvegardée depuis l’accueil.

> **Chapitre vivant et assets :** [sources](ADVENTURE_ASSETS.md), calques isolés dans `pilotWorlds.ts`, chargement dans `adventureAssets.ts`, placement pur des légendes dans `mapLabels.ts`. Le papier utilise l’API NineSlice de Phaser 4.2.1 installée. La police locale est chargée avant de mesurer les textes ; tous les chemins restent relatifs au build. Les animations ne décident ni des débits ni de la sauvegarde de l’offrande.

> **Prototype carte d’aventure :** [règles et compatibilité](ADVENTURE_MAP.md). Les scènes carte/exploration utilisent les champs optionnels `route`, `pendingSouvenirIds` et `awakenedMycelia`. Le carnet et la langue des anciennes sauvegardes sont conservés.

> **Collection complète intégrée :** les 30 destinations disposent de leur illustration, de leur histoire FR/EN et de leur autocollant souvenir. Les trois pilotes validés sont conservés ; les 27 ajouts sont des propositions à relire en jeu. Voir [le catalogue illustré et les sources](DESTINATION_COLLECTION.md). La décoration de la valise (phase C) et les Escales enchantées restent à développer. Les mentions de trois pilotes ou de placeholders ci-dessous décrivent les étapes antérieures.

> **Statut :** document de préproduction destiné à Codex.  
> **Références :** `README.md`, `docs/GAME_DESIGN.md`, `docs/ART_DIRECTION.md`.  
> **Cible :** jeu HTML5 autonome, exécutable directement dans le navigateur et publiable sur itch.io.

> **Avancement — étape 6 :** préparation, recettes/Néant, charges, bilan et carnet permanent paginé sont implémentés. Les paramètres FR/EN appliquent et sauvegardent le choix immédiatement. `services/i18n.ts` fournit les catalogues typés et la résolution des clés de contenu avec repli français. `services/storage.ts` conserve le schéma v1, enrichi d’un champ optionnel `expedition` validé : quitter ou recharger met la session en pause. Les erreurs de stockage utilisent un état en mémoire avec une indication non bloquante.

> **Extension :** [COMPASS_AND_STICKERS.md](COMPASS_AND_STICKERS.md) définit la sélection par aiguilles et les autocollants cosmétiques. La phase A est implémentée ; la manipulation directe est retenue. Trois autocollants souvenirs prototypent la phase B dans les résultats et fiches du carnet, sans modifier la sauvegarde. La phase C reste à valider avant implémentation.

## 1. Objectifs et contraintes

- Implémenter la boucle validée sans ajouter de mécaniques non demandées.
- Garder un projet simple, lisible, testable et facile à terminer pendant la Game Jam.
- Fonctionnement **100 % client** : aucun backend, compte utilisateur, serveur de jeu ni base de données distante.
- Le jeu doit rester jouable sans réseau après chargement des ressources ; aucune API externe nécessaire pendant une partie.
- Les visuels sont en **2D à perspective isométrique illustrée**, sans grille isométrique simulée ni moteur 3D.
- L'interface doit fonctionner à la souris et au toucher, avec un comportement raisonnable sur écran réduit.
- Ne pas inventer de recettes ou de fonctionnalités : le Game Design est la référence pour les règles.

## 2. Stack retenue

| Usage | Choix | Note |
| --- | --- | --- |
| Moteur | Phaser 4 | Fixer une version stable exacte dans `package-lock.json` ; vérifier l'API réellement installée. |
| Langage | TypeScript, mode strict | Éviter `any` et les assertions non nécessaires. |
| Build / dev | Vite | Générer un dossier `dist/` statique. |
| Tests unitaires | Vitest | Logique métier pure, sans initialiser Phaser. |
| Assets | PNG / WebP, éventuellement atlas | Préserver la transparence ; optimiser la taille. |
| Données | JSON typé et validé | Éléments, destinations, traductions. |
| Persistance | `localStorage` | Carnet permanent et préférences. |
| Publication | itch.io, HTML5 | Archive ZIP contenant `index.html` à la racine. |

Pas de React, moteur physique, serveur, framework d'état ou système de rendu 3D dans le MVP.

## 3. Architecture actuelle

- `src/domain/` : logique pure de sélection, recettes, énergie, session et activités, sans Phaser ; tests dans `src/tests/`.
- `src/services/` : stockage et internationalisation.
- `src/game/scenes/` : neuf scènes — accueil, carte d’aventure, préparation, résultat, exploration, bilan, sommaire du carnet, fiche de destination et paramètres. Le départ est animé dans la préparation ; pas de `BootScene` ni de `TravelScene` séparée.
- `src/game/ui/` : composants illustrés, contrôles, transitions et calques d’activité.
- `src/data/` : éléments, destinations, souvenirs et textes FR/EN. Les données implémentées font foi.
- `public/assets/` : ressources locales distribuées ; `designs/` : sources et prompts hors build.
- `package.json` et `package-lock.json` : versions exactes, dont Phaser 4.2.1 ; `vite.config.ts` : chemins relatifs `base: './'`.
- L’audio est désactivé (`audio: { noAudio: true }`) et aucun asset sonore n’est actuellement distribué.

Garder des modules explicites ; ne pas créer de fichiers vides pour reproduire une ancienne arborescence de préproduction.

## 4. Modèle de données

### Éléments

Chaque élément a un identifiant technique stable (anglais, `snake_case`), une clé de traduction et une référence d'asset.

```ts
type ElementId =
  | 'tree' | 'mushroom' | 'water' | 'fire' | 'rock'
  | 'palm' | 'snow' | 'cloud' | 'ruins' | 'crystal';

type ElementDefinition = {
  id: ElementId;
  nameKey: string;
  image: string;
};
```

### Destinations

```ts
type DestinationDefinition = {
  id: string;              // Identifiant stable, non traduit
  elements: [ElementId, ElementId];
  titleKey: string;
  storyKey: string;
  image: string;
};
```

- `src/data/destinations.json` est la **source de vérité** des 30 recettes et des identifiants de destinations.
- Les 30 associations existantes figurent dans `docs/GAME_DESIGN.md` ; les transcrire sans modifier leurs correspondances.
- Les noms et histoires affichés proviennent des traductions `fr.json` et `en.json` ; éviter de dupliquer les textes dans plusieurs fichiers.
- Les histoires non encore rédigées peuvent recevoir des textes provisoires **explicitement marqués**, plutôt que d'être présentées comme définitives.
- Vérifier au chargement ou au build : 10 éléments distincts, 30 destinations distinctes, deux éléments distincts par recette, aucune paire dupliquée, références et traductions valides.

### Normalisation des recettes

L'ordre des deux éléments est indifférent. Utiliser une clé canonique :

```ts
function recipeKey(a: ElementId, b: ElementId): string {
  return [a, b].sort().join('|');
}
```

Construire une table `Map<string, DestinationDefinition>` une seule fois ; si la paire n'est pas présente, le résultat est le **Néant**. Ne jamais déduire une destination de la position des éléments dans la valise.

## 5. État du jeu et transitions

**Navigation actuelle :** accueil → carte d’aventure → préparation → résultat → exploration facultative ou carte. `continueSession` conserve les phases métier existantes ; la carte et l’exploration n’ajoutent pas de débit. À zéro, la carte bloque tout départ et propose le bilan, tout en permettant la consultation des lieux. Le détail du cycle préparation/résultat ci-dessous décrit la logique métier initiale ; il ne signifie plus un retour direct obligatoire à la préparation.


Séparer **état de session** et **progression permanente**.

```ts
type SessionState = {
  charges: number;
  phase: 'preparation' | 'travelling' | 'result' | 'ended';
  visitedDestinationIds: readonly string[];  // Visites de cette session, doublons possibles
  newlyDiscoveredIds: readonly string[];     // Uniques pendant cette session
  voidTrips: number;
  lastTrip: TripResult | null;
};

type PersistentProgress = {
  schemaVersion: 1;
  discoveredDestinationIds: string[];
  language: 'fr' | 'en';
  expedition?: SessionState;
};
```

Transitions :

1. **Accueil → Préparation / Résultat / Récapitulatif** : reprendre l’expédition existante à sa phase sauvegardée ; sans expédition, créer une session avec les charges initiales.
2. **Préparation → Voyage** : autoriser seulement deux éléments différents et `charges > 0` ; figer la paire et bloquer les clics répétés.
3. **Voyage → Résultat** : résoudre la recette une seule fois, débiter la boussole une seule fois, sauvegarder immédiatement toute nouvelle découverte, puis jouer la révélation.
4. **Résultat → Préparation** si `charges > 0` : conserver les charges et réinitialiser la sélection à Arbre / Arbre.
5. **Résultat → Récapitulatif** si `charges === 0`.
6. **Récapitulatif → Accueil** : effacer seulement l’expédition terminée, conserver le carnet et la langue.

La présentation animée ne déclenche jamais une résolution ou un débit. Une écriture unique sauvegarde l’expédition et ses découvertes dès l’acceptation du départ. La phase `travelling` est normalisée en `result` dans la sauvegarde : recharger pendant l’animation revient à l’accueil, puis Reprendre affiche ce résultat déjà débité. Les transitions vers la préparation et le bilan sont sauvegardées. Le bilan reste récupérable tant que son retour à l’accueil n’a pas été activé ; seule cette action efface l’expédition terminée. L’accueil ne propose pas de nouvelle expédition pendant une session en cours. Les choix d’aiguilles restent transitoires et se réinitialisent à Arbre / Arbre.

## 6. Boussole : règles configurables

Valeurs initiales **à tester**, et non définitivement équilibrées :

```ts
export const BALANCE = {
  initialCharges: 10,
  validDestinationCost: 1,
  voidCost: 2,
} as const;
```

- Chaque voyage réussi, y compris vers un lieu déjà découvert, coûte une charge.
- Le Néant coûte deux charges.
- Toujours borner le résultat : `Math.max(0, charges - cost)`.
- Une partie s'arrête uniquement lorsque les charges sont épuisées.
- Aucun compteur de voyages indépendant, aucune régénération automatique, aucun bonus de découverte dans le MVP.

## 7. Sauvegarde et internationalisation

### Sauvegarde

**Schéma implémenté :** clé `suitcase-game.progress.v1`, `schemaVersion: 1`, `discoveredDestinationIds`, `language`, et champs optionnels `expedition` (dont `route`), `pendingSouvenirIds`, `awakenedMycelia`, `pilotSteps`, `tutorialSeen`, `sanctuaryPuzzle`, `vestigesLayout`. Les références typées et validations sont dans `src/services/storage.ts` et `src/domain/session.ts`. Aucun champ de disposition décorative n’existe encore.

`pendingSouvenirIds` distingue les mondes découverts des souvenirs encore masqués. La résolution retire le souvenir en attente et conserve les étapes avant l’animation ; les anciennes collections sans attente restent acquises. Les noms techniques `pilotSteps` et `pilotTargetCounts` couvrent les 30 activités. Les données optionnelles invalides sont filtrées ; le carnet et la langue sont préservés lorsque seule l’expédition est invalide.


- Clé proposée : `suitcase-game.progress.v1`.
- Écrire les identifiants de destinations découvertes, la langue et, si une expédition existe, son état sous le champ optionnel `expedition`. Le schéma v1 et les anciennes sauvegardes restent compatibles.
- `decodeSession` valide phases, IDs, historique, découvertes de session, coût du dernier voyage et cohérence des charges avec les voyages effectués. Une expédition invalide est écartée sans effacer le carnet ni la langue. Les copies lues et écrites ne partagent pas leurs tableaux ou leur dernier résultat avec l’état interne du stockage.
- Charger avec `try/catch`, valider la structure et ignorer les identifiants inconnus.
- Si `localStorage` est inaccessible (navigation privée ou restrictions), laisser le jeu fonctionner avec une progression en mémoire et afficher au besoin un avertissement non bloquant.
- Éviter toute sauvegarde de données personnelles.

### FR / EN

- Langue modifiable depuis les paramètres, appliquée immédiatement ou au prochain changement de scène.
- Textes d'interface, noms des éléments, titres et histoires de destination traduits.
- Clés de traduction stables ; fallback contrôlé en cas de traduction absente.
- Prévoir des libellés plus longs en anglais et ne pas intégrer de texte directement dans les images.

### Extension : aiguilles et décoration

- Phase A : les deux aiguilles pilotent les mêmes IDs d'éléments que la préparation actuelle. Garder une logique pure partagée pour la validité de la paire et empêcher tout départ incomplet ou en doublon ; ne pas dupliquer les règles dans une seconde interface.
- Le choix d'aiguille active et ses orientations sont transitoires. Aucun débit de charge lors d'un changement de sélection. Le cas de deux aiguilles sur le même symbole doit être affiché comme invalide, sans résolution de recette.
- Le réglage initial de phase A est **Arbre / Arbre**, aiguille 1 active, à chaque nouvelle préparation. `compassSelection.ts` utilise l'ordre de `elements.json` pour les crans et le rebouclage ; `preparation.ts` partage les deux IDs et la validation `isReady` avec le clic sur les signes et les aiguilles. Le doublon transitoire est affiché, mais le départ reste bloqué. Aucun état d'énergie n'est ajouté à la sélection.
- Phase B implémentée : déduire les souvenirs révélés des découvertes et des souvenirs en attente, via le stockage commun. Phase C proposée : sauvegarder seulement la disposition décorative supplémentaire, avec six positions provisoires distinctes des deux emplacements de sélection.
- Valider les IDs et les doublons invalides à la lecture de la décoration. Une sauvegarde ancienne sans décoration doit charger des positions vides ; conserver la récupération gracieuse du carnet et de la langue.
- Les nouveaux contrôles et messages restent externalisés en FR/EN. Les critères de test propres à chaque phase sont dans [l'extension](COMPASS_AND_STICKERS.md).

## 8. Interface, affichage et assets

**Netteté des textes :** les textures de texte sont dessinées à résolution 2, sans augmenter la résolution des illustrations ou du canvas global. Les noms sur les inserts de la valise ne sont plus comprimés verticalement à 90 % ni réduits par une échelle non uniforme ; leur taille de police s’ajuste à la largeur disponible. L’ombre qui dédoublait leurs contours est retirée. Vérification limitée au build et à une capture Chrome en 360 × 640 : proportions normales, canevas internes de texte à taille double et commandes dans le cadre. Aucune suite complète relancée pour cette retouche visuelle.

### Chargement progressif et démarrage illustré — 13 novembre 2026

L’accueil ne précharge plus le catalogue entier : seulement le bureau, la valise fermée, le carnet et l’illustration d’accueil, soit **1,01 Mio d’images**, contre environ 39 Mio de médias auparavant. Le bundle Phaser et la police restent à charger en supplément. Le relevé réseau Chrome confirme l’absence de destination, souvenir ou calque d’activité avant le menu.

`ui/assetLoading.ts` centralise la progression et le regroupement des ressources. Carte et bilan chargent les lieux de leur expédition ; arrivée et exploration chargent le lieu courant et ce qui est nécessaire au trajet ; une fiche du carnet charge son lieu à l’ouverture. `activityAssets` dans `adventureAssets.ts` associe les calques aux IDs stables. Les textures déjà présentes sont réutilisées ; la préparation des deux états de lentille n’est plus répétée à chaque écran. La valise entière continue de demander explicitement la frame `__BASE`.

Le texte de chargement et son papier illustré sont dans le HTML initial, avant l’exécution du moteur. `vite.config.ts` injecte les textes depuis `fr.json` / `en.json` ; une petite initialisation applique la langue sauvegardée sans attendre Phaser. Progression réelle des fichiers, texte d’ambiance et bouton Réessayer sont partagés par les scènes. En cas d’échec réseau, le résultat ne s’affiche pas avec des textures absentes ; Réessayer recharge et reprend l’expédition déjà payée, sans nouveau débit.

Les quatre PNG utilisés par la carte et les pilotes passent d’environ 8 Mio à **666 Kio de WebP** ; leurs originaux et les deux anciens PNG inutilisés restent dans `designs/adventure/original-png/`, hors build. Les anciennes fioles inutilisées et leur composant sont retirés. Les nouveaux signes cartoon du cadran sont exportés à 128 px maximum : **62,3 Kio pour dix signes**, contre environ 915 Kio pour les anciens. Sources et prompt : [cartoon-elements-v2](../designs/preparation/cartoon-elements-v2/prompt.json). Le dossier `public/` passe d’environ 44 Mio à 32 Mio ; le chargement à la demande réduit surtout l’attente initiale, sans retirer de monde.

Vérifications ciblées : build TypeScript/Vite, 9 tests de catalogue et de traduction ; couverture des anciens calques par le nouveau manifeste et existence des fichiers contrôlées. Chrome sous `/jam/` : attente avant moteur, accueil sans monde téléchargé, premier voyage et exploration, seconde préparation en 360 × 640, image volontairement bloquée puis réessai/reprise à 8 charges, fiche du carnet ouverte à froid en anglais. Captures inspectées ; pas de parcours complet des 30 activités relancé. Un lieu non encore chargé nécessite une connexion au serveur statique ; aucune API ni backend ajouté.

**Valise-boussole actuelle :** `suitcaseCompass.ts` mesure les ancrages du cadran et des deux manifestations dans l’illustration `preparation-suitcase_compass`. `compass.ts` utilise les signes `preparation-glyph-*` sans supports et sans redessiner un cadran séparé. `mapRouteLayout` et `mapDeparture` partagent la position du prochain arrêt entre carte et approche/retour ; une seule mini-valise remplace le « ? ». `PreparationScene` conserve la sélection et le verrou de départ ; aucune règle métier ni sauvegarde nouvelle. Les anciens exports de valise ouverte sans cadran sont retirés. Sources et prompts dans [SUITCASE_COMPASS.md](SUITCASE_COMPASS.md). `suitcaseDeparture.ts` présente désormais la séquence de 1,9 seconde, sans intervenir dans le débit ni la sauvegarde. Le fond est capturé une fois par taille dans une RenderTexture, puis flouté par le filtre Blur externe de Phaser 4. Les dix charges métalliques sans chiffre sont dessinées dans la doublure ; le mode liste a été retiré.


- **Réduction des illustrations :** le rendu utilise un filtrage trilinéaire (`LINEAR_MIPMAP_LINEAR`). Phaser 4.2.1 ne génère ces niveaux réduits que pour des textures de dimensions puissances de deux. `ui/illustrationTextures.ts` prépare donc une fois, après chargement dans `HomeScene`, un cache canvas de 1024 px maximum avec lissage de qualité élevée ; le cadre exclut le remplissage transparent et conserve le ratio original. Les fichiers sources et WebP restent inchangés. Les retours à l'accueil réutilisent ce cache, et un asset rechargé est préparé à nouveau.
- **Découpe des autocollants :** deux filtres Phaser 4 en espace écran ajoutent un liseré blanc et une ombre légère autour de la silhouette. Ils suivent l'opacité de l'autocollant et sont détruits avec lui. En repli Canvas, les images restent visibles sans ces effets WebGL.

- **Souvenirs :** `src/data/souvenirs.json` contient les 30 associations destination/asset/clé de traduction. `domain/souvenirs.ts` fournit le souvenir associé à un monde découvert ; `ProgressStore.unlockedSouvenirIds()` tient compte des souvenirs en attente de collecte. Les vues masquent image et nom avant résolution, et conservent les anciennes collections.

- **Collection illustrée :** les 30 chemins des illustrations viennent de `src/data/destinations.json`, sans catalogue séparé de pilotes. `HomeScene` précharge les ressources ; `ui/postcard.ts` et `ui/destinationStage.ts` partagent les rendus entre arrivée, carnet et exploration, avec calques de progression. Les sources et prompts sont conservés dans `designs/`, les WebP distribués dans `public/assets/`.
- `ui/menu.ts` présente les résultats et fiches en deux colonnes en paysage, ou avec l'image entre le titre et l'histoire en portrait. Les PNG sources et prompts sont conservés dans `designs/destinations/pilot-v1/` ; seuls les WebP de `public/assets/destinations/` sont distribués. Voir [les pilotes](DESTINATION_PILOTS.md).
- `ui/notebook.ts` dessine le papier et la reliure avec un grain déterministe, et gère les fondus/étincelles de révélation. `ResultScene` transmet uniquement le statut nouvelle découverte/revisite, le coût et le contenu déjà résolus. Le rendu ne débite aucune charge et ne modifie pas le carnet. Les effets sont annulés au redimensionnement, à la navigation clavier, à l'activation de la réduction des animations et à la sortie de scène ; ils ne repartent pas lors d'un nouveau rendu. Les fiches du carnet restent statiques.

- Scène de préparation cible : valise au centre, **deux emplacements**, boussole à dix symboles et deux aiguilles, charges lisibles, bouton Voyager.
- La manipulation directe des aiguilles est le prototype courant : glisser une pointe ou un contrepoids, ou sélectionner une aiguille puis cliquer un symbole. `elementAtAngle` convertit l'angle en élément par crans de 36°, puis la sélection commune est réutilisée. Les commandes précédent/suivant restent au clavier ; le mode liste est retiré. Le geste est transitoire, ne coûte aucune charge et bloque le départ ; les écouteurs de pointeur sont nettoyés à la sortie de scène.
- Résolution logique indépendante des coordonnées ou des assets.
- **Habillage de préparation :** `ui/preparationArt.ts` charge les dix chemins d'éléments depuis le catalogue, cinq pièces d'interface (cadran, deux aiguilles, valise ouverte/fermée) et le fond `travel_desk`. `illustrationTextures.ts` cadre les silhouettes d'après leur alpha dans le cache, sans modifier les sources. Cache de 512 px maximum pour les éléments/aiguilles, 1024 px pour les autres illustrations et 2048 px pour le fond opaque, avec dimensions puissances de deux et filtrage trilinéaire. Le fond conserve son ratio et couvre la fenêtre, centré en paysage et cadré à gauche en portrait. Les deux ancrages de compartiments restent fixes ; aucun nouvel état métier ou champ de sauvegarde.
- **Nettoyage du rendu :** dans Phaser 4.2.1, `DisplayList.removeAll(true)` détache les objets sans les détruire (`true` signifie `skipCallback`). La préparation, le carnet et les menus détruisent désormais explicitement une copie de la liste avant de redessiner, pour libérer les textures de texte, les cibles d'entrée et les écouteurs. Les illustrations partagées restent dans le gestionnaire de textures.
- **Fiole de charges illustrée :** `ui/chargeVial.ts` compose les sources peintes `preparation-vial_empty` et `preparation-vial_full` : base vide fixe, poussière de la version pleine révélée de bas en haut à l'intérieur du verre, avec une transition douce au bord. Les sources passent dans un cache de 512 px maximum, avec cadre original commun (pas de recadrage alpha indépendant), mipmaps et `willReadFrequently`. Le cadre final coupe seulement les marges communes et masque la selle en mode liste. Les niveaux composés sont réutilisés, au plus 22 textures pour les onze niveaux et les deux présentations. Aucun débit ni état de sauvegarde supplémentaire ; `session.charges` et le maximum métier restent les seules entrées. Si une source manque, le compteur numérique demeure visible. La monture et le verre sont entièrement illustrés, sans bouchon ni raccord géométrique superposé.
- **Ancienne valise ouverte — historique :** la texture `preparation-suitcase_open` charge `suitcase_open_inlaid.webp`, réillustré avec les deux inserts en cuivre. Les ancrages de `suitcase.ts` suivent leurs centres et zones inscriptibles dans le cadre alpha recadré. `menu.ts` affiche uniquement les noms inclinés et le repère de sélection, avec une cible invisible de 44 px de haut ; aucun métal ni cadre géométrique superposé. Les noms restent sur une ligne et se resserrent si nécessaire sur petit écran.
- **Lecture des pixels :** les contextes du cache d'illustrations sont créés dès le premier `getContext` avec `{ willReadFrequently: true }`. `CanvasTexture` lit aussi les pixels lors de `addCanvas` ; activer cette option seulement après la création du contexte ne suffit pas. La lueur de sélection utilise un unique dégradé radial de 128 px mis en cache, teinté sous les symboles, avec le même réglage de contexte.
- Dimensions d'intégration itch.io retenues : **960 × 540 px (16:9)**. Utiliser ce format comme référence principale de composition et de test ; conserver le redimensionnement Phaser et vérifier aussi les petites résolutions et la lisibilité.
- Prévoir des cibles tactiles suffisamment larges, états sélectionné/désactivé, et contraste du texte.
- La valise est une **illustration 2D isométrique**, pas un inventaire physique avec collisions.
- Éviter les chemins d'assets absolus incompatibles avec un hébergement sous sous-chemin ; utiliser une base Vite relative (`base: './'`) et vérifier les chargements dans le ZIP final.
- Les 30 illustrations sont intégrées ; conserver un repli lisible en cas de texture absente, sans recréer une étape de production de placeholders.

## 9. Tests automatisés et tests manuels

### Vitest — tests métier prioritaires

Vérification exécutée le 12 novembre 2026 : **161 tests dans 41 fichiers**, TypeScript strict et build Vite réussis. Aucun nouveau parcours navigateur pour la consolidation documentaire. Les comptes rendus Chrome sont dans [DESTINATION_ACTIVITIES.md](DESTINATION_ACTIVITIES.md). Firefox, tactile physique et iframe itch.io restent à vérifier avant publication.


- Les 30 recettes sont uniques et résolues dans les deux ordres.
- Il existe 45 paires distinctes possibles parmi 10 éléments, dont 30 valides et 15 menant au Néant.
- Deux fois le même élément ne peut pas déclencher Voyager.
- Une destination valide retire 1 charge ; le Néant en retire 2 ; jamais de valeur négative.
- Une destination déjà connue coûte une charge mais n'est pas redécouverte.
- Les découvertes permanentes sont dédupliquées et restaurées après chargement.
- Un stockage corrompu ou indisponible n'empêche pas de jouer.

### Vérification navigateur

- Parcours complet : accueil → préparation → voyage → résultat → récapitulatif → accueil → carnet.
- Fonctionnement du clic et du toucher ; impossibilité de lancer deux voyages par double-clic.
- Navigation FR/EN, y compris les histoires et boutons.
- Aucune ressource manquante ou erreur console en build de production.
- Vérifier Chromium et Firefox, et au moins un navigateur mobile si possible.
- Tester une partie entière avec un nombre de charges réduit pour atteindre rapidement la fin.

## 10. Build et publication itch.io

Page du projet fournie par le développeur : [The world in a suitcase](https://algorys1.itch.io/the-world-in-a-suitcase). Taille d'intégration prévue : **Width 960 px / Height 540 px**. Ces informations ne constituent pas une vérification du build actuellement hébergé.

1. Initialiser le projet avec les versions stables réellement disponibles, puis **verrouiller le lockfile**.
2. Scripts attendus : `dev`, `build`, `preview`, `test` (les commandes exactes sont définies dans `package.json` lors de l'initialisation).
3. Vérifier `npm run build`, puis servir le dossier `dist/` localement avec `npm run preview`.
4. Créer une archive ZIP du **contenu** de `dist/`, avec `index.html` directement à la racine du ZIP (et non un dossier `dist/` parent).
5. Sur itch.io, choisir le type de projet HTML / jouable dans le navigateur et téléverser le ZIP.
6. Configurer la taille d'intégration à **960 × 540 px** et tester la page publiée en navigation réelle, y compris sauvegarde, traductions, son et assets.
7. Vérifier les règles actualisées de la Game Jam avant publication, notamment les éventuelles obligations de déclaration des outils utilisés.

Ne pas supposer qu'un build réussi garantit le bon fonctionnement dans l'iframe itch.io : **tester le jeu publié**.

## 11. Ordre initial d’implémentation — historique

1. **Fondations** : Vite + Phaser 4 + TypeScript strict + écran d'accueil minimal.
2. **Données et règles** : 10 éléments, 30 recettes, normalisation, boussole, tests Vitest.
3. **Boucle jouable** : préparation à deux slots, voyage, résultat, Néant, fin de partie.
4. **Progression** : carnet permanent, sauvegarde locale, bilan de session.
5. **Accessibilité fonctionnelle** : FR/EN, interface adaptable, clic/toucher.
6. **Habillage** : assets, animations courtes, effets sonores et transitions selon `ART_DIRECTION.md`.
7. **Livraison** : build, ZIP HTML5, test sur itch.io, correction des bugs.

À chaque étape, préserver une version lançable du jeu. Priorité à une boucle complète avec visuels temporaires plutôt qu'à un écran magnifique mais incomplet.

## 12. Critères d'acceptation technique du MVP

- [ ] Le jeu démarre dans un navigateur via Vite et en build statique.
- [ ] La valise accepte exactement deux éléments distincts parmi dix.
- [ ] Les 30 recettes mènent chacune à la bonne destination, quel que soit l'ordre.
- [ ] Les 15 autres paires mènent au Néant.
- [ ] La boussole applique les coûts provisoires, sans descendre sous zéro.
- [ ] Le joueur peut terminer une partie et consulter son récapitulatif.
- [ ] Le carnet conserve les destinations entre plusieurs parties et rechargements.
- [ ] L'interface et les histoires sont disponibles en français et en anglais.
- [ ] Aucun backend ni exécutable n'est requis.
- [ ] L'archive HTML5 fonctionne sur une page itch.io après publication.

---

**Arbitrage général :** `COMPASS_AND_STICKERS.md` prime pour la méthode de sélection cible ; `GAME_DESIGN.md` reste la référence pour les recettes, l'énergie, le carnet et la fin de session. `ART_DIRECTION.md` définit l'intention visuelle ; ce document définit les choix d'implémentation. Les paramètres marqués *à tester* et l'extension à prototyper ne constituent pas une validation en jeu.
