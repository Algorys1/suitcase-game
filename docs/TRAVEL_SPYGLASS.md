# Longue-vue de voyage — 13 novembre 2026

Direction autorisée par le joueur : remplacer l'accès « Explorer » générique par un véritable objet de voyage. Première réalisation intégrée, à essayer ; aucune modification des activités, recettes, charges ou sauvegardes.

## Présentation

Longue-vue peinte en laiton et cuir brun, lentille turquoise, posée en diagonale sur le coin inférieur droit de l'illustration. Une petite étiquette attachée porte « Explorer » / « Explore » en permanence, y compris sur mobile. L'ancien bouton papier est retiré ; le retour à la carte ou au sommaire reste séparé et centré.

Même objet sur l'arrivée et les fiches du carnet. À l'arrivée, pose en 360 ms ; au survol, soulèvement de 3 px ; à l'activation, reflet de 180 ms avant l'ouverture du paysage. Souris, toucher et clavier utilisent la même action verrouillée contre les répétitions. Le curseur reste normal ; aucun repère n'est ajouté dans les paysages d'exploration.

Zones d'activation de 48 px minimum et focus visible. Avec le mouvement réduit, pose, soulèvement et reflet sont supprimés ; l'activation est immédiate. Le changement de préférence en cours termine les effets. Écouteurs et tweens de l'objet sont nettoyés à sa destruction.

## Asset et intégration

- Source PNG transparente et prompt : [travel-spyglass-v2](../designs/preparation/travel-spyglass-v2/prompt.json), outil image_gen intégré.
- Export WebP RGBA 384 × 256, 15 460 octets : `public/assets/adventure/travel-spyglass.webp`. Réduction technique et encodage via Canvas ; alpha conservé.
- `travelSpyglass.ts` : dessin, étiquette, interactions et effets.
- Chargement à la demande dans `ResultScene` et `JournalEntryScene`, jamais dans l'accueil. Texture cadrée sur l'alpha et mipmappée par le traitement existant ; chemins relatifs conservés.
- `ResultScene` utilise les contrôles accessibles communs ; le carnet conserve ses commandes de pagination et sa navigation clavier.

## Vérifications locales

Build TypeScript strict/Vite réussi. Chrome sur build sous `/jam/` : FR 960 × 540, 640 × 360 et 360 × 640 ; EN 320 × 568, toucher simulé sur les portraits. Voyages réels, arrivées avec/sans aide, ancienne commande retirée, activation de la longue-vue, fiche du carnet, accès au clavier et mouvement réduit vérifiés. Charges conservées à 9 lors des ouvertures d'exploration. Captures paysage et portrait inspectées ; aucune erreur JavaScript/HTTP. Script local : `.tmp/spyglass-qa.mjs`.

Pas de nouvelle suite métier pour cette modification de présentation. Tactile physique, Firefox, iframe itch.io et agrément restent à vérifier avec le joueur.

## Correction après essai

Le cadre brun au survol est supprimé ; seul le focus clavier conserve un repère. L’étiquette reste inchangée. Nouveau dessin v2 : tube sur un axe cohérent, objectif visible et ouverture de l’oculaire cachée à l’autre extrémité. Sources/prompts v1 conservés pour historique, v2 en production. Alpha conservé et réduction sans déformation. Build réussi et captures ciblées Chrome FR 960 × 540 au survol, EN 320 × 568 inspectées ; activation vers exploration et conservation des charges vérifiées sans erreur JavaScript/HTTP. Pas de suite complète relancée pour cette retouche.

La perspective corrigée et le retrait du cadre de survol sont appréciés par le joueur (« Super beaucoup mieux »), qui demande ensuite le commit.
