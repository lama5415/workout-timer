// Base de WODs de référence + schéma des types.
//
// Types de WOD :
//  - fortime   : chrono qui monte, time cap optionnel (params.capSec)
//  - amrap     : durée fixe (params.durationSec), on compte les rounds
//  - emom      : params.rounds intervalles de params.intervalSec (60 par défaut)
//  - tabata    : params.rounds x (params.workSec travail / params.restSec repos)
//  - intervals : séquence libre d'étapes (params.steps) répétée params.rounds fois

export const TYPE_LABELS = {
  fortime: 'For Time',
  amrap: 'AMRAP',
  emom: 'EMOM',
  tabata: 'Tabata',
  intervals: 'Intervalles',
};

export const CATEGORY_LABELS = {
  girls: 'Girls',
  hero: 'Héros',
  open: 'Open',
  generic: 'Génériques',
  custom: 'Mes WODs',
};

export const REFERENCE_WODS = [
  // ---------- Benchmarks « Girls » ----------
  {
    id: 'fran', name: 'Fran', category: 'girls', type: 'fortime',
    params: { capSec: 600 },
    description: '21-15-9 reps de :\n• Thrusters (43/30 kg)\n• Pull-ups',
    scheme: [21, 15, 9],
    movements: [
      { movementId: 'thruster', load: { value: 43, unit: 'kg' } },
      { movementId: 'pullup' },
    ],
  },
  {
    id: 'cindy', name: 'Cindy', category: 'girls', type: 'amrap',
    params: { durationSec: 1200 },
    description: 'AMRAP 20 min :\n• 5 pull-ups\n• 10 push-ups\n• 15 air squats',
    movements: [
      { movementId: 'pullup', value: 5 },
      { movementId: 'pushup', value: 10 },
      { movementId: 'air-squat', value: 15 },
    ],
  },
  {
    id: 'annie', name: 'Annie', category: 'girls', type: 'fortime',
    params: { capSec: 900 },
    description: '50-40-30-20-10 reps de :\n• Double-unders\n• Sit-ups',
    scheme: [50, 40, 30, 20, 10],
    movements: [
      { movementId: 'double-under' },
      { movementId: 'situp' },
    ],
  },
  {
    id: 'grace', name: 'Grace', category: 'girls', type: 'fortime',
    params: { capSec: 600 },
    description: 'For Time :\n• 30 clean & jerks (61/43 kg)',
    movements: [
      { movementId: 'clean-jerk', value: 30, load: { value: 61, unit: 'kg' } },
    ],
  },
  {
    id: 'helen', name: 'Helen', category: 'girls', type: 'fortime',
    params: { capSec: 900 },
    description: '3 rounds For Time :\n• 400 m de course\n• 21 kettlebell swings (24/16 kg)\n• 12 pull-ups',
    movements: [
      { movementId: 'run', value: 400 },
      { movementId: 'kb-swing', value: 21, load: { value: 24, unit: 'kg' } },
      { movementId: 'pullup', value: 12 },
    ],
  },
  {
    id: 'karen', name: 'Karen', category: 'girls', type: 'fortime',
    params: { capSec: 900 },
    description: 'For Time :\n• 150 wall-ball shots (9/6 kg)',
    movements: [
      { movementId: 'wall-ball', value: 150, load: { value: 9, unit: 'kg' } },
    ],
  },
  {
    id: 'diane', name: 'Diane', category: 'girls', type: 'fortime',
    params: { capSec: 600 },
    description: '21-15-9 reps de :\n• Deadlifts (102/70 kg)\n• Handstand push-ups',
    scheme: [21, 15, 9],
    movements: [
      { movementId: 'deadlift', load: { value: 102, unit: 'kg' } },
      { movementId: 'hspu' },
    ],
  },
  {
    id: 'isabel', name: 'Isabel', category: 'girls', type: 'fortime',
    params: { capSec: 600 },
    description: 'For Time :\n• 30 snatches (61/43 kg)',
    movements: [
      { movementId: 'snatch', value: 30, load: { value: 61, unit: 'kg' } },
    ],
  },
  {
    id: 'jackie', name: 'Jackie', category: 'girls', type: 'fortime',
    params: { capSec: 900 },
    description: 'For Time :\n• 1000 m de rameur\n• 50 thrusters (20/15 kg)\n• 30 pull-ups',
    movements: [
      { movementId: 'row', value: 1000 },
      { movementId: 'thruster', value: 50, load: { value: 20, unit: 'kg' } },
      { movementId: 'pullup', value: 30 },
    ],
  },
  {
    id: 'mary', name: 'Mary', category: 'girls', type: 'amrap',
    params: { durationSec: 1200 },
    description: 'AMRAP 20 min :\n• 5 handstand push-ups\n• 10 pistols (alternés)\n• 15 pull-ups',
    movements: [
      { movementId: 'hspu', value: 5 },
      { movementId: 'pistol', value: 10, note: 'alternés' },
      { movementId: 'pullup', value: 15 },
    ],
  },
  {
    id: 'chelsea', name: 'Chelsea', category: 'girls', type: 'emom',
    params: { rounds: 30, intervalSec: 60 },
    description: 'EMOM 30 min :\n• 5 pull-ups\n• 10 push-ups\n• 15 air squats\nchaque minute.',
    movements: [
      { movementId: 'pullup', value: 5 },
      { movementId: 'pushup', value: 10 },
      { movementId: 'air-squat', value: 15 },
    ],
  },
  {
    id: 'nicole', name: 'Nicole', category: 'girls', type: 'amrap',
    params: { durationSec: 1200 },
    description: 'AMRAP 20 min :\n• 400 m de course\n• Max pull-ups (noter le total de pull-ups)',
    movements: [
      { movementId: 'run', value: 400 },
      { movementId: 'pullup', note: 'max' },
    ],
  },
  {
    id: 'barbara', name: 'Barbara', category: 'girls', type: 'intervals',
    params: {
      rounds: 5,
      steps: [
        { label: 'Round : 20 pull-ups, 30 push-ups, 40 sit-ups, 50 squats', durationSec: 420, kind: 'work' },
        { label: 'Repos', durationSec: 180, kind: 'rest' },
      ],
    },
    description: '5 rounds, chacun :\n• 20 pull-ups\n• 30 push-ups\n• 40 sit-ups\n• 50 air squats\n3 min de repos entre les rounds (cap de 7 min par round de travail).',
    movements: [
      { movementId: 'pullup', value: 20 },
      { movementId: 'pushup', value: 30 },
      { movementId: 'situp', value: 40 },
      { movementId: 'air-squat', value: 50 },
    ],
  },

  // ---------- Hero WODs ----------
  {
    id: 'murph', name: 'Murph', category: 'hero', type: 'fortime',
    params: { capSec: 3600 },
    description: 'For Time (avec gilet lesté 9/6 kg) :\n• 1 mile de course (1,6 km)\n• 100 pull-ups\n• 200 push-ups\n• 300 air squats\n• 1 mile de course (1,6 km)\nPartitionner les pull-ups/push-ups/squats si besoin.',
    movements: [
      { movementId: 'run', value: 1600 },
      { movementId: 'pullup', value: 100 },
      { movementId: 'pushup', value: 200 },
      { movementId: 'air-squat', value: 300 },
      { movementId: 'run', value: 1600 },
    ],
  },
  {
    id: 'dt', name: 'DT', category: 'hero', type: 'fortime',
    params: { capSec: 900 },
    description: '5 rounds For Time (70/47,5 kg) :\n• 12 deadlifts\n• 9 hang power cleans\n• 6 push jerks',
    movements: [
      { movementId: 'deadlift', value: 12, load: { value: 70, unit: 'kg' } },
      { movementId: 'hang-power-clean', value: 9, load: { value: 70, unit: 'kg' } },
      { movementId: 'push-jerk', value: 6, load: { value: 70, unit: 'kg' } },
    ],
  },
  {
    id: 'jt', name: 'JT', category: 'hero', type: 'fortime',
    params: { capSec: 1200 },
    description: '21-15-9 reps de :\n• Handstand push-ups\n• Ring dips\n• Push-ups',
    scheme: [21, 15, 9],
    movements: [
      { movementId: 'hspu' },
      { movementId: 'ring-dip' },
      { movementId: 'pushup' },
    ],
  },
  {
    id: 'michael', name: 'Michael', category: 'hero', type: 'fortime',
    params: { capSec: 1800 },
    description: '3 rounds For Time :\n• 800 m de course\n• 50 back extensions\n• 50 sit-ups',
    movements: [
      { movementId: 'run', value: 800 },
      { movementId: 'back-extension', value: 50 },
      { movementId: 'situp', value: 50 },
    ],
  },
  {
    id: 'randy', name: 'Randy', category: 'hero', type: 'fortime',
    params: { capSec: 900 },
    description: 'For Time :\n• 75 power snatches (34/25 kg)',
    movements: [
      { movementId: 'power-snatch', value: 75, load: { value: 34, unit: 'kg' } },
    ],
  },

  // ---------- CrossFit Open ----------
  {
    id: 'open-17-1', name: 'Open 17.1', category: 'open', type: 'fortime',
    params: { capSec: 1200 },
    description: 'For Time (cap 20 min) :\n10-20-30-40-50 dumbbell snatches (22,5/15 kg)\navec 15 burpee box jump-overs (61/51 cm) après chaque série.',
    movements: [
      { movementId: 'db-snatch', load: { value: 22.5, unit: 'kg' } },
      { movementId: 'box-jump' },
    ],
  },
  {
    id: 'open-17-5', name: 'Open 17.5', category: 'open', type: 'fortime',
    params: { capSec: 2400 },
    description: '10 rounds For Time (cap 40 min) :\n• 9 thrusters (43/29 kg)\n• 35 double-unders',
    movements: [
      { movementId: 'thruster', value: 9, load: { value: 43, unit: 'kg' } },
      { movementId: 'double-under', value: 35 },
    ],
  },
  {
    id: 'open-19-1', name: 'Open 19.1', category: 'open', type: 'amrap',
    params: { durationSec: 900 },
    description: 'AMRAP 15 min :\n• 19 wall-ball shots (9/6 kg, cible 10/9 ft)\n• 19 calories au rameur',
    movements: [
      { movementId: 'wall-ball', value: 19, load: { value: 9, unit: 'kg' } },
      { movementId: 'row', value: 19, measure: 'cal' },
    ],
  },
  {
    id: 'open-20-1', name: 'Open 20.1', category: 'open', type: 'fortime',
    params: { capSec: 900 },
    description: '10 rounds For Time (cap 15 min) :\n• 8 ground-to-overhead (43/29 kg)\n• 10 burpees par-dessus la barre',
    movements: [
      { movementId: 'clean-jerk', value: 8, load: { value: 43, unit: 'kg' } },
      { movementId: 'burpee-over-bar', value: 10 },
    ],
  },
  {
    id: 'open-23-1', name: 'Open 23.1', category: 'open', type: 'amrap',
    params: { durationSec: 840 },
    description: 'AMRAP 14 min :\n• 60 calories au rameur\n• 50 toes-to-bars\n• 40 wall-ball shots (9/6 kg)\n• 30 cleans (61/43 kg)\n• 20 muscle-ups',
    movements: [
      { movementId: 'row', value: 60, measure: 'cal' },
      { movementId: 't2b', value: 50 },
      { movementId: 'wall-ball', value: 40, load: { value: 9, unit: 'kg' } },
      { movementId: 'clean', value: 30, load: { value: 61, unit: 'kg' } },
      { movementId: 'muscle-up', value: 20 },
    ],
  },
  {
    id: 'open-25-1', name: 'Open 25.1', category: 'open', type: 'amrap',
    params: { durationSec: 900 },
    description: 'AMRAP 15 min, en montée :\n• 3 lateral burpees par-dessus l\'haltère\n• 3 dumbbell hang clean-to-overhead (22,5/15 kg)\n• 30 ft (2×15 ft) de fente marchée\nÀ chaque round, +3 reps aux burpees et aux clean-to-overhead (la fente reste à 30 ft).',
    movements: [
      { movementId: 'burpee' },
      { movementId: 'db-clean-jerk', load: { value: 22.5, unit: 'kg' } },
      { movementId: 'lunge' },
    ],
  },
  {
    id: 'open-26-1', name: 'Open 26.1', category: 'open', type: 'fortime',
    params: { capSec: 720 },
    description: 'For Time (cap 12 min) — pyramide :\nWall-ball shots (9/6 kg, cible 10/9 ft) en 20-30-40-66-40-30-20,\nséparés par 18 box jump-overs (61/51 cm) ;\nles 2 transitions autour du pic (66) sont des medicine-ball box step-overs.',
    movements: [
      { movementId: 'wall-ball', load: { value: 9, unit: 'kg' } },
      { movementId: 'box-jump' },
    ],
  },
  {
    id: 'open-26-2', name: 'Open 26.2', category: 'open', type: 'fortime',
    params: { capSec: 900 },
    description: 'For Time (cap 15 min) — 3 rounds :\n• 80 ft de fente overhead haltère (22,5/15 kg, 1 bras par segment de 20 ft)\n• 20 dumbbell snatches alternés (22,5/15 kg)\n• 20 tractions (round 1) / chest-to-bar (round 2) / ring muscle-ups (round 3)',
    movements: [
      { movementId: 'db-overhead-lunge', load: { value: 22.5, unit: 'kg' } },
      { movementId: 'db-snatch', value: 20, load: { value: 22.5, unit: 'kg' } },
      { movementId: 'pullup', value: 20 },
      { movementId: 'c2b', value: 20 },
      { movementId: 'muscle-up', value: 20 },
    ],
  },
  {
    id: 'open-26-3', name: 'Open 26.3', category: 'open', type: 'fortime',
    params: { capSec: 960 },
    description: 'For Time (cap 16 min) — 6 rounds, charge croissante tous les 2 rounds :\nChaque round : 12 burpees par-dessus la barre, 12 cleans, 12 burpees par-dessus la barre, 12 thrusters.\nCharges : rounds 1-2 à 43/29 kg, rounds 3-4 à 52/34 kg, rounds 5-6 à 61/38 kg.',
    movements: [
      { movementId: 'burpee-over-bar', value: 12 },
      { movementId: 'clean', value: 12, load: { value: 43, unit: 'kg' } },
      { movementId: 'thruster', value: 12, load: { value: 43, unit: 'kg' } },
    ],
  },
  {
    id: 'open-24-1', name: 'Open 24.1', category: 'open', type: 'fortime',
    params: { capSec: 900 },
    description: 'For Time (cap 15 min), en 21-15-9 :\n• X dumbbell snatches (1 bras) + X burpees par-dessus l\'haltère\n• X dumbbell snatches (autre bras) + X burpees\n(21, puis 15, puis 9 de chaque). Haltère 22,5/15 kg.',
    movements: [
      { movementId: 'db-snatch', load: { value: 22.5, unit: 'kg' } },
      { movementId: 'burpee' },
    ],
  },
  {
    id: 'open-24-2', name: 'Open 24.2', category: 'open', type: 'amrap',
    params: { durationSec: 1200 },
    description: 'AMRAP 20 min :\n• 300 m de rameur\n• 10 deadlifts (83/56 kg)\n• 50 double-unders',
    movements: [
      { movementId: 'row', value: 300 },
      { movementId: 'deadlift', value: 10, load: { value: 83, unit: 'kg' } },
      { movementId: 'double-under', value: 50 },
    ],
  },
  {
    id: 'open-24-3', name: 'Open 24.3', category: 'open', type: 'fortime',
    params: { capSec: 900 },
    description: 'For Time (cap 15 min) :\n5 rounds de 10 thrusters (43/29 kg) + 10 chest-to-bar,\n1 min de repos,\npuis 5 rounds de 10 thrusters (61/43 kg) + 10 bar muscle-ups.',
    movements: [
      { movementId: 'thruster', value: 10, load: { value: 43, unit: 'kg' } },
      { movementId: 'c2b', value: 10 },
      { movementId: 'muscle-up', value: 10 },
    ],
  },
  {
    id: 'open-25-2', name: 'Open 25.2', category: 'open', type: 'fortime',
    params: { capSec: 720 },
    description: 'For Time (cap 12 min) :\n• 21 pull-ups, 42 double-unders, 21 thrusters (29/20 kg)\n• 18 chest-to-bar, 36 double-unders, 18 thrusters (38/25 kg)\n• 15 bar muscle-ups, 30 double-unders, 15 thrusters (47/29 kg)',
    movements: [
      { movementId: 'pullup', value: 21 },
      { movementId: 'double-under', value: 42 },
      { movementId: 'thruster', value: 21, load: { value: 29, unit: 'kg' } },
      { movementId: 'c2b', value: 18 },
      { movementId: 'muscle-up', value: 15 },
    ],
  },
  {
    id: 'open-25-3', name: 'Open 25.3', category: 'open', type: 'fortime',
    params: { capSec: 1200 },
    description: 'For Time (cap 20 min) :\n5 wall walks, 50 cal rameur, 5 wall walks, 25 deadlifts, 5 wall walks,\n25 cleans, 5 wall walks, 25 snatches, 5 wall walks, 50 cal rameur.\n(charges à la barre Rx — à compléter)',
    movements: [
      { movementId: 'wall-walk', value: 5 },
      { movementId: 'row', value: 50, measure: 'cal' },
      { movementId: 'deadlift', value: 25 },
      { movementId: 'clean', value: 25 },
      { movementId: 'snatch', value: 25 },
    ],
  },

  // ---------- Formats génériques ----------
  {
    id: 'tabata-classic', name: 'Tabata classique', category: 'generic', type: 'tabata',
    params: { rounds: 8, workSec: 20, restSec: 10 },
    description: '8 rounds :\n• 20 s de travail\n• 10 s de repos\nUn seul mouvement, intensité maximale.',
  },
  {
    id: 'emom-10', name: 'EMOM 10 min', category: 'generic', type: 'emom',
    params: { rounds: 10, intervalSec: 60 },
    description: 'Every Minute On the Minute pendant 10 minutes.\nDéfinis ton mouvement et tes reps.',
  },
  {
    id: 'emom-20', name: 'EMOM 20 min', category: 'generic', type: 'emom',
    params: { rounds: 20, intervalSec: 60 },
    description: 'Every Minute On the Minute pendant 20 minutes.\nDéfinis ton mouvement et tes reps.',
  },
  {
    id: 'amrap-12', name: 'AMRAP 12 min', category: 'generic', type: 'amrap',
    params: { durationSec: 720 },
    description: 'As Many Rounds As Possible en 12 minutes.\nDéfinis ton enchaînement.',
  },
  {
    id: 'amrap-20', name: 'AMRAP 20 min', category: 'generic', type: 'amrap',
    params: { durationSec: 1200 },
    description: 'As Many Rounds As Possible en 20 minutes.\nDéfinis ton enchaînement.',
  },
  {
    id: 'fortime-cap15', name: 'For Time (cap 15 min)', category: 'generic', type: 'fortime',
    params: { capSec: 900 },
    description: 'Chrono libre avec time cap de 15 minutes.',
  },
  {
    id: 'intervals-30-30', name: 'Intervalles 30/30 × 10', category: 'generic', type: 'intervals',
    params: {
      rounds: 10,
      steps: [
        { label: 'Travail', durationSec: 30, kind: 'work' },
        { label: 'Repos', durationSec: 30, kind: 'rest' },
      ],
    },
    description: '10 rounds :\n• 30 s de travail\n• 30 s de repos',
  },
];

// Construit la liste des segments chronométrés d'un WOD (hors compte à rebours initial).
// Chaque segment : { label, kind: 'work'|'rest', durationSec|null }
// durationSec null = segment ouvert (For Time sans cap), arrêté manuellement.
export function buildSegments(wod) {
  const p = wod.params || {};
  switch (wod.type) {
    case 'fortime':
      return [{ label: 'For Time', kind: 'work', durationSec: p.capSec || null }];
    case 'amrap':
      return [{ label: 'AMRAP', kind: 'work', durationSec: p.durationSec }];
    case 'emom': {
      const rounds = p.rounds || 10;
      const interval = p.intervalSec || 60;
      return Array.from({ length: rounds }, (_, i) => ({
        label: `Round ${i + 1}/${rounds}`, kind: 'work', durationSec: interval,
      }));
    }
    case 'tabata': {
      const rounds = p.rounds || 8;
      const segs = [];
      for (let i = 0; i < rounds; i++) {
        segs.push({ label: `Travail ${i + 1}/${rounds}`, kind: 'work', durationSec: p.workSec || 20 });
        if (i < rounds - 1) {
          segs.push({ label: `Repos ${i + 1}/${rounds - 1}`, kind: 'rest', durationSec: p.restSec || 10 });
        }
      }
      return segs;
    }
    case 'intervals': {
      const rounds = p.rounds || 1;
      const steps = p.steps || [];
      const segs = [];
      for (let r = 0; r < rounds; r++) {
        for (const s of steps) {
          const suffix = rounds > 1 ? ` (${r + 1}/${rounds})` : '';
          segs.push({ label: s.label + suffix, kind: s.kind || 'work', durationSec: s.durationSec });
        }
      }
      return segs;
    }
    default:
      return [];
  }
}

export function formatDuration(sec) {
  if (sec == null) return '—';
  const s = Math.round(sec);
  const m = Math.floor(s / 60);
  const r = s % 60;
  if (m === 0) return `${r} s`;
  if (r === 0) return `${m} min`;
  return `${m} min ${r.toString().padStart(2, '0')}`;
}

// Résumé court affiché dans les listes.
export function wodSummary(wod) {
  const p = wod.params || {};
  switch (wod.type) {
    case 'fortime':
      return p.capSec ? `Time cap ${formatDuration(p.capSec)}` : 'Chrono libre';
    case 'amrap':
      return formatDuration(p.durationSec);
    case 'emom':
      return `${p.rounds || 10} × ${formatDuration(p.intervalSec || 60)}`;
    case 'tabata':
      return `${p.rounds || 8} × ${p.workSec || 20} s / ${p.restSec || 10} s`;
    case 'intervals': {
      const total = buildSegments(wod).reduce((acc, s) => acc + (s.durationSec || 0), 0);
      return `${(p.steps || []).length} étapes × ${p.rounds || 1} — ${formatDuration(total)}`;
    }
    default:
      return '';
  }
}
