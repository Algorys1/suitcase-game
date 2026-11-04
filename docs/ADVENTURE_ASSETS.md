# Assets du voyage Cimes → Mycélia

Les sources des trente destinations et des trente autocollants sont conservées. Les nouveaux fichiers sont chargés localement ; aucune requête distante n’est nécessaire pour jouer. La police est attendue avant la création du canvas pour que les légendes soient mesurées avec leurs vraies dimensions.

## Fichiers intégrés

| Fichier dans `public/assets/` | Usage | Origine |
| --- | --- | --- |
| `adventure/map-paper.png` | Papier de carte, adapté par NineSlice en portrait et paysage | Génération imagegen intégrée |
| `adventure/charge-full.svg` | Badge de charge plein, avec rose dorée | Dessin vectoriel du projet |
| `adventure/charge-empty.svg` | Badge consommé, cercle vide | Dessin vectoriel du projet |
| `adventure/cimes-clean.png` | Calque de paysage sans clochette | Édition imagegen de `destinations/cimes_eternelles.webp` |
| `adventure/cimes-bell.png` | Clochette isolée qui oscille autour de sa suspension | Extraction imagegen depuis la même destination |
| `adventure/mycelia-sleeping.png` | Fenêtres éteintes avant l’offrande | Édition imagegen de `destinations/mycelia.webp` |
| `adventure/mycelia-resident.png` | Petit habitant qui apparaît dans la porte et salue | Génération imagegen intégrée |
| `fonts/Alegreya.ttf` | Titres, légendes et notes de la carte | [Dépôt officiel Google Fonts](https://github.com/google/fonts/tree/main/ofl/alegreya) |
| `fonts/OFL-Alegreya.txt` | Licence accompagnant la police | SIL Open Font License 1.1, copyright The Alegreya Project Authors |

Les aiguilles miniatures utilisent directement `preparation/needle_teal.webp` et `preparation/needle_violet.webp`, avec les mêmes pivots que la boussole de préparation. Les étiquettes kraft restent dessinées par le composant commun `souvenir.ts`, avec leur grain, œillet et ruban adhésif.

## Prompts de production

Outil utilisé : **image_gen intégré**, sans CLI ni appel API par une clé du projet. Les PNG générés ont été copiés dans le projet en conservant les originaux de génération. La transparence des sprites et du papier est conservée ; les deux calques de paysage sont opaques. Le cadrage des deux éditions est identique à celui de leurs destinations, 1448 × 1086 pixels.

### Papier

> Use case: stylized-concept. Asset type: reusable illustrated parchment paper background for a cozy magical travel browser game, landscape 3:2. Primary request: one blank, unfolded travel-map sheet, isolated on a truly transparent background. Entire sheet visible with a thin transparent margin. Straight overhead view, flat rectangle aligned to image edges, NO perspective. Warm ivory and pale honey paper, subtle painterly gouache grain, softly worn irregular edges, delicate pale brown fold creases dividing the sheet into panels, tiny faint anonymous coast contours only along the outer edges. Large quiet empty center occupying at least 85% of paper for game UI overlays. The object should match a warm cartoon storybook game with illustrated leather suitcase and brass compass. Soft painted shading at the edges, restrained fine details. NO writing, NO letters, NO labels, NO compass, NO route, NO tokens, NO islands or mountains or objects, NO table, NO cast shadow outside the paper. This is a production background texture, not a screenshot or mockup. Transparent outside paper, opaque ivory inside paper.

### Habitant

> Use case: illustration-story. Asset type: a single small game character sprite on truly transparent background, full body visible with generous clear margin. Primary request: a friendly tiny mushroom-village inhabitant peeking out to greet a traveller, warm cozy storybook gouache illustration. A round cream-colored forest sprite, little plum-purple mushroom cap with two muted rose spots, warm amber cheeks, simple two dot eyes and a small smile, wearing a muted moss-green scarf. One stubby little hand raised in a welcoming wave, other hand relaxed, tiny rounded feet. Frontal view. Simple readable silhouette and charming gentle expression at 50px. Painterly soft shading with soft dark plum outlines, no plastic/3D rendering, no pixel art. It lives in a village of large purple mushroom houses with warm amber windows. No environment, no door, no ground shadow, no accessories, no text, no border. Only ONE character.

### Fond des Cimes

Référence : `public/assets/destinations/cimes_eternelles.webp`.

> Edit target: the attached Eternal Peaks mountain illustration. Make a clean animation background plate: remove ONLY the hanging brass bell, its metal rings and the leaf-shaped dangling clapper underneath it, in the upper-left area. Keep the leather strap on the stone arch. Fill the small removed area naturally with matching mountain and sky painting. Preserve the exact framing and 4:3 aspect ratio, all rocks, snow, leaves, clouds, sunlight, colors, texture and every other part of this illustration. No other changes. No text.

### Mycélia endormie

Référence : `public/assets/destinations/mycelia.webp`.

> Edit target: the attached Mycelia mushroom village illustration. Create a dormant lighting state for a short awakening animation. Change ONLY the four glowing windows: dim their glass to a muted dark violet brown with very faint residual amber, no visible warm glow. Remove the tiny yellow floating firefly dots in front of the houses. Preserve ALL shapes, the exact composition and 4:3 framing, the mushroom houses, door, greenery, pathway, trees, textures, and the original surrounding colors. Keep the village cozy and readable, not frightening. Do not darken the entire image. No new objects, no characters, no text. Only the windows and firefly dots change.

### Clochette animable

Référence : `public/assets/destinations/cimes_eternelles.webp`.

> Edit target: attached mountain scene. Extract ONLY its hanging brass bell with the metal suspension rings and the gold leaf-shaped pendant below. Preserve the exact design: golden brass bell with engraved leaf/flower motif, two suspension rings on top, small rounded beads and one long leaf-shaped gold pendulum beneath. Remove the ENTIRE landscape, rocks, leather strap, sky and snow. Place the one isolated bell upright in the center, completely visible, on a genuinely transparent background. No surrounding scene, no ground, no cast shadow, no white outline, no sticker border, no text. Keep the original hand-painted storybook style and colors, do not replace this object with another bell. This will be a rotating animation sprite.

## Limites et validation artistique

Les nouveaux calques et le petit personnage restent des propositions à valider en jeu. Le salut est un léger mouvement du sprite, pas un personnage avec un squelette animé. Les notes sont visuelles ; cette passe n’ajoute pas de système audio. Le découpage animé et les textes sont propres aux deux lieux pilotes, sans engager vingt-huit nouvelles scènes. La validation du plaisir et de la cohérence artistique revient au joueur.


## Variante avant le lever du soleil

Asset actif : public/assets/adventure/cimes-predawn.png. Édition de public/assets/destinations/cimes_eternelles.webp par image_gen intégré, sans clé API du projet. Le cadrage et la clochette avec sa suspension sont conservés. Le jeu fond vers l’illustration originale après activation des trois pics. Les anciens cimes-clean.png et cimes-bell.png sont conservés comme sources historiques, mais ne sont plus chargés ni affichés.

Original généré : C:/Users/badlo/.codex/generated_images/01a1a819-f2bf-7cc2-bc90-592053d606e5/exec-2978905a-9543-4833-8a83-a09c18848c68.png.

Prompt exact :

> Edit target: attached snowy mountain illustration. Create the BEFORE-SUNRISE lighting state of exactly this same scene. Keep the exact framing, dimensions, all three mountain peaks, stone arch, plants and ALL of the hanging bell, its leather strap, suspension rings and leaf pendulum fully intact in their exact places. Change ONLY lighting and sky: a calm blue-violet predawn, cool lavender snow and pale muted coral low on the horizon. The sun has not risen yet: remove the visible yellow sun disk and its golden glare, replacing just that sky area naturally with predawn clouds. No moon, no stars, no new objects. No new highlights or markers on the peaks. Preserve the original hand-painted texture, silhouettes, details and 4:3 aspect ratio. Readable cozy twilight, not pitch dark. It is an alternate animation background, not a redesigned scene. No text.
