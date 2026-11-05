# Prototype — La carte d’aventure

> **Coquillage progressif de l’Archipel :** les six reflets peints différents font maintenant apparaître progressivement le coquillage sur son étiquette. Le nom reste inconnu jusqu’au dernier reflet ; les reprises et le carnet conservent la portion révélée. L’image originale et les rides restent en place. Les étapes réutilisent la logique pure et le stockage des pilotes, sans charge supplémentaire. La collecte provisoire en un clic est remplacée dans cette escale. Les anciennes collections sont conservées et l’apparition peut être revue localement depuis l’exploration. Cette évolution autorisée prime sur le statut purement décoratif de l’essai précédent ci-dessous.

Vérifications de la révélation progressive : build TypeScript/Vite et **81 tests Vitest** réussis, dont trois nouveaux tests sur les reflets distincts, la reprise partielle, les indices invalides, les anciens souvenirs, le stockage bloqué et l’absence de nouveau débit. Chrome sous `/jam/` en FR à 960 × 540 et 320 × 568, en EN à 640 × 360 et 360 × 640 : étiquette anonyme initiale, portions après un et trois reflets, répétitions sans progression, nom masqué, retour au carnet et rechargement, sixième reflet, collecte unique et répétition locale sans changement de sauvegarde. Toucher simulé sur les portraits ; captures partielles et complètes contrôlées. Clics rapides, stockage bloqué, animations réduites et articulation avec le conseil du premier souvenir vérifiés sans erreur JavaScript/HTTP. Firefox et tactile physique restent à vérifier.

> **Reflets de l’Archipel — nouvel essai ciblé :** les grandes étincelles de l’illustration originale réagissent par une petite lueur et des rides sur l’eau. Réaction décorative seulement, accessible même avec un souvenir déjà acquis ; aucune modification des recettes, charges, sauvegardes ou conditions de collecte. Implémentation isolée dans `archipelagoReflections.ts`, sans nouvel asset. Le plaisir de ce détail attend l’essai du joueur.

Vérifications : build TypeScript/Vite et 78 tests existants réussis. Chrome sous `/jam/` en FR à 960 × 540 et 320 × 568, en EN à 640 × 360 et 360 × 640, avec toucher simulé sur les portraits : les six reflets répondent au bon emplacement sur la texture originale, sans changer la sauvegarde ni débloquer le souvenir. Clics répétés, suppression des effets terminés, réduction du mouvement et sortie vers le carnet vérifiés sans erreur JavaScript/HTTP. Firefox et tactile physique restent à vérifier.

> **Retrait demandé le 5 novembre 2026 :** les trois essais Archipel/Sylve/Faille ont été supprimés après retour du joueur. Illustrations originales et comportement antérieur rétablis ; Mycélia, Cimes, carnet, tutoriel et collection conservés. La suite doit partir d’une revue des scènes originales avec le joueur, avant tout nouveau petit jeu. [Retour et direction retenue](DESTINATION_ACTIVITIES.md).

Vérification du retrait : build TypeScript/Vite et 78 tests Vitest réussis. Dans Chrome sous `/jam/`, à 960 × 540 et 320 × 568, les trois scènes affichent leurs textures originales sans les commandes des essais ; fenêtres/pics, accès au carnet depuis la carte et relecture du tutoriel restent disponibles. Une sauvegarde contenant les anciens états partiels se charge et conserve le souvenir déjà acquis. Aucune erreur JavaScript/HTTP sur ce parcours. Aucune nouvelle interaction de remplacement ajoutée.

> **Dernière étape intégrée :** carnet accessible depuis la carte et trois conseils contextuels FR/EN, passables et consultables à nouveau depuis le carnet. La collection, l’expédition et les charges sont conservées lors des consultations. Les activités des 28 autres mondes restent des propositions dans [DESTINATION_ACTIVITIES.md](DESTINATION_ACTIVITIES.md).

### Vérifications du carnet et du tutoriel — 5 novembre 2026

- Build TypeScript strict/Vite et 78 tests Vitest réussis, dont trois nouveaux tests sur la validation et la persistance des conseils, le passage de l’aide et le stockage bloqué. Aucun asset ni dépendance ajouté.
- Build sous `/jam/` dans Chrome : départ, exploration, souvenir, conseils passables et relisibles, carnet depuis la carte et reprise après rechargement, en FR à 960 × 540 et 320 × 568, en EN à 640 × 360 et 360 × 640. Toucher simulé sur les portraits. Les souvenirs restent anonymes dans les fiches avant collecte.
- Les 30 fiches et le sommaire aux titres longs passent les contrôles de cadre et de séparation histoire/souvenir en FR/EN à 320 × 568 et 640 × 360. Les états de collection et la piste de la clochette sont vérifiés.
- Carte remplie de dix escales sur les quatre formats : dix noms visibles, aucune zone de visite recouverte par celle du carnet, pagination du carnet conservée après exploration, retour à zéro charge puis bilan. Captures desktop/portrait/paysage contrôlées. La taille des légendes s’adapte sur les portraits remplis.
- Conseils au clavier, relecture sans réouverture involontaire par la même touche Entrée, réduction des animations et stockage bloqué vérifiés. Aucune erreur JavaScript/HTTP sur les parcours réussis. Firefox, tactile physique et publication itch.io restent à vérifier.

## Direction retenue le 4 novembre 2026

Après essai, le joueur souhaite rompre la répétition préparation → révélation → préparation. Le critère de plaisir est : « Tiens, j’ai envie de visiter un monde où il y a ça ! » Les découvertes doivent donner une intention au départ suivant. Cette direction est autorisée pour un prototype ; son plaisir reste à valider en jeu.

- Une aventure commence sur une carte vierge avec un point d’interrogation.
- La boussole est en haut à gauche, la valise fermée en bas à droite. Le point d’interrogation ouvre les deux instruments en grand sur un fond de carte, avec la sélection commune existante.
- Dix badges ronds en haut à droite représentent les charges ; les badges consommés deviennent des cercles vides.
- Chaque départ ajoute une étape, une miniature et un chemin pointillé animé. Des miniatures d’éléments enrichissent le décor autour des étapes.
- Après la révélation, le joueur peut explorer le lieu ou revenir à la carte. Les étapes restent accessibles gratuitement, même à zéro charge, avant l’ouverture volontaire du bilan.
- Les nouveaux souvenirs restent en silhouette, avec un nom « ??? », jusqu’à leur découverte sur place. La destination rejoint toujours le carnet dès le voyage. Les anciennes sauvegardes gardent leurs souvenirs acquis.

Les recettes et coûts restent inchangés : dix charges, un badge par destination valide, deux pour le Néant, sans valeur négative. Il y a au maximum dix départs valides, pas nécessairement dix lieux distincts. Le Néant laisse une étape de détour et réduit de deux les possibilités de départ. Revisiter par la boussole coûte un badge ; rouvrir une étape ne coûte rien.

## Choix provisoires de ce premier essai

De petits éclats animés permettent de trouver le souvenir en un toucher. Aux Cimes, la cible est désormais la clochette réellement visible dans l’illustration ; ailleurs, les positions restent provisoires. Il ne s’agit pas encore de trente énigmes conçues pour les illustrations. L’exploration depuis le carnet permet de récupérer un souvenir laissé sur place.

Trouver la clochette aux Cimes éternelles fait apparaître une envie de chercher un village de maisons champignons. À Mycélia, visitée dans l’expédition en cours, le joueur peut offrir la clochette puis toucher son empreinte dans le décor. Des lumières et des spores répondent au geste. L’éveil est permanent ; la clochette reste dans la collection.

Le premier indice suggère les montagnes enneigées pour rendre ce lien testable. Ce guidage, le placement de la clochette et les effets sont provisoires. Le collage directement sur la carte reste à évaluer : ce prototype propose un bouton d’offrande puis une cible dans l’illustration. Aucune déclinaison à trente correspondances n’est engagée.

## Sauvegarde et compatibilité

- `route` conserve l’ordre des IDs de lieux et des `null` pour le Néant. Les anciennes expéditions conservent leurs lieux dans l’ordre connu, suivis de leurs détours, dont l’ordre n’était pas sauvegardé. Une route invalide utilise ce repli.
- `pendingSouvenirIds` conserve seulement les nouveaux souvenirs qui restent à trouver. Les anciennes découvertes gardent leurs souvenirs.
- `awakenedMycelia` conserve la transformation pilote. Ces champs sont optionnels et validés dans la sauvegarde existante.
- Le carnet, la langue, les charges, le résultat déjà débité et le repli en mémoire sont préservés.

## À valider en jeu

L’envie de choisir une destination précise après une découverte ; le plaisir de construire son itinéraire ; la lisibilité des badges et du prochain départ ; la recherche d’un souvenir ; la correspondance entre mondes ; le rythme et la taille des étapes sur mobile.

Cette évolution prime sur les descriptions historiques du retour direct à la préparation, du déblocage automatique des autocollants et de leur rôle uniquement cosmétique. La décoration du couvercle et les trente Escales enchantées restent distinctes et non implémentées.

## Vérifications exécutées

- 66 tests Vitest réussis, dont cinq nouveaux tests sur l’ordre des escales, l’exploration, la compatibilité des sauvegardes, l’offrande et le stockage bloqué. TypeScript strict et build Vite réussis ; aucune dépendance ajoutée. Phaser 4.2.1 vérifié dans le paquet installé, notamment la séparation couleur/mode de teinte de son API.
- Build servi sous `/jam/` dans Chrome : parcours complet en FR à 960 × 540 et 320 × 568, en EN à 360 × 640 et 640 × 360. Départs, découverte, silhouette, exploration tactile simulée, offrande, Néant, reprise après rechargement, épuisement des badges, réouverture des lieux et bilan vérifiés sans erreur JavaScript ni requête HTTP manquante.
- Contrôles et textes dans le cadre ; résultats contrôlés après la révélation à 960 × 540, 320 × 568 et 640 × 360, sans chevauchement entre histoire et boutons. Accès à la préparation par Tab/Entrée vérifié. Sauvegarde corrompue, accès à localStorage bloqué et préférence de réduction des animations testés dans le navigateur.
- Firefox, appareil tactile physique et publication itch.io restent à vérifier. Le prototype reste local et attend le retour du joueur sur le plaisir de cette boucle.

## Première passe de finition visuelle

Demandée après l’essai de la carte, cette passe soigne le premier départ et la première arrivée sans changer les règles :

- Papier aux bords irréguliers, plis et contours cartographiques discrets ; chemins courbes et vignettes aux bords doux composées à l’affichage à partir des illustrations existantes. Les sources d’images sont conservées.
- Hiérarchie plus discrète des commandes : le point d’interrogation porte le départ, l’accueil devient un lien et une seule action principale accompagne l’arrivée.
- La boussole et la valise viennent de leurs positions de repos sur la carte. Elles y retournent si le joueur quitte la préparation sans partir. Les interactions sont bloquées pendant ce mouvement, qui est écourté pour les départs suivants et supprimé avec la réduction des animations. Échap permet de terminer l’entrée immédiatement.
- Fermeture et bref mouvement de la valise au départ, avec un fondu chaud ; aucun nouveau débit ni délai ajouté à la résolution métier.
- Arrivée et exploration partagent le même cadrage de carte postale sur la table. La découverte des Cimes se fait sur la clochette illustrée ; son empreinte suit une courbe jusqu’à son étiquette. L’acquisition est sauvegardée avant ce mouvement et survit à une interruption.
- Les vignettes s’adaptent à la longueur de l’itinéraire sur petit écran ; les commandes gardent des cibles séparées. Les notes de bas de carte s’effacent sur le petit paysage lorsqu’elles gêneraient les dernières étapes.

Implémentation : `adventureMap.ts`, `destinationStage.ts`, `travelMotion.ts` et scènes carte/préparation/résultat/exploration. Aucun asset externe ni dépendance supplémentaire. La réaction de Mycélia est conservée ; la recherche dans les vingt-neuf autres illustrations et le collage sur la carte restent à approfondir après retour du joueur.

Vérifications de cette passe : build et 66 tests Vitest réussis ; parcours Chrome sous `/jam/` en 960 × 540, 1280 × 720, 320 × 568, 360 × 640 et 640 × 360, avec toucher simulé sur les portraits. Les 30 cadrages d’arrivée passent en FR/EN à 320 × 568 et 640 × 360, sans débordement des textes ni chevauchement entre histoire et étiquette. Dix étapes restent sélectionnables avec des cibles distinctes. Redimensionnements pendant l’ouverture, le départ et l’envol du souvenir, ainsi que stockage bloqué et réduction des animations, vérifiés sur le build final sans erreur JavaScript/HTTP. Les limites Firefox, tactile physique et itch.io restent les mêmes.

## Chapitre vivant et corrections demandées

La passe suivante, autorisée par le joueur, approfondit le lien Cimes → Mycélia et remplace plusieurs habillages provisoires :

- Aux Cimes, un fond sans clochette et une clochette isolée permettent une oscillation amortie, une petite chute de neige et des notes visuelles. L’interaction reste rejouable après la collecte, sans nouveau souvenir ni débit.
- La clochette exprime son envie de sonner devant une maison-champignon. Cette phrase reste visible sur la carte, dans l’exploration et dans la fiche des Cimes tant que l’offrande n’a pas été faite.
- Mycélia commence avec les fenêtres éteintes. L’offrande réveille la peinture originale, allume successivement les fenêtres et fait apparaître un petit habitant dans une porte entrouverte. Toucher l’habitant ou la clochette rejoue une réponse courte, sans récompense répétée. L’éveil reste sauvegardé avant l’animation ; une reprise montre le village éveillé.
- Le bouton Accueil reprend le papier déchiré. Les autocollants utilisent à nouveau l’étiquette kraft commune, avec œillet et adhésif, y compris en petit paysage.
- Les noms des lieux ont des cartouches sur le papier, séparés des illustrations par un calcul de placement. Les légendes déplacées sont reliées à leur vignette par un trait. La police Alegreya est embarquée localement.
- La carte utilise un véritable asset de papier. Les charges disposent de deux assets SVG distincts, plein et vide, communs à la carte et à la préparation. La petite boussole réemploie les deux aiguilles illustrées et leurs pivots.

[Fichiers, sources, licence et prompts de génération](ADVENTURE_ASSETS.md). Ces propositions graphiques attendent le prochain essai du joueur. Les recettes, les coûts, le carnet et les règles de sauvegarde ne changent pas. Les notes restent visuelles ; aucun système audio n’est ajouté.

Vérifications : 69 tests Vitest et build réussis. Le parcours Cimes → Mycélia, la rejouabilité sans nouveau débit, le maintien des autocollants et l’éveil après rechargement passent dans Chrome, en FR à 960 × 540 et 320 × 568, en EN à 640 × 360 et 360 × 640, avec toucher simulé sur les portraits. Les dix légendes d’un itinéraire aux titres longs sont présentes et ne recouvrent aucune vignette. Les trente résultats passent en FR/EN à 320 × 568 et 640 × 360 avec l’étiquette kraft commune. L’invitation du carnet est vérifiée en FR/EN à 960 × 540, 320 × 568 et 640 × 360. Redimensionnements en cours de transition, stockage bloqué et réduction des animations vérifiés sans erreur JavaScript/HTTP sur le build. Les contrôles restent locaux ; Firefox, tactile physique et publication itch.io restent à vérifier.


## Exploration des deux escales pilotes — nouvelle proposition

Retour après essai : le joueur juge cette direction meilleure et souhaite la poursuivre. La [suite de conception](DESTINATION_ACTIVITIES.md) conserve le tutoriel, le carnet sur la carte et les animations gratuites pour plus tard, et propose un petit jeu pour chacun des 30 lieux. Les 28 nouvelles activités attendent prototypage et validation.

Cette passe demandée par le joueur remplace la collecte en un clic dans les deux lieux pilotes et les animations décrites plus haut. Elle reste à valider en jeu avant extension aux 28 autres destinations.

- Mycélia : toucher les cinq fenêtres différentes les allume individuellement ; la cinquième rend au village son éclairage chaud et débloque son autocollant.
- Cimes Éternelles : toucher les trois sommets différents déclenche un passage de l’aube froide au lever du soleil et débloque la clochette. Aucun ordre imposé ; répéter une cible ne fait pas avancer la collecte.
- Aucun scintillement préalable ni compteur ne révèle les cibles. Les réactions arrivent après le geste. Les autres lieux gardent provisoirement une collecte simple, sans scintillement.
- L’étiquette kraft cache désormais le souvenir derrière une enveloppe identique pour tous les lieux et un nom inconnu. Aucune silhouette de l’objet n’est montrée.
- La clochette des Cimes reste peinte avec son attache complète dans les deux états du paysage : le sprite isolé flottant n’est plus utilisé.
- L’action Offrir possède un encart dans le coin inférieur gauche de l’illustration, séparé de l’étiquette et du retour. À Mycélia, une ficelle dessinée relie la clochette offerte au toit. Offrir fait venir l’habitant mais ne résout pas les fenêtres à la place du joueur.
- Les gestes partiels sont sauvegardés dans pilotSteps, validés et dédupliqués. Une ancienne sauvegarde garde ses souvenirs acquis. Aucune charge supplémentaire n’est dépensée ; les recettes restent inchangées.

Implémentation : pilotExploration.ts (logique pure), storage.ts, ExplorationScene.ts, pilotWorlds.ts, worldTexture.ts, souvenir.ts et textes FR/EN. Les vignettes de carte et les résultats suivent l’état lumineux du lieu.

Vérifications exécutées : 75 tests Vitest et build TypeScript/Vite réussis. Parcours Chrome sous /jam/ en FR à 960 × 540 et 320 × 568, en EN à 640 × 360 et 360 × 640, avec toucher simulé sur les portraits. Vérifiés : gestes distincts, répétitions sans effet, révélation finale, enveloppe anonyme, sauvegarde partielle et complète, offrande et ficelle, séparation des commandes, absence d’erreurs JavaScript/HTTP. Parcours supplémentaire à 320 × 568 : offrande avant les fenêtres, reprise partielle, animations réduites et stockage bloqué. Firefox, tactile physique et publication itch.io restent à vérifier.
