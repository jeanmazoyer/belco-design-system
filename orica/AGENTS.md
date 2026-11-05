# Orica (Belco Hub) — règles pour les IA

Source : hub.belco-sandbox.synako.fr, module Orica, relevé ISO le 5 novembre 2026 (code servi, pas de réécriture).
Stack : React + Chakra UI v2 + Emotion. Tokens : variables CSS --chakra-* (tokens.css). Composants : classes chakra-* + classes Emotion .css-xxxx (components.css).
Fonte : CentraNo2 (400/500/700/800 servies). Fond de page gray-100 #f8f9fa, texte dark-500 #232930, accent primary-500 = orica-500 #127746.
Non relevés (ne pas produire sans capture) : toast, modal de confirmation, tooltip, switch, skeleton, date picker, kanban, stepper, breadcrumbs, import de fichier, number input, popover.

## Comment produire une interface Orica
1. Utiliser les composants Chakra du Hub (<Button>, <Tabs>, <Select>, <Input>, <Checkbox>, <Radio>, <Menu>, <Avatar>, <Table>, <Accordion>, <Drawer>) avec les variantes du thème : les classes Emotion de components.css sont générées par ce thème, ne pas les recopier à la main dans un autre projet.
2. Pour un prototype HTML statique, charger tokens.css + base.css + components.css et réutiliser le HTML de samples/ tel quel.
3. Ne jamais écrire une couleur, un rayon ou une taille en dur : var(--chakra-colors-…), var(--chakra-radii-md), var(--chakra-sizes-10).

## Sommaire
- rules/couleurs.md
- rules/typographie.md
- rules/matieres.md
- rules/bouton.md
- rules/tabs.md
- rules/select.md
- rules/champs.md
- rules/badge.md
- rules/tableau.md
- rules/ecrans.md

---
# Couleurs — Orica (Belco Hub)
Source : variables CSS du thème Chakra UI servi par hub.belco-sandbox.synako.fr (relevé 5 nov. 2026). Fichier : couleurs.md
Utiliser les variables telles quelles : var(--chakra-colors-…). Ne jamais écrire un hex en dur.

## Échelles de marque
- orica / primary (identiques) : 30 #f4f7f7 · 50 #e7f1ed · 100 #b6d5c6 · 300 #60a483 · 500 #127746 (accent Orica) · 600 #106c40 · 700 #0d5432 · 900 #08321d
- blink (module Blink, hors périmètre) : 500 #d65932 · lab (Le Lab, hors périmètre) : 500 #b510a4
- dark (texte) : 500 #232930 = couleur de texte html/body · 400 #4f5459 · alphas dark-500-1 … dark-500-8
- gray / secondary (identiques) : 50 #fafafa · 100 #f8f9fa = fond html/body · 200 #edf0f4 · 300 #e5e9ef · 400 #e0e5ec · 500 #d8dee7 · 600 #c5cad2 · 700 #999ea4 (placeholders) · 800 #777a7f · 900 #5b5d61
- green : 50 #e9f7ef · 100 #bce6ce · 500 #27ae60 · 800 #156035 · 900 #053021 (vert forêt belco.fr)
- error / red : 500 #ff0000 · success-500 #27AE60 · warning-500 #FCFECF · alert #fceac5
- sand : 50 #FBF9F5 (fond belco.fr) · 500 #DEAF58 · ivory-500 #FFFFEC · ivory-600 #F2F0EB
- secondaryGreen 300 #798A72 (sauge) · 500 #4C5439 (mousse) · mossGreen 500 #5E651B · brown 500 #87715F

## Tokens sémantiques métier (badges qualité et statuts)
- terroir 100/500 #F0DBB4 / #DEAF58 · label 100/500 #C8A4A7 / #85333A · labelplus #dcbfad / #b17149 · estate #ECE4D5 / #D5C3A2 · microlot #FFE6BF / #FFC871 · prestige #F9E88D / #F1CB00 · classic #D2EDE0 / #9BD6BB · blend #9E9FA2 / #25292E · nosourcing #9E9FA2 / #25292E
- status-prospect #FBEBDD / #D4690B · status-fournisseur #E0D7EC / #895FBF · status-inactif #FAFED5 / #5E651B
- statuteOffreAchat : recue #53BABA · negociation #895FBF · achetee #4F82BE · nogo #FF0000
- planAchat : pipeline #F85A2F · conversion #895FBF · conversionMuted #E0D7EC
- echantillon-type (offre, pss, arrivage, formation, sav, primeur), scoreMauvais/Moyen/Bon/TresBon, scoringCafeLevel high/mid/low, segmentScoringClient dormant/pepite/strategique : voir tokens.css

## Règles
- Le primaire d'Orica est primary-500 (= orica-500). Les boutons primaires passent en dégradé linear-gradient(135deg, primary-700 → primary-500) au hover et au active.
- Le focus clavier est --chakra-shadows-outline (0 0 0 3px rgba(66, 153, 225, 0.6)) : ne pas le remplacer.
- Texte : dark-500 ; placeholders : gray-700 ; filets : gray-200 à gray-300 ; fond de page : gray-100.
- Le rouge error-500 n'est jamais un fond de bouton ; il sert au texte (« Se déconnecter », astérisque) et aux bordures invalides.
- Pas de mode sombre activé (les règles .chakra-ui-dark existent dans le CSS mais ne sont pas appliquées).

---

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

---

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

---

# Bouton — Orica (chakra-button)
Source : HTML et règles Emotion servies. Fichier : bouton.md

## Variantes relevées (classe Emotion → usage)
- css-umgg81 : primaire. Fond primary-500, texte blanc, hauteur sizes-10, radii-md, font-size lg, weight 500, padding-inline 24px. Hover/active : dégradé 135deg primary-700 → primary-500. Icône via chakra-button__icon (margin-inline-end 0.5rem).
- css-9u5p6t : secondaire (« Filtres »). Fond gray-200, border 1px, hover gray-300. Dans un chakra-button__group attaché.
- css-1mkv6x2 / css-15cs1d / css-1d5dnrm : pied du drawer (Réinitialiser / Appliquer / Supprimer).
- css-dvj57b, css-rs6u5x : boutons texte (« Parcours prospect », « Gérer les tags fournisseur »).
- css-4osav8 : onglet-bouton avec badge compteur (« Fournisseurs et prospects 708 »).
- css-d8378c : choix Univers dans un formulaire (« Café » / « Cacao »).
- css-1j5h8y1 : bouton doux « Ajouter … » des formulaires. css-j45hbs : « Enregistrer ». css-bquyvs : « Importer Excel ». css-x7zswu : « Nouvelle offre ». css-u8ip7p : « Tout fermer / Tout ouvrir ».
- css-684j93 : bouton icône inline (copier) · css-39ivzn : flèches de pagination (disabled → opacity .4) · css-dj65kc : flèche de défilement des filtres · css-1vt6cti : tuile du rail · css-od61ih : retour (page de création) · css-1695t4a : bouton-avatar du menu utilisateur.

## États (communs à toutes les variantes, écrits dans le CSS)
- :focus-visible → box-shadow var(--chakra-shadows-outline)
- :disabled / [aria-disabled=true] → opacity .4, cursor not-allowed, box-shadow none ; hover désactivé → dégradé primary-600 → primary-400 (primaire) ou gray-200 (secondaire)
- transition : var(--chakra-transition-property-common) var(--chakra-transition-duration-normal)

## Règles
- Réutiliser les classes Emotion existantes via le composant React <Button> du Hub ; ne pas recréer de bouton en CSS libre.
- Un primaire par en-tête de page, à droite du titre, avec icône « plus » (FontAwesome circle-plus) à gauche.

---

# Tabs — Orica (chakra-tabs)
Fichier : tabs.md
- chakra-tabs__tablist css-1q9h0zz : flex, overflow scroll sans scrollbar, border-bottom 1px gray-300.
- chakra-tabs__tab css-1wrhscr : weight 500, fontSizes-lg, padding 10px 0, margin-right 30px, border-bottom 2px transparent. [aria-selected=true] → couleur primary-500 et border-color primary-500 ; :active → fond gray-200 ; disabled → opacity .4.
- Les onglets peuvent être des <a> (Références) ou des <button> (Contrats, Plans d'achat). Un badge compteur (chakra-badge) suit le libellé.
## Règles
- Sous l'en-tête de page, avant la barre de filtres. Jamais plus d'un niveau.

---

# Select & menus — Orica
Fichier : select.md
- chakra-select css-mfnris : <select> natif, hauteur sizes-10, radii-md, fond blanc, border 1px, padding-inline-start space-4, icône chevron absolue (chakra-select__icon-wrapper css-iohxn1, 24px). Hover → border gray-100 ; focus-visible → border rgb(49,130,206) ; [aria-invalid] → border red ; disabled → opacity .4.
- chakra-menu__menu-list : panneau des menus (utilisateur, Power BI, filtres Origines) ; items chakra-menu__menuitem / __menuitem-option (css-hu8ktr) avec chakra-menu__icon-wrapper pour la coche.
- Filtres de liste : un chakra-menu__menu-button ouvre une liste d'options cochables avec compteur.
## Règles
- Select natif pour un choix simple ; menu Chakra à options pour le multi-choix avec compteurs.

---

# Champs — Orica (chakra-input, chakra-textarea, chakra-form__label)
Fichier : champs.md
- Recherche : chakra-input__group css-1dg1wqw (min-width 200px) + chakra-input__left-element (loupe 16px) + chakra-input css-gpd2jp (hauteur 2.5em, padding-inline-start 2.5em, radii-md, border gray-200, texte dark-500, placeholder gray-700). Hover → border gray-500 ; focus → border primary-500 et fond gray-50 ; invalid → border red-500.
- Formulaire : chakra-input css-1v4ryj4, chakra-textarea css-1gdsx9s, libellé chakra-form__label (weight 600, astérisque en span requis).
- Cases : chakra-checkbox__control css-j9e2r5 (18px, radii-xs, border primary-500 ; checked → fond primary-500 ; hover checked → primary-600 ; disabled → gray-100). Radio : chakra-radio css-15xz5uj.
## Règles
- Libellé au-dessus, weight 600, astérisque rouge via span. Aide et erreur sous le champ.
- État d'erreur : [aria-invalid=true] (border error-500) existe dans le CSS ; aucun message d'erreur n'a été relevé visuellement.

---

# Badge & tags — Orica
Fichier : badge.md
- chakra-badge css-gb6hna / css-li4vr2 : compteur après un libellé d'onglet (« 708 », « 694 »).
- Tags de référence (chakra-wrap css-ok8zxw > chakra-wrap__list) : spans css-1tzmuxv (poids, process), css-449933 (Microlot), css-iwbke2 (Label), css-p9hk8a (Terroir) — couleurs via tokens microlot / label / terroir.
- Statuts de tableau (Actif / Inactif, Finalisé) : spans dans les cellules, couleurs status-* et tokens sémantiques.
## Règles
- Un tag par qualité, ordre : type de sourcing, label, poids. Couleurs uniquement via les tokens métier (terroir, label, estate, microlot…).

---

# Tableau — Orica (chakra-table)
Fichier : tableau.md
- chakra-table__container css-1nmizk2 > table.chakra-table css-h1zm47 ; thead ; tbody tr css-1jg4rhe (fournisseurs) / css-4tz101 (contrats).
- Cellules : avatar-drapeau (chakra-avatar css-18oor2t) + nom, chips de type, statut, compteurs, colonne d'actions avec boutons icônes.
- Pagination : nav.chakra-stack css-17769tf → texte « n / N » (chakra-text css-ebjc71) + deux chakra-button css-39ivzn (Précédent / Suivant, disabled quand inapplicable).
## Règles
- Première colonne = identité (drapeau + nom), dernière = actions. Pas de bordures verticales.

---

# Écrans — Orica
Fichier : ecrans.md
- Rail : <aside> css-1dn00vq, 64px, tuiles chakra-button css-1vt6cti ; module actif marqué ; avatar utilisateur en bas (chakra-menu).
- En-tête de page : <header> avec chakra-heading css-13e5vvr (titre), radiogroup Univers (css-1laeaix, Café / Cacao), action primaire à droite ; page de création : bouton retour css-od61ih avant le titre.
- Liste : onglets → barre de filtres (chakra-input__group + chakra-select__wrapper × n + chakra-checkbox + bouton Filtres dans un chakra-button__group) → lignes (css-2g5t7v pour les références, chakra-table pour les autres) → pagination.
- Plans d'achat : grille de KPI css-123lq1y > cartes css-qhm6ri (icône, titre, valeur css-1vcnt04, barre empilée css-sm2y2r, légendes), segmented radiogroup css-1g55o27 (Par origines / Par UB / Kanban), accordéons chakra-accordion__item.
- Drawer Filtres : chakra-modal__content css-15u2225 (364px, droite) sur chakra-modal__overlay ; groupes chakra-form-control avec radios / cases ; pied Réinitialiser / Appliquer.
## Règles
- Toujours cet ordre : en-tête, onglets, filtres, contenu, pagination.
