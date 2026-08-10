// ================================================
// CS Dojo — CORE / kernel
// ------------------------------------------------
// The ONLY things every branch is allowed to depend on:
//   Dojo.state      shared runtime state (not persisted)
//   Dojo.Bus        publish/subscribe events
//   Dojo.Router     screen navigation
//   Dojo.showScreen low-level screen swap (Router uses it)
//   Dojo.util       shuffling + quote helpers
//   DB              persistence (data/db.js)
//
// Nothing in core knows what a course, a plant, a card or a
// theme is. If you find yourself adding one, it belongs in a
// branch folder instead. See docs/ARCHITECTURE.md.
// ================================================

window.Dojo = window.Dojo || {};

// ---- Shared runtime state ----
  // ---- State ----
  const state = {
    currentCourse: null,
    missedChunks: [],   // chunk indices answered wrong — re-asked before the exam
    inRetry: false,
    reviewMode: false,
    currentUnit: null,       // which unit (6, 7, ...) is currently selected
    currentTopics: [],       // the flattened, decorated topic list for currentUnit
    currentTopicIdx: null,
    currentChunk: 0,
    chunkPhase: "explain",
    quizAnswer: null,
    quizSubmitted: false,
    examIndex: 0,
    examAnswers: [],
    examSubmitted: [],
    dropdownOpen: false,
  };

// ---- Event bus ----
// Branches talk to each other by publishing facts, not by calling
// each other's render functions. "topic:completed" is a fact; the
// Garden, Stats and HUD each decide for themselves what to do with it.
const Bus = (() => {
  const listeners = {};
  return {
    on(event, fn) {
      (listeners[event] = listeners[event] || []).push(fn);
      return () => Bus.off(event, fn);
    },
    off(event, fn) {
      if (!listeners[event]) return;
      listeners[event] = listeners[event].filter(f => f !== fn);
    },
    emit(event, payload) {
      (listeners[event] || []).forEach(fn => {
        // One broken listener must not stop the others.
        try { fn(payload); } catch (e) { console.error(`[Bus] ${event}`, e); }
      });
    }
  };
})();

// ---- Utilities & screen swap ----
  // ---- Utilities ----

  // Fisher-Yates. Modules 1-4 shipped with every exam in fixed order
  // with options in fixed positions, so a failed exam could be passed
  // on retry by remembering "it was the third one". This closes that.
  function shuffled(arr) {
    const a = arr.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }

  // Shuffles a question's options and returns the new index of the
  // correct answer, so `correct` stays meaningful after reordering.
  function shuffleQuestion(q) {
    const paired = q.options.map((text, i) => ({ text, wasCorrect: i === q.correct }));
    const mixed = shuffled(paired);
    return {
      ...q,
      options: mixed.map(o => o.text),
      correct: mixed.findIndex(o => o.wasCorrect)
    };
  }

  // Draws from the whole pool rather than a per-chunk list, so the
  // quotes don't run out. Quotes tagged to the chunk's concept are
  // preferred when available; recently shown ones are excluded.
  function pickQuote(tags) {
    if (typeof WISDOM === "undefined" || !WISDOM.length) return null;
    const seen = DB.getSeenQuotes();
    let pool = WISDOM.map((q, i) => ({ q, i })).filter(x => !seen.includes(x.i));
    if (!pool.length) pool = WISDOM.map((q, i) => ({ q, i }));

    if (tags && tags.length) {
      const matching = pool.filter(x => x.q.tags && x.q.tags.some(t => tags.includes(t)));
      if (matching.length) pool = matching;
    }

    const chosen = pool[Math.floor(Math.random() * pool.length)];
    DB.pushSeenQuote(chosen.i);
    return chosen.q;
  }

  function quoteHtml(q) {
    if (!q) return "";
    return `
      <div class="wisdom-card">
        <div class="wisdom-mark">&ldquo;</div>
        <blockquote class="wisdom-text">${q.text}</blockquote>
        <div class="wisdom-author">— ${q.author}</div>
        <div class="wisdom-source">${q.source}</div>
      </div>`;
  }

  function showScreen(id) {
    document.querySelectorAll(".screen").forEach(s => s.classList.remove("active"));
    document.getElementById(id).classList.add("active");
    window.scrollTo(0, 0);
    if (Dojo.closeDropdown) Dojo.closeDropdown();   // profiles branch may not be loaded
  }

// ---- Router ----
// A branch registers its screen once, at load. Everything else
// navigates with Router.go("garden") and never touches another
// branch's render function directly.
const Router = (() => {
  const screens = {};
  let current = "landing";
  const history = [];
  return {
    register(id, handlers) { screens[id] = handlers || {}; },
    registered() { return Object.keys(screens); },
    current() { return current; },
    go(id, payload) {
      const s = screens[id];
      if (!s) { console.warn(`[Router] no screen "${id}"`); return false; }
      if (current !== id) history.push(current);
      if (typeof s.render === "function") s.render(payload);
      showScreen(id);
      current = id;
      Bus.emit("screen:changed", { id, payload });
      return true;
    },
    back() {
      const prev = history.pop() || "lobby";
      const s = screens[prev];
      if (s && typeof s.render === "function") s.render();
      showScreen(prev);
      current = prev;
      return prev;
    }
  };
})();

Object.assign(Dojo, {
  state, Bus, Router, showScreen,
  shuffled, shuffleQuestion, pickQuote, quoteHtml
});
