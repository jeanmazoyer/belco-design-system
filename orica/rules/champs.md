# Champs — Orica (chakra-input, chakra-textarea, chakra-form__label)
Fichier : champs.md
- Recherche : chakra-input__group css-1dg1wqw (min-width 200px) + chakra-input__left-element (loupe 16px) + chakra-input css-gpd2jp (hauteur 2.5em, padding-inline-start 2.5em, radii-md, border gray-200, texte dark-500, placeholder gray-700). Hover → border gray-500 ; focus → border primary-500 et fond gray-50 ; invalid → border red-500.
- Formulaire : chakra-input css-1v4ryj4, chakra-textarea css-1gdsx9s, libellé chakra-form__label (weight 600, astérisque en span requis).
- Cases : chakra-checkbox__control css-j9e2r5 (18px, radii-xs, border primary-500 ; checked → fond primary-500 ; hover checked → primary-600 ; disabled → gray-100). Radio : chakra-radio css-15xz5uj.
## Règles
- Libellé au-dessus, weight 600, astérisque rouge via span. Aide et erreur sous le champ.
- État d'erreur : [aria-invalid=true] (border error-500) existe dans le CSS ; aucun message d'erreur n'a été relevé visuellement.
