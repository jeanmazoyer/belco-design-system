# Belco Design System — règles pour les IA

Source : belco.fr, relevé le 4 novembre 2026. Rien n'est inventé : chaque règle vient d'une page du site.
Fonts : PP Formula (titres, majuscules) et Centra No2 (texte). Pas de mode sombre. Aucune ombre.
Tokens CSS : voir tokens.css (variables --color-*, --font-*, --text-*, --leading-*, --radius-*, --spacing-*).
Composants pas encore relevés (ne pas les produire sans capture du site) : Terminal, Avatar, Calendrier, Drawer, Erreur, Modal, Pagination, Progress, Slider, Switch, Table, Téléphone, Textarea, Toast, Tooltip.

## Sommaire
- rules/couleurs.md
- rules/typographie.md
- rules/fonts.md
- rules/matieres.md
- rules/bouton.md
- rules/badge.md
- rules/chip.md
- rules/recherche.md
- rules/saisie.md
- rules/filtres.md
- rules/menu.md
- rules/case.md
- rules/choicebox.md
- rules/collapse.md
- rules/description.md
- rules/breadcrumbs.md
- rules/bandeau.md
- rules/statut.md
- rules/stepper.md
- rules/tabs.md
- rules/toggle.md
- rules/comparateur.md
- rules/skeleton.md
- rules/scroller.md
- rules/pictos.md
- rules/vide.md
- rules/carte.md

---
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

---

# Typographie
Statut : relevé sur belco.fr. Fichier : typographie.md

## Familles
- Titres : PP Formula (Condensed Black 900 ; le site la déclare 800). Majuscules, interlignage 1:1, pas d'interlettrage.
- Texte : Centra No2 (Book 400, Medium 500, Bold 700, ExtraBold 800). Corps par défaut 14 / 21 px sur le site.
- Fallbacks : Barlow Condensed 900, Outfit (le site charge aussi Outfit et Lexend Deca).

## Échelle (px / interlignage)
Display XL 80/76 · Display L 56/56 · Display M 42/42 · Heading 32/32 (PP Formula)
Title 24/30 Bold · Body L 18/28 · Body 16/24 · Body S 14/20 · Label 12/16 Medium majuscules tracking 0.06em (Centra No2)

## Règles
- Tout titre h1/h2/h3 est en PP Formula majuscules ; jamais de PP Formula en bas de casse ni en corps de texte.
- Centra Medium pour les libellés et noms de produits, Bold pour les boutons et les valeurs, Book pour le courant.
- Texte courant limité à ~66 caractères par ligne.
- Pas de texte sous 12 px ; 12 px uniquement en majuscules avec tracking-wide.

---

# Fonts
Statut : relevé sur belco.fr. Fichier : fonts.md

- --font-display: "PP Formula Condensed", "PP Formula", "Barlow Condensed", Impact, sans-serif
- --font-sans: "Centra No2", "CentraNo2", "Outfit", system-ui, sans-serif

## Règles
- Les fichiers de fontes sont sous licence (Pangram Pangram, Colophon) : ne pas les embarquer sans accord Belco.
- Toujours déclarer les fallbacks ci-dessus.
- Utiliser des px pour les corps, des em pour l'interlettrage, des px pour l'interlignage.

---

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

---

# Bouton
Statut : relevé sur belco.fr (accueil, catalogue, connexion). Fichier : bouton.md

## Classes
- .b-btn : primaire, flamme, texte sable. Hover : flame-600.
- .b-btn--secondary : vert forêt, texte crème.
- .b-btn--outline : transparent, filet 1 px --color-text. Hover : fond sable.
- .b-btn--cream : crème sur fond vert forêt.
- .b-link : lien souligné, Bold 14, flèche → en fin de libellé.
- Tailles : .b-btn--s 36 px · défaut 44 px · .b-btn--l 52 px (16 px de corps). .b-btn--block pleine largeur.
- Désactivé : [disabled] → fond --color-border, texte blanc (ex. « Commander » quand les prix sont masqués).

## Règles
- Une seule pilule flamme par écran : l'action principale. Les autres actions sont secondaires (vert forêt), contour ou lien.
- Libellé en Centra Bold 14, jamais en majuscules, verbe à l'infinitif ou substantif court (« Devenir client », « Se connecter », « En savoir + »).
- Toujours une pilule (radius-full), jamais de coins carrés.
- Sur fond vert forêt : .b-btn--cream ou .b-btn, jamais .b-btn--secondary.
- Pas d'icône dans les boutons relevés ; si besoin, 18 px, à gauche, gap 8 px.

---

# Badge
Statut : relevé sur belco.fr (cartes café, fiche café, catalogue équipement). Fichier : badge.md

## Classes
- .b-badge : flamme (« Nouveau »). Majuscules 12 px Bold, tracking 0.06em, hauteur 28 px.
- .b-badge--forest (« Spot », « Microlot ») · --moss (« Café de forêt ») · --sage (« À la voile ») · --outline (« Bio ») · --surface (« Bientôt disponible », « Dernières unités »)
- .b-badge--meta : blanc filet, 24 px, Medium, posé sur la photo (« 600 kg · Bolivie »).
- .b-score : pastille vert forêt avec la note SCA (« 82.5 »), chiffres tabulaires.

## Règles
- Deux badges maximum par carte.
- Un badge informe, il ne se clique pas ; pour une action, utiliser un bouton ; pour un filtre, une chip.
- Flamme réservée à la nouveauté ou à l'alerte, pas à la catégorie.

---

# Chip
Statut : relevé sur belco.fr (fiche café, catalogue équipement). Fichier : chip.md

## Classes
- .b-chip : pilule blanche filet, Medium 14, hauteur 32 px, cliquable. Sélectionnée : .is-on (vert forêt, texte crème).
- .b-chip small : compteur de résultats (« Nouveautés 107 »).
- .b-chip--note : non cliquable, sable, pour les notes aromatiques et les tags de carte (« Lavé », « Blend de variétés »).

## Règles
- Chip = valeur sélectionnable ou tag descriptif ; badge = statut.
- Les variantes produit (« 450 ml », « 1 tasse(s) ») sont des chips, une seule sélectionnée à la fois.
- Les couleurs par famille aromatique de la fiche café restent à relever.

---

# Champ de recherche
Statut : relevé sur belco.fr (header, blog). Fichier : recherche.md

- .b-search : pilule sable 48 px, icône loupe 18 px à gauche, placeholder en texte atténué.
- Focus : fond blanc, filet 1 px --color-text.
- Placeholder du site : « Cherchez un produit, une origine, un producteur… »

## Règles
- Une seule recherche globale, dans le header, largeur 320–420 px ; dans la barre haute d'une doc, 40 px de haut.
- Pas de bouton « Rechercher » : la touche Entrée suffit.

---

# Champ de saisie
Statut : relevé sur belco.fr (newsletter, connexion). Fichier : saisie.md

- .b-field : libellé Medium 14 au-dessus, champ, aide 12 px atténuée en dessous.
- .b-input : 48 px, sable, rayon 6 px, sans filet au repos ; focus : blanc + filet --color-text.
- .b-input-group : champ pilule à gauche + bouton vert forêt accolé à droite (newsletter « S'inscrire »).

## Règles
- Libellé toujours visible au-dessus (sauf la connexion Auth0, qui utilise un label flottant).
- Aide et erreur sous le champ, jamais en placeholder.
- État d'erreur : non relevé sur le site (Soon). Ne pas en inventer un.

---

# Filtres
Statut : relevé sur belco.fr (catalogues café et équipement). Fichier : filtres.md

- .b-filterbar : rangée de pilules qui passe à la ligne ; compte de résultats à gauche (« 400 cafés verts »), Trier et Vue liste à droite.
- .b-filter : pilule blanche filet 36 px, libellé + chevron ; ouverte : .is-open (fond sable, filet --color-text).
- .b-clear : lien atténué souligné « Tout effacer ».

## Règles
- Un filtre ouvre un menu (.b-menu) sous lui ; il ne navigue pas.
- Ordre relevé sur le catalogue café : Sélection Belco, Transporté à la voile, Women Coffee, Origines, Disponibilité, Quantité, Traçabilité, Note SCA, Note Impact score Belco, Process, Conditionnement, Certifications, Niveau d'agroforesterie, Process de décaféination, Producteurs, Projets, Variétés, Familles aromatiques.
- La barre reste collée sous le header au défilement.

---

# Multi-select
Statut : relevé sur belco.fr (filtre Origines). Fichier : menu.md

- .b-menu : panneau blanc filet, rayon 12 px, largeur 260 px, sans ombre.
- Lignes : case à cocher + libellé + compteur aligné à droite (chiffres tabulaires).
- « Tout effacer » en tête.

## Règles
- Plusieurs valeurs cochables ; le filtre parent passe en .is-on quand au moins une est cochée.
- Trier les valeurs par ordre alphabétique, compteur à jour après chaque coche.

---

# Case à cocher
Statut : relevé sur belco.fr (menus de filtres). Fichier : case.md

- .b-check : 16 px, rayon 4 px, filet atténué ; cochée : fond vert forêt, coche crème.
- .b-checkrow : libellé Book 14 à droite, gap 10 px.

## Règles
- Utilisée pour des choix multiples ; pour un choix unique, pas de radio relevé sur le site (Soon).
- Désactivée : opacité 40 %.

---

# Choicebox
Statut : relevé sur belco.fr (parcours « Devenir client », étape Intérêts). Fichier : choicebox.md

- .b-choice : carte 180 × 96, filet, rayon 12 px, picto 36 px + libellé Medium 14.
- Sélectionnée : filet et texte flamme (via input:checked).
- Valeurs du site : Café Vert, Équipement, Services / Formations.

## Règles
- Choix multiples par défaut (cases) ; une erreur bloque « Suivant » si rien n'est coché.
- Première question du parcours : deux pilules « Non » (contour) / « Oui » (flamme).

---

# Collapse
Statut : relevé sur belco.fr (FAQ, fiche café). Fichier : collapse.md

- .b-collapse : liste de <details> séparés par un filet ; question en Bold 14, chevron à droite qui pivote à l'ouverture.
- .b-collapse--inverse : version sur fond vert forêt (bloc « Notre histoire avec » de la fiche café).

## Règles
- Un seul niveau ; pas d'accordéon imbriqué.
- Le premier élément peut être ouvert par défaut ; les autres fermés.
- Sur la FAQ, les groupes (Commande, Paiement et facturation, Livraison, Équipement) sont des titres PP Formula entre les listes.

---

# Description
Statut : relevé sur belco.fr (fiche café, « Fiche d'identité »). Fichier : description.md

- .b-desc : grille deux colonnes ; chaque ligne = picto 18 px + clé atténuée + valeur Bold alignée à droite, filet entre les lignes.
- Clés relevées : Origine, Séchage, Région, Conditionnement, Terroir, Altitude, Espèce, Période de récolte, Variétés, Type de récolte, Process.

## Règles
- Une colonne sous 640 px.
- Valeur en Bold ; une valeur qui est un lien (origine, process) reste Bold et soulignée.

---

# Breadcrumbs
Statut : relevé sur belco.fr (catalogue, FAQ, contact). Fichier : breadcrumbs.md

- .b-crumbs : 12 px atténué, séparateur « › », dernier niveau en Bold couleur texte.
- Exemple : Accueil › Café Vert › Tous les cafés

## Règles
- Toujours « Accueil » en premier ; trois niveaux maximum.
- Placé sous le header, au-dessus du titre de page.

---

# Bandeau
Statut : relevé sur belco.fr (catalogues). Fichier : bandeau.md

- .b-banner : encart sable, rayon 12 px, titre Bold 14 + texte 12 px atténué, un bouton secondaire à droite.
- Texte du site : « Connectez-vous pour voir les prix ».

## Règles
- Une information et une seule action.
- Empilé en colonne sous 640 px.

---

# Statut
Statut : relevé sur belco.fr (cartes café). Fichier : statut.md

- .b-status : 12 px Medium, point de couleur à gauche (vert forêt = en stock, sauge = étape contrat, flamme = sur demande).
- Complément atténué possible : « · Arrivage en 09/12/26 », « · Prix spot ».

## Règles
- Valeurs relevées : En stock, Étape contrat, Sur demande.
- Le site accompagne chaque statut d'un picto ; le point de couleur est provisoire (Soon).

---

# Stepper
Statut : relevé sur belco.fr (parcours « Devenir client »). Fichier : stepper.md

- .b-stepper : pilules 32 px en majuscules 12 px reliées par un trait 1 px.
- .b-step : sable, texte atténué ; .is-active : vert forêt, texte crème ; .is-done : sauge (non observé, à confirmer).
- Étapes du site : Intérêts, Société, Compte Belco.

## Règles
- Trois étapes maximum ; centré sous le logo, sans navigation principale pendant le parcours.

---

# Tabs
Statut : relevé sur belco.fr (blog, fiche café). Fichier : tabs.md

- .b-tabs : rangée de pilules 36 px ; sélectionnée : vert forêt, texte crème (aria-selected).
- Blog : Tous les articles, Actualités, Café, Équipement.
- Fiche café : Histoire et traçabilité, Impact, Qualité, Outils Marketing (ancres vers les sections).

## Règles
- Un seul onglet sélectionné ; le contenu change sans rechargement.
- Pas d'onglet désactivé.

---

# Toggle vue
Statut : relevé sur belco.fr (catalogue). Fichier : toggle.md

- .b-toggle : pilule blanche filet 36 px, icône + libellé (« Vue liste », « Vue grille ») ; .is-on : fond sable, filet --color-text.

## Règles
- Toujours à droite de « Trier » dans la barre de filtres.
- Mémoriser le choix pendant la session.

---

# Comparateur
Statut : relevé sur belco.fr (catalogue café). Fichier : comparateur.md

- .b-compare : barre vert forêt, texte crème, titre Bold + compteur « (0 / 5) » + cinq emplacements + message + « Tout effacer ».
- Messages du site : « Aucun produit à comparer », « Encore 2 produits pour comparer ».

## Règles
- Fixée en bas de la fenêtre sur le catalogue ; cinq cafés maximum, deux minimum pour comparer.

---

# Skeleton
Statut : relevé sur belco.fr (catalogue, chargement du scroll infini). Fichier : skeleton.md

- .b-skeleton : bloc sable, rayon 6 px, reflet qui traverse (désactivé si prefers-reduced-motion).

## Règles
- Reproduire la silhouette exacte du composant attendu (carte : photo, titre, lignes, bouton).
- Pas de spinner : le site charge par skeleton.

---

# Scroller
Statut : relevé sur belco.fr (tuiles de sélection du catalogue café). Fichier : scroller.md

- .b-scroller : rangée horizontale défilante, snap doux, tuiles .b-tile 220 × 56 (vert forêt, sauge ou mousse) avec picto et libellé majuscules.
- Tuiles du site : Impact Score, Women coffee, Les Cafés de Forêt©, Cafés agroforestiers, Cafés transportés à la voile, Offres entreprises & CHR.

## Règles
- Déborde à droite volontairement : la dernière tuile coupée signale le défilement.

---

# Pictos catégories
Statut : relevé sur belco.fr (catalogue équipement, menu). Fichier : pictos.md

- .b-pictos : rangée défilante de .b-picto (rond 64 px sable filet + libellé 12 px Medium).
- Catégories du site : Nouveautés, Pack produits, Moulins à café, Balances à café, Bouilloires à café, Cafetières et drip, Filtres à café, Carafes à café, Tasses et sous-tasses, Thermos, Boîtes de conservation, Aide à l'extraction, Thé & infusion, Produits d'entretien, Pièces détachées.

## Règles
- Les dessins sont ceux de la charte Belco (fond beige, trait vert forêt) : fichiers PNG à intégrer, ne pas en redessiner.

---

# État vide
Statut : relevé sur belco.fr (comparateur). Fichier : vide.md

- .b-empty : cadre pointillé, texte centré : titre Bold + indication de ce qui manque.

## Règles
- Dire ce qui manque et ce qui le ferait apparaître ; pas d'illustration relevée.

---

# Carte produit
Statut : relevé sur belco.fr (catalogues café et équipement). Fichier : carte.md

- .b-card : 280 px, galet blanc filet 20 px, zone média 180 px, corps en colonne gap 12.
- Café : badge méta (poids · origine) et score ou badge label sur la photo ; sur-titre majuscules (terroir · grade · process · bio) ; nom Bold 16 ; chips (variétés, process) ; statut ; pied prix (« Prix spot » + « Voir le prix ») ; boutons « Commander » (gris tant que non connecté) et « Demande de contrat » (contour).
- Équipement : média clair, badge surface (« Bientôt disponible »), marque en sur-titre, nom, chips de variantes, pied prix, « Commander ».

## Règles
- Deux badges maximum sur la photo.
- Les prix ne s'affichent qu'une fois connecté : sinon lien « Voir le prix » et bouton désactivé.
- La photo du producteur ou du produit est obligatoire ; l'aplat sauge n'est qu'un gabarit.
