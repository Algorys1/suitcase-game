# Son et introduction BD — 13 novembre 2026

Première passe demandée par le joueur : chercher des musiques détendues sur OpenGameArt et créer une courte introduction cartoon passable. Le joueur choisit la direction « Fantasy légère et malicieuse ». Piste et présentation intégrées pour essai, sans validation musicale ou visuelle implicite.

## Recherche et musique retenue pour l'essai

Trois pistes de recherche ont été proposées à partir des fiches des auteurs :

- [Forget Me Not — Kistol](https://opengameart.org/content/forget-me-not) : piano doux, annoncé bouclable et CC0.
- [Fantasy Song Pack Volume 1 — troubadour](https://opengameart.org/content/fantasy-song-pack-volume-1) : pack fantasy CC0, contenant notamment `homestead.mp3` et `springly_sprigs.mp3`.
- [Space Arp — Centurion_of_war](https://opengameart.org/content/space-arp) : ambiance fantasy/spatiale calme, annoncée bouclable et CC0.

Après choix de la direction fantasy, `springly_sprigs.mp3` est intégré comme piste d'essai, à faible volume (0,16), avec répétition du morceau complet. La fiche du pack ne garantit pas une boucle sans raccord ; aucun montage ou réencodage n'est appliqué. La qualification de la recherche repose sur les descriptions des auteurs ; les contrôles navigateur vérifient chargement/décodage/lecture, pas une appréciation humaine de la musique ou du mixage.

Fichier local : `public/assets/audio/springly-sprigs.mp3`, 3 340 593 octets. [Crédits distribués](../public/assets/audio/CREDITS.txt) : auteur, source, CC0 et lien de licence. La page source est archivée dans `designs/audio/opengameart-troubadour.html`. Crédit conservé volontairement bien que la fiche CC0 ne l'exige pas.

## Son dans le navigateur

`services/audio.ts` utilise un seul lecteur HTMLAudio pour la musique, conservé entre les scènes, et un contexte Web Audio pour quelques effets brefs : cran de boussole, papier de l'intro, départ, arrivée, souvenir et Néant. Ces petits effets sont synthétisés localement, sans asset tiers ni service distant. Aucun son n'est ajouté aux cibles cachées pour les révéler.

La musique n'est ni demandée ni jouée avant un geste. Les premières actions autorisent le son ; les touches de navigation système et Tab ne lancent pas la musique. Une languette papier avec haut-parleur reste accessible partout à la souris, au toucher et au clavier, avec intitulé FR/EN et état ARIA. Le choix de silence est sauvegardé. Le jeu suspend la lecture en arrière-plan et ne redémarre pas un second morceau lors d'un changement de scène. Une musique absente laisse le jeu utilisable.

Le gestionnaire audio Phaser reste délibérément désactivé pour éviter un second coordinateur ; le son du jeu est géré par les API natives HTMLAudio/Web Audio. Aucun ajout de dépendance.

## Intro BD

Trois illustrations dédiées : valise ordinaire dans le grenier, ouverture de la valise-boussole, panorama des ailleurs possibles. Les textes FR/EN sont rendus par Phaser et ne figurent pas dans les images. Une case à la fois, avec narration, numéro, précédent/suivant et « Passer l'intro » toujours disponible. Pas de délai imposé ; flèches, Entrée/Espace et Échap sont pris en charge. Apparition douce de 280 ms, supprimée en mouvement réduit.

L'intro est présentée au premier lancement sans expédition en cours. La passer ou la terminer acquitte le champ optionnel `introSeen`. Une reprise existante mène directement à l'accueil ; la relecture reste accessible par « Revoir l'intro » et ne crée ni ne modifie une expédition. Si un asset de cette intro facultative manque, le jeu rejoint l'accueil. Le chargement d'attente illustré existant est conservé.

Sources et prompts : [comic-v2](../designs/intro/comic-v2/prompts.json), outil image_gen intégré ; les originaux sont conservés dans `comic-v1`. Exports `public/assets/intro/panel-1.webp`, `panel-2.webp`, `panel-3.webp`, environ 398 Kio au total, chargés uniquement lorsque l'intro est affichée. Les mondes, souvenirs et calques restent chargés à la demande. Les lancements suivants n'ajoutent aucun chargement de case BD à l'accueil.

## Sauvegarde et vérifications

`introSeen` et `muted` sont deux champs optionnels validés du schéma v1 ; mauvais types ignorés et anciennes sauvegardes conservées. Le reset du jeu les efface aussi. Intro et silence fonctionnent en mémoire si le stockage est bloqué.

TypeScript strict/build réussis ; 166 tests dans 42 fichiers, dont quatre tests de validation, persistance, stockage bloqué et reset. Chrome sur build sous `/jam/` : FR 960 × 540 et 360 × 640, EN 320 × 568 et 640 × 360. Trois cases, navigation, fin, passage, relecture, sauvegarde, coupure et lecture réelle du MP3 contrôlées ; captures inspectées et commandes dans le cadre. Un seul lecteur, aucune musique avant geste, maintien de la lecture entre les scènes, neuf charges conservées après exploration et relecture de l'intro.

Compléments : clavier, redimensionnement, mouvement réduit, reprise d'expédition, musique absente et image d'intro bloquée sans blocage du jeu. Aucune erreur JavaScript ni HTTP inattendue ; les chargements volontairement bloqués servent aux scénarios de repli. Scripts locaux `.tmp/intro-audio-qa.mjs` et `.tmp/intro-audio-extra-qa.mjs`. Volume, plaisir d'écoute, Firefox, tactile physique et iframe itch.io restent à essayer.

### Retouche des illustrations

À la demande du joueur, retrait de la carte dépliée posée sur la table dans les trois cases ; seul le rouleau reste sur la table. Images modifiées avec imagegen intégré, sources v2 conservées et exports WebP remplacés. Build et captures ciblées des trois cases en 960 × 540 et de la dernière en 320 × 568 vérifiés sans erreur JavaScript/HTTP ; aucune suite complète relancée pour cette retouche visuelle.
