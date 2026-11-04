# Orica (Belco Hub) — règles pour les IA

Source : hub.belco-sandbox.synako.fr, module Orica, relevé le 4 novembre 2026. Styles et composants uniquement ; aucune donnée métier.
Fonte : Centra No2, corps 13 px. Primaire vert #127746. Fond gris #F8F9FA, surfaces blanches, ombres à 5 %.
Tokens CSS : voir tokens.css. Composants : components.css (classes .o-*).
Non relevés (ne pas les produire sans capture) : Terminal, Breadcrumbs, Carte géographique, Date picker, Kanban, Modal, Skeleton, Stepper, Switch, Toast, Tooltip, Import de fichier.

## Sommaire
- rules/couleurs.md
- rules/typographie.md
- rules/matieres.md
- rules/shell.md
- rules/bouton.md
- rules/badge.md
- rules/choix.md
- rules/recherche.md
- rules/saisie.md
- rules/select.md
- rules/filtres.md
- rules/tabs.md
- rules/tableau.md
- rules/ligne.md
- rules/avatar.md
- rules/kpi.md
- rules/accordeon.md
- rules/pagination.md
- rules/vide.md

---
# Couleurs — Orica (Belco Hub)
Statut : relevé sur hub.belco-sandbox.synako.fr, module Orica (styles calculés). Fichier : couleurs.md

## Palette
grey-50 #F8F9FA (fond) · grey-100 #EDF0F4 (surface, filets légers, en-têtes de tableau) · grey-150 #E5E9EF · grey-200 #D8DEE7 (filets) · grey-300 #C5CAD2 · grey-500 #999EA4 · grey-600 #777A7F · grey-700 #4F5459 · grey-900 #232930 (texte)
green-600 #127746 (primaire Orica) · green-50 #E7F1ED · green-100 #BCE6CE · green-700 #156035 · green-800 #0D5432
blue-100 #BEE3F8 / blue-800 #2A4365 (info) · yellow-100 #FFF8DB / yellow-800 #806600 (attente) · red-500 #FF0000 (danger, texte seulement)
Badges qualité : sand-200 #F0DBB4 · clay-200 #DCBFAD · gold-400 #DEAF58 · brown-500 #B17149

## Rôles
--color-background → grey-50 ; --color-surface → grey-100 ; --color-surface-strong → grey-150
--color-text → grey-900 ; --color-text-muted → grey-600 ; --color-text-faint → grey-500
--color-border → grey-200 ; --color-border-light → grey-100
--color-primary → green-600 ; --color-primary-soft → green-50 ; --color-primary-foreground → white
--color-success-soft/text → green-100 / green-700 ; --color-info-soft/text → blue-100 / blue-800 ; --color-warning-soft/text → yellow-100 / yellow-800 ; --color-danger → red-500

## Règles
- Le vert #127746 est la couleur d'Orica. Les autres modules du Hub ont leur propre accent (Blink orange #D65932, Le Lab magenta #B510A4) : hors périmètre, ne pas les mélanger.
- Un seul bouton primaire vert par en-tête de page.
- Le rouge n'est jamais un fond : texte seulement (« Se déconnecter », astérisque obligatoire).
- Statuts : pilule pleine (vert / gris) pour actif / inactif ; chips pastel (vert, bleu, jaune, gris) pour les étapes d'un flux.
- Pas de mode sombre.

---

# Typographie — Orica
Statut : relevé sur le Hub. Fichier : typographie.md

## Famille
Centra No2 uniquement (Book 400, Medium 500, Semibold 600, Bold 700, ExtraBold 800). Oswald et Open Sans sont chargées par l'app mais jamais utilisées dans les styles calculés : ne pas les employer.
Fallback : Outfit.

## Échelle (px / interlignage)
Titre de page 25/30 Bold · Titre de carte 16/24 Bold · Libellé de formulaire 14/20 Semibold · Bouton 14 Medium ou Semibold · Corps 13/19.5 Book · Aide 12/16 · En-tête de tableau et badges 10 Book à Bold

## Règles
- Jamais de majuscules sur les titres ; capitales seulement sur les micro-libellés de 10 px.
- Le corps est en 13 px : c'est un outil de travail dense, pas un site.
- Chiffres tabulaires dans les tableaux, KPI et compteurs.

---

# Matières — Orica
Statut : relevé sur le Hub. Fichier : matieres.md

## Surfaces
- .m-page-card : blanc, rayon 13 px, ombre sm → cartes de page, formulaires, KPI
- .m-row : blanc, filet grey-100 en bas → lignes de liste et de tableau
- .m-field : blanc, filet grey-100, rayon 7.8 px → champs de formulaire
- .m-control : blanc, filet grey-100, rayon 10.4 px → boutons, selects, recherche
- .m-tile : grey-100, rayon 10.4 px → tuile active de la barre latérale, boutons doux

## Flottants
- .m-menu : blanc, filet, rayon 10.4 px, ombre md → menus déroulants
- .m-drawer : blanc, ombre lg, 364 px à droite, sur un voile noir à 48 % → panneau Filtres
- Modal et tooltip : non relevés (Soon)

## Rayons
2.6 · 5.2 (chips, badges, choix) · 7.8 (champs) · 10.4 (boutons, selects, cartes KPI) · 13 (cartes de page) · pilule (statuts, avatars, pagination)

## Ombres
sm 0 2px 4px rgba(16,15,15,.05) · md 0 4px 12px rgba(16,15,15,.05) · lg 0 32px 64px + 0 -16px 32px rgba(16,15,15,.05)

## Règles
- Les ombres existent mais restent presque invisibles (5 %) : elles séparent, elles ne décorent pas.
- Une surface blanche posée sur le gris de page = un contenu ; le gris-100 = en-tête, filtre ou outil.

---

# Coquille & en-tête — Orica
Statut : relevé sur tous les écrans. Fichier : shell.md

- .o-env : bandeau vert 20 px en haut (« Ceci est un environnement de démo »).
- .o-rail : barre latérale 64 px blanche, tuiles 46 px rayon 10.4 ; active : fond grey-150, icône foncée ; en bas, avatar utilisateur.
- .o-pagehead : 65 px, titre Bold 25 + segment univers Café / Cacao, primaire à droite ; sur une page de création, flèche retour .o-back avant le titre.

## Règles
- Ordre du rail Orica : Références, Fournisseurs, Plans d'achat, Direct Trade, Contrats d'achat, Géographie, Spécifications, Glossaire.
- Les onglets de la liste viennent sous l'en-tête, puis la barre de filtres, puis la liste.

---

# Bouton — Orica
Statut : relevé sur le Hub (toutes les listes, formulaire fournisseur). Fichier : bouton.md

## Classes
- .o-btn : primaire vert #127746, blanc, 33 px, rayon 10.4, Medium 14 (« Nouvelle référence », « Nouveau fournisseur »).
- .o-btn--lg : 39 px, Semibold (actions d'en-tête de page).
- .o-btn--secondary : gris #E5E9EF, filet grey-200 (« Importer Excel »).
- .o-btn--soft : gris #EDF0F4 sans filet, avec icône + (« Ajouter une adresse », « Ajouter un contact », « Ajouter un rôle »).
- .o-btn--outline : filet texte, fond transparent.
- .o-btn--ghost : texte seul (« Parcours prospect », « Gérer les tags »).
- .o-btn--danger-text : texte rouge (« Se déconnecter »).
- .o-btn--icon : carré 33 px pour une icône seule.
- .o-help : bouton flottant « Aide » noir, en bas à droite de chaque écran.

## Règles
- Un seul primaire par en-tête de page, aligné à droite du titre.
- Les actions de formulaire « Ajouter … » sont des boutons doux avec +, jamais des primaires.
- Pas de bouton en majuscules ; libellé en Medium 14.

---

# Badge & statut — Orica
Statut : relevé sur le Hub (références, fournisseurs, contrats, direct trade). Fichier : badge.md

## Classes
- .o-status : pilule pleine 20 px, Bold 10 : vert = actif, .o-status--off gris = inactif / archivé.
- .o-tag : chip 21 px rayon 5.2, Medium 10, gris par défaut ; --success (vert pâle), --success-strong (vert plus foncé, texte vert 800), --info (bleu pâle), --warning (jaune pâle), --faint (gris très clair), --dark (noir, « Sourcing Exclusive »).
- Badges qualité : --sand, --clay, --gold, --brown (poids, labels de dégustation).
- .o-count : compteur 20 px gris Semibold 10 (après un titre d'onglet : « Fournisseurs 694 »).

## Règles
- Pilule pleine = état binaire ; chip pastel = étape d'un flux (brouillon, soumis, validé…).
- Les badges d'une ligne se rangent à droite, par ordre : qualité, label, poids.
- Jamais plus de quatre badges par ligne.

---

# Chips de choix — Orica
Statut : relevé sur le formulaire « Nouveau fournisseur ». Fichier : choix.md

- .o-choices : rangée de .o-choice (39 px, rayon 5.2, fond grey-50, filet grey-100, icône + libellé Medium 14).
- Sélection : .is-on → fond vert pâle, filet vert, texte vert 800.
- Valeurs du site : Univers (Café, Cacao) ; Types juridiques (Privé, Public, Association, Coopérative, Institution, ONG).

## Règles
- Choix unique ou multiple selon le champ ; le libellé du champ porte l'astérisque si requis.
- Icône à gauche, 16 px.

---

# Champ de recherche — Orica
Statut : relevé sur toutes les listes. Fichier : recherche.md

- .o-search : 33 px, blanc, filet grey-100, rayon 10.4, loupe grise à gauche, placeholder gris clair (« Rechercher une référence… »).
- Placé en tête de la barre de filtres, juste après le compteur.

## Règles
- La recherche filtre la liste en direct ; pas de bouton.
- Largeur 200 à 360 px dans la barre, 100 % sur mobile.

---

# Champ de saisie — Orica
Statut : relevé sur « Nouveau fournisseur ». Fichier : saisie.md

- .o-field : libellé Semibold 14 avec astérisque rouge si requis, champ, aide 12 px.
- .o-input : 33 px, blanc, filet grey-100, rayon 7.8, 13 px. .o-textarea : 80 px min.
- .o-form-card : carte blanche rayon 13, ombre sm, 560 px max, sections empilées (gap 20).
- Libellés relevés : Raison sociale*, Univers*, Flo ID, Partenaire depuis, Adresse principale*, Contact*, Roles*, Types juridiques, Commentaire.

## Règles
- Un formulaire = une page avec flèche retour + titre, jamais une modale (non relevée).
- Les sous-objets (adresse, contact, rôle) s'ajoutent par bouton doux « Ajouter … ».
- État d'erreur : non relevé (Soon).

---

# Select & menus — Orica
Statut : relevé sur toutes les listes. Fichier : select.md

- .o-select : pilule 33 px blanche, filet grey-100, rayon 10.4, libellé + chevron (« Origines », « Statuts », « Crop »).
- .o-menu : panneau blanc rayon 10.4 ombre md, lignes 29 px ; cases .o-check (15 px, vert) avec compteur à droite ; liens ou boutons pour les menus d'action (« Nouveau fournisseur », « Nouveau prospect », « Se déconnecter » en rouge).
- .o-radio : 15 px, point vert.

## Règles
- Multi-sélection = cases + compteurs ; sélection simple = radios.
- Le menu utilisateur (avatar) contient langue (Français, English, Español) et déconnexion.

---

# Barre de filtres & panneau — Orica
Statut : relevé sur références, fournisseurs, contrats, direct trade. Fichier : filtres.md

- .o-filterbar : compteur (.o-count) → recherche → selects → case « Inclure … » → bouton « Filtres » (.o-btn--soft) → à droite, actions secondaires.
- .o-drawer : panneau 364 px à droite, en-tête 52 px avec titre et fermeture, groupes de cases ou radios, pied avec « Réinitialiser » et « Appliquer » ; voile rgba(0,0,0,.48).
- Groupes relevés : Type de café, Type de sourcing (Direct Trade, Cross Trade, Sourcing Exclusive, Alpha), Produits visibles sur Belco.fr, Produits en sommeil, Sourcing steps, Impact score, Due diligence (À soumettre, Soumise, Validée, Rejetée), UB.

## Règles
- Les filtres fréquents sont dans la barre ; les rares dans le panneau.
- Le compteur de résultats se met à jour à chaque filtre.

---

# Tabs & segmented — Orica
Statut : relevé sur fournisseurs, contrats, plans d'achat. Fichier : tabs.md

- .o-tabs / .o-tab : onglets soulignés 43 px, Medium 14, actif en vert avec trait de 2 px ; compteur .o-count après le libellé (« Fournisseurs 694 », « Prospects 14 », « Brouillons 9 »).
- .o-seg : segmented control fond gris, segment actif noir (« Par origines / Par UB / Kanban », « Liste / Calendrier »).
- Univers : segment « Café / Cacao » dans l'en-tête de page.

## Règles
- Onglets = sous-ensembles d'une même liste ; segmented = autre vue des mêmes données.
- L'onglet actif est vert, jamais souligné en gris.

---

# Tableau — Orica
Statut : relevé sur fournisseurs, contrats, direct trade, spécifications, glossaire. Fichier : tableau.md

- .o-tablewrap > .o-table : en-tête gris-100, texte grey-700 10 px Book ; lignes 46 px, filet grey-100, survol gris de page.
- Cellules : .cell-title (Semibold) + .cell-sub (10 px gris) ; .num aligné à droite tabulaire ; .actions à droite avec .o-icon-btn (24 px, rayon 5.2 ; --warning or, --danger brun, --success vert).
- Colonnes relevées (contrats) : Créé le, BTB, Désignation, Embarquement, POL / POD, Produits · Volume · Montant, Statut.

## Règles
- Première colonne = identité (avatar ou drapeau + nom) ; dernière = statut puis actions.
- Pas de bordures verticales ; le survol suffit à suivre la ligne.
- Pagination « n / N » avec flèches rondes, à droite sous le tableau.

---

# Ligne de référence — Orica
Statut : relevé sur l'écran Références. Fichier : ligne.md

- .o-list > .o-ref : grille 32 px (drapeau) · contenu · badges ; code 10 px gris clair, nom Semibold 13, triplet de stats (Qté actuel, Qté retenu, Position stock) ; badges qualité et poids à droite.

## Règles
- Le drapeau de l'origine remplace la photo.
- Trois statistiques maximum sous le nom, toujours dans le même ordre.
- La ligne entière est cliquable.

---

# Avatar — Orica
Statut : relevé dans le menu utilisateur et les listes. Fichier : avatar.md

- .o-avatar : rond 32 px gris clair avec initiales Semibold 12 ; --user : vert avec initiales blanches ; --flag : drapeau emoji 16 px ; --sm : 24 px.

## Règles
- Initiales (deux lettres) tant qu'il n'y a pas de photo.
- Dans un tableau, 24 px ; dans l'en-tête, 32 px.

---

# Cartes KPI & progression — Orica
Statut : relevé sur Plans d'achat. Fichier : kpi.md

- .o-kpis : grille de .o-kpi (carte blanche rayon 13, ombre sm) : icône + libellé 12 px, valeur Bold 25 tabulaire, barre .o-progress, deux sous-valeurs 10 px.
- .o-progress : 6 px, fond gris, remplissage vert ; --info bleu, --warning or ; --sm 4 px dans les lignes.

## Règles
- Quatre KPI maximum en tête d'écran.
- La barre montre toujours réalisé / objectif, jamais une valeur seule.

---

# Accordéon — Orica
Statut : relevé sur Plans d'achat (groupes par origine). Fichier : accordeon.md

- .o-acc : carte blanche, groupes <details> ; en-tête 46 px avec chevron, nom Semibold 13, méta à droite (volumes tabulaires) ; lignes enfant en grille (nom, volume, objectif, action).
- .o-acc-tools : « Tout fermer » / « Tout ouvrir » en vert au-dessus.

## Règles
- Un niveau d'imbrication maximum.
- L'action de ligne (« Nouvelle offre ») est un bouton doux, pas un primaire.

---

# Pagination — Orica
Statut : relevé sous les tableaux (contrats, spécifications, géographie). Fichier : pagination.md

- .o-pager : « 1 / 1 » Medium 12 gris + deux flèches rondes 22 px ; flèche désactivée à 40 %.

## Règles
- Alignée à droite, sous le tableau.
- Les listes de références chargent en continu : pas de pagination là.

---

# État vide — Orica
Statut : relevé sur Géographie (« Aucune région trouvée ») et Clients. Fichier : vide.md

- .o-empty : carte blanche, picto rond vert pâle 40 px, texte gris 12 px.

## Règles
- Dire ce qui est vide et, si possible, proposer l'action de création.
