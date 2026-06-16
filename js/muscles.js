// Taxonomie musculaire + correspondance mouvement -> muscles travaillés.
// Donnée volontairement séparée de movements.js (le catalogue reste inchangé).
//
// Les ids de muscles correspondent aux zones dessinées dans bodymap.js.
// Un muscle apparaît sur la vue de face ('front'), de dos ('back') ou les deux.

export const MUSCLES = [
  { id: 'trapezius',      label: 'Trapèzes',        views: ['back'] },
  { id: 'front-deltoids', label: 'Épaules (avant)', views: ['front'] },
  { id: 'back-deltoids',  label: 'Épaules (arrière)', views: ['back'] },
  { id: 'chest',          label: 'Pectoraux',       views: ['front'] },
  { id: 'biceps',         label: 'Biceps',          views: ['front'] },
  { id: 'triceps',        label: 'Triceps',         views: ['back'] },
  { id: 'forearms',       label: 'Avant-bras',      views: ['front', 'back'] },
  { id: 'abs',            label: 'Abdominaux',      views: ['front'] },
  { id: 'obliques',       label: 'Obliques',        views: ['front'] },
  { id: 'lats',           label: 'Dorsaux',         views: ['back'] },
  { id: 'lower-back',     label: 'Lombaires',       views: ['back'] },
  { id: 'gluteal',        label: 'Fessiers',        views: ['back'] },
  { id: 'quadriceps',     label: 'Quadriceps',      views: ['front'] },
  { id: 'hamstrings',     label: 'Ischio-jambiers', views: ['back'] },
  { id: 'adductors',      label: 'Adducteurs',      views: ['front'] },
  { id: 'calves',         label: 'Mollets',         views: ['back'] },
];

export const MUSCLE_BY_ID = Object.fromEntries(MUSCLES.map((m) => [m.id, m]));

// Muscles travaillés par mouvement : { primary: [...], secondary: [...] }.
// primary = moteurs principaux ; secondary = assistance / gainage.
export const MOVEMENT_MUSCLES = {
  // ---- Haltérophilie ----
  'thruster': { primary: ['quadriceps', 'gluteal', 'front-deltoids'], secondary: ['triceps', 'abs', 'trapezius', 'hamstrings'] },
  'front-squat': { primary: ['quadriceps', 'gluteal'], secondary: ['abs', 'lower-back', 'hamstrings', 'adductors'] },
  'back-squat': { primary: ['quadriceps', 'gluteal'], secondary: ['hamstrings', 'lower-back', 'abs', 'adductors'] },
  'overhead-squat': { primary: ['quadriceps', 'gluteal', 'front-deltoids'], secondary: ['abs', 'trapezius', 'lower-back'] },
  'deadlift': { primary: ['gluteal', 'hamstrings', 'lower-back'], secondary: ['quadriceps', 'trapezius', 'forearms', 'lats'] },
  'sdhp': { primary: ['trapezius', 'front-deltoids', 'gluteal'], secondary: ['hamstrings', 'biceps', 'forearms', 'quadriceps'] },
  'clean': { primary: ['gluteal', 'hamstrings', 'quadriceps', 'trapezius'], secondary: ['lower-back', 'front-deltoids', 'forearms', 'calves'] },
  'power-clean': { primary: ['gluteal', 'hamstrings', 'trapezius'], secondary: ['quadriceps', 'lower-back', 'forearms', 'front-deltoids'] },
  'hang-power-clean': { primary: ['trapezius', 'gluteal', 'hamstrings'], secondary: ['forearms', 'front-deltoids', 'lower-back'] },
  'clean-jerk': { primary: ['gluteal', 'quadriceps', 'front-deltoids', 'trapezius'], secondary: ['hamstrings', 'triceps', 'abs', 'calves'] },
  'snatch': { primary: ['gluteal', 'hamstrings', 'front-deltoids', 'trapezius'], secondary: ['quadriceps', 'lower-back', 'forearms', 'abs'] },
  'power-snatch': { primary: ['trapezius', 'front-deltoids', 'gluteal'], secondary: ['hamstrings', 'quadriceps', 'forearms', 'lower-back'] },
  'push-press': { primary: ['front-deltoids', 'triceps'], secondary: ['quadriceps', 'gluteal', 'abs', 'trapezius'] },
  'push-jerk': { primary: ['front-deltoids', 'triceps'], secondary: ['quadriceps', 'gluteal', 'abs', 'trapezius'] },
  'strict-press': { primary: ['front-deltoids', 'triceps'], secondary: ['trapezius', 'abs'] },
  'bench-press': { primary: ['chest', 'triceps', 'front-deltoids'], secondary: [] },

  // ---- Haltères ----
  'db-snatch': { primary: ['gluteal', 'hamstrings', 'front-deltoids', 'trapezius'], secondary: ['quadriceps', 'forearms', 'abs'] },
  'db-hang-snatch': { primary: ['trapezius', 'front-deltoids', 'gluteal'], secondary: ['hamstrings', 'forearms'] },
  'db-clean': { primary: ['gluteal', 'hamstrings', 'trapezius'], secondary: ['quadriceps', 'forearms', 'front-deltoids'] },
  'db-hang-clean': { primary: ['trapezius', 'gluteal', 'hamstrings'], secondary: ['forearms', 'front-deltoids'] },
  'db-clean-jerk': { primary: ['gluteal', 'quadriceps', 'front-deltoids'], secondary: ['triceps', 'trapezius', 'abs'] },
  'db-thruster': { primary: ['quadriceps', 'gluteal', 'front-deltoids'], secondary: ['triceps', 'abs', 'trapezius'] },
  'db-push-press': { primary: ['front-deltoids', 'triceps'], secondary: ['quadriceps', 'gluteal', 'abs'] },
  'db-push-jerk': { primary: ['front-deltoids', 'triceps'], secondary: ['quadriceps', 'gluteal', 'abs'] },
  'db-shoulder-press': { primary: ['front-deltoids', 'triceps'], secondary: ['trapezius', 'abs'] },
  'db-front-squat': { primary: ['quadriceps', 'gluteal'], secondary: ['abs', 'lower-back', 'hamstrings'] },
  'db-deadlift': { primary: ['gluteal', 'hamstrings', 'lower-back'], secondary: ['quadriceps', 'forearms', 'trapezius'] },
  'db-walking-lunge': { primary: ['quadriceps', 'gluteal'], secondary: ['hamstrings', 'adductors', 'calves', 'abs'] },
  'db-front-rack-lunge': { primary: ['quadriceps', 'gluteal'], secondary: ['abs', 'hamstrings', 'adductors'] },
  'db-overhead-lunge': { primary: ['quadriceps', 'gluteal', 'front-deltoids'], secondary: ['abs', 'trapezius', 'adductors'] },
  'db-box-step-up': { primary: ['quadriceps', 'gluteal'], secondary: ['hamstrings', 'calves', 'adductors'] },
  'db-overhead-step-up': { primary: ['quadriceps', 'gluteal', 'front-deltoids'], secondary: ['abs', 'calves', 'trapezius'] },
  'db-row': { primary: ['lats', 'back-deltoids', 'biceps'], secondary: ['trapezius', 'forearms', 'lower-back'] },
  'renegade-row': { primary: ['lats', 'back-deltoids', 'abs'], secondary: ['biceps', 'chest', 'obliques', 'forearms'] },
  'devil-press': { primary: ['chest', 'front-deltoids', 'gluteal', 'hamstrings'], secondary: ['triceps', 'quadriceps', 'abs', 'trapezius'] },
  'man-maker': { primary: ['chest', 'back-deltoids', 'front-deltoids', 'quadriceps'], secondary: ['triceps', 'biceps', 'abs', 'gluteal'] },
  'db-rdl': { primary: ['hamstrings', 'gluteal', 'lower-back'], secondary: ['forearms', 'trapezius'] },
  'db-bulgarian-split-squat': { primary: ['quadriceps', 'gluteal'], secondary: ['hamstrings', 'adductors', 'calves'] },
  'db-bench-press': { primary: ['chest', 'triceps', 'front-deltoids'], secondary: [] },
  'db-floor-press': { primary: ['chest', 'triceps'], secondary: ['front-deltoids'] },
  'db-curl': { primary: ['biceps'], secondary: ['forearms'] },
  'db-hammer-curl': { primary: ['biceps', 'forearms'], secondary: [] },
  'db-lateral-raise': { primary: ['front-deltoids', 'back-deltoids'], secondary: ['trapezius'] },
  'db-triceps-extension': { primary: ['triceps'], secondary: [] },
  'db-flye': { primary: ['chest'], secondary: ['front-deltoids'] },
  'turkish-get-up': { primary: ['front-deltoids', 'abs', 'obliques'], secondary: ['quadriceps', 'gluteal', 'triceps'] },

  // ---- Gymnastique ----
  'pullup': { primary: ['lats', 'biceps'], secondary: ['back-deltoids', 'forearms', 'trapezius'] },
  'c2b': { primary: ['lats', 'biceps'], secondary: ['back-deltoids', 'forearms', 'trapezius'] },
  'muscle-up': { primary: ['lats', 'chest', 'triceps'], secondary: ['biceps', 'back-deltoids', 'abs', 'forearms'] },
  'pushup': { primary: ['chest', 'triceps', 'front-deltoids'], secondary: ['abs'] },
  'hspu': { primary: ['front-deltoids', 'triceps'], secondary: ['trapezius', 'abs'] },
  'ring-dip': { primary: ['chest', 'triceps'], secondary: ['front-deltoids', 'abs'] },
  'dip': { primary: ['chest', 'triceps'], secondary: ['front-deltoids'] },
  'pistol': { primary: ['quadriceps', 'gluteal'], secondary: ['hamstrings', 'adductors', 'calves', 'abs'] },
  'air-squat': { primary: ['quadriceps', 'gluteal'], secondary: ['hamstrings', 'calves'] },
  'lunge': { primary: ['quadriceps', 'gluteal'], secondary: ['hamstrings', 'calves', 'adductors'] },
  'box-jump': { primary: ['quadriceps', 'gluteal', 'calves'], secondary: ['hamstrings'] },
  'burpee': { primary: ['chest', 'quadriceps', 'front-deltoids'], secondary: ['triceps', 'gluteal', 'abs', 'hamstrings'] },
  'burpee-over-bar': { primary: ['chest', 'quadriceps', 'front-deltoids'], secondary: ['triceps', 'gluteal', 'abs', 'hamstrings'] },
  'wall-ball': { primary: ['quadriceps', 'gluteal', 'front-deltoids'], secondary: ['triceps', 'abs', 'calves'] },
  'wall-walk': { primary: ['front-deltoids', 'triceps', 'abs'], secondary: ['trapezius', 'chest'] },
  'handstand-walk': { primary: ['front-deltoids', 'triceps', 'abs'], secondary: ['trapezius', 'forearms'] },
  'rope-climb': { primary: ['lats', 'biceps', 'forearms'], secondary: ['back-deltoids', 'abs'] },

  // ---- Gainage / core ----
  'situp': { primary: ['abs'], secondary: ['obliques'] },
  'ghd-situp': { primary: ['abs'], secondary: ['obliques', 'quadriceps'] },
  't2b': { primary: ['abs'], secondary: ['lats', 'forearms', 'obliques'] },
  'k2e': { primary: ['abs'], secondary: ['lats', 'forearms', 'obliques'] },
  'back-extension': { primary: ['lower-back', 'gluteal', 'hamstrings'], secondary: [] },

  // ---- Kettlebell ----
  'kb-swing': { primary: ['gluteal', 'hamstrings', 'lower-back'], secondary: ['front-deltoids', 'abs', 'forearms', 'quadriceps'] },
  'goblet-squat': { primary: ['quadriceps', 'gluteal'], secondary: ['abs', 'adductors', 'forearms'] },
  'farmer-carry': { primary: ['forearms', 'trapezius'], secondary: ['abs', 'gluteal', 'quadriceps', 'obliques'] },

  // ---- Cardio ----
  'run': { primary: ['quadriceps', 'hamstrings', 'calves', 'gluteal'], secondary: [] },
  'row': { primary: ['quadriceps', 'gluteal', 'lats'], secondary: ['biceps', 'lower-back', 'hamstrings', 'back-deltoids'] },
  'bike': { primary: ['quadriceps', 'hamstrings', 'gluteal'], secondary: ['calves'] },
  'double-under': { primary: ['calves'], secondary: ['forearms'] },
  'single-under': { primary: ['calves'], secondary: ['forearms'] },
};

// Muscles d'un mouvement (objet vide si non renseigné).
export function musclesFor(movementId) {
  return MOVEMENT_MUSCLES[movementId] || { primary: [], secondary: [] };
}

// Agrège les muscles d'une liste de mouvements ([{ movementId }]).
// Un muscle primaire quelque part prime sur secondaire ailleurs.
export function aggregateMuscles(movements) {
  const primary = new Set();
  const secondary = new Set();
  for (const mv of movements || []) {
    const m = MOVEMENT_MUSCLES[mv.movementId];
    if (!m) continue;
    (m.primary || []).forEach((x) => primary.add(x));
    (m.secondary || []).forEach((x) => secondary.add(x));
  }
  for (const x of primary) secondary.delete(x);
  return { primary: [...primary], secondary: [...secondary] };
}
