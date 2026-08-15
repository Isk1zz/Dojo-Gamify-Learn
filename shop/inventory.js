// ================================================
// CS Dojo — SHOP / inventory  (the "Custom" screen)
// ------------------------------------------------
// Everything the profile OWNS and can equip, in one place: themes,
// background stripes, lobby style, star links, hexagram flags,
// decorations, scenery, avatars. It took the Statistics tile's slot in
// the lobby (Statistics merged into Career — see shop/shop.js).
//
// ---- Named "Custom" in the UI, `inventory` in the code ----
// As of 2026-08-15 this is THE one place to equip anything: Settings
// used to carry a duplicate set of the same controls, which is exactly
// how paid themes became equippable for free from there — two screens
// writing the same state, only one checking ownership. Shop buys,
// Custom equips, Settings does behaviour. The route id, the file name
// and the DOM ids stay `inventory`: renaming those is churn across
// boot.js/index.html/CSS for no user-visible gain.
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
    // Two different gates, deliberately not merged: the base themes are
    // BOUGHT with $ (Indigo and Frost stay free as the two defaults),
    // while the awarded ones are earned by RANK and can't be bought at
    // all. Both are listed — an awarded theme you haven't reached shows
    // the rank it needs, so the ladder is visible from here.
    const themeNow = DB.getTheme();
    const themeOwned = id => !Dojo.ownsTheme || Dojo.ownsTheme(id);
    const themeItem = (t, awarded) => {
      // Card colour behind a swatch dot, NOT the raw swatch as the whole
      // tile: Frost is a LIGHT theme whose accent happens to be blue, so
      // painting the tile with its accent showed a solid blue block for
      // a white theme (reported). This mirrors what Settings does.
      const unlocked = awarded
        ? (Dojo.themeUnlocked ? Dojo.themeUnlocked(t.id) : false)
        : themeOwned(t.id);
      const rank = awarded && Dojo.Ranks && Dojo.Ranks.themeRank ? Dojo.Ranks.themeRank(t.id) : null;
      return {
        id: t.id,
        name: t.name,
        swatch: `background:${t.card || "var(--bg-surface)"}`,
        glyph: `<span class="inv-dot" style="background:${t.swatch}"></span>`,
        equipped: unlocked && t.id === themeNow,
        locked: !unlocked,
        // Awarded themes are earned, never sold — show the rank instead
        // of a price so the two routes can't be confused.
        price: awarded ? 0 : (t.price || 0),
        req: !unlocked && awarded && rank ? `Rank ${rank.n}` : null,
        preview: true
      };
    };
    out.push({
      key: "theme", group: "theme", icon: "🎨", title: "Colour themes", previewKind: "theme",
      items: (Dojo.THEMES || []).map(t => themeItem(t, false)),
      equip: id => { if (themeOwned(id)) { DB.setTheme(id); Dojo.applyTheme(id); } }
    });
    out.push({
      key: "awarded", group: "theme", icon: "✨", title: "Awarded themes", previewKind: "theme",
      items: (Dojo.PREMIUM_THEMES || []).map(t => themeItem(t, true)),
      equip: id => { if (Dojo.themeUnlocked && Dojo.themeUnlocked(id)) { DB.setTheme(id); Dojo.applyTheme(id); } }
    });

    // ---- Background stripes ----
    const stripeNow = DB.getBgStripe ? DB.getBgStripe() : "none";
    const stripes = (Dojo.BG_STRIPES || [])
      .filter(s => Dojo.bgStripeUnlocked && Dojo.bgStripeUnlocked(s.id));
    out.push({
      key: "stripe", group: "style", icon: "\u{1F9F5}", title: "Background stripes",
      items: [{ id: "none", name: "None", swatch: null, equipped: stripeNow === "none" }]
        .concat(stripes.map(s => ({
          id: s.id, name: s.name, swatch: `background-image:${s.css}`, equipped: s.id === stripeNow
        }))),
      equip: id => { DB.setBgStripe(id); if (Dojo.applyBgStripe) Dojo.applyBgStripe(id); }
    });

    // ---- Lobby style ----
    // Layouts became purchasable, so ownership has to gate EQUIPPING
    // too — otherwise the shop sells what the inventory hands out free.
    // (It did exactly that briefly: clicking an unowned layout here
    // equipped it and left ownership false.)
    const layoutPrice = id => ((Dojo.LAYOUTS || []).find(l => l.id === id) || {}).price || 0;
    const ownsL = id => !Dojo.ownsLayout || Dojo.ownsLayout(id);
    const styleNow = DB.getLobbyStyle();
    out.push({
      key: "lobby", group: "layout", icon: "\u{1F9E9}", title: "Lobby style", previewKind: "lobby",
      items: [["classic", "Classic"], ["cards", "Cards"], ["star", "Star"]]
        .map(([id, name]) => ({
          id, name, swatch: null,
          equipped: ownsL(id) && id === styleNow,
          locked: !ownsL(id), price: layoutPrice(id)
        })),
      equip: id => { if (ownsL(id)) DB.setLobbyStyle(id); }
    });

    // ---- Star links + hexagram flags ----
    // Only worth showing while the Star lobby is equipped — they do
    // nothing in Classic or Cards, and an inventory full of inert rows
    // is noise.
    if (styleNow === "star") {
      const linksNow = DB.getStarLinks ? DB.getStarLinks() : "spokes";
      out.push({
        key: "links", group: "layout", icon: "\u{1F517}", title: "Star links", previewKind: "links",
        items: [["spokes", "Spokes"], ["hexagram", "Star of David"]]
          .map(([id, name]) => ({
            id, name, swatch: null,
            equipped: ownsL(id) && id === linksNow,
            locked: !ownsL(id), price: layoutPrice(id)
          })),
        equip: id => { if (ownsL(id)) DB.setStarLinks(id); }
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
          key: "flags", group: "style", icon: "\u{1F38C}", title: "Star of David colours", previewKind: "flags",
          items: paletteItems(DB.getHexFlags ? DB.getHexFlags() : "combined"),
          equip: id => DB.setHexFlags(id)
        });
      } else {
        out.push({
          key: "spokes", group: "style", icon: "\u{1F517}", title: "Spoke colours", previewKind: "spokes",
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
        key: "avatar", group: "theme", icon: "\u{1F464}", title: "Avatars",
        items: owned.map(id => {
          const a = table.find(x => x.id === id);
          return { id, name: a ? a.name : id, glyph: a ? a.icon : "?", swatch: null,
                   equipped: id === equippedAvatar };
        }),
        equip: id => { DB.setAvatar(id); if (Dojo.updateProfileBadge) Dojo.updateProfileBadge(); }
      });
    }

    // ---- Lobby decorations ----
    // `multi: true` — unlike every other slot, more than one item can
    // be equipped at once (Stars AND Eagles together), so `equipped`
    // means "currently toggled on," not "the one active choice."
    const activeDecors = DB.getBgDecors ? DB.getBgDecors() : [];
    out.push({
      key: "decor", group: "style", icon: "\u{1F985}", title: "Decorations", previewKind: "decor", multi: true,
      items: (Dojo.BG_DECORS || []).map(d => {
        // Moon reads as "Sun" on a light theme — see Dojo.decorFace.
        const face = Dojo.decorFace ? Dojo.decorFace(d) : d;
        return {
          id: d.id, name: face.name, glyph: face.icon, swatch: null,
          equipped: activeDecors.includes(d.id),
          locked: !(Dojo.ownsDecor && Dojo.ownsDecor(d.id)),
          price: d.price
        };
      }),
      equip: id => {
        if (!Dojo.ownsDecor || !Dojo.ownsDecor(id)) return;
        DB.toggleBgDecor(id);
        if (Dojo.applyBgDecors) Dojo.applyBgDecors(DB.getBgDecors());
      }
    });

    // ---- Sky ----
    // Day/night as a scene you equip, not a side effect of the theme.
    // Free and always available: it's a time of day, not merchandise.
    // The vitals-strip button flips this same state.
    const skyNow = DB.getSky ? DB.getSky() : "night";
    out.push({
      key: "sky", group: "style", icon: "\u{1F304}", title: "Sky",
      items: [
        { id: "night", name: "Night", glyph: "\u{1F319}", swatch: null, equipped: skyNow === "night" },
        { id: "day",   name: "Day",   glyph: "☀\u{FE0F}", swatch: null, equipped: skyNow === "day" }
      ],
      equip: id => { if (Dojo.setSky) Dojo.setSky(id); }
    });

    // ---- Scenery ----
    // Single-select, so "None" is a real listed option here (it is on
    // the stripe slot too) — otherwise there'd be no way to take a
    // scene back off once one is equipped.
    const sceneNow = DB.getScene ? DB.getScene() : "none";
    const ownsSc = id => !Dojo.ownsScene || Dojo.ownsScene(id);
    out.push({
      key: "scene", group: "style", icon: "\u{1F3DE}\u{FE0F}", title: "Scenery", previewKind: "scene",
      items: [{ id: "none", name: "None", glyph: "\u{2715}", swatch: null, equipped: sceneNow === "none" }]
        .concat((Dojo.SCENES || []).map(s => ({
          id: s.id, name: s.name, glyph: s.icon, swatch: null,
          equipped: ownsSc(s.id) && s.id === sceneNow,
          locked: !ownsSc(s.id), price: s.price
        }))),
      equip: id => {
        if (!ownsSc(id)) return;
        DB.setScene(id);
        if (Dojo.applyScene) Dojo.applyScene(id);
      }
    });

    return out;
  }

  // ---- Tree ----
  // Three branches, as asked: what the lobby IS (layout), how it's
  // dressed (style), and the app-wide palette (colour theme). Each
  // branch holds the slots tagged with its group above, so adding a
  // slot never means editing the tree.
  const BRANCHES = [
    { id: "layout", icon: "🧩", label: "Layout" },
    { id: "style",  icon: "🎨", label: "Style" },
    { id: "theme",  icon: "🌈", label: "Colour theme" }
  ];
  let activeSlot = null;

  // ---- Preview of unowned things ----
  // Clicking a locked tile no longer jumps straight to the Shop — it
  // previews instead, same idea as Settings' locked-theme preview. What
  // "preview" means differs by kind: a theme repaints the whole app's
  // CSS vars (Dojo.previewTheme, exactly what Settings already does); a
  // layout/links/palette has no such global hook, so it's shown in the
  // mini lobby preview panel on the right instead. Either way nothing
  // is written to DB until it's bought and equipped for real.
  let preview = null; // { kind: "theme"|"lobby"|"links"|"flags"|"spokes"|"decor", id, name, price }

  function clearPreview() {
    if (preview && preview.kind === "theme" && Dojo.applyTheme) Dojo.applyTheme(DB.getTheme());
    if (preview && preview.kind === "decor" && Dojo.applyBgDecors) Dojo.applyBgDecors(DB.getBgDecors ? DB.getBgDecors() : []);
    if (preview && preview.kind === "scene" && Dojo.applyScene) Dojo.applyScene(DB.getScene ? DB.getScene() : "none");
    preview = null;
  }

  // ---- Live preview ----
  // A miniature of the actual lobby, redrawn on every equip so you can
  // see what a choice does before leaving the screen. Deliberately its
  // own small geometry rather than a scaled clone of core/lobby.js's
  // ring: that one measures a real container and drives real hit
  // targets, and borrowing it for a 150px thumbnail would tie a
  // decorative preview to layout code that has already had two
  // pointer/measurement bugs.
  function previewHtml() {
    const style = preview && preview.kind === "lobby" ? preview.id : DB.getLobbyStyle();
    const links = preview && preview.kind === "links" ? preview.id
      : (DB.getStarLinks ? DB.getStarLinks() : "spokes");
    const FLAGS = Dojo.HEX_FLAGS || {};
    const MODES = Dojo.HEX_FLAG_MODES || {};
    const paletteOf = mode => (MODES[mode] || []).map(id => FLAGS[id]).filter(Boolean);

    if (style !== "star") {
      const rows = style === "cards" ? 3 : 4;
      return `<div class="inv-prev-stack${style === "cards" ? " cards" : ""}">${
        Array.from({ length: rows }, () => `<span></span>`).join("")}</div>`;
    }

    const n = 6, r = 34, cx = 50, cy = 50;
    const pt = i => {
      const d = (-90 + i * (360 / n)) * Math.PI / 180;
      return [cx + r * Math.cos(d), cy + r * Math.sin(d)];
    };
    let out = "";
    if (links === "hexagram") {
      const flagsNow = preview && preview.kind === "flags" ? preview.id
        : (DB.getHexFlags ? DB.getHexFlags() : "combined");
      const pair = paletteOf(flagsNow);
      for (let i = 0; i < n; i++) {
        const [x1, y1] = pt(i), [x2, y2] = pt((i + 2) % n);
        const f = pair[i % 2] || pair[0];
        const col = f ? f.stops[Math.floor(f.stops.length / 2)][1] : "#888";
        out += `<line x1="${x1.toFixed(1)}" y1="${y1.toFixed(1)}" x2="${x2.toFixed(1)}" y2="${y2.toFixed(1)}" stroke="${col}" stroke-width="2.4" stroke-linecap="round"/>`;
      }
    } else {
      const spokesNow = preview && preview.kind === "spokes" ? preview.id
        : (DB.getSpokeFlags ? DB.getSpokeFlags() : "combined");
      const pal = paletteOf(spokesNow)
        .flatMap(f => f.stops.map(x => x[1]));
      const uniq = [...new Set(pal)];
      for (let i = 0; i < n; i++) {
        const [x, y] = pt(i);
        const col = uniq.length ? uniq[i % uniq.length] : "#888";
        out += `<line x1="${cx}" y1="${cy}" x2="${x.toFixed(1)}" y2="${y.toFixed(1)}" stroke="${col}" stroke-width="2" stroke-linecap="round" opacity="0.9"/>`;
      }
    }
    for (let i = 0; i < n; i++) {
      const [x, y] = pt(i);
      out += `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="7" fill="var(--bg-card)" stroke="var(--border-accent)"/>`;
    }
    out += `<circle cx="${cx}" cy="${cy}" r="8" fill="var(--accent-glow)" stroke="var(--border-accent)"/>`;
    return `<svg viewBox="0 0 100 100" class="inv-prev-svg">${out}</svg>`;
  }


  function renderInventory() {
    const body = document.getElementById("inventory-body");
    if (!body) return;

    const rows = slots();
    if (!rows.some(r => r.key === activeSlot)) activeSlot = rows.length ? rows[0].key : null;
    const slot = rows.find(r => r.key === activeSlot);
    const owned = rows.reduce((n, s) => n + s.items.filter(i => !i.locked).length, 0);

    const tree = BRANCHES.map(b => {
      const kids = rows.filter(r => r.group === b.id);
      if (!kids.length) return "";
      return `
        <div class="inv-branch">
          <div class="inv-branch-title">${b.icon} ${b.label}</div>
          ${kids.map(k => `
            <button type="button" class="inv-leaf${k.key === activeSlot ? " active" : ""}" data-slot-nav="${k.key}">
              <span>${k.title}</span>
              <span class="inv-leaf-count">${k.items.filter(i => !i.locked).length}</span>
            </button>`).join("")}
        </div>`;
    }).join("");

    const equipped = slot ? slot.items.find(i => i.equipped) : null;
    const equippedList = slot && slot.multi ? slot.items.filter(i => i.equipped) : [];
    const grid = slot ? slot.items.map(it => `
      <button type="button" class="inv-tile${it.equipped ? " equipped" : ""}${it.locked ? " vacant" : ""}"
              data-id="${it.id}"${it.locked ? ' data-locked="1"' : ' draggable="true"'}
              title="${it.locked ? (it.req ? `Locked — reach ${it.req}` : `Locked — ${it.price} in the Shop`) : it.name}">
        <span class="inv-tile-art"${it.swatch ? ` style="${it.swatch}"` : ""}>${it.glyph || ""}</span>
        <span class="inv-tile-name">${it.name}</span>
        ${it.equipped ? `<span class="inv-tile-on">✓</span>` : ""}
        ${it.locked ? `<span class="inv-tile-lock">${it.req ? it.req : "$" + it.price}</span>` : ""}
      </button>`).join("") : "";

    body.innerHTML = `
      <div class="inv-layout">
        <nav class="inv-tree">
          <div class="inv-owned-count">🎒 ${owned} unlocked</div>
          ${tree}
          <button id="btn-inventory-shop" class="btn-ghost inv-shop-btn">🛒 Shop</button>
        </nav>
        <div class="inv-main">
          <div class="inv-dropzone${(slot && slot.multi ? equippedList.length : equipped) ? " filled" : ""}" id="inv-dropzone">
            <div class="inv-dropzone-label">${slot ? slot.title : ""} — ${slot && slot.multi ? "on" : "equipped"}</div>
            <div class="inv-dropzone-slot${slot && slot.multi ? " multi" : ""}">
              ${slot && slot.multi
                ? (equippedList.length
                    ? equippedList.map(it => `<span class="inv-dropzone-chip"><span class="inv-tile-art"${it.swatch ? ` style="${it.swatch}"` : ""}>${it.glyph || ""}</span><span>${it.name}</span></span>`).join("")
                    : `<span class="inv-dropzone-hint">Click an owned tile to switch it on</span>`)
                : (equipped
                    ? `<span class="inv-tile-art"${equipped.swatch ? ` style="${equipped.swatch}"` : ""}>${equipped.glyph || ""}</span><span>${equipped.name}</span>`
                    : `<span class="inv-dropzone-hint">Drag something here to wear it</span>`)}
            </div>
          </div>
          <div class="inv-tile-grid">${grid}</div>
        </div>
        <aside class="inv-preview" aria-label="Live lobby preview">
          <div class="inv-preview-title">Preview</div>
          <div class="inv-preview-art">${previewHtml()}</div>
          ${preview ? `
            <div class="inv-preview-banner">
              <div class="inv-preview-banner-text">Previewing "${preview.name}" — not yours</div>
              <div class="inv-preview-banner-row">
                ${preview.req
                  ? `<span class="inv-preview-banner-hint">Reach ${preview.req}</span>`
                  : `<button type="button" class="btn-ghost" id="inv-preview-buy">Buy — $${preview.price}</button>`}
                <button type="button" class="btn-ghost" id="inv-preview-clear">✕ Restore</button>
              </div>
            </div>` : ""}
        </aside>
      </div>`;

    body.querySelectorAll("[data-slot-nav]").forEach(btn => {
      btn.addEventListener("click", () => {
        clearPreview();
        activeSlot = btn.getAttribute("data-slot-nav");
        renderInventory();
      });
    });

    // Equip = click OR drag-onto-the-slot. Click stays first-class: drag
    // is unavailable on touch without a bespoke pointer implementation,
    // so making it the only way to equip would lock phones out entirely.
    //
    // A LOCKED tile previews instead of equipping — it doesn't jump to
    // the Shop anymore, since "I want to see what this looks like" and
    // "I want to buy this" turned out to be two different clicks. The
    // preview banner below is the one place that still offers the Shop.
    function apply(id, locked) {
      if (!slot) return;
      if (locked) {
        const it = slot.items.find(x => x.id === id);
        if (it && slot.previewKind) {
          if (slot.previewKind === "theme" && Dojo.previewTheme) Dojo.previewTheme(id);
          if (slot.previewKind === "decor" && Dojo.applyBgDecors) {
            const active = DB.getBgDecors ? DB.getBgDecors() : [];
            Dojo.applyBgDecors(active.concat(id));
          }
          if (slot.previewKind === "scene" && Dojo.applyScene) Dojo.applyScene(id);
          preview = { kind: slot.previewKind, id, name: it.name, price: it.price, req: it.req };
          renderInventory();
        }
        return;
      }
      clearPreview();
      slot.equip(id);
      renderInventory();
    }

    body.querySelectorAll(".inv-tile").forEach(tile => {
      tile.addEventListener("click", () => apply(tile.getAttribute("data-id"), tile.hasAttribute("data-locked")));
      tile.addEventListener("dragstart", e => {
        e.dataTransfer.setData("text/plain", tile.getAttribute("data-id"));
        e.dataTransfer.effectAllowed = "move";
        tile.classList.add("dragging");
      });
      tile.addEventListener("dragend", () => tile.classList.remove("dragging"));
    });

    const previewBuyBtn = body.querySelector("#inv-preview-buy");
    if (previewBuyBtn) previewBuyBtn.addEventListener("click", () => Router.go("store", { cat: "custom" }));
    const previewClearBtn = body.querySelector("#inv-preview-clear");
    if (previewClearBtn) previewClearBtn.addEventListener("click", () => { clearPreview(); renderInventory(); });

    const zone = body.querySelector("#inv-dropzone");
    if (zone) {
      // preventDefault on dragover is what makes an element a valid drop
      // target at all — without it the browser refuses the drop and the
      // handler below never runs.
      zone.addEventListener("dragover", e => { e.preventDefault(); zone.classList.add("over"); });
      zone.addEventListener("dragleave", () => zone.classList.remove("over"));
      zone.addEventListener("drop", e => {
        e.preventDefault();
        zone.classList.remove("over");
        const id = e.dataTransfer.getData("text/plain");
        if (id) apply(id, (slot && slot.items.find(x => x.id === id) || {}).locked);
      });
    }

    const shopBtn = body.querySelector("#btn-inventory-shop");
    if (shopBtn) shopBtn.addEventListener("click", () => Router.go("store", { cat: "custom" }));

    // Leaving mid-preview must not carry a never-bought theme out to the
    // rest of the app — same guard Settings uses on its own back button.
    // Bound once: this button lives outside #inventory-body and survives
    // every re-render, so re-binding on each render would stack handlers.
    const backBtn = document.getElementById("btn-back-inventory");
    if (backBtn && !backBtn.dataset.previewGuard) {
      backBtn.dataset.previewGuard = "1";
      backBtn.addEventListener("click", () => clearPreview(), true);
    }

    showScreen("inventory");
  }

  Object.assign(Dojo, { renderInventory });
})();
