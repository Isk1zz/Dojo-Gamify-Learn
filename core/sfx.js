// ================================================
// Knell — CORE / sfx
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

  // A short burst of noise through a band-pass filter that sweeps upward:
  // paper sliding. Same quiet envelope and the same mute as tone().
  function swish({ delay = 0, duration = 0.25, gain = 0.03, freq = 2000 } = {}) {
    if (muted) return;
    const audio = getCtx();
    if (!audio) return;
    if (audio.state === "suspended") audio.resume();
    const t0 = audio.currentTime + delay;
    const len = Math.ceil(audio.sampleRate * duration);
    const buf = audio.createBuffer(1, len, audio.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < len; i++) data[i] = Math.random() * 2 - 1;
    const src = audio.createBufferSource();
    src.buffer = buf;
    const band = audio.createBiquadFilter();
    band.type = "bandpass";
    band.Q.value = 0.9;
    band.frequency.setValueAtTime(freq, t0);
    band.frequency.exponentialRampToValueAtTime(freq * 1.6, t0 + duration);
    const g = audio.createGain();
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(gain, t0 + duration * 0.3);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
    src.connect(band).connect(g).connect(audio.destination);
    src.start(t0);
    src.stop(t0 + duration + 0.02);
  }

  // A tone that slides from one pitch to another: a firework's whistle.
  function glide(f1, f2, { delay = 0, duration = 0.5, type = "sine", gain = 0.03 } = {}) {
    if (muted) return;
    const audio = getCtx();
    if (!audio) return;
    if (audio.state === "suspended") audio.resume();
    const t0 = audio.currentTime + delay;
    const osc = audio.createOscillator();
    const g = audio.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(f1, t0);
    osc.frequency.exponentialRampToValueAtTime(f2, t0 + duration);
    g.gain.setValueAtTime(0, t0);
    g.gain.linearRampToValueAtTime(gain, t0 + 0.03);
    g.gain.linearRampToValueAtTime(gain * 0.6, t0 + duration * 0.8);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);
    osc.connect(g).connect(audio.destination);
    osc.start(t0);
    osc.stop(t0 + duration + 0.02);
  }

  // ---- The actual sound set ----
  // The interface itself is kept to four: any more and it stops reading
  // as "interface feedback" and starts reading as a game. Volumes are
  // deliberately quiet (gain 0.03-0.06) — this plays on every click across
  // the whole app, so it has to disappear into the background, not
  // announce itself. The start screen's garden adds its own, heard only
  // when someone plays with it: the bell, the stage notes, and the
  // mailbox's tin and paper.
  const sfx = {
    // Every .btn-primary/.btn-ghost/.shop-btn/.lobby-tile/.quiz-opt
    // click — same delegated listener core/core.js's ripple effect
    // already uses, so this rides along for free rather than needing
    // its own per-button wiring.
    click() { tone(720, { duration: 0.045, gain: 0.035, type: "triangle" }); },

    // The start screen's bell (scenes/knell-garden.js), and the one
    // sound allowed to ring out, because it is the app's name and it
    // only plays when someone sends the runner to ring it. A struck
    // bell's partials, the hum an octave down to the nominal an octave
    // up, each dying away at its own rate, the low ones last.
    bell() {
      const f = 330;
      [[0.5, 3.2, 0.028], [1, 2.6, 0.05], [1.2, 1.6, 0.022], [1.5, 1.3, 0.018],
       [2, 1.9, 0.028], [2.5, 1.0, 0.011], [3, 0.8, 0.009]]
        .forEach(([ratio, duration, gain]) => tone(f * ratio, { duration, gain, type: "sine" }));
    },

    // The start screen's stages, a note each, rising up a pentatonic scale
    // from the sprout to the bell, so the garden's path is a phrase you
    // can hear ("a nice sound trail ... for numbers 1 through 6",
    // 2026-11-22). A tap plays the note with a fifth and an octave
    // trailing after it like a chime settling; `soft` is the quieter,
    // bare note for a stage the runner passes on his way, and for the one
    // he lands on. Pentatonic so that any order of taps sounds right.
    // The mailbox at the garden gate sounds like tin and paper, not like a
    // note, so it is plainly not a stage ("a different sound for
    // mailbox", 2026-11-22). The tap: the lid's tin clack. The letter
    // opening (core/letter.js plays it, wherever it is opened from):
    // paper sliding out and unfolding, then a small two-note chime.
    mailbox() {
      tone(1760, { duration: 0.045, gain: 0.028, type: "triangle" });
      tone(2637, { delay: 0.03, duration: 0.06, gain: 0.018, type: "triangle" });
      tone(1174.7, { delay: 0.075, duration: 0.14, gain: 0.02, type: "triangle" });
    },
    letter() {
      swish({ duration: 0.3, gain: 0.035, freq: 1600 });
      swish({ delay: 0.24, duration: 0.18, gain: 0.022, freq: 3000 });
      tone(1567.98, { delay: 0.34, duration: 0.5, gain: 0.022, type: "sine" });
      tone(2093.0, { delay: 0.44, duration: 0.75, gain: 0.018, type: "sine" });
    },

    stage(n, soft) {
      const SCALE = [523.25, 587.33, 659.25, 783.99, 880.0, 1046.5];   // C5 D5 E5 G5 A5 C6
      const f = SCALE[Math.max(0, Math.min(SCALE.length - 1, Math.round(n) - 1))];
      const g = soft ? 0.45 : 1;
      tone(f, { duration: soft ? 0.55 : 0.9, gain: 0.05 * g, type: "sine" });
      tone(f * 2, { duration: 0.4, gain: 0.012 * g, type: "sine" });
      if (!soft) {
        tone(f * 1.5, { delay: 0.09, duration: 0.6, gain: 0.022, type: "triangle" });
        tone(f * 2, { delay: 0.18, duration: 0.5, gain: 0.014, type: "sine" });
      }
    },

    // The sky's answers when someone pokes it (shop/decor.js). Until
    // 2026-11-24 every poke made the same button click; now each sounds
    // like what it shows, still quiet, all synthesized like the rest.
    sky(kind) {
      switch (kind) {
        case "drizzle": swish({ duration: 1.1, gain: 0.014, freq: 3200 }); break;
        case "rain":    swish({ duration: 1.5, gain: 0.022, freq: 2600 }); break;
        case "storm":   swish({ duration: 2.0, gain: 0.034, freq: 1900 }); break;
        case "thunder":
          tone(1900, { duration: 0.05, gain: 0.02, type: "square" });
          swish({ delay: 0.12, duration: 1.4, gain: 0.05, freq: 110 });
          tone(52, { delay: 0.12, duration: 1.1, gain: 0.04, type: "sine" });
          break;
        case "rainbow":
          [523.25, 659.25, 783.99, 1046.5].forEach((f, i) =>
            tone(f, { delay: i * 0.09, duration: 0.4, gain: 0.024, type: "sine" }));
          break;
        case "fairy":
          [1567.98, 2093.0, 2637.0, 3135.96].forEach((f, i) =>
            tone(f, { delay: i * 0.06, duration: 0.2, gain: 0.014, type: "triangle" }));
          break;
        case "bounce":
          tone(196, { duration: 0.12, gain: 0.04, type: "sine" });
          tone(294, { delay: 0.09, duration: 0.12, gain: 0.03, type: "sine" });
          break;
        case "whoosh": swish({ duration: 0.5, gain: 0.03, freq: 700 }); break;
        case "bow":
          swish({ duration: 0.18, gain: 0.03, freq: 900 });
          break;
        case "hit":  tone(1320, { duration: 0.07, gain: 0.025, type: "triangle" }); break;
        case "miss": tone(330, { duration: 0.1, gain: 0.02, type: "sine" }); break;
        case "sun":
          tone(392.0, { duration: 0.7, gain: 0.024, type: "sine" });
          tone(587.33, { delay: 0.12, duration: 0.7, gain: 0.02, type: "sine" });
          break;
        case "moon":
          tone(261.63, { duration: 0.9, gain: 0.024, type: "sine" });
          tone(392.0, { delay: 0.18, duration: 0.9, gain: 0.016, type: "sine" });
          break;
        // A dart: the whoosh as it leaves the hand, then (from decor.js, as it
        // lands 0.3s later) a woody thunk with a click on top and the twang
        // of the shaft quivering, in time with the dart's own wobble.
        case "dartThrow": swish({ duration: 0.28, gain: 0.026, freq: 1400 }); break;
        // The balloon (shop/decor.js): the basket letting go with a pop and
        // a bright little fanfare, then each firework's whistle up, its
        // bang, and the crackle of the sparks.
        case "balloon":
          swish({ duration: 0.08, gain: 0.05, freq: 900 });
          tone(140, { duration: 0.15, gain: 0.04, type: "sine" });
          [523.25, 659.25, 783.99, 1046.5, 1318.5].forEach((f, i) =>
            tone(f, { delay: 0.1 + i * 0.07, duration: 0.3, gain: 0.022, type: "triangle" }));
          break;
        case "fwUp": glide(380, 1500, { duration: 0.5, gain: 0.014, type: "sine" }); break;
        case "fwBang":
          swish({ duration: 0.5, gain: 0.05, freq: 160 });
          tone(70, { duration: 0.45, gain: 0.04, type: "sine" });
          for (let i = 0; i < 9; i++) {
            swish({ delay: 0.12 + Math.random() * 0.7, duration: 0.025, gain: 0.02, freq: 4000 + Math.random() * 3000 });
          }
          break;
        case "dart":
          tone(160, { duration: 0.07, gain: 0.05, type: "square" });
          swish({ duration: 0.04, gain: 0.04, freq: 3500 });
          tone(98, { delay: 0.01, duration: 0.12, gain: 0.04, type: "sine" });
          [0.06, 0.16, 0.27].forEach((d, i) =>
            tone(587.33, { delay: d, duration: 0.1, gain: 0.012 / (i + 1), type: "triangle" }));
          break;
      }
    },

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
