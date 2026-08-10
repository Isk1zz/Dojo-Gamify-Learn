// ================================================
// CS Dojo — CORE / lobby
// ------------------------------------------------
// The hub screen. Owns no content of its own — every tile is a
// one-line summary a branch hands over, plus Router.go(...).
// If a tile needs a number, ask the branch for it; do not compute
// another branch's numbers here.
// ================================================

(() => {
  // ---- seam: everything this branch borrows from elsewhere ----
  // Late-bound on purpose. A branch may be loaded before the branch
  // it calls into, so these resolve at call time, not at load time.
  const state = Dojo.state;
  const showScreen = Dojo.showScreen;
  const Router = Dojo.Router;
  const renderCharge = (...a) => Dojo.renderCharge(...a);
  const gardenSummary = (...a) => Dojo.gardenSummary(...a);
  const shopSummary = (...a) => Dojo.shopSummary(...a);

  // ---- Lobby ----
  function showLobby() {
    state.currentCourse = null;
    const p = DB.getActiveProfile();
    document.getElementById("lobby-welcome").textContent =
      p ? `Welcome back, ${p.name}.` : "Welcome.";

    // Resume tile — only offered when there's somewhere to resume to.
    const pos = DB.getPosition();
    const resumeBtn = document.getElementById("btn-lobby-resume");
    if (pos) {
      const topic = ALL_TOPICS.find(t => t.id === pos.topicId);
      if (topic) {
        resumeBtn.style.display = "flex";
        document.getElementById("lobby-resume-sub").textContent =
          `${topic.icon} ${topic.title} — chunk ${pos.chunkIdx + 1}`;
      } else {
        resumeBtn.style.display = "none";
      }
    } else {
      resumeBtn.style.display = "none";
    }

    // Review is no longer a tile. Due topics are "plants that need
    // watering" and live in the Garden, where the picture already means
    // retention — see garden/GARDEN.md.

    // Each tile's subtitle is asked for, not computed here. The lobby
    // must not know what a plant or a theme price is.
    const tile = (id, subId, summary) => {
      const btn = document.getElementById(id);
      const sub = document.getElementById(subId);
      if (!btn) return;
      if (!summary) { btn.style.display = "none"; return; }
      btn.style.display = "flex";
      if (sub) sub.textContent = summary;
    };
    tile("btn-lobby-garden", "lobby-garden-sub", gardenSummary());
    tile("btn-lobby-shop",   "lobby-shop-sub",   shopSummary());
    tile("btn-lobby-games",  "lobby-games-sub",  Dojo.gamesSummary ? Dojo.gamesSummary() : null);
    // Story shares the Arcade screen as a tab — no tile of its own.

    renderCharge();
    if (Dojo.renderVitals) Dojo.renderVitals();
    showScreen("lobby");
  }

  // ---- seam: what this branch offers to everyone else ----
  Object.assign(Dojo, { showLobby });
})();
