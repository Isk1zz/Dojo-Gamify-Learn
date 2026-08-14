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
// Unowned entries DO appear, as vacant slots showing what it takes to
// fill them. That reverses an earlier call here ("an inventory that
// lists things you don't have isn't an inventory") on request — the
// argument against it was real but the argument for it is stronger:
// a slot you can see is empty is the only thing that tells you a set
// is incomplete. Rank-locked items still say the rank; shop items say
// the price and take you to the Shop.
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

      // Both colour slots draw from ONE owned pool (buy a palette once
      // in the Shop, wear it on either), so they're built from the same
      // helper. Unowned palettes still appear — as vacant slots showing
      // their price, which is what makes the inventory read as "here's
      // the set and here's what's missing" instead of quietly hiding
      // that anything else exists.
      const FLAGS = Dojo.HEX_FLAGS || {};
      const MODES = Dojo.HEX_FLAG_MODES || {};
      const LABELS = Dojo.HEX_FLAG_LABELS || {};
      const paletteItems = current => Object.keys(MODES).map(id => {
        const first = FLAGS[(MODES[id] || [])[0]];
        const owned = !Dojo.ownsPalette || Dojo.ownsPalette(id);
        return {
          id, name: LABELS[id] || id,
          swatch: first ? `background:${first.bar}` : null,
          equipped: owned && id === current,
          locked: !owned,
          price: Dojo.paletteCost ? Dojo.paletteCost(id) : 0
        };
      });

      if (linksNow === "hexagram") {
        out.push({
          key: "flags", icon: "\u{1F38C}", title: "Star of David colours",
          items: paletteItems(DB.getHexFlags ? DB.getHexFlags() : "combined"),
          equip: id => DB.setHexFlags(id)
        });
      } else {
        out.push({
          key: "spokes", icon: "\u{1F517}", title: "Spoke colours",
          items: paletteItems(DB.getSpokeFlags ? DB.getSpokeFlags() : "combined"),
          equip: id => DB.setSpokeFlags(id)
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
    const total = rows.reduce((n, s) => n + s.items.filter(i => !i.locked).length, 0);

    body.innerHTML = `
      <div class="shop-wallet">
        <div class="sw-balance">\u{1F392} ${total} unlocked</div>
        <p class="settings-hint" style="margin:0.6rem 0 0;">
          Everything you own and can equip — tap anything to put it on, it
          takes effect straight away. Greyed slots are vacant: tap one to
          go to the Shop and fill it.
        </p>
        <button id="btn-inventory-shop" class="btn-ghost" style="margin-top:0.9rem;">\u{1F6D2} Open Shop</button>
      </div>
      ${rows.map(s => `
        <div class="settings-section">
          <div class="stats-section-title">${s.icon} ${s.title}</div>
          <div class="inv-grid">
            ${s.items.map(it => `
              <button type="button" class="inv-chip${it.equipped ? " equipped" : ""}${it.locked ? " vacant" : ""}"
                      data-slot="${s.key}" data-id="${it.id}"${it.locked ? ' data-locked="1"' : ""}
                      title="${it.locked ? `Locked — ${it.price} in the Shop` : it.name}">
                <span class="inv-swatch"${it.swatch ? ` style="${it.swatch}"` : ""}>${it.glyph || ""}</span>
                <span class="inv-name">${it.name}</span>
                ${it.equipped ? `<span class="inv-on">✓</span>` : ""}
                ${it.locked ? `<span class="inv-lock">$${it.price}</span>` : ""}
              </button>`).join("")}
          </div>
        </div>`).join("")}`;

    body.querySelectorAll(".inv-chip").forEach(btn => {
      btn.addEventListener("click", () => {
        if (btn.hasAttribute("data-locked")) { Router.go("store", { cat: "custom" }); return; }
        const slot = rows.find(s => s.key === btn.getAttribute("data-slot"));
        if (!slot) return;
        slot.equip(btn.getAttribute("data-id"));
        renderInventory();   // re-derive rather than patch: equipping a
                             // lobby style can add or remove whole rows
      });
    });

    const shopBtn = body.querySelector("#btn-inventory-shop");
    if (shopBtn) shopBtn.addEventListener("click", () => Router.go("store", { cat: "custom" }));

    showScreen("inventory");
  }

  Object.assign(Dojo, { renderInventory });
})();
