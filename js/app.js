// Application : routeur par hash + écrans.
//  #/            liste des WODs
//  #/wod/:id     détail d'un WOD
//  #/edit/:id?   éditeur de WOD custom
//  #/timer/:id   timer
//  #/result/:id  saisie du résultat d'une séance
//  #/history     historique des séances

import {
  TYPE_LABELS, CATEGORY_LABELS, REFERENCE_WODS,
  buildSegments, formatDuration, wodSummary,
} from './wods.js';
import { TimerEngine, formatClock, COUNTDOWN_SEC } from './timer.js';
import { unlockAudio, playBeep } from './audio.js';
import {
  getCustomWods, saveCustomWod, deleteCustomWod, getAllWods, getWod, newId,
  getHistory, saveHistoryEntry, deleteHistoryEntry, getHistoryEntry,
} from './storage.js';
import { exportTcx } from './tcx.js';
import { exportFit } from './fit.js';
import { MOVEMENTS, MOVEMENT_BY_ID, FAMILIES, formatMovements } from './movements.js';
import { aggregateMuscles, musclesFor } from './muscles.js';
import { bodyMapSvg, muscleLegend } from './bodymap.js';
import { descriptionFor } from './descriptions.js';
import { suggestWods } from './suggest.js';

const app = document.getElementById('app');
let currentEngine = null;
let wakeLock = null;
let homeTab = 'all';
let homeSearch = '';
let movesSearch = '';

function esc(s) {
  return String(s ?? '')
    .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// « 21-15-9 » -> [21, 15, 9] ; renvoie null si aucun nombre saisi.
function parseScheme(s) {
  const nums = (String(s).match(/\d+/g) || []).map(Number).filter((n) => n > 0);
  return nums.length ? nums : null;
}

// <select> de mouvements groupé par famille, option `selectedId` présélectionnée.
function moveSelect(selectedId) {
  const groups = FAMILIES.map(([fam, label]) => {
    const opts = MOVEMENTS.filter((m) => m.family === fam)
      .map((m) => `<option value="${m.id}" ${m.id === selectedId ? 'selected' : ''}>${esc(m.name)}</option>`)
      .join('');
    return `<optgroup label="${esc(label)}">${opts}</optgroup>`;
  }).join('');
  return `<select class="m-id"><option value="">— mouvement —</option>${groups}</select>`;
}

// Bloc d'affichage des mouvements structurés (détail WOD / résultat). '' si aucun.
function movementsBlock(obj, title) {
  const lines = formatMovements(obj);
  if (!lines) return '';
  return `
    <div class="detail-block">
      <h3>${esc(title)}</h3>
      <div class="desc">${lines.map(esc).join('\n')}</div>
    </div>`;
}

// Bloc « Muscles sollicités » : figure corporelle + légende. '' si rien à montrer.
function muscleBlock(worked, title = 'Muscles sollicités') {
  if (!worked || (!worked.primary.length && !worked.secondary.length)) return '';
  return `
    <div class="detail-block">
      <h3>${esc(title)}</h3>
      ${bodyMapSvg(worked)}
      ${muscleLegend(worked)}
    </div>`;
}

// Une ligne de mouvement tappable (vers sa fiche) avec reps/charge formatés.
function movementRow(mv, scheme) {
  const m = MOVEMENT_BY_ID[mv.movementId];
  const name = m ? m.name : mv.movementId;
  const measure = mv.measure || (m ? m.measure : 'reps');
  const qty = !scheme && mv.value != null
    ? `${mv.value}${measure === 'reps' ? '' : ' ' + measure} ` : '';
  const load = mv.load ? ` — ${mv.load.value} ${mv.load.unit}` : '';
  const text = `${qty}${name}${load}${mv.note ? ` (${mv.note})` : ''}`;
  return m
    ? `<a class="move-link" href="#/move/${esc(m.id)}">${esc(text)} ›</a>`
    : `<div class="move-link">${esc(text)}</div>`;
}

function toast(msg) {
  document.querySelector('.toast')?.remove();
  const el = document.createElement('div');
  el.className = 'toast';
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 2600);
}

function go(route) {
  location.hash = route;
}

// ---------- Wake lock (écran allumé pendant le timer) ----------

async function acquireWakeLock() {
  try {
    if ('wakeLock' in navigator) wakeLock = await navigator.wakeLock.request('screen');
  } catch { /* refusé : non bloquant */ }
}

function releaseWakeLock() {
  wakeLock?.release().catch(() => {});
  wakeLock = null;
}

document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible' && currentEngine && !currentEngine.finished) {
    acquireWakeLock();
  }
});

// ---------- Routeur ----------

function router() {
  if (currentEngine) {
    currentEngine.destroy();
    currentEngine = null;
    releaseWakeLock();
  }
  const parts = location.hash.replace(/^#\/?/, '').split('/');
  const [screen, id] = parts;
  switch (screen) {
    case 'wod': return renderDetail(id);
    case 'edit': return renderEditor(id);
    case 'timer': return renderTimer(id);
    case 'result': return renderResult(id);
    case 'history': return renderHistory();
    case 'moves': return renderMovesLibrary();
    case 'move': return renderMoveDetail(id);
    case 'suggest': return renderSuggest();
    default: return renderHome();
  }
}

window.addEventListener('hashchange', router);
window.addEventListener('load', router);

// ---------- Écran : liste des WODs ----------

// Texte indexé pour la recherche : nom + description + noms/alias des mouvements.
function wodSearchText(w) {
  const parts = [w.name, w.description || ''];
  for (const mv of (w.movements || [])) {
    const m = MOVEMENT_BY_ID[mv.movementId];
    if (m) {
      parts.push(m.name);
      if (m.aliases) parts.push(m.aliases.join(' '));
    }
  }
  return parts.join(' ');
}

function renderHome() {
  const customs = getCustomWods();
  const tabs = [
    { id: 'all', label: 'Tous' },
    { id: 'custom', label: CATEGORY_LABELS.custom },
    { id: 'girls', label: CATEGORY_LABELS.girls },
    { id: 'hero', label: CATEGORY_LABELS.hero },
    { id: 'open', label: CATEGORY_LABELS.open },
    { id: 'generic', label: CATEGORY_LABELS.generic },
  ];
  const wods = homeTab === 'all'
    ? [...customs, ...REFERENCE_WODS]
    : getAllWods().filter((w) => w.category === homeTab);
  const norm = (s) => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');

  app.innerHTML = `
    <div class="topbar">
      <h1>WOD Timer</h1>
      <button class="icon-btn" data-nav="suggest" title="Suggérer un WOD">🎯</button>
      <button class="icon-btn" data-nav="moves" title="Bibliothèque de mouvements">💪</button>
      <button class="icon-btn" data-nav="history" title="Historique">🕘</button>
    </div>
    <div class="tabs">
      ${tabs.map((t) => `<button class="tab ${homeTab === t.id ? 'active' : ''}" data-tab="${t.id}">${t.label}</button>`).join('')}
    </div>
    <input id="wod-search" class="search-box" type="search" inputmode="search"
      placeholder="Rechercher (nom, mouvement…)" value="${esc(homeSearch)}">
    <div class="card-list" id="wod-list">
      ${wods.map((w) => `
        <div class="card" data-wod="${esc(w.id)}" data-name="${esc(norm(wodSearchText(w)))}">
          <div class="info">
            <div class="name">${esc(w.name)}</div>
            <div class="meta">${w.category === 'custom' ? '<span class="perso">Perso</span> · ' : ''}${esc(wodSummary(w))}</div>
          </div>
          <span class="badge ${w.type}">${TYPE_LABELS[w.type]}</span>
        </div>`).join('')}
      ${wods.length === 0 ? `<div class="empty">Aucun WOD ici pour l'instant.<br>Crée ton premier WOD custom avec le bouton +</div>` : ''}
      <div class="empty" id="no-match" style="display:none">Aucun WOD ne correspond à ta recherche.</div>
    </div>
    <button class="fab" title="Nouveau WOD custom">+</button>
  `;

  function applyFilter() {
    const q = norm(homeSearch).trim();
    const cards = app.querySelectorAll('#wod-list .card');
    let visible = 0;
    cards.forEach((c) => {
      const match = !q || c.dataset.name.includes(q);
      c.style.display = match ? '' : 'none';
      if (match) visible += 1;
    });
    const noMatch = app.querySelector('#no-match');
    if (noMatch) noMatch.style.display = (q && visible === 0 && cards.length) ? '' : 'none';
  }

  app.querySelector('#wod-search').addEventListener('input', (e) => {
    homeSearch = e.target.value;
    applyFilter();
  });
  applyFilter();

  app.querySelectorAll('.tab').forEach((b) => b.addEventListener('click', () => {
    homeTab = b.dataset.tab;
    renderHome();
  }));
  app.querySelectorAll('.card').forEach((c) => c.addEventListener('click', () => go(`/wod/${c.dataset.wod}`)));
  app.querySelector('[data-nav="suggest"]').addEventListener('click', () => go('/suggest'));
  app.querySelector('[data-nav="moves"]').addEventListener('click', () => go('/moves'));
  app.querySelector('[data-nav="history"]').addEventListener('click', () => go('/history'));
  app.querySelector('.fab').addEventListener('click', () => go('/edit'));
}

// ---------- Écran : détail d'un WOD ----------

function specRows(wod) {
  const p = wod.params || {};
  const rows = [];
  if (wod.type === 'fortime') rows.push(['Time cap', p.capSec ? formatDuration(p.capSec) : 'Aucun (chrono libre)']);
  if (wod.type === 'amrap') rows.push(['Durée', formatDuration(p.durationSec)]);
  if (wod.type === 'emom') {
    rows.push(['Rounds', p.rounds], ['Intervalle', formatDuration(p.intervalSec || 60)]);
  }
  if (wod.type === 'tabata') {
    rows.push(['Rounds', p.rounds || 8], ['Travail', formatDuration(p.workSec || 20)], ['Repos', formatDuration(p.restSec || 10)]);
  }
  if (wod.type === 'intervals') {
    rows.push(['Rounds', p.rounds || 1]);
    (p.steps || []).forEach((s) => rows.push([s.label, formatDuration(s.durationSec)]));
  }
  const total = buildSegments(wod).reduce((a, s) => a + (s.durationSec || 0), 0);
  if (total > 0 && wod.type !== 'fortime') rows.push(['Durée totale', formatDuration(total)]);
  return rows;
}

function renderDetail(id) {
  const wod = getWod(id);
  if (!wod) return go('/');
  const isCustom = wod.category === 'custom';

  app.innerHTML = `
    <div class="topbar">
      <button class="back" data-nav="home">‹ Retour</button>
      <h1>${esc(wod.name)}</h1>
      <span class="badge ${wod.type}">${TYPE_LABELS[wod.type]}</span>
    </div>
    ${wod.movements?.length ? `
      <div class="detail-block">
        <h3>Mouvements</h3>
        ${wod.scheme?.length ? `<div class="scheme-head">${esc(wod.scheme.join('-'))} reps</div>` : ''}
        ${wod.movements.map((mv) => movementRow(mv, wod.scheme?.length ? wod.scheme : null)).join('')}
      </div>` : ''}
    ${muscleBlock(aggregateMuscles(wod.movements || []))}
    ${wod.description ? `
      <div class="detail-block">
        <h3>Workout</h3>
        <div class="desc">${esc(wod.description)}</div>
      </div>` : ''}
    <div class="detail-block">
      <h3>Format</h3>
      ${specRows(wod).map(([k, v]) => `<div class="spec-row"><span>${esc(k)}</span><span class="v">${esc(v)}</span></div>`).join('')}
    </div>
    <div style="flex:1"></div>
    <div class="timer-controls">
      <button class="btn btn-primary" data-act="start">▶ Démarrer (compte à rebours ${COUNTDOWN_SEC} s)</button>
      <div class="btn-row">
        <button class="btn btn-secondary" data-act="duplicate">${isCustom ? 'Modifier' : 'Dupliquer & modifier'}</button>
        ${isCustom ? '<button class="btn btn-danger" data-act="delete">Supprimer</button>' : ''}
      </div>
    </div>
  `;

  app.querySelector('[data-nav="home"]').addEventListener('click', () => go('/'));
  app.querySelector('[data-act="start"]').addEventListener('click', () => {
    unlockAudio();
    go(`/timer/${wod.id}`);
  });
  app.querySelector('[data-act="duplicate"]').addEventListener('click', () => {
    if (isCustom) {
      go(`/edit/${wod.id}`);
    } else {
      const copy = { ...wod, id: newId(), name: `${wod.name} (custom)`, category: 'custom' };
      saveCustomWod(copy);
      go(`/edit/${copy.id}`);
    }
  });
  app.querySelector('[data-act="delete"]')?.addEventListener('click', () => {
    if (confirm(`Supprimer « ${wod.name} » ?`)) {
      deleteCustomWod(wod.id);
      go('/');
    }
  });
}

// ---------- Écran : éditeur de WOD custom ----------

function renderEditor(id) {
  const existing = id ? getWod(id) : null;
  const wod = existing && existing.category === 'custom' ? structuredClone(existing) : {
    id: newId(),
    name: '',
    category: 'custom',
    type: 'amrap',
    description: '',
    params: { durationSec: 720 },
  };

  app.innerHTML = `
    <div class="topbar">
      <button class="back" data-nav="back">‹ Annuler</button>
      <h1>${existing ? 'Modifier le WOD' : 'Nouveau WOD'}</h1>
    </div>
    <div class="field">
      <label>Nom</label>
      <input id="f-name" type="text" placeholder="Mon WOD" value="${esc(wod.name)}">
    </div>
    <div class="field">
      <label>Type</label>
      <select id="f-type">
        ${Object.entries(TYPE_LABELS).map(([k, v]) => `<option value="${k}" ${wod.type === k ? 'selected' : ''}>${v}</option>`).join('')}
      </select>
    </div>
    <div id="params"></div>
    <div class="field">
      <label>Mouvements (optionnel)</label>
      <input id="f-scheme" type="text" inputmode="numeric"
        placeholder="Schéma de reps — ex. 21-15-9 (laisser vide sinon)"
        value="${esc((wod.scheme || []).join('-'))}">
      <div id="movements" style="margin-top:10px"></div>
      <button class="btn btn-secondary" id="add-move" style="padding:10px;font-size:0.95rem">+ Ajouter un mouvement</button>
    </div>
    <div class="field">
      <label>Description / notes libres (optionnel)</label>
      <textarea id="f-desc" placeholder="• 10 burpees&#10;• 15 kettlebell swings…">${esc(wod.description)}</textarea>
    </div>
    <div style="flex:1"></div>
    <button class="btn btn-primary" data-act="save">Enregistrer</button>
  `;

  const paramsEl = app.querySelector('#params');

  function minutesField(label, id, sec) {
    return `
      <div class="field-row">
        <div class="field"><label>${label} (min)</label>
          <input id="${id}-min" type="number" min="0" inputmode="numeric" value="${Math.floor((sec || 0) / 60)}"></div>
        <div class="field"><label>(s)</label>
          <input id="${id}-sec" type="number" min="0" max="59" inputmode="numeric" value="${(sec || 0) % 60}"></div>
      </div>`;
  }

  function readMinutes(id) {
    const m = parseInt(app.querySelector(`#${id}-min`).value, 10) || 0;
    const s = parseInt(app.querySelector(`#${id}-sec`).value, 10) || 0;
    return m * 60 + s;
  }

  function renderParams(type) {
    const p = wod.params || {};
    if (type === 'fortime') {
      paramsEl.innerHTML = minutesField('Time cap (0 = chrono libre)', 'p-cap', p.capSec || 0);
    } else if (type === 'amrap') {
      paramsEl.innerHTML = minutesField('Durée', 'p-dur', p.durationSec || 720);
    } else if (type === 'emom') {
      paramsEl.innerHTML = `
        <div class="field"><label>Rounds</label>
          <input id="p-rounds" type="number" min="1" inputmode="numeric" value="${p.rounds || 10}"></div>
        <div class="field"><label>Intervalle (s)</label>
          <input id="p-interval" type="number" min="5" inputmode="numeric" value="${p.intervalSec || 60}"></div>`;
    } else if (type === 'tabata') {
      paramsEl.innerHTML = `
        <div class="field"><label>Rounds</label>
          <input id="p-rounds" type="number" min="1" inputmode="numeric" value="${p.rounds || 8}"></div>
        <div class="field-row">
          <div class="field"><label>Travail (s)</label>
            <input id="p-work" type="number" min="5" inputmode="numeric" value="${p.workSec || 20}"></div>
          <div class="field"><label>Repos (s)</label>
            <input id="p-rest" type="number" min="5" inputmode="numeric" value="${p.restSec || 10}"></div>
        </div>`;
    } else if (type === 'intervals') {
      const steps = p.steps && p.steps.length ? p.steps : [{ label: 'Travail', durationSec: 60, kind: 'work' }];
      wod.params = { ...p, steps };
      paramsEl.innerHTML = `
        <div class="field"><label>Rounds (répétitions de la séquence)</label>
          <input id="p-rounds" type="number" min="1" inputmode="numeric" value="${p.rounds || 1}"></div>
        <div class="field"><label>Étapes de la séquence</label>
          <div id="steps"></div>
          <button class="btn btn-secondary" id="add-step" style="padding:10px;font-size:0.95rem">+ Ajouter une étape</button>
        </div>`;
      renderSteps();
      paramsEl.querySelector('#add-step').addEventListener('click', () => {
        readSteps();
        wod.params.steps.push({ label: 'Repos', durationSec: 30, kind: 'rest' });
        renderSteps();
      });
    }
  }

  function renderSteps() {
    const el = paramsEl.querySelector('#steps');
    el.innerHTML = wod.params.steps.map((s, i) => `
      <div class="step-row" data-i="${i}">
        <input type="text" class="s-label" placeholder="Étape" value="${esc(s.label)}">
        <input type="number" class="s-dur" min="1" inputmode="numeric" value="${s.durationSec}" title="secondes">
        <select class="s-kind">
          <option value="work" ${s.kind !== 'rest' ? 'selected' : ''}>Travail</option>
          <option value="rest" ${s.kind === 'rest' ? 'selected' : ''}>Repos</option>
        </select>
        <button class="del" title="Supprimer">×</button>
      </div>`).join('');
    el.querySelectorAll('.del').forEach((b) => b.addEventListener('click', () => {
      readSteps();
      wod.params.steps.splice(Number(b.closest('.step-row').dataset.i), 1);
      if (wod.params.steps.length === 0) wod.params.steps.push({ label: 'Travail', durationSec: 60, kind: 'work' });
      renderSteps();
    }));
  }

  function readSteps() {
    paramsEl.querySelectorAll('.step-row').forEach((row, i) => {
      wod.params.steps[i] = {
        label: row.querySelector('.s-label').value.trim() || `Étape ${i + 1}`,
        durationSec: Math.max(1, parseInt(row.querySelector('.s-dur').value, 10) || 30),
        kind: row.querySelector('.s-kind').value,
      };
    });
  }

  renderParams(wod.type);
  app.querySelector('#f-type').addEventListener('change', (e) => {
    wod.type = e.target.value;
    renderParams(wod.type);
  });

  // ----- Éditeur de mouvements structurés -----
  if (!Array.isArray(wod.movements)) wod.movements = [];
  const movesEl = app.querySelector('#movements');
  const schemeInput = app.querySelector('#f-scheme');
  const schemeActive = () => parseScheme(schemeInput.value) != null;

  function readMovements() {
    movesEl.querySelectorAll('.move-row').forEach((row, i) => {
      const id = row.querySelector('.m-id').value;
      const cat = MOVEMENT_BY_ID[id];
      const valEl = row.querySelector('.m-val');
      const loadEl = row.querySelector('.m-load');
      const prev = wod.movements[i] || {};
      const mv = { movementId: id };
      const val = valEl ? valEl.value : prev.value; // préserve la valeur masquée par un schéma
      if (val != null && val !== '') mv.value = Number(val);
      if (loadEl) {
        if (loadEl.value !== '') mv.load = { value: Number(loadEl.value), unit: 'kg' };
      } else if (prev.load) {
        mv.load = prev.load;
      }
      if (cat && cat.measure && cat.measure !== 'reps') mv.measure = cat.measure;
      if (prev.note) mv.note = prev.note;
      wod.movements[i] = mv;
    });
  }

  function renderMovements() {
    const showVal = !schemeActive();
    movesEl.innerHTML = wod.movements.map((mv, i) => {
      const cat = MOVEMENT_BY_ID[mv.movementId];
      const showLoad = cat ? cat.loaded : false;
      return `
        <div class="move-row" data-i="${i}">
          ${moveSelect(mv.movementId)}
          ${showVal ? `<input class="m-val" type="number" min="0" inputmode="numeric"
            value="${mv.value ?? ''}" placeholder="${cat ? cat.measure : 'reps'}">` : ''}
          ${showLoad ? `<input class="m-load" type="number" min="0" inputmode="numeric"
            value="${mv.load?.value ?? ''}" placeholder="kg">` : ''}
          <button class="del" title="Supprimer">×</button>
        </div>`;
    }).join('');
    movesEl.querySelectorAll('.m-id').forEach((sel) => sel.addEventListener('change', () => {
      readMovements();
      renderMovements();
    }));
    movesEl.querySelectorAll('.del').forEach((b) => b.addEventListener('click', () => {
      readMovements();
      wod.movements.splice(Number(b.closest('.move-row').dataset.i), 1);
      renderMovements();
    }));
  }

  let schemeWasActive = schemeActive();
  schemeInput.addEventListener('input', () => {
    const now = schemeActive();
    if (now !== schemeWasActive) { // ne re-render que quand on (dé)active le schéma
      readMovements();
      schemeWasActive = now;
      renderMovements();
    }
  });
  app.querySelector('#add-move').addEventListener('click', () => {
    readMovements();
    wod.movements.push({ movementId: '' });
    renderMovements();
  });
  renderMovements();

  app.querySelector('[data-nav="back"]').addEventListener('click', () => history.back());
  app.querySelector('[data-act="save"]').addEventListener('click', () => {
    const name = app.querySelector('#f-name').value.trim();
    if (!name) {
      toast('Donne un nom à ton WOD');
      return;
    }
    const type = app.querySelector('#f-type').value;
    let params = {};
    if (type === 'fortime') {
      const cap = readMinutes('p-cap');
      params = cap > 0 ? { capSec: cap } : {};
    } else if (type === 'amrap') {
      params = { durationSec: Math.max(10, readMinutes('p-dur')) };
    } else if (type === 'emom') {
      params = {
        rounds: Math.max(1, parseInt(app.querySelector('#p-rounds').value, 10) || 10),
        intervalSec: Math.max(5, parseInt(app.querySelector('#p-interval').value, 10) || 60),
      };
    } else if (type === 'tabata') {
      params = {
        rounds: Math.max(1, parseInt(app.querySelector('#p-rounds').value, 10) || 8),
        workSec: Math.max(5, parseInt(app.querySelector('#p-work').value, 10) || 20),
        restSec: Math.max(5, parseInt(app.querySelector('#p-rest').value, 10) || 10),
      };
    } else if (type === 'intervals') {
      readSteps();
      params = {
        rounds: Math.max(1, parseInt(app.querySelector('#p-rounds').value, 10) || 1),
        steps: wod.params.steps,
      };
    }
    readMovements();
    const scheme = parseScheme(schemeInput.value);
    const movements = wod.movements.filter((m) => m.movementId);
    saveCustomWod({
      id: wod.id,
      name,
      category: 'custom',
      type,
      params,
      description: app.querySelector('#f-desc').value.trim(),
      ...(scheme ? { scheme } : {}),
      ...(movements.length ? { movements } : {}),
    });
    go(`/wod/${wod.id}`);
  });
}

// ---------- Écran : timer ----------

function renderTimer(id) {
  const wod = getWod(id);
  if (!wod) return go('/');
  const segments = buildSegments(wod);
  const countsRounds = wod.type === 'amrap' || wod.type === 'fortime';
  let rounds = 0;

  app.innerHTML = `
    <div class="timer-screen">
      <div class="timer-wod-name">${esc(wod.name)} — ${TYPE_LABELS[wod.type]}</div>
      <div class="timer-main">
        <div class="seg-label" id="seg-label"></div>
        <div class="time-display" id="time"></div>
        <div class="time-sub" id="time-sub"></div>
        <div class="progress-track"><div class="progress-fill" id="progress"></div></div>
        <div class="next-seg" id="next-seg"></div>
        ${countsRounds ? `
          <div class="round-counter">
            <button id="round-minus">−</button>
            <div>
              <div class="count" id="round-count">0</div>
              <div class="label">rounds</div>
            </div>
            <button id="round-plus">+</button>
          </div>` : ''}
      </div>
      <div class="timer-controls">
        ${wod.type === 'fortime' ? '<button class="btn btn-primary" id="btn-done">✓ Terminé !</button>' : ''}
        <div class="btn-row">
          <button class="btn btn-secondary" id="btn-pause">Pause</button>
          <button class="btn btn-danger" id="btn-stop">Arrêter</button>
        </div>
      </div>
    </div>
  `;

  const els = {
    label: app.querySelector('#seg-label'),
    time: app.querySelector('#time'),
    sub: app.querySelector('#time-sub'),
    progress: app.querySelector('#progress'),
    next: app.querySelector('#next-seg'),
  };

  function updateUI(state) {
    const seg = state.segment;
    if (!seg) return;
    const isCountdown = seg.kind === 'countdown';
    els.label.textContent = seg.label;
    els.label.className = `seg-label ${seg.kind}`;

    let display;
    let lastSeconds = false;
    if (isCountdown) {
      display = Math.ceil(Math.max(0, state.segRemaining)).toString();
      lastSeconds = state.segRemaining <= 3;
    } else if (wod.type === 'fortime') {
      display = formatClock(state.totalElapsed);
      lastSeconds = state.segRemaining != null && state.segRemaining <= 10;
    } else {
      display = formatClock(Math.ceil(state.segRemaining ?? state.segElapsed));
      lastSeconds = state.segRemaining != null && state.segRemaining <= 3;
    }
    els.time.textContent = display;
    els.time.className = `time-display ${isCountdown ? 'countdown' : ''} ${lastSeconds ? 'last-seconds' : ''}`;

    if (isCountdown) {
      els.sub.textContent = '';
    } else if (wod.type === 'fortime' && seg.durationSec != null) {
      els.sub.textContent = `Time cap ${formatClock(seg.durationSec)}`;
    } else if (wod.type !== 'fortime') {
      els.sub.textContent = `Temps total : ${formatClock(state.totalElapsed)}`;
    } else {
      els.sub.textContent = '';
    }

    if (seg.durationSec != null) {
      const pct = Math.min(100, (state.segElapsed / seg.durationSec) * 100);
      els.progress.style.width = `${pct}%`;
    } else {
      els.progress.style.width = '100%';
    }

    const next = currentEngine.segments[state.segIndex + 1];
    els.next.textContent = next ? `Ensuite : ${next.label}` : (isCountdown ? '' : 'Dernière étape');
  }

  currentEngine = new TimerEngine(segments, {
    onTick: updateUI,
    onBeep: playBeep,
    onFinish: (result) => {
      releaseWakeLock();
      const entry = {
        id: newId(),
        wodId: wod.id,
        name: wod.name,
        type: wod.type,
        startedAt: result.startedAt.toISOString(),
        totalSec: result.totalSec,
        aborted: result.aborted,
        segments: result.segments,
        rounds: countsRounds ? rounds : null,
        reps: null,
        notes: '',
        ...(wod.movements?.length ? { movements: wod.movements } : {}),
        ...(wod.scheme?.length ? { scheme: wod.scheme } : {}),
      };
      saveHistoryEntry(entry);
      currentEngine = null;
      go(`/result/${entry.id}`);
    },
  });

  if (countsRounds) {
    const countEl = app.querySelector('#round-count');
    app.querySelector('#round-plus').addEventListener('click', () => {
      rounds += 1;
      countEl.textContent = rounds;
    });
    app.querySelector('#round-minus').addEventListener('click', () => {
      rounds = Math.max(0, rounds - 1);
      countEl.textContent = rounds;
    });
  }

  const pauseBtn = app.querySelector('#btn-pause');
  pauseBtn.addEventListener('click', () => {
    if (!currentEngine) return;
    if (currentEngine.running) {
      currentEngine.pause();
      pauseBtn.textContent = 'Reprendre';
    } else {
      currentEngine.resume();
      pauseBtn.textContent = 'Pause';
    }
  });

  app.querySelector('#btn-stop').addEventListener('click', () => {
    if (!currentEngine) return;
    const wasRunning = currentEngine.running;
    currentEngine.pause();
    if (confirm('Arrêter le WOD ? La séance sera enregistrée.')) {
      currentEngine.stop();
    } else if (wasRunning) {
      currentEngine.resume();
      pauseBtn.textContent = 'Pause';
    } else {
      pauseBtn.textContent = 'Reprendre';
    }
  });

  app.querySelector('#btn-done')?.addEventListener('click', () => {
    currentEngine?.finishSegment();
  });

  unlockAudio();
  acquireWakeLock();
  currentEngine.start();
}

// ---------- Écran : résultat d'une séance ----------

function renderResult(id) {
  const entry = getHistoryEntry(id);
  if (!entry) return go('/');
  const showRounds = entry.type === 'amrap' || entry.type === 'fortime' || entry.type === 'emom';

  app.innerHTML = `
    <div class="topbar">
      <h1>${entry.aborted ? 'WOD arrêté' : 'WOD terminé ! 💪'}</h1>
    </div>
    <div class="detail-block">
      <h3>${esc(entry.name)}</h3>
      <div class="result-time">${formatClock(entry.totalSec)}</div>
    </div>
    ${movementsBlock(entry, 'Mouvements')}
    ${muscleBlock(aggregateMuscles(entry.movements || []))}
    ${showRounds ? `
      <div class="field-row">
        <div class="field"><label>Rounds</label>
          <input id="r-rounds" type="number" min="0" inputmode="numeric" value="${entry.rounds ?? 0}"></div>
        <div class="field"><label>Reps (round partiel)</label>
          <input id="r-reps" type="number" min="0" inputmode="numeric" value="${entry.reps ?? 0}"></div>
      </div>` : ''}
    <div class="field">
      <label>Notes (charges, ressenti…)</label>
      <textarea id="r-notes">${esc(entry.notes)}</textarea>
    </div>
    <div style="flex:1"></div>
    <div class="timer-controls">
      <button class="btn btn-primary" data-act="save">Enregistrer</button>
      <div class="btn-row">
        <button class="btn btn-secondary" data-act="export-fit">⬇ FIT (Garmin)</button>
        <button class="btn btn-secondary" data-act="export">⬇ TCX (Garmin)</button>
      </div>
    </div>
  `;

  function collect() {
    if (showRounds) {
      entry.rounds = parseInt(app.querySelector('#r-rounds').value, 10) || 0;
      entry.reps = parseInt(app.querySelector('#r-reps').value, 10) || 0;
    }
    entry.notes = app.querySelector('#r-notes').value.trim();
    saveHistoryEntry(entry);
  }

  app.querySelector('[data-act="save"]').addEventListener('click', () => {
    collect();
    go('/history');
  });
  app.querySelector('[data-act="export"]').addEventListener('click', async () => {
    collect();
    const how = await exportTcx(entry);
    if (how === 'downloaded') toast('Fichier TCX téléchargé');
  });
  app.querySelector('[data-act="export-fit"]').addEventListener('click', async () => {
    collect();
    const how = await exportFit(entry);
    if (how === 'downloaded') toast('Fichier FIT téléchargé');
  });
}

// ---------- Écran : historique ----------

function renderHistory() {
  const history = getHistory();
  const fmtDate = new Intl.DateTimeFormat('fr-FR', { dateStyle: 'medium', timeStyle: 'short' });

  app.innerHTML = `
    <div class="topbar">
      <button class="back" data-nav="home">‹ Retour</button>
      <h1>Historique</h1>
    </div>
    <div class="card-list">
      ${history.map((e) => `
        <div class="card" data-id="${esc(e.id)}" style="flex-direction:column;align-items:stretch;cursor:default">
          <div style="display:flex;align-items:center;gap:12px">
            <div class="info">
              <div class="name">${esc(e.name)}</div>
              <div class="meta">
                ${fmtDate.format(new Date(e.startedAt))} — ${formatClock(e.totalSec)}
                ${e.rounds ? ` — ${e.rounds} rounds` : ''}${e.reps ? ` + ${e.reps} reps` : ''}
                ${e.aborted ? ' — (arrêté)' : ''}
              </div>
              ${e.notes ? `<div class="meta">${esc(e.notes)}</div>` : ''}
            </div>
            <span class="badge ${e.type}">${TYPE_LABELS[e.type]}</span>
          </div>
          <div class="history-actions">
            <button class="small-btn export" data-act="export-fit">⬇ FIT</button>
            <button class="small-btn export" data-act="export">⬇ TCX</button>
            <button class="small-btn" data-act="edit">Modifier</button>
            <button class="small-btn delete" data-act="delete">Supprimer</button>
          </div>
        </div>`).join('')}
      ${history.length === 0 ? '<div class="empty">Aucune séance enregistrée.<br>Lance un WOD pour remplir ton historique !</div>' : ''}
    </div>
  `;

  app.querySelector('[data-nav="home"]').addEventListener('click', () => go('/'));
  app.querySelectorAll('.card').forEach((card) => {
    const id = card.dataset.id;
    card.querySelector('[data-act="export"]').addEventListener('click', async () => {
      const how = await exportTcx(getHistoryEntry(id));
      if (how === 'downloaded') toast('Fichier TCX téléchargé');
    });
    card.querySelector('[data-act="export-fit"]').addEventListener('click', async () => {
      const how = await exportFit(getHistoryEntry(id));
      if (how === 'downloaded') toast('Fichier FIT téléchargé');
    });
    card.querySelector('[data-act="edit"]').addEventListener('click', () => go(`/result/${id}`));
    card.querySelector('[data-act="delete"]').addEventListener('click', () => {
      if (confirm('Supprimer cette séance ?')) {
        deleteHistoryEntry(id);
        renderHistory();
      }
    });
  });
}

// ---------- Écran : bibliothèque de mouvements ----------

function renderMovesLibrary() {
  const norm = (s) => String(s).toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
  const searchText = (m) => norm(`${m.name} ${(m.aliases || []).join(' ')}`);

  app.innerHTML = `
    <div class="topbar">
      <button class="back" data-nav="home">‹ Retour</button>
      <h1>Mouvements</h1>
    </div>
    <input id="move-search" class="search-box" type="search" inputmode="search"
      placeholder="Rechercher un mouvement…" value="${esc(movesSearch)}">
    <div id="moves-list">
      ${FAMILIES.map(([fam, label]) => {
        const list = MOVEMENTS.filter((m) => m.family === fam);
        if (!list.length) return '';
        return `
          <div class="detail-block move-group">
            <h3>${esc(label)}</h3>
            <div class="card-list">
              ${list.map((m) => `
                <div class="card move-card" data-move="${esc(m.id)}" data-name="${esc(searchText(m))}">
                  <div class="info"><div class="name">${esc(m.name)}</div></div>
                  <span class="meta">›</span>
                </div>`).join('')}
            </div>
          </div>`;
      }).join('')}
      <div class="empty" id="no-match" style="display:none">Aucun mouvement ne correspond à ta recherche.</div>
    </div>
  `;

  function applyFilter() {
    const q = norm(movesSearch).trim();
    let total = 0;
    app.querySelectorAll('.move-group').forEach((g) => {
      let groupVisible = 0;
      g.querySelectorAll('.move-card').forEach((c) => {
        const match = !q || c.dataset.name.includes(q);
        c.style.display = match ? '' : 'none';
        if (match) groupVisible += 1;
      });
      g.style.display = groupVisible ? '' : 'none';
      total += groupVisible;
    });
    const noMatch = app.querySelector('#no-match');
    if (noMatch) noMatch.style.display = (q && total === 0) ? '' : 'none';
  }

  app.querySelector('#move-search').addEventListener('input', (e) => { movesSearch = e.target.value; applyFilter(); });
  applyFilter();

  app.querySelector('[data-nav="home"]').addEventListener('click', () => go('/'));
  app.querySelectorAll('.move-card').forEach((c) => c.addEventListener('click', () => go(`/move/${c.dataset.move}`)));
}

// ---------- Écran : fiche d'un mouvement ----------

const EQUIP_LABELS = { none: 'Sans matériel', minimal: 'Haltère / barre de traction', full: 'Matériel complet' };
const MEASURE_LABELS = { reps: 'Répétitions', m: 'Mètres', cal: 'Calories', sec: 'Secondes' };

function renderMoveDetail(id) {
  const m = MOVEMENT_BY_ID[id];
  if (!m) return go('/moves');
  const fam = FAMILIES.find((f) => f[0] === m.family);
  const description = descriptionFor(m.id);

  app.innerHTML = `
    <div class="topbar">
      <button class="back" data-nav="back">‹ Retour</button>
      <h1>${esc(m.name)}</h1>
    </div>
    ${description ? `
      <div class="detail-block">
        <h3>Description</h3>
        <div class="desc">${esc(description)}</div>
      </div>` : ''}
    <div class="detail-block">
      <div class="spec-row"><span>Famille</span><span class="v">${esc(fam ? fam[1] : m.family)}</span></div>
      <div class="spec-row"><span>Matériel</span><span class="v">${esc(EQUIP_LABELS[m.equipment] || m.equipment)}</span></div>
      <div class="spec-row"><span>Mesure</span><span class="v">${esc(MEASURE_LABELS[m.measure] || m.measure)}</span></div>
    </div>
    ${muscleBlock(musclesFor(m.id)) || '<div class="detail-block"><div class="desc">Muscles non renseignés pour ce mouvement.</div></div>'}
  `;
  app.querySelector('[data-nav="back"]').addEventListener('click', () => history.back());
}

// ---------- Écran : suggestion du WOD suivant ----------

const FITNESS_OPTS = [['fatigue', 'Fatigué'], ['moyen', 'Moyen'], ['forme', 'En forme']];
const EQUIP_OPTS = [['none', 'Aucun'], ['minimal', 'Haltère + barre'], ['full', 'Complet']];

function renderSuggest() {
  let fitness = 'moyen';
  let equipment = 'full';

  function draw() {
    app.innerHTML = `
      <div class="topbar">
        <button class="back" data-nav="home">‹ Retour</button>
        <h1>Suggérer un WOD</h1>
      </div>
      <div class="detail-block">
        <h3>Ta forme du jour</h3>
        <div class="choice-row">
          ${FITNESS_OPTS.map(([v, l]) => `<button class="choice ${fitness === v ? 'active' : ''}" data-fit="${v}">${l}</button>`).join('')}
        </div>
      </div>
      <div class="detail-block">
        <h3>Matériel disponible</h3>
        <div class="choice-row">
          ${EQUIP_OPTS.map(([v, l]) => `<button class="choice ${equipment === v ? 'active' : ''}" data-eq="${v}">${l}</button>`).join('')}
        </div>
      </div>
      <button class="btn btn-primary" data-act="go">🎯 Proposer</button>
      <div id="suggest-results"></div>
    `;
    app.querySelectorAll('[data-fit]').forEach((b) => b.addEventListener('click', () => { fitness = b.dataset.fit; draw(); }));
    app.querySelectorAll('[data-eq]').forEach((b) => b.addEventListener('click', () => { equipment = b.dataset.eq; draw(); }));
    app.querySelector('[data-nav="home"]').addEventListener('click', () => go('/'));
    app.querySelector('[data-act="go"]').addEventListener('click', showResults);
  }

  function showResults() {
    const { suggestions, trainedToday, freshStart, daysSinceLast } = suggestWods(getHistory(), getAllWods(), { fitness, equipment });
    const el = app.querySelector('#suggest-results');
    if (!suggestions.length) {
      el.innerHTML = '<div class="empty">Aucun WOD ne correspond à ce matériel.<br>Essaie d\'élargir le matériel disponible.</div>';
      return;
    }
    const note = freshStart
      ? (daysSinceLast == null
        ? 'Pas encore d\'historique : on propose un WOD complet pour démarrer.'
        : `Pas de séance depuis ${Math.round(daysSinceLast)} j : reprise avec un WOD complet.`)
      : trainedToday
        ? 'Tu as déjà chargé aujourd\'hui : priorité aux groupes musculaires frais.'
        : `Dernière séance il y a ${Math.round(daysSinceLast)} j.`;
    el.innerHTML = `<div class="suggest-note">${esc(note)}</div>` + suggestions.map((s, i) => `
      <div class="detail-block">
        <div class="suggest-head">
          <div class="info">
            <div class="name">${i + 1}. ${esc(s.wod.name)}</div>
            <div class="meta">${TYPE_LABELS[s.wod.type]} · ~${Math.round(s.dur / 60)} min</div>
          </div>
          <span class="badge ${s.wod.type}">${TYPE_LABELS[s.wod.type]}</span>
        </div>
        ${s.reasons.length ? `<ul class="suggest-reasons">${s.reasons.map((r) => `<li>${esc(r)}</li>`).join('')}</ul>` : ''}
        ${muscleLegend(s.muscles)}
        <div class="btn-row" style="margin-top:12px">
          <button class="btn btn-secondary" data-go-wod="${esc(s.wod.id)}">Voir</button>
          <button class="btn btn-primary" data-start="${esc(s.wod.id)}">Démarrer</button>
        </div>
      </div>`).join('');
    el.querySelectorAll('[data-go-wod]').forEach((b) => b.addEventListener('click', () => go(`/wod/${b.dataset.goWod}`)));
    el.querySelectorAll('[data-start]').forEach((b) => b.addEventListener('click', () => { unlockAudio(); go(`/timer/${b.dataset.start}`); }));
    el.querySelector('.suggest-note').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  draw();
}
