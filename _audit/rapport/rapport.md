# Rapport d’audit

Projet : `agence-ae-maquette` · 06/11/2026 20:27:29 · 28 min · 6 page(s) · audit complet

## Résumé

- Échecs : **0**
- À regarder : **7**
- Non lancé : **1**
- Contrôles passés : vercel.json (1), .vercelignore (1), robots.txt (1), numéro de version (1), langues (1), grille wouahou (7), mesures (312), balayage (5), films d’ouverture (10), films de transition (10), bords de l’écran (6), intro accélérable et passable (7), menu (1), clavier (6), liens et boutons (6), liens profonds (15), liens vers la page en cours (5), changements de hauteur (5), mode calme (10), bouton du mode calme (2), parcours du projet (1), tient dans l’écran (16), films des épinglages (3), fluidité (10), défilement selon l’appareil (5), mouvement (10), effets du plan (25), souris immobile (5), vitesse (5), captures (1)

## Grille wouahou

| Point | État | Détail |
|---|---|---|
| 1. L’effet signature se manipule | ✓ présent | accueil et 1 autre(s) page(s) |
| 2. L’intro devient la page | ✓ présent | objet d’ouverture sur 5 page(s), versObjet dans l’intro |
| 3. La transition reprend le motif | ✓ présent | voile en iris |
| 4. Un fil conducteur traverse le site | ✓ présent | sur les 5 page(s) |
| 5. La typographie bouge aussi | ✓ présent | sur les 5 page(s) |
| 6. Les scènes épinglées sont des gestes du métier | ✓ présent | geste du métier sur /atelier, /convictions, / |
| 7. L’action principale a un retour physique | ✓ présent | sur /contact |

Le script vérifie les marques (`data-grille`, `data-iris-centre`, forme du voile, `versObjet`) ; la force et la justesse de chaque point se jugent sur les captures et les films.

## Échecs

Aucun.

## À regarder

### retour arrière : changement brusque (2)

- **retour arrière : changement brusque** — `/` — à 81 ms (différence 59 %) (films/retour-arrière-1366.png) _(1366×768 retour arrière)_
- **retour arrière : changement brusque** — `/` — à 77 ms (différence 60 %) (films/retour-arrière-390.png) _(390×844 retour arrière)_

### retour avant : changement brusque (1)

- **retour avant : changement brusque** — `/realisations` — à 81 ms (différence 56 %) (films/retour-avant-390.png) _(390×844 retour avant)_

### rechargement au milieu de la page (2)

- **rechargement au milieu de la page** — `/atelier` — écran différent à la même position après rechargement (8.9 %), voir comparaisons/rechargement-atelier-*.png _(1366×768)_
- **rechargement au milieu de la page** — `/realisations` — écran différent à la même position après rechargement (6.2 %), voir comparaisons/rechargement-realisations-*.png _(1366×768)_

### fluidité (1)

- **fluidité** — `/` — 4 % d'images de plus de 50 ms _(1366×768 défilement à la molette, processeur ralenti 4 fois)_

### effet qui dérive sous la souris immobile (1)

- **effet qui dérive sous la souris immobile** — `/convictions` — [data-souris] onde — léger changement (0.3 %) 1,5 à 4,5 s après l’arrêt de la souris _(1366×768 souris)_

## Non lancé

- **Safari (WebKit)** : WebKit ne peut pas s’installer ici : vérification à faire dans Safari sur le Mac (liste dans le rapport)

### À vérifier dans Safari sur le Mac (WebKit indisponible ici)

- Ouverture de chaque page : rien qui clignote, intro complète au premier chargement et au rechargement.
- Changement de page : le voile couvre l’écran, pas de page blanche ; retour arrière sans intro ni voile resté.
- Défilement : fluide (natif), en-tête qui se cache et revient sans clignoter, sections épinglées entières.
- Menu sur iPhone (mode Responsive de Safari) : ouverture, fermeture, page bloquée derrière.
- Polices, images, mention « Illustration générée », formulaires et barre fixe du bas.

## Repères

- Numéro de version des fichiers : ?v=4
- Journal v4 : 3 étape(s) notée(s), 58 min de travail pour 65 min de budget, 2 min d’attente de l’utilisateur.
- Accessibilité : axe-core 4.12.1 en plus des contrôles intégrés.
- Ouverture / (1366×768) : 2889 ms depuis le premier octet
- Ouverture /atelier (1366×768) : 2794 ms depuis le premier octet
- Ouverture /contact (1366×768) : 2745 ms depuis le premier octet
- Ouverture /convictions (1366×768) : 2848 ms depuis le premier octet
- film de l'ouverture /convictions 1366×768 : réussi à la tentative 2 (avant : cdpSession.send: Protocol error (Page.startScreencast): Not attached to an active page)
- Ouverture /realisations (1366×768) : 2732 ms depuis le premier octet
- Ouverture / (390×844) : 2882 ms depuis le premier octet
- Ouverture /atelier (390×844) : 2794 ms depuis le premier octet
- Ouverture /contact (390×844) : 2824 ms depuis le premier octet
- Ouverture /convictions (390×844) : 2814 ms depuis le premier octet
- Ouverture /realisations (390×844) : 2702 ms depuis le premier octet
- film de l'ouverture /realisations 390×844 : réussi à la tentative 3 (avant : cdpSession.send: Protocol error (Page.startScreencast): Not attached to an active page)
- Bords de l’écran : 349 images d’intro, 24 de voile et 192 de menu jugées (panneau immobile couvrant tout l’écran), barre de défilement classique de 15 px.
- Tient dans l'écran /atelier : aucune section épinglée ou plein écran.
- Tient dans l'écran /contact : aucune section épinglée ou plein écran.
- Tient dans l'écran /realisations : aucune section épinglée ou plein écran.
- Fluidité /atelier 1366×768 (molette) : 0 % d'images lentes sur 235, tâche la plus longue 0 ms
- Fluidité /contact 1366×768 (molette) : 0 % d'images lentes sur 176, tâche la plus longue 0 ms
- Fluidité /convictions 1366×768 (molette) : 1 % d'images lentes sur 333, tâche la plus longue 87 ms
- Fluidité /realisations 1366×768 (molette) : 0 % d'images lentes sur 317, tâche la plus longue 0 ms
- Fluidité / 390×844 (doigt) : 0 % d'images lentes sur 1471, tâche la plus longue 0 ms
- Fluidité /atelier 390×844 (doigt) : 0 % d'images lentes sur 1347, tâche la plus longue 0 ms
- Fluidité /contact 390×844 (doigt) : 0 % d'images lentes sur 1349, tâche la plus longue 0 ms
- Fluidité /convictions 390×844 (doigt) : 0 % d'images lentes sur 1350, tâche la plus longue 0 ms
- Fluidité /realisations 390×844 (doigt) : 0 % d'images lentes sur 1368, tâche la plus longue 0 ms
- Vitesse / : 0.81 s de calcul au chargement (téléphone ralenti).
- Vitesse /atelier : 0.35 s de calcul au chargement (téléphone ralenti).
- Vitesse /contact : 0.26 s de calcul au chargement (téléphone ralenti).
- Vitesse /convictions : 0.48 s de calcul au chargement (téléphone ralenti).
- Vitesse /realisations : 0.57 s de calcul au chargement (téléphone ralenti).

## Fichiers

- Captures : `captures/` (téléphone, tablette, ordinateur, écran par écran)
- Films : `films/` (planches contact de l’ouverture, des transitions, des retours, des ancres et des épinglages ; ⚠ = image signalée)
- Comparaisons : `comparaisons/`
- Détail complet : `rapport.json`
