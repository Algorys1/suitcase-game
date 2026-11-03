# Game Design — Le monde tient dans une valise

> **Collection complète intégrée :** les 30 destinations disposent de leur illustration, de leur histoire FR/EN et de leur autocollant souvenir. Les trois pilotes validés sont conservés ; les 27 ajouts sont des propositions à relire en jeu. Voir [le catalogue illustré et les sources](DESTINATION_COLLECTION.md). La décoration de la valise (phase C) et les Escales enchantées restent à développer. Les mentions de trois pilotes ou de placeholders ci-dessous décrivent les étapes antérieures.

> **Statut :** spécification de préproduction pour Codex.  
> **Jam :** Indie Park Game Jam #6 — thème « Voyage ».  
> **Portée :** jeu solo, jouable dans un navigateur, sessions courtes, progression de collection persistante.

> **Avancement du prototype — étape 6 :** voyages, Néant, charges 10 / 1 / 2, bilan et carnet permanent sont jouables. Les paramètres proposent FR/EN, avec application immédiate et sauvegarde du choix sans perte des découvertes. Tous les écrans et les éléments utilisent la langue choisie ; illustrations, histoires et titres anglais des destinations restent provisoires. La session est perdue au rechargement, mais le carnet et la langue restent enregistrés dans ce navigateur si le stockage est disponible. Trois autocollants souvenirs prototypent la phase B sous les histoires ; la décoration de la valise reste à ajouter après validation.

> **Complément :** [COMPASS_AND_STICKERS.md](COMPASS_AND_STICKERS.md), proposition à prototyper, non encore validée en jeu. Il prime pour la méthode de sélection par deux aiguilles ; le présent document conserve la référence des recettes, de l'énergie, du carnet et de la fin de session. Les autocollants ajoutent une progression cosmétique, sans bonus de gameplay.

## 1. Intention

**Habillage pilote en cours :** trois destinations du catalogue disposent d'illustrations et de propositions d'histoires FR/EN intégrées aux résultats et au carnet : l'Archipel d'Azur, Mycélia et le Cœur de braise. Le joueur a validé le style des trois illustrations après essai. [Les histoires et le nouvel habillage des fenêtres](DESTINATION_PILOTS.md) restent à valider. Les recettes, charges, découvertes et règles de session ne changent pas.

Le joueur prépare une valise magique en y plaçant **exactement deux éléments distincts**, puis part vers une destination fantastique déterminée par leur association. Il cherche à découvrir les **30 lieux** du carnet au fil de plusieurs parties, tout en ménageant l'énergie limitée d'une boussole.

**Promesse :** « Et si ce que j'emporte décidait de l'endroit où je vais ? »

**Piliers :**
1. **Simplicité** : sélectionner deux éléments, voyager, découvrir.
2. **Curiosité** : expérimenter des associations compréhensibles mais parfois surprenantes.
3. **Émerveillement** : une révélation visuelle courte, un nom et une petite histoire pour chaque lieu.
4. **Rejouabilité légère** : les découvertes s'accumulent dans un carnet permanent.

**Hors périmètre :** exploration libre des destinations, simulation d'écosystème, crafting en chaîne, combats, gestion de ressources multiples, monde 3D, recettes à trois éléments.

## 2. Paramètres de référence

| Paramètre | Valeur de prototype | Statut |
| --- | --- | --- |
| Éléments disponibles | 10 | Validé |
| Emplacements de valise | 2 | Validé |
| Objets nécessaires pour voyager | Exactement 2, distincts | Décision de spécification, cohérente avec les 45 paires |
| Ordre des objets | Sans importance | Validé |
| Destinations à collectionner | 30 | Validé |
| Associations possibles | 45 paires non ordonnées | Déduit des 10 éléments distincts |
| Associations menant au Néant | 15 | Déduit des 30 recettes uniques |
| Charges initiales | 10 | **À tester** |
| Coût d'une destination valide | 1 charge | **À tester** |
| Coût du Néant | 2 charges | **À tester** |
| Langues | Français, anglais | Validé |
| Style | 2D isométrique, cartoon minimaliste, coloré et magique | Validé |

La boussole constitue **la seule ressource de session**. Aucun compteur de voyages séparé.

## 3. Parcours du joueur

### 3.1 Accueil

Actions :
- **Commencer un voyage** : démarre une nouvelle session avec la boussole pleine et la valise vide.
- **Carnet de voyage** : ouvre les destinations découvertes lors de toutes les sessions précédentes, y compris la session la plus récente.
- **Paramètres** : au minimum choix de langue FR/EN.

L'accueil peut afficher une progression discrète, par exemple « 12 / 30 destinations découvertes ».

### 3.2 Préparation

L'écran présente :
- La valise ouverte en **2D isométrique**, avec **deux emplacements** visuellement lisibles.
- Une boussole avec **10 symboles d'éléments et deux aiguilles distinctes**, sélection cible définie dans [l'extension](COMPASS_AND_STICKERS.md).
- Les charges restantes, lisibles sur la boussole ou à proximité et distinctes de la sélection.
- Un bouton **Voyager**, inactif tant que deux éléments distincts ne sont pas placés.

Interaction cible à prototyper, précisée après le retour du joueur : orienter directement les aiguilles à la souris ou au doigt, avec aimantation aux crans de **36°**. Choisir une aiguille puis cliquer un symbole permet aussi de la régler ; les commandes précédent/suivant restent au clavier et dans la palette de repli. La valise reflète immédiatement les deux éléments sélectionnés. Tourner une aiguille ne coûte rien ; pendant le geste ou lorsque les choix sont identiques, Voyager est désactivé.

Le prototype de phase A utilise les aiguilles ; une palette de repli permet de choisir directement l'élément de l'aiguille active. Les deux interfaces partagent la même sélection et la même validation du départ. À l'ouverture d'une préparation, les aiguilles pointent provisoirement toutes deux sur Arbre, aiguille 1 active : le joueur doit rendre les deux choix distincts avant de valider.

**Règle de simplicité :** pas de placement libre, de voisinage, de rotation ni de taille variable. Les deux emplacements sont des choix d'objets, pas une grille spatiale. L'ordre gauche/droite n'influence jamais la destination.

### 3.3 Départ et révélation

1. Le joueur clique sur **Voyager**.
2. Le jeu verrouille les interactions pour éviter les doubles validations.
3. La valise se ferme, puis une animation magique courte se joue.
4. Le système résout la paire choisie : destination connue ou **Néant**.
5. La boussole perd les charges correspondantes.
6. Un écran de résultat montre le lieu (ou le Néant), puis propose **Continuer**.

Pour une destination valide : illustration, nom, indication **Nouvelle découverte !** si première visite globale, et court texte d'ambiance. Si elle était déjà découverte, afficher simplement une mention « Déjà visité » sans empêcher la visite.

Pour le Néant : visuel spécifique, court message, perte de charges affichée clairement. Le Néant n'est **pas** une des 30 destinations et ne s'ajoute **pas** au carnet.

### 3.4 Suite ou fin de session

Après le résultat :
- Si les charges restantes sont **supérieures à zéro**, retour à la valise pour une nouvelle association. **Par défaut, vider les deux emplacements** pour rendre la nouvelle tentative explicite (choix UX à vérifier en playtest).
- Si les charges restantes sont **égales à zéro**, afficher l'écran de **fin de voyage**.

Pour le prototype à aiguilles, la règle de réinitialisation retenue est **Arbre / Arbre, aiguille 1 active**, avec départ bloqué jusqu'à deux choix distincts. Elle s'applique à chaque nouvelle préparation ; son intégration après un vrai voyage viendra avec la boucle de jeu. Le vidage indiqué ci-dessus décrit l'ancienne préparation par placement direct.

La boussole ne peut jamais passer sous zéro : `charges = max(0, charges - coût)`.

### 3.5 Récapitulatif de fin de voyage

Afficher :
- Les destinations valides **visitées pendant cette session**.
- Les destinations **découvertes pour la première fois** pendant cette session, clairement distinguées.
- Le nombre de lieux uniques visités pendant cette session et le total permanent découvert sur 30.
- Une action **Retour à l'accueil**, d'où l'on peut recommencer.

Une destination visitée plusieurs fois peut apparaître une seule fois avec un nombre de visites, afin de ne pas surcharger l'écran. Les tentatives dans le Néant peuvent être comptées dans le bilan, mais ne sont pas des destinations découvertes.

## 4. Règles de combinaison

- Les éléments sont identifiés par des **IDs stables**, indépendants de leur nom traduit.
- Une recette correspond à une **paire non ordonnée de deux IDs distincts**.
- **Une paire = au maximum une destination**. Aucune priorité ou résolution de recettes multiples n'est nécessaire.
- Une paire sans recette mène au **Néant**.
- La même paire reproduit toujours le même résultat : **pas d'aléatoire** dans les destinations.
- Les combinaisons restent disponibles même après découverte ; aucun déblocage d'élément n'est prévu.

**Exemples validés :**

| Éléments | Destination |
| --- | --- |
| Eau + Palmier | L'Archipel d'Azur |
| Rocher + Neige | Les Cimes éternelles |
| Champignon + Arbre | Mycélia |
| Eau + Ruines | Les Ruines englouties |
| Feu + Rocher | Le Cœur de braise |
| Rocher + Nuage | Les Îles suspendues |
| Eau + Champignon | Le Marais des lucioles |
| Rocher + Cristal | Le Désert de cristal |

Les **30 recettes complètes** seront maintenues dans `src/data/destinations.json`, source de vérité unique. Les noms et descriptions français/anglais seront également associés aux destinations dans les données de contenu ou via les fichiers de traduction, sans duplication contradictoire.

### Liste des 10 éléments

Arbre, Champignon, Eau, Feu, Rocher, Palmier, Neige, Nuage, Ruines, Cristal.

### Catalogue de référence des 30 destinations

| # | Destination | Éléments |
| --- | --- | --- |
| 01 | L'Archipel d'Azur | Eau + Palmier |
| 02 | Les Cimes éternelles | Rocher + Neige |
| 03 | Mycélia | Champignon + Arbre |
| 04 | Les Ruines englouties | Eau + Ruines |
| 05 | Le Cœur de braise | Feu + Rocher |
| 06 | Les Îles suspendues | Rocher + Nuage |
| 07 | Le Marais des lucioles | Eau + Champignon |
| 08 | Le Désert de cristal | Rocher + Cristal |
| 09 | Le Palais de givre | Neige + Cristal |
| 10 | Le Temple oublié | Arbre + Ruines |
| 11 | L'Île des cendres | Feu + Palmier |
| 12 | Les Grottes sporifères | Champignon + Rocher |
| 13 | La Canopée des brumes | Arbre + Nuage |
| 14 | Le Récif de verre | Eau + Cristal |
| 15 | Les Jardins du zénith | Palmier + Nuage |
| 16 | La Cité immobile | Neige + Ruines |
| 17 | La Sylve prismatique | Arbre + Cristal |
| 18 | La Nécropole ardente | Feu + Ruines |
| 19 | La Forêt du silence | Arbre + Neige |
| 20 | Le Sanctuaire des spores | Champignon + Ruines |
| 21 | Le Royaume des spores célestes | Champignon + Nuage |
| 22 | La Tempête écarlate | Feu + Nuage |
| 23 | L'Atoll boréal | Palmier + Neige |
| 24 | Les Vestiges célestes | Nuage + Ruines |
| 25 | La Mer figée | Eau + Neige |
| 26 | La Jungle incandescente | Arbre + Feu |
| 27 | Les Jardins de gemmes | Champignon + Cristal |
| 28 | L'Empire des sables | Palmier + Ruines |
| 29 | La Faille des contraires | Feu + Neige |
| 30 | L'Observatoire des étoiles | Nuage + Cristal |

> Ce tableau capture le catalogue convenu. Les descriptions narratives détaillées et les traductions anglaises restent à écrire ; ne pas les inventer silencieusement dans l'implémentation finale sans validation éditoriale.

## 5. Boussole et équilibrage

**Hypothèse de prototype :** démarrer à 10 charges ; une destination valide coûte 1, le Néant coûte 2. Une destination déjà connue coûte également 1.

Conséquences : une session comporte au maximum 10 départs, et peut en comporter moins si le joueur rencontre le Néant. Une session ne peut pas devenir infinie.

**Points à mesurer en playtest :**
- Fréquence du Néant chez les nouveaux joueurs.
- Nombre moyen de destinations nouvelles par session.
- Impression de punition vs plaisir de découverte.
- Durée totale d'une session et fréquence des répétitions.

Ne pas ajouter de bonus de recharge, d'économie secondaire ou de mécanique de récompense avant d'avoir testé cette version.

## 6. Carnet et persistance

- Le carnet est **global au joueur local**, pas limité à une session.
- Une destination est débloquée **dès sa première visite valide**.
- Les lieux débloqués affichent : nom localisé, illustration, petite histoire localisée.
- Les lieux non débloqués restent masqués ou représentés par une silhouette / un point d'interrogation ; leurs recettes ne sont pas révélées.
- Les découvertes doivent survivre au rechargement de page et à la fin d'une session via le stockage local du navigateur.
- La langue choisie doit aussi persister.
- Aucun compte utilisateur ni synchronisation cloud.

**Extension cosmétique à prototyper :** une première découverte permanente donne accès à un autocollant associé à la destination ; les revisites et le Néant n'en ajoutent pas. Ce déblocage se déduit du carnet, sans collection persistante redondante. La décoration du couvercle utilise 6 positions fixes provisoires, indépendantes des deux emplacements d'éléments ; sa disposition sera sauvegardée. Les phases B et C et leurs critères figurent dans [COMPASS_AND_STICKERS.md](COMPASS_AND_STICKERS.md).

**Note UX :** prévenir sobrement que le carnet est enregistré dans ce navigateur et peut être perdu si les données du site sont effacées.

## 7. États et cas limites

| Situation | Comportement attendu |
| --- | --- |
| 0 ou 1 élément placé | Bouton Voyager désactivé |
| Même élément sélectionné deux fois | Départ interdit et indication claire ; la valise reflète le doublon. Aiguilles et palette de repli utilisent la même validation du départ. |
| Éléments placés dans l'ordre inverse | Même destination |
| Paire sans recette | Néant ; coût 2 |
| Destination déjà débloquée | Résultat normal ; pas de nouveau déblocage |
| Il reste 1 charge et le Néant coûte 2 | Charges ramenées à 0 ; fin de session |
| Double clic sur Voyager | Un seul départ et un seul débit |
| Rechargement pendant une session | **MVP :** la session en cours n'est pas garantie récupérable ; carnet et langue restent sauvegardés |
| Données de sauvegarde absentes ou corrompues | Réinitialiser proprement aux valeurs par défaut, sans bloquer l'accueil |
| Toutes les destinations sont découvertes | Le joueur peut toujours jouer ; carnet complet à 30/30 |

## 8. Internationalisation

Le jeu propose **FR et EN** dès le départ : accueil, boutons, messages, carnet, histoires, paramètres, récapitulatif et Néant. Les identifiants de recettes restent neutres linguistiquement. Prévoir des zones de texte assez souples pour les chaînes anglaises.

## 9. Retours visuels et rythme

- Placement : petite animation de rebond / mise en place.
- Départ : fermeture de la valise et scintillement magique.
- Destination : illustration type carte postale, nom lisible et texte court.
- Néant : ambiance distincte, plus silencieuse / mystérieuse.
- Retour : transition rapide vers la valise ou le récapitulatif.

Les animations doivent être **courtes** et ne pas rendre les tentatives répétées pénibles. Prévoir un moyen simple d'accélérer ou de passer les animations si nécessaire après test.

## 10. Critères d'acceptation du prototype

- [ ] L'accueil permet de démarrer une session, ouvrir le carnet et changer FR/EN.
- [ ] La valise propose exactement deux emplacements et dix éléments.
- [ ] Il est impossible de partir avec moins de deux éléments ou deux fois le même.
- [ ] Les 30 paires prévues mènent chacune à leur destination unique, quel que soit l'ordre.
- [ ] Les 15 autres paires mènent au Néant.
- [ ] La boussole débute à 10 et applique les coûts provisoires 1 / 2, sans devenir négative.
- [ ] Les résultats distinguent nouvelle découverte, lieu connu et Néant.
- [ ] La session s'arrête à 0 charge et présente son récapitulatif.
- [ ] Le carnet conserve les découvertes après une nouvelle session ou un rechargement.
- [ ] Les textes de l'interface sont disponibles en français et en anglais.
- [ ] Le jeu est jouable directement dans le navigateur, avec les interactions principales accessibles à la souris / au toucher.

## 11. Ordre d'implémentation recommandé

1. Modèle de données, IDs, résolution de paire, tests des 45 cas.
2. Écran de valise avec visuels temporaires, deux slots et sélection.
3. Boussole, transitions, résultats et Néant.
4. Fin de session, carnet permanent, sauvegarde.
5. Internationalisation FR/EN.
6. Illustrations, animations, audio, finition et playtests.

**Règle de production :** privilégier un parcours complet fonctionnel avant la finition graphique. Toute idée supplémentaire est hors MVP tant qu'elle n'a pas été discutée.
