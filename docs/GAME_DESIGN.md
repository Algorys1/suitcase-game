# Game Design — Le monde tient dans une valise

## État actuel — 13 novembre 2026

**Quatrième correspondance autorisée le 18 novembre :** le Coquillage des horizons de l’Archipel d’Azur, apporté depuis la pochette à la Mer figée, accueille un petit phoque. Le coquillage reste acquis, aucun coût ni bonus ; l’activité du globe reste indépendante. Coquillage et ondes sur la glace, applaudissements au clic et visite de l’accueil intégrés, à essayer. Voir `PROJECT_STATUS.md` pour les vérifications.

**Correction du 18 novembre :** les quatre habitants réagissent au clic dans le carnet. L’ancien panneau d’offrande spécifique à Mycélia et les rappels de la clochette sont retirés ; les quatre correspondances passent par la pochette, sans indication de compatibilité. La clochette déjà accueillie reste suspendue et réactive dans l’exploration.

**Complément autorisé le 17 novembre :** trois correspondances sont intégrées via la pochette du carnet : clochette des Cimes → Mycélia, lanterne de Mycélia → Forêt du silence, braise du Cœur de braise → Cité immobile. Chaque offrande conserve le souvenir et accueille un habitant, indépendant de l’activité locale, sans coût ni bonus. Les habitants acquis peuvent visiter l’accueil. Aucun texte ne donne la destination d’un souvenir. Les mentions antérieures de Cimes → Mycélia comme seul lien implémenté décrivent les versions précédentes ; voir `PROJECT_STATUS.md` pour les essais et validations.

**Nouvelle présentation intégrée, à essayer :** [valise-boussole](SUITCASE_COMPASS.md). La mini-valise remplace le « ? » sur le trajet ; le cadran occupe son couvercle et deux manifestations magiques apparaissent en bas. Les aiguilles et règles sont conservées. Le départ animé selon les éléments est intégré ; charges métalliques dans la doublure, mode liste retiré et fond de carte flouté. Cette nouvelle passe reste à essayer.

Voir [PROJECT_STATUS.md](PROJECT_STATUS.md) pour le bilan consolidé. Les 30 destinations ont leur illustration, histoire FR/EN, souvenir et activité implémentés. La carte, le carnet et le tutoriel sont intégrés. Les validations particulières, dont les derniers essais Faille et Observatoire, sont consignées dans [DESTINATION_ACTIVITIES.md](DESTINATION_ACTIVITIES.md) ; elles ne valent pas validation globale de l’équilibrage ou de tous les textes. La phase C n’est pas commencée et demande validation préalable. Les Escales enchantées restent une proposition distincte à arbitrer, pas une suite automatiquement autorisée.

**Lecture des notes historiques :** les essais et vérifications ci-dessous conservent leurs limites d’origine. Une version explicitement validée plus récemment remplace le statut « essai attendu » de sa note initiale. Les mentions de deux/trois pilotes, de contenus à créer ou d’activités restantes décrivent les étapes antérieures, pas le périmètre actuellement implémenté.

## Historique des versions et décisions

> **Archipel — conclusion harmonisée :** toucher les six grands reflets différents garde des ondulations discrètes dans le paysage. L’étiquette reste anonyme jusqu’à la fin : les lueurs convergent dans l’eau, le souvenir s’y forme puis s’envole vers l’étiquette. L’apparition progressive de l’image sur l’étiquette est retirée. Ordre libre, étapes persistantes, anciennes collections préservées et aucune charge dépensée dans le lieu. Voir [la proposition actuelle](DESTINATION_ACTIVITIES.md). La disposition du paysage original ne change pas.

> **Suite à concevoir après essai des deux explorations :** [petits jeux des 30 destinations, tutoriel, carnet sur la carte et animations gratuites](DESTINATION_ACTIVITIES.md). La direction des pilotes Mycélia/Cimes est appréciée par le joueur. Les nouvelles fiches sont des propositions de conception, sans modification des règles ni implémentation des 28 activités restantes.

> **Évolution autorisée pour prototype, 4 novembre 2026 :** [carte d’aventure](ADVENTURE_MAP.md), exploration pour les nouveaux souvenirs et correspondance Cimes → Mycélia. Ces modifications priment sur les passages historiques correspondants. Les recettes, coûts et anciennes collections sont préservés ; le plaisir reste à valider en jeu.

> **Collection complète intégrée :** les 30 destinations disposent de leur illustration, de leur histoire FR/EN et de leur autocollant souvenir. Les trois pilotes validés sont conservés ; les 27 ajouts sont des propositions à relire en jeu. Voir [le catalogue illustré et les sources](DESTINATION_COLLECTION.md). La décoration de la valise (phase C) et les Escales enchantées restent à développer. Les mentions de trois pilotes ou de placeholders ci-dessous décrivent les étapes antérieures.

> **Statut :** spécification de préproduction pour Codex.  
> **Jam :** Indie Park Game Jam #6 — thème « Voyage ».  
> **Portée :** jeu solo, jouable dans un navigateur, sessions courtes, progression de collection persistante.

> **Avancement du prototype — étape 6 :** voyages, Néant, charges 10 / 1 / 2, bilan et carnet permanent sont jouables. Les paramètres proposent FR/EN, avec application immédiate et sauvegarde du choix sans perte des découvertes. Quitter met désormais l’expédition en pause : son état, ses charges et son bilan survivent au retour à l’accueil et au rechargement si le stockage est disponible. Les choix d’éléments reviennent à Arbre / Arbre en reprenant la préparation. La décoration de la valise reste à ajouter après validation.

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

**Parcours actuel :** accueil → carte d’aventure → préparation → arrivée → exploration facultative ou retour à la carte. La carte ouvre les lieux visités et le carnet sans nouveau débit. À zéro charge, elle bloque les départs mais conserve exploration et accès au bilan ; le retour à l’accueil depuis le bilan clôt l’expédition. Le monde est découvert dès l’arrivée ; son nouveau souvenir demande de résoudre l’activité. Avant collecte, image et nom du souvenir restent masqués dans toutes les vues ; les anciens souvenirs restent acquis. Cimes → Mycélia est la seule correspondance implémentée, sans consommation du souvenir. Voir [ADVENTURE_MAP.md](ADVENTURE_MAP.md) et [DESTINATION_ACTIVITIES.md](DESTINATION_ACTIVITIES.md).

Les sous-sections suivantes décrivent ce parcours implémenté ; les anciens essais et comptes rendus restent consultables dans [l’historique de production](PRODUCTION_HISTORY.md).


### 3.1 Accueil et reprise

- Sans expédition : commencer un voyage crée une session à 10 charges puis ouvre la carte.
- Avec expédition : reprendre conserve charges et historique ; un départ accepté reprend à son résultat, sans nouveau débit. Un bilan en attente reste accessible.
- Carnet permanent et paramètres FR/EN restent accessibles. Quitter ou recharger met l’expédition en pause si le stockage est disponible.

### 3.2 Carte et préparation

La carte affiche le trajet, les lieux visités et les charges. Le carnet s’ouvre puis revient à la même aventure sans voyage supplémentaire. Valise et boussole donnent accès à la préparation tant qu’il reste une charge.

La valise 2D isométrique présente exactement deux emplacements ; les deux aiguilles choisissent parmi les dix éléments. Glisser une pointe ou un contrepoids, ou choisir une aiguille puis cliquer un symbole, règle les choix avec aimantation à 36°. Le clic sur les signes et le clavier utilisent la même sélection ; le mode liste est retiré à la demande du joueur. Chaque nouvelle préparation commence sur Arbre / Arbre, aiguille 1 active ; le redimensionnement conserve les choix.

Tourner les aiguilles est gratuit. Voyager reste inactif pendant un geste, avec deux éléments identiques, sans paire valide ou sans charge. L’ordre des éléments ne change pas la recette. Aucun placement libre ni grille.

### 3.3 Départ, arrivée et exploration

Le départ verrouille les interactions, résout et débite une seule fois, sauvegarde l’état puis joue la fermeture et la transition. Le coût ne dépend jamais d’une animation.

- Destination valide : inscription immédiate au carnet, illustration, nom et histoire FR/EN, statut nouvelle découverte ou revisite. Coût 1, y compris pour un lieu déjà connu.
- Néant : présentation dédiée, aucun monde ni souvenir ajouté, coût 2 borné par les charges restantes.
- Après arrivée : explorer ou revenir à la carte. L’exploration est facultative, sans coût supplémentaire ; on peut revenir au lieu depuis la carte ou sa fiche du carnet.
- Chaque monde possède une activité locale. Les textes avant résolution restent de l’ambiance sans solution ; curseur normal, aucun repère artificiel de cible.
- Le nouveau souvenir reste anonyme dans toutes les vues jusqu’à résolution. Les étapes sont sauvegardées avant les animations ; la collecte est unique. Les anciens souvenirs restent acquis, la relecture locale ne réécrit pas la collection.
- La clochette des Cimes peut être offerte à Mycélia sans consommation ; cette correspondance est indépendante de son activité locale. Aucune autre correspondance n’est implémentée.

Les interactions, versions retenues et validations particulières sont détaillées dans [DESTINATION_ACTIVITIES.md](DESTINATION_ACTIVITIES.md). Le [premier voyage accompagné](TUTORIAL.md) est intégré : notes contextuelles animées FR/EN, aide aux gestes et guide relisible depuis le carnet. Son agrément reste à valider par le joueur. L’accès à l’exploration utilise désormais une [longue-vue illustrée](TRAVEL_SPYGLASS.md), sur l’arrivée et dans le carnet ; rendu à essayer par le joueur.

### 3.4 Fin d’expédition

À zéro charge, la carte bloque tout nouveau départ mais permet encore l’exploration et l’accès au bilan. Le bilan récapitule les lieux visités, revisites, nouvelles découvertes et passages au Néant. Le retour à l’accueil depuis le bilan clôt l’expédition ; la suivante repart à 10 charges avec un historique vide et le carnet permanent conservé. Un bilan interrompu reste récupérable.

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

> Ce tableau capture le catalogue convenu. Les 30 histoires FR/EN et titres localisés sont intégrés dans les catalogues. Leur relecture éditoriale d’ensemble reste distincte des validations d’interaction.

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

**Souvenirs dans le prototype actuel :** la destination est inscrite au carnet dès l’arrivée, mais son souvenir reste en attente jusqu’à résolution de l’activité locale. Les souvenirs déjà acquis restent disponibles ; revisites et Néant ne créent aucun doublon. La décoration du couvercle (phase C) reste une proposition distincte : six positions fixes provisoires, indépendantes des deux emplacements d’éléments, avec sauvegarde de la disposition après validation. Voir [COMPASS_AND_STICKERS.md](COMPASS_AND_STICKERS.md).

**Note UX :** prévenir sobrement que le carnet est enregistré dans ce navigateur et peut être perdu si les données du site sont effacées.

## 7. États et cas limites

| Situation | Comportement attendu |
| --- | --- |
| 0 ou 1 élément placé | Bouton Voyager désactivé |
| Même élément sélectionné deux fois | Départ interdit et indication claire ; la valise reflète le doublon. Clic sur les signes et aiguilles utilisent la même validation du départ. |
| Éléments placés dans l'ordre inverse | Même destination |
| Paire sans recette | Néant ; coût 2 |
| Destination déjà débloquée | Résultat normal ; pas de nouveau déblocage |
| Il reste 1 charge et le Néant coûte 2 | Charges ramenées à 0 ; fin de session |
| Double clic sur Voyager | Un seul départ et un seul débit |
| Retour à l’accueil ou rechargement pendant une session | Expédition en pause, charges et historique conservés. Reprendre ne recharge pas. Un départ accepté se reprend à son résultat, sans résoudre ou débiter à nouveau. Si le stockage est indisponible, la reprise fonctionne en mémoire jusqu’au rechargement. |
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

## 11. Ordre initial d’implémentation — historique

1. Modèle de données, IDs, résolution de paire, tests des 45 cas.
2. Écran de valise avec visuels temporaires, deux slots et sélection.
3. Boussole, transitions, résultats et Néant.
4. Fin de session, carnet permanent, sauvegarde.
5. Internationalisation FR/EN.
6. Illustrations, animations, audio, finition et playtests.

**Règle de production :** privilégier un parcours complet fonctionnel avant la finition graphique. Toute idée supplémentaire est hors MVP tant qu'elle n'a pas été discutée.
