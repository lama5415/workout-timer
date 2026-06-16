// Persistance locale (localStorage) : WODs customs et historique des
// séances réalisées.

import { REFERENCE_WODS } from './wods.js';

const CUSTOM_KEY = 'wt_custom_wods_v1';
const HISTORY_KEY = 'wt_history_v1';

function load(key) {
  try {
    return JSON.parse(localStorage.getItem(key)) || [];
  } catch {
    return [];
  }
}

function save(key, value) {
  localStorage.setItem(key, JSON.stringify(value));
}

export function newId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

// ---------- WODs customs ----------

export function getCustomWods() {
  return load(CUSTOM_KEY);
}

export function saveCustomWod(wod) {
  const list = getCustomWods();
  const i = list.findIndex((w) => w.id === wod.id);
  if (i >= 0) list[i] = wod;
  else list.unshift(wod);
  save(CUSTOM_KEY, list);
}

export function deleteCustomWod(id) {
  save(CUSTOM_KEY, getCustomWods().filter((w) => w.id !== id));
}

export function getAllWods() {
  return [...getCustomWods(), ...REFERENCE_WODS];
}

export function getWod(id) {
  return getAllWods().find((w) => w.id === id) || null;
}

// ---------- Historique ----------
// Entrée : { id, wodId, name, type, startedAt (ISO), totalSec, aborted,
//            segments: [{label, kind, durationSec}], rounds, reps, notes,
//            scheme?: number[], movements?: [{movementId, value?, load?, measure?, note?}] }

export function getHistory() {
  return load(HISTORY_KEY);
}

export function saveHistoryEntry(entry) {
  const list = getHistory();
  const i = list.findIndex((e) => e.id === entry.id);
  if (i >= 0) list[i] = entry;
  else list.unshift(entry);
  save(HISTORY_KEY, list);
}

export function deleteHistoryEntry(id) {
  save(HISTORY_KEY, getHistory().filter((e) => e.id !== id));
}

export function getHistoryEntry(id) {
  return getHistory().find((e) => e.id === id) || null;
}
