# Premier voyage accompagné — 13 novembre 2026

Refonte autorisée après la proposition de premier voyage accompagné. Implémentée ; présentation finale des feuillets validée par le joueur après les retouches ci-dessous. Cette validation visuelle ne remplace pas le playtest global. Aucune modification des recettes, charges, activités ou récompenses ; aucune décoration de phase C.

## Parcours

- Carte : note invitant à ouvrir la mini-valise. L'ouverture acquitte ce conseil ; la valise oscille légèrement tant qu'il est affiché.
- Préparation : note sur les deux aiguilles et les symboles distincts. Une paire valide acquitte cette étape et présente les charges : réglages gratuits, coût de 1 pour un monde, 2 pour le Néant.
- « Les gestes » : volet accessible à tout moment dans la préparation, expliquant le glisser et le clic sur les symboles. Les raccourcis clavier figurent dans le guide.
- Arrivée : note dans la marge, à la place du texte d'histoire jusqu'à repli, distinguant découverte du monde et exploration facultative.
- Exploration : note d'ambiance dans la marge ; aucune cible, quantité, solution ou nature de souvenir révélée. Le paysage reste manipulable, avec curseur normal.
- Premier souvenir : note de conservation dans la marge, après la séquence de collecte ; le souvenir reste visible. Mycélia attend aussi la fin de l'envol.
- Première offrande possible : dès qu’un souvenir collecté peut être offert à une escale déjà découverte, le prochain passage sur la carte ou le sommaire du carnet présente la pochette. Le feuillet reste général et n’identifie ni le souvenir ni l’escale. Son affichage est enregistré dans `tutorialSeen`.
- Zéro charge : note sur les visites encore possibles et le carnet permanent. L'itinéraire réserve temporairement la place du papier, puis reprend son cadrage habituel au repli.

Les notes restent refermables immédiatement. « Voyager sans conseils » acquitte les huit étapes. Le champ optionnel `tutorialSeen` conserve les conseils déjà vus, y compris lors du chargement d’une sauvegarde antérieure.

## Présentation et accès

Feuillet crème irrégulier, seconde feuille débordante, coin replié et attache en fil de laiton. Mention « Conseil de voyage » tamponnée à l’encre brune directement sur le papier ; apparition du papier en 340 ms, pose de l’attache, frémissement lent. Sur les grandes notes, croquis de boussole avec aiguille oscillante. Texte et zones d'action restent fixes et immédiatement disponibles. Les notes ne bloquent pas les commandes des scènes ; seul le guide du carnet utilise un fond modal.

Le guide présente quatre onglets : Préparer, Voyager, Explorer, Conserver. Il explique aussi les commandes clavier, les revisites payantes par voyage, les retours gratuits aux escales et la conservation locale. Sa relecture ne modifie pas les conseils acquittés.

FR/EN externalisés dans les catalogues existants. Les notes réservent de la place sous la valise et dans la marge des destinations en portrait ; après repli, l'illustration retrouve son cadrage. Aucun asset distant ou préchargement global ajouté. Les mouvements du papier, du croquis et de la mini-valise sont supprimés avec le mouvement réduit ; son activation en cours les arrête. Écouteurs nettoyés à la destruction des objets.

## Vérifications

TypeScript strict et build Vite réussis ; 162 tests Vitest dans 41 fichiers, dont compatibilité des anciens conseils et persistance des nouvelles étapes. Avertissement habituel de taille du bundle Phaser, non bloquant.

Chrome sur build sous `/jam/` : parcours FR 960 × 540, 640 × 360 et 360 × 640, EN 320 × 568, avec toucher simulé en portrait. Carte, aiguilles, charges, aide aux gestes, arrivée, exploration de l'Archipel, premier souvenir, quatre onglets du guide et fermeture vérifiés ; captures inspectées et contrôles dans le cadre. Aucun échec JavaScript/HTTP sur ces parcours.

Contrôles complémentaires : sélection au clavier, arrêt immédiat des mouvements lors de l'activation du mouvement réduit, démarrage avec mouvement réduit, passage des sept conseils, Mycélia avec envol du souvenir avant sa note, relecture sans modification des conseils, redimensionnement du guide, reprise après rechargement et accès au bilan à zéro charge. Les voyages testés débitent une seule charge ; gestes et guide n'en consomment aucune.

Les preuves du parcours navigateur sont conservées localement dans `.tmp/tutorial-v2-qa-final.mjs` et les captures `tutorial-v2-*`. Le retour du joueur, le tactile physique, Firefox et l'iframe itch.io restent distincts de ces vérifications locales.

### Retouche après essai

À la demande du joueur, les aides sont identifiées par un cartouche vert sombre et un contour plus contrasté. Elles ne remplacent plus l’histoire ou la phrase d’ambiance. En paysage, une place est réservée sous l’illustration ; en portrait, l’enveloppe masquée cède temporairement sa place à l’aide, tandis qu’un souvenir acquis reste affiché. La phrase française est remplacée par « Vous pourrez visiter les paysages. », avec équivalent anglais. Vérification limitée au build et aux captures ciblées ; pas de nouvelle suite complète pour cette retouche visuelle.

### Feuillet et attache en laiton

Après retour du joueur, retrait du bandeau vert, du contour vert et de la barre latérale. La distinction de l’aide repose sur son titre tamponné, son attache en laiton, son épaisseur de papier et son emplacement séparé de l’histoire. Animations, gestes et règles inchangés. Build réussi ; captures ciblées paysage/portrait pour cette retouche locale.

### Validation du feuillet

Dernière retouche : bord supérieur du papier et attache remontés de 12 px, texte conservé à sa place pour augmenter la marge haute. Build réussi et capture ciblée 960 × 540 inspectée. Le joueur valide ce rendu (« Parfait ! ») puis demande le commit.
