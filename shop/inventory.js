// ================================================
// CS Dojo — SHOP / inventory
// ------------------------------------------------
// Everything the profile OWNS and can equip, in one place: themes,
// background stripes, lobby style, star links, hexagram flags,
// avatars. It took the Statistics tile's slot in the lobby (Statistics
// merged into Career — see shop/shop.js).
//
// ---- Why this doesn't own any of the data ----
// Every slot below reads its catalogue from whichever branch already
// defines it (shop/themes.js, shop/avatars.js, core/lobby.js) and
// writes through the same DB setters Settings uses. This screen is a
// VIEW over ownership, not a second source of truth — equipping here
// and equipping in Settings are the same operation, so the two can
// never disagree about what's equipped.
//
// Locked entries are deliberately NOT listed. Settings already shows
// locked themes with the rank needed, which is the right place for
// "what's coming"; an inventory that lists things you don't have isn't
// an inventory.
// ================================================

(() => {
  const showScreen = Dojo.showScreen;
  const Router = Dojo.Router;

  // A slot is one row of owned things. `items` returns [{id, name,
  // swatch, equipped}] — swatch is inline CSS for the chip's colour
  // block, or null for a glyph-only chip.
  function slots() {
    const out = [];

    // ---- Colour themes ----
    // Free themes are always owned; premium ones gate on
    // Dojo.themeUnlocked — the same predicate Settings uses, rather
    // than a second reading of the rank table that could drift from it.
    // Dojo.THEMES, not a bare THEMES: shop/themes.js keeps its tables
    // inside its IIFE and exposes them on the Dojo seam. A `typeof
    // THEMES !== "undefined"` guard here silently rendered an empty
    // themes row instead of failing loudly — caught by counting chips,
    // not by reading the code.
    const themeNow = DB.getTheme();
    const freeThemes = Dojo.THEMES || [];
    const ownedPremium = (Dojo.PREMIUM_THEMES || [])
      .filter(t => Dojo.themeUnlocked && Dojo.themeUnlocked(t.id));
    out.push({
      key: "theme", icon: "\u{1F3A8}", title: "Colour themes",
      items: freeThemes.concat(ownedPremium).map(t => ({
        id: t.id, name: t.name,
        swatch: `background:${t.swatch}`,
        equipped: t.id === themeNow
      })),
      equip: id => { DB.setTheme(id); Dojo.applyTheme(id); }
    });

    // ---- Background stripes ----
    const stripeNow = DB.getBgStripe ? DB.getBgStripe() : "none";
    const stripes = (Dojo.BG_STRIPES || [])
      .filter(s => Dojo.bgStripeUnlocked && Dojo.bgStripeUnlocked(s.id));
    out.push({
      key: "stripe", icon: "\u{1F9F5}", title: "Background stripes",
      items: [{ id: "none", name: "None", swatch: null, equipped: stripeNow === "none" }]
        .concat(stripes.map(s => ({
          id: s.id, name: s.name, swatch: `background-image:${s.css}`, equipped: s.id === stripeNow
        }))),
      equip: id => { DB.setBgStripe(id); if (Dojo.applyBgStripe) Dojo.applyBgStripe(id); }
    });

    // ---- Lobby style ----
    const styleNow = DB.getLobbyStyle();
    out.push({
      key: "lobby", icon: "\u{1F9E9}", title: "Lobby style",
      items: [["classic", "Classic"], ["cards", "Cards"], ["star", "Star"]]
        .map(([id, name]) => ({ id, name, swatch: null, equipped: id === styleNow })),
      equip: id => DB.setLobbyStyle(id)
    });

    // ---- Star links + hexagram flags ----
    // Only worth showing while the Star lobby is equipped — they do
    // nothing in Classic or Cards, and an inventory full of inert rows
    // is noise.
    if (styleNow === "star") {
      const linksNow = DB.getStarLinks ? DB.getStarLinks() : "spokes";
      out.push({
        key: "links", icon: "\u{1F517}", title: "Star links",
        items: [["spokes", "Spokes"], ["hexagram", "Star of David"]]
          .map(([id, name]) => ({ id, name, swatch: null, equipped: id === linksNow })),
        equip: id => DB.setStarLinks(id)
      });

      if (linksNow === "hexagram") {
        const flagsNow = DB.getHexFlags ? DB.getHexFlags() : "combined";
        const FLAGS = Dojo.HEX_FLAGS || {};
        const MODES = Dojo.HEX_FLAG_MODES || {};
        const LABELS = Dojo.HEX_FLAG_LABELS || {};
        out.push({
          key: "flags", icon: "\u{1F38C}", title: "Star of David colours",
          items: Object.keys(MODES).map(id => {
            const first = FLAGS[(MODES[id] || [])[0]];
            return {
              id, name: LABELS[id] || id,
              swatch: first ? `background:${first.bar}` : null,
              equipped: id === flagsNow
            };
          }),
          equip: id => DB.setHexFlags(id)
        });
      }
    }

    // ---- Avatars ----
    const owned = DB.getOwnedAvatars ? DB.getOwnedAvatars() : [];
    if (owned.length) {
      const equippedAvatar = DB.getAvatar ? DB.getAvatar() : null;
      const table = Dojo.AVATARS || [];
      out.push({
        key: "avatar", icon: "\u{1F464}", title: "Avatars",
        items: owned.map(id => {
          const a = table.find(x => x.id === id);
          return { id, name: a ? a.name : id, glyph: a ? a.icon : "?", swatch: null,
                   equipped: id === equippedAvatar };
        }),
        equip: id => { DB.setAvatar(id); if (Dojo.updateProfileBadge) Dojo.updateProfileBadge(); }
      });
    }

    return out;
  }

  function renderInventory() {
    const body = document.getElementById("inventory-body");
    if (!body) return;

    const rows = slots();
    const total = rows.reduce((n, s) => n + s.items.length, 0);

    body.innerHTML = `
      <div class="shop-wallet">
        <div class="sw-balance">\u{1F392} ${total} unlocked</div>
        <p class="settings-hint" style="margin:0.6rem 0 0;">
          Everything you own and can equip. Tap anything to put it on — it
          takes effect straight away, same as equipping it in Settings.
          Locked items aren't listed here; Settings shows those with the
          rank they need.
        </p>
        <button id="btn-inventory-shop" class="btn-ghost" style="margin-top:0.9rem;">\u{1F396} Open Shop (Career)</button>
      </div>
      ${rows.map(s => `
        <div class="settings-section">
          <div class="stats-section-title">${s.icon} ${s.title}</div>
          <div class="inv-grid">
            ${s.items.map(it => `
              <button type="button" class="inv-chip${it.equipped ? " equipped" : ""}"
                      data-slot="${s.key}" data-id="${it.id}">
                <span class="inv-swatch"${it.swatch ? ` style="${it.swatch}"` : ""}>${it.glyph || ""}</span>
                <span class="inv-name">${it.name}</span>
                ${it.equipped ? `<span class="inv-on">✓</span>` : ""}
              </button>`).join("")}
          </div>
        </div>`).join("")}`;

    body.querySelectorAll(".inv-chip").forEach(btn => {
      btn.addEventListener("click", () => {
        const slot = rows.find(s => s.key === btn.getAttribute("data-slot"));
        if (!slot) return;
        slot.equip(btn.getAttribute("data-id"));
        renderInventory();   // re-derive rather than patch: equipping a
                             // lobby style can add or remove whole rows
      });
    });

    const shopBtn = body.querySelector("#btn-inventory-shop");
    if (shopBtn) shopBtn.addEventListener("click", () => Router.go("shop"));

    showScreen("inventory");
  }

  Object.assign(Dojo, { renderInventory });
})();
