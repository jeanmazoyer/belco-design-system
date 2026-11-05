# Typographie — Orica
Source : tokens Chakra servis. Fichier : typographie.md

- --chakra-fonts-body = --chakra-fonts-heading = "CentraNo2",system-ui,sans-serif ; --chakra-fonts-mono = SFMono-Regular,Menlo,Monaco,Consolas,"Liberation Mono","Courier New",monospace
- @font-face CentraNo2 : 400 (book), 500 (medium), 700 (bold), 800 (extrabold) — fichiers /orica/fonts/centrano2-*.woff2
- fontSizes : xs 10px · sm 12px · md 13px (défaut html/body) · lg 14px · xl 16px · 2xl 18px · 3xl 20px · 4xl 25px · 5xl 30px · 2xs 0.625rem · 3xs 0.45rem
- fontWeights : normal 400 · medium 500 · semibold 600 · bold 700 · extrabold 800
- lineHeights : none 1 · shorter 1.25 · short 1.375 · base 1.5 · tall 1.625 ; html reset line-height 1.5
- letterSpacings : tighter -0.05em · tight -0.025em · normal 0 · wide 0.025em · wider 0.05em · widest 0.1em

## Usages relevés
- Titre de page (chakra-heading css-13e5vvr) : voir composant Heading ; boutons : fontSizes-lg (14px) weight 500/600 ; onglets : fontSizes-lg weight 500 ; libellés de formulaire : weight 600 ; corps : md (13px).

## Règles
- Une seule famille. Pas de police display, pas de majuscules sur les titres.
- Toujours passer par var(--chakra-fontSizes-*) et var(--chakra-fontWeights-*).
