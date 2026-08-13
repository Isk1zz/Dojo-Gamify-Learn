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
    "star-shop":    () => Dojo.renderStarShop,
    "unit-select":  () => Dojo.renderUnitSelect,
    "topic-map":    () => Dojo.renderTopicMap,
    garden:         () => Dojo.renderGarden,
    shop:           () => Dojo.renderShop,
    games:          () => Dojo.renderGames,
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
  on("btn-star-shop",      () => Router.go("star-shop"));
  on("btn-back-star-shop", () => Router.go("course-select"));
  on("btn-lobby-garden",   () => Router.go("garden"));
  on("btn-lobby-shop",     () => Router.go("shop"));
  on("btn-lobby-games",    () => Router.go("games"));
  on("btn-lobby-settings", () => Router.go("settings"));
  on("btn-lobby-stats",    () => Dojo.showStatsModal());
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
    if (Dojo.applyHints) Dojo.applyHints(DB.getHintsEnabled());
    Dojo.renderCharge();
    Dojo.updateProfileBadge();
    if (Dojo.renderVitals) Dojo.renderVitals();
  });

  // The wallet strip lives in the top bar, so any branch that changes
  // the balance repaints it here rather than reaching for the element
  // itself.
  Bus.on("wallet:changed", () => Dojo.renderVitals && Dojo.renderVitals());
  Bus.on("stars:changed", () => Dojo.renderVitals && Dojo.renderVitals());

  // Free Stars, event-driven off the SAME rank-up crossing that already
  // fires (core/hud.js's checkRankUp emits this on every XP-earning
  // action, but only actually FIRES when a rank boundary is crossed).
  // Credited here, once, rather than re-derived from XP like theme/
  // bgStripe rewards are — see shop/ranks.js's comment on why Stars
  // can't use that pattern.
  Bus.on("rank:up", ({ to }) => {
    const bonus = to && to.reward && to.reward.stars;
    if (bonus) {
      DB.addStars(bonus);
      Bus.emit("stars:changed", { delta: bonus, reason: "rank-up" });
    }
  });

  Bus.on("progress:changed", () => {
    if (state.currentUnit) Dojo.renderTopicMap();
  });

  // ---- 4. Start ----
  DB.init();
  Dojo.applyTheme(DB.getTheme());
  if (Dojo.applyBgStripe) Dojo.applyBgStripe(DB.getBgStripe());
  if (Dojo.applyHints) Dojo.applyHints(DB.getHintsEnabled());
  Dojo.renderCharge();
  if (Dojo.renderStreak) Dojo.renderStreak();
  Dojo.updateProfileBadge();
  if (Dojo.renderVitals) Dojo.renderVitals();
})();
