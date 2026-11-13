# État du projet — 13 novembre 2026

Ce bilan décrit le prototype présent dans le dépôt. Il distingue l’implémentation, les validations consignées et les travaux encore ouverts. Les notes historiques des autres documents restent utiles pour retrouver les essais et les sources, mais ne constituent pas une liste de tâches actuelle.

## Prototype implémenté

**Export itch.io corrigé :** l’archive `c3c5b70` contenait 171 chemins avec antislashs Windows. `npm run package:itch` crée désormais des entrées avec `/`, vérifie `index.html` à la racine et refuse l’écrasement d’une archive existante. Build réussi et 172 entrées vérifiées ; archive décompressée servie sous `/jam/` dans Chrome : intro → accueil → carte, sans erreur JavaScript ou HTTP, capture inspectée. Le démarrage sur la page publiée reste à confirmer : son URL connue renvoie 404 lors du contrôle.

**Départ animé depuis l’accueil — essai :** après le commit `5acd2af` du son et de l’intro, valise qui se soulève, papier qui se déplie et pose sur le trajet pour Commencer/Reprendre. Transition de 680 ms hors chargement, interrompable par Échap/resize/mouvement réduit, sans débit et avec reprise préservée. Build et parcours Chrome FR/EN en quatre formats vérifiés ; rendu à essayer. Voir [SUITCASE_COMPASS.md](SUITCASE_COMPASS.md#départ-depuis-laccueil--13-novembre-2026).

**Son et intro — première passe :** musique « Springly Sprigs » de troubadour (OpenGameArt, CC0), petits sons locaux pour les gestes/voyages/souvenirs et coupure permanente sur languette papier. Musique demandée après le premier geste seulement. Intro BD en trois cases FR/EN, passable dès la première et relisible depuis l’accueil ; elle ne s’interpose pas à une reprise d’expédition. Build, 166 tests dans 42 fichiers et parcours Chrome FR/EN en quatre formats vérifiés ; choix musical et présentation à essayer. Voir [AUDIO_AND_INTRO.md](AUDIO_AND_INTRO.md).

**Néant — nouvel essai :** [entre deux mondes](VOID_BETWEEN_WORLDS.md), avec la valise-boussole intégrée, dissolution des éléments, brume sensible aux gestes, lumières et fragments de papier à la dérive. Nouveau fond peint et feuillet de retour ; coût, absence de souvenir et reprise sans nouveau débit conservés. Build et 162 tests réussis, parcours Chrome FR/EN en quatre formats vérifiés. Vignette de la valise dans le Néant ajoutée à la carte et vérifiée après reprise à froid. Le joueur apprécie la présentation et demande le commit ; playtest global toujours ouvert.

**Dernière optimisation :** accueil limité à quatre images (environ 1 Mio, hors moteur et police), mondes et souvenirs chargés à la demande, texte et progression illustrés visibles avant Phaser. Les dix signes du cadran sont remplacés par des icônes cartoon plus lisibles (62,3 Kio contre environ 915 Kio). PNG lourds convertis en WebP et sources conservées hors build. Build, 9 tests ciblés et parcours de chargement/voyage/reprise/carnet vérifiés ; nouvelle présentation à essayer. Voir [TECHNICAL.md](TECHNICAL.md#chargement-progressif-et-démarrage-illustré--13-novembre-2026).

**Dernière intégration :** [la valise-boussole](SUITCASE_COMPASS.md), direction approuvée par le joueur. La mini-valise remplace le point d’interrogation de la prochaine étape ; elle vient au premier plan avec le cadran intégré au couvercle et deux manifestations lumineuses dans sa doublure. Instruments séparés et socles retirés. Dernière passe à essayer : ficelle tressée, charges métalliques sans chiffre dans la doublure, mode liste retiré, carte floutée et animation de départ liée aux éléments.


- 10 éléments, exactement deux choix distincts, 30 recettes non ordonnées et 15 paires menant au Néant. Les catalogues `src/data/elements.json` et `src/data/destinations.json` font foi.
- Sélection par manipulation directe des deux aiguilles, clic sur les symboles et clavier, sans mode liste ; préparation initiale Arbre / Arbre, départ bloqué en cas de doublon ou de geste en cours.
- Voyages avec débit unique, charges jamais négatives, bilan, pause et reprise après retour à l’accueil ou rechargement. Équilibrage provisoire : 10 charges, coût 1 pour toute destination valide, 2 pour le Néant.
- Carte d’aventure avec itinéraire et charges ; accès aux lieux visités, à la préparation et au carnet. À zéro, plus de nouveau départ : la carte permet encore l’exploration et l’accès au bilan.
- Repère d’exploration : anciens points dorés/bleu-vert retirés. Un tampon sépia « EXPLORÉ » / « EXPLORED » figure sur l’étiquette des lieux dont le souvenir est acquis, avec une brève impression au premier retour après collecte. Petit portrait chargé adapté en deux colonnes ; détails et vérifications dans [ADVENTURE_MAP.md](ADVENTURE_MAP.md#tampons-dexploration--13-novembre-2026). Rendu à essayer par le joueur.
- 30 illustrations, 30 histoires FR/EN et 30 autocollants souvenirs intégrés ; une activité locale implémentée pour chacune des 30 destinations.
- Découverte du monde dès l’arrivée, puis collecte du nouveau souvenir à la résolution de son activité. Exploration facultative, sans coût supplémentaire ; étapes partielles sauvegardées, anciens souvenirs conservés. Avant collecte, le souvenir et son nom restent masqués, y compris dans le carnet.
- Première correspondance Cimes → Mycélia : offrir la clochette réveille le lieu sans consommer le souvenir, sans remplacer l’activité locale ni modifier charges ou recettes.
- Carnet permanent accessible depuis l’accueil et la carte ; premier voyage accompagné FR/EN : notes contextuelles animées, aide aux aiguilles et guide à quatre onglets dans le carnet. Les conseils restent passables et mémorisés ; voir [TUTORIAL.md](TUTORIAL.md).
- Paramètres FR/EN, reset avec confirmation, repli en mémoire lorsque le stockage est indisponible, prise en compte du mouvement réduit.

Les fonctions et champs nommés `pilot` dans le code couvrent désormais les 30 activités ; ce nom technique ne signifie plus que seuls deux ou trois lieux sont jouables.

## Validations et preuves disponibles

- Tutoriel accompagné : notes non modales, mini-valise et croquis animés, aide aux aiguilles et guide à quatre onglets intégrés. TypeScript/build et 162 tests réussis ; parcours Chrome FR/EN en quatre formats, toucher simulé, clavier, premier souvenir, mouvement réduit, relecture, reprise et zéro charge vérifiés sans erreur JavaScript/HTTP. Captures inspectées ; voir [TUTORIAL.md](TUTORIAL.md). Après essai, le joueur valide la présentation finale des feuillets : titre brun tamponné, attache en laiton et marge haute corrigée. Le playtest global reste ouvert.

- Dernière passe valise-boussole : corde tressée, cellules métalliques dans la doublure, retrait de la liste, flou du fond et départ de 1,9 seconde intégrés. 161 tests, TypeScript et build réussis. Chrome sous `/jam/` en quatre formats FR/EN, souris/toucher simulé : séquence, clavier, débit unique, interruptions, mouvement réduit et dernier voyage à zéro contrôlés ; captures inspectées, aucune erreur JavaScript/HTTP. Voir [la dernière vérification](SUITCASE_COMPASS.md#dernière-passe--corde-métal-flou-et-départ). Le rendu reste à essayer par le joueur.

- La manipulation directe des aiguilles et la présentation des souvenirs sur étiquette kraft sont des directions retenues après essai.
- Les validations particulières des activités sont consignées dans [DESTINATION_ACTIVITIES.md](DESTINATION_ACTIVITIES.md). La note de clôture confirme les derniers essais Faille et Observatoire. Une mention initiale « essai attendu » ne remet pas en attente une version ensuite explicitement validée ; inversement, une activité implémentée n’est pas automatiquement validée par le joueur.
- Vérification exécutée le 12 novembre 2026 : `npm.cmd test` — **161 tests réussis dans 41 fichiers** ; `npm.cmd run build` — TypeScript strict et Vite réussis. Avertissement de taille du bundle Phaser, non bloquant.
- Des parcours Chrome sur build servi sous `/jam/`, FR/EN, clavier, souris et toucher simulé sont documentés par activité. Ces preuves concernent les versions testées ; aucun nouveau parcours navigateur n’a été exécuté pour cette mise à jour documentaire.
- Vérification de la valise-boussole du 13 novembre 2026 : **161 tests dans 41 fichiers**, TypeScript strict et build réussis. Chrome sous `/jam/`, FR/EN, souris et toucher simulé : cinq formats de 320 × 568 à 1280 × 720 ; dernière présentation revue en 960 × 540, 320 × 568 et 640 × 360. Glissers, Échap, redimensionnement, clavier, palette, aller-retour, reprise, dernier départ et bilan à zéro contrôlés sans erreur JavaScript/HTTP. Captures inspectées ; voir [SUITCASE_COMPASS.md](SUITCASE_COMPASS.md).
- Le joueur a publié une première version sur itch.io et l’a essayée sur PC et mobile. Il a signalé la valise comprimée au deuxième voyage : correctif `__BASE` intégré et vérifié en local sur deux voyages consécutifs. Les nouvelles icônes, le chargement allégé et la netteté des textes sont intégrés depuis ; leur publication n’est pas encore confirmée. Firefox reste à vérifier ; distinguer les essais réels du joueur des contrôles automatisés sous Chrome.

## Travaux avant publication finale

1. Mettre à jour le ZIP itch.io avec le correctif du deuxième voyage, les icônes cartoon, le chargement progressif et les textes plus nets ; faire un court essai de deux voyages. La présentation du tutoriel est retenue après essai du joueur : notes de voyage contextuelles, gestes, charges et guide relisible ; voir [TUTORIAL.md](TUTORIAL.md). La longue-vue de voyage remplace désormais le bouton « Explorer » sur les arrivées et les fiches du carnet : objet peint en laiton/cuir, étiquette FR/EN, pose et reflet animés. La perspective corrigée et le retrait du cadre au survol sont appréciés par le joueur ; voir [TRAVEL_SPYGLASS.md](TRAVEL_SPYGLASS.md). La validation visuelle du bilan illustré reste également à consigner.
2. Playtest d’ensemble : compréhension de la carte, aiguilles, tutoriel, carnet, découverte des interactions sans solution écrite, rythme et envie de repartir. Relecture éditoriale FR/EN ; ne pas assimiler validation d’un geste et validation de tous les textes.
3. Mesurer l’équilibrage 10 / 1 / 2 et ajuster seulement après retour. Ne pas ajouter de recharge ou de ressource supplémentaire.
4. Essayer le mixage de la première passe sonore et la musique choisie ; régler les niveaux après écoute du joueur. Intro BD et coupure du son intégrées ; détails dans [AUDIO_AND_INTRO.md](AUDIO_AND_INTRO.md).
5. Vérifications navigateur finales : Firefox, tactile réel, petits formats, clavier, mouvement réduit, sauvegarde et reprise ; puis iframe itch.io en 960 × 540 et redimensionnement.
6. Préparer l’archive du contenu de `dist/` avec `index.html` à sa racine ; vérifier assets relatifs, crédits et déclarations requises par la jam, puis tester le build effectivement publié.

## Prochaine étape demandée

- **Autocollants qui débloquent d’autres choses :** prochaine étape souhaitée par le joueur après les essais itch.io. Définir ensemble les correspondances entre souvenirs et lieux, les conditions et ce qu’elles débloquent, puis implémenter les effets validés. S’appuyer sur Cimes → Mycélia déjà intégré ; les nouvelles correspondances restent à valider. Cette demande de TODO ne lance pas l’implémentation ni la décoration de phase C.

## Extensions ouvertes, sans lancement implicite

- **Phase C — décoration de la valise :** non commencée. Six positions fixes proposées, distinctes des deux emplacements d’éléments ; poser, remplacer, retirer et sauvegarder la disposition. Validation préalable avant implémentation ; position du bouton et nombre final de places encore ouverts.
- **Autres correspondances :** retenues comme prochaine étape à concevoir ci-dessus ; pistes dans [DESTINATION_ACTIVITIES.md](DESTINATION_ACTIVITIES.md), aucune nouvelle consommation ni récompense décidée.
- **Réactions décoratives supplémentaires :** facultatives ; certaines existent déjà, elles ne justifient pas une nouvelle série de fonctionnalités obligatoire.
- **Escales enchantées et Souvenirs voyageurs :** propositions historiques. Leurs systèmes complets ne sont pas implémentés ; la carte, les activités locales et Cimes → Mycélia en concrétisent une partie autrement. Leur remplacement, complément ou abandon reste à arbitrer ; ne pas ajouter automatiquement trente mini-jeux à tampons.

## Lire les documents

- [GAME_DESIGN.md](GAME_DESIGN.md) : règles, catalogue de référence et cas limites ; les évolutions autorisées de la carte et des activités priment sur le parcours initial.
- [COMPASS_AND_STICKERS.md](COMPASS_AND_STICKERS.md) : aiguilles, historique des phases A/B et proposition C. A est implémentée et sa direction retenue ; B couvre 30 souvenirs, avec collecte par exploration dans le prototype actuel.
- [DESTINATION_ACTIVITIES.md](DESTINATION_ACTIVITIES.md) : versions des activités, validations et limites de vérification. Les propositions initiales sont explicitement historiques.
- [TECHNICAL.md](TECHNICAL.md), [ART_DIRECTION.md](ART_DIRECTION.md) : architecture, contraintes et rendu ; conserver les sources/prompts et preuves des étapes antérieures.
- [DESTINATION_COLLECTION.md](DESTINATION_COLLECTION.md), [ADVENTURE_ASSETS.md](ADVENTURE_ASSETS.md) : catalogue illustré et provenance des ressources.

Ce bilan ne change aucune règle ni n’accorde de validation supplémentaire. Un conflit de conception encore ouvert doit être soumis au joueur.
