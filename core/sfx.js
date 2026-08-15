// ================================================
// CS Dojo — CORE / sfx
// ------------------------------------------------
// Interface sound effects, synthesized with the Web Audio API rather
// than shipped as audio files. The since-removed Arcade wanted a payout
// chime and a loss sound and shelved it (see core/hud.js's moneyBurst
// comment) because the SFX pack under consideration
// needed a purchased Envato Elements license this project doesn't
// have. That blocker was specifically about SOURCED audio assets —
// generating short tones in-browser needs no license and no files,
// so it sidesteps the blocker entirely rather than waiting on it.
//
// Every sound is a few oscillator notes with a short gain envelope,
// a few KB of code, zero network requests, zero dependencies — same
// "no build step, no assets" property the rest of the app already
// has (see ARCHITECTURE.md).
// ================================================

(() => {
  let ctx = null;
  let muted = false;

  // Browsers block audio before a real user gesture; every sfx call
  // already originates from one (a click, a quiz answer), so creating
  // the context lazily on first use — rather than at page load — is
  // both the workaround and the simplest option.
  function getCtx() {
    if (ctx) return ctx;
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
    return ctx;
  }

  // One note: a short envelope (fast attack, exponential decay) so
  // nothing clicks/pops at the edges and nothing rings out long enough
  // to feel like an alert. `type` is the oscillator waveform — sine/
  // triangle read as soft, square/sawtooth read as harder-edged.
  function tone(freq, { delay = 0, duration = 0.09, type = "sine", gain = 0.05 } = {}) {
    if (muted) return;
    const audio = getCtx();
    if (!audio) return;
    if (audio.state === "suspended") audio.resume();

    const t0 = audio.currentTime + delay;
    const osc = audio.createOscillator();
    const g = audio.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t0);
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(gain, t0 + 0.008);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
    osc.connect(g).connect(audio.destination);
    osc.start(t0);
    osc.stop(t0 + duration + 0.02);
  }

  // ---- The actual sound set ----
  // Kept to four: any more and it stops reading as "interface feedback"
  // and starts reading as a game. Volumes are deliberately quiet
  // (gain 0.03-0.06) — this plays on every click across the whole app,
  // so it has to disappear into the background, not announce itself.
  const sfx = {
    // Every .btn-primary/.btn-ghost/.shop-btn/.lobby-tile/.quiz-opt
    // click — same delegated listener core/core.js's ripple effect
    // already uses, so this rides along for free rather than needing
    // its own per-button wiring.
    click() { tone(720, { duration: 0.045, gain: 0.035, type: "triangle" }); },

    // A right answer — two quick notes, rising.
    correct() {
      tone(660, { duration: 0.1, gain: 0.05, type: "sine" });
      tone(880, { delay: 0.07, duration: 0.14, gain: 0.05, type: "sine" });
    },

    // A wrong answer — one low note, deliberately duller (square wave,
    // no rise) so it reads as "not that one," not as a failure buzzer.
    wrong() { tone(180, { duration: 0.16, gain: 0.045, type: "square" }); },

    // XP landing — a tiny three-note sparkle, quieter than `correct`
    // since this can fire alongside it (a passed exam awards XP the
    // same moment the last answer reads as correct).
    reward() {
      tone(880, { duration: 0.08, gain: 0.03, type: "sine" });
      tone(1108, { delay: 0.05, duration: 0.08, gain: 0.03, type: "sine" });
      tone(1320, { delay: 0.1, duration: 0.12, gain: 0.03, type: "sine" });
    }
  };

  function applySoundEnabled(on) {
    muted = !on;
  }

  Object.assign(Dojo, { sfx, applySoundEnabled });
})();
