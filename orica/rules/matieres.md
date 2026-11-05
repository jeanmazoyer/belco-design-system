# Matières — Orica
Source : tokens Chakra servis. Fichier : matieres.md

- radii : xs 0.2rem · sm 0.4rem · base 0.6rem · md 0.8rem (boutons, selects, inputs) · lg 1rem · xl 1.2rem · 2xl 1.4rem · 3xl 1.6rem · full 9999px (rem sur base 13px : md = 10.4px, sm = 5.2px, xs = 2.6px)
- shadows : xs 0px 2px 4px 0px #100F0F0D · sm 0px 4px 12px 0px #100F0F0D · md 0px 8px 16px 0px #100F0F0D,0px -4px 8px 0px #100F0F0D · lg 0px 32px 64px 0px #100F0F0D,0px -16px 32px 0px #100F0F0D (drawer) · outline 0 0 0 3px rgba(66, 153, 225, 0.6) (focus) · xs-top 0px -2px 4px 0px #100F0F0D ; couleur d'ombre --chakra-colors-shadow #100F0F0D
- space : 1 0.25rem … 96 24rem (échelle Chakra standard, base 13px) ; sizes : 10 = 2.5rem = 32.5px (hauteur des boutons, inputs, selects)
- borders : 1px / 2px / 4px / 8px solid ; border-color par défaut --chakra-colors-chakra-border-color → gray-200
- zIndices : dropdown 1000 · sticky 1100 · overlay 1300 · modal 1400 (drawer Filtres) · popover 1500 · toast 1700 · tooltip 1800
- transitions : property-common background-color,border-color,color,fill,stroke,opacity,box-shadow,transform ; duration normal 200ms, fast 150ms
- breakpoints : sm 451px · md 901px · lg 1281px · xl 1401px · 2xl 1601px

## Règles
- Les ombres sont toutes à 5 % d'opacité (#100F0F0D) : elles séparent, elles ne décorent pas.
- radii-md partout sur les contrôles ; radii-full pour les avatars et pastilles.
- Le drawer utilise zIndices-modal et shadows-lg sur un overlay blackAlpha-600 (rgba(0, 0, 0, 0.48)).
