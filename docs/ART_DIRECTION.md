# Direction artistique — Le monde tient dans une valise

> **Statut :** guide de production visuelle pour Codex et la création d'assets.  
> **Références fonctionnelles :** [`GAME_DESIGN.md`](GAME_DESIGN.md), [`../README.md`](../README.md).  
> **Décision validée :** 2D en perspective isométrique, cartoon simple, coloré, légèrement magique.

> **Complément à prototyper :** [COMPASS_AND_STICKERS.md](COMPASS_AND_STICKERS.md) introduit deux aiguilles de sélection et des autocollants cosmétiques. Leur ergonomie et leur présentation restent à valider ; les formes actuelles restent des visuels temporaires.

## 1. Intention visuelle

**Promesse :** une valise enchantée qui ressemble à une boîte à jouets et ouvre sur des cartes postales de mondes impossibles.

Mots-clés : **lisible, chaleureux, rond, féerique, joyeux, léger**.

- Illustrations 2D nettes, formes géométriques simples et silhouettes reconnaissables au premier regard.
- Faible densité de détails ; privilégier les grandes masses colorées et une ou deux caractéristiques distinctives par objet.
- Volumes suggérés par aplats, ombres douces et décalages de plans, sans éclairage 3D réel.
- Magie exprimée par quelques particules, halos subtils et mouvements courts, jamais par une surcharge d'effets.
- Ton fantastique accessible ; le Néant est mystérieux, pas horrifique.

**À éviter :** pixel art, photoréalisme, textures réalistes, UI chargée, traits très fins, petits détails illisibles, animations longues, effets lumineux agressifs.

## 2. Perspective et composition

La valise est un **visuel 2D dessiné en vue trois-quarts isométrique stylisée** ; il ne faut pas construire une grille isométrique jouable ni une scène 3D.

- Deux **zones de dépôt clairement identifiables**, placées dans l'intérieur de la valise. Leur forme à l'écran peut être un quadrilatère en perspective, mais leur zone de clic/toucher doit rester généreuse.
- Les objets sont de petites figurines / miniatures ; leur silhouette doit rester identifiable à la taille d'affichage réelle.
- Un fond simple (table, papier ou dégradé discret) met en valeur la valise.
- Une seule composition de valise ouverte et une variante fermée suffisent au MVP ; ne pas multiplier les angles de caméra.
- Les cartes de destinations peuvent être des **illustrations 2D frontales**, sans obligation de perspective isométrique. Cela évite de produire trente dioramas complexes.

### Hiérarchie à l'écran de préparation

1. **Valise et ses deux emplacements** : sujet principal, immédiatement identifiable.
2. **Boussole de sélection** : dix symboles, deux aiguilles distinctes par leur forme et leur couleur, commandes par crans et noms des éléments lisibles. La palette actuelle est un repli provisoire.
3. **Charges de la boussole** : énergie restante lisible d'un coup d'œil, visuellement distincte des deux choix d'éléments.
4. **Bouton Voyager** : action principale, activée seulement avec deux éléments distincts.

Concevoir d'abord une maquette à la taille d'affichage prévue, puis vérifier sur un écran plus étroit. Préférer une disposition réorganisée sur mobile plutôt qu'une interface simplement réduite.

## 3. Palette chromatique indicative

Ces couleurs sont **des propositions de départ**, à ajuster après une première maquette ; elles ne sont pas une contrainte de gameplay.

| Usage | Couleur | Hex indicatif |
| --- | --- | --- |
| Fond crème / papier | Ivoire chaud | `#FFF4DF` |
| Valise / cuir | Caramel | `#C78B60` |
| Ombres de la valise | Brun doux | `#79543F` |
| Eau / accents frais | Turquoise | `#59C9C2` |
| Végétation | Vert menthe | `#77C98A` |
| Magie / mystère | Lavande | `#B69AE8` |
| Feu / accent chaleureux | Corail | `#FF8666` |
| Étoiles / découverte | Or clair | `#F6C96B` |
| Texte principal | Brun très sombre | `#302A37` |
| Néant | Bleu nuit | `#24243E` |

Éviter d'utiliser la couleur seule pour communiquer une sélection, un échec ou une découverte : ajouter bordure, symbole et texte.

## 4. Formes, contours et ombres

- Silhouettes arrondies, bords légèrement irréguliers si cela renforce le côté fait main.
- Choisir **un seul système de contours** pour tous les assets : soit contours bruns modérés, soit absence de contours avec contraste de valeur suffisant. Ne pas mélanger arbitrairement.
- Ombres courtes et douces sous les miniatures, cohérentes entre elles.
- Deux ou trois tons maximum par matériau pour limiter le temps de production.
- Préserver la lisibilité sans effets : un sprite doit fonctionner même sans particules ni animation.

## 5. Les dix éléments : signes visuels distinctifs

Chaque élément a **un identifiant stable** côté code et une représentation unique dans la palette et dans la valise.

| Élément | Silhouette / détail principal | Dominante |
| --- | --- | --- |
| Arbre | Tronc court, grosse couronne ronde | Vert |
| Champignon | Grand chapeau bombé à pois discrets | Mauve / rose |
| Eau | Petite mare ovale avec reflet | Turquoise |
| Feu | Deux ou trois flammes souples | Corail / or |
| Rocher | Bloc anguleux mais adouci | Gris bleuté |
| Palmier | Tronc courbé, éventail de feuilles | Vert / sable |
| Neige | Petit amas neigeux ou flocon en volume | Bleu très clair |
| Nuage | Trois masses rondes superposées | Blanc / lilas |
| Ruines | Deux colonnes brisées et une arche | Sable |
| Cristal | Groupe de trois pointes facettées | Violet / cyan |

**Important :** les éléments ne se transforment pas en écosystèmes dans la valise. Ils servent à choisir une destination. Aucun système de voisinage ou de réactions en chaîne dans le MVP.

## 6. Les trente destinations : système de cartes postales

Le catalogue et les recettes sont définis dans [`GAME_DESIGN.md`](GAME_DESIGN.md) et, à terme, dans `src/data/destinations.json`. **Ne pas créer de recettes ou de destinations supplémentaires ici.**

### Gabarit d'une illustration

- Format horizontal cohérent pour toutes les cartes (ratio cible **4:3** ; ajustable lors de l'intégration).
- Un sujet dominant et une silhouette de paysage immédiatement différente des autres.
- Trois plans simples au maximum : premier plan, sujet principal, fond / ciel.
- Palette propre à la destination, tout en conservant le style graphique commun.
- L'illustration **ne contient pas de texte** : titre et histoire sont rendus par l'interface, en FR/EN.
- Pas d'animation propre à chaque lieu pour le MVP ; un effet de révélation commun suffit.

### Diversifier les destinations

Les 30 lieux doivent être distinguables par leur **forme générale** et leur ambiance, pas seulement par un changement de teinte.

| Famille visuelle | Exemples du catalogue | Trait distinctif à privilégier |
| --- | --- | --- |
| Eau / tropiques | Archipel d'Azur, Récif de verre | Îlots / récifs translucides |
| Relief / ciel | Cimes éternelles, Îles suspendues | Pics / îles flottantes |
| Fongique | Mycélia, Marais des lucioles | Architecture-champignon / eau lumineuse |
| Ruines | Ruines englouties, Temple oublié | Colonnes submergées / temple envahi |
| Feu / anomalies | Cœur de braise, Faille des contraires | Volcan / fracture feu-glace |
| Minéral / merveilleux | Désert de cristal, Palais de givre | Dunes cristallines / palais de glace |

Même au sein d'une famille, changer **le cadrage, la silhouette et le point focal**. Par exemple, Mycélia est une ville de champignons, tandis que les Grottes sporifères sont une cavité souterraine lumineuse.

### Méthode de production recommandée

1. Créer **trois cartes pilotes contrastées** : Archipel d'Azur, Mycélia et Cœur de braise.
2. Les afficher dans l'écran de résultat réel ; vérifier la lecture en petit format.
3. Fixer alors le style final et produire le reste par lots.
4. Contrôler les doublons de composition en affichant les 30 miniatures côte à côte.

## 7. Le Néant

Le Néant doit contraster avec les destinations colorées sans donner l'impression d'une erreur technique.

- Fond bleu nuit / violet profond, une petite plateforme ou une silhouette flottante, quelques points lumineux éloignés.
- Boussole légèrement désorientée ; baisse de charges clairement visible.
- Animation brève, ambiance de silence et d'étrangeté.
- Aucun numéro de destination, aucune carte débloquée dans le carnet.

## 8. Interface et typographie

- Panneaux inspirés de pages de carnet, d'étiquettes de bagage et de papier crème.
- Boutons larges, états normal / survol / appui / désactivé clairement différenciés.
- Police sans-serif arrondie, avec caractères français complets (accents, apostrophes) et bonne lisibilité en anglais ; vérifier la licence avant intégration.
- Taille du texte suffisamment grande pour lecture sur navigateur ; ne pas intégrer les textes dans les images.
- Un même langage visuel pour l'accueil, les paramètres, le résultat, le bilan et le carnet.
- Carnet : cartes inconnues masquées ; cartes connues avec illustration, titre et courte histoire. Ne pas afficher les recettes des destinations inconnues.
- Boussole : **charges numériques lisibles** en plus de tout effet décoratif ou jauge.

### Autocollants — extension à prototyper

- Pictogrammes cartoon par destination, avec silhouettes simples, marge et ombre discrète ; utiliser des motifs temporaires avant les illustrations définitives.
- Présenter la décoration sur le couvercle fermé, avec **6 positions fixes proposées**, espacées et lisibles en perspective. Ces positions ne sont pas les deux emplacements d'éléments dans la valise.
- Prévoir une lecture claire des autocollants disponibles et verrouillés, sans révéler les recettes ; l'emplacement du bouton de décoration reste à confirmer.
- La décoration est purement cosmétique et pourra apparaître pendant la fermeture de la valise si l'animation le permet. Pas d'éditeur libre, de rotation ou de redimensionnement dans le MVP.

## 9. Animations et feedback

**Durées indicatives à tester**, pas des exigences rigides :

| Action | Feedback | Cible |
| --- | --- | --- |
| Placer / remplacer un élément | Petit rebond, ombre qui se pose | 0,15–0,25 s |
| Retirer un élément | Disparition légère | 0,10–0,20 s |
| Départ | Fermeture de la valise | 0,35–0,55 s |
| Transition magique | Étincelles + fondu / flash doux | 0,4–0,7 s |
| Nouvelle découverte | Carte révélée, accent doré | 0,4–0,8 s |
| Déjà visité | Révélation sobre, sans célébration | 0,2–0,4 s |
| Néant | Assombrissement + aiguille hésitante | 0,4–0,7 s |

Éviter de bloquer le joueur pendant plusieurs secondes à chaque tentative. Prévoir la possibilité de réduire / passer les transitions répétées si les tests montrent qu'elles lassent. Respecter si possible les préférences de réduction des animations.

## 10. Assets et contraintes d'intégration

- Sources illustrées éditables à conserver hors build si possible ; exports optimisés **WebP ou PNG transparents**.
- Une convention de nommage stable : `element_water.webp`, `suitcase_open.webp`, `destination_archipel_azur.webp`, etc.
- Les noms de fichiers ne sont pas les textes localisés ; utiliser des IDs stables dans les données.
- Prévoir une taille d'export adaptée à la taille réelle d'affichage et à la densité des écrans, sans images inutilement lourdes.
- Tester le rendu dans Phaser 4 avec le filtrage approprié aux illustrations lisses (pas de filtrage « pixel art »).
- Éviter les dépendances réseau au lancement : les assets nécessaires au jeu doivent être inclus dans le build Web.
- Les visuels provisoires peuvent être des formes géométriques simples : **la boucle de jeu doit rester jouable avant la production des 30 illustrations**.

## 11. Priorités de la Game Jam

**P0 — indispensable :** valise ouverte/fermée lisible, 10 éléments distincts, 2 slots, boussole, boutons, écran de résultat, Néant, carnet consultable, textes FR/EN.

**P1 — finition importante :** cartes postales cohérentes pour les 30 destinations, transitions courtes, états de sélection et nouvelle découverte, responsive.

**P2 — seulement si le temps le permet :** petites particules supplémentaires, micro-animations propres aux éléments, embellissements de l'accueil et du carnet.

Ne pas sacrifier la lisibilité, les tests ou l'export navigateur au profit d'effets graphiques.

## 12. Critères de validation visuelle

- [ ] En regardant l'écran de préparation, on comprend immédiatement où placer les **deux** objets.
- [ ] Chacun des dix éléments reste identifiable à la taille réelle dans la palette et la valise.
- [ ] La boussole et son nombre de charges sont visibles et compréhensibles.
- [ ] Une nouvelle destination est perçue comme une découverte, sans transition interminable.
- [ ] Le Néant est visuellement distinct et sa pénalité est claire.
- [ ] Les cartes des destinations sont cohérentes mais ne se ressemblent pas toutes.
- [ ] Tous les textes FR/EN sont lisibles et ne sont pas inscrits dans les illustrations.
- [ ] L'interface reste utilisable à la souris et au toucher, y compris sur écran étroit si pris en charge.
- [ ] Le jeu reste compréhensible avec les effets visuels réduits.

---

**Principe directeur :** un petit objet magique, deux choix simples, trente mondes à découvrir. La direction artistique doit renforcer la curiosité, pas complexifier le gameplay.
