// ================================================
// CS Dojo — SHOP / store
// ------------------------------------------------
// The one Shop. Both currencies live here, split into categories down
// the left: 🪙 Tokens (packs, patron tiers) and $ Money (cosmetics).
//
// ---- Why one screen and not two ----
// Tokens and $ stay strictly separate as CURRENCIES — that separation
// is doing real work (see docs/BACKEND-ROADMAP.md's Flag 1 on the
// Arcade). But "where do I spend money" is one question, and answering
// it with two unrelated screens reached from two different places was
// the actual complaint. Separate aisles, one shop.
//
// The wallet chip opens this at a $ category, the token chip at a 🪙
// one — see core/hud.js.
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
  function buyPalette(id) {
    if (ownsPalette(id)) return false;
    const cost = paletteCost(id);
    if (!cost || !DB.spendMoney || !DB.spendMoney(cost)) return false;
    DB.addInventory(paletteKey(id));
    Dojo.Bus.emit("wallet:changed", { delta: -cost, reason: "palette-buy" });
    return true;
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
  function buyLayout(id) {
    const l = LAYOUTS.find(x => x.id === id);
    if (!l || ownsLayout(id)) return false;
    if (!DB.spendMoney || !DB.spendMoney(l.price)) return false;
    DB.addInventory(layoutKey(id));
    Dojo.Bus.emit("wallet:changed", { delta: -l.price, reason: "layout-buy" });
    return true;
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
  function buyTheme(id) {
    if (ownsTheme(id)) return false;
    const cost = themePrice(id);
    if (!cost || !DB.spendMoney || !DB.spendMoney(cost)) return false;
    DB.addInventory(themeKey(id));
    Dojo.Bus.emit("wallet:changed", { delta: -cost, reason: "theme-buy" });
    return true;
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
  function buyDecor(id) {
    if (ownsDecor(id)) return false;
    const cost = decorPrice(id);
    if (!cost || !DB.spendMoney || !DB.spendMoney(cost)) return false;
    DB.addInventory(decorKey(id));
    Dojo.Bus.emit("wallet:changed", { delta: -cost, reason: "decor-buy" });
    return true;
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
  function buyScene(id) {
    if (ownsScene(id)) return false;
    const cost = scenePrice(id);
    if (!cost || !DB.spendMoney || !DB.spendMoney(cost)) return false;
    DB.addInventory(sceneKey(id));
    Dojo.Bus.emit("wallet:changed", { delta: -cost, reason: "scene-buy" });
    return true;
  }

  // A shop sells what you DON'T have. Everything already owned is
  // filtered out of every pane below and lives in Custom instead
  // — a section whose stock is entirely bought renders as nothing at
  // all rather than as a wall of disabled "Owned" buttons you can't act
  // on. `section()` is the shared shape: no items left, no section.
  function section(title, hint, items) {
    if (!items.length) return "";
    return `
      <div class="settings-section">
        <div class="stats-section-title">${title}</div>
        <p class="settings-hint">${hint}</p>
        <div class="shop-grid">${items.join("")}</div>
      </div>`;
  }

  function card(preview, name, tagline, attr, id, price, wallet) {
    const afford = wallet >= price;
    return `
      <div class="shop-card">
        ${preview}
        <div class="shop-card-body">
          <div class="shop-name">${name}</div>
          <div class="shop-tagline">${tagline}</div>
          <button class="shop-btn buy" ${attr}="${id}" ${afford ? "" : "disabled"}>
            ${afford ? `Buy — $${price}` : `Need $${price - wallet} more`}
          </button>
        </div>
      </div>`;
  }

  function scenesPane() {
    const wallet = DB.getWallet();
    return section(
      "\u{1F3DE}\u{FE0F} Scenery",
      "The horizon along the bottom of every screen. One at a time — you can't stand on two grounds at once.",
      (Dojo.SCENES || []).filter(s => !ownsScene(s.id)).map(s =>
        card(`<div class="shop-card-preview game-preview"><span class="gp-icon">${s.icon}</span></div>`,
             s.name, s.desc, "data-scene", s.id, s.price, wallet))
    );
  }

  // Every decoration is free as of 2026-08-15, so this pane renders as
  // nothing at all in practice — correct, not a bug: they're all
  // already yours and belong in the Inventory. The pane stays because
  // the next PAID decoration should appear here without new plumbing.
  function decorPane() {
    const wallet = DB.getWallet();
    return section(
      "\u{1F985} Lobby decorations",
      "Layer over any theme or palette — switch each one on or off independently in Custom.",
      (Dojo.BG_DECORS || []).filter(d => !ownsDecor(d.id)).map(d => {
        const face = Dojo.decorFace ? Dojo.decorFace(d) : d;
        return card(`<div class="shop-card-preview game-preview"><span class="gp-icon">${face.icon}</span></div>`,
                    face.name, face.desc, "data-decor", d.id, d.price, wallet);
      })
    );
  }

  function themesPane() {
    const wallet = DB.getWallet();
    return section(
      "🌈 Colour themes",
      "Indigo Night and Frost are free and already yours. Awarded themes aren't sold here at all — those come from rank.",
      (Dojo.THEMES || []).filter(t => !ownsTheme(t.id)).map(t =>
        card(`<div class="shop-card-preview" style="background:${t.card};display:flex;align-items:center;justify-content:center;">
                <span style="width:26px;height:26px;border-radius:50%;background:${t.swatch};"></span>
              </div>`,
             t.name, t.mode === "light" ? "A light theme." : "A dark theme.",
             "data-theme", t.id, themePrice(t.id), wallet))
    );
  }

  // ---- Categories ----
  const CATS = [
    { id: "packs",    group: "tokens",  icon: "\u{1FA99}", label: "Token packs" },
    { id: "exchange", group: "tokens",  icon: "\u{1F501}", label: "Exchange" },
    { id: "custom",   group: "money",   icon: "\u{1F3A8}", label: "Custom Shop" },
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
    return group("tokens", `\u{1FA99} Tokens · ${DB.getTokens()}`)
         + group("money", `\u{1F4B5} Money · $${DB.getWallet()}`)
         + group("support", `\u{1F49C} Support`);
  }

  // ---- Panes ----
  // A single flag, drawn as an actual flag-proportioned rectangle (not
  // a full-bleed card background) with its two most identifying details
  // added back in: Israel's Star of David and the USA's canton of
  // stars. Reported as "flags in shop should be fixed" — this was the
  // ART half of that; HEX_FLAG_MODES' key order (core/lobby.js) is the
  // ORDER half, now real flags first and the Mixtape combo last since
  // it's built FROM the first two.
  function flagArt(flag, id) {
    if (!flag) return `<div class="flag-swatch" style="background:var(--bg-surface)"></div>`;
    const overlay = id === "israel" ? `<span class="flag-star">✡</span>`
      : id === "usa" ? `<span class="flag-canton"></span>` : "";
    return `<div class="flag-swatch" style="background:${flag.bar}">${overlay}</div>`;
  }

  function palettesPane() {
    const MODES = Dojo.HEX_FLAG_MODES || {};
    const FLAGS = Dojo.HEX_FLAGS || {};
    const LABELS = Dojo.HEX_FLAG_LABELS || {};
    const wallet = DB.getWallet();
    return section(
      "\u{1F3A8} Styles",
      "Bought once, then equippable on EITHER the Star of David or the spokes — they're two separate slots in Custom, so one palette can dress both or you can mix them.",
      Object.keys(MODES).filter(id => !ownsPalette(id)).map(id => {
        const pair = MODES[id] || [];
        const first = FLAGS[pair[0]];
        const second = FLAGS[pair[1]];
        return card(
          `<div class="shop-card-preview flag-preview">
             ${flagArt(first, pair[0])}
             ${second && second !== first ? flagArt(second, pair[1]) : ""}
           </div>`,
          LABELS[id] || id, "Unlocks this palette for both colour slots.",
          "data-palette", id, paletteCost(id), wallet);
      })
    );
  }

  // Custom Shop = what the lobby LOOKS like: the layout itself, then
  // the colours that dress it. Two sections in one aisle rather than
  // two aisles, because you pick a layout once and then keep coming
  // back for styles — they're the same errand.
  function layoutsPane() {
    const wallet = DB.getWallet();
    return section(
      "\u{1F9E9} Layouts",
      "How the Lobby is arranged. Star is yours from the start and always free — these are the alternatives.",
      LAYOUTS.filter(l => !ownsLayout(l.id)).map(l =>
        card(`<div class="shop-card-preview game-preview"><span class="gp-icon">${l.icon}</span></div>`,
             l.name, l.desc, "data-layout", l.id, l.price, wallet))
    );
  }

  function paneHtml() {
    if (activeCat === "custom") {
      const panes = layoutsPane() + themesPane() + palettesPane() + decorPane() + scenesPane();
      // With owned stock filtered out, buying the last item empties the
      // aisle completely — say so and point at where the goods went,
      // rather than rendering a bare heading over nothing.
      return panes || `
        <div class="settings-section" style="text-align:center;">
          <div class="stats-section-title">\u{1F389} You own everything here</div>
          <p class="settings-hint">Every layout, theme, style and scene is yours. Equip them from Custom.</p>
          <button id="btn-store-inventory" class="btn-ghost">&#128218; Open Custom</button>
        </div>`;
    }
    // Token packs and patron tiers are shop/tokens.js's data — asked
    // for as markup rather than duplicated here.
    if (activeCat === "packs" && Dojo.tokenPacksPane) return Dojo.tokenPacksPane();
    if (activeCat === "exchange" && Dojo.exchangePane) return Dojo.exchangePane();
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
    body.querySelectorAll("[data-theme]").forEach(btn => {
      btn.addEventListener("click", () => { if (buyTheme(btn.getAttribute("data-theme"))) renderStore(); });
    });
    body.querySelectorAll("[data-layout]").forEach(btn => {
      btn.addEventListener("click", () => { if (buyLayout(btn.getAttribute("data-layout"))) renderStore(); });
    });
    body.querySelectorAll("[data-palette]").forEach(btn => {
      btn.addEventListener("click", () => { if (buyPalette(btn.getAttribute("data-palette"))) renderStore(); });
    });
    body.querySelectorAll("[data-decor]").forEach(btn => {
      btn.addEventListener("click", () => { if (buyDecor(btn.getAttribute("data-decor"))) renderStore(); });
    });
    body.querySelectorAll("[data-scene]").forEach(btn => {
      btn.addEventListener("click", () => { if (buyScene(btn.getAttribute("data-scene"))) renderStore(); });
    });
    const invBtn = body.querySelector("#btn-store-inventory");
    if (invBtn) invBtn.addEventListener("click", () => Router.go("inventory"));
    // Token packs / patron tiers keep their own handlers — they live
    // with the data in shop/tokens.js.
    if (Dojo.bindTokenPane) Dojo.bindTokenPane(body, renderStore);

    showScreen("store");
  }

  Object.assign(Dojo, { renderStore, ownsPalette, paletteCost, ownsLayout, LAYOUTS, ownsTheme, themePrice, ownsDecor, decorPrice, ownsScene, scenePrice });
})();
