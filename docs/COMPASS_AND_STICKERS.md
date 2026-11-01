# Extension de gameplay — Boussole à aiguilles et autocollants

> **Projet :** Le monde tient dans une valise  
> **Statut :** proposition à prototyper, **non encore validée en jeu**  
> **Références :** `docs/GAME_DESIGN.md`, `docs/ART_DIRECTION.md`, `docs/TECHNICAL.md`, `src/data/elements.json`, `src/data/destinations.json`.

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
- Les boutons « précédent / suivant » constituent l'interaction minimale obligatoire. La rotation directe à la souris ou au doigt est **facultative**, à ajouter seulement si elle reste robuste.
- Les aiguilles s'aimantent exactement sur un symbole ; aucun positionnement imprécis.
- La valise reflète immédiatement la paire sélectionnée ; l'ordre des aiguilles ne modifie pas la destination.
- Si les deux aiguilles pointent sur le même élément, afficher une indication claire et **désactiver Voyager**.
- Le joueur peut modifier son choix autant qu'il le souhaite avant le départ.
- À l'ouverture d'une nouvelle préparation, les aiguilles peuvent revenir à une position par défaut ; choisir une règle constante et documentée.

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
- Un motif par destination, par exemple : palmier pour l'Archipel d'Azur, champignon lumineux pour Mycélia, volcan pour le Cœur de braise.
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

À décider après un premier prototype : placement exact de la boussole à l'écran, position du bouton de décoration, nombre final de places pour les autocollants, rotation directe au doigt et éventuel nombre de destinations supplémentaire. **Ne pas ajouter de destinations dans cette tâche.**

> **Instruction pour Codex :** ce document complète les spécifications existantes. En cas de contradiction sur la **méthode de sélection**, privilégier ici les aiguilles de la boussole ; pour les **recettes, la dépense d'énergie, le carnet et la fin de partie**, conserver `GAME_DESIGN.md`. Implémenter par étapes et ne pas commencer les phases suivantes sans validation.
