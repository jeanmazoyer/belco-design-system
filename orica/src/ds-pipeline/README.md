# Pipeline Design System Hub → ds-source.json

Le code source du DS (paquet `design-system-hub`, reçu en zip) n’est pas versionné dans ce dépôt public. Ce pipeline le lit localement et produit `orica/src/ds-source.json`, que `build.js` consomme.

```
npm install --legacy-peer-deps
export DS_SRC=/chemin/vers/design-system-hub/src
node bundle-theme.js $DS_SRC        # thème Chakra → out/theme.cjs + out/theme-vars.json (tokens via toCSSVar)
node render-stories.js $DS_SRC      # chaque *.stories.tsx rendue en React SSR avec le vrai thème → out/stories.json (HTML + CSS Emotion)
node normalize-css.js               # CSS normalisé par le CSSOM de Chromium, comme le relevé prod → out/ds-rules.json
node gen-ds-source.js $DS_SRC       # tokens, structure du thème, stories, correspondance prod ↔ DS → out/ds-source.json
cp out/ds-source.json ../ds-source.json && node ../build.js ..
```

Ce qui est publié : les rendus (HTML + CSS générés), la structure du thème (variantes, tailles, défauts, schémas) et les tokens. Pas le code TypeScript du DS.

Stories non rendues : celles qui dépendent de l’API Belco (api-types, halitrek) ou de dépendances absentes.
