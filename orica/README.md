# Orica Design System (Belco Hub) — version ISO

Documentation du module Orica du Belco Hub, relevée le 5 novembre 2026 directement dans le code servi par l’application (hub.belco-sandbox.synako.fr). Rien n’est redessiné : les tokens, le CSS Emotion (Chakra UI v2), le HTML et les icônes SVG sont ceux de la production, les données métier sont neutralisées (zéros, « Exemple », « Prénom Nom »).

- index.html : la documentation (aperçus rendus en Shadow DOM avec le CSS de prod), générée par src/build.js
- AGENTS.md : les règles assemblées pour une IA (généré à partir de rules/)
- tokens.css : les 801 variables `--chakra-*` du thème (bloc `:root, :host`) — source de la doc
- changelog.json : les entrées du changelog — source de la doc
- src/ : le build de la doc et le relevé ISO (voir src/README.md)
- base.css : @font-face CentraNo2, reset Chakra et keyframes
- components.css : toutes les règles Emotion relevées (`.css-xxxx`, avec :hover / :focus-visible / :disabled / :active)
- icons.svg : sprite des icônes SVG inline (FontAwesome et Chakra), `<use href="icons.svg#id">`
- rules/*.md : une fiche par fondation et par composant
- samples/*.html : le HTML servi de chaque échantillon, données neutralisées

## Ce qui n’est pas ISO
- Les fichiers de fonte CentraNo2 (woff2) ne sont pas embarqués (licence) : `local("Centra No2")` puis Outfit en secours.
- Les images externes (drapeaux flag-icons sur jsDelivr, sceaux de certification sur Filerobot) sont remplacées par un rectangle neutre dans les aperçus ; le code conserve l’URL d’origine.
- Les listes répétitives sont réduites à trois éléments ; les identifiants (ids, aria-controls, GUID Power BI) sont retirés ou mis à zéro.
- Douze composants Chakra présents dans le CSS mais jamais rencontrés à l’écran sont marqués Soon.

## Prototyper avec une IA
1. Copier AGENTS.md, tokens.css, base.css et components.css à la racine du projet.
2. Dans Claude Code, renommer AGENTS.md en CLAUDE.md ou le référencer depuis CLAUDE.md.
3. Demander : « Fais l’écran X en respectant CLAUDE.md, avec les classes `chakra-*` / `css-*` de components.css et les variables de tokens.css. Les composants marqués Soon ne doivent pas être produits. »

## Chat : faire évoluer le design system depuis la doc, sous garde-fous
Le bouton Chat (en haut à droite, version GitHub Pages) ouvre un assistant qui connaît les tokens, les règles, le CSS relevé et les scores d’audit. Il répond aux questions et prépare des évolutions, sans jamais rien modifier directement :
1. Il lit l’état courant du fichier sur main puis enregistre une **proposition**, affichée avec son diff ; pour les tokens, « Aperçu dans la doc » applique les nouvelles valeurs aux aperçus.
2. Un humain valide avec « Ouvrir la pull request » : une branche `proposition/…` est créée et la PR porte la justification, l’impact sur le thème Chakra d’Orica et une checklist (validé par un designer, répercuté dans le thème).
3. La fusion de la PR régénère la documentation (GitHub Actions) ; la vérification de PR refuse toute modification manuelle des fichiers générés.

Fichiers modifiables : `tokens.css`, `rules/*.md`, `changelog.json`. Tout le reste est généré depuis la production.

Images : on peut coller, glisser ou joindre jusqu’à quatre captures par message (écran, maquette, export Figma) ; elles sont réduites dans le navigateur et envoyées au modèle, qui les compare au relevé. Sur une proposition, une case permet de les joindre à la PR (commises dans `orica/propositions/<branche>/`, donc publiques : pas de données réelles).

Réglages (roue dentée) : une clé API Anthropic et un jeton GitHub fine-grained (Contents + Pull requests en écriture sur ce dépôt), conservés dans le navigateur et envoyés uniquement à api.anthropic.com et api.github.com, sans serveur intermédiaire. Le chat est désactivé dans l’artefact Claude (appels directs bloqués).

Côté GitHub, recommandé : protéger la branche main (pull request obligatoire) et passer la source de Pages sur « GitHub Actions ».

## Mode Play (audit UI)
Le bouton Play en haut à droite de la doc bascule en audit : à gauche, les 21 composants relevés avec un score de fidélité calculé à partir du CSS (tokens 50 %, états 30 %, cohérence des variantes 20 %, pénalités du relevé) ; à droite, un navigateur des écrans d’Orica recomposés à partir du HTML servi. Cliquer un composant surligne ses instances à l’écran ; survoler un élément de l’écran l’identifie, le cliquer sélectionne son composant. Le détail du calcul est dans le bouton « Méthode ».

## Prototypes
- prototypes/dashboard.html : un tableau de bord composé uniquement avec le bundle (shell css-12p9q9f, rail, en-tête, tabs, grille KPI css-123lq1y, panneaux css-1ms5eys, chakra-table, pagination), données fictives. Généré par src/proto-dashboard.js à partir des samples ; 131 classes utilisées, toutes présentes dans components.css. En ligne : https://jeanmazoyer.github.io/belco-design-system/orica/prototypes/dashboard.html
