# WOD Timer 🏋️

Application mobile (PWA) de gestion du temps pour les WODs de CrossFit :
Tabata, For Time, AMRAP, EMOM et intervalles personnalisés.

## Fonctionnalités

- **Types de WOD** : For Time (avec time cap optionnel), AMRAP, EMOM, Tabata,
  intervalles libres (séquences travail/repos répétées).
- **Base de WODs préremplie** : benchmarks « Girls » (Fran, Cindy, Annie,
  Grace, Helen, Karen, Diane, Isabel, Jackie, Mary, Chelsea, Nicole, Barbara),
  Hero WODs (Murph, DT, JT, Michael, Randy), WODs du CrossFit Open
  (17.1, 17.5, 19.1, 20.1, 23.1) et gabarits génériques
  (Tabata classique, EMOM 10/20, AMRAP 12/20, etc.).
- **WODs customs** : création depuis zéro ou en dupliquant un WOD de référence
  (« Dupliquer & modifier » sur la fiche d'un WOD).
- **Mouvements structurés** : bibliothèque de 76 mouvements (`js/movements.js`)
  pour décrire un WOD par mouvement + reps/distance + charge, avec schéma de
  reps optionnel (ex. 21-15-9). Le texte libre reste disponible en parallèle.
  Voir `docs/phase1-bibliotheque-mouvements.md`.
- **Muscles travaillés** : chaque mouvement est associé à ses groupes
  musculaires (`js/muscles.js`), affichés sur une figure corps face/dos
  (`js/bodymap.js`) — sur la fiche d'un mouvement et, agrégés, sur la fiche
  d'un WOD. Bibliothèque de mouvements accessible via le bouton 💪.
- **Fiche mouvement** : description textuelle des repères d'exécution
  (`js/descriptions.js`) en plus des muscles, du matériel et de la mesure.
- **Suggestion du WOD suivant** (bouton 🎯) : classe les WODs selon les muscles
  travaillés récemment (historique), le matériel disponible et la forme du jour
  (`js/suggest.js`).
- **Compte à rebours de 10 s** avant chaque WOD, avec bips sur les
  3 dernières secondes et top départ sonore.
- **Alertes sonores** : mi-temps de chaque étape (double bip), 3-2-1 avant
  chaque changement d'étape, top de changement d'étape, signal de fin.
  Le son utilise Web Audio et se mixe avec la musique en cours
  (Spotify continue de jouer, les bips passent par-dessus).
- **Compteur de rounds** pendant les AMRAP et For Time.
- **Historique** des séances réalisées (temps, rounds/reps, notes),
  stocké localement sur le téléphone.
- **Export Garmin** : chaque séance s'exporte en fichier **TCX**
  (un lap par étape du WOD), importable dans Garmin Connect via
  *Importer des données*. Sur mobile, le partage natif permet d'envoyer
  le fichier directement.
- **Écran maintenu allumé** pendant le timer (Wake Lock).
- **Hors-ligne** : l'app fonctionne sans réseau une fois chargée
  (service worker).

## Installation sur le téléphone

L'app doit être servie en **HTTPS** (exigence des PWA). Le plus simple :
activer GitHub Pages sur ce dépôt (*Settings → Pages → Source :
GitHub Actions*) — le workflow `deploy-pages.yml` publie automatiquement
à chaque push sur `main`.

Ensuite, sur le téléphone :

- **Android (Chrome)** : ouvrir l'URL → menu ⋮ → *Ajouter à l'écran d'accueil*.
- **iPhone (Safari)** : ouvrir l'URL → bouton Partager → *Sur l'écran d'accueil*.

> ⚠️ Sur iPhone, garder l'écran allumé pendant le WOD : iOS coupe le timer
> et le son d'une web app quand l'écran se verrouille (le Wake Lock activé
> par l'app évite normalement le verrouillage automatique).

## Développement local

Aucune dépendance ni build : c'est un site statique en modules ES.

```bash
python3 -m http.server 8000
# puis ouvrir http://localhost:8000
```

## Structure

```
index.html            Coquille de l'app
css/style.css         Styles (mobile-first, thème sombre)
js/app.js             Routeur + écrans (liste, détail, éditeur, timer, historique)
js/wods.js            Base de WODs de référence + construction des segments
js/movements.js       Bibliothèque de mouvements + saisie structurée
js/muscles.js         Taxonomie musculaire + muscles par mouvement
js/bodymap.js         Figure corporelle SVG (zones musculaires)
js/descriptions.js    Descriptions textuelles des mouvements
js/suggest.js         Moteur de suggestion du WOD suivant
js/timer.js           Moteur de timer (pur, sans DOM — portable en natif)
js/audio.js           Alertes sonores (Web Audio)
js/storage.js         Persistance locale (WODs customs + historique)
js/tcx.js             Export TCX pour Garmin Connect
js/fit.js             Export FIT pour Garmin Connect (type + séries)
sw.js                 Service worker (hors-ligne)
manifest.webmanifest  Manifest PWA
```

Les modules `timer.js`, `wods.js` et `tcx.js` sont indépendants du DOM :
ils pourront être réutilisés tels quels lors d'un futur portage
React Native / natif.

## Import dans Garmin Connect

1. Exporter la séance depuis l'écran *Historique* (bouton « TCX Garmin »).
2. Sur [connect.garmin.com](https://connect.garmin.com) : cliquer sur
   l'icône d'import (en haut à droite) → *Importer des données* →
   sélectionner le fichier `.tcx`.
3. L'activité apparaît en sport « Autre », avec un lap par étape du WOD
   et les rounds/notes dans la description.
