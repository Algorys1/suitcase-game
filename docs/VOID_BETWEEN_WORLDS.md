# Le Néant, entre deux mondes — 13 novembre 2026

Proposition acceptée pour essai par le joueur après le commit `d32e555`. Implémentation à essayer ; aucune validation d'agrément supplémentaire déduite des tests.

## Présentation

La vraie valise-boussole ouverte remplace la boussole isolée et l'îlot de l'ancien décor. Le nouveau fond peint comporte seulement un espace indigo, des brumes violettes/turquoise et de rares étoiles. La valise flotte doucement, les deux aiguilles cherchent leur direction ; les deux manifestations du départ se dissipent en poussière pendant 1,25 seconde. Des lumières remontent et trois petits fragments de papier dérivent au loin.

La brume s'écarte doucement autour du geste, accompagnée de quelques lumières qui suivent la souris ou le doigt puis s'éteignent. Réponse purement visuelle, sans cible, énigme, progression ou récompense ; curseur normal. Les pools sont bornés : sept voiles, trente-huit poussières, dix lumières de réponse et trois fragments.

Le titre, le texte retenu précédemment, le coût et les charges restantes figurent sur un feuillet de voyage aux bords irréguliers. Le retour à la carte est disponible immédiatement, pendant la révélation comme au repos. Le cadran reste décoratif et ses symboles s'adaptent aux petits formats.

## Règles et reprise

Coût du Néant conservé : deux charges, bornées à zéro. Aucun souvenir, aucune nouvelle destination et aucun bonus. Les animations ne résolvent ni ne débitent le voyage.

La paire du départ est transmise seulement en données de navigation (`voidElements`), sans nouveau champ persistant. Une reprise après rechargement retrouve la valise vide et le voyage déjà payé ; elle ne réinvente pas les éléments. Navigation clavier et redimensionnement terminent la révélation sans la rejouer.

Le mouvement réduit affiche immédiatement l'état final fixe et désactive la réponse aux gestes. Une modification de préférence en cours est prise en compte. Les écouteurs UPDATE, pointermove, pointerdown, gameout et de préférence sont retirés au redessin ou à la sortie. Aucun son ajouté.

## Fichiers et assets

- `src/game/ui/void.ts` : composition, dissolution, brume et réponses.
- `menu.ts` : feuillet et commandes ; `compass.ts` : taille décorative optionnelle des signes, sans changement des commandes de préparation.
- `PreparationScene.ts` et `ResultScene.ts` : transmission transitoire de la paire et des charges déjà résolues.
- `assetLoading.ts` : assets nécessaires au Néant chargés à la demande, y compris lors d'une reprise directe ; aucun préchargement global à l'accueil.
- [Source et prompt imagegen intégré](../designs/void/between-worlds-v1/prompt.json). Export de fond : `public/assets/void/space.webp`, 1440 × 960, 41 440 octets. Ancienne source conservée dans `designs/void/space-source.png` ; ancien rendu de boussole flottante et panneau sombre supprimé.
- Textes FR/EN externalisés : nouveau surtitre « Entre deux mondes » / « Between two worlds ». Histoire et coût conservés.

## Vérifications

TypeScript strict et build Vite réussis ; 162 tests Vitest dans 41 fichiers. Chrome sur build sous `/jam/` : FR 960 × 540 et 360 × 640, EN 320 × 568 et 640 × 360. Souris et toucher simulé, voyage Eau + Feu, dissolution, absence de boussole isolée, poussières réactives, retour et conservation de huit charges vérifiés. Aucune découverte ajoutée. Captures d'arrivée, repos et interaction inspectées ; éléments d'interface dans le cadre.

Compléments : reprise après rechargement sans second débit, mouvement réduit au démarrage et activé en cours, dernier voyage de une à zéro charge, redimensionnement paysage/portrait, retour par Tab/Entrée, accès au bilan et suppression des écouteurs d'interaction. Aucune erreur JavaScript/HTTP sur ces parcours. Scripts locaux : `.tmp/void-between-qa.mjs` et `.tmp/void-between-extra-qa.mjs`. Firefox, tactile physique et iframe itch.io restent à vérifier ; intensité et plaisir attendent l'essai du joueur.

## Vignette sur la carte

À la demande du joueur, le symbole ∅ est remplacé par une miniature composée à partir du nouveau fond et de la valise-boussole, avec quelques étoiles et les mêmes bords fondus que les autres étapes. Une étiquette « Néant » / « Void » accompagne le détour. Aucune cible d’exploration, aucun souvenir ni tampon ajouté. Fond et valise sont chargés à la demande pour une carte contenant un passage au Néant, y compris en reprise directe ; ils ne sont pas préchargés dans l’accueil.

Build réussi ; captures Chrome FR 960 × 540 et 640 × 360, EN 320 × 568 inspectées. Reprise à froid vérifiée : image absente de l’accueil, présente sur la carte après chargement ; ancien symbole retiré, aucun tampon, huit charges conservées et aucune erreur JavaScript/HTTP. Script local `.tmp/void-map-qa.mjs`. Pas de suite complète relancée pour cette retouche visuelle.

Le joueur apprécie le nouveau Néant, demande sa vignette sur la carte, puis le commit de l’ensemble. Cette validation de présentation ne remplace pas le playtest global.
