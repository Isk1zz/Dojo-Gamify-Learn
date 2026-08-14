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
    { id: "classic",  slot: "lobby", name: "Classic",       price: 200, icon: "📋",
      desc: "The original stacked list." },
    { id: "cards",    slot: "lobby", name: "Cards",         price: 250, icon: "🗃️",
      desc: "Same tiles, softer card treatment." },
    { id: "hexagram", slot: "links", name: "Star of David", price: 350, icon: "✡️",
      desc: "Wires the Star's six tiles into two triangles." }
  ];
  const layoutKey = id => `layout_${id}`;
  function ownsLayout(id) {
    if (id === "star" || id === "spokes") return true;   // defaults, always yours
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

  function themesPane() {
    const wallet = DB.getWallet();
    const now = DB.getTheme();
    return `
      <div class="settings-section">
        <div class="stats-section-title">🌈 Colour themes</div>
        <p class="settings-hint">Indigo Night and Frost are free — one dark, one light, so you always have a usable pair. Awarded themes aren't sold here at all; those come from rank.</p>
        <div class="shop-grid">
          ${(Dojo.THEMES || []).map(t => {
            const owned = ownsTheme(t.id);
            const cost = themePrice(t.id);
            const afford = wallet >= cost;
            return `
              <div class="shop-card">
                <div class="shop-card-preview" style="background:${t.card};display:flex;align-items:center;justify-content:center;">
                  <span style="width:26px;height:26px;border-radius:50%;background:${t.swatch};"></span>
                </div>
                <div class="shop-card-body">
                  <div class="shop-name">${t.name}</div>
                  <div class="shop-tagline">${!cost ? "Free — always yours." : owned ? "Owned — equip it in your Inventory." : (t.mode === "light" ? "A light theme." : "A dark theme.")}</div>
                  <button class="shop-btn buy" data-theme="${t.id}" ${owned || !afford ? "disabled" : ""}>
                    ${!cost ? "Free" : owned ? (t.id === now ? "Equipped" : "Owned") : afford ? `Buy — ${cost}` : `Need ${cost - wallet} more`}
                  </button>
                </div>
              </div>`;
          }).join("")}
        </div>
      </div>`;
  }

  // ---- Categories ----
  const CATS = [
    { id: "packs",   group: "tokens",  icon: "\u{1FA99}", label: "Token packs" },
    { id: "custom",  group: "money",   icon: "\u{1F3A8}", label: "Custom Shop" },
    { id: "patron",  group: "support", icon: "\u{1F49C}", label: "Support the Dojo" }
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
  function palettesPane() {
    const MODES = Dojo.HEX_FLAG_MODES || {};
    const FLAGS = Dojo.HEX_FLAGS || {};
    const LABELS = Dojo.HEX_FLAG_LABELS || {};
    const wallet = DB.getWallet();
    return `
      <div class="settings-section">
        <div class="stats-section-title">\u{1F3A8} Styles</div>
        <p class="settings-hint">Bought once, then equippable on EITHER the Star of David or the spokes — they're two separate slots in your Inventory, so one palette can dress both or you can mix them.</p>
        <div class="shop-grid">
          ${Object.keys(MODES).map(id => {
            const owned = ownsPalette(id);
            const cost = paletteCost(id);
            const first = FLAGS[(MODES[id] || [])[0]];
            const second = FLAGS[(MODES[id] || [])[1]];
            const afford = wallet >= cost;
            return `
              <div class="shop-card">
                <div class="shop-card-preview" style="background:${first ? first.bar : "var(--bg-surface)"}"></div>
                ${second && second !== first ? `<div class="shop-card-preview" style="height:10px;background:${second.bar}"></div>` : ""}
                <div class="shop-card-body">
                  <div class="shop-name">${LABELS[id] || id}</div>
                  <div class="shop-tagline">${owned ? "Owned — equip it in your Inventory." : `Unlocks this palette for both colour slots.`}</div>
                  <button class="shop-btn buy" data-palette="${id}" ${owned || !afford ? "disabled" : ""}>
                    ${owned ? "Owned" : afford ? `Buy — $${cost}` : `Need $${cost - wallet} more`}
                  </button>
                </div>
              </div>`;
          }).join("")}
        </div>
      </div>`;
  }

  // Custom Shop = what the lobby LOOKS like: the layout itself, then
  // the colours that dress it. Two sections in one aisle rather than
  // two aisles, because you pick a layout once and then keep coming
  // back for styles — they're the same errand.
  function layoutsPane() {
    const wallet = DB.getWallet();
    return `
      <div class="settings-section">
        <div class="stats-section-title">\u{1F9E9} Layouts</div>
        <p class="settings-hint">How the Lobby is arranged. Star is yours from the start and always free — these are the alternatives.</p>
        <div class="shop-grid">
          ${LAYOUTS.map(l => {
            const owned = ownsLayout(l.id);
            const afford = wallet >= l.price;
            return `
              <div class="shop-card">
                <div class="shop-card-preview game-preview"><span class="gp-icon">${l.icon}</span></div>
                <div class="shop-card-body">
                  <div class="shop-name">${l.name}</div>
                  <div class="shop-tagline">${owned ? "Owned — equip it in your Inventory." : l.desc}</div>
                  <button class="shop-btn buy" data-layout="${l.id}" ${owned || !afford ? "disabled" : ""}>
                    ${owned ? "Owned" : afford ? `Buy — $${l.price}` : `Need $${l.price - wallet} more`}
                  </button>
                </div>
              </div>`;
          }).join("")}
        </div>
      </div>`;
  }

  function paneHtml() {
    if (activeCat === "custom") return layoutsPane() + themesPane() + palettesPane();
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

    body.innerHTML = `
      <div class="store-layout">
        <nav class="store-nav">${navHtml()}</nav>
        <div class="store-pane" id="store-pane">${paneHtml()}</div>
      </div>`;

    body.querySelectorAll("[data-cat]").forEach(btn => {
      btn.addEventListener("click", () => { activeCat = btn.getAttribute("data-cat"); renderStore(); });
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
    // Token packs / patron tiers keep their own handlers — they live
    // with the data in shop/tokens.js.
    if (Dojo.bindTokenPane) Dojo.bindTokenPane(body, renderStore);

    showScreen("store");
  }

  Object.assign(Dojo, { renderStore, ownsPalette, paletteCost, ownsLayout, LAYOUTS, ownsTheme, themePrice });
})();
