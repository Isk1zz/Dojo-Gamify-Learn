// ================================================
// CS Dojo — LIBRARY / statistics
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
    renderStats();
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
  const BADGES = [
    { id: "first-topic", icon: "\u{1F331}", name: "First Steps", desc: "Master your first topic",
      earned: (s) => s.topicsCompleted >= 1 },
    { id: "quarter", icon: "\u{1F4D8}", name: "Quarter Course", desc: "Reach 25% course completion",
      earned: (s) => s.completionPct >= 25 },
    { id: "halfway", icon: "\u{1F4D6}", name: "Halfway There", desc: "Reach 50% course completion",
      earned: (s) => s.completionPct >= 50 },
    { id: "complete", icon: "\u{1F393}", name: "Course Complete", desc: "Reach 100% course completion",
      earned: (s) => s.completionPct >= 100 },
    { id: "perfect-exam", icon: "\u{1F4AF}", name: "Perfect Exam", desc: "Score 100% on a mastery exam",
      earned: (s) => Object.values(s.topicStats || {}).some(t => t.bestScore >= 100) },
    { id: "clean-record", icon: "\u{1F3C6}", name: "Clean Record", desc: "Pass 5+ exams with zero fails",
      earned: (s) => s.examsTaken >= 5 && s.examsPassed === s.examsTaken },
    { id: "sharp-shooter", icon: "\u{1F3AF}", name: "Sharp Shooter", desc: "90%+ accuracy over 50+ questions",
      earned: (s) => s.miniQuizTotal >= 50 && s.miniQuizAccuracy >= 90 },
    { id: "week-streak", icon: "\u{1F525}", name: "Week Streak", desc: "Hold a 7-day streak",
      earned: (_s, streak) => !!streak && streak.count >= 7 },
    { id: "month-streak", icon: "\u{1F525}\u{1F525}", name: "Month Streak", desc: "Hold a 30-day streak",
      earned: (_s, streak) => !!streak && streak.count >= 30 },
    { id: "lab-manager", icon: "\u{1F97C}", name: "Lab Manager+", desc: "Reach rank 8 (Lab Manager) or higher",
      earned: (_s, _streak, xp) => Dojo.Ranks ? Dojo.Ranks.rankFor(xp).n >= 8 : false }
  ];

  // Earned badges, computed fresh each call — the one place both the
  // modal grid and core/profile.js's pin picker read from, so the two
  // can never disagree about what's actually been earned.
  function earnedBadges() {
    const stats = DB.getStats();
    if (!stats) return [];
    const streak = DB.getStreak ? DB.getStreak() : null;
    const xp = DB.getXp();
    return BADGES.filter(b => b.earned(stats, streak, xp));
  }

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
                title="${b.desc}${earned ? " — tap to " + (isPinned ? "unpin" : "pin to your name") : ""}">
          <span class="badge-icon">${earned ? b.icon : "\u{1F512}"}</span>
          <span class="badge-name">${b.name}</span>
          ${isPinned ? `<span class="badge-pin-dot" aria-hidden="true"></span>` : ""}
        </button>`;
    }).join("");
    const earnedCount = BADGES.filter(b => b.earned(stats, streak, xp)).length;
    return `
      <div class="settings-section">
        <div class="stats-section-title">\u{1F3C5} Badges (${earnedCount}/${BADGES.length})</div>
        <p class="settings-hint">Earned from real progress — nothing here is handed out for just opening the app.
          Tap an earned badge to pin it next to your name (up to 3).</p>
        <div class="badge-grid">${chips}</div>
      </div>`;
  }

  function renderStats() {
    const stats = DB.getStats();
    if (!stats) return;

    const body = document.getElementById("stats-body");

    // Build topic rows, grouped by unit
    let topicRowsHtml = "";
    ALL_TOPICS.forEach(t => {
      const ts = stats.topicStats[t.id];
      let scoreHtml;
      if (ts && ts.bestScore > 0) {
        const cls = ts.bestScore >= 80 ? "pass" : "fail";
        scoreHtml = `<span class="stats-topic-score ${cls}">${ts.bestScore}% (${ts.attempts} attempt${ts.attempts !== 1 ? "s" : ""})</span>`;
      } else {
        scoreHtml = `<span class="stats-topic-score none">—</span>`;
      }
      topicRowsHtml += `
        <div class="stats-topic-row">
          <span class="stats-topic-name">U${t.unit} · ${t.icon} ${t.title}</span>
          ${scoreHtml}
        </div>`;
    });

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
          <div class="stats-section-title">🎯 Your weak spots</div>
          <div class="weak-hint">Lowest recent scores. Tap one to start there.</div>
          ${rows}
        </div>`;
    }

    // How much is waiting, so the review queue isn't invisible.
    const dueCount = DB.getDueTopicIds().length;
    const dueHtml = dueCount
      ? `<div class="due-banner">🔁 ${dueCount} topic${dueCount === 1 ? "" : "s"} due for review</div>`
      : "";

    body.innerHTML = `
      ${dueHtml}
      ${badgeGridHtml(stats)}
      ${weakHtml}
      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-value accent">${stats.completionPct}%</div>
          <div class="stat-label">Overall Progress</div>
        </div>
        <div class="stat-card">
          <div class="stat-value green">${stats.topicsCompleted}/${stats.totalTopics}</div>
          <div class="stat-label">Topics Mastered</div>
        </div>
        <div class="stat-card">
          <div class="stat-value cyan">${stats.miniQuizAccuracy}%</div>
          <div class="stat-label">Question Accuracy</div>
        </div>
        <div class="stat-card">
          <div class="stat-value yellow">${stats.examAccuracy}%</div>
          <div class="stat-label">Exam Accuracy</div>
        </div>
      </div>

      <div class="stats-grid">
        <div class="stat-card">
          <div class="stat-value accent">${stats.miniQuizCorrect}/${stats.miniQuizTotal}</div>
          <div class="stat-label">Question Score</div>
        </div>
        <div class="stat-card">
          <div class="stat-value green">${stats.examsPassed}/${stats.examsTaken}</div>
          <div class="stat-label">Exams Passed</div>
        </div>
      </div>

      <div class="stats-section-title">Topic Exam Scores (All Units)</div>
      <div class="stats-topic-list">
        ${topicRowsHtml}
      </div>
    `;

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
      alert("Data imported successfully!");
    } catch (err) {
      alert("Import failed: " + err.message);
    }
    e.target.value = "";
  });

  // ---- seam: what this branch offers to everyone else ----
  Object.assign(Dojo, { showStatsModal, hideStatsModal, renderStats, earnedBadges, BADGES });
})();
