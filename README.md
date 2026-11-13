# Le monde tient dans une valise

Jeu de découverte fantastique pour l’Indie Park Game Jam #6, thème « Voyage ». Choisissez deux éléments avec les aiguilles d’une boussole, partez vers un monde illustré et observez son paysage pour y découvrir un souvenir.

**État au 13 novembre 2026 :** boucle jouable, carte d’aventure, 30 destinations illustrées avec histoires FR/EN, 30 activités locales et 30 souvenirs intégrés. La [valise-boussole](docs/SUITCASE_COMPASS.md) est intégrée : mini-valise sur le trajet, cadran dans le couvercle et deux manifestations magiques sans socle. Dernière passe à essayer : charges métalliques sans chiffre dans la doublure, carte floutée et départ animé selon les éléments. La manipulation directe des aiguilles est conservée. La décoration de la valise n’est pas commencée. Voir [le bilan du projet](docs/PROJECT_STATUS.md) pour les validations et les travaux ouverts.

**Page itch.io :** [The world in a suitcase](https://algorys1.itch.io/the-world-in-a-suitcase). Format de référence : **960 × 540 px**. La vérification du build actuel dans l’iframe reste à faire.

## Lancer et vérifier

Node.js 24 LTS recommandé ; versions compatibles dans `package.json`. Sous PowerShell, utiliser `npm.cmd` si `npm.ps1` est bloqué, sans modifier la politique d’exécution.

```sh
npm install
npm run dev
```

Ouvrir l’adresse locale indiquée par Vite.

```sh
npm run typecheck
npm test
npm run test:watch
npm run build
npm run preview
```

Vérification du 13 novembre 2026 : **161 tests réussis dans 41 fichiers**, TypeScript strict et build Vite réussis. Chrome sur build sous `/jam/` : FR/EN, souris, toucher simulé, clavier, glissers et interruptions, aller-retour carte/valise, débit unique, reprise et fin à zéro contrôlés. Captures paysage/portrait inspectées. Tactile physique, Firefox et iframe itch.io restent à vérifier. Détails dans [la fiche valise-boussole](docs/SUITCASE_COMPASS.md).

## Jouer

1. Commencer ou reprendre une expédition depuis l’accueil. La carte donne accès à la valise, aux lieux visités et au carnet.
2. Toucher la mini-valise à la prochaine étape du trajet : elle vient au premier plan au-dessus de la carte. Dans son couvercle, déplacer les aiguilles par leur pointe ou leur contrepoids ; on peut aussi sélectionner une aiguille puis toucher un symbole. Sans mode liste : le clic sur les signes et le clavier complètent le glisser. Les deux signes choisis se manifestent dans sa partie basse.
3. Voyager exige deux éléments différents. Chaque nouvelle préparation commence sur Arbre / Arbre, aiguille 1 active. Tourner les aiguilles est gratuit ; le départ est bloqué pendant le geste et en cas de doublon.
4. Une destination valide coûte **1 charge**, même en revisite ; le Néant coûte **2 charges**, sans jamais passer sous zéro. Les **10 charges initiales** et ces coûts restent des paramètres de playtest.
5. L’arrivée découvre le monde et son histoire. Explorer permet de chercher son souvenir dans le paysage ; on peut aussi revenir à la carte et le faire plus tard. Les gestes dans un lieu ne consomment aucune charge et leur progression est conservée.
6. Avant collecte, le souvenir et son nom restent cachés, y compris dans le carnet. Résoudre l’activité le révèle une seule fois. Les anciennes collections sont préservées. La clochette des Cimes possède une première correspondance avec Mycélia.
7. À zéro charge, aucun nouveau départ : les lieux restent consultables depuis la carte et le bilan est accessible. Revenir à l’accueil depuis le bilan clôt l’expédition ; la suivante repart à 10 charges, carnet conservé.
8. Pause et rechargement conservent l’expédition si le stockage est disponible. Un départ déjà accepté ne coûte pas une seconde fois à la reprise. La langue FR/EN se règle dans les paramètres.

Au clavier : **1 / 2** sélectionne une aiguille, **← / →** la règle, **Tab / Maj+Tab** parcourt les commandes et **Entrée / Espace** les active. Les activités disposent d’alternatives clavier ; les notes contextuelles peuvent être passées et le guide à quatre onglets se relit depuis le carnet. Le jeu prend en compte le mouvement réduit.

La progression est conservée **dans ce navigateur**, sans compte ni cloud. Effacer les données du site la supprime. Si le stockage est bloqué, le jeu continue en mémoire avec un avertissement ; un rechargement perd alors cet état.

Pour repartir de zéro : **Paramètres → Reset · effacer la sauvegarde**, puis confirmer. Cette action efface la sauvegarde du jeu et son cache en mémoire, y compris langue et conseils.

## Technique et publication

L’accueil charge désormais environ **1 Mio d’images**, hors moteur et police ; les mondes et leurs activités arrivent à la demande. Une valise et une étiquette FR/EN indiquent la progression dès le chargement de la page. Les icônes cartoon du cadran sont conçues pour rester lisibles sur mobile. En cas d’image manquante, Réessayer recharge le jeu et conserve le voyage déjà payé. Détails et vérifications dans [la documentation technique](docs/TECHNICAL.md#chargement-progressif-et-démarrage-illustré--13-novembre-2026).

Phaser **4.2.1**, TypeScript strict, Vite et Vitest, versions verrouillées par `package-lock.json`. Jeu entièrement client-side, assets locaux, données et logique métier indépendantes des scènes Phaser. Textes externalisés dans `src/data/fr.json` et `src/data/en.json`.

Vite utilise `base: './'`. Pour itch.io, archiver le **contenu** de `dist/`, avec `index.html` à la racine du ZIP. Tester ensuite le build publié dans l’iframe, la sauvegarde et les assets relatifs ; un build local réussi ne suffit pas. L’audio est actuellement désactivé et reste à réaliser.

## Documentation

| Document | Rôle |
| --- | --- |
| [AGENTS.md](AGENTS.md) | Consignes de travail |
| [État du projet](docs/PROJECT_STATUS.md) | Bilan actuel, validations et travaux ouverts |
| [Game design](docs/GAME_DESIGN.md) | Règles, recettes, énergie et cas limites |
| [Boussole et autocollants](docs/COMPASS_AND_STICKERS.md) | Phases A/B et proposition de décoration C |
| [Activités des destinations](docs/DESTINATION_ACTIVITIES.md) | Interactions, validations et vérifications par lieu |
| [Carte d’aventure](docs/ADVENTURE_MAP.md) | Évolution autorisée du parcours et historique |
| [Technique](docs/TECHNICAL.md) | Architecture, sauvegarde, tests et export |
| [Direction artistique](docs/ART_DIRECTION.md) | Identité graphique et rendu |
| [Collection illustrée](docs/DESTINATION_COLLECTION.md) | Illustrations, histoires, souvenirs et sources |
| [Assets d’aventure](docs/ADVENTURE_ASSETS.md) | Calques, prompts et provenance des ressources |
| [Historique de production](docs/PRODUCTION_HISTORY.md) | Anciens comptes rendus du README |

Les catalogues `src/data/elements.json`, `src/data/destinations.json` et `src/data/souvenirs.json` décrivent les contenus implémentés. Les propositions [Escales enchantées](docs/ESCALES_ENCHANTEES.md) et [Souvenirs voyageurs](docs/SOUVENIRS_VOYAGEURS.md) ne constituent pas un lancement automatique de nouvelles fonctionnalités.

## Prochaines étapes

- Essayer la valise-boussole et sa nouvelle animation au clic sur Voyager.

- Essayer le [premier voyage accompagné](docs/TUTORIAL.md), puis définir la loupe ou longue-vue illustrée remplaçant le bouton « Explorer ».
- Playtest d’ensemble, relecture FR/EN et mesure de l’équilibrage 10 / 1 / 2 ; validation du bilan illustré encore à consigner.
- Habillage sonore et commande de coupure.
- Vérifications sur Firefox, appareil tactile réel et iframe itch.io ; préparation et contrôle de la publication finale.
- Après validation distincte : éventuelle décoration de la valise, autres correspondances ou réactions décoratives.

Le détail des limites de vérification et des propositions encore ouvertes est maintenu dans [le bilan du projet](docs/PROJECT_STATUS.md).
