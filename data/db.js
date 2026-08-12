// ================================================
// Unit6 Dojo — Local Database (db.js)
// Manages profiles, progress, and statistics
// using localStorage as a persistent store.
//
// FUTURE-PROOFING:
// - All data is keyed by topic ID, not index
// - DB version field allows migrations
// - Profiles are independent — no cross-contamination
// - Adding new modules/topics requires zero DB changes
// ================================================

const DB = (() => {
  const STORAGE_KEY = "unit6-dojo-db";
  const DB_VERSION = 9;

  // Tickets are now the ONLY arcade limiter: 7 per 6 hours, ceiling 7.
  // Energy was removed in v6 — it and tickets were two rate limits doing
  // the same job, and the one that actually reads as "come back later"
  // is the ticket. The `energy` field is kept in stored profiles because
  // migrations never drop fields, but nothing reads it.
  const TICKET_MAX = 7;
  const TICKET_PER_MS = 7 / (6 * 60 * 60 * 1000);



  // ---- Default structures ----
  function defaultDB() {
    return {
      version: DB_VERSION,
      activeProfileId: null,
      profiles: {}
    };
  }

  function defaultProfile(name) {
    return {
      name: name || "Student",
      createdAt: new Date().toISOString(),
      completedTopics: [],
      completedChunks: {},   // { topicId: [0, 1, 2] }
      reviews: {},           // { topicId: { due, interval, ease, lapses, reps } }
      seenQuotes: [],        // recent quote indices, so they don't repeat
      charge: 0,             // historical key — session XP counter
      chargeEarned: 0,       // lifetime earned — never decreases, for stats
      chargeSpent: 0,        // lifetime spent in the shop
      ownedThemes: [],       // premium theme ids bought; free themes are never listed
      theme: "indigo",       // colour theme id
      lobbyStyle: "classic", // "classic" | "cards" — a re-skin of the Lobby tiles, not a rearrangement

      // ---- v5: economy & life-sim ----
      wallet: 0,             // $ earned from garden dividends and mini-games
      tickets: TICKET_MAX,   // arcade entries; 2 per 6h, hard ceiling on losses
      ticketsUpdatedAt: null,
      lastDividendClaim: null,
      inventory: [],         // purchased life-shop item ids
      storyProgress: {
        unlockedNodes: ["act1_node1"],
        completedNodes: [],
        attempts: {},        // { nodeId: { tries, lastOutcome } }
        flags: []            // narrative facts a later scene can require
      },
      lastVitalTick: null,   // ISO date string — one daily decay tick per day visited
      vitals: {              // 0-100 each
        hunger: 100,
        thirst: 100,
        hygiene: 100,
        shelterTier: "street"   // street | hostel | apartment | car
      },
      lastPosition: null,    // { unitId, topicId, chunkIdx } — resume point

      // ---- v9: course contracts ----
      // A funny, in-theme "sign here" gimmick shown once per course, the
      // first time it's entered — a drawn signature (canvas dataURL,
      // downsized before storage), never a real personal-data form. See
      // library/library.js's showContractModal.
      courseContracts: {}, // { courseId: { signature, signedAt } }

      // ---- v7: streak ----
      // A deliberate reversal of PROJECT.md §5's "no streaks" decision —
      // see data/DATA.md for why. `freezes` refills to 2 at the start of
      // each real week (Mon) and is spent automatically to bridge a gap
      // of missed days before the streak actually breaks.
      streak: { count: 0, lastActiveDate: null, freezes: 2, freezeWeekStart: null },
      stats: {
        miniQuizTotal: 0,
        miniQuizCorrect: 0,
        examQuestionsTotal: 0,
        examQuestionsCorrect: 0,
        examsTaken: 0,
        examsPassed: 0,
        topicStats: {}
        // topicStats[topicId] = { attempts, bestScore, lastScore, completedAt, chunkResults: [bool] }
      }
    };
  }

  // ---- Core I/O ----
  function load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const db = JSON.parse(raw);
        if (db.version === DB_VERSION) return db;
        return migrate(db);
      }
    } catch (e) { /* corrupt data, start fresh */ }
    // Check for legacy progress (v1 format)
    return migrateFromLegacy();
  }

  function save(db) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(db));
  }

  function migrateFromLegacy() {
    const db = defaultDB();
    try {
      const legacy = localStorage.getItem("unit6-dojo-progress");
      if (legacy) {
        const d = JSON.parse(legacy);
        const profileId = generateId();
        const profile = defaultProfile("Student");
        profile.completedTopics = d.completedTopics || [];
        profile.completedChunks = {};
        for (const [k, v] of Object.entries(d.completedChunks || {})) {
          profile.completedChunks[k] = Array.isArray(v) ? v : [...v];
        }
        db.profiles[profileId] = profile;
        db.activeProfileId = profileId;
        localStorage.removeItem("unit6-dojo-progress");
      }
    } catch (e) { /* ignore */ }
    save(db);
    return db;
  }

  function migrate(db) {
    // v2 -> v3: introduce spaced review scheduling.
    // Topics already completed are given a review due today, so an
    // existing user immediately sees their back catalogue rather than
    // an empty queue. Nothing is lost.
    if (db.version < 3) {
      const today = new Date().toISOString().slice(0, 10);
      for (const p of Object.values(db.profiles || {})) {
        if (!p.reviews) {
          p.reviews = {};
          (p.completedTopics || []).forEach(id => {
            p.reviews[id] = { due: today, interval: 1, ease: 2.5, lapses: 0, reps: 1 };
          });
        }
        if (!p.seenQuotes) p.seenQuotes = [];
      }
    }
    // v3 -> v4: charge, theme and resume position.
    if (db.version < 4) {
      for (const p of Object.values(db.profiles || {})) {
        if (typeof p.charge !== "number") p.charge = 0;
        if (!p.theme) p.theme = "indigo";
        if (p.lastPosition === undefined) p.lastPosition = null;
      }
    }
    // v4 -> v5 (part 1): charge becomes spendable and the shop needs to know what
    // has been bought. Existing balances are treated as already earned so
    // the lifetime counter isn't zero for someone mid-course.
    if (db.version < 5) {
      for (const p of Object.values(db.profiles || {})) {
        if (typeof p.chargeEarned !== "number") p.chargeEarned = p.charge || 0;
        if (typeof p.chargeSpent !== "number") p.chargeSpent = 0;
        if (!Array.isArray(p.ownedThemes)) p.ownedThemes = [];
        // v4 -> v5 (part 2): economy and life-sim fields. Every one of
        // these is additive with a safe default, so an existing profile
        // keeps all its progress and simply starts the new systems at
        // zero. Never drop a field in a migration.
        if (typeof p.wallet !== "number") p.wallet = 0;
        if (typeof p.tickets !== "number") p.tickets = TICKET_MAX;
        if (p.ticketsUpdatedAt === undefined) p.ticketsUpdatedAt = null;
        if (p.lastDividendClaim === undefined) p.lastDividendClaim = null;
        if (!Array.isArray(p.inventory)) p.inventory = [];
        if (!p.storyProgress) p.storyProgress = { unlockedNodes: ["act1_node1"], completedNodes: [] };
        if (!p.storyProgress.attempts) p.storyProgress.attempts = {};
        if (!Array.isArray(p.storyProgress.flags)) p.storyProgress.flags = [];
        if (!p.vitals) p.vitals = { hunger: 100, thirst: 100, hygiene: 100, shelterTier: "street" };
        if (p.lastVitalTick === undefined) p.lastVitalTick = null;
      }
    }
    // v5 -> v6: energy retired, XP uncapped.
    // Anyone who had banked charge under the old 400 cap keeps it, and
    // their lifetime total is topped up to at least what they're holding
    // so a long-standing profile doesn't rank up from zero.
    if (db.version < 6) {
      for (const p of Object.values(db.profiles || {})) {
        if ((p.chargeEarned || 0) < (p.charge || 0)) p.chargeEarned = p.charge || 0;
      }
    }
    // v6 -> v7: streak tracking. Starts at 0, not backfilled from
    // completedTopics — there's no record of which real days existing
    // progress was made on, so a fabricated streak would just be a lie
    // the app tells about its own history.
    if (db.version < 7) {
      for (const p of Object.values(db.profiles || {})) {
        if (!p.streak) p.streak = { count: 0, lastActiveDate: null, freezes: 2, freezeWeekStart: null };
      }
    }
    // v7 -> v8: lobbyStyle. A re-skin of the Lobby tiles (see
    // core/lobby.js), not a rearrangement — defaults to the existing look.
    if (db.version < 8) {
      for (const p of Object.values(db.profiles || {})) {
        if (!p.lobbyStyle) p.lobbyStyle = "classic";
      }
    }
    // v8 -> v9: course contracts. An existing profile has presumably
    // already "entered" whatever courses it has progress in, so back-
    // filling a signature for those would be dishonest — it starts
    // empty and the modal fires the next time an unsigned course is
    // opened, same as any other course, old profile or new.
    if (db.version < 9) {
      for (const p of Object.values(db.profiles || {})) {
        if (!p.courseContracts) p.courseContracts = {};
      }
    }
    db.version = DB_VERSION;
    save(db);
    return db;
  }

  function generateId() {
    return 'p_' + Date.now().toString(36) + '_' + Math.random().toString(36).slice(2, 7);
  }

  // ---- Profile management ----
  function init() {
    return load();
  }

  function getActiveProfile() {
    const db = load();
    if (!db.activeProfileId || !db.profiles[db.activeProfileId]) return null;
    return { id: db.activeProfileId, ...db.profiles[db.activeProfileId] };
  }

  function createProfile(name) {
    const db = load();
    const id = generateId();
    db.profiles[id] = defaultProfile(name);
    db.activeProfileId = id;
    save(db);
    return id;
  }

  function setActiveProfile(id) {
    const db = load();
    if (db.profiles[id]) {
      db.activeProfileId = id;
      save(db);
    }
  }

  function updateProfileName(name) {
    const db = load();
    const p = db.profiles[db.activeProfileId];
    if (p) {
      p.name = name;
      save(db);
    }
  }

  function deleteProfile(id) {
    const db = load();
    delete db.profiles[id];
    if (db.activeProfileId === id) {
      const remaining = Object.keys(db.profiles);
      db.activeProfileId = remaining.length > 0 ? remaining[0] : null;
    }
    save(db);
  }

  function listProfiles() {
    const db = load();
    return Object.entries(db.profiles).map(([id, p]) => ({
      id,
      name: p.name,
      createdAt: p.createdAt,
      topicsCompleted: (p.completedTopics || []).length
    }));
  }

  // ---- Progress ----
  function getCompletedTopics() {
    const p = getActiveProfile();
    return p ? new Set(p.completedTopics || []) : new Set();
  }

  function getCompletedChunks() {
    const p = getActiveProfile();
    if (!p) return {};
    const result = {};
    for (const [k, v] of Object.entries(p.completedChunks || {})) {
      result[k] = new Set(Array.isArray(v) ? v : []);
    }
    return result;
  }

  function markChunkComplete(topicId, chunkIdx) {
    const db = load();
    const p = db.profiles[db.activeProfileId];
    if (!p) return;
    if (!p.completedChunks[topicId]) p.completedChunks[topicId] = [];
    if (!p.completedChunks[topicId].includes(chunkIdx)) {
      p.completedChunks[topicId].push(chunkIdx);
    }
    save(db);
  }

  function markTopicComplete(topicId) {
    const db = load();
    const p = db.profiles[db.activeProfileId];
    if (!p) return;
    if (!p.completedTopics.includes(topicId)) {
      p.completedTopics.push(topicId);
    }
    save(db);
  }

  // ---- Streak ----
  // Monday-based week start, as YYYY-MM-DD — the key freezes refill against.
  function isoWeekStart(dateStr) {
    const d = new Date(dateStr + "T00:00:00Z");
    const day = d.getUTCDay();               // 0=Sun..6=Sat
    d.setUTCDate(d.getUTCDate() + ((day === 0 ? -6 : 1) - day));
    return d.toISOString().slice(0, 10);
  }

  function daysBetween(a, b) {
    return Math.round((new Date(b + "T00:00:00Z") - new Date(a + "T00:00:00Z")) / 86400000);
  }

  function getStreak() {
    const p = getActiveProfile();
    return p ? (p.streak || { count: 0, lastActiveDate: null, freezes: 2, freezeWeekStart: null }) : null;
  }

  // Called once per qualifying study action (a completed chunk). Only the
  // FIRST call on a given real day changes anything — same "per day
  // opened, not per action" shape the old vitals tick used. Refills
  // freezes to 2 at the start of each real week, then spends them
  // automatically to bridge a gap of fully-missed days before the streak
  // actually breaks.
  function touchStreak() {
    const db = load();
    const p = db.profiles[db.activeProfileId];
    if (!p) return null;
    if (!p.streak) p.streak = { count: 0, lastActiveDate: null, freezes: 2, freezeWeekStart: null };
    const s = p.streak;
    const today = new Date().toISOString().slice(0, 10);

    const weekStart = isoWeekStart(today);
    if (s.freezeWeekStart !== weekStart) {
      s.freezeWeekStart = weekStart;
      s.freezes = 2;
    }

    // `changed` tells the caller whether this is the first qualifying
    // action of a real day — that's the "renewed" moment worth animating.
    // A same-day re-touch (most calls, most days) is deliberately silent.
    const changed = s.lastActiveDate !== today;
    if (changed) {
      if (s.lastActiveDate === null) {
        s.count = 1;
      } else {
        const gap = daysBetween(s.lastActiveDate, today) - 1;   // fully-missed days
        if (gap <= 0) s.count += 1;                              // yesterday -> today
        else if (gap <= s.freezes) { s.freezes -= gap; s.count += 1; }  // bridged
        else s.count = 1;                                        // gap too big — restart
      }
      s.lastActiveDate = today;
    }
    save(db);
    return { ...s, changed };
  }

  // ---- Stats recording ----
  function recordQuizAnswer(topicId, chunkIdx, isCorrect) {
    const db = load();
    const p = db.profiles[db.activeProfileId];
    if (!p) return;
    p.stats.miniQuizTotal++;
    if (isCorrect) p.stats.miniQuizCorrect++;
    // Per-topic chunk results
    if (!p.stats.topicStats[topicId]) {
      p.stats.topicStats[topicId] = { attempts: 0, bestScore: 0, lastScore: 0, completedAt: null, chunkResults: [] };
    }
    const ts = p.stats.topicStats[topicId];
    ts.chunkResults[chunkIdx] = isCorrect;
    save(db);
  }

  function recordExamResult(topicId, correct, total, passed) {
    const db = load();
    const p = db.profiles[db.activeProfileId];
    if (!p) return;
    const pct = Math.round((correct / total) * 100);
    p.stats.examQuestionsTotal += total;
    p.stats.examQuestionsCorrect += correct;
    p.stats.examsTaken++;
    if (passed) p.stats.examsPassed++;
    if (!p.stats.topicStats[topicId]) {
      p.stats.topicStats[topicId] = { attempts: 0, bestScore: 0, lastScore: 0, completedAt: null, chunkResults: [] };
    }
    const ts = p.stats.topicStats[topicId];
    ts.attempts++;
    ts.lastScore = pct;
    if (pct > ts.bestScore) ts.bestScore = pct;
    if (passed) ts.completedAt = new Date().toISOString();
    save(db);
  }

  // Last-attempt correctness for one chunk's mini-quiz, or undefined if
  // it's never been answered. The only per-chunk signal the app keeps
  // (no chunk-level SM-2 — see PROJECT.md), so it's what the custom
  // flashcard deck builder sorts "worst known first" by.
  function getChunkResult(topicId, chunkIdx) {
    const p = getActiveProfile();
    const ts = p && p.stats.topicStats[topicId];
    return ts ? ts.chunkResults[chunkIdx] : undefined;
  }

  // ---- Stats retrieval ----
  function getStats() {
    const p = getActiveProfile();
    if (!p) return null;
    const s = p.stats;
    const totalTopics = typeof ALL_TOPICS !== 'undefined' ? ALL_TOPICS.length : 0;
    const topicsCompleted = (p.completedTopics || []).length;

    return {
      profileName: p.name,
      createdAt: p.createdAt,
      topicsCompleted,
      totalTopics,
      completionPct: totalTopics > 0 ? Math.round((topicsCompleted / totalTopics) * 100) : 0,
      miniQuizTotal: s.miniQuizTotal,
      miniQuizCorrect: s.miniQuizCorrect,
      miniQuizAccuracy: s.miniQuizTotal > 0 ? Math.round((s.miniQuizCorrect / s.miniQuizTotal) * 100) : 0,
      examQuestionsTotal: s.examQuestionsTotal,
      examQuestionsCorrect: s.examQuestionsCorrect,
      examAccuracy: s.examQuestionsTotal > 0 ? Math.round((s.examQuestionsCorrect / s.examQuestionsTotal) * 100) : 0,
      examsTaken: s.examsTaken,
      examsPassed: s.examsPassed,
      examPassRate: s.examsTaken > 0 ? Math.round((s.examsPassed / s.examsTaken) * 100) : 0,
      topicStats: s.topicStats
    };
  }

  // ---- Spaced review (SM-2) ----
  // Woźniak's 1987 algorithm. Deliberately NOT FSRS: FSRS needs hundreds
  // of reviews before its model fits, so it performs worse than SM-2 at
  // small scale. Revisit once there is real usage data.
  function todayStr() {
    return new Date().toISOString().slice(0, 10);
  }

  function addDays(days) {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return d.toISOString().slice(0, 10);
  }

  // quality: 0-5. Derived from exam percentage.
  function scheduleReview(topicId, quality) {
    const db = load();
    const p = db.profiles[db.activeProfileId];
    if (!p) return;
    if (!p.reviews) p.reviews = {};

    const r = p.reviews[topicId] || { interval: 0, ease: 2.5, lapses: 0, reps: 0 };

    if (quality < 3) {
      // Failed. Back to tomorrow, and the card gets easier to trigger.
      r.reps = 0;
      r.interval = 1;
      r.lapses = (r.lapses || 0) + 1;
    } else {
      r.reps = (r.reps || 0) + 1;
      if (r.reps === 1) r.interval = 1;
      else if (r.reps === 2) r.interval = 6;
      else r.interval = Math.round(r.interval * r.ease);
    }

    // Ease adjustment, floored at 1.3 to avoid SM-2's "ease hell".
    r.ease = Math.max(1.3, r.ease + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02)));
    r.due = addDays(r.interval);
    p.reviews[topicId] = r;
    save(db);
  }

  function getReviews() {
    const p = getActiveProfile();
    return p ? (p.reviews || {}) : {};
  }

  function getDueTopicIds() {
    const reviews = getReviews();
    const today = todayStr();
    return Object.keys(reviews).filter(id => reviews[id].due && reviews[id].due <= today);
  }

  function daysUntilDue(topicId) {
    const r = getReviews()[topicId];
    if (!r || !r.due) return null;
    const diff = Math.ceil((new Date(r.due) - new Date(todayStr())) / 86400000);
    return diff;
  }

  // ---- Weak spots ----
  // Answers "what should I study now?" — the only question a learner has.
  // Everything here is already recorded; it was just never surfaced.
  function getWeakSpots(limit) {
    const p = getActiveProfile();
    if (!p) return [];
    const reviews = p.reviews || {};
    const ts = p.stats.topicStats || {};
    return Object.keys(ts)
      .map(id => ({
        topicId: id,
        lastScore: ts[id].lastScore || 0,
        bestScore: ts[id].bestScore || 0,
        attempts: ts[id].attempts || 0,
        lapses: (reviews[id] && reviews[id].lapses) || 0
      }))
      .filter(t => t.attempts > 0)
      // Composite weakness: recent score dominates, each lapse costs
      // 10 points. Sorting by lapses first would rank a topic scoring
      // 100% above one scoring 40%, which is not what "weak" means.
      .map(t => ({ ...t, weakness: t.lastScore - (t.lapses * 10) }))
      .filter(t => t.weakness < 80)
      .sort((a, b) => a.weakness - b.weakness)
      .slice(0, limit || 3);
  }

  // ---- Quote rotation ----
  function getSeenQuotes() {
    const p = getActiveProfile();
    return p ? (p.seenQuotes || []) : [];
  }

  function pushSeenQuote(idx, keep) {
    const db = load();
    const p = db.profiles[db.activeProfileId];
    if (!p) return;
    if (!p.seenQuotes) p.seenQuotes = [];
    p.seenQuotes.push(idx);
    const max = keep || 12;
    if (p.seenQuotes.length > max) p.seenQuotes = p.seenQuotes.slice(-max);
    save(db);
  }

  // ---- XP ----
  //
  // XP is earned by studying and is NEVER SPENT. There is no cap and no
  // sink to design, because rank is a record of what you have done rather
  // than a balance you draw down. That is what retired the old capped
  // charge: a cap needs a sink, a sink needs prices, and prices made a
  // study currency behave like a wallet.
  //
  // Stored under the historical key `charge` / `chargeEarned` — renaming
  // them would invalidate every saved profile, so labels change in the
  // UI and keys stay put (same rule as `miniQuiz*`).
  //
  // Rewards are unlocked by RANK, computed in shop/ranks.js from the
  // lifetime total. This file knows nothing about ranks or rewards.
  function getXp() {
    const p = getActiveProfile();
    return p ? (p.chargeEarned || 0) : 0;
  }

  // Used only by the rank cheat codes. Not part of normal play — XP
  // moves in one direction, by studying, everywhere else.
  function setXp(total) {
    const db = load();
    const p = db.profiles[db.activeProfileId];
    if (!p) return 0;
    const v = Math.max(0, Math.floor(total) || 0);
    p.charge = v;
    p.chargeEarned = v;
    save(db);
    return v;
  }

  function addXp(amount) {
    const db = load();
    const p = db.profiles[db.activeProfileId];
    if (!p || amount <= 0) return 0;
    p.charge = (p.charge || 0) + amount;
    p.chargeEarned = (p.chargeEarned || 0) + amount;
    save(db);
    return amount;
  }

  function getChargeTotals() {
    const p = getActiveProfile();
    return {
      earned: (p && p.chargeEarned) || 0,
      spent: (p && p.chargeSpent) || 0
    };
  }

  // ---- Shop ----
  function getOwnedThemes() {
    const p = getActiveProfile();
    return new Set((p && p.ownedThemes) || []);
  }

  function ownsTheme(id) {
    return getOwnedThemes().has(id);
  }

  // Grants a theme outright. Themes are no longer bought — they arrive
  // with a rank — but the list is kept so anything unlocked under the
  // old paid system stays owned.
  function grantTheme(id) {
    if (ownsTheme(id)) return false;
    const db = load();
    const p = db.profiles[db.activeProfileId];
    if (!p) return false;
    if (!Array.isArray(p.ownedThemes)) p.ownedThemes = [];
    p.ownedThemes.push(id);
    save(db);
    return true;
  }

  // ---- Theme ----
  function getTheme() {
    const p = getActiveProfile();
    return (p && p.theme) || "indigo";
  }

  function setTheme(id) {
    const db = load();
    const p = db.profiles[db.activeProfileId];
    if (!p) return;
    p.theme = id;
    save(db);
  }

  function getLobbyStyle() {
    const p = getActiveProfile();
    return (p && p.lobbyStyle) || "classic";
  }

  function setLobbyStyle(id) {
    const db = load();
    const p = db.profiles[db.activeProfileId];
    if (!p) return;
    p.lobbyStyle = id;
    save(db);
  }

  // ---- Resume position ----
  // completedChunks was written from the very first version and never
  // read by anything. This is what it was always for.
  function setPosition(unitId, topicId, chunkIdx) {
    const db = load();
    const p = db.profiles[db.activeProfileId];
    if (!p) return;
    p.lastPosition = { unitId, topicId, chunkIdx };
    save(db);
  }

  function getPosition() {
    const p = getActiveProfile();
    return p ? (p.lastPosition || null) : null;
  }

  function clearPosition() {
    const db = load();
    const p = db.profiles[db.activeProfileId];
    if (!p) return;
    p.lastPosition = null;
    save(db);
  }

  // ---- Course contracts ----
  // A drawn signature, not a real personal-data form — see the v9
  // migration note above for why. One per course, per profile.
  function hasSignedContract(courseId) {
    const p = getActiveProfile();
    return !!(p && p.courseContracts && p.courseContracts[courseId]);
  }

  function signContract(courseId, signatureDataUrl) {
    const db = load();
    const p = db.profiles[db.activeProfileId];
    if (!p) return;
    if (!p.courseContracts) p.courseContracts = {};
    p.courseContracts[courseId] = { signature: signatureDataUrl, signedAt: new Date().toISOString() };
    save(db);
  }

  // Furthest chunk completed in a topic, so returning resumes there
  // rather than restarting from chunk 1.
  function resumeChunkFor(topicId, chunkCount) {
    const done = getCompletedChunks()[topicId];
    if (!done || !done.size) return 0;
    for (let i = 0; i < chunkCount; i++) {
      if (!done.has(i)) return i;
    }
    return 0; // every chunk done — topic gets replayed from the top
  }


  // ================================================
  // v5 — Economy, energy, tickets, life-sim, story
  // ------------------------------------------------
  // Everything below is *storage only*. Prices, odds, payouts and
  // vital decay rates live in the branch that owns them (shop/,
  // games/, story/), never here. db.js must stay boring.
  // ================================================

  function getWallet() {
    const p = getActiveProfile();
    return p ? (p.wallet || 0) : 0;
  }

  function addMoney(amount) {
    const db = load();
    const p = db.profiles[db.activeProfileId];
    if (!p) return 0;
    p.wallet = Math.max(0, (p.wallet || 0) + amount);
    save(db);
    return p.wallet;
  }

  // All-or-nothing, like spendCharge — a caller must never half-buy.
  function spendMoney(amount) {
    const db = load();
    const p = db.profiles[db.activeProfileId];
    if (!p) return false;
    if ((p.wallet || 0) < amount) return false;
    p.wallet -= amount;
    save(db);
    return true;
  }

  // ---- Lazy regeneration ----
  // Nothing runs on a timer; we work out how much time passed since the
  // stored stamp and credit that on read. Keeps tickets correct when the
  // tab has been shut for three days.
  function regen(p, key, stampKey, max, perMs) {
    const now = Date.now();
    const last = p[stampKey] ? new Date(p[stampKey]).getTime() : now;
    const gained = Math.floor((now - last) * perMs);
    if (gained > 0) {
      p[key] = Math.min(max, (p[key] || 0) + gained);
      p[stampKey] = new Date(last + Math.ceil(gained / perMs)).toISOString();
    } else if (!p[stampKey]) {
      p[stampKey] = new Date(now).toISOString();
    }
    if (p[key] >= max) p[stampKey] = new Date(now).toISOString();
    return p[key];
  }

  // ---- Arcade tickets ----
  // 2 per 6 hours, ceiling of 2. This is the burnout brake: the arcade
  // cannot become the main way to earn, and a bad night cannot cost
  // more than two entries.
  function getTickets() {
    const db = load();
    const p = db.profiles[db.activeProfileId];
    if (!p) return 0;
    const v = regen(p, "tickets", "ticketsUpdatedAt", TICKET_MAX, TICKET_PER_MS);
    save(db);
    return v;
  }

  function spendTicket() {
    if (getTickets() < 1) return false;
    const db = load();
    const p = db.profiles[db.activeProfileId];
    p.tickets -= 1;
    if (!p.ticketsUpdatedAt) p.ticketsUpdatedAt = new Date().toISOString();
    save(db);
    return true;
  }

  // Used by the agrala code. Sets the stamp too, or lazy regen would
  // immediately try to credit time that has already been paid out.
  function refillTickets() {
    const db = load();
    const p = db.profiles[db.activeProfileId];
    if (!p) return 0;
    p.tickets = TICKET_MAX;
    p.ticketsUpdatedAt = new Date().toISOString();
    save(db);
    return p.tickets;
  }

  function msUntilNextTicket() {
    const p = getActiveProfile();
    if (!p) return 0;
    if ((p.tickets || 0) >= TICKET_MAX) return 0;
    const last = p.ticketsUpdatedAt ? new Date(p.ticketsUpdatedAt).getTime() : Date.now();
    return Math.max(0, (last + 1 / TICKET_PER_MS) - Date.now());
  }

  // ---- Garden dividends ----
  function getLastDividendClaim() {
    const p = getActiveProfile();
    return p ? (p.lastDividendClaim || null) : null;
  }

  function setLastDividendClaim(iso) {
    const db = load();
    const p = db.profiles[db.activeProfileId];
    if (!p) return;
    p.lastDividendClaim = iso;
    save(db);
  }

  // ---- Life-shop inventory ----
  function getInventory() {
    const p = getActiveProfile();
    return [...((p && p.inventory) || [])];
  }

  function addInventory(itemId) {
    const db = load();
    const p = db.profiles[db.activeProfileId];
    if (!p) return false;
    if (!Array.isArray(p.inventory)) p.inventory = [];
    p.inventory.push(itemId);
    save(db);
    return true;
  }

  function consumeInventory(itemId) {
    const db = load();
    const p = db.profiles[db.activeProfileId];
    if (!p) return false;
    const i = (p.inventory || []).indexOf(itemId);
    if (i < 0) return false;
    p.inventory.splice(i, 1);
    save(db);
    return true;
  }

  // ---- Vitals ----
  function getVitals() {
    const p = getActiveProfile();
    return { ...(p && p.vitals) || { hunger: 100, thirst: 100, hygiene: 100, shelterTier: "street" } };
  }

  // patch = { hunger: +20, shelterTier: "hostel" }. Numbers are added
  // and clamped 0-100; strings are set.
  function patchVitals(patch) {
    const db = load();
    const p = db.profiles[db.activeProfileId];
    if (!p) return null;
    p.vitals = p.vitals || { hunger: 100, thirst: 100, hygiene: 100, shelterTier: "street" };
    for (const [k, v] of Object.entries(patch || {})) {
      if (typeof v === "number") p.vitals[k] = Math.max(0, Math.min(100, (p.vitals[k] || 0) + v));
      else p.vitals[k] = v;
    }
    save(db);
    return { ...p.vitals };
  }

  function getLastVitalTick() {
    const p = getActiveProfile();
    return p ? (p.lastVitalTick || null) : null;
  }

  function setLastVitalTick(dayStr) {
    const db = load();
    const p = db.profiles[db.activeProfileId];
    if (!p) return;
    p.lastVitalTick = dayStr;
    save(db);
  }

  // ---- Story ----
  function getStoryProgress() {
    const p = getActiveProfile();
    const sp = (p && p.storyProgress) || {};
    return {
      unlockedNodes: [...(sp.unlockedNodes || ["act1_node1"])],
      completedNodes: [...(sp.completedNodes || [])],
      attempts: { ...(sp.attempts || {}) },
      flags: [...(sp.flags || [])]
    };
  }

  // Records that a scene was played, win or lose. `tries` is what lets
  // the story know a node was failed rather than never opened.
  function recordNodeAttempt(nodeId, outcome) {
    const db = load();
    const p = db.profiles[db.activeProfileId];
    if (!p) return;
    p.storyProgress = p.storyProgress || { unlockedNodes: [], completedNodes: [], attempts: {}, flags: [] };
    p.storyProgress.attempts = p.storyProgress.attempts || {};
    const rec = p.storyProgress.attempts[nodeId] || { tries: 0, lastOutcome: null };
    rec.tries += 1;
    rec.lastOutcome = outcome || null;
    p.storyProgress.attempts[nodeId] = rec;
    save(db);
  }

  function addStoryFlag(flag) {
    const db = load();
    const p = db.profiles[db.activeProfileId];
    if (!p) return;
    p.storyProgress = p.storyProgress || { unlockedNodes: [], completedNodes: [], attempts: {}, flags: [] };
    p.storyProgress.flags = p.storyProgress.flags || [];
    if (!p.storyProgress.flags.includes(flag)) p.storyProgress.flags.push(flag);
    save(db);
  }

  function unlockNode(nodeId) {
    const db = load();
    const p = db.profiles[db.activeProfileId];
    if (!p) return;
    p.storyProgress = p.storyProgress || { unlockedNodes: [], completedNodes: [] };
    if (!p.storyProgress.unlockedNodes.includes(nodeId)) p.storyProgress.unlockedNodes.push(nodeId);
    save(db);
  }

  function completeNode(nodeId) {
    const db = load();
    const p = db.profiles[db.activeProfileId];
    if (!p) return;
    p.storyProgress = p.storyProgress || { unlockedNodes: [], completedNodes: [] };
    if (!p.storyProgress.completedNodes.includes(nodeId)) p.storyProgress.completedNodes.push(nodeId);
    save(db);
  }

  // ---- Admin ----
  // Marks every topic complete. Used by the settings cheat code so a
  // reviewer can see the later screens without a 26-topic grind.
  // Deliberately does NOT touch reviews, stats or the wallet — a
  // cheated profile should still look obviously cheated in Stats.
  function unlockAllTopics(topicIds) {
    const db = load();
    const p = db.profiles[db.activeProfileId];
    if (!p) return 0;
    const set = new Set(p.completedTopics || []);
    topicIds.forEach(id => set.add(id));
    p.completedTopics = [...set];
    save(db);
    return p.completedTopics.length;
  }

  // ---- Export / Import ----
  function exportData() {
    const db = load();
    const blob = new Blob([JSON.stringify(db, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `unit6-dojo-${db.profiles[db.activeProfileId]?.name || 'backup'}-${new Date().toISOString().slice(0,10)}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  function importData(file) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const db = JSON.parse(e.target.result);
          if (!db.profiles || typeof db.profiles !== 'object') {
            reject(new Error('Invalid database file'));
            return;
          }
          save(db);
          resolve(db);
        } catch (err) {
          reject(err);
        }
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }

  // ---- Public API ----
  return {
    init,
    getActiveProfile,
    createProfile,
    setActiveProfile,
    updateProfileName,
    deleteProfile,
    listProfiles,
    getCompletedTopics,
    getCompletedChunks,
    markChunkComplete,
    markTopicComplete,
    getStreak,
    touchStreak,
    recordQuizAnswer,
    getChunkResult,
    recordExamResult,
    getStats,
    scheduleReview,
    getReviews,
    getDueTopicIds,
    daysUntilDue,
    getWeakSpots,
    getSeenQuotes,
    pushSeenQuote,
    getXp,
    addXp,
    setXp,
    getChargeTotals,
    getOwnedThemes,
    ownsTheme,
    grantTheme,
    getWallet,
    addMoney,
    spendMoney,
    getTickets,
    spendTicket,
    refillTickets,
    msUntilNextTicket,
    getLastDividendClaim,
    setLastDividendClaim,
    getInventory,
    addInventory,
    consumeInventory,
    getVitals,
    patchVitals,
    getLastVitalTick,
    setLastVitalTick,
    getStoryProgress,
    unlockNode,
    completeNode,
    recordNodeAttempt,
    addStoryFlag,
    unlockAllTopics,
    constants: () => ({ TICKET_MAX }),
    getTheme,
    setTheme,
    getLobbyStyle,
    setLobbyStyle,
    setPosition,
    getPosition,
    clearPosition,
    hasSignedContract,
    signContract,
    resumeChunkFor,
    exportData,
    importData
  };
})();
