# Agence AE · maquette v4 (version finale)

Maquette de présentation du futur site de L'Agence AE (Marine Gourlay, architecte, Quimper), direction artistique **« Course du soleil »** : la conception bioclimatique rendue tangible. Site statique (HTML, CSS, JavaScript), prêt pour Vercel sans étape de construction.

Adresse prévue : https://agence-ae-maquette.vercel.app (à mettre dans le module Wix « Intégrer un site »).

## Pages

| Page | Ouverture | Points forts |
|---|---|---|
| Accueil | photo plein cadre de la Maison T-G, soleil à saisir sur son arc | intro du soleil levant, photo rééclairée en WebGL, maquette 3D qui se construit, mots géants, photo qui s'ouvre en plein écran, coupe bioclimatique épinglée (soleil manipulable), planches, carte de la zone |
| Réalisations | titre géant, cadran solaire qu'on tourne pour filtrer | carrousel 3D de 12 projets, 23 projets filtrables (filtre dans l'adresse), visionneuse par projet avec lien propre `#projet-…` |
| L'Atelier | matière chaux-chanvre, cartouche de plan qui se trace et s'écrit | parcours, équipe, démarche en tiroirs du meuble à plans, 7 questions fréquentes |
| Convictions | « 40 % » géant allumé par un rayon rasant | chiffres en barres, mur en coupe épinglé qui se décompose, chantier propre, vers plus sobre |
| Contact | le numéro en très grand, bandeau de côte | premier rendez-vous en 5 étapes, tampon « Reçu », plan d'accès schématique |
| 404 | cadran solaire | |

Pages du site actuel non reprises (à ajouter si le client le souhaite) : une fiche projet par réalisation, la FAQ complète en page dédiée (16 questions, dont 7 reprises sur L'Atelier).

## Modifier le contenu

Tous les textes sont dans `donnees/textes/fr.json`, les projets dans `donnees/projets.json`, les communes de la carte dans `donnees/communes.json`, les réglages dans `donnees/site.json`. Après chaque modification : `node outils/generer.mjs` (ne jamais modifier les pages `.html` à la main). Images : `plan-images.json` puis `python3 outils/produire-images.py`.

## À fournir par l'agence (« à compléter »)

- Mentions légales : raison sociale, SIREN 833 878 937 à confirmer avec le SIRET, adresse du siège (1 rue du Chanoine Moreau, Quimper) ou de l'agence, directeur de la publication.
- Politique de confidentialité (RGPD) : données recueillies par le formulaire, finalité, durée de conservation, droits.
- Hébergeur : Vercel Inc. (adresse à vérifier sur vercel.com au moment de la mise en ligne).
- Numéro d'inscription au tableau de l'Ordre des architectes de Bretagne ; attestation d'assurance MAF.
- Horaires d'ouverture de l'agence (aucun sur le site actuel : rien n'est affiché).
- Témoignage complet de Marion (Penmarc'h) et les trois autres avis du carrousel actuel (un seul lisible).
- Statut des visuels de projets neufs : plusieurs sont des perspectives 3D, et certains portent l'étoile de Google Gemini (images générées ou retouchées). Préciser « projet » ou « réalisé » et l'origine des visuels.
- Commune de la galerie d'artiste ; descriptions des projets autres que Tréguennec.
- Contenu des pages « Notre démarche » et « Professionnel » du site actuel (illisibles lors du relevé ; la démarche a été reconstituée à partir de la présentation et de la FAQ).
- Crédits des illustrations générées : les 10 images marquées « Illustration générée » ont été créées avec Grok (ambiances, matières, paysages). **Garder cette mention sur le site final.**

## Points signalés sur le site actuel

- Deux adresses (siège rue du Chanoine Moreau, agence place Denis Bérardier) et deux noms (« Atelier d'Architecture », « Agence d'Architecture Environnementale »).
- FAQ « Faut-il avoir des plans ? » restée en texte de remplissage ; politique de confidentialité à l'adresse « copie-de-mentions-légales » ; « Candidature : à venir ».
- Déontologie (art. 18, 19, 35 du code des architectes) : « plus-value de 10 à 20 % à la revente » et « honoraires inférieurs à la TVA » sont reformulés comme des repères à confirmer, sans promesse chiffrée.

## À la mise en ligne définitive

- Retirer : `noindex` (balise robots dans `source/gabarits/commun.mjs`, en-tête X-Robots-Tag dans `vercel.json`), formulaire simulé (brancher un vrai envoi), mentions « à compléter », mention « Maquette de présentation » du pied de page.
- Garder : la mention « Illustration générée » sur les images créées par IA.

## Notes techniques

- Socle de la skill (intro, voile en iris, en-tête, mode calme, défilement, mesures) ; effets propres dans `assets/js/site.js`, marqués `data-effet`.
- Modules de la bibliothèque dont la mécanique a été reprise : objet-a-faire-tourner, fil-conducteur, schema-epingle-etapes, planches-empilees, offre-a-tiroirs, vue-eclatee, formulaire-par-etapes, catalogue-filtres-flip.
- Audit : `node _audit/audit.mjs` (rapport dans `_audit/rapport/`).
