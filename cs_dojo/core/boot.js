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
  on("btn-lobby-garden",   () => Router.go("garden"));
  on("btn-lobby-shop",     () => Router.go("shop"));
  on("btn-lobby-games",    () => Router.go("games"));
  on("btn-lobby-settings", () => Router.go("settings"));
  on("btn-lobby-stats",    () => Dojo.showStatsModal());

  ["btn-back-lobby", "btn-back-lobby2", "btn-back-lobby3",
   "btn-back-lobby4", "btn-back-lobby5", "btn-back-lobby6"]
    .forEach(id => on(id, () => Dojo.showLobby()));

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
    Dojo.renderCharge();
    Dojo.updateProfileBadge();
    if (Dojo.renderVitals) Dojo.renderVitals();
  });

  // Vitals live in the top strip, so any branch that changes them
  // repaints it here rather than reaching for the element itself.
  Bus.on("vitals:changed", () => Dojo.renderVitals && Dojo.renderVitals());
  Bus.on("wallet:changed", () => Dojo.renderVitals && Dojo.renderVitals());

  Bus.on("progress:changed", () => {
    if (state.currentUnit) Dojo.renderTopicMap();
  });

  // ---- 4. Start ----
  DB.init();
  Dojo.applyTheme(DB.getTheme());
  Dojo.renderCharge();
  Dojo.updateProfileBadge();
  // One decay tick per calendar day the app is opened. Never per hour
  // elapsed — being away must stay free. See shop/life.js.
  if (Dojo.LifeShop) Dojo.LifeShop.dailyTick();
  if (Dojo.renderVitals) Dojo.renderVitals();
})();
