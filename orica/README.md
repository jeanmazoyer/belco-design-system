# Orica Design System (Belco Hub) — version ISO

Documentation du module Orica du Belco Hub, relevée le 5 novembre 2026 directement dans le code servi par l’application (hub.belco-sandbox.synako.fr). Rien n’est redessiné : les tokens, le CSS Emotion (Chakra UI v2), le HTML et les icônes SVG sont ceux de la production, les données métier sont neutralisées (zéros, « Exemple », « Prénom Nom »).

- index.html : la documentation (aperçus rendus en Shadow DOM avec le CSS de prod)
- AGENTS.md : les règles assemblées pour une IA
- tokens.css : les 801 variables `--chakra-*` du thème (bloc `:root, :host`)
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

## Prototypes
- prototypes/dashboard.html : un tableau de bord composé uniquement avec le bundle (shell css-12p9q9f, rail, en-tête, tabs, grille KPI css-123lq1y, panneaux css-1ms5eys, chakra-table, pagination), données fictives. Généré par prototypes/build-dashboard.js à partir des samples ; 131 classes utilisées, toutes présentes dans components.css. En ligne : https://jeanmazoyer.github.io/belco-design-system/orica/prototypes/dashboard.html
