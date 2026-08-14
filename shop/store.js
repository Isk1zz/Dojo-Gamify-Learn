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

  // ---- Categories ----
  const CATS = [
    { id: "packs",    group: "tokens", icon: "\u{1FA99}", label: "Token packs" },
    { id: "patron",   group: "tokens", icon: "⭐",    label: "Support the Dojo" },
    { id: "palettes", group: "money",  icon: "\u{1F3A8}", label: "Star & spoke colours" }
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
         + group("money", `\u{1F4B5} Money · $${DB.getWallet()}`);
  }

  // ---- Panes ----
  function palettesPane() {
    const MODES = Dojo.HEX_FLAG_MODES || {};
    const FLAGS = Dojo.HEX_FLAGS || {};
    const LABELS = Dojo.HEX_FLAG_LABELS || {};
    const wallet = DB.getWallet();
    return `
      <div class="settings-section">
        <div class="stats-section-title">\u{1F3A8} Star &amp; spoke colours</div>
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

  function paneHtml() {
    if (activeCat === "palettes") return palettesPane();
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
    body.querySelectorAll("[data-palette]").forEach(btn => {
      btn.addEventListener("click", () => { if (buyPalette(btn.getAttribute("data-palette"))) renderStore(); });
    });
    // Token packs / patron tiers keep their own handlers — they live
    // with the data in shop/tokens.js.
    if (Dojo.bindTokenPane) Dojo.bindTokenPane(body, renderStore);

    showScreen("store");
  }

  Object.assign(Dojo, { renderStore, ownsPalette, paletteCost });
})();
