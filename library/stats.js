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
  Object.assign(Dojo, { showStatsModal, hideStatsModal, renderStats });
})();
