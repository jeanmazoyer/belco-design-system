# Belco Design System

Documentation statique du design system de belco.fr, calquée sur la structure de Geist. Relevé initial le 4 novembre 2026 ; rien n’est inventé, chaque élément vient d’une page du site.

## Contenu
- index.html : la documentation complète (une page, sans serveur ; Barlow Condensed et Outfit en secours de PP Formula et Centra No2)
- AGENTS.md : toutes les règles assemblées, à donner à une IA (Claude Code, Cursor, prompt)
- tokens.css : le bloc :root (couleurs, typographie, espacements, rayons)
- components.css : le CSS de tous les composants (classes .b-*)
- rules/*.md : une fiche de règles par composant et par fondation

## Voir la doc
Ouvrir index.html dans un navigateur, ou la déployer sur Vercel / Netlify / Cloudflare Pages avec un accès restreint (mot de passe ou compte, selon le plan). La page porte noindex, nofollow.

## Prototyper avec une IA
1. Copier AGENTS.md, tokens.css et components.css à la racine du projet.
2. Dans Claude Code, renommer AGENTS.md en CLAUDE.md ou le référencer depuis CLAUDE.md.
3. Demander : « Fais la page X en respectant CLAUDE.md, avec les classes de components.css et les variables de tokens.css. Les composants marqués Soon ne doivent pas être produits. »

## Orica (Belco Hub)
Le dossier orica/ contient la documentation du module Orica du Belco Hub, en version ISO : tokens, CSS Emotion, HTML et icônes relevés dans le code servi par l’application, données neutralisées. Voir orica/README.md. En ligne : https://jeanmazoyer.github.io/belco-design-system/orica/
