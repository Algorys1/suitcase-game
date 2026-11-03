# Extension de gameplay — Boussole à aiguilles et autocollants

> **Collection complète intégrée :** les 30 destinations disposent de leur illustration, de leur histoire FR/EN et de leur autocollant souvenir. Les trois pilotes validés sont conservés ; les 27 ajouts sont des propositions à relire en jeu. Voir [le catalogue illustré et les sources](DESTINATION_COLLECTION.md). La décoration de la valise (phase C) et les Escales enchantées restent à développer. Les mentions de trois pilotes ou de placeholders ci-dessous décrivent les étapes antérieures.

> **Projet :** Le monde tient dans une valise  
> **Statut :** proposition à prototyper, **non encore validée en jeu**  
> **Références :** `docs/GAME_DESIGN.md`, `docs/ART_DIRECTION.md`, `docs/TECHNICAL.md`, `src/data/elements.json`, `src/data/destinations.json`.

> **Avancement :** phase A, voyages, charges 10 / 1 / 2, bilan et carnet permanent sont implémentés. La manipulation directe des aiguilles est retenue après essai. La **phase B commence avec trois autocollants souvenirs pilotes**, visibles sous les histoires des destinations découvertes. Leur disponibilité se déduit du carnet, sans nouveau champ de sauvegarde. La phase C n'est pas commencée. [Pilotes et vérification](SOUVENIR_PILOTS.md).

## 1. Objectif

Renforcer l'identité du jeu sans modifier sa boucle centrale : **choisir deux éléments → fermer la valise → voyager → découvrir une destination ou le Néant**.

Deux ajouts ciblés :

1. **Boussole à deux aiguilles :** une façon plus ludique de sélectionner les deux éléments.
2. **Autocollants :** une récompense cosmétique permanente pour décorer la valise après avoir découvert des destinations.

Ces ajouts **ne créent pas de nouvelles recettes**, n'ajoutent pas de troisième emplacement et ne changent pas les règles de consommation de charges.

## 2. Boussole à deux aiguilles

### 2.1 Intention

La boussole devient l'outil de sélection principal. Dix symboles, correspondant aux dix éléments existants, sont répartis autour du cadran. Deux aiguilles distinctes permettent de choisir **exactement deux éléments différents**. Les éléments sélectionnés apparaissent automatiquement dans les deux emplacements de la valise.

La boussole remplit ainsi **deux fonctions séparées** :

- **Sélection :** orientation des aiguilles vers les éléments.
- **Énergie :** jauge de charges restante, affichée sur le même objet ou à proximité.

**Important :** tourner les aiguilles ne coûte aucune charge. Seul le bouton « Voyager » déclenche la dépense, après résolution du voyage.

### 2.2 Interactions

- Chaque aiguille a une couleur et une forme distinctes, reconnaissables sans dépendre uniquement de la couleur.
- Le joueur choisit l'aiguille active puis la tourne, au clic/toucher, par crans de **36°** entre dix positions.
- **Direction choisie après le prototype à molettes :** orienter directement les aiguilles par glisser à la souris ou au doigt. Les commandes précédent/suivant restent disponibles au clavier et dans la palette de repli. Le clic sur un symbole règle aussi l'aiguille active.
- Les aiguilles s'aimantent exactement sur un symbole ; aucun positionnement imprécis.
- La valise reflète immédiatement la paire sélectionnée ; l'ordre des aiguilles ne modifie pas la destination.
- Si les deux aiguilles pointent sur le même élément, afficher une indication claire et **désactiver Voyager**.
- Le joueur peut modifier son choix autant qu'il le souhaite avant le départ.
- À l'ouverture d'une nouvelle préparation, les aiguilles peuvent revenir à une position par défaut ; choisir une règle constante et documentée.

**Choix du prototype de phase A :** à chaque nouvelle préparation, les deux aiguilles pointent sur **Arbre**, avec l'aiguille 1 active. Les deux emplacements affichent ce choix identique et Voyager est bloqué jusqu'à une sélection distincte. L'ordre horaire suit `elements.json` depuis Arbre à 12 h. Les crans s'appliquent immédiatement, sans animation bloquante. Le redimensionnement et la bascule palette/boussole conservent les choix. Ce réglage reste à évaluer en playtest.

**Commandes disponibles — manipulation directe :** saisir la pointe ou le contrepoids d'une aiguille (zones de 44 × 44 px), puis la faire pivoter. La lance ajourée ▲ 1 est turquoise ; l'aiguille ◆ 2 est violette et porte une lentille saisissable. Le mouvement reste continu visuellement pendant le geste ; les emplacements indiquent le symbole le plus proche et l'aiguille s'aligne exactement au relâchement. Aucun départ n'est possible pendant le geste. La zone proche du pivot ignore les mouvements pour éviter les sauts ; Échap, sortie du cadre, perte de focus, annulation tactile ou redimensionnement terminent le geste en conservant la dernière sélection. Les boutons de noms permettent aussi de choisir l'aiguille, notamment en cas de superposition, puis un clic/toucher sur un symbole règle cette aiguille. Raccourcis 1 / 2, flèches gauche/droite, Tab / Maj+Tab et Entrée / Espace conservés. La palette garde les dix éléments et les deux commandes ↶ / ↷ par crans, avec la même validation du départ.

### 2.3 Animation et accessibilité

- Rotation courte et lisible ; aucun délai inutile entre deux crans.
- Afficher le **nom textuel** de chaque élément sélectionné, en FR/EN.
- Prévoir une zone cliquable généreuse, un focus visible pour les commandes et une navigation clavier simple si possible.
- Sur petit écran, privilégier les commandes par crans plutôt qu'un geste de précision.
- Les symboles peuvent d'abord être des placeholders ; pas besoin d'assets définitifs pour tester l'ergonomie.

### 2.4 Intégration et compatibilité

Cette interaction **remplace la palette cliquable comme moyen principal de sélection**, mais conserve les règles existantes de la valise : deux emplacements, deux éléments distincts, 45 paires possibles, recettes indépendantes de l'ordre.

Pour éviter une refonte inutile, **réutiliser la logique de sélection déjà implémentée** : les aiguilles sont une nouvelle interface vers les mêmes deux IDs d'éléments. Si la palette existe déjà, la conserver provisoirement comme outil de debug ou solution de repli pendant le prototype ; ne pas maintenir deux systèmes de règles parallèles.

La jauge d'énergie reste **10 charges initiales, −1 pour une destination valide, −2 pour le Néant**, paramètres à équilibrer lors des playtests.

## 3. Autocollants de voyage

### 3.1 Intention

Chaque **nouvelle destination découverte** débloque un autocollant thématique. Le joueur peut personnaliser l'extérieur de sa valise avec ces souvenirs. La décoration reste visible d'une partie à l'autre et donne une identité à sa valise.

Les autocollants sont **purement cosmétiques** : aucun bonus, aucune modification des recettes ni de l'énergie.

### 3.2 Règles de déblocage

- **Un autocollant par destination** : les 30 destinations actuelles donnent au maximum 30 autocollants.
- Le déblocage se produit lors de la **première découverte permanente** de la destination, et non à chaque visite.
- Les destinations déjà connues ne créent aucun doublon.
- **Le Néant ne débloque aucun autocollant.**
- Un autocollant débloqué reste disponible après la fin de la session, via la même sauvegarde locale que le carnet.
- Le déblocage peut être annoncé sur l'écran de résultat : « Nouvel autocollant ! ».

### 3.3 Décoration — version Game Jam

Pour limiter la complexité, utiliser une **vue de la valise fermée** avec quelques positions prédéfinies pour les autocollants, plutôt qu'un éditeur libre.

- Un bouton « Décorer ma valise » est accessible depuis le carnet ou l'accueil (emplacement à confirmer selon l'interface réelle).
- Le joueur choisit un autocollant débloqué puis un emplacement libre sur le couvercle.
- Il peut retirer ou remplacer un autocollant sans le perdre.
- Les autocollants non débloqués peuvent apparaître verrouillés, sans révéler nécessairement leur destination.
- Les positions doivent être suffisamment espacées pour rester lisibles en perspective 2D isométrique.
- La décoration enregistrée réapparaît sur la valise fermée, notamment pendant la transition de voyage si la scène le permet.

**Valeur de prototype proposée :** 6 emplacements décoratifs fixes sur la valise, indépendamment des 30 autocollants collectionnables. À ajuster selon la taille réelle du couvercle.

**Hors périmètre MVP :** glisser-déposer libre, rotation, redimensionnement, superposition d'autocollants, économie ou rareté.

### 3.4 Direction artistique

- Petits pictogrammes cartoon simples, colorés et immédiatement reconnaissables.
- Silhouette lisible à petite taille, contour doux, peu de détails.
- Un souvenir rapporté du voyage par destination : le joueur a écarté les rappels d'ingrédients (palmier, champignon, volcan). Les trois motifs pilotes retenus sont un coquillage magique pour l'Archipel d'Azur, une lanterne à spores pour Mycélia et une fiole de braise éternelle pour le Cœur de braise.
- Garder une marge et une ombre discrète pour donner l'impression d'un autocollant collé sur le cuir.
- Les 30 illustrations peuvent être produites progressivement ; prévoir un pictogramme temporaire par destination pendant le développement.

## 4. Données et sauvegarde

Conserver les IDs existants des éléments et destinations. Éviter de dupliquer les 30 recettes dans ce système.

**Modèle conceptuel (indicatif) :**

```ts
type CompassSelection = {
  firstElementId: string;
  secondElementId: string;
};

type StickerDecoration = {
  // Identifiant de destination ou null si emplacement vide.
  slots: Array<string | null>;
};
```

- Le déblocage d'un autocollant peut être **déduit des IDs de destinations déjà découverts** dans le carnet : ne pas stocker un deuxième état de déblocage redondant.
- Sauvegarder uniquement la disposition des autocollants, en plus du carnet existant.
- À la lecture, ignorer proprement les IDs inconnus et les doublons invalides ; une ancienne sauvegarde sans décoration doit fonctionner avec des emplacements vides.
- Le réglage des aiguilles est un état d'interface transitoire, pas une nouvelle ressource persistante.
- Prévoir les libellés et messages en français et en anglais via le système de traduction existant.

## 5. Parcours cible

1. Le joueur commence une session ; la boussole affiche ses charges restantes.
2. Il oriente les deux aiguilles vers deux symboles distincts.
3. Les deux éléments apparaissent dans la valise ; le bouton « Voyager » devient disponible.
4. Il part ; la valise se ferme et montre éventuellement ses autocollants.
5. Le résultat apparaît ; les charges sont déduites selon les règles existantes.
6. En cas de première découverte, le carnet s'enrichit et un autocollant est débloqué.
7. Hors de la boucle de voyage, le joueur peut décorer le couvercle avec les autocollants acquis.
8. À l'épuisement de la boussole, le récapitulatif habituel apparaît ; carnet et décoration persistent.

## 6. Priorités d'implémentation

**Phase A — Boussole interactive (priorité haute)**

- Afficher dix symboles et deux aiguilles différenciées.
- Choisir et tourner les aiguilles par crans.
- Synchroniser les deux emplacements de valise.
- Interdire les doublons et les départs incomplets.
- Tester sur desktop et écran tactile réduit.

**Phase B — Déblocage des autocollants (priorité moyenne)**

**Retour du joueur :** les trois souvenirs, le carnet et la présentation sur étiquette kraft sont retenus. Les autocollants restent entièrement à l'intérieur de l'étiquette, légèrement inclinés ; le scotch suffit à évoquer le souvenir collé. Le joueur demande un commit de cette étape. Cette validation porte sur le pilote de trois destinations ; les 27 autres motifs restent à concevoir et la phase C n'est pas commencée.

**Pilote courant :** trois souvenirs illustrés et nommés en FR/EN, affichés dans le résultat et dans les fiches connues du carnet. Les anciennes sauvegardes donnent déjà accès aux souvenirs de leurs lieux découverts ; aucun déblocage séparé n'est enregistré. Les autres motifs et la décoration attendent la validation de ces exemples.

- Associer chaque destination à un motif temporaire.
- Débloquer l'autocollant lors de la première découverte.
- Afficher le déblocage et la collection.
- Vérifier la persistance.

**Phase C — Décoration (priorité moyenne, après la boucle jouable)**

- Vue du couvercle fermé et 6 emplacements fixes.
- Poser, remplacer et retirer un autocollant.
- Sauvegarder et restaurer la disposition.
- Afficher la décoration pendant la fermeture si l'animation existante le permet.

## 7. Critères d'acceptation

- [ ] Deux aiguilles permettent de sélectionner n'importe quelle paire de deux éléments **distincts** parmi les dix.
- [ ] Les 30 recettes et les 15 associations menant au Néant restent inchangées.
- [ ] Tourner les aiguilles ne consomme aucune charge ; voyager applique le coût existant une seule fois.
- [ ] La valise affiche toujours les éléments réellement sélectionnés.
- [ ] Les commandes sont utilisables à la souris et au toucher sans précision excessive.
- [ ] Une première découverte débloque exactement un autocollant correspondant.
- [ ] Une revisite ne débloque aucun doublon ; le Néant n'en débloque pas.
- [ ] La décoration persiste après rechargement et nouvelle partie.
- [ ] Les anciennes sauvegardes restent lisibles.
- [ ] Les nouveaux textes existent en FR et EN.
- [ ] Le build HTML5 et les tests existants continuent de passer.

## 8. Points volontairement ouverts

À décider après un premier prototype : placement exact de la boussole à l'écran, position du bouton de décoration et nombre final de places pour les autocollants. La manipulation directe des aiguilles est désormais la direction choisie, avec une ergonomie à tester. **Ne pas ajouter de destinations dans cette tâche.**

### Premier retour de playtest — premiers voyages

- Le système fonctionne et suscite l'envie de tester d'autres associations, malgré les graphismes provisoires. Ce premier retour soutient l'intention de curiosité ; il ne constitue pas encore une validation générale de l'équilibrage.
- La commande actuelle de rotation des aiguilles est jugée peu intuitive. Son fonctionnement technique est vérifié, mais son ergonomie reste à retravailler avec le futur habillage.
- **Piste proposée par le joueur, à prototyper :** des molettes sur les côtés de la boussole. Leur association visuelle avec chaque aiguille doit être immédiatement compréhensible ; la forme précise de l'interaction reste à choisir et à tester à la souris et au toucher.
- Lors de cette reprise, évaluer explicitement la compréhension des commandes et la facilité à choisir une paire. Préserver les crans, les deux choix et la validation du départ ; ne pas considérer les boutons précédent/suivant actuels comme l'interface définitive.

### Reprise visuelle — prototype à molettes (historique)

Le joueur a demandé de prototyper un cercle doré, un cadran crème, dix pictogrammes et deux molettes latérales. Les planches dans `designs/` servent de références d'ambiance (laiton, cuir, papier et miniatures), sans modifier le catalogue ni les règles. Le dessin utilise les formes Phaser existantes : rose des vents, aiguilles effilées indépendantes et contrepoids différents, sans couronne de montre. Les sélections identiques restent visibles grâce à deux cercles concentriques sur leur pictogramme ; Voyager reste bloqué. Sur petit écran, les noms sélectionnés sont conservés sous le cadran, tandis que les dix noms autour du cadran sont masqués pour préserver la lisibilité. L'énergie reste dans un bloc distinct près de la valise.

Cette version a été essayée puis remplacée : le joueur trouve les molettes trop proches d'une montre et préfère orienter les aiguilles directement. Le nouveau prototype conserve le cadran et ajoute une lance ajourée et une petite lentille sur les aiguilles, comme pistes visuelles pour une boussole magique. Ces détails graphiques et l'ergonomie du geste restent à valider en playtest. Les phases B/C restent non commencées.

**Premier retour sur la manipulation directe :** le joueur la juge « beaucoup mieux et plus intuitive » et demande de conserver cette version dans un commit. La direction d'interaction est retenue ; les détails graphiques, les animations et l'équilibrage restent à travailler. Ce retour ne lance pas les phases B/C.

> **Instruction pour Codex :** ce document complète les spécifications existantes. En cas de contradiction sur la **méthode de sélection**, privilégier ici les aiguilles de la boussole ; pour les **recettes, la dépense d'énergie, le carnet et la fin de partie**, conserver `GAME_DESIGN.md`. Implémenter par étapes et ne pas commencer les phases suivantes sans validation.
