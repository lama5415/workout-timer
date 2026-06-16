// Export d'une séance au format FIT (binaire Garmin), importable dans Garmin
// Connect. Contrairement au TCX, le FIT permet de fixer le TYPE d'activité
// (sport/sub-sport) et d'embarquer les mouvements en messages « set »
// (répétitions + charge).
//
// Encodeur minimal, sans dépendance. Messages émis :
//   file_id, event(start/stop), record, lap, set, session, activity.
//
// ⚠️ À valider sur un vrai compte Garmin. Les numéros de messages et types de
// base sont standard ; les enums sport/sub_sport sont cosmétiques (une valeur
// inexacte n'empêche pas l'import, le type est juste réétiquetable dans Garmin).

const FIT_EPOCH = 631065600; // 1989-12-31T00:00:00Z en secondes Unix
function toFitTime(date) {
  return Math.round(date.getTime() / 1000) - FIT_EPOCH;
}

// Types de base FIT utilisés : { numéro de type de base, taille en octets }.
const BASE = {
  enum:    { n: 0x00, size: 1 },
  uint8:   { n: 0x02, size: 1 },
  uint16:  { n: 0x84, size: 2 },
  uint32:  { n: 0x86, size: 4 },
  uint16z: { n: 0x8B, size: 2 },
  uint32z: { n: 0x8C, size: 4 },
};

// CRC-16 FIT (algorithme officiel par demi-octets).
const CRC_TABLE = [
  0x0000, 0xCC01, 0xD801, 0x1400, 0xF001, 0x3C00, 0x2800, 0xE401,
  0xA001, 0x6C00, 0x7800, 0xB401, 0x5000, 0x9C01, 0x8801, 0x4400,
];
function crc16(crc, byte) {
  let tmp = CRC_TABLE[crc & 0xF];
  crc = (crc >> 4) & 0x0FFF;
  crc = crc ^ tmp ^ CRC_TABLE[byte & 0xF];
  tmp = CRC_TABLE[crc & 0xF];
  crc = (crc >> 4) & 0x0FFF;
  crc = crc ^ tmp ^ CRC_TABLE[(byte >> 4) & 0xF];
  return crc & 0xFFFF;
}

function pushUint(body, value, size) {
  for (let i = 0; i < size; i++) body.push((value >>> (8 * i)) & 0xFF);
}

// Accumulateur de messages (définitions + données).
class FitBody {
  constructor() {
    this.body = [];
    this.defs = {};
  }

  // fields : [{ num, base }]
  define(local, global, fields) {
    this.body.push(0x40 | local, 0, 0); // header def, reserved, archi little-endian
    pushUint(this.body, global, 2);
    this.body.push(fields.length);
    for (const f of fields) this.body.push(f.num, BASE[f.base].size, BASE[f.base].n);
    this.defs[local] = fields;
  }

  // values : aligné sur l'ordre des champs définis ; null = valeur « invalide ».
  data(local, values) {
    this.body.push(local);
    const fields = this.defs[local];
    for (let i = 0; i < fields.length; i++) {
      const size = BASE[fields[i].base].size;
      const v = values[i];
      if (v == null) for (let k = 0; k < size; k++) this.body.push(0xFF);
      else pushUint(this.body, v, size);
    }
  }
}

// sport=training(10) ; sub_sport par défaut strength_training(16) pour que
// Garmin affiche le détail des séries. Réétiquetable dans Garmin si besoin.
const SPORT_TRAINING = 10;
const SUBSPORT_STRENGTH = 16;

// Codes d'exercice du profil FIT : mouvement -> [category, category_subtype].
// category = famille (exercise_category) ; subtype = nom précis dans cette
// famille (null = famille seule). Couples vérifiés contre le profil FIT
// officiel (subtype présent dans l'enum de sa famille). Champs cosmétiques :
// une valeur absente/inexacte n'empêche pas l'import.
const FIT_EXERCISE = {
  // squat (28)
  'thruster': [28, 79], 'db-thruster': [28, 79], 'front-squat': [28, 8],
  'db-front-squat': [28, 27], 'back-squat': [28, 6], 'overhead-squat': [28, 44],
  'air-squat': [28, 61], 'pistol': [28, 47], 'goblet-squat': [28, 37],
  'wall-ball': [28, 83], 'db-bulgarian-split-squat': [28, 28],
  'db-box-step-up': [28, 32], 'db-overhead-step-up': [28, 32],
  // deadlift (8)
  'deadlift': [8, 0], 'db-deadlift': [8, 2], 'sdhp': [8, 16], 'db-rdl': [8, null],
  // olympic_lift (18)
  'clean': [18, 4], 'power-clean': [18, 2], 'hang-power-clean': [18, 0],
  'clean-jerk': [18, 5], 'snatch': [18, 9], 'power-snatch': [18, 3],
  'push-jerk': [18, 15], 'db-snatch': [18, 16], 'db-hang-snatch': [18, 17],
  'db-clean': [18, 12], 'db-hang-clean': [18, 12], 'db-clean-jerk': [18, 5],
  // shoulder_press (24)
  'push-press': [24, 3], 'strict-press': [24, 4], 'db-push-press': [24, 8],
  'db-push-jerk': [24, 8], 'db-shoulder-press': [24, 15],
  // bench_press (0)
  'bench-press': [0, 1], 'db-bench-press': [0, 6], 'db-floor-press': [0, 7],
  // pull_up (21) / push_up (22)
  'pullup': [21, 38], 'c2b': [21, null], 'muscle-up': [21, null],
  'rope-climb': [21, null], 'pushup': [22, 77], 'hspu': [22, 25],
  'ring-dip': [22, null], 'dip': [22, null],
  // lunge (17)
  'lunge': [17, 32], 'db-walking-lunge': [17, 77], 'db-front-rack-lunge': [17, 21],
  'db-overhead-lunge': [17, 0],
  // row (23) / curl (7) / flye (9) / lateral_raise (14) / triceps_extension (30)
  'db-row': [23, 2], 'renegade-row': [23, null], 'db-curl': [7, 37],
  'db-hammer-curl': [7, 16], 'db-flye': [9, 2], 'db-lateral-raise': [14, null],
  'db-triceps-extension': [30, 15],
  // plyo (20) / total_body (29)
  'box-jump': [20, null],
  'burpee': [29, 0], 'burpee-over-bar': [29, 0], 'man-maker': [29, 5],
  'devil-press': [29, null], 'turkish-get-up': [29, null], 'wall-walk': [29, null],
  'handstand-walk': [29, null],
  // core : sit_up (27) / leg_raise (16) / hyperextension (13)
  'situp': [27, null], 'ghd-situp': [27, null], 't2b': [16, 1], 'k2e': [16, 0],
  'back-extension': [13, null],
  // kettlebell : hip_swing (12) / squat / carry (3)
  'kb-swing': [12, null], 'farmer-carry': [3, 1],
  // cardio (2) / run (32)
  'run': [32, 0], 'row': [2, null], 'bike': [2, null],
  'double-under': [2, 6], 'single-under': [2, 6],
};

export function buildFit(entry) {
  const startDate = new Date(entry.startedAt);
  const fitStart = toFitTime(startDate);
  const totalSec = Math.max(1, Math.round(entry.totalSec || 0));
  const fitEnd = fitStart + totalSec;
  const totalMs = totalSec * 1000;
  const fit = new FitBody();

  // file_id (type=activity=4, manufacturer=development=255)
  fit.define(0, 0, [
    { num: 0, base: 'enum' }, { num: 1, base: 'uint16' }, { num: 2, base: 'uint16' },
    { num: 3, base: 'uint32z' }, { num: 4, base: 'uint32' },
  ]);
  fit.data(0, [4, 255, 0, 1, fitStart]);

  // event timer start
  fit.define(1, 21, [
    { num: 253, base: 'uint32' }, { num: 0, base: 'enum' }, { num: 1, base: 'enum' },
  ]);
  fit.data(1, [fitStart, 0, 0]); // event=timer, type=start

  // laps depuis les segments réalisés
  const segs = (entry.segments && entry.segments.length)
    ? entry.segments
    : [{ label: entry.name, kind: 'work', durationSec: totalSec }];
  let cursor = fitStart;
  const laps = [];
  const recordTimes = [fitStart];
  for (const s of segs) {
    const dur = Math.max(0, Math.round(s.durationSec || 0));
    laps.push({ start: cursor, end: cursor + dur, dur });
    cursor += dur;
    recordTimes.push(cursor);
  }

  // records (horodatés : élapsed time correct)
  fit.define(2, 20, [{ num: 253, base: 'uint32' }]);
  for (const t of recordTimes) fit.data(2, [t]);

  // laps
  fit.define(3, 19, [
    { num: 254, base: 'uint16' }, { num: 253, base: 'uint32' }, { num: 2, base: 'uint32' },
    { num: 7, base: 'uint32' }, { num: 8, base: 'uint32' },
  ]);
  laps.forEach((l, i) => fit.data(3, [i, l.end, l.start, l.dur * 1000, l.dur * 1000]));

  // sets (mouvements structurés)
  const moves = entry.movements || [];
  if (moves.length) {
    fit.define(4, 225, [
      { num: 254, base: 'uint32' }, { num: 0, base: 'uint32' }, { num: 3, base: 'uint16' },
      { num: 4, base: 'uint16' }, { num: 5, base: 'enum' }, { num: 7, base: 'uint16' },
      { num: 8, base: 'uint16' }, { num: 6, base: 'uint32' }, { num: 10, base: 'uint16' },
    ]);
    const schemeTotal = (entry.scheme && entry.scheme.length)
      ? entry.scheme.reduce((a, b) => a + b, 0) : null;
    const step = totalSec / (moves.length + 1);
    moves.forEach((mv, i) => {
      const ss = fitStart + Math.round(step * i);
      const se = fitStart + Math.round(step * (i + 1));
      const reps = schemeTotal != null ? schemeTotal : (mv.value != null ? mv.value : null);
      const weight = (mv.load && mv.load.unit === 'kg') ? Math.round(mv.load.value * 16) : null;
      const fx = FIT_EXERCISE[mv.movementId];
      const cat = fx ? fx[0] : null;
      const sub = fx ? fx[1] : null;
      // category(7), category_subtype(8) : set_type=active(1)
      fit.data(4, [se, (se - ss) * 1000, reps, weight, 1, cat, sub, ss, i]);
    });
  }

  // event timer stop
  fit.data(1, [fitEnd, 0, 4]); // event=timer, type=stop_all

  // session
  fit.define(5, 18, [
    { num: 254, base: 'uint16' }, { num: 253, base: 'uint32' }, { num: 2, base: 'uint32' },
    { num: 7, base: 'uint32' }, { num: 8, base: 'uint32' }, { num: 5, base: 'enum' },
    { num: 6, base: 'enum' }, { num: 25, base: 'uint16' }, { num: 26, base: 'uint16' },
  ]);
  fit.data(5, [0, fitEnd, fitStart, totalMs, totalMs, SPORT_TRAINING, SUBSPORT_STRENGTH, 0, laps.length]);

  // activity
  fit.define(6, 34, [
    { num: 253, base: 'uint32' }, { num: 0, base: 'uint32' }, { num: 1, base: 'uint16' },
    { num: 2, base: 'enum' }, { num: 3, base: 'enum' }, { num: 4, base: 'enum' },
  ]);
  fit.data(6, [fitEnd, totalMs, 1, 0, 26, 1]); // type=manual, event=activity(26), type=stop(1)

  return finalize(fit.body);
}

function finalize(body) {
  const dataSize = body.length;
  const header = [
    14, 0x20, 0, 0,
    dataSize & 0xFF, (dataSize >>> 8) & 0xFF, (dataSize >>> 16) & 0xFF, (dataSize >>> 24) & 0xFF,
    0x2E, 0x46, 0x49, 0x54, // ".FIT"
  ];
  const profile = 2140;
  header[2] = profile & 0xFF;
  header[3] = (profile >>> 8) & 0xFF;
  let hcrc = 0;
  for (let i = 0; i < 12; i++) hcrc = crc16(hcrc, header[i]);
  header.push(hcrc & 0xFF, (hcrc >>> 8) & 0xFF);

  let crc = 0;
  for (const b of header) crc = crc16(crc, b);
  for (const b of body) crc = crc16(crc, b);

  const out = new Uint8Array(header.length + body.length + 2);
  out.set(header, 0);
  out.set(body, header.length);
  out[out.length - 2] = crc & 0xFF;
  out[out.length - 1] = (crc >>> 8) & 0xFF;
  return out;
}

export function fitFilename(entry) {
  const date = new Date(entry.startedAt).toISOString().slice(0, 10);
  const name = entry.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'wod';
  return `${date}-${name}.fit`;
}

export async function exportFit(entry) {
  const bytes = buildFit(entry);
  const filename = fitFilename(entry);
  const file = new File([bytes], filename, { type: 'application/octet-stream' });

  if (navigator.canShare && navigator.canShare({ files: [file] })) {
    try {
      await navigator.share({ files: [file], title: entry.name });
      return 'shared';
    } catch (err) {
      if (err.name === 'AbortError') return 'cancelled';
    }
  }

  const url = URL.createObjectURL(new Blob([bytes], { type: 'application/octet-stream' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
  return 'downloaded';
}
