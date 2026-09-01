// ================================================
// Knell — CORE / cloud sync
// ------------------------------------------------
// BACKEND-ROADMAP.md Step 6. Keeps the local profile and the account's
// `progress` row in agreement, at checkpoints, without either side
// clobbering the other.
//
// ---- The rule that shapes everything here ----
// MERGE PER FIELD, never whole-row last-write-wins. Two devices
// studying different topics must UNION. A blind overwrite is how
// someone loses a week of reviews by opening the app on their phone,
// and the review schedule is the single most valuable thing this app
// holds — it is the only field that cannot be reconstructed by
// studying again.
//
// ---- Sync never blocks studying ----
// Every failure here is swallowed into a console note plus a quiet
// banner. Offline, expired token, server down: the app keeps working
// against localStorage exactly as it did before accounts existed. That
// is the same honesty pattern as the existing db:saveFailed warning —
// say so, do not stop.
//
// ---- Economy is not synced ----
// Same reason core/migrate-cloud.js does not migrate it: local economy
// values are editable, so pushing them would launder a devtools edit
// into a server-blessed balance. `economy` has no client write policy
// anyway; the cloud is the only authority, and this file only ever
// READS it (see pullEconomy).
// ================================================

(() => {
  const Bus = Dojo.Bus;

  // Debounce window. Checkpoints can arrive in bursts — finishing a
  // chunk emits chunk:completed and progress:changed together — and one
  // push per burst is the point of batching.
  const DEBOUNCE_MS = 4000;

  let timer = null;
  let inFlight = false;
  let lastError = null;

  // ---- Merge helpers --------------------------------------------------

  const uniq = a => Array.from(new Set(a || []));

  // Arrays that are really sets: completed topics, seen quotes.
  function mergeSet(a, b) {
    return uniq([...(a || []), ...(b || [])]);
  }

  // { topicId: [chunkIndex, ...] } — union the indices per topic.
  function mergeChunkMap(a, b) {
    const out = Object.assign({}, a || {});
    for (const [k, v] of Object.entries(b || {})) {
      out[k] = uniq([...(out[k] || []), ...(v || [])]).sort((x, y) => x - y);
    }
    return out;
  }

  // The SM-2 schedule. Per topic, keep whichever side is FURTHER ahead —
  // a later `due` means that side reviewed it more recently, because
  // every successful review pushes `due` forward. Getting this backwards
  // would resurrect an old schedule and make someone re-review work they
  // had already retained.
  function mergeReviews(a, b) {
    const out = Object.assign({}, a || {});
    for (const [topic, rb] of Object.entries(b || {})) {
      const ra = out[topic];
      if (!ra) { out[topic] = rb; continue; }
      const da = new Date(ra.due || 0).getTime();
      const db = new Date(rb.due || 0).getTime();
      out[topic] = db > da ? rb : ra;
    }
    return out;
  }

  // Cumulative counters. MAX, not sum, and the choice matters:
  //
  // Sum is what "additive counter" suggests, but sync is not guaranteed
  // to run once per event. A retried or duplicated push would inflate
  // every total permanently, and an inflated stat cannot be told apart
  // from an honest one after the fact. Max is idempotent — syncing the
  // same state twice changes nothing.
  //
  // The cost is real and accepted: two devices genuinely studying in
  // parallel offline will under-count (5 exams + 5 exams reads as 5).
  // Undercounting a display statistic is a far smaller harm than
  // silently inflating it forever, and nothing in the app spends these.
  function mergeStats(a, b) {
    a = a || {}; b = b || {};
    const out = {};
    const numeric = ["miniQuizTotal", "miniQuizCorrect", "examQuestionsTotal",
                     "examQuestionsCorrect", "examsTaken", "examsPassed"];
    numeric.forEach(k => { out[k] = Math.max(a[k] || 0, b[k] || 0); });

    out.topicStats = Object.assign({}, a.topicStats || {});
    for (const [topic, tb] of Object.entries(b.topicStats || {})) {
      const ta = out.topicStats[topic];
      if (!ta) { out.topicStats[topic] = tb; continue; }
      out.topicStats[topic] = {
        attempts:    Math.max(ta.attempts || 0, tb.attempts || 0),
        bestScore:   Math.max(ta.bestScore || 0, tb.bestScore || 0),
        // lastScore belongs to whichever attempt was actually last.
        lastScore:   (new Date(tb.completedAt || 0) > new Date(ta.completedAt || 0))
                       ? tb.lastScore : ta.lastScore,
        completedAt: (new Date(tb.completedAt || 0) > new Date(ta.completedAt || 0))
                       ? tb.completedAt : ta.completedAt,
        chunkResults: (tb.chunkResults && tb.chunkResults.length)
                       ? tb.chunkResults : ta.chunkResults
      };
    }
    return out;
  }

  // Longest streak wins, and the most recent activity date wins, which
  // can legitimately come from different sides.
  function mergeStreak(a, b) {
    a = a || {}; b = b || {};
    const later = (x, y) => (new Date(y || 0) > new Date(x || 0)) ? y : x;
    return {
      count:           Math.max(a.count || 0, b.count || 0),
      lastActiveDate:  later(a.lastActiveDate, b.lastActiveDate),
      freezes:         Math.min(a.freezes ?? 2, b.freezes ?? 2), // spent on either side counts as spent
      freezeWeekStart: later(a.freezeWeekStart, b.freezeWeekStart)
    };
  }

  function mergeFinalQuiz(a, b) {
    a = a || {}; b = b || {};
    const newer = new Date(b.completedAt || 0) > new Date(a.completedAt || 0);
    return {
      attempts:        Math.max(a.attempts || 0, b.attempts || 0),
      bestScore:       Math.max(a.bestScore || 0, b.bestScore || 0),
      lastScore:       newer ? b.lastScore : a.lastScore,
      completedAt:     newer ? b.completedAt : a.completedAt,
      xpAttemptsToday: Math.max(a.xpAttemptsToday || 0, b.xpAttemptsToday || 0),
      xpAttemptsDate:  newer ? b.xpAttemptsDate : a.xpAttemptsDate
    };
  }

  // `local` is the profile shape (camelCase); `cloud` is the row
  // (snake_case). Returns the profile-shaped merge.
  function mergeProgress(local, cloud) {
    if (!cloud) return local;
    return {
      completedTopics: mergeSet(local.completedTopics, cloud.completed_topics),
      completedChunks: mergeChunkMap(local.completedChunks, cloud.completed_chunks),
      reviews:         mergeReviews(local.reviews, cloud.reviews),
      seenQuotes:      mergeSet(local.seenQuotes, cloud.seen_quotes),
      stats:           mergeStats(local.stats, cloud.stats),
      streak:          mergeStreak(local.streak, cloud.streak),
      finalQuiz:       mergeFinalQuiz(local.finalQuiz, cloud.final_quiz),
      // Union: a signed contract on either device stays signed.
      courseContracts: Object.assign({}, cloud.course_contracts || {}, local.courseContracts || {}),
      // A cursor, not data. Local wins — it is where THIS device is.
      lastPosition:    local.lastPosition
    };
  }

  // ---- Applying a merge back to the local profile ---------------------
  // Written through the raw DB blob rather than field-by-field setters:
  // there is no DB API for "replace the whole progress section", and
  // adding one just for sync would put a second write path next to every
  // existing setter.
  function applyLocally(merged) {
    const raw = localStorage.getItem("unit6-dojo-db");
    if (!raw) return false;
    const db = JSON.parse(raw);
    const p = db.profiles[db.activeProfileId];
    if (!p) return false;
    Object.assign(p, merged);
    localStorage.setItem("unit6-dojo-db", JSON.stringify(db));
    return true;
  }

  function toRow(p) {
    return {
      completed_topics: p.completedTopics,
      completed_chunks: p.completedChunks,
      reviews:          p.reviews,
      seen_quotes:      p.seenQuotes,
      stats:            p.stats,
      streak:           p.streak,
      final_quiz:       p.finalQuiz,
      course_contracts: p.courseContracts,
      last_position:    p.lastPosition
    };
  }

  // ---- Economy: pull ONLY, and overwrite ------------------------------
  // The opposite direction from everything else here. progress is MERGED
  // because both sides can legitimately advance it; economy is
  // OVERWRITTEN from the server because only the server can legitimately
  // change it at all (no client write policy; mutations only via RPC).
  // Merging would be pretending the local number has standing.
  //
  // Closes a real gap found 2026-08-27: the server held 5000 tokens and
  // the app displayed 0, because nothing ever brought the economy row
  // down. Purchases checked the server and behaved correctly the whole
  // time -- it was the DISPLAY that was fiction, which is arguably worse
  // than a wrong balance, because it looks like the money vanished.
  async function pullEconomy() {
    const econ = await Dojo.Cloud.economy.pull();
    if (!econ) return null;

    const raw = localStorage.getItem("unit6-dojo-db");
    if (!raw) return null;
    const db = JSON.parse(raw);
    const p = db.profiles[db.activeProfileId];
    if (!p) return null;

    p.tokens       = econ.tokens ?? 0;
    p.wallet       = econ.wallet ?? 0;
    p.charge       = econ.charge ?? 0;
    p.chargeEarned = econ.charge_earned ?? 0;
    p.chargeSpent  = econ.charge_spent ?? 0;
    p.inventory    = econ.inventory || [];
    p.ownedThemes  = econ.owned_themes || [];
    p.patronTier   = econ.patron_tier ?? 0;
    // isAdmin is deliberately NOT mirrored. admin/admin.js asks the
    // server every time; copying it into localStorage would recreate the
    // forgeable flag the 2026-08-27 admin fix removed.
    localStorage.setItem("unit6-dojo-db", JSON.stringify(db));
    return econ;
  }

  // ---- The sync itself -------------------------------------------------
  // pull -> merge -> push -> write merged back locally. Both sides end
  // up holding the same union.
  async function syncNow() {
    if (inFlight) return { status: "busy" };
    if (!Dojo.Cloud || !Dojo.Cloud.isConfigured()) return { status: "skipped" };

    inFlight = true;
    try {
      const session = await Dojo.Cloud.getSession();
      if (!session) return { status: "skipped", reason: "no session" };

      const local = DB.getActiveProfile();
      if (!local) return { status: "skipped", reason: "no local profile" };

      const cloud = await Dojo.Cloud.progress.pull();
      const merged = mergeProgress(local, cloud);

      await Dojo.Cloud.progress.push(toRow(merged));
      applyLocally(merged);

      // Economy comes DOWN on every sync. Best-effort on purpose: a
      // progress sync that succeeded must not be reported as failed
      // because the economy read did not.
      try {
        await pullEconomy();
        if (Dojo.renderVitals) Dojo.renderVitals();
      } catch (e) {
        console.info("[sync] economy pull skipped:", e.message);
      }

      lastError = null;
      showNotice(false);
      if (Bus) Bus.emit("progress:changed", { reason: "sync" });
      return { status: "synced", topics: merged.completedTopics.length };
    } catch (e) {
      lastError = e.message;
      console.info("[sync] working locally:", e.message);
      showNotice(true);
      return { status: "failed", error: e.message };
    } finally {
      inFlight = false;
    }
  }

  function schedule() {
    clearTimeout(timer);
    timer = setTimeout(syncNow, DEBOUNCE_MS);
  }

  // ---- The offline notice ----------------------------------------------
  // Deliberately quiet and non-blocking: a person mid-exam does not need
  // a modal about network state, they need to finish the exam. It says
  // what is true and gets out of the way.
  function showNotice(on) {
    let el = document.getElementById("sync-notice");
    if (!on) { if (el) el.remove(); return; }
    if (el) return;
    el = document.createElement("div");
    el.id = "sync-notice";
    el.className = "sync-notice";
    el.textContent = I18N.t("sync.offline");
    document.body.appendChild(el);
  }

  // ---- Checkpoints -------------------------------------------------------
  // Real study milestones, not every state change. Each is a moment
  // where losing the last few seconds of work would actually matter.
  if (Bus) {
    ["chunk:completed", "exam:finished", "review:finished", "course:bought"]
      .forEach(evt => Bus.on(evt, schedule));
  }

  // Leaving the tab is the last chance to flush. `visibilitychange` on
  // hidden rather than `beforeunload`: the latter is unreliable on
  // mobile, where a tab is far more often backgrounded than closed.
  document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "hidden") {
      clearTimeout(timer);
      syncNow();
    }
  });

  Dojo.Sync = {
    syncNow, schedule, mergeProgress, pullEconomy,
    lastError: () => lastError,
    // Exposed for tests and for anything that needs to reason about a
    // merge without performing one.
    _merge: { mergeSet, mergeChunkMap, mergeReviews, mergeStats, mergeStreak, mergeFinalQuiz }
  };
})();
