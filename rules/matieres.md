# Matières
Statut : relevé sur belco.fr. Fichier : matieres.md

## Surfaces (posées sur la page)
- .m-card : blanc, filet --color-border, rayon 20 px → cartes produit, cartes service
- .m-field : sable, sans filet au repos, rayon 6 px → champs, recherche
- .m-encart : sable, rayon 12 px → bandeaux, encarts
- .m-inverse : vert forêt, texte crème, rayon 20 px → hero, bandeaux sombres
- .m-pill : rayon plein → boutons, badges, filtres, onglets

## Flottants (au-dessus de la page)
- .m-menu : blanc, filet, rayon 12 px → menus de filtres
- tooltip, modal : non relevés (Soon)

## Rayons
radius-sm 6 · radius-md 12 · radius-lg 20 · radius-full 9999

## Règles
- Aucune ombre : la hiérarchie se fait par la couleur de surface et les filets.
- Rayon plein = action ou étiquette ; 20 px = carte ; 12 px = image, encart, menu ; 6 px = champ.
- Filet standard 1 px --color-border ; filet fort 1 px --color-text (bouton contour, champ au focus).
- Grille d'espacement de 4 px (spacing-1 à spacing-24, 4 → 96 px).
