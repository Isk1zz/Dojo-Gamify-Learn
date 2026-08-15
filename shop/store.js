// ================================================
// CS Dojo — SHOP / store
// ------------------------------------------------
// The Shop. Two aisles: 🪙 Token packs and 💜 Support the Dojo.
//
// ---- What used to be here, and why it isn't ----
// A "Custom Shop" aisle sold cosmetics for `$`, and an "Exchange" aisle
// converted Tokens into `$`. Both were removed 2026-08-15 when every
// cosmetic was made free: the Custom Shop had nothing left to sell, and
// the Exchange converted into a currency that no longer buys anything.
// A working conversion into a dead end is worse than no conversion.
//
// Cosmetics are still OWNED and EQUIPPED — that all lives in Custom
// (shop/inventory.js). This file keeps the ownsX/xPrice helpers because
// Custom still asks them what's unlocked; they simply all answer "yes"
// now, via the price-0 free tier.
//
// `$` money still exists and still accrues (Garden, quest rewards) but
// has no sink at all — see UPDATESTACK.md, where deciding what it's for
// is an open question rather than an oversight.
// ================================================

(() => {
  const showScreen = Dojo.showScreen;
  const Router = Dojo.Router;

  let activeCat = "packs";

  // ---- Palette ownership ----
  // Stored as generic inventory strings, the same pattern course and
  // Arcade-game unlocks already use, rather than a bespoke profile
  // field. "combined" is deliberately free and always owned: it's the
  // default the hexagram and spokes ship with, and a default nobody
  // owns would mean a broken-looking ring on a fresh profile.
  const paletteKey = id => `palette_${id}`;
  function ownsPalette(id) {
    if (id === "combined") return true;
    if (!paletteCost(id)) return true;                   // free tier
    return DB.getInventory().includes(paletteKey(id));
  }
  function paletteCost(id) {
    const f = (Dojo.HEX_FLAGS || {})[(Dojo.HEX_FLAG_MODES || {})[id] ? (Dojo.HEX_FLAG_MODES[id] || [])[0] : id];
    return f && f.price ? f.price : 0;
  }

  // ---- Layouts ----
  // Star stays free and is never listed as purchasable: it's the
  // default a new profile starts on, and a default nobody owns would
  // mean a lobby that can't render itself. Everything else is bought.
  const LAYOUTS = [
    { id: "classic",  slot: "lobby", name: "Classic",       price: 0, icon: "📋",
      desc: "The original stacked list." },
    { id: "cards",    slot: "lobby", name: "Cards",         price: 0, icon: "🗃️",
      desc: "Same tiles, softer card treatment." },
    { id: "hexagram", slot: "links", name: "Star of David", price: 0, icon: "✡️",
      desc: "Wires the Star's six tiles into two triangles." }
  ];
  const layoutKey = id => `layout_${id}`;
  function layoutPrice(id) {
    const l = LAYOUTS.find(x => x.id === id);
    return (l && l.price) || 0;
  }
  function ownsLayout(id) {
    if (id === "star" || id === "spokes") return true;   // defaults, always yours
    if (!layoutPrice(id)) return true;                   // free tier
    return DB.getInventory().includes(layoutKey(id));
  }

  // ---- Base themes ----
  // Indigo and Frost stay free (the two defaults, one dark one light,
  // so a profile always has a usable pair). The rest are bought with $.
  // Awarded themes are NOT here — they're rank rewards and can't be
  // bought at any price; mixing them into a shop would imply otherwise.
  const themeKey = id => `theme_${id}`;
  function themePrice(id) {
    const t = (Dojo.THEMES || []).find(x => x.id === id);
    return (t && t.price) || 0;
  }
  function ownsTheme(id) {
    if (!themePrice(id)) return true;                 // free tier
    return DB.getInventory().includes(themeKey(id));
  }

  // ---- Lobby decorations ----
  // Each separately purchasable and separately toggleable — a DIFFERENT
  // ownership shape than layout/theme/palette above, which are all
  // single-equip slots. See data/db.js's getBgDecors/toggleBgDecor
  // comment for why this is a set, not a slot.
  const decorKey = id => `decor_${id}`;
  function decorPrice(id) {
    const d = (Dojo.BG_DECORS || []).find(x => x.id === id);
    return (d && d.price) || 0;
  }
  function ownsDecor(id) {
    if (!decorPrice(id)) return true;                 // free tier
    return DB.getInventory().includes(decorKey(id));
  }

  // ---- Scenery ----
  // A slot, not a set — so this mirrors layouts/themes (buy, then equip
  // exactly one) rather than the decorations above.
  const sceneKey = id => `scene_${id}`;
  function scenePrice(id) {
    const s = (Dojo.SCENES || []).find(x => x.id === id);
    return (s && s.price) || 0;
  }
  function ownsScene(id) {
    if (id === "none") return true;                 // "no scenery" is always available
    if (!scenePrice(id)) return true;               // free tier
    return DB.getInventory().includes(sceneKey(id));
  }

  // Cosmetics are still owned/equipped in Custom; they just aren't sold.
  const CATS = [
    { id: "packs",    group: "tokens",  icon: "\u{1FA99}", label: "Token packs" },
    { id: "patron",   group: "support", icon: "\u{1F49C}", label: "Support the Dojo" }
  ];

  function navHtml() {
    const group = (key, title) => `
      <div class="store-nav-group">
        <div class="store-nav-title">${title}</div>
        ${CATS.filter(c => c.group === key).map(c => `
          <button type="button" class="store-nav-btn${c.id === activeCat ? " active" : ""}" data-cat="${c.id}">
            <span class="store-nav-icon">${c.icon}</span><span>${c.label}</span>
          </button>`).join("")}
      </div>`;
    // No Money group: nothing is priced in `$` any more.
    return group("tokens", `\u{1FA99} Tokens · ${DB.getTokens()}`)
         + group("support", `\u{1F49C} Support`);
  }

  function paneHtml() {
    // Token packs and patron tiers are shop/tokens.js's data — asked
    // for as markup rather than duplicated here.
    if (activeCat === "packs" && Dojo.tokenPacksPane) return Dojo.tokenPacksPane();
    if (activeCat === "patron" && Dojo.patronPane) return Dojo.patronPane();
    return `<p class="settings-hint">Nothing here yet.</p>`;
  }

  function renderStore(payload) {
    if (payload && payload.cat) activeCat = payload.cat;
    const body = document.getElementById("store-body");
    if (!body) return;

    // Buying re-renders the whole pane, which threw the reader back to
    // the top of the Shop every purchase — the scroll position lives on
    // nodes that innerHTML destroys. Captured before the rebuild and
    // put back after. A category CHANGE is a different screen, though,
    // so that one legitimately starts at the top.
    const keepScroll = !(payload && payload.cat);
    const prevPane = document.getElementById("store-pane");
    const paneTop = prevPane ? prevPane.scrollTop : 0;
    const bodyTop = body.scrollTop;
    const winTop = window.scrollY;

    body.innerHTML = `
      <div class="store-layout">
        <nav class="store-nav">${navHtml()}</nav>
        <div class="store-pane" id="store-pane">${paneHtml()}</div>
      </div>`;

    if (keepScroll) {
      const pane = document.getElementById("store-pane");
      if (pane) pane.scrollTop = paneTop;
      body.scrollTop = bodyTop;
      window.scrollTo(0, winTop);
    }

    body.querySelectorAll("[data-cat]").forEach(btn => {
      // Routed through the payload so it counts as a category change and
      // starts at the top, rather than keeping the previous aisle's
      // scroll offset in a pane of different length.
      btn.addEventListener("click", () => renderStore({ cat: btn.getAttribute("data-cat") }));
    });
    // No cosmetic buy handlers: nothing cosmetic is sold any more.
    // Token packs / patron tiers keep their own handlers — they live
    // with the data in shop/tokens.js.
    if (Dojo.bindTokenPane) Dojo.bindTokenPane(body, renderStore);

    showScreen("store");
  }

  Object.assign(Dojo, { renderStore, ownsPalette, paletteCost, ownsLayout, LAYOUTS, ownsTheme, themePrice, ownsDecor, decorPrice, ownsScene, scenePrice });
})();
