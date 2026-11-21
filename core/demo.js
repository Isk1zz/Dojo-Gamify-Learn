// ================================================
// Knell — DEMO switch
// ------------------------------------------------
// The one file that turns a copy of Knell into the public demo. In the
// real app DEMO is false and nothing below the flag runs.
//
// tools/make-demo.js builds the demo by copying the app and flipping the
// flag; it also blanks the Supabase keys in that copy, so the demo holds
// no production key at all. Nothing else in the app is edited for it.
//
// With DEMO on, and all of it here:
//   1. Storage of its own. Every project page under isk1zz.github.io is
//      ONE origin, so one localStorage and one IndexedDB. Without this the
//      demo's sample profile would overwrite the real app's progress for
//      anyone who has opened both. Every key the app uses gets a prefix.
//   2. Sign-in off: core/core.js derives Dojo.OPEN_ACCESS from this flag.
//   3. A sample profile on the first visit, dated relative to TODAY, so
//      it arrives with reviews due and a healthy garden however long
//      after this was written someone opens it.
//   4. A small permanent banner: progress stays in this browser.
//   5. The Forum stays closed. It needs a server the demo does not have;
//      its lobby tile opens a one-line note instead (wired in boot.js).
//
// Loads FIRST, before core.js and i18n.js: i18n.js reads storage while
// it loads, and the prefix has to be in place before anything does.
// ================================================

window.Dojo = window.Dojo || {};
Dojo.DEMO = false;   // tools/make-demo.js sets this to true in the demo copy

(() => {
  if (!Dojo.DEMO) return;

  // ---- 1. Storage of its own ------------------------------------------
  // The app only ever calls getItem / setItem / removeItem (checked: no
  // key(), length, clear() or property access anywhere), so wrapping
  // those three is complete. IndexedDB is opened in one place,
  // core/crypto.js.
  const PREFIX = "knell-demo:";
  const S = Storage.prototype;
  const get = S.getItem, set = S.setItem, rem = S.removeItem;
  S.getItem = function (k) { return get.call(this, PREFIX + k); };
  S.setItem = function (k, v) { return set.call(this, PREFIX + k, v); };
  S.removeItem = function (k) { return rem.call(this, PREFIX + k); };
  if (window.indexedDB) {
    const open = indexedDB.open.bind(indexedDB);
    indexedDB.open = (name, version) =>
      version === undefined ? open(PREFIX + name) : open(PREFIX + name, version);
  }

  const T = {
    banner: { en: "Demo: progress is saved only in this browser.",
              ru: "Демо: прогресс сохраняется только в этом браузере." },
    forumTitle: { en: "Forum: built, not launched yet", ru: "Форум: построен, ещё не запущен" },
    forumBody: { en: "Posts, replies, praise, reports and moderation are in the code and were tested against a live database. The demo has no server, so the Forum stays closed here.",
                 ru: "Посты, ответы, похвала, жалобы и модерация есть в коде и проверялись на живой базе. У демо нет сервера, поэтому здесь форум закрыт." },
    ok: { en: "OK", ru: "Понятно" }
  };
  const t = key => {
    const lang = (window.I18N && I18N.lang && I18N.lang()) || "en";
    return T[key][lang] || T[key].en;
  };

  // ---- 3. The sample profile -------------------------------------------
  // Written through DB.importData, the same door a restored backup uses:
  // migrate() normalises it and fills every field left out here, so this
  // only lists what makes the screens worth looking at.
  //
  // Every date is relative to today, the way data/db.js writes them
  // (UTC calendar date), so a visit next year still finds three reviews
  // due and nothing withered.
  const day = n => { const d = new Date(); d.setDate(d.getDate() + n); return d.toISOString().slice(0, 10); };
  const at = n => { const d = new Date(); d.setDate(d.getDate() + n); return d.toISOString(); };
  const ALL3 = [0, 1, 2];

  function sampleProfile() {
    // Interval is the plant's growth stage (garden/garden.js):
    // Sprout 1-6, Seedling 7-20, Growing 21-29, Tree 30-59, Blossom 60+.
    const mastered = [
      // topic,                       interval, reps, ease, due in, best
      ["bike-law",                    64, 5, 2.6,  21, 100],
      ["bike-rider",                  38, 4, 2.5,  12,  80],
      ["bike-where",                  24, 3, 2.4,   0,  80],   // due today
      ["bike-traffic",                 9, 3, 2.2,  -1,  80],   // a day overdue, inside the grace week
      ["bike-control",                 6, 2, 2.5,   3, 100],
      ["cicero-man",                  16, 3, 2.7,   5,  80],
      ["cf-von-neumann",              32, 4, 2.4,   8,  80],
      ["cf-systems-classification",    1, 1, 2.5,   0,  80]    // due today
    ];
    const p = {
      name: "Alex",
      completedTopics: [],
      completedChunks: {},
      reviews: {},
      stats: {
        miniQuizTotal: 31, miniQuizCorrect: 27,
        examQuestionsTotal: 45, examQuestionsCorrect: 39,
        examsTaken: 9, examsPassed: 8,
        topicStats: {}
      },
      // 2,150 XP: rank 2, Research Assistant I (shop/ranks.js).
      charge: 2150, chargeEarned: 2150,
      // Only badges these stats really earn (library/stats.js's BADGES):
      // a mastered topic, a 100% exam, and the 9-day streak below.
      pinnedBadges: ["first-topic", "perfect-exam", "week-streak"],
      streak: { count: 9, lastActiveDate: day(-1), freezes: 2, freezeWeekStart: null },
      // Half way through a topic, so the lobby offers "Continue".
      lastPosition: { unitId: 31, topicId: "bike-hazards", chunkIdx: 1 },
      // Signed, so the courses open straight in. Intro to CS is left
      // unsigned on purpose: its contract is part of the app.
      courseContracts: {
        "bike-a3": { signature: null, signedAt: at(-30) },
        "philosophy": { signature: null, signedAt: at(-18) }
      },
      lobbyStyle: "star",
      sky: "night"
    };
    mastered.forEach(([id, interval, reps, ease, due, best], i) => {
      p.completedTopics.push(id);
      p.completedChunks[id] = ALL3.slice();
      p.reviews[id] = { due: day(due), interval, ease, lapses: 0, reps };
      p.stats.topicStats[id] = {
        attempts: 1, bestScore: best, lastScore: best,
        completedAt: at(-(interval + 2 + i)), chunkResults: [true, true, true]
      };
    });
    // Read, exam failed once: the Garden's "Seed" stage.
    p.completedChunks["cicero-work"] = ALL3.slice();
    p.stats.topicStats["cicero-work"] = { attempts: 1, bestScore: 60, lastScore: 60, completedAt: null, chunkResults: [true, false, true] };
    // Started, not finished: what "Continue where you left off" resumes.
    p.completedChunks["bike-hazards"] = [0];
    return p;
  }

  // Called by core/boot.js just before DB.init(). Only on a visit with no
  // profile yet, so it never overwrites what a visitor has done.
  Dojo.seedDemo = function () {
    if (DB.getActiveProfile()) return;
    const db = { version: 9, activeProfileId: "demo", profiles: { demo: sampleProfile() } };
    const file = new Blob([JSON.stringify(db)], { type: "application/json" });
    DB.importData(file)
      .then(() => Dojo.Bus && Dojo.Bus.emit("profile:changed"))
      .catch(e => console.warn("[demo] sample profile not loaded:", e.message));
  };

  // ---- 4. The banner ---------------------------------------------------
  // Fixed, small, never in the way: it ignores the pointer, so nothing
  // under it ever stops being clickable.
  function addBanner() {
    if (document.getElementById("demo-banner")) return;
    const b = document.createElement("div");
    b.id = "demo-banner";
    b.setAttribute("role", "note");
    b.textContent = t("banner");
    Object.assign(b.style, {
      position: "fixed", top: "38px", left: "50%", transform: "translateX(-50%)",
      zIndex: "9000", pointerEvents: "none", whiteSpace: "nowrap",
      padding: "3px 12px", borderRadius: "999px", font: "600 11px/1.6 system-ui, sans-serif",
      color: "#1b1405", background: "rgba(242, 193, 78, 0.92)",
      boxShadow: "0 2px 10px rgba(0,0,0,0.35)"
    });
    document.body.appendChild(b);
  }

  // ---- 5. The Forum note -------------------------------------------------
  // Its own small dialog, built here, so the Forum branch is not touched.
  Dojo.demoForumNote = function () {
    let m = document.getElementById("demo-forum-note");
    if (!m) {
      m = document.createElement("div");
      m.id = "demo-forum-note";
      m.className = "modal-overlay";
      m.setAttribute("role", "dialog");
      m.setAttribute("aria-modal", "true");
      const card = document.createElement("div");
      card.className = "modal-card";
      const icon = document.createElement("div");
      icon.className = "modal-icon";
      icon.textContent = "\u{1F4AC}";
      const h = document.createElement("h2");
      h.className = "modal-title";
      h.textContent = t("forumTitle");
      const p = document.createElement("p");
      p.className = "modal-desc";
      p.textContent = t("forumBody");
      const ok = document.createElement("button");
      ok.className = "btn-primary";
      ok.textContent = t("ok");
      ok.addEventListener("click", () => { m.style.display = "none"; });
      m.addEventListener("click", e => { if (e.target === m) m.style.display = "none"; });
      card.append(icon, h, p, ok);
      m.appendChild(card);
      document.body.appendChild(m);
    }
    m.style.display = "flex";
  };

  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", addBanner);
  else addBanner();
})();
