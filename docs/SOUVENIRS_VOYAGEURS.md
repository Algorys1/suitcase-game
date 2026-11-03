# Souvenirs voyageurs et gestes magiques

> **Projet :** Le monde tient dans une valise  
> **Statut :** piste appréciée par le joueur et consignée pour approfondissement ; règles proposées, non prototypées et non validées en jeu. Ce document ne lance pas leur implémentation.  
> **Références :** [Game Design](GAME_DESIGN.md), [Boussole et autocollants](COMPASS_AND_STICKERS.md), [Escales enchantées](ESCALES_ENCHANTEES.md), [Direction artistique](ART_DIRECTION.md).

## 1. Intention

**Rapporter un souvenir d’un monde pour éveiller quelque chose dans un autre.**

Deux idées se rejoignent : des correspondances entre destinations, qui donnent une raison sensible de repartir, et des gestes magiques, qui font réagir les paysages au toucher. Les lieux deviennent liés et gardent une petite trace du passage du joueur.

Le joueur apprécie particulièrement l’idée d’amener les autocollants à des lieux spécifiques pour en modifier légèrement la carte, ainsi que celle de simplifier les escales autour de réactions amusantes et enchantées. La qualité des visuels et de leurs réactions est une condition essentielle de l’intérêt de cette piste.

Dans cette proposition, « carte » désigne l’illustration de la destination. Cette interprétation reste à confirmer avant un prototype.

## 2. Des correspondances entre les mondes

Idée initiale : aux Cimes éternelles, une lettre attend quelqu’un qui vit « là où les fenêtres poussent dans les champignons ». Le joueur devine Mycélia, y voyage avec la recette habituelle et découvre une courte conclusion à la livraison.

Le plaisir vient de comprendre à qui ou à quel lieu un message est destiné. La correspondance raconte un lien entre deux mondes, sans échéance ni gestion complexe.

Les autocollants pourraient porter cette même mécanique : chaque souvenir a quelque chose à offrir à un autre lieu.

## 3. Les autocollants comme souvenirs voyageurs

### Boucle proposée

1. Découvrir une destination débloque son autocollant selon les règles existantes.
2. Une invitation facultative suggère un lieu où ce souvenir pourrait être offert.
3. Le joueur déduit la destination et prépare un voyage avec les deux éléments habituels.
4. Sur place, il offre une empreinte magique du souvenir.
5. Un détail du paysage change et peut devenir interactif.

Exemple d’indice :

> « Cette clochette rêve d’une maison dont les fenêtres s’allument au crépuscule. »

### Principes proposés

- Une seule invitation active, pour éviter une liste de quêtes à gérer.
- Aucun emplacement d’inventaire supplémentaire : les deux emplacements restent réservés aux éléments du voyage.
- Aucun délai, aucune pénalité pour une mauvaise destination, aucun coût supplémentaire pour offrir le souvenir.
- Le voyage conserve son coût normal, y compris vers une destination connue ; les recettes ne changent pas.
- L’autocollant reste acquis et disponible pour la décoration de la valise : offrir une empreinte ne le consomme pas.
- Le changement du décor serait petit, localisé et permanent, sans transformer toute l’illustration.
- Aucune obligation de créer trente correspondances : commencer par un seul lien.

**Évolution à valider :** les documents actuels définissent les autocollants comme purement cosmétiques. Leur usage narratif et interactif décrit ici est une proposition distincte, pas une modification implicite de cette règle. Aucun bonus d’énergie ni modification des recettes n’est proposé.

### Exemples à explorer

| Souvenir et origine | Destination d’accueil | Changement envisagé | Geste associé |
| --- | --- | --- | --- |
| Clochette des Cimes éternelles | Mycélia | Une clochette suspendue devant une maison ; quelques spores lumineuses apparaissent | Toucher la cloche fait sonner une note et les fenêtres s’allument en réponse |
| Braise éternelle du Cœur de braise | Palais de givre | Une petite serre se réchauffe et révèle une fleur sous la glace | Le passage du doigt ouvre des fleurs de givre autour |
| Coquillage de l’Archipel d’Azur | Mer figée | Le coquillage rend son murmure à la vague | Effleurer l’écume provoque une ondulation lumineuse |

Ces associations et ajouts visuels sont des exemples de conception, à confronter aux illustrations réelles. Ils ne constituent pas un nouveau catalogue validé.

## 4. Des gestes magiques pour habiter les destinations

Une petite interaction expressive peut rendre un lieu mémorable sans puzzle, bonne réponse, score ou tampon obligatoire.

Structure proposée pour une escale :

1. Un détail attire la curiosité et invite à un geste simple.
2. Le paysage répond immédiatement de façon agréable.
3. Continuer à jouer révèle une petite surprise.

À Mycélia, une fenêtre répond au toucher, puis les voisines s’éclairent, puis une silhouette vient saluer. Au Marais des lucioles, tracer une courbe attire les lumières. Sur la Mer figée, effleurer une vague remet brièvement son écume en mouvement.

Les gestes peuvent exister seuls, avant toute livraison. Un souvenir offert pourrait ensuite enrichir une réaction ou en révéler une nouvelle. Le fonctionnement précis reste à tester.

## 5. Relation avec les Escales enchantées

Cette piste pourrait simplifier les escales autour du plaisir d’interagir avec les lieux, plutôt que de décliner systématiquement photo, parcours et puzzle de carte postale.

Elle ne remplace pas automatiquement [ESCALES_ENCHANTEES.md](ESCALES_ENCHANTEES.md). Le choix entre remplacement, complément ou sélection de quelques activités reste ouvert. Le système de tampons et la répartition de trente mini-jeux ne sont pas repris comme exigences de cette nouvelle piste.

## 6. Condition essentielle : une réponse visuelle enchantée

La qualité de l’illustration seule ne suffit pas. Le joueur doit sentir que le monde répond à son geste : une lumière naît sous le doigt, des spores suivent doucement son mouvement, une fenêtre s’éveille.

- Privilégier quelques zones animées très soignées à une animation de toute l’image.
- Conserver le style illustré et intégrer les ajouts dans la lumière et la perspective du décor.
- Associer une réponse immédiate à une courte propagation ou surprise, sans longue séquence bloquante.
- Prévoir des sons doux, avec un retour visuel compréhensible sans audio.
- Garder des cibles généreuses à la souris et au toucher ; prévoir une alternative simple aux tracés si nécessaire.
- Respecter la réduction des animations et permettre de quitter le lieu librement.

La production peut explorer des calques locaux, de petites animations et des particules ; aucune technique ni nouvelle dépendance n’est imposée à ce stade.

## 7. Premier prototype proposé

**La clochette des Cimes éternelles apportée à Mycélia.**

Un seul lien permettrait de tester :

- La compréhension de l’indice et l’envie de repartir vers un lieu déjà connu.
- Le plaisir d’offrir le souvenir et la lisibilité du changement de décor.
- Une réaction lumineuse et sonore au toucher de la clochette.
- L’envie de recommencer le geste, même sans récompense supplémentaire.

Commencer par la réaction visuelle de Mycélia permettrait de vérifier son pouvoir d’émerveillement avant de construire toute la gestion des invitations. Aucun déploiement à trente destinations avant un essai convaincant et une validation du joueur.

## 8. Questions à résoudre avant implémentation

- Comment une invitation apparaît-elle, et peut-on la refuser ou en changer ?
- Faut-il connaître la destination d’accueil, ou l’indice peut-il guider une première découverte ?
- Comment offrir le souvenir sur place : bouton, sélection puis toucher, autre geste ?
- Quels gestes sont présents dès la découverte et lesquels apparaissent après une livraison ?
- Comment revoir les décors transformés et rejouer leurs réactions depuis le carnet ?
- Comment conserver invitation et transformations entre sessions, avec une migration non destructive de la sauvegarde ?
- Quelle place cette piste prend-elle par rapport aux escales et à la décoration de la valise ?

Le carnet, la langue et les découvertes existantes doivent être préservés. Les IDs et recettes restent ceux des données du jeu. Les textes d’indices et de réactions devront être externalisés en FR/EN lors d’une éventuelle implémentation.
