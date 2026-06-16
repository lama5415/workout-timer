// Bibliothèque de mouvements de référence + saisie structurée des WODs.
// Voir docs/phase1-bibliotheque-mouvements.md.
//
// Un mouvement du catalogue :
//   { id, name, family, aliases, measure, loaded, equipment, fit? }
//   - measure   : mesure par défaut — 'reps' | 'm' | 'cal' | 'sec'
//   - loaded    : propose un champ charge dans l'UI
//   - equipment : 'none' | 'minimal' (haltère / barre de traction) | 'full'
//   - fit       : mapping vers l'exercice FIT (Phase 2), optionnel
//
// Le champ `fit.name` est une suggestion à valider sur le profil FIT officiel ;
// `fit.category` est le repli fiable utilisé pour l'export.

export const FAMILIES = [
  ['halterophilie', 'Haltérophilie'],
  ['halteres', 'Haltères'],
  ['gymnastique', 'Gymnastique'],
  ['core', 'Gainage / core'],
  ['kettlebell', 'Kettlebell'],
  ['monostructural', 'Cardio'],
];

export const MOVEMENTS = [
  // ---------- Haltérophilie (barre) ----------
  { id: 'thruster', name: 'Thruster', family: 'halterophilie', aliases: ['thrusters'], measure: 'reps', loaded: true, equipment: 'full', fit: { category: 'squat', name: 'thruster' } },
  { id: 'front-squat', name: 'Front squat', family: 'halterophilie', aliases: ['front squats'], measure: 'reps', loaded: true, equipment: 'full', fit: { category: 'squat', name: 'front_squat' } },
  { id: 'back-squat', name: 'Back squat', family: 'halterophilie', aliases: ['back squats', 'squat'], measure: 'reps', loaded: true, equipment: 'full', fit: { category: 'squat', name: 'back_squat' } },
  { id: 'overhead-squat', name: 'Overhead squat', family: 'halterophilie', aliases: ['ohs', 'overhead squats'], measure: 'reps', loaded: true, equipment: 'full', fit: { category: 'squat', name: 'overhead_squat' } },
  { id: 'deadlift', name: 'Deadlift', family: 'halterophilie', aliases: ['deadlifts', 'soulevé de terre'], measure: 'reps', loaded: true, equipment: 'full', fit: { category: 'deadlift', name: 'barbell_deadlift' } },
  { id: 'sdhp', name: 'Sumo deadlift high pull', family: 'halterophilie', aliases: ['sdhp'], measure: 'reps', loaded: true, equipment: 'full', fit: { category: 'deadlift' } },
  { id: 'clean', name: 'Squat clean', family: 'halterophilie', aliases: ['clean', 'cleans', 'épaulé'], measure: 'reps', loaded: true, equipment: 'full', fit: { category: 'olympic_lift', name: 'squat_clean' } },
  { id: 'power-clean', name: 'Power clean', family: 'halterophilie', aliases: ['power cleans'], measure: 'reps', loaded: true, equipment: 'full', fit: { category: 'olympic_lift', name: 'power_clean' } },
  { id: 'hang-power-clean', name: 'Hang power clean', family: 'halterophilie', aliases: ['hang power cleans', 'hpc'], measure: 'reps', loaded: true, equipment: 'full', fit: { category: 'olympic_lift' } },
  { id: 'clean-jerk', name: 'Clean & jerk', family: 'halterophilie', aliases: ['clean and jerk', 'épaulé-jeté'], measure: 'reps', loaded: true, equipment: 'full', fit: { category: 'olympic_lift', name: 'clean_and_jerk' } },
  { id: 'snatch', name: 'Squat snatch', family: 'halterophilie', aliases: ['snatch', 'snatches', 'arraché'], measure: 'reps', loaded: true, equipment: 'full', fit: { category: 'olympic_lift', name: 'snatch' } },
  { id: 'power-snatch', name: 'Power snatch', family: 'halterophilie', aliases: ['power snatches'], measure: 'reps', loaded: true, equipment: 'full', fit: { category: 'olympic_lift', name: 'power_snatch' } },
  { id: 'push-press', name: 'Push press', family: 'halterophilie', aliases: ['push presses'], measure: 'reps', loaded: true, equipment: 'full', fit: { category: 'shoulder_press', name: 'push_press' } },
  { id: 'push-jerk', name: 'Push jerk', family: 'halterophilie', aliases: ['push jerks'], measure: 'reps', loaded: true, equipment: 'full', fit: { category: 'shoulder_press' } },
  { id: 'strict-press', name: 'Strict press', family: 'halterophilie', aliases: ['shoulder press', 'overhead press', 'développé militaire'], measure: 'reps', loaded: true, equipment: 'full', fit: { category: 'shoulder_press', name: 'overhead_press' } },
  { id: 'bench-press', name: 'Bench press', family: 'halterophilie', aliases: ['barbell bench press', 'développé couché'], measure: 'reps', loaded: true, equipment: 'full', fit: { category: 'bench_press', name: 'barbell_bench_press' } },

  // ---------- Haltères (dumbbell) ----------
  // Tier 1 — mouvements WOD / CrossFit
  { id: 'db-snatch', name: 'DB snatch (alterné)', family: 'halteres', aliases: ['dumbbell snatch', 'db snatch', 'single arm dumbbell snatch'], measure: 'reps', loaded: true, equipment: 'minimal', fit: { category: 'olympic_lift', name: 'dumbbell_snatch' } },
  { id: 'db-hang-snatch', name: 'DB hang snatch', family: 'halteres', aliases: ['dumbbell hang snatch'], measure: 'reps', loaded: true, equipment: 'minimal', fit: { category: 'olympic_lift' } },
  { id: 'db-clean', name: 'DB clean', family: 'halteres', aliases: ['dumbbell clean'], measure: 'reps', loaded: true, equipment: 'minimal', fit: { category: 'olympic_lift', name: 'dumbbell_clean' } },
  { id: 'db-hang-clean', name: 'DB hang clean', family: 'halteres', aliases: ['dumbbell hang clean'], measure: 'reps', loaded: true, equipment: 'minimal', fit: { category: 'olympic_lift' } },
  { id: 'db-clean-jerk', name: 'DB clean & jerk', family: 'halteres', aliases: ['dumbbell clean and jerk'], measure: 'reps', loaded: true, equipment: 'minimal', fit: { category: 'olympic_lift' } },
  { id: 'db-thruster', name: 'DB thruster', family: 'halteres', aliases: ['dumbbell thruster', 'db thrusters'], measure: 'reps', loaded: true, equipment: 'minimal', fit: { category: 'squat', name: 'dumbbell_thruster' } },
  { id: 'db-push-press', name: 'DB push press', family: 'halteres', aliases: ['dumbbell push press'], measure: 'reps', loaded: true, equipment: 'minimal', fit: { category: 'shoulder_press' } },
  { id: 'db-push-jerk', name: 'DB push jerk', family: 'halteres', aliases: ['dumbbell push jerk'], measure: 'reps', loaded: true, equipment: 'minimal', fit: { category: 'shoulder_press' } },
  { id: 'db-shoulder-press', name: 'DB shoulder press', family: 'halteres', aliases: ['dumbbell shoulder press', 'dumbbell strict press', 'db overhead press'], measure: 'reps', loaded: true, equipment: 'minimal', fit: { category: 'shoulder_press', name: 'dumbbell_shoulder_press' } },
  { id: 'db-front-squat', name: 'DB front squat', family: 'halteres', aliases: ['dumbbell front squat'], measure: 'reps', loaded: true, equipment: 'minimal', fit: { category: 'squat' } },
  { id: 'db-deadlift', name: 'DB deadlift', family: 'halteres', aliases: ['dumbbell deadlift'], measure: 'reps', loaded: true, equipment: 'minimal', fit: { category: 'deadlift', name: 'dumbbell_deadlift' } },
  { id: 'db-walking-lunge', name: 'DB walking lunge', family: 'halteres', aliases: ['dumbbell walking lunge', 'dumbbell lunge'], measure: 'reps', loaded: true, equipment: 'minimal', fit: { category: 'lunge', name: 'dumbbell_lunge' } },
  { id: 'db-front-rack-lunge', name: 'DB front rack lunge', family: 'halteres', aliases: ['dumbbell front rack lunge'], measure: 'reps', loaded: true, equipment: 'minimal', fit: { category: 'lunge' } },
  { id: 'db-overhead-lunge', name: 'DB overhead lunge', family: 'halteres', aliases: ['dumbbell overhead lunge'], measure: 'reps', loaded: true, equipment: 'minimal', fit: { category: 'lunge' } },
  { id: 'db-box-step-up', name: 'DB box step-up', family: 'halteres', aliases: ['dumbbell box step up', 'dumbbell step up'], measure: 'reps', loaded: true, equipment: 'full', fit: { category: 'lunge', name: 'step_up' } },
  { id: 'db-overhead-step-up', name: 'DB overhead step-up', family: 'halteres', aliases: ['dumbbell overhead step up'], measure: 'reps', loaded: true, equipment: 'full', fit: { category: 'lunge' } },
  { id: 'db-row', name: 'DB bent-over row', family: 'halteres', aliases: ['dumbbell row', 'dumbbell bent over row', 'db row'], measure: 'reps', loaded: true, equipment: 'minimal', fit: { category: 'row', name: 'dumbbell_row' } },
  { id: 'renegade-row', name: 'Renegade row', family: 'halteres', aliases: ['renegade rows', 'plank row'], measure: 'reps', loaded: true, equipment: 'minimal', fit: { category: 'row' } },
  { id: 'devil-press', name: 'Devil press', family: 'halteres', aliases: ['devils press', 'devil presses'], measure: 'reps', loaded: true, equipment: 'minimal', fit: { category: 'total_body' } },
  { id: 'man-maker', name: 'Man maker', family: 'halteres', aliases: ['man makers', 'manmaker'], measure: 'reps', loaded: true, equipment: 'minimal', fit: { category: 'total_body' } },
  // Tier 2 — renfo / muscu
  { id: 'db-rdl', name: 'DB Romanian deadlift', family: 'halteres', aliases: ['dumbbell romanian deadlift', 'dumbbell rdl', 'db rdl'], measure: 'reps', loaded: true, equipment: 'minimal', fit: { category: 'deadlift' } },
  { id: 'db-bulgarian-split-squat', name: 'DB Bulgarian split squat', family: 'halteres', aliases: ['dumbbell bulgarian split squat', 'bulgarian split squat'], measure: 'reps', loaded: true, equipment: 'minimal', fit: { category: 'squat' } },
  { id: 'db-bench-press', name: 'DB bench press', family: 'halteres', aliases: ['dumbbell bench press', 'db bench'], measure: 'reps', loaded: true, equipment: 'full', fit: { category: 'bench_press', name: 'dumbbell_bench_press' } },
  { id: 'db-floor-press', name: 'DB floor press', family: 'halteres', aliases: ['dumbbell floor press'], measure: 'reps', loaded: true, equipment: 'minimal', fit: { category: 'bench_press' } },
  { id: 'db-curl', name: 'DB biceps curl', family: 'halteres', aliases: ['dumbbell curl', 'dumbbell biceps curl', 'db curl'], measure: 'reps', loaded: true, equipment: 'minimal', fit: { category: 'curl', name: 'dumbbell_curl' } },
  { id: 'db-hammer-curl', name: 'DB hammer curl', family: 'halteres', aliases: ['dumbbell hammer curl', 'hammer curl'], measure: 'reps', loaded: true, equipment: 'minimal', fit: { category: 'curl', name: 'dumbbell_hammer_curl' } },
  { id: 'db-lateral-raise', name: 'DB lateral raise', family: 'halteres', aliases: ['dumbbell lateral raise', 'side raise', 'élévations latérales'], measure: 'reps', loaded: true, equipment: 'minimal', fit: { category: 'lateral_raise', name: 'dumbbell_lateral_raise' } },
  { id: 'db-triceps-extension', name: 'DB triceps extension', family: 'halteres', aliases: ['dumbbell triceps extension', 'skull crusher', 'extension triceps'], measure: 'reps', loaded: true, equipment: 'minimal', fit: { category: 'triceps_extension' } },
  { id: 'db-flye', name: 'DB flye (écarté)', family: 'halteres', aliases: ['dumbbell flye', 'dumbbell fly', 'écarté haltères'], measure: 'reps', loaded: true, equipment: 'full', fit: { category: 'flye', name: 'dumbbell_flye' } },
  { id: 'turkish-get-up', name: 'Turkish get-up', family: 'halteres', aliases: ['turkish getup', 'tgu', 'get up'], measure: 'reps', loaded: true, equipment: 'minimal', fit: { category: 'total_body' } },

  // ---------- Gymnastique (poids de corps) ----------
  { id: 'pullup', name: 'Pull-up', family: 'gymnastique', aliases: ['pull-up', 'pull ups', 'pullups', 'tractions'], measure: 'reps', loaded: false, equipment: 'minimal', fit: { category: 'pull_up', name: 'pull_up' } },
  { id: 'c2b', name: 'Chest-to-bar', family: 'gymnastique', aliases: ['chest to bar', 'ctb', 'c2b'], measure: 'reps', loaded: false, equipment: 'minimal', fit: { category: 'pull_up' } },
  { id: 'muscle-up', name: 'Muscle-up', family: 'gymnastique', aliases: ['muscle ups', 'muscle-ups', 'mu'], measure: 'reps', loaded: false, equipment: 'minimal', fit: { category: 'pull_up' } },
  { id: 'pushup', name: 'Push-up', family: 'gymnastique', aliases: ['push-up', 'push ups', 'pushups', 'pompes'], measure: 'reps', loaded: false, equipment: 'none', fit: { category: 'push_up', name: 'push_up' } },
  { id: 'hspu', name: 'Handstand push-up', family: 'gymnastique', aliases: ['handstand push ups', 'hspu', 'admt'], measure: 'reps', loaded: false, equipment: 'none', fit: { category: 'push_up' } },
  { id: 'ring-dip', name: 'Ring dip', family: 'gymnastique', aliases: ['ring dips', 'dips anneaux'], measure: 'reps', loaded: false, equipment: 'full', fit: { category: 'push_up', name: 'ring_dip' } },
  { id: 'dip', name: 'Dip', family: 'gymnastique', aliases: ['dips'], measure: 'reps', loaded: false, equipment: 'full', fit: { category: 'push_up', name: 'dip' } },
  { id: 'pistol', name: 'Pistol (squat 1 jambe)', family: 'gymnastique', aliases: ['pistols', 'pistol squat', 'single leg squat'], measure: 'reps', loaded: false, equipment: 'none', fit: { category: 'squat', name: 'single_leg_squat' } },
  { id: 'air-squat', name: 'Air squat', family: 'gymnastique', aliases: ['air squats', 'squats', 'squat'], measure: 'reps', loaded: false, equipment: 'none', fit: { category: 'squat', name: 'air_squat' } },
  { id: 'lunge', name: 'Fente', family: 'gymnastique', aliases: ['lunge', 'lunges', 'fentes'], measure: 'reps', loaded: false, equipment: 'none', fit: { category: 'lunge', name: 'lunge' } },
  { id: 'box-jump', name: 'Box jump', family: 'gymnastique', aliases: ['box jumps', 'sauts de boîte'], measure: 'reps', loaded: false, equipment: 'full', fit: { category: 'plyo', name: 'box_jump' } },
  { id: 'burpee', name: 'Burpee', family: 'gymnastique', aliases: ['burpees'], measure: 'reps', loaded: false, equipment: 'none', fit: { category: 'total_body', name: 'burpee' } },
  { id: 'burpee-over-bar', name: 'Burpee over bar', family: 'gymnastique', aliases: ['bar facing burpee', 'burpee over the bar', 'burpees over bar'], measure: 'reps', loaded: false, equipment: 'full', fit: { category: 'total_body', name: 'burpee' } },
  { id: 'wall-ball', name: 'Wall ball', family: 'gymnastique', aliases: ['wall balls', 'wall-ball shots', 'wbs'], measure: 'reps', loaded: true, equipment: 'full', fit: { category: 'squat', name: 'wall_ball' } },
  { id: 'wall-walk', name: 'Wall walk', family: 'gymnastique', aliases: ['wall walks'], measure: 'reps', loaded: false, equipment: 'none', fit: { category: 'total_body' } },
  { id: 'handstand-walk', name: 'Handstand walk', family: 'gymnastique', aliases: ['handstand walks', 'marche en atr', 'hs walk'], measure: 'm', loaded: false, equipment: 'none', fit: { category: 'total_body' } },
  { id: 'rope-climb', name: 'Montée de corde', family: 'gymnastique', aliases: ['rope climb', 'rope climbs', 'montées de corde'], measure: 'reps', loaded: false, equipment: 'full', fit: { category: 'pull_up', name: 'rope_climb' } },

  // ---------- Gainage / core ----------
  { id: 'situp', name: 'Sit-up', family: 'core', aliases: ['sit-up', 'sit ups', 'situps', 'abdos'], measure: 'reps', loaded: false, equipment: 'none', fit: { category: 'sit_up', name: 'sit_up' } },
  { id: 'ghd-situp', name: 'GHD sit-up', family: 'core', aliases: ['ghd sit ups', 'ghd situps'], measure: 'reps', loaded: false, equipment: 'full', fit: { category: 'sit_up' } },
  { id: 't2b', name: 'Toes-to-bar', family: 'core', aliases: ['toes to bar', 'ttb', 't2b'], measure: 'reps', loaded: false, equipment: 'minimal', fit: { category: 'leg_raise' } },
  { id: 'k2e', name: 'Knees-to-elbow', family: 'core', aliases: ['knees to elbow', 'k2e', 'genoux coudes'], measure: 'reps', loaded: false, equipment: 'minimal', fit: { category: 'leg_raise' } },
  { id: 'back-extension', name: 'Back extension', family: 'core', aliases: ['back extensions', 'hyperextension', 'extension lombaire'], measure: 'reps', loaded: false, equipment: 'full', fit: { category: 'hyperextension' } },

  // ---------- Kettlebell / odd object ----------
  { id: 'kb-swing', name: 'Kettlebell swing', family: 'kettlebell', aliases: ['kettlebell swings', 'kb swing', 'kbs', 'swings'], measure: 'reps', loaded: true, equipment: 'full', fit: { category: 'hip_swing', name: 'kettlebell_swing' } },
  { id: 'goblet-squat', name: 'Goblet squat', family: 'kettlebell', aliases: ['goblet squats', 'dumbbell goblet squat'], measure: 'reps', loaded: true, equipment: 'minimal', fit: { category: 'squat', name: 'goblet_squat' } },
  { id: 'farmer-carry', name: 'Farmer carry', family: 'kettlebell', aliases: ['farmer walk', 'farmers walk', 'portage', 'dumbbell carry'], measure: 'm', loaded: true, equipment: 'minimal', fit: { category: 'carry', name: 'farmers_walk' } },

  // ---------- Monostructural (cardio) ----------
  { id: 'run', name: 'Course', family: 'monostructural', aliases: ['run', 'running', 'courir', 'course à pied'], measure: 'm', loaded: false, equipment: 'none', fit: { category: 'run', name: 'run' } },
  { id: 'row', name: 'Rameur', family: 'monostructural', aliases: ['row', 'rowing', 'rameur'], measure: 'm', loaded: false, equipment: 'full', fit: { category: 'cardio' } },
  { id: 'bike', name: 'Vélo / Assault bike', family: 'monostructural', aliases: ['bike', 'assault bike', 'echo bike', 'vélo'], measure: 'cal', loaded: false, equipment: 'full', fit: { category: 'cardio' } },
  { id: 'double-under', name: 'Double-under', family: 'monostructural', aliases: ['double unders', 'dus', 'double-unders'], measure: 'reps', loaded: false, equipment: 'minimal', fit: { category: 'cardio', name: 'jump_rope' } },
  { id: 'single-under', name: 'Single-under', family: 'monostructural', aliases: ['single unders', 'sus', 'corde à sauter'], measure: 'reps', loaded: false, equipment: 'minimal', fit: { category: 'cardio', name: 'jump_rope' } },
];

export const MOVEMENT_BY_ID = Object.fromEntries(MOVEMENTS.map((m) => [m.id, m]));

// Formate les mouvements structurés d'un WOD ou d'une entrée d'historique en
// lignes prêtes à afficher. Renvoie null si aucun mouvement structuré (l'appelant
// retombe alors sur le texte libre `description`).
export function formatMovements(obj) {
  if (!obj || !Array.isArray(obj.movements) || obj.movements.length === 0) return null;
  const scheme = Array.isArray(obj.scheme) && obj.scheme.length ? obj.scheme : null;
  const lines = obj.movements.map((mv) => {
    const m = MOVEMENT_BY_ID[mv.movementId];
    const name = m ? m.name : mv.movementId;
    const measure = mv.measure || (m ? m.measure : 'reps');
    const qty = !scheme && mv.value != null
      ? `${mv.value}${measure === 'reps' ? '' : ' ' + measure} `
      : '';
    const load = mv.load ? ` — ${mv.load.value} ${mv.load.unit}` : '';
    return `• ${qty}${name}${load}`;
  });
  return scheme ? [`${scheme.join('-')} reps`, ...lines] : lines;
}
