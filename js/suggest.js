// Moteur de suggestion du WOD suivant.
//
// Approche : on CLASSE les WODs existants (référence + customs) selon un score
// déterministe, explicable et hors-ligne — pas de génération.
// Critères :
//   - matériel disponible (filtre dur),
//   - fraîcheur musculaire : favorise les groupes peu sollicités récemment
//     (charge des séances passées pondérée par l'ancienneté),
//   - forme du jour : adapte la durée visée,
//   - récence : évite de reproposer la dernière séance, et si tu as déjà
//     chargé aujourd'hui, priorise les groupes frais.

import { buildSegments } from './wods.js';
import { MOVEMENT_BY_ID } from './movements.js';
import { MOVEMENT_MUSCLES, MUSCLES, aggregateMuscles } from './muscles.js';

const EQ_RANK = { none: 0, minimal: 1, full: 2 };
const HALFLIFE_DAYS = 2; // une séance compte moitié moins tous les 2 jours
// En-dessous, la charge récente est jugée négligeable (reprise) : ~4 j depuis
// la dernière sollicitation d'un muscle. On bascule alors sur la couverture.
const FRESH_THRESHOLD = 0.35;

// Durées visées (secondes) selon la forme.
const FITNESS_TARGET = {
  fatigue: { min: 360, max: 720, ideal: 540 },   // 6–12 min
  moyen: { min: 600, max: 1080, ideal: 840 },    // 10–18 min
  forme: { min: 900, max: 1800, ideal: 1200 },   // 15–30 min
};

function daysBetween(aMs, bMs) {
  return Math.abs(aMs - bMs) / 86400000;
}

// Mouvements effectifs d'une entrée d'historique (ou du WOD source).
function entryMovements(entry, wodById) {
  if (entry.movements && entry.movements.length) return entry.movements;
  const w = wodById[entry.wodId];
  return (w && w.movements) ? w.movements : [];
}

// Charge musculaire récente : muscleId -> poids cumulé (pondéré par ancienneté).
export function recentMuscleLoad(history, wodById, now = Date.now()) {
  const load = {};
  for (const e of history) {
    const days = daysBetween(now, new Date(e.startedAt).getTime());
    if (days > 10) continue;
    const w = Math.pow(0.5, days / HALFLIFE_DAYS);
    for (const mv of entryMovements(e, wodById)) {
      const mm = MOVEMENT_MUSCLES[mv.movementId];
      if (!mm) continue;
      for (const m of (mm.primary || [])) load[m] = (load[m] || 0) + w;
      for (const m of (mm.secondary || [])) load[m] = (load[m] || 0) + w * 0.5;
    }
  }
  return load;
}

// Niveau de matériel requis par un WOD (-1 si inconnu = WOD flexible).
function wodEquipmentRank(wod) {
  let r = -1;
  for (const mv of (wod.movements || [])) {
    const m = MOVEMENT_BY_ID[mv.movementId];
    if (m) r = Math.max(r, EQ_RANK[m.equipment] ?? 0);
  }
  return r;
}

// Durée estimée d'un WOD en secondes.
export function wodDurationSec(wod) {
  const p = wod.params || {};
  if (wod.type === 'fortime') return p.capSec || 600;
  if (wod.type === 'amrap') return p.durationSec || 720;
  const total = buildSegments(wod).reduce((a, s) => a + (s.durationSec || 0), 0);
  return total || 600;
}

// Score [0..1] et raisons pour un WOD candidat.
function scoreWod(wod, ctx) {
  const { load, maxLoad, target, lastWodId, trainedToday } = ctx;
  const reasons = [];
  const muscles = aggregateMuscles(wod.movements || []);
  const targeted = [...muscles.primary, ...muscles.secondary];

  // Composante musculaire.
  let muscleScore = 0.6; // neutre si muscles inconnus (WOD flexible)
  const denom = muscles.primary.length + muscles.secondary.length * 0.5;
  if (ctx.freshStart && targeted.length) {
    // Reprise (pas de charge récente) : on favorise un WOD complet (couverture).
    muscleScore = Math.min(1, denom / 10);
  } else if (targeted.length && maxLoad > 0) {
    // Fraîcheur : moyenne de (1 - charge/maxLoad) sur les muscles ciblés.
    let s = 0;
    for (const m of muscles.primary) s += 1 - (load[m] || 0) / maxLoad;
    for (const m of muscles.secondary) s += (1 - (load[m] || 0) / maxLoad) * 0.5;
    muscleScore = denom ? s / denom : 0.6;
  } else if (targeted.length) {
    muscleScore = 1; // muscles connus mais aucune charge récente => frais
  }

  // Durée vs forme du jour.
  const dur = wodDurationSec(wod);
  let durScore;
  if (dur >= target.min && dur <= target.max) durScore = 1;
  else {
    const dist = dur < target.min ? target.min - dur : dur - target.max;
    durScore = Math.max(0, 1 - dist / 900); // -1 par tranche de 15 min hors plage
  }

  let score = 0.55 * muscleScore + 0.45 * durScore;

  // Pénalités de récence.
  if (wod.id === lastWodId) score *= 0.3;
  if (trainedToday) score *= 0.85;

  // Raisons lisibles.
  const labelOf = (id) => (MUSCLES.find((x) => x.id === id) || {}).label || id;
  if (ctx.freshStart) {
    if (muscles.primary.length >= 3) reasons.push(`Reprise : WOD complet (${muscles.primary.length} groupes principaux)`);
  } else if (muscleScore >= 0.7 && muscles.primary.length) {
    reasons.push(`Cible des groupes peu sollicités récemment (${muscles.primary.slice(0, 3).map(labelOf).join(', ')})`);
  } else if (muscleScore <= 0.4 && muscles.primary.length) {
    reasons.push(`⚠️ Sollicite des groupes déjà bien travaillés (${muscles.primary.slice(0, 2).map(labelOf).join(', ')})`);
  }
  if (durScore === 1) reasons.push('Durée adaptée à ta forme du jour');
  if (wod.id === lastWodId) reasons.push('(ta dernière séance — pour varier, plutôt un autre)');

  return { wod, score, reasons, muscles, dur };
}

// Suggestion principale.
// settings : { fitness: 'fatigue'|'moyen'|'forme', equipment: 'none'|'minimal'|'full' }
// Retourne { suggestions: [{wod, score, reasons, muscles, dur}], load, context }.
export function suggestWods(history, allWods, settings, now = Date.now()) {
  const wodById = Object.fromEntries(allWods.map((w) => [w.id, w]));
  const load = recentMuscleLoad(history, wodById, now);
  const maxLoad = Math.max(0, ...Object.values(load));
  const target = FITNESS_TARGET[settings.fitness] || FITNESS_TARGET.moyen;
  const availRank = EQ_RANK[settings.equipment] ?? 2;

  const last = history[0]; // historique trié du plus récent au plus ancien
  const lastWodId = last ? last.wodId : null;
  const trainedToday = last ? daysBetween(now, new Date(last.startedAt).getTime()) < 1 : false;
  const freshStart = maxLoad < FRESH_THRESHOLD; // reprise / pas de charge récente

  const ctx = { load, maxLoad, target, lastWodId, trainedToday, freshStart };

  const candidates = allWods
    .filter((w) => wodEquipmentRank(w) <= availRank) // matériel suffisant (ou WOD flexible)
    .map((w) => scoreWod(w, ctx))
    .sort((a, b) => b.score - a.score);

  return {
    suggestions: candidates.slice(0, 3),
    load,
    maxLoad,
    trainedToday,
    freshStart,
    daysSinceLast: last ? daysBetween(now, new Date(last.startedAt).getTime()) : null,
  };
}
