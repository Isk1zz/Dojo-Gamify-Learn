// ================================================
// Knell — LIBRARY / statistics
// ------------------------------------------------
// Reads DB stats and renders the Stats modal. Read-only over every
// other branch's data — it must never write progress.
// ================================================

(() => {
  // ---- seam: everything this branch borrows from elsewhere ----
  // Late-bound on purpose. A branch may be loaded before the branch
  // it calls into, so these resolve at call time, not at load time.
  const state = Dojo.state;
  const applyTheme = (...a) => Dojo.applyTheme(...a);
  const renderCharge = (...a) => Dojo.renderCharge(...a);
  const updateProfileBadge = (...a) => Dojo.updateProfileBadge(...a);
  const showLobby = (...a) => Dojo.showLobby(...a);
  const renderUnitSelect = (...a) => Dojo.renderUnitSelect(...a);
  const renderTopicMap = (...a) => Dojo.renderTopicMap(...a);
  const selectUnit = (...a) => Dojo.selectUnit(...a);
  const startTopic = (...a) => Dojo.startTopic(...a);

  // ---- Stats Modal ----
  function showStatsModal() {
    const modal = document.getElementById("stats-modal");
    modal.style.display = "flex";
    // Named explicitly: Career renders the same stats into its own box and
    // that box stays the default host, so after a visit there the profile
    // opened empty (found 2026-11-24).
    renderStats(document.getElementById("stats-body"));
  }

  function hideStatsModal() {
    document.getElementById("stats-modal").style.display = "none";
  }

  document.getElementById("btn-stats-close").addEventListener("click", hideStatsModal);
  document.getElementById("stats-modal").addEventListener("click", (e) => {
    if (e.target === e.currentTarget) hideStatsModal();
  });

  // ---- Badges ----
  // Real accomplishments only — PROJECT.md §5's reversal note is explicit
  // that badges here should earn the restraint the rest of the app has,
  // not hand out participation trophies. Every check reads data that
  // already exists (DB.getStats/getStreak/getXp via Dojo.Ranks) — no new
  // fields, no new writes, this file stays read-only.
  // The three course badges measure one course at a time, the best one:
  // "Course Complete" means a course finished, the same thing the course's
  // Token reward pays for. They used to count every topic of every course
  // together, so finishing a course earned nothing (changed 2026-11-24).
  // A course whose topics are not loaded yet (Intro to CS loads on demand)
  // is skipped rather than counted as zero.
  function bestCoursePct() {
    const done = DB.getCompletedTopics();
    let best = 0;
    (typeof COURSES !== "undefined" ? COURSES : []).forEach(c => {
      const topics = (c.units || []).flatMap(id => (UNIT_TOPICS[id] || []));
      if (!topics.length) return;
      const n = topics.filter(t => done.has(t.id)).length;
      best = Math.max(best, Math.round((n / topics.length) * 100));
    });
    return best;
  }

  const BADGES = I18N.resolve([
    { id: "first-topic", icon: "\u{1F331}", name: { en: "First Steps", ru: "Первые шаги", he: "צעדים ראשונים" }, desc: { en: "Master your first topic", ru: "Освоить первую тему", he: "לשלוט בנושא הראשון" },
      earned: (s) => s.topicsCompleted >= 1 },
    { id: "quarter", icon: "\u{1F4D8}", name: { en: "Quarter Course", ru: "Четверть курса", he: "רבע קורס" }, desc: { en: "Reach 25% in any one course", ru: "Пройти 25% любого курса", he: "להשלים 25% מקורס כלשהו" },
      earned: () => bestCoursePct() >= 25 },
    { id: "halfway", icon: "\u{1F4D6}", name: { en: "Halfway There", ru: "Половина пути", he: "באמצע הדרך" }, desc: { en: "Reach 50% in any one course", ru: "Пройти половину любого курса", he: "להשלים חצי מקורס כלשהו" },
      earned: () => bestCoursePct() >= 50 },
    { id: "complete", icon: "\u{1F393}", name: { en: "Course Complete", ru: "Курс пройден", he: "קורס הושלם" }, desc: { en: "Finish a whole course", ru: "Пройти курс полностью", he: "להשלים קורס במלואו" },
      earned: () => bestCoursePct() >= 100 },
    { id: "perfect-exam", icon: "\u{1F4AF}", name: { en: "Perfect Exam", ru: "Идеальный экзамен", he: "מבחן מושלם" }, desc: { en: "Score 100% on a mastery exam", ru: "Сдать экзамен на 100%", he: "לקבל 100% במבחן שליטה" },
      earned: (s) => Object.values(s.topicStats || {}).some(t => t.bestScore >= 100) },
    { id: "clean-record", icon: "\u{1F3C6}", name: { en: "Clean Record", ru: "Без осечек", he: "גיליון נקי" }, desc: { en: "Pass 5+ exams with zero fails", ru: "Сдать 5+ экзаменов без провалов", he: "לעבור 5 מבחנים ומעלה בלי אף כישלון" },
      earned: (s) => s.examsTaken >= 5 && s.examsPassed === s.examsTaken },
    { id: "sharp-shooter", icon: "\u{1F3AF}", name: { en: "Sharp Shooter", ru: "Меткий стрелок", he: "צלף" }, desc: { en: "90%+ accuracy over 50+ questions", ru: "Точность 90%+ на 50+ вопросах", he: "דיוק של 90% ומעלה ב־50 שאלות ומעלה" },
      earned: (s) => s.miniQuizTotal >= 50 && s.miniQuizAccuracy >= 90 },
    { id: "week-streak", icon: "\u{1F525}", name: { en: "Week Streak", ru: "Неделя подряд", he: "רצף של שבוע" }, desc: { en: "Hold a 7-day streak", ru: "Продержать серию 7 дней", he: "להחזיק רצף של 7 ימים" },
      earned: (_s, streak) => !!streak && streak.count >= 7 },
    { id: "month-streak", icon: "\u{1F525}\u{1F525}", name: { en: "Month Streak", ru: "Месяц подряд", he: "רצף של חודש" }, desc: { en: "Hold a 30-day streak", ru: "Продержать серию 30 дней", he: "להחזיק רצף של 30 יום" },
      earned: (_s, streak) => !!streak && streak.count >= 30 },
    { id: "lab-manager", icon: "\u{1F97C}", name: { en: "Lab Manager+", ru: "Заведующий и выше", he: "מנהל מעבדה ומעלה" }, desc: { en: "Reach rank 8 (Lab Manager) or higher", ru: "Дойти до 8-го ранга или выше", he: "להגיע לדרגה 8 (מנהל מעבדה) ומעלה" },
      earned: (_s, _streak, xp) => Dojo.Ranks ? Dojo.Ranks.rankFor(xp).n >= 8 : false }
  ]);

  function badgeGridHtml(stats) {
    const streak = DB.getStreak ? DB.getStreak() : null;
    const xp = DB.getXp();
    const pinned = new Set(DB.getPinnedBadges ? DB.getPinnedBadges() : []);
    const chips = BADGES.map(b => {
      const earned = b.earned(stats, streak, xp);
      const isPinned = earned && pinned.has(b.id);
      return `
        <button type="button" class="badge-chip${earned ? " earned" : ""}${isPinned ? " pinned" : ""}"
                ${earned ? `data-badge="${b.id}"` : "disabled"}
                title="${b.desc}${earned ? " — " + I18N.t(isPinned ? "stats.tapUnpin" : "stats.tapPin") : ""}">
          <span class="badge-icon">${earned ? b.icon : "\u{1F512}"}</span>
          <span class="badge-name">${b.name}</span>
          ${isPinned ? `<span class="badge-pin-dot" aria-hidden="true"></span>` : ""}
        </button>`;
    }).join("");
    const earnedCount = BADGES.filter(b => b.earned(stats, streak, xp)).length;
    return `
      <div class="settings-section">
        <div class="stats-section-title">\u{1F3C5} ${I18N.t("stats.badges", { n: earnedCount, total: BADGES.length })}</div>
        <p class="settings-hint">${I18N.t("stats.badgeNote")}</p>
        <div class="badge-grid">${chips}</div>
      </div>`;
  }

  // `target` lets Career host this same block (Statistics was merged
  // into Career — see shop/shop.js). Defaults to the profile modal's
  // body so every existing no-arg caller keeps working unchanged.
  // "All" plus one entry per course. Replaces an earlier <details>
  // stack: a menu answers "show me THIS course" directly, and it also
  // sidesteps <details>, whose collapse could not be verified in the
  // dev preview (that pane doesn't implement the element at all).
  let statsCourse = "all";
  let statsHost = null;

  function renderStats(target) {
    if (target) statsHost = target;
    const stats = DB.getStats();
    if (!stats) return;

    const body = statsHost || document.getElementById("stats-body");
    if (!body) return;

    // Grouped by self-rated confidence classification (the same
    // struggling/still-learning/have-an-idea/know-this-well scale the
    // flashcard deck builder's "Filter by confidence" already uses —
    // see library.js's CONFIDENCE), not by unit. Old view was a flat
    // "U1, U2, U3..." list; that answers "what did I cover" but not
    // "what actually needs work," which is the question this screen
    // exists for (see the weak-spots section above it). A topic takes
    // its WORST rated chunk, not an average — one shaky chunk in an
    // otherwise-solid topic is still worth surfacing, same philosophy
    // as DB.getWeakSpots. Topics with no flashcard review yet have no
    // rating at all and land in their own bucket rather than being
    // silently dropped or miscounted as "struggling."
    function topicRowHtml(t) {
      const ts = stats.topicStats[t.id];
      let scoreHtml;
      if (ts && ts.bestScore > 0) {
        const cls = ts.bestScore >= 80 ? "pass" : "fail";
        scoreHtml = `<span class="stats-topic-score ${cls}">${ts.bestScore}% (${I18N.tn("stats.attempts", ts.attempts)})</span>`;
      } else {
        scoreHtml = `<span class="stats-topic-score none">—</span>`;
      }
      return `
        <div class="stats-topic-row">
          <span class="stats-topic-name">${t.icon} ${t.title}</span>
          ${scoreHtml}
        </div>`;
    }

    const CONFIDENCE = Dojo.CONFIDENCE || [];

    // Bucket a given set of topics by their worst-rated chunk.
    function bucketise(topics) {
      const buckets = CONFIDENCE.map(c => ({ ...c, topics: [] }));
      const unrated = [];
      topics.forEach(t => {
        let worst = null;
        t.chunks.forEach((c, idx) => {
          const lvl = DB.getChunkConfidence(t.id, idx);
          if (lvl !== undefined && (worst === null || lvl < worst)) worst = lvl;
        });
        if (worst === null) { unrated.push(t); return; }
        const b = buckets.find(x => x.level === worst);
        if (b) b.topics.push(t);
      });
      let html = "";
      buckets.forEach(b => {
        if (!b.topics.length) return;
        html += `<div class="stats-bucket-title">${b.icon} ${b.label} (${b.topics.length})</div>
          <div class="stats-topic-list">${b.topics.map(topicRowHtml).join("")}</div>`;
      });
      if (unrated.length) {
        html += `<div class="stats-bucket-title">◌ ${I18N.t("stats.notReviewed")} (${unrated.length})</div>
          <div class="stats-topic-list">${unrated.map(topicRowHtml).join("")}</div>`;
      }
      return html;
    }

    // One collapsed row per COURSE, opened on demand — reported as "an
    // ingredient pile": every topic in the app was dumped into one flat
    // list, so a 48-row wall was the first thing you met. The
    // confidence grouping still exists, but now it lives INSIDE a
    // course you chose to open. Built per course rather than
    // hard-coding the only one that exists today, so a second course
    // needs no change here. <details> rather than a JS accordion: the
    // open/closed state, the keyboard behaviour and the disclosure
    // triangle all come free and correct from the browser.
    const completedSet = DB.getCompletedTopics();
    const courses = (typeof COURSES !== "undefined" ? COURSES : []);
    const topicsOf = c => c.units.flatMap(id => (UNIT_TOPICS[id] || []));
    // A stale selection (course removed) must not render an empty
    // screen — fall back to All rather than showing nothing.
    if (statsCourse !== "all" && !courses.some(c => c.id === statsCourse)) statsCourse = "all";

    const shown = statsCourse === "all"
      ? courses.flatMap(topicsOf)
      : topicsOf(courses.find(c => c.id === statsCourse) || { units: [] });
    const doneShown = shown.filter(t => completedSet.has(t.id)).length;
    const pctShown = shown.length ? Math.round((doneShown / shown.length) * 100) : 0;

    const menuItem = (id, label, topics) => {
      const done = topics.filter(t => completedSet.has(t.id)).length;
      return `<button type="button" class="stats-course-btn${id === statsCourse ? " active" : ""}" data-stats-course="${id}">
        <span>${label}</span><span class="stats-course-meta">${done}/${topics.length}</span>
      </button>`;
    };

    const topicRowsHtml = `
      <div class="stats-course-menu">
        ${menuItem("all", "📚 " + I18N.t("stats.allCourses"), courses.flatMap(topicsOf))}
        ${courses.map(c => menuItem(c.id, `${c.icon} ${c.title}`, topicsOf(c))).join("")}
      </div>
      <div class="stats-course-summary">${I18N.t("stats.summary", { done: doneShown, total: shown.length, pct: pctShown })}</div>
      ${bucketise(shown)}`;

    // "What should I study now?" is the only question a learner
    // actually has, and none of the numbers above answer it. All of
    // this was already being recorded and simply never surfaced.
    const byId = {};
    ALL_TOPICS.forEach(t => { byId[t.id] = t; });
    const weak = DB.getWeakSpots(3);
    let weakHtml = "";
    if (weak.length) {
      const rows = weak.map(w => {
        const t = byId[w.topicId];
        if (!t) return "";
        return `<button class="weak-row" data-topic="${w.topicId}">
            <span class="weak-name">${t.icon} ${t.title}</span>
            <span class="weak-score ${w.lastScore >= 80 ? "pass" : "fail"}">${w.lastScore}%</span>
          </button>`;
      }).join("");
      weakHtml = `
        <div class="weak-section">
          <div class="stats-section-title">🎯 ${I18N.t("stats.weakSpots")}</div>
          <div class="weak-hint">${I18N.t("stats.weakHint")}</div>
          ${rows}
        </div>`;
    }

    // How much is waiting, so the review queue isn't invisible.
    const dueCount = DB.getDueTopicIds().length;
    const dueHtml = dueCount
      ? `<div class="due-banner">🔁 ${I18N.tn("stats.dueN", dueCount)}</div>`
      : "";

    body.innerHTML = `
      ${dueHtml}
      ${badgeGridHtml(stats)}
      ${weakHtml}
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-value accent">${stats.completionPct}%</div>
          <div class="stat-label">${I18N.t("stats.overall")}</div>
        </div>
        <div class="stat-card">
          <div class="stat-value green">${stats.topicsCompleted}/${stats.totalTopics}</div>
          <div class="stat-label">${I18N.t("stats.mastered")}</div>
        </div>
        <div class="stat-card">
          <div class="stat-value cyan">${stats.miniQuizAccuracy}%</div>
          <div class="stat-label">${I18N.t("stats.qAccuracy")}</div>
        </div>
        <div class="stat-card">
          <div class="stat-value yellow">${stats.examAccuracy}%</div>
          <div class="stat-label">${I18N.t("stats.eAccuracy")}</div>
        </div>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-value accent">${stats.miniQuizCorrect}/${stats.miniQuizTotal}</div>
          <div class="stat-label">${I18N.t("stats.qScore")}</div>
        </div>
        <div class="stat-card">
          <div class="stat-value green">${stats.examsPassed}/${stats.examsTaken}</div>
          <div class="stat-label">${I18N.t("stats.examsPassed")}</div>
        </div>
      </div>

      ${topicRowsHtml}
    `;

    body.querySelectorAll("[data-stats-course]").forEach(btn => {
      btn.addEventListener("click", () => {
        statsCourse = btn.getAttribute("data-stats-course");
        renderStats();
      });
    });

    body.querySelectorAll(".weak-row").forEach(row => {
      row.addEventListener("click", () => {
        const id = row.getAttribute("data-topic");
        const unit = UNITS.find(u => u.modules.some(m => m.topics.some(t => t.id === id)));
        if (!unit) return;
        hideStatsModal();
        selectUnit(unit.id);
        const idx = state.currentTopics.findIndex(t => t.id === id);
        if (idx >= 0) startTopic(idx);
      });
    });

    body.querySelectorAll(".badge-chip[data-badge]").forEach(chip => {
      chip.addEventListener("click", () => {
        const id = chip.getAttribute("data-badge");
        const wasPinned = chip.classList.contains("pinned");
        const ok = DB.togglePinnedBadge(id);
        if (!ok && !wasPinned) {
          // Cap hit trying to ADD a 4th — a toggle that removes always
          // succeeds, so this branch only fires on the 3-pinned case.
          chip.classList.add("shake");
          setTimeout(() => chip.classList.remove("shake"), 350);
          return;
        }
        renderStats();
        if (Dojo.updateProfileBadge) Dojo.updateProfileBadge();
      });
    });
  }

  // Export / Import
  document.getElementById("btn-export").addEventListener("click", () => {
    DB.exportData();
  });

  document.getElementById("btn-import").addEventListener("change", async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      await DB.importData(file);
      updateProfileBadge();
      renderStats();
      renderUnitSelect();
      if (state.currentUnit) renderTopicMap();
      alert(I18N.t("stats.importOk"));
    } catch (err) {
      alert(I18N.t("stats.importFail", { msg: err.message }));
    }
    e.target.value = "";
  });

  // ---- seam: what this branch offers to everyone else ----
  Object.assign(Dojo, { showStatsModal, hideStatsModal, renderStats, BADGES });
})();
