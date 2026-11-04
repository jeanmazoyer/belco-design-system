# Couleurs
Statut : relevé sur belco.fr (styles calculés). Fichier : couleurs.md

## Palette
forest-900 #053021 · forest-600 #5B766B · moss-700 #4C5439 · sage-500 #798A72
flame-500 #F85A2F · flame-600 #DE4A22
white #FFFFFF · sand-50 #FBF9F5 · sand-100 #F2F0EB · stone-200 #E8E8E8 · cream-50 #FFFFEC

## Rôles (les composants n'utilisent que ceux-ci)
- --color-background → sand-50 : fond de toutes les pages
- --color-surface → sand-100 : champs, recherche, encarts
- --color-surface-inverse → forest-900 : hero, footer, bandeaux sombres
- --color-text → forest-900 ; --color-text-muted → forest-600 ; --color-text-inverse → cream-50
- --color-border → stone-200 : filets, contours
- --color-primary → flame-500 ; --color-primary-hover → flame-600 ; --color-primary-foreground → sand-50
- --color-secondary → forest-900 ; --color-secondary-foreground → cream-50
- --color-accent-moss → moss-700 ; --color-accent-sage → sage-500 : cartes et aplats

## Règles
- Une seule surface flamme (CTA principal) par écran ; tout le reste est vert forêt, sable ou filet.
- Jamais de hex en dur dans un composant : passer par un rôle.
- Texte sur vert forêt : toujours cream-50, jamais blanc pur.
- Pas de mode sombre : le site n'en a pas.
- flame-600 et forest-600 sont dérivées (hover, texte secondaire), elles n'existent pas dans le CSS du site.
