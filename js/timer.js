// Moteur de timer indépendant du DOM (réutilisable tel quel dans un
// futur portage natif). Basé sur des timestamps réels pour éviter la
// dérive du setInterval.
//
// Événements (handlers) :
//  - onTick(state)         : ~10 fois/s
//  - onSegmentChange(i)    : entrée dans le segment i
//  - onBeep(type)          : 'tick' | 'go' | 'halfway' | 'finish'
//  - onFinish(record)      : tous les segments terminés ou arrêt manuel

export const COUNTDOWN_SEC = 10;

const HALFWAY_MIN_DURATION = 10; // pas de bip mi-temps sur les segments très courts

export class TimerEngine {
  // segments : segments du WOD (voir buildSegments) ; un compte à rebours
  // de préparation est ajouté automatiquement en tête.
  constructor(segments, handlers = {}) {
    this.segments = [
      { label: 'Préparez-vous', kind: 'countdown', durationSec: COUNTDOWN_SEC },
      ...segments,
    ];
    this.h = handlers;
    this.segIndex = 0;
    this.running = false;
    this.finished = false;
    this.record = []; // segments réellement effectués : { label, kind, durationSec }
    this._segStartMs = 0;
    this._pausedAtMs = 0;
    this._beeped = {};
    this._intervalId = null;
  }

  start() {
    if (this._intervalId) return;
    this.startedAt = new Date();
    this.running = true;
    this._segStartMs = performance.now();
    this._beeped = {};
    this._intervalId = setInterval(() => this._tick(), 100);
    this.h.onSegmentChange?.(this.segIndex);
    this._emitTick();
  }

  pause() {
    if (!this.running || this.finished) return;
    this.running = false;
    this._pausedAtMs = performance.now();
    this._emitTick();
  }

  resume() {
    if (this.running || this.finished) return;
    this._segStartMs += performance.now() - this._pausedAtMs;
    this.running = true;
    this._emitTick();
  }

  // Termine manuellement le segment courant (bouton « Terminé » d'un
  // For Time, ou passage anticipé à l'étape suivante).
  finishSegment() {
    if (this.finished) return;
    if (!this.running) this.resume();
    this._completeSegment(this._segElapsedSec());
  }

  // Arrêt définitif : enregistre le segment en cours puis clôture.
  stop() {
    if (this.finished) return;
    const elapsed = this.running
      ? this._segElapsedSec()
      : (this._pausedAtMs - this._segStartMs) / 1000;
    this._recordSegment(elapsed);
    this._finish(true);
  }

  destroy() {
    clearInterval(this._intervalId);
    this._intervalId = null;
  }

  getState() {
    const seg = this.segments[this.segIndex];
    const segElapsed = this.finished ? 0
      : this.running ? this._segElapsedSec()
      : (this._pausedAtMs - this._segStartMs) / 1000;
    const doneSec = this.record.reduce((a, s) => a + (s.kind === 'countdown' ? 0 : s.durationSec), 0);
    return {
      segIndex: this.segIndex,
      segCount: this.segments.length,
      segment: seg,
      segElapsed,
      segRemaining: seg && seg.durationSec != null ? Math.max(0, seg.durationSec - segElapsed) : null,
      // temps de travail total, compte à rebours exclu
      totalElapsed: seg && seg.kind === 'countdown' ? 0 : doneSec + segElapsed,
      running: this.running,
      finished: this.finished,
    };
  }

  _segElapsedSec() {
    return (performance.now() - this._segStartMs) / 1000;
  }

  _tick() {
    if (!this.running || this.finished) return;
    const seg = this.segments[this.segIndex];
    const elapsed = this._segElapsedSec();
    const dur = seg.durationSec;

    if (dur != null) {
      const remaining = dur - elapsed;
      // Bip de mi-temps (hors compte à rebours).
      if (seg.kind !== 'countdown' && dur >= HALFWAY_MIN_DURATION
          && elapsed >= dur / 2 && !this._beeped.half) {
        this._beeped.half = true;
        this.h.onBeep?.('halfway');
      }
      // Bips des 3 dernières secondes.
      for (const s of [3, 2, 1]) {
        if (remaining <= s && remaining > s - 1 && !this._beeped['t' + s]) {
          this._beeped['t' + s] = true;
          this.h.onBeep?.('tick');
        }
      }
      if (remaining <= 0) {
        this._completeSegment(dur);
        return;
      }
    }
    this._emitTick();
  }

  _completeSegment(actualSec) {
    this._recordSegment(actualSec);
    if (this.segIndex >= this.segments.length - 1) {
      this._finish(false);
      return;
    }
    // Ancre le segment suivant sur la fin théorique du précédent pour
    // conserver une durée totale exacte.
    const seg = this.segments[this.segIndex];
    if (seg.durationSec != null && Math.abs(actualSec - seg.durationSec) < 0.5) {
      this._segStartMs += seg.durationSec * 1000;
    } else {
      this._segStartMs = performance.now();
    }
    this.segIndex += 1;
    this._beeped = {};
    this.h.onBeep?.('go');
    this.h.onSegmentChange?.(this.segIndex);
    this._emitTick();
  }

  _recordSegment(actualSec) {
    const seg = this.segments[this.segIndex];
    this.record.push({
      label: seg.label,
      kind: seg.kind,
      durationSec: Math.max(0, Math.round(actualSec * 10) / 10),
    });
  }

  _finish(aborted) {
    this.finished = true;
    this.running = false;
    this.destroy();
    this.h.onBeep?.('finish');
    this.h.onFinish?.({
      aborted,
      startedAt: this.startedAt,
      segments: this.record.filter((s) => s.kind !== 'countdown'),
      totalSec: this.record.reduce((a, s) => a + (s.kind === 'countdown' ? 0 : s.durationSec), 0),
    });
  }

  _emitTick() {
    this.h.onTick?.(this.getState());
  }
}

export function formatClock(sec) {
  const s = Math.max(0, Math.floor(sec));
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  const r = s % 60;
  if (h > 0) return `${h}:${m.toString().padStart(2, '0')}:${r.toString().padStart(2, '0')}`;
  return `${m}:${r.toString().padStart(2, '0')}`;
}
