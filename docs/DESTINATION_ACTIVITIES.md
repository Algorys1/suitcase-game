# Petits jeux des 30 destinations

## Intention et statut

**Présentation commune validée :** les gestes et les réponses du paysage varient selon le monde, mais le souvenir conclut la découverte en se formant brièvement dans la scène puis en rejoignant l’étiquette kraft. Il n’a pas besoin d’être dessiné dans l’illustration de départ. L’étiquette reste anonyme avant cette conclusion. Pour l’Archipel, les reflets déjà visités gardent une ondulation discrète ; au sixième, leurs lueurs convergent dans l’eau et le coquillage s’envole vers son étiquette. Le dessin progressif de l’autocollant dans l’exploration, le carnet et les résultats est retiré. Les six étapes et les souvenirs existants sont conservés. La réduction des animations et une interruption de l’envol montrent directement la récompense acquise, sans perte ni nouveau débit. La relecture locale rejoue aussi la conclusion. L’illustration originale de l’Archipel est conservée ; la prochaine idée des Cimes viendra du joueur. Le retrait de la clé trop explicite dans l’illustration des Ruines reste prévu pour leur prochaine passe.

**Ruines englouties — poissons seuls, essai autorisé :** après revue de l’illustration avec le joueur, les deux bancs existants répondent au toucher en nageant derrière les colonnes puis en ressortant sous une autre arche. Un nouveau toucher permet le retour. Les bancs gardent leur taille et leurs emplacements initiaux ; les arches sont recomposées au premier plan pour les masquer pendant le passage. Les poissons fixes ont été retirés uniquement d’un fond dérivé pour éviter les doublons ; l’original reste conservé. Aucune progression, ressource, récompense ou condition de déblocage de la clé n’est ajoutée. La réaction reste disponible si le souvenir est déjà acquis. Le mouvement réduit remplace le déplacement par un bref changement de lumière. Les algues et coraux restent à discuter plus tard.

Retour après essai : l’effet plaît au joueur, mais certains poissons restaient coupés par les piliers à l’arrivée. Les points de repos sont recentrés dans les ouvertures ; les bancs diminuent progressivement de taille lorsqu’ils rejoignent les arches du fond et retrouvent leur taille initiale au retour. Le lien envisagé avec la clé serait une révélation progressive sur son étiquette, comme pour le coquillage ; cette collecte n’est pas encore implémentée et aucune nouvelle condition n’est ajoutée dans cette correction.

**Étape précédente, remplacée par la conclusion commune ci-dessus :** le coquillage se révèle progressivement sur l’étiquette kraft au fil des six reflets différents touchés, dans un ordre libre. Les répétitions gardent leur réponse sur l’eau sans avancer la révélation. Le sixième reflet débloque le souvenir et son nom ; le point de collecte invisible provisoire de l’Archipel est supprimé. Aucun coquillage n’est ajouté au paysage original. Les étapes sont conservées dans `pilotSteps.archipel_azur`, y compris après retour au carnet et rechargement. Les souvenirs déjà acquis restent acquis ; « Revoir l’apparition » permet une répétition visuelle locale, sans réécriture de la sauvegarde ni nouvelle récompense. Le nombre de six correspond aux grands reflets peints retenus pour cet essai et reste à valider en jeu.

**Nouvel essai autorisé — reflets de l’Archipel :** après revue de l’image avec le joueur, six grandes étincelles déjà peintes sur l’eau répondent au toucher par une lueur brève et des rides elliptiques. Aucun fond modifié, objet ajouté à la scène, séquence imposée ou condition de collecte. C’est un détail contemplatif à essayer avant de décider d’un éventuel lien avec le souvenir. Le mécanisme provisoire de collecte antérieur reste indépendant. Le mouvement réduit utilise un retour bref sans expansion ; les effets sont supprimés à la fin, au redessin et à la sortie.

**Retour du joueur — 5 novembre 2026 :** les essais de galets/rigoles de l’Archipel, du prisme à faisceaux de la Sylve et des rubans de la Faille sont rejetés et retirés, avec leurs assets et leur code. Les illustrations originales sont rétablies. Mycélia, les Cimes, le carnet et le tutoriel restent en place. Les souvenirs déjà gagnés sont conservés ; les données spécifiques aux essais sont ignorées au chargement.

Avant toute nouvelle implémentation, revoir ensemble les illustrations originales : partir de leurs éléments présents, choisir un geste et une réaction compréhensibles, sans ajouter un mécanisme étranger au paysage ni une cible de dépôt invisible. Un lieu peut proposer une interaction contemplative sans énigme obligatoire. Les autres propositions du tableau restent à réexaminer selon cette direction ; elles ne constituent pas une liste de jeux à produire automatiquement. Aucun remplacement des trois essais n’est implémenté dans cette passe.

Propositions de conception après le retour positif du joueur sur Mycélia et les Cimes. Document de travail : les deux pilotes sont jouables et leur direction est appréciée ; les 28 autres activités ci-dessous ne sont ni implémentées ni validées en jeu. Le joueur demande ici de les définir, avant de les produire.

Sources examinées : les 30 illustrations de `public/assets/destinations/`, leurs autocollants, les récits français et le catalogue `src/data/destinations.json`. Les identifiants, recettes et souvenirs existants sont conservés. Les scènes initiales proposées demandent souvent une variante de l’illustration : leur absence dans l’image actuelle n’est pas un oubli à résoudre par une zone invisible.

La ligne retenue : **un petit mystère par monde, un geste qui lui appartient, une transformation visible**. L’autocollant devient le souvenir de ce que le joueur a fait. Le résultat d’un voyage doit aussi donner des idées pour préparer le suivant ; la résolution locale reste indépendante des correspondances entre mondes.

## Cadre commun proposé

- Quelques gestes, environ 15 à 40 secondes à découvrir, sans chronomètre ni sanction. Durées à tester, pas des objectifs de vitesse.
- Pas d’étincelles, de flèche ou de curseur spécial pour dévoiler les cibles. La composition et l’état du paysage suggèrent une possibilité ; le geste produit une réponse immédiate.
- Aucun objet obligatoire provenant d’un autre monde pour gagner le souvenir local. On peut continuer son voyage et revenir plus tard. Les correspondances comme Cimes → Mycélia ajoutent une scène, sans bloquer la collecte locale.
- Éviter trente variantes de « toucher trois objets ». Alterner réveil, circulation, ouverture, orientation, rapprochement et passage d’un phénomène dans le paysage.
- Les glissers proposés ont un équivalent par sélection puis clic/toucher sur la destination du mouvement. Cibles généreuses, aucun tracé précis, aucune vitesse exigée. Les rotations se font par crans, sans dépendre de l’audio ou de la seule couleur.
- Un geste incorrect reçoit une réaction douce, sans perdre les étapes déjà acquises. La transformation finale peut se rejouer sans nouveau gain ni dépense.
- Sauvegarder les étapes utiles et le souvenir acquis ; conserver les anciennes collections. Les règles exactes de persistance des futures activités seront définies à leur prototypage.
- L’enveloppe anonyme reste identique jusqu’à la collecte. Ne pas annoncer le nom du souvenir ou sa forme dans l’aide.

## Catalogue proposé

Les retouches mentionnées concernent des états et des calques des illustrations existantes, pas une refonte de leur direction artistique. Les quantités hors pilotes sont des paramètres de prototype.

| Destination et ID | Situation à découvrir | Petit jeu proposé | Transformation et souvenir existant | Travail visuel nécessaire |
| --- | --- | --- | --- | --- |
| L’Archipel d’Azur — `archipel_azur` | Illustration originale rétablie. | Essai rejeté et supprimé. | Nouvelle interaction à discuter à partir des éléments déjà présents dans la scène. | Aucun nouvel asset prévu avant cette revue. |
| Les Cimes éternelles — `cimes_eternelles` | Les montagnes attendent dans la lumière froide précédant l’aube. | Toucher les trois sommets différents, dans n’importe quel ordre. **Pilote implémenté.** | Lever du soleil ; clochette. | Variante avant l’aube déjà intégrée, attache complète préservée. |
| Mycélia — `mycelia` | Les maisons-champignons ont leurs fenêtres éteintes. | Toucher chacune des cinq fenêtres ; chaque maison répond avec une lumière chaude. **Pilote implémenté.** | Village éclairé ; lanterne à spores. L’offrande de la clochette reste une autre interaction. | Fond endormi et fenêtres lumineuses déjà intégrés. |
| Les Ruines englouties — `ruines_englouties` | Des algues retiennent la clé sur son socle. | Écarter les deux frondes qui la recouvrent, puis soulever la clé libérée. | Les arches s’illuminent et un banc de poissons traverse la cité ; clé de nacre. | Algues au premier plan, clé et ombre séparées, réponse des arches. |
| Le Cœur de braise — `coeur_de_braise` | Une croûte sombre coupe le petit bras de lave au premier plan. | Écarter les deux fragments refroidis vers les berges. Le courant avance à chaque passage libéré. | La lave redessine sa rivière et remplit une petite fiole sur la rive ; souvenir de braise. | Obstructions lisibles, coulée masquée puis révélée, fiole distincte. |
| Les Îles suspendues — `iles_suspendues` | Le pont de cordes pend, décroché d’une rive. | Saisir l’extrémité libre et la ramener au poteau opposé, puis retendre la seconde corde. | Le pont se remet en place et les îles cessent de dériver ; galet léger. | Deux états du pont, extrémités séparées et poteaux identifiables. |
| Le Marais des lucioles — `marais_des_lucioles` | Le fanal du ponton est fermé ; ses alentours restent silencieux. | Ouvrir son petit battant, puis toucher les deux nénuphars voisins : leurs rides se propagent et réveillent les lucioles. | Un chemin vivant de lumières se dessine sur l’eau ; fanal qui reste vide, sans capturer les insectes. | Battant séparé, rides et trajectoires de lucioles ; groupes espacés. |
| Le Désert de cristal — `desert_de_cristal` | Le sable du sablier s’est arrêté dans son bulbe supérieur. | Retourner le sablier d’un geste ou d’un clic ; son écoulement fait émerger progressivement les cristaux ensablés. | Une courte onde de reflets traverse les dunes ; sablier. | Deux orientations, sable animé et masques sur quelques cristaux. Une seule attente courte et passable. |
| Le Palais de givre — `palais_de_givre` | Le portail givré porte deux moitiés d’un motif floral désaccordées. | Faire tourner les deux rosaces par crans jusqu’à reconstituer les pétales, sans combinaison secrète. | Le portail s’ouvre et une rose de givre se déploie sur le seuil ; rose. | Rosaces à créer sur le portail, motifs lisibles en petit, variante ouverte. |
| Le Temple oublié — `temple_oublie` | Deux racines recouvrent la porte et son disque de bois. | Replacer les racines dans les creux naturels des pierres, puis toucher le disque dégagé. | La porte laisse passer une lumière accueillante ; amulette de bois. | Racines distinctes et creux visibles ; porte entrouverte. |
| L’Île des cendres — `ile_des_cendres` | La jeune pousse du premier plan disparaît sous une pellicule de cendre. | Balayer doucement la cendre sur une zone large ; les doigts ou les clics successifs dégagent la même surface sans précision. | La pousse se redresse et ses feuilles s’ouvrent ; graine rouge. | Masque de cendre, pousse en deux états. Pas de pluie à inventer malgré le récit : le souvenir reste une graine en attente. |
| Les Grottes sporifères — `grottes_sporiferes` | Les grands champignons sont sombres et la géode paraît fermée. | Toucher le grand chapeau : il émet une impulsion visible. La relayer en touchant les deux autres chapeaux, dans l’ordre suggéré par sa propagation, sans limite de temps. | La voûte devient un ciel de spores et la géode s’ouvre ; géode. | Champignons détourés, chemin de propagation lisible, géode fermée/ouverte. |
| La Canopée des brumes — `canopee_des_brumes` | Une goutte de brume reste suspendue au-dessus de la tasse-feuille. | Incliner la grande feuille située au-dessus de la tasse pour que la goutte roule jusqu’à elle. Deux positions suffisent, sans simulation physique. | La tasse recueille la brume et une vapeur dessine une branche ; tasse-feuille. | Feuille basculante, goutte et tasse séparées ; conserver pont et profondeur. |
| Le Récif de verre — `recif_de_verre` | Le coquillage est fermé, tandis que des reflets s’arrêtent dans les coraux. | Orienter deux coraux de verre par crans pour conduire un rayon jusqu’au coquillage. Le chemin du rayon reste visible après chaque geste. | Le coquillage s’ouvre ; les couleurs traversent le récif ; perle. | Coraux orientables aux silhouettes distinctes, rayon et coquillage ouvert/fermé. |
| Les Jardins du zénith — `jardins_du_zenith` | Les fleurs de la terrasse sont fermées ; un petit nuage attend au-dessus de l’arrosoir. | Amener le nuage sur l’arrosoir, puis incliner celui-ci vers les fleurs. Aucun niveau d’eau à gérer. | Une pluie brève ouvre les massifs ; arrosoir céleste. | Nuage mobile, arrosoir séparé, fleurs fermées/ouvertes. |
| La Cité immobile — `cite_immobile` | La neige bloque les deux volets de l’horloge de la tour. | Dégager la neige, puis ouvrir les volets. On ne règle ni ne remet en marche l’horloge. | Les fenêtres s’animent et une silhouette salue ; montre sans aiguilles. Le temps reste arrêté, conformément au récit. | Volets et neige séparés, fenêtre habitée ; cadran fixe. |
| La Sylve prismatique — `sylve_prismatique` | Illustration originale rétablie. | Essai rejeté et supprimé. | Nouvelle interaction à discuter à partir des éléments déjà présents dans la scène. | Aucun nouvel asset prévu avant cette revue. |
| La Nécropole ardente — `necropole_ardente` | La lampe du premier plan brûle seule, les petites coupes des arches sont éteintes. | Prendre sa flamme puis la déposer dans les deux coupes, par sélection et toucher ou glisser. La lampe source ne s’éteint pas. | Les noms gravés apparaissent doucement sur les pierres ; lampe ancienne. | Coupes lisibles, flammes séparées, gravures décoratives sans texte essentiel incrusté. |
| La Forêt du silence — `foret_du_silence` | Une plume repose sur une souche ; une branche chargée de neige la surplombe. | Secouer doucement la branche d’un clic, puis dégager la neige tombée sur la souche. | La plume s’élève lentement et reste suspendue un instant ; plume blanche. | Branche mobile, neige et plume séparées. Aucun signal sonore nécessaire. |
| Le Sanctuaire des spores — `sanctuaire_des_spores` | Les sphères des alcôves sont pleines, le bassin central reste sombre. | Ouvrir leurs petits volets pour laisser les spores rejoindre le bassin. Les trajectoires conduisent l’œil vers le centre. | Les spores composent un motif lumineux au-dessus du bassin ; médaillon. | Volets à ajouter sur les sphères existantes, flux de spores et motif final. |
| Le Royaume des spores célestes — `royaume_des_spores_celestes` | Le petit champignon volant du premier plan penche, son ombrelle repliée. | Déployer son chapeau, puis l’amener dans le courant ascendant entre deux nuages. | Il s’envole rejoindre les autres ; ombrelle. | Chapeau ouvert/fermé, champignon et couloir de nuages distincts ; courant suggéré par leur mouvement, pas une flèche. |
| La Tempête écarlate — `tempete_ecarlate` | Deux masses de nuages rouges se heurtent au-dessus du flacon vide. | Écarter les deux nuages de part et d’autre ; le ciel s’apaise et une dernière étincelle descend. Toucher le flacon pour l’accueillir. | La lumière devient tiède et calme ; étincelle en flacon. | Nuages en plans séparés, éclair très doux, flacon séparé. Aucun flash rapide ni geste minuté. |
| L’Atoll boréal — `atoll_boreal` | Les trois rubans d’aurore s’arrêtent au-dessus du bracelet défait. | Ramener chaque extrémité lumineuse vers le même anneau ; elles s’y tressent automatiquement. | L’aurore traverse tout le lagon et le bracelet se ferme ; bracelet boréal. | Aurores en rubans, bracelet ouvert/fermé au premier plan ; extrémités assez larges au toucher. |
| Les Vestiges célestes — `vestiges_celestes` | Deux grandes dalles de la mosaïque étoilée sont tournées de travers. | Les faire pivoter par quarts de tour pour prolonger les branches de l’étoile déjà dessinée au sol. | L’étoile complète projette une constellation entre les arches ; fragment de mosaïque. | Dalles séparées, joints lisibles, projection finale ; conserver la majorité du motif comme repère. |
| La Mer figée — `mer_figee` | Le petit globe est vide au pied de la vague immobile. | Suivre la courbe de la vague en touchant successivement sa base, sa crête et son écume ; une lueur répond et garde chaque étape, sans contrainte de rythme. | Un filet d’écume rejoint le globe et y tourne ; boule de verre. La grande vague reste figée. | Trois zones larges avec retour progressif après toucher, filet d’écume et globe animé. |
| La Jungle incandescente — `jungle_incandescente` | Deux grandes feuilles cachent le fruit-lanterne du premier plan. | Les écarter puis toucher le fruit ; sa chaleur ouvre les fleurs proches l’une après l’autre. | Une lumière court jusqu’à la lisière ; fruit-lanterne. | Feuilles mobiles, fruit séparé et fleurs en deux états ; ne pas traiter chaque fleur comme une cible supplémentaire. |
| Les Jardins de gemmes — `jardins_de_gemmes` | La fleur de gemme est un bourgeon, hors du reflet lunaire. | Incliner les deux larges feuilles qui se font face pour ramener le reflet sur le bourgeon. | Les pétales cristallins s’ouvrent et éclairent le bassin ; fleur de gemme. | Feuilles orientables, chemin lumineux, bourgeon/fleur ouverte. |
| L’Empire des sables — `empire_des_sables` | Un voile de sable masque la cour et le bec de la lampe. | Dégager la lampe, puis orienter son bec vers l’une des ouvertures de la cité. Sa fumée s’étire vers la bonne arche et permet de corriger librement l’orientation. | L’arche révèle un aperçu de l’oasis ; lampe. | Voile de sable, lampe orientable par crans et ouverture vers l’oasis ; la fumée informe après manipulation. |
| La Faille des contraires — `faille_des_contraires` | Illustration originale rétablie. | Essai rejeté et supprimé. | Nouvelle interaction à discuter à partir des éléments déjà présents dans la scène. | Aucun nouvel asset prévu avant cette revue. |
| L’Observatoire des étoiles — `observatoire_des_etoiles` | Le télescope regarde entre deux constellations ; la lentille de poche reste sombre. | Faire pivoter le télescope entre quelques positions jusqu’à retrouver le motif gravé sur sa base. | La constellation descend dans la lentille et le dôme s’éclaire ; lentille étoilée. | Télescope séparé, repère gravé reconnaissable par sa forme, positions de ciel et lentille animée. |

## Petites animations gratuites — plus tard

Idée du joueur à conserver, **sans chantier d’implémentation immédiat** : certaines parties des cartes répondent même sans débloquer quoi que ce soit. Cela évite que chaque détail vivant devienne forcément un indice de récompense.

Exemples de réactions locales, sans compteur, ressource ou sauvegarde propre :

- Archipel : toucher l’eau produit des rides ; une palme oscille.
- Cimes : un peu de neige tombe d’une branche ; la cloche peut répondre après réparation de son animation, sans perdre son attache.
- Mycélia : un petit champignon émet quelques spores ; l’habitant salue.
- Ruines englouties : un poisson passe derrière une colonne après un toucher dans l’eau.
- Canopée : le pont se balance légèrement ; un nuage s’étire.
- Cité immobile : un rideau remue derrière une fenêtre.
- Forêt du silence : une branche libère une poussière de neige.
- Mer figée : seules les petites vaguelettes du globe bougent.
- Observatoire : une étoile filante traverse le ciel après un geste sur le dôme.

Ces réactions sont discrètes et brèves, sans scintillement de guidage ni fausse animation de récompense. D’abord réussir l’activité principale et la lisibilité du lieu ; ajouter ensuite une ou deux touches si le budget le permet. Elles respectent la réduction des animations.

## Tutoriel — première intégration

**Mise à jour — première intégration réalisée :** les trois conseils contextuels ci-dessous sont maintenant présents en FR/EN, peuvent être passés et relus depuis le sommaire du carnet. Leur acquittement est conservé. Les textes, le rythme et leur compréhension restent à valider par le joueur. Le descriptif de proposition ci-dessous conserve les intentions initiales.

Direction retenue : trois messages contextuels courts au fil de la première aventure. Ils expliquent la possibilité d’explorer et de gagner un souvenir sans donner la solution du lieu.

1. Premier départ : « Choisissez deux éléments pour guider la boussole. »
2. Première exploration : « Certains mondes cachent un souvenir. Observez, touchez… le paysage peut vous répondre. »
3. Premier souvenir : « Un souvenir rejoint votre carnet. Certains vous donneront une raison de repartir… »

Copies FR de conception ci-dessus ; les variantes intégrées et leur traduction EN sont externalisées dans les catalogues. L’aide peut être passée et relue ; elle ne se rejoue pas à chaque aventure. Le troisième message n’apparaît qu’une fois un souvenir effectivement acquis. Le tutoriel fonctionne aussi si le joueur ignore sa première exploration ou rencontre d’abord le Néant.

## Carnet sur la carte — première intégration

**Mise à jour — première intégration réalisée :** couverture existante en bas à gauche, animation d’approche et d’ouverture, retour à l’aventure, contexte de pagination conservé pendant une exploration depuis une fiche. Le sommaire distingue souvenir inconnu, souvenir acquis et piste ouverte ; les fiches gardent le souvenir masqué avant collecte. La composition et la compréhension restent à essayer en jeu.

Le carnet permanent existe déjà ; il faut rétablir son accès dans le nouveau parcours, pas recréer sa collection.

Proposition de disposition discutée : carnet fermé en bas à gauche de la carte, en équilibre avec la valise en bas à droite. Au clic, il vient au premier plan et conserve l’ouverture papier existante. Au retour, retrouver la même aventure, ses charges, ses étapes et le lieu consulté, sans nouveau voyage.

Trois informations distinctes, présentées sans surcharger les pages : monde découvert ; souvenir trouvé ou encore inconnu ; piste de voyage ouverte lorsque ce souvenir possède une correspondance. La piste décrit une envie ou un besoin (« un endroit où… »), plutôt qu’un marqueur de destination inconnue ou une recette dévoilée.

Le carnet peut montrer le monde et son histoire avant résolution de son activité, mais doit y respecter l’enveloppe et le nom inconnus du souvenir. Ne pas dévoiler l’autocollant dans une autre vue avant sa collecte. Conserver les souvenirs déjà acquis des anciennes sauvegardes. En petit portrait et paysage, vérifier que le carnet ne recouvre ni les lieux ni la commande de départ.

Cette première intégration reste à essayer : position exacte, messages et états visuels attendent le retour du joueur.

## Donner envie du voyage suivant

Le petit jeu local ne suffit pas à lui seul à répondre au problème initial : « le résultat d’un voyage ne change presque pas la manière de préparer le suivant ». Garder peu de correspondances, mais des envies compréhensibles, sans transformer les 30 souvenirs en 30 quêtes obligatoires.

- **Cimes → Mycélia :** première correspondance implémentée, appréciée dans son principe. Une clochette cherche une maison accueillante ; l’offrande fait venir un habitant et ne remplace pas les cinq fenêtres.
- **Cœur de braise → Cité immobile :** piste proposée : offrir de la chaleur à quelqu’un derrière une fenêtre, sans dégeler la cité ni remettre le temps en marche.
- **Jardins du zénith → Île des cendres :** piste proposée : un arrosoir cherche une terre qui attend la pluie ; une pousse apparaît. Ne pas conditionner le souvenir local à ce détour.
- **Vestiges célestes → Observatoire :** piste proposée : faire reconnaître le motif du fragment étoilé par un instrument du ciel.

Les trois nouvelles correspondances sont des idées à discuter, sans nouvelle règle de consommation ni nouvelle récompense définie ici.

## Ordre de prototypage recommandé

1. **Intégré, à essayer :** carnet depuis la carte et tutoriel court, pour rendre la nouvelle boucle compréhensible avant d’étendre le contenu.
2. **Essais retirés après retour du joueur :** revoir ensemble les illustrations originales de l’Archipel, de la Sylve et de la Faille avant de proposer une autre interaction. Ne pas reprendre les rigoles artificielles, les faisceaux à trois clics ou les dépôts de rubans.
3. Ajuster les familles à partir de ces essais, puis étendre par petits groupes. Éviter de produire les 28 jeux avant de savoir si ces gestes sont agréables.
4. Ajouter les correspondances retenues et quelques animations gratuites après stabilisation des activités locales.

Pour chaque prototype : départ toujours facultatif après la découverte, souvenir attribué une seule fois, progression conservée après retour/rechargement, aucune charge dépensée dans le lieu, absence d’indice scintillant, transformation lisible, alternative au glisser et mouvement réduit. Ces points sont des vérifications à venir, pas des tests déjà exécutés.
