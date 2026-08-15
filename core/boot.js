// ================================================
// CS Dojo — CORE / boot
// ------------------------------------------------
// Loads last. Three jobs and no others:
//   1. register every branch's screen with the Router
//   2. wire the cross-branch buttons (lobby tiles, back-to-lobby)
//   3. start the app
//
// A button that stays inside one branch (back to Topics, retry exam)
// is wired by that branch, not here. If you are adding a listener to
// this file, check first that it really crosses a branch boundary.
// ================================================

(() => {
  const { Router, Bus, state } = Dojo;

  // ---- 1. Screen registry ----
  // A branch that isn't loaded simply isn't registered, and its lobby
  // tile hides itself. That's what makes a folder droppable.
  const SCREENS = {
    lobby:          () => Dojo.showLobby,
    "course-select":() => Dojo.renderCourseSelect,
    "unit-select":  () => Dojo.renderUnitSelect,
    "topic-map":    () => Dojo.renderTopicMap,
    garden:         () => Dojo.renderGarden,
    shop:           () => Dojo.renderShop,
    games:          () => Dojo.renderGames,
    inventory:      () => Dojo.renderInventory,
    store:          () => Dojo.renderStore,
    settings:       () => Dojo.renderSettings
  };

  Object.entries(SCREENS).forEach(([id, get]) => {
    const fn = get();
    if (typeof fn === "function") Router.register(id, { render: fn });
    else console.info(`[boot] branch for "${id}" not loaded — its tile will hide`);
  });

  // ---- 2. Cross-branch wiring ----
  const on = (id, fn) => {
    const el = document.getElementById(id);
    if (el) el.addEventListener("click", fn);
  };

  on("btn-start", () => { Dojo.checkProfile(); Dojo.showLobby(); });

  on("btn-lobby-courses",  () => Router.go("course-select"));
  on("btn-token-shop",     () => Router.go("store", { cat: "packs" }));
  on("btn-lobby-garden",   () => Router.go("garden"));
  on("btn-lobby-shop",     () => Router.go("shop"));
  on("btn-lobby-games",    () => Router.go("games"));
  on("btn-lobby-settings", () => Router.go("settings"));
  // Statistics merged into Career; this tile is Inventory now (its id
  // is unchanged on purpose — see index.html).
  on("btn-lobby-stats",    () => Router.go("inventory"));
  on("btn-back-inventory", () => Router.go("lobby"));
  on("btn-back-store",     () => Router.go("lobby"));
  on("btn-lobby-flashcards", () => Dojo.openFlashcardsHub && Dojo.openFlashcardsHub());
  // Star layout's hub button — Flashcards' home in that topology only
  // (see core/lobby.js's STAR_ORDER comment). Inert in Classic/Cards,
  // where .lobby-hub stays display:none and the real tile handles it.
  on("btn-lobby-hub-flashcards", () => Dojo.openFlashcardsHub && Dojo.openFlashcardsHub());

  ["btn-back-lobby", "btn-back-lobby2", "btn-back-lobby3",
   "btn-back-lobby4", "btn-back-lobby6"]
    .forEach(id => on(id, () => Dojo.showLobby()));
  // Arcade's back button is the one exception — mid-game it should step
  // back to the game list, not skip straight past Arcade to the Lobby
  // the way every other screen's back button does. See games/games.js's
  // backFromArcade.
  on("btn-back-lobby5", () => (Dojo.backFromArcade ? Dojo.backFromArcade() : Dojo.showLobby()));

  // Resume: jump straight back into the exact chunk they left.
  // Lives here rather than in library/ because the lobby owns the tile.
  on("btn-lobby-resume", () => {
    const pos = DB.getPosition();
    if (!pos) return Dojo.showLobby();
    Dojo.resumeAt(pos);
  });


  // ---- 3. Cross-branch reactions ----
  // Branches announce facts; the reaction lives with whoever cares.
  Bus.on("profile:changed", () => {
    Dojo.applyTheme(DB.getTheme());
    if (Dojo.applyBgStripe) Dojo.applyBgStripe(DB.getBgStripe());
    if (Dojo.applyScene) Dojo.applyScene(DB.getScene());
    if (Dojo.applyHints) Dojo.applyHints(DB.getHintsEnabled());
    if (Dojo.applySoundEnabled) Dojo.applySoundEnabled(DB.getSoundEnabled());
    Dojo.renderCharge();
    Dojo.updateProfileBadge();
    if (Dojo.renderVitals) Dojo.renderVitals();
    // Entering a profile is exactly the "next time the user enters"
    // admin/ADMIN.md specifies for delivering a warning notice.
    if (Dojo.checkWarnings) Dojo.checkWarnings();
  });

  // The wallet strip lives in the top bar, so any branch that changes
  // the balance repaints it here rather than reaching for the element
  // itself.
  Bus.on("wallet:changed", () => Dojo.renderVitals && Dojo.renderVitals());
  Bus.on("tokens:changed", () => Dojo.renderVitals && Dojo.renderVitals());

  // data/db.js emits this when localStorage rejects a write (quota
  // exhausted, Safari private mode). It was emitted but never listened
  // to, so progress could silently stop persisting mid-session with no
  // indication — the one failure mode in an offline-first app that
  // actually loses a user's work. See core/hud.js's warnSaveFailed.
  Bus.on("db:saveFailed", () => Dojo.warnSaveFailed && Dojo.warnSaveFailed());

  // Free Tokens, event-driven off the SAME rank-up crossing that already
  // fires (core/hud.js's checkRankUp emits this on every XP-earning
  // action, but only actually FIRES when a rank boundary is crossed).
  // Credited here, once, rather than re-derived from XP like theme/
  // bgStripe rewards are — see shop/ranks.js's comment on why Tokens
  // can't use that pattern.
  Bus.on("rank:up", ({ to }) => {
    const bonus = to && to.reward && to.reward.tokens;
    if (bonus) {
      DB.addTokens(bonus);
      Bus.emit("tokens:changed", { delta: bonus, reason: "rank-up" });
    }
  });

  Bus.on("progress:changed", () => {
    if (state.currentUnit) Dojo.renderTopicMap();
  });

  // Admin & Telemetry Suite shortcut (Ctrl+Shift+A / F2) — a genuine
  // cross-branch binding (nothing "owns" a global keydown), so it lives
  // here even though admin/admin.js registers its own screen. Same
  // isAdmin gate every other entry point goes through; this is just a
  // faster door to it, not a bypass.
  if (Dojo.Router) {
    document.addEventListener("keydown", (e) => {
      if (e.key === "F2" || (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "a")) {
        e.preventDefault();
        Router.go("admin");
      }
    });
  }

  // ---- 4. Start ----
  DB.init();
  Dojo.applyTheme(DB.getTheme());
  if (Dojo.applyBgStripe) Dojo.applyBgStripe(DB.getBgStripe());
  if (Dojo.applyScene) Dojo.applyScene(DB.getScene());
  if (Dojo.applyHints) Dojo.applyHints(DB.getHintsEnabled());
  if (Dojo.applySoundEnabled) Dojo.applySoundEnabled(DB.getSoundEnabled());
  Dojo.renderCharge();
  if (Dojo.renderStreak) Dojo.renderStreak();
  Dojo.updateProfileBadge();
  if (Dojo.renderVitals) Dojo.renderVitals();
  // Also on cold start, not just on profile switch: reopening the app
  // with a profile already active is the commonest way a warned user
  // actually comes back, and profile:changed doesn't fire for it.
  if (Dojo.checkWarnings) Dojo.checkWarnings();
})();
