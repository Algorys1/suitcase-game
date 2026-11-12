# La valise-boussole — 13 novembre 2026

## Direction approuvée et première intégration

Le joueur a retenu la fusion de la valise et de la boussole en un seul instrument de voyage. Cette première intégration est jouable ; son rendu et son ergonomie attendent son essai. La séquence de départ demandée ensuite est désormais intégrée ; son rythme et son rendu restent à essayer.

- Une mini-valise fermée remplace le point d’interrogation de la prochaine étape sur la carte. Elle est désormais l’unique commande illustrée de préparation ; l’ancienne boussole et la valise séparées sont retirées de la carte.
- Au clic ou à l’activation clavier, la valise vient au premier plan au-dessus de la carte. L’approche et le retour utilisent un mouvement commun depuis et vers le prochain arrêt ; le mouvement réduit les rend immédiats.
- Le cadran est peint dans le couvercle, sur parchemin et laiton entourés de velours vert. Les dix signes et les deux aiguilles restent des objets distincts pour l’interaction.
- Les éléments sont des signes peints lumineux, sans socle. Les deux choix apparaissent dans la partie basse au-dessus de deux constellations brodées, turquoise et violette. Les deux positions restent fixes ; aucun placement libre.
- Les noms FR/EN sont rendus sur les deux inserts du rebord. Formes ▲ / ◆, couleur, commandes 1 / 2 et boutons de noms permettent de distinguer les aiguilles superposées.
- Le mode liste est retiré à la demande du joueur. Clic sur un signe, glisser d’aiguille et raccourcis clavier utilisent toujours les mêmes choix. Chaque préparation commence sur Arbre / Arbre ; doublon et geste en cours bloquent le départ.

## Périmètre préservé

**Retour du joueur — consigne sur étiquette :** le titre isolé à gauche est retiré. La consigne « Faites glisser une aiguille vers un symbole » apparaît sur une étiquette de bagage crème à œillet, reliée à la poignée par une ficelle. Le papier reprend le grain et la découpe des étiquettes du jeu ; l’écriture est brun foncé. En paysage, l’étiquette repose à gauche de la poignée ; en portrait, elle passe sous la valise, remontée pour libérer cet espace. Elle accompagne l’approche et le retour de l’objet. La consigne reste externalisée en FR/EN. Le message d’état reste séparé ; les charges sont désormais intégrées à la doublure.

Recettes, coûts 10 / 1 / 2, validation et débit unique, pause/reprise, carnet et collecte des souvenirs sont inchangés. Aucun nouveau champ de sauvegarde, aucune dépendance ajoutée et aucune phase C de décoration lancée. Le nouveau départ dure environ 1,9 seconde : énergie et vibration des deux manifestations, rabattement du couvercle autour de sa charnière (deux frames de la texture source, couvercle placé explicitement derrière les signes), valise fermée qui tremble, puis libération des deux couleurs et arrivée. Feuilles, flocons, flammèches et autres motifs sont liés aux éléments choisis. Le débit et la sauvegarde précèdent l’animation ; un redimensionnement ou le passage au mouvement réduit termine la présentation sur le résultat déjà payé.

Les illustrations de catalogue des éléments restent utilisées à côté des mondes sur le trajet. Les nouveaux signes servent au cadran et aux manifestations, sans modifier les IDs ni les chemins du catalogue. L’ancien cadran séparé reste utilisé par la présentation du Néant, mais n’apparaît plus comme instrument sur la carte ou à côté de la valise.

## Fichiers et ressources

- `src/game/ui/adventureMap.ts` : géométrie commune du trajet et de la mini-valise ; plus de point d’interrogation de départ ni d’instruments séparés.
- `src/game/ui/suitcaseCompass.ts` : illustration ouverte, manifestations, corde courbe tressée avec nœud et fibres, étiquette et dix pastilles de laiton à cœur lumineux, sans chiffre. Les deux états métalliques sont des SVG dédiés dans `public/assets/preparation/charge-{full,empty}.svg`.
- `src/game/ui/suitcaseDeparture.ts` : séquence visuelle, motifs des dix éléments, fermeture par deux frames du couvercle et du fond peints et fondu vers la valise fermée, nettoyage et interruption.
- La carte est capturée une fois par taille dans une RenderTexture ; les commandes de dessin Phaser 4 sont exécutées avant destruction des objets sources. Le filtre Blur externe ne concerne que ce fond, réutilisé pendant la sélection. Le repli Canvas conserve le fond atténué sans filtre WebGL.
- `src/game/ui/compass.ts` : signes sans supports et mode intégré au couvercle ; aiguilles et prises conservées.
- `src/game/scenes/PreparationScene.ts` : préparation au-dessus de la carte, commandes, approche et retour de l’objet unique.
- `src/game/ui/preparationArt.ts` : préchargement des nouveaux assets et rendu des signes ; `suitcase.ts` conserve seulement la valise fermée.
- Sources transparentes générées avec **image_gen intégré** : [valise ouverte](../designs/preparation/suitcase-compass-v1/open.png), [planche de signes](../designs/preparation/suitcase-compass-v1/glyphs.png), [prompts et références](../designs/preparation/suitcase-compass-v1/prompts.json).
- Exports : `public/assets/preparation/suitcase_compass.webp` et les dix fichiers de `public/assets/preparation/glyphs/`. La planche est exportée en cinq colonnes et deux lignes, alpha conservé. Les anciens exports de valise ouverte sans cadran sont retirés du build ; leurs sources historiques restent dans `designs/`.

## Dernière passe — corde, métal, flou et départ

**Retouche après retour du joueur :** la corde est ancrée autour de la monture gauche de la poignée, avec passage derrière le métal et croisement du nœud. Les charges sont réduites d’environ 40 %, aplaties selon la perspective et remontées vers le fond, avec logement sombre et bord inférieur dans la doublure. Les ancrages des manifestations et de leur lueur sont recalés sur les constellations brodées, notamment à gauche. Vérification volontairement limitée au build et à une capture ciblée, conformément à la demande du joueur ; aucune suite complète relancée pour cette retouche.

Vérifications exécutées le 13 novembre 2026 : **161 tests réussis dans 41 fichiers**, TypeScript strict et build Vite réussis, `git diff --check` sans erreur. Chrome sur build statique sous `/jam/` : FR en 960 × 540 et 640 × 360, EN avec toucher simulé en 320 × 568 et 360 × 640. Captures de préparation, énergie, fermeture, tremblement, libération et neige inspectées. Les signes suivent le couvercle grâce à un conteneur commun ; le fond ouvert reste opaque jusqu’au raccord final avec la valise fermée.

Absence du mode liste et de compteur numérique visible, dix cellules métalliques puis neuf après un voyage, cache du fond flouté conservé pendant la sélection, clavier et voyage réel contrôlés. Double validation, redimensionnement en cours d’animation, rechargement pendant un départ valide ou un Néant : coût débité une seule fois. Mouvement réduit dès l’entrée ou activé pendant le départ : résultat immédiat déjà payé. Dernier Néant avec une charge ramenée à zéro, absence de nouveau départ et accès au bilan contrôlés. Aucune erreur JavaScript ou HTTP détectée. Firefox, tactile physique et iframe itch.io restent à vérifier.

## Vérifications des premières passes — historique

- `npm.cmd test` : 161 tests réussis dans 41 fichiers ; `npm.cmd run build` : TypeScript strict et Vite réussis. Avertissement de taille du bundle Phaser non bloquant ; `git diff --check` et liens documentaires locaux contrôlés.
- Chrome, build statique sous `/jam/` : souris FR/EN en 960 × 540, 640 × 360 et 1280 × 720 ; toucher simulé en 320 × 568 et 360 × 640. La dernière passe de contraste et de masquage des instruments est contrôlée en 960 × 540, 320 × 568 et 640 × 360, captures inspectées.
- Mini-valise unique, absence de « ? » et d’instruments séparés, dix signes sans socles, départ initialement bloqué, choix par symbole et palette, commandes clavier, conservation des choix et aiguille active au redimensionnement, reset Arbre / Arbre au retour contrôlés.
- Vrais gestes de pointeur sur les aiguilles à la souris et au toucher simulé : rotation, aimantation, départ bloqué pendant le geste, Échap et redimensionnement en cours de glisser contrôlés. Les gestes et allers-retours gardent les charges.
- Voyage Eau + Palmier à 9 charges, reprise du résultat sans nouveau débit, mouvement réduit, neuvième arrêt suivi du dernier départ à zéro, absence de nouvelle commande de départ et accès au bilan contrôlés. Aucune erreur JavaScript ou HTTP détectée sur ces parcours.
- Le serveur Vite ignore désormais `.tmp/` pour éviter de surveiller les fichiers verrouillés des profils Chrome de test. Pas de dépendance supplémentaire.
- Étiquette de consigne : build TypeScript/Vite réussi ; Chrome sous `/jam/`, FR/EN en 960 × 540 et 320 × 568, FR en 640 × 360 et EN en 360 × 640. Texte et commandes dans le cadre, absence de titre isolé et de chevauchement avec le statut, consigne adaptée à la palette, sélection et retour à la carte contrôlés. Captures paysage/portrait inspectées, aucune erreur JavaScript/HTTP. Pas de nouvelle passe unitaire pour ce changement de présentation.

## Validation à poursuivre

Après les vérifications techniques, essayer la taille du cadran, la distinction des signes et l’accès aux aiguilles, particulièrement sur petit écran. La direction est approuvée ; cela ne valide pas automatiquement cette première réalisation. Tactile physique, Firefox et iframe itch.io restent à vérifier.
