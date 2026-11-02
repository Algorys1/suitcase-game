# Autocollants souvenirs — pilote de phase B

**Direction choisie avec le joueur : un objet rapporté du voyage, plutôt qu'un rappel des ingrédients.** Les trois autocollants et leur présentation sous les histoires sont retenus après essai du joueur. La phase B reste limitée à ces trois destinations ; les 27 autres souvenirs sont à concevoir. La décoration de la valise (phase C) n'est pas commencée.

| Destination | Souvenir FR / EN | Idée | Recette de test |
| --- | --- | --- | --- |
| Archipel d'Azur | Coquillage des horizons / Seashell of horizons | Un coquillage où résonne la mer du prochain voyage | Eau + Palmier |
| Mycélia | Lanterne à spores / Spore lantern | Une lanterne offerte aux voyageurs égarés | Arbre + Champignon |
| Cœur de braise | Braise éternelle / Eternal ember | Une fiole contenant une braise qui ne s'éteint jamais | Feu + Rocher |

## Présentation en jeu

Après le retour du joueur sur le crénelage et le manque de contraste avec le papier crème, les illustrations et autocollants utilisent un cache avec filtrage adapté aux fortes réductions. Un liseré blanc et une ombre légère en WebGL détachent la silhouette du fond du carnet. Les dessins et fichiers exportés sont conservés ; ces corrections appartiennent au rendu en jeu.

**Support en cours d'essai :** une étiquette de bagage en kraft brun, découpée aux coins droits, avec œillet et morceau de scotch en haut. L'autocollant est incliné de 9° et reste entièrement dans les limites du kraft, avec une marge pour son contour et son ombre ; son nom et sa mention de découverte sont écrits directement sur l'étiquette. Le support, dessiné dans Phaser, s'adapte à la place disponible et suit la même révélation que le souvenir. Le joueur a validé cette composition et demandé de la conserver dans un commit.

- Le souvenir apparaît sous l'histoire dans le résultat et dans la fiche du carnet. Une première découverte porte la mention « Nouvel autocollant ! » / « New sticker! » ; une revisite ou la consultation du carnet utilise « Souvenir de voyage » / « Travel keepsake ».
- Lors d'une nouvelle découverte, son apparition suit celle du texte (délai de 300 ms, fondu de 260 ms). Continuer reste disponible. La réduction des animations l'affiche immédiatement ; une fiche consultée dans le carnet reste statique.
- En portrait ou sur un paysage peu haut, une petite image accompagne son nom sur une ligne de contenu compacte. L'illustration de destination conserve son ratio 4:3 et partage l'espace avec le récit et le souvenir.
- Les trois souvenirs sont purement cosmétiques. Ils ne sont ni consommés ni dupliqués lors des revisites. Le Néant n'en donne aucun.

## Données et compatibilité

`src/data/souvenirs.json` associe uniquement les trois IDs existants à leurs assets et clés de noms. `destinations.json` demeure la source des destinations et recettes ; aucune recette n'est copiée.

`domain/souvenirs.ts` dérive la disponibilité des IDs déjà découverts. Aucune nouvelle écriture, migration ou liste d'autocollants n'est ajoutée à la sauvegarde v1. Les anciennes découvertes donnent donc immédiatement leur souvenir, même si elles précèdent ce prototype. Un stockage bloqué conserve le même repli en mémoire que le carnet. Si une texture manque, le nom du souvenir reste affiché.

## Assets et provenance

Création par l'outil intégré **image_gen**, avec fond transparent, contour crème découpé et style cartoon peint commun. Les [prompts complets](../designs/stickers/pilot-v1/prompts.json) sont conservés avec les [sources PNG](../designs/stickers/pilot-v1/).

Exports utilisés par le jeu :

- [Coquillage](../public/assets/stickers/archipel_azur.webp)
- [Lanterne à spores](../public/assets/stickers/mycelia.webp)
- [Fiole de braise](../public/assets/stickers/coeur_de_braise.webp)

Sources et exports : **1254 × 1254 px**, composition et transparence conservées. Conversion WebP par canvas, sans recadrage ni retouche ; environ **495 Ko** pour les trois exports. Le build inclut uniquement les WebP, sans téléchargement depuis un service distant pendant une partie.

Le joueur a retenu les trois dessins et leur présentation sur une étiquette kraft ; les 27 autres souvenirs restent à concevoir avant d'étendre la collection.

## Vérifications exécutées

51 tests Vitest et build TypeScript/Vite réussis. Dans Chrome headless, le build sous `/jam/` passe les découvertes, revisites, Néant, fin de session et rechargement en FR/EN à 960 × 540, 320 × 568 et 640 × 360. Les trois fiches de sauvegardes préexistantes passent aussi à 1280 × 720, 800 × 600 et 360 × 640. Captures contrôlées ; aucun chevauchement entre souvenirs, texte et boutons.

Stockage indisponible, réduction des animations, redimensionnement pendant l'apparition, transparence WebP et texture absente avec nom conservé vérifiés. Aucun champ de sauvegarde ajouté ; aucune erreur JavaScript/HTTP sur les parcours. Essais sur appareil tactile réel, Firefox et iframe itch.io encore nécessaires avant publication.
