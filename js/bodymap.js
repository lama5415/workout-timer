// Figure corporelle schématique (face + dos) dont on colore les zones
// musculaires selon un ensemble primaire/secondaire. Sans dépendance ni build :
// un simple SVG inline piloté par la donnée (cf. muscles.js).

import { MUSCLE_BY_ID } from './muscles.js';

const ell = (cx, cy, rx, ry) => `<ellipse cx="${cx}" cy="${cy}" rx="${rx}" ry="${ry}"/>`;
const rect = (x, y, w, h, r) => `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}"/>`;

// Silhouette « pain d'épice » pour une figure, décalée de `ox` en x.
function silhouette(ox) {
  return `<g class="silhouette">
    <circle cx="${ox + 60}" cy="18" r="11"/>
    ${rect(ox + 55, 27, 10, 6, 2)}
    ${rect(ox + 42, 32, 36, 58, 10)}
    ${rect(ox + 31, 35, 10, 46, 5)}${rect(ox + 79, 35, 10, 46, 5)}
    ${rect(ox + 30, 80, 9, 30, 4)}${rect(ox + 81, 80, 9, 30, 4)}
    ${rect(ox + 46, 88, 12, 56, 6)}${rect(ox + 62, 88, 12, 56, 6)}
    ${rect(ox + 47, 142, 10, 56, 5)}${rect(ox + 63, 142, 10, 56, 5)}
  </g>`;
}

// Zones musculaires par vue. Chaque entrée : id -> liste de formes SVG.
const FRONT = {
  'front-deltoids': [ell(46, 38, 6, 5), ell(74, 38, 6, 5)],
  'chest': [ell(52, 47, 7, 5), ell(68, 47, 7, 5)],
  'biceps': [ell(36, 55, 4, 9), ell(84, 55, 4, 9)],
  'forearms': [ell(35, 90, 4, 9), ell(85, 90, 4, 9)],
  'abs': [rect(54, 54, 12, 28, 3)],
  'obliques': [ell(49, 68, 3, 9), ell(71, 68, 3, 9)],
  'quadriceps': [ell(52, 110, 6, 18), ell(68, 110, 6, 18)],
  'adductors': [ell(60, 112, 4, 14)],
};
const BACK = {
  'trapezius': [rect(170, 34, 20, 12, 4)],
  'back-deltoids': [ell(166, 40, 6, 5), ell(194, 40, 6, 5)],
  'triceps': [ell(156, 55, 4, 9), ell(204, 55, 4, 9)],
  'forearms': [ell(155, 90, 4, 9), ell(205, 90, 4, 9)],
  'lats': [ell(172, 58, 6, 11), ell(188, 58, 6, 11)],
  'lower-back': [rect(174, 72, 12, 14, 3)],
  'gluteal': [ell(172, 96, 7, 9), ell(188, 96, 7, 9)],
  'hamstrings': [ell(172, 120, 6, 18), ell(188, 120, 6, 18)],
  'calves': [ell(172, 158, 6, 14), ell(188, 158, 6, 14)],
};

function muscleGroups(config, primary, secondary) {
  return Object.entries(config).map(([id, shapes]) => {
    const cls = primary.has(id) ? 'm primary' : secondary.has(id) ? 'm secondary' : 'm';
    return `<g class="${cls}" data-muscle="${id}">${shapes.join('')}</g>`;
  }).join('');
}

// SVG complet. `worked` = { primary: [...ids], secondary: [...ids] }.
export function bodyMapSvg(worked) {
  const primary = new Set(worked?.primary || []);
  const secondary = new Set(worked?.secondary || []);
  return `<svg class="bodymap" viewBox="20 2 205 218" role="img" aria-label="Muscles sollicités">
    ${silhouette(0)}${silhouette(120)}
    ${muscleGroups(FRONT, primary, secondary)}
    ${muscleGroups(BACK, primary, secondary)}
    <text x="60" y="214">Face</text>
    <text x="180" y="214">Dos</text>
  </svg>`;
}

// Légende textuelle (puces colorées) sous la figure.
export function muscleLegend(worked) {
  const chip = (id, cls) => {
    const label = MUSCLE_BY_ID[id]?.label || id;
    return `<span class="muscle-chip ${cls}">${label}</span>`;
  };
  const primary = worked?.primary || [];
  const secondary = worked?.secondary || [];
  if (!primary.length && !secondary.length) return '';
  return `<div class="muscle-legend">
    ${primary.map((id) => chip(id, 'primary')).join('')}
    ${secondary.map((id) => chip(id, 'secondary')).join('')}
  </div>`;
}
