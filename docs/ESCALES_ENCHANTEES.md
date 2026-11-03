# Les Escales enchantées — extension de gameplay

> **Projet :** Le monde tient dans une valise  
> **Statut :** proposition de conception validée dans son intention, **à prototyper après la finalisation des 30 destinations et de leurs autocollants**.  
> **Références :** `GAME_DESIGN.md`, `COMPASS_AND_STICKERS.md`, `ART_DIRECTION.md`, `TECHNICAL.md`, `destinations.json`.  
> **Jam :** Indie Park Game Jam #6 — thème « Voyage ».

## 1. Objectif

Faire passer la destination de simple découverte à **petite visite vécue**, sans perdre le rythme relaxant du jeu. Après avoir découvert un lieu, le joueur peut accomplir une courte escale facultative, obtenir un tampon dans son carnet et revenir jouer à volonté.

**Priorité de production :** terminer d’abord les 30 destinations, leurs illustrations et leurs autocollants. Les escales constituent une phase suivante, non un prérequis à la boucle principale.

## 2. Principes non négociables

- **Trois mécaniques réutilisables**, configurées pour les 30 destinations (10 de chaque).
- **Aucune pression :** pas de chronomètre, score, classement ni limite d’essais.
- **Échec possible, mais sans perte :** mauvaise photo, mauvaise direction ou pièce mal placée ; reprise immédiate et bienveillante.
- **Escales facultatives :** la destination et son autocollant restent acquis indépendamment du mini-jeu.
- **Rejouables depuis le carnet**, même après réussite, sans consommation de charge de boussole.
- **Durée visée :** environ 20 à 40 secondes par escale ; ce n’est pas une limite stricte.
- **Souris et tactile**, avec cibles généreuses, textes FR/EN et retour visuel/sonore doux.
- **Pas d’exploration libre**, de déplacement 3D ou de système de ressources supplémentaire.

## 3. Boucle d’expérience

1. Le joueur associe deux éléments distincts avec la boussole et voyage selon les règles existantes.
2. La destination est révélée et enregistrée dans le carnet ; son autocollant se débloque selon le système existant.
3. L’écran propose **« Explorer ce lieu »** ou **« Continuer le voyage »**.
4. S’il choisit l’escale, il accomplit une activité courte propre au lieu.
5. En cas de réussite, un **tampon de passeport permanent** est apposé dans le carnet.
6. Le carnet permet de lancer ou rejouer l’escale à tout moment, sans refaire l’association.

**Important :** aucune escale n’est proposée pour le Néant, sauf décision explicite ultérieure. La mécanique ne modifie ni les 45 associations, ni les coûts des voyages, ni les règles de boussole.

## 4. Trois mécaniques

### A. Photo souvenir — observation (10 destinations)

**Objectif :** repérer un détail dans l’illustration et le photographier.

- Un court indice textuel décrit la cible.
- Le joueur déplace un viseur ou touche directement la zone ciblée.
- Une tentative hors cible provoque un discret retour (« Pas tout à fait… ») ; aucun malus.
- Une réussite déclenche un flash doux et révèle la photo souvenir.
- Après plusieurs essais, un indice optionnel peut apparaître.

**Contrainte de production :** la cible doit exister et être lisible dans l’illustration définitive. Utiliser des coordonnées normalisées pour les zones cliquables ; éviter les cibles minuscules.

### B. Parcours du voyageur — orientation (10 destinations)

**Objectif :** rejoindre un point d’intérêt en suivant un petit chemin à embranchements.

- Afficher une carte simplifiée avec 2 ou 3 choix successifs, et des indices visuels ou textuels.
- Un mauvais choix mène à une impasse douce et permet de revenir sans pénalité.
- La réussite trace l’itinéraire jusqu’au lieu remarquable.
- **Réutilisation :** un même composant de graphe de chemins, dont les nœuds, indices et décors changent selon la destination.

**Contrainte de production :** ne pas fabriquer dix niveaux complexes ; préférer quelques structures de chemins paramétrables.

### C. Carte postale — manipulation (10 destinations)

**Objectif :** remettre en place quatre fragments d’une illustration de carte postale.

- Quatre grandes pièces, adaptées à la souris et au tactile.
- Une pièce mal placée peut être déplacée de nouveau ; aucun blocage.
- Une pièce correctement placée s’aimante et se verrouille.
- La carte reconstituée révèle un court message de voyage.
- Prévoir une alternative au glisser-déposer si le tactile se révèle peu fiable (sélectionner une pièce, puis un emplacement).

**Contrainte de production :** utiliser les images existantes avec un cadrage cohérent, sans imposer 10 illustrations supplémentaires.

## 5. Répartition proposée — 30 destinations

Les IDs sont repris de `destinations.json`. **Les missions ci-dessous sont des propositions**, à confirmer selon les visuels réels, les traductions et la lisibilité des interactions. Le fichier de données ne contient pas encore ces escales.

| ID de destination | Type | Mission proposée |
|---|---|---|
| `archipel_azur` | Photo | Repérer un phare dans le panorama |
| `cimes_eternelles` | Parcours | Rejoindre un refuge de montagne |
| `mycelia` | Photo | Photographier une fenêtre lumineuse |
| `ruines_englouties` | Parcours | Retrouver le temple immergé |
| `coeur_de_braise` | Postale | Recomposer une vue du volcan |
| `iles_suspendues` | Parcours | Traverser les îles suspendues |
| `marais_des_lucioles` | Photo | Trouver une luciole remarquable |
| `desert_de_cristal` | Postale | Recomposer un panorama cristallin |
| `palais_de_givre` | Postale | Restaurer une vue du palais |
| `temple_oublie` | Parcours | Atteindre l’entrée du temple |
| `ile_des_cendres` | Photo | Repérer une fleur parmi les cendres |
| `grottes_sporiferes` | Parcours | Sortir des galeries |
| `canopee_des_brumes` | Photo | Observer un oiseau dans la canopée |
| `recif_de_verre` | Postale | Restaurer le panorama du récif |
| `jardins_du_zenith` | Photo | Trouver une fleur singulière |
| `cite_immobile` | Parcours | Rejoindre l’horloge centrale |
| `sylve_prismatique` | Photo | Repérer un reflet prismatique |
| `necropole_ardente` | Parcours | Atteindre un monument ancien |
| `foret_du_silence` | Photo | Observer une silhouette dans la forêt |
| `sanctuaire_des_spores` | Postale | Reconstituer le sanctuaire |
| `royaume_des_spores_celestes` | Postale | Recomposer le paysage céleste |
| `tempete_ecarlate` | Parcours | Trouver un passage abrité |
| `atoll_boreal` | Photo | Photographier un reflet d’aurore |
| `vestiges_celestes` | Postale | Restaurer une vue des vestiges |
| `mer_figee` | Parcours | Traverser la mer gelée |
| `jungle_incandescente` | Photo | Trouver une plante lumineuse |
| `jardins_de_gemmes` | Postale | Reconstituer les jardins |
| `empire_des_sables` | Parcours | Atteindre une oasis |
| `faille_des_contraires` | Postale | Assembler le paysage des contraires |
| `observatoire_des_etoiles` | Postale | Recomposer la carte du ciel |

## 6. Carnet, récompenses et sauvegarde

Trois états fonctionnels :

1. **Inconnue :** destination non découverte, escale inaccessible.
2. **Découverte :** destination et autocollant acquis ; bouton « Faire l’escale » dans le carnet.
3. **Escale accomplie :** tampon affiché ; bouton « Rejouer l’escale » toujours disponible.

Le tampon est **distinct de l’autocollant** : l’autocollant récompense la découverte, le tampon récompense la visite. Une escale déjà validée ne redonne pas de récompense à chaque rejeu.

Afficher une progression secondaire discrète, par exemple « Escales accomplies : 8 / 30 », sans remplacer le compteur des destinations découvertes.

Persister seulement les IDs des escales terminées dans la sauvegarde locale existante, avec migration non destructive des anciennes sauvegardes. Les tentatives inachevées n’ont pas besoin d’être conservées. Une destination non découverte ne doit pas pouvoir être marquée comme visitée.

## 7. Intégration technique proposée

**Stack existante :** Phaser 4, TypeScript strict, Vite, JSON typé, `localStorage`, Vitest. Pas de backend.

- Ajouter un fichier de configuration des escales indexé par **ID de destination existant** ; ne pas modifier les recettes.
- Définir un type discriminé `photo | route | postcard` et une validation de données (exactement 30 entrées, IDs connus, 10 par type, paramètres valides).
- Créer trois composants/scènes de mini-jeux réutilisables, et un écran d’entrée/sortie commun.
- Stocker les textes de mission et de résultat dans les traductions FR/EN, pas en dur dans le code.
- Ajouter un ensemble `completedEscales` à la sauvegarde, avec valeur par défaut vide et migration de version.
- Prévoir des tests unitaires sur le déverrouillage, la validation, la persistance, le rejeu et l’absence de coût de boussole.

**Exemple de structure indicative** (les IDs et chemins réels du dépôt font foi) :

```ts
type EscaleConfig =
  | { type: 'photo'; target: { x: number; y: number; radius: number }; objectiveKey: string }
  | { type: 'route'; nodes: RouteNode[]; objectiveKey: string }
  | { type: 'postcard'; image: string; pieces: 4; objectiveKey: string };

interface RouteNode {
  id: string;
  next: string[];
  // Ajouter les indices et conditions selon le prototype.
}
```

Pour la photo, les coordonnées `x`, `y` et `radius` sont normalisées de 0 à 1 dans le cadre réel de l’illustration, afin de résister aux redimensionnements. La zone de toucher effective peut être agrandie pour l’accessibilité.

## 8. Direction artistique et son

Respecter l’identité du jeu : papier, carnet, cuir, formes douces, couleurs chaleureuses, féerie légère. L’escale s’ouvre comme une petite activité de voyage, non comme un changement brutal de jeu.

- Photo : viseur discret, flash bref et doux, petit son d’obturateur.
- Parcours : trait dessiné sur une carte, son léger de crayon.
- Postale : morceaux de papier, aimantation douce et froissement discret.
- Réussite : **tampon encreur** sur le carnet, avec son feutré ; pas de grand écran « Victoire ! ».
- Erreur : animation subtile et encourageante ; pas de buzzer agressif.
- Réduire les animations si l’utilisateur préfère limiter les mouvements.

## 9. Plan de production et critères de validation

### Phase 0 — Prérequis

- Finaliser les 30 destinations, leurs illustrations, histoires et traductions.
- Finaliser les 30 autocollants et leur persistance.
- Stabiliser le carnet et les retours aux destinations découvertes.

### Phase 1 — Trois prototypes pilotes

- **Mycélia :** photo souvenir.
- **Ruines englouties :** parcours du voyageur.
- **Palais de givre :** carte postale.

Pour chaque prototype : entrée depuis la destination et le carnet, échec sans pénalité, réussite, tampon sauvegardé, rejeu possible, test tactile et clavier lorsque raisonnable.

### Phase 2 — Test de plaisir

Faire tester les trois escales par une personne découvrant le jeu. Vérifier : consigne comprise sans explication, durée courte, plaisir de l’activité, absence de frustration, envie de faire une autre escale. **Ne pas déployer les 30 variantes tant que ces trois tests ne sont pas convaincants.**

### Phase 3 — Déclinaison

Configurer les 27 autres missions ; vérifier que chaque cible photographique existe réellement, que chaque parcours est résoluble et que chaque carte postale reste lisible. Ajouter les textes FR/EN et tester le carnet sur sauvegarde ancienne et nouvelle.

### Phase 4 — Finitions

Sons doux, transitions, tampon, accessibilité, performance HTML5 et test de l’archive itch.io. Si le calendrier de la jam est trop serré, **réduire le nombre d’escales intégrées plutôt que sacrifier la stabilité du jeu principal**.

## 10. Hors périmètre et décisions ouvertes

**Hors périmètre :** 30 mécaniques différentes, chronomètre, vies, points, pénalités, économie de récompenses, multijoueur, exploration libre, narration ramifiée obligatoire.

**À décider après les prototypes :** indice automatique ou sur demande ; présentation précise du tampon ; emplacement de l’accès aux escales dans le carnet ; éventuel épilogue cosmétique après 30 tampons. Aucun de ces points n’est requis pour la première version.

---

**Résumé :** *Découvrir* une destination donne son autocollant. *Visiter* cette destination via une escale relaxante donne son tampon. Les deux collections coexistent, et le joueur reste libre de voyager à son rythme.
