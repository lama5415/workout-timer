// Alertes sonores via Web Audio API.
// Le son est joué dans le mix audio du téléphone : il reste audible
// par-dessus Spotify (pas de prise d'audio focus exclusive).

let ctx = null;

// À appeler depuis un geste utilisateur (bouton Démarrer) : les navigateurs
// mobiles bloquent l'AudioContext tant qu'il n'a pas été créé/résumé dans
// un événement d'interaction.
export function unlockAudio() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return;
    ctx = new AC();
  }
  if (ctx.state === 'suspended') ctx.resume();
  // Joue un échantillon silencieux pour finir de débloquer iOS.
  const buf = ctx.createBuffer(1, 1, 22050);
  const src = ctx.createBufferSource();
  src.buffer = buf;
  src.connect(ctx.destination);
  src.start(0);
}

function tone(freq, durationSec, startDelaySec = 0, volume = 0.85) {
  if (!ctx || ctx.state !== 'running') return;
  const t0 = ctx.currentTime + startDelaySec;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = 'square';
  osc.frequency.value = freq;
  gain.gain.setValueAtTime(0.0001, t0);
  gain.gain.exponentialRampToValueAtTime(volume, t0 + 0.01);
  gain.gain.setValueAtTime(volume, t0 + durationSec - 0.03);
  gain.gain.exponentialRampToValueAtTime(0.0001, t0 + durationSec);
  osc.connect(gain).connect(ctx.destination);
  osc.start(t0);
  osc.stop(t0 + durationSec + 0.02);
}

export const sounds = {
  // Bips 3-2-1 (fin de compte à rebours et fin d'étape).
  tick() { tone(880, 0.12); },
  // Top départ / changement d'étape.
  go() { tone(1318, 0.45); },
  // Mi-temps d'une étape : double bip.
  halfway() { tone(988, 0.13, 0); tone(988, 0.13, 0.18); },
  // Fin du WOD : triple bip ascendant.
  finish() { tone(1318, 0.2, 0); tone(1318, 0.2, 0.25); tone(1760, 0.55, 0.5); },
};

export function playBeep(type) {
  const fn = sounds[type];
  if (fn) fn();
}
