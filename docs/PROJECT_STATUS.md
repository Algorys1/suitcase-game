# État du projet — 13 novembre 2026

Ce bilan décrit le prototype présent dans le dépôt. Il distingue l’implémentation, les validations consignées et les travaux encore ouverts. Les notes historiques des autres documents restent utiles pour retrouver les essais et les sources, mais ne constituent pas une liste de tâches actuelle.

## Prototype implémenté

**Dernière intégration :** [la valise-boussole](SUITCASE_COMPASS.md), direction approuvée par le joueur. La mini-valise remplace le point d’interrogation de la prochaine étape ; elle vient au premier plan avec le cadran intégré au couvercle et deux manifestations lumineuses dans sa doublure. Instruments séparés et socles retirés. Dernière passe à essayer : ficelle tressée, charges métalliques sans chiffre dans la doublure, mode liste retiré, carte floutée et animation de départ liée aux éléments.


- 10 éléments, exactement deux choix distincts, 30 recettes non ordonnées et 15 paires menant au Néant. Les catalogues `src/data/elements.json` et `src/data/destinations.json` font foi.
- Sélection par manipulation directe des deux aiguilles, clic sur les symboles et clavier, sans mode liste ; préparation initiale Arbre / Arbre, départ bloqué en cas de doublon ou de geste en cours.
- Voyages avec débit unique, charges jamais négatives, bilan, pause et reprise après retour à l’accueil ou rechargement. Équilibrage provisoire : 10 charges, coût 1 pour toute destination valide, 2 pour le Néant.
- Carte d’aventure avec itinéraire et charges ; accès aux lieux visités, à la préparation et au carnet. À zéro, plus de nouveau départ : la carte permet encore l’exploration et l’accès au bilan.
- 30 illustrations, 30 histoires FR/EN et 30 autocollants souvenirs intégrés ; une activité locale implémentée pour chacune des 30 destinations.
- Découverte du monde dès l’arrivée, puis collecte du nouveau souvenir à la résolution de son activité. Exploration facultative, sans coût supplémentaire ; étapes partielles sauvegardées, anciens souvenirs conservés. Avant collecte, le souvenir et son nom restent masqués, y compris dans le carnet.
- Première correspondance Cimes → Mycélia : offrir la clochette réveille le lieu sans consommer le souvenir, sans remplacer l’activité locale ni modifier charges ou recettes.
- Carnet permanent accessible depuis l’accueil et la carte ; trois conseils contextuels FR/EN passables, acquittés en sauvegarde et relisibles depuis le carnet.
- Paramètres FR/EN, reset avec confirmation, repli en mémoire lorsque le stockage est indisponible, prise en compte du mouvement réduit.

Les fonctions et champs nommés `pilot` dans le code couvrent désormais les 30 activités ; ce nom technique ne signifie plus que seuls deux ou trois lieux sont jouables.

## Validations et preuves disponibles

- Dernière passe valise-boussole : corde tressée, cellules métalliques dans la doublure, retrait de la liste, flou du fond et départ de 1,9 seconde intégrés. 161 tests, TypeScript et build réussis. Chrome sous `/jam/` en quatre formats FR/EN, souris/toucher simulé : séquence, clavier, débit unique, interruptions, mouvement réduit et dernier voyage à zéro contrôlés ; captures inspectées, aucune erreur JavaScript/HTTP. Voir [la dernière vérification](SUITCASE_COMPASS.md#dernière-passe--corde-métal-flou-et-départ). Le rendu reste à essayer par le joueur.

- La manipulation directe des aiguilles et la présentation des souvenirs sur étiquette kraft sont des directions retenues après essai.
- Les validations particulières des activités sont consignées dans [DESTINATION_ACTIVITIES.md](DESTINATION_ACTIVITIES.md). La note de clôture confirme les derniers essais Faille et Observatoire. Une mention initiale « essai attendu » ne remet pas en attente une version ensuite explicitement validée ; inversement, une activité implémentée n’est pas automatiquement validée par le joueur.
- Vérification exécutée le 12 novembre 2026 : `npm.cmd test` — **161 tests réussis dans 41 fichiers** ; `npm.cmd run build` — TypeScript strict et Vite réussis. Avertissement de taille du bundle Phaser, non bloquant.
- Des parcours Chrome sur build servi sous `/jam/`, FR/EN, clavier, souris et toucher simulé sont documentés par activité. Ces preuves concernent les versions testées ; aucun nouveau parcours navigateur n’a été exécuté pour cette mise à jour documentaire.
- Vérification de la valise-boussole du 13 novembre 2026 : **161 tests dans 41 fichiers**, TypeScript strict et build réussis. Chrome sous `/jam/`, FR/EN, souris et toucher simulé : cinq formats de 320 × 568 à 1280 × 720 ; dernière présentation revue en 960 × 540, 320 × 568 et 640 × 360. Glissers, Échap, redimensionnement, clavier, palette, aller-retour, reprise, dernier départ et bilan à zéro contrôlés sans erreur JavaScript/HTTP. Captures inspectées ; voir [SUITCASE_COMPASS.md](SUITCASE_COMPASS.md).
- Aucun essai final sur appareil tactile physique, Firefox ou dans l’iframe itch.io n’est établi par les dernières notes. L’existence de la page itch.io ne prouve pas que le build actuel y a été vérifié.

## Travaux avant publication finale

1. Essayer la valise-boussole et sa nouvelle animation au clic sur Voyager. Reprendre le tutoriel, dans son contenu et sa présentation, conformément au retour du joueur ; les trois conseils actuels restent intégrés mais ne sont pas finalisés. Remplacer le bouton texte « Explorer », jugé générique, par une loupe ou une longue-vue en haut de la carte : objet, position et animation restent à définir. La validation visuelle du bilan illustré reste également à consigner.
2. Playtest d’ensemble : compréhension de la carte, aiguilles, tutoriel, carnet, découverte des interactions sans solution écrite, rythme et envie de repartir. Relecture éditoriale FR/EN ; ne pas assimiler validation d’un geste et validation de tous les textes.
3. Mesurer l’équilibrage 10 / 1 / 2 et ajuster seulement après retour. Ne pas ajouter de recharge ou de ressource supplémentaire.
4. Habillage sonore et commande de coupure : l’audio est actuellement désactivé (`audio.noAudio` dans `src/game/config.ts`), aucun asset sonore n’est distribué.
5. Vérifications navigateur finales : Firefox, tactile réel, petits formats, clavier, mouvement réduit, sauvegarde et reprise ; puis iframe itch.io en 960 × 540 et redimensionnement.
6. Préparer l’archive du contenu de `dist/` avec `index.html` à sa racine ; vérifier assets relatifs, crédits et déclarations requises par la jam, puis tester le build effectivement publié.

## Extensions ouvertes, sans lancement implicite

- **Phase C — décoration de la valise :** non commencée. Six positions fixes proposées, distinctes des deux emplacements d’éléments ; poser, remplacer, retirer et sauvegarder la disposition. Validation préalable avant implémentation ; position du bouton et nombre final de places encore ouverts.
- **Autres correspondances :** pistes à discuter dans [DESTINATION_ACTIVITIES.md](DESTINATION_ACTIVITIES.md), aucune nouvelle consommation ni récompense décidée.
- **Réactions décoratives supplémentaires :** facultatives ; certaines existent déjà, elles ne justifient pas une nouvelle série de fonctionnalités obligatoire.
- **Escales enchantées et Souvenirs voyageurs :** propositions historiques. Leurs systèmes complets ne sont pas implémentés ; la carte, les activités locales et Cimes → Mycélia en concrétisent une partie autrement. Leur remplacement, complément ou abandon reste à arbitrer ; ne pas ajouter automatiquement trente mini-jeux à tampons.

## Lire les documents

- [GAME_DESIGN.md](GAME_DESIGN.md) : règles, catalogue de référence et cas limites ; les évolutions autorisées de la carte et des activités priment sur le parcours initial.
- [COMPASS_AND_STICKERS.md](COMPASS_AND_STICKERS.md) : aiguilles, historique des phases A/B et proposition C. A est implémentée et sa direction retenue ; B couvre 30 souvenirs, avec collecte par exploration dans le prototype actuel.
- [DESTINATION_ACTIVITIES.md](DESTINATION_ACTIVITIES.md) : versions des activités, validations et limites de vérification. Les propositions initiales sont explicitement historiques.
- [TECHNICAL.md](TECHNICAL.md), [ART_DIRECTION.md](ART_DIRECTION.md) : architecture, contraintes et rendu ; conserver les sources/prompts et preuves des étapes antérieures.
- [DESTINATION_COLLECTION.md](DESTINATION_COLLECTION.md), [ADVENTURE_ASSETS.md](ADVENTURE_ASSETS.md) : catalogue illustré et provenance des ressources.

Ce bilan ne change aucune règle ni n’accorde de validation supplémentaire. Un conflit de conception encore ouvert doit être soumis au joueur.
