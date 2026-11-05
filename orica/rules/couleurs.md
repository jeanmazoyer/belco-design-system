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
