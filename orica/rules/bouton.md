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
