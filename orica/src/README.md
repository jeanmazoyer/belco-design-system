# Sources de la documentation Orica

`node orica/src/build.js orica` régénère `orica/index.html` et les fichiers dérivés. Lancé automatiquement par GitHub Actions à chaque fusion sur main (`.github/workflows/pages.yml`).

- Sources éditables (par pull request, notamment depuis le chat de la doc) : `orica/tokens.css`, `orica/rules/*.md`, `orica/changelog.json`.
- Relevé ISO de la production : `orica-iso.json` (tokens, règles Emotion, HTML, icônes capturés dans l’application avec `collector.js`). Un nouveau relevé remplace ce fichier.
- Générés, ne pas modifier à la main : `index.html`, `AGENTS.md`, `base.css`, `components.css`, `icons.svg`, `samples/`, `prototypes/dashboard.html`.
- Code de la doc : `build.js` (pages), `audit-build.js` (scores du mode Play), `shell.js/.css` (navigation), `audit.js/.css` (mode Play), `chat.js/.css` (chat → propositions → pull requests), `proto-dashboard.js` (prototype).
