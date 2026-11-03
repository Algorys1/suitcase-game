# Le Néant — illustration spatiale

Image produite avec l’outil intégré imagegen le 3 novembre 2026. Source : `space-source.png` ; version distribuée : `public/assets/void/space.webp` (1440 × 960, qualité 88). La boussole et ses aiguilles sont les illustrations existantes, animées séparément dans Phaser.

## Prompt final

Use case: illustration-story. Asset type: landscape background illustration for a whimsical browser game, Le monde tient dans une valise. Create a polished hand-painted cartoon illustration of the farthest reaches of space: deep midnight blue and violet void, soft teal and lavender nebula wisps curling like magical energy, tiny distant golden stars, a small floating isometric fragment of dark rock with an open caramel leather suitcase resting on it, placed in lower left. Dreamy, mysterious, gentle, not frightening. Clean readable shapes, warm storybook brush texture, soft luminous edges, restrained detail. Wide 3:2 composition, central and upper right area spacious for an animated brass compass added by game code. NO compass in the image, NO text, NO letters, NO border, NO UI, NO photorealism. The picture itself is the complete cosmic environment.

## Vérifications

- Révision après retour du joueur : suppression des contours elliptiques, voiles de lumière procéduraux et poussières en mouvement continu, reflet sur le laiton, frémissement limité à ±0,24° et moins d’un pixel, lévitation lente. Aucun nouvel asset généré. Chrome sous `/jam/` : mouvement mesuré après 1,6 seconde, limites du tremblement, FR/EN sur 960 × 540, 320 × 568 et 640 × 360, arrêt/reprise de la réduction des animations, redimensionnement et parcours jusqu’au bilan vérifiés. Dernière retouche des voiles recontrôlée en 960 × 540 et 320 × 568 ; captures inspectées. Build et 51 tests réussis.
- Phaser installé : 4.2.1 ; API Container, images et événements UPDATE vérifiées dans le paquet local. Aucune dépendance ajoutée.
- `npm.cmd test` : 51 tests réussis ; `npm.cmd run build` : TypeScript strict et Vite réussis. Avertissement Vite habituel sur la taille du bundle Phaser.
- Build servi sous `/jam/`, Chrome : FR/EN en 960 × 540, 320 × 568, 640 × 360, 360 × 640 et 800 × 600. Voyages par les commandes réelles, souris/toucher simulé, débit unique de 2 charges, absence de découverte et de souvenir, retour à la préparation, puis cinq passages jusqu’au bilan à zéro. Textes et contrôles dans la fenêtre, sans chevauchement de l’histoire et du bouton. Captures desktop et petits écrans inspectées.
- Activation de la réduction des animations pendant le résultat et redimensionnement : rendu stabilisé, navigation utilisable. Aucune erreur JavaScript ou HTTP détectée pendant ces parcours. Appareil tactile réel et iframe itch.io restent à vérifier avant publication.
