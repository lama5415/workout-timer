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
  },
  {
    id: 'randy', name: 'Randy', category: 'hero', type: 'fortime',
    params: { capSec: 900 },
    description: 'For Time :\n• 75 power snatches (34/25 kg)',
    movements: [
      { movementId: 'power-snatch', value: 75, load: { value: 34, unit: 'kg' } },
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
