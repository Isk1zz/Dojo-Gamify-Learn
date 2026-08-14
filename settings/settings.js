// ================================================
// CS Dojo — SETTINGS
// ------------------------------------------------
// Theme picking (owned themes only), data export/import, the admin
// code box, and the legal placeholders. Owns no game data.
// ================================================

(() => {
  // ---- seam: everything this branch borrows from elsewhere ----
  // Late-bound on purpose. A branch may be loaded before the branch
  // it calls into, so these resolve at call time, not at load time.
  const THEMES = Dojo.THEMES;
  const PREMIUM_THEMES = Dojo.PREMIUM_THEMES;
  const BG_STRIPES = Dojo.BG_STRIPES || [];
  const showScreen = Dojo.showScreen;
  const Router = Dojo.Router;
  const Bus = Dojo.Bus;
  const applyTheme = (...a) => Dojo.applyTheme(...a);
  // btn-back-lobby3 lives in the static topbar, outside #settings-body,
  // so it survives every re-render — bind the preview-cleanup listener
  // to it once, ever, instead of stacking a new one per visit.
  let backBtnBound = false;
  let previewing = false;
  const renderShop = (...a) => Dojo.renderShop(...a);
  const renderCharge = (...a) => Dojo.renderCharge(...a);
  const updateProfileBadge = (...a) => Dojo.updateProfileBadge(...a);
  const showLobby = (...a) => Dojo.showLobby(...a);

  // ---- Settings ----
  function renderSettings() {
    const body = document.getElementById("settings-body");
    const current = DB.getTheme();
    const owned = PREMIUM_THEMES.filter(t => Dojo.themeUnlocked(t.id));
    const lockedThemes = PREMIUM_THEMES.filter(t => !Dojo.themeUnlocked(t.id));
    const locked = lockedThemes.length;
    const lobbyStyle = DB.getLobbyStyle ? DB.getLobbyStyle() : "classic";
    const hintsOn = DB.getHintsEnabled ? DB.getHintsEnabled() : true;
    const soundOn = DB.getSoundEnabled ? DB.getSoundEnabled() : true;
    const currentStripe = DB.getBgStripe ? DB.getBgStripe() : "none";

    const swatch = t => `
      <button class="theme-swatch${t.id === current ? " active" : ""}"
              data-theme="${t.id}" style="--sw:${t.swatch};--sw-bg:${t.card}">
        <span class="sw-preview"><span class="sw-dot"></span></span>
        <span class="sw-name">${t.name}</span>
      </button>`;

    // Locked themes get a preview instead of a select — clicking paints
    // the app in that theme without unlocking or persisting anything
    // (Dojo.previewTheme skips the rank gate on purpose). The rank
    // needed comes from Dojo.Ranks.themeRank, same lookup the reward
    // list elsewhere in the app uses.
    const lockedSwatch = t => {
      const r = Dojo.Ranks && Dojo.Ranks.themeRank ? Dojo.Ranks.themeRank(t.id) : null;
      return `
      <button class="theme-swatch locked" data-preview-theme="${t.id}"
              style="--sw:${t.swatch};--sw-bg:${t.card}">
        <span class="sw-preview"><span class="sw-dot"></span><span class="sw-lock">\u{1F512}</span></span>
        <span class="sw-name">${t.name}</span>
        ${r ? `<span class="sw-req">Rank ${r.n} · ${r.abbr}</span>` : ""}
      </button>`;
    };

    // Bars preview for classic/cards — "cards" just draws them elevated
    // and rounded, so the thumbnail itself demonstrates the re-skin
    // rather than describing it. Star gets a matching hub-and-spoke
    // preview instead, built with the same angle formula core/lobby.js
    // uses for the real tiles (six stand-ins, not the real tile count —
    // this is just a thumbnail).
    const barsPreview = cardLike => `
      <span class="style-preview">
        ${Array.from({ length: 3 }, () => `<span class="spb${cardLike ? " spb-card" : ""}"></span>`).join("")}
      </span>`;
    const starPreview = () => {
      const n = 6, r = 15, cx = 22, cy = 22;
      let dots = "";
      for (let i = 0; i < n; i++) {
        const deg = -90 + i * (360 / n);
        const x = cx + r * Math.cos(deg * Math.PI / 180);
        const y = cy + r * Math.sin(deg * Math.PI / 180);
        dots += `<span class="rp-line" style="left:${cx}px;top:${cy}px;width:${r}px;transform:rotate(${deg}deg);"></span>`;
        dots += `<span class="rp-dot" style="left:${x.toFixed(1)}px;top:${y.toFixed(1)}px;"></span>`;
      }
      return `<span class="style-preview-radial"><span class="rp-hub"></span>${dots}</span>`;
    };
    // Background stripes: a separate, rank-gated overlay independent of
    // colour theme (see shop/themes.js's BG_STRIPES + shop/ranks.js's
    // reward.bgStripe). "None" is always available and isn't in the
    // data list, so it's synthesized here as the first swatch.
    const stripeSwatch = s => {
      const unlocked = Dojo.bgStripeUnlocked ? Dojo.bgStripeUnlocked(s.id) : false;
      const r = Dojo.Ranks && Dojo.Ranks.bgStripeRank ? Dojo.Ranks.bgStripeRank(s.id) : null;
      return `
      <button class="style-swatch stripe-swatch${!unlocked ? " locked" : ""}${s.id === currentStripe ? " active" : ""}"
              ${unlocked ? `data-bg-stripe="${s.id}"` : "disabled"}>
        <span class="stripe-preview" style="background-image:${s.css};"></span>
        <span class="sw-name">${s.name}${!unlocked ? " \u{1F512}" : ""}</span>
        ${!unlocked && r ? `<span class="sw-req">Rank ${r.n} · ${r.abbr}</span>` : ""}
      </button>`;
    };
    const noneStripeSwatch = `
      <button class="style-swatch stripe-swatch${currentStripe === "none" ? " active" : ""}" data-bg-stripe="none">
        <span class="stripe-preview"></span>
        <span class="sw-name">None</span>
      </button>`;

    const lobbyStyleSwatch = (id, name, kind) => `
      <button class="style-swatch${id === lobbyStyle ? " active" : ""}" data-lobby-style="${id}">
        ${kind === "star" ? starPreview() : barsPreview(kind === "cards")}
        <span class="sw-name">${name}</span>
      </button>`;

    // Same 6 dots as starPreview, wired the other way: each node joined
    // to the one two places around, which closes two triangles. Edge i
    // belongs to triangle {0,2,4} when i is even and {1,3,5} when odd,
    // which is what lets each triangle be painted its own flag here the
    // same way core/lobby.js paints the real one.
    const hexPreview = (flagA, flagB) => {
      const n = 6, r = 15, cx = 22, cy = 22;
      const pt = i => {
        const d = (-90 + i * (360 / n)) * Math.PI / 180;
        return [cx + r * Math.cos(d), cy + r * Math.sin(d)];
      };
      let out = "";
      for (let i = 0; i < n; i++) {
        const [x1, y1] = pt(i), [x2, y2] = pt((i + 2) % n);
        const len = Math.hypot(x2 - x1, y2 - y1);
        const deg = Math.atan2(y2 - y1, x2 - x1) * 180 / Math.PI;
        const paint = i % 2 === 0 ? flagA : flagB;
        out += `<span class="rp-line" style="left:${x1.toFixed(1)}px;top:${y1.toFixed(1)}px;width:${len.toFixed(1)}px;transform:rotate(${deg.toFixed(1)}deg);${paint ? `background:${paint};height:2px;` : ""}"></span>`;
      }
      for (let i = 0; i < n; i++) {
        const [x, y] = pt(i);
        out += `<span class="rp-dot" style="left:${x.toFixed(1)}px;top:${y.toFixed(1)}px;"></span>`;
      }
      return `<span class="style-preview-radial">${out}</span>`;
    };

    // Read from core/lobby.js rather than restating the palettes — one
    // definition of each flag, so a colour tweak there can't leave the
    // Settings swatch showing a flag the ring no longer paints.
    const FLAGS = Dojo.HEX_FLAGS || {};
    const FLAG_MODES = Dojo.HEX_FLAG_MODES || {};
    const hexFlags = DB.getHexFlags ? DB.getHexFlags() : "combined";
    // Label comes from core/lobby.js's table so the name and the flags
    // it shows can't drift apart.
    const FLAG_LABELS = Dojo.HEX_FLAG_LABELS || {};
    const flagSwatch = id => {
      const pair = FLAG_MODES[id] || [];
      const barOf = k => (FLAGS[pair[k]] || {}).bar || "";
      return `
        <button class="style-swatch${id === hexFlags ? " active" : ""}" data-hex-flags="${id}">
          ${hexPreview(barOf(0), barOf(1))}
          <span class="sw-name">${FLAG_LABELS[id] || id}</span>
        </button>`;
    };

    const starLinks = DB.getStarLinks ? DB.getStarLinks() : "spokes";
    const linkSwatch = (id, name) => `
      <button class="style-swatch${id === starLinks ? " active" : ""}" data-star-links="${id}">
        ${id === "hexagram" ? hexPreview() : starPreview()}

        <span class="sw-name">${name}</span>
      </button>`;

    body.innerHTML = `
      <div class="settings-section">
        <div class="stats-section-title">\u{1F3A8} Colour theme</div>
        <p class="settings-hint">Changes the whole app, not just the accent.</p>
        <div class="theme-grid">
          ${THEMES.map(swatch).join("")}
        </div>
      </div>
      <div class="settings-section">
        <div class="stats-section-title">\u2728 Awarded themes</div>
        <p class="settings-hint">
          ${owned.length
            ? `${owned.length} unlocked.`
            : "None unlocked yet."}
          ${locked ? `${locked} more are waiting further up the rank ladder — tap one to preview it.` : "You have them all."}
        </p>
        ${owned.length ? `<div class="theme-grid">${owned.map(swatch).join("")}</div>` : ""}
        ${locked ? `<div class="theme-grid" style="margin-top:${owned.length ? "0.7rem" : "0"};">${lockedThemes.map(lockedSwatch).join("")}</div>` : ""}
        <div id="theme-preview-bar" class="theme-preview-bar" style="display:none;">
          <span id="theme-preview-label"></span>
          <button id="btn-restore-theme" class="btn-ghost">↩ Restore my theme</button>
        </div>
        <button id="btn-settings-shop" class="btn-ghost" style="margin-top:0.9rem;">\u{1F396} Open Career</button>
      </div>
      <div class="settings-section">
        <div class="stats-section-title">\u{1F9E9} Lobby style</div>
        <p class="settings-hint">A re-skin of the Lobby tiles — same six, same order, just a different look.</p>
        <div class="lobby-style-grid">
          ${lobbyStyleSwatch("classic", "Classic", "classic")}
          ${lobbyStyleSwatch("cards", "Cards", "cards")}
          ${lobbyStyleSwatch("star", "Star", "star")}
        </div>
      </div>
      <div class="settings-section">
        <div class="stats-section-title">\u{1F517} Star links</div>
        <p class="settings-hint">How the Star layout wires its tiles together. Star of David joins every other tile into two triangles — it needs exactly six tiles, so it falls back to spokes while the Resume tile is showing.</p>
        <div class="lobby-style-grid">
          ${linkSwatch("spokes", "Spokes")}
          ${linkSwatch("hexagram", "Star of David")}
        </div>
      </div>
      <div class="settings-section">
        <div class="stats-section-title">\u{1F38C} Star of David colours</div>
        <p class="settings-hint">Which flag each of the two triangles wears. Combined flies Ukraine on one and Israel on the other; the rest fly one flag on both. Only applies while Star links is set to Star of David.</p>
        <div class="lobby-style-grid">
          ${Object.keys(FLAG_MODES).map(id => flagSwatch(id)).join("")}
        </div>
      </div>
      <div class="settings-section">
        <div class="stats-section-title">\u{1F9F5} Background stripes</div>
        <p class="settings-hint">A subtle overlay pattern, layered under your colour theme. Earned by rank, separate from themes.</p>
        <div class="lobby-style-grid">
          ${noneStripeSwatch}
          ${BG_STRIPES.map(stripeSwatch).join("")}
        </div>
      </div>
      <div class="settings-section">
        <div class="stats-section-title">\u{1F4A1} Hints</div>
        <p class="settings-hint">The small explainer text under section titles across the app — like this one.</p>
        <label class="hint-toggle-row">
          <input type="checkbox" id="hints-toggle" ${hintsOn ? "checked" : ""} />
          <span>Show hints</span>
        </label>
      </div>
      <div class="settings-section">
        <div class="stats-section-title">\u{1F50A} Sound</div>
        <p class="settings-hint">Short synthesized click/answer/reward sounds across the app — no audio files, generated on the fly.</p>
        <label class="hint-toggle-row">
          <input type="checkbox" id="sound-toggle" ${soundOn ? "checked" : ""} />
          <span>Sound effects</span>
        </label>
      </div>
      <div class="settings-section">
        <div class="stats-section-title">\u{1F511} Unlock code</div>
        <p class="settings-hint">See <code>docs/CHEATCODES.md</code>.</p>
        <div class="admin-row">
          <input id="admin-code-input" class="modal-input admin-input" type="text"
                 placeholder="Enter code..." autocomplete="off" spellcheck="false" />
          <button id="btn-admin-apply" class="btn-ghost">Apply</button>
        </div>
        <div id="admin-msg" class="settings-hint" style="margin-top:0.5rem;"></div>
      </div>
      <div class="settings-section">
        <div class="stats-section-title">\u{1F4C4} Legal</div>
        <details class="legal-block">
          <summary>Privacy Policy</summary>
          <p><strong>Nothing you do here leaves your device.</strong></p>
          <p>Your profile, progress, review schedule, statistics and settings are
          stored in this browser's local storage. There is no account, no server,
          no analytics and no third-party service of any kind \u2014 there is nowhere
          for your data to be sent, because the app doesn't talk to anything.</p>
          <p>Nobody but you can see it, including us. Export Data writes a file you
          control; Import Data reads one. Deleting a profile, or clearing this
          site's data in your browser, erases it permanently \u2014 there is no copy
          anywhere else and no way to recover it.</p>
        </details>
        <details class="legal-block">
          <summary>Terms of Service</summary>
          <p><em>Draft. Being reviewed before any paid release.</em></p>
          <p>CS Dojo is provided as-is, with no warranty. It is a study aid, not
          accredited instruction, and passing a mastery exam here is not a
          qualification. Course material is written to be accurate and carries its
          sources so you can check it, but mistakes are possible \u2014 don't rely on
          it as your only source for anything that matters.</p>
          <p>The course content is not yours to redistribute or resell. Your own
          exported data is entirely yours.</p>
          <p>The arcade uses in-app money only. It cannot be bought with real money
          and cannot be cashed out.</p>
        </details>
      </div>
      <div class="settings-section">
        <div class="stats-section-title">\u{1F4BE} Your data</div>
        <p class="settings-hint">Progress is stored in this browser only. Export before clearing browser data or switching machines.</p>
        <div class="stats-actions">
          <button id="btn-export-2" class="btn-ghost">\u{1F4E5} Export Data</button>
          <label class="btn-ghost import-label">
            \u{1F4E4} Import Data
            <input type="file" id="btn-import-2" accept=".json" style="display:none;" />
          </label>
        </div>
      </div>`;

    body.querySelectorAll(".theme-swatch:not(.locked)").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-theme");
        DB.setTheme(id);
        applyTheme(id);
        body.querySelectorAll(".theme-swatch").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        hidePreviewBar();
      });
    });

    // Locked themes: preview only, never selects or persists. The bar
    // stays up until the user restores or picks a real (owned) theme —
    // whichever comes first — so a preview never quietly outlives the
    // visit.
    const previewBar = document.getElementById("theme-preview-bar");
    const previewLabel = document.getElementById("theme-preview-label");
    function hidePreviewBar() {
      previewing = false;
      if (previewBar) previewBar.style.display = "none";
    }
    body.querySelectorAll("[data-preview-theme]").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-preview-theme");
        Dojo.previewTheme(id);
        previewing = true;
        if (previewBar && previewLabel) {
          previewLabel.textContent = `Previewing "${btn.querySelector(".sw-name").textContent}"`;
          previewBar.style.display = "flex";
        }
      });
    });
    const restoreBtn = document.getElementById("btn-restore-theme");
    if (restoreBtn) restoreBtn.addEventListener("click", () => {
      applyTheme(DB.getTheme());
      hidePreviewBar();
    });

    // Leaving Settings mid-preview (the Lobby back button, not the
    // restore button above) must not carry a never-bought theme along
    // to the rest of the app — capture-phase so this runs before
    // boot.js's own listener on the same button. Bound once, ever: this
    // button lives outside #settings-body and survives every re-render.
    const backBtn = document.getElementById("btn-back-lobby3");
    if (backBtn && !backBtnBound) {
      backBtnBound = true;
      backBtn.addEventListener("click", () => {
        if (previewing) { applyTheme(DB.getTheme()); previewing = false; }
      }, true);
    }

    const hintsToggle = document.getElementById("hints-toggle");
    if (hintsToggle) hintsToggle.addEventListener("change", () => {
      DB.setHintsEnabled(hintsToggle.checked);
      if (Dojo.applyHints) Dojo.applyHints(hintsToggle.checked);
    });

    const soundToggle = document.getElementById("sound-toggle");
    if (soundToggle) soundToggle.addEventListener("change", () => {
      DB.setSoundEnabled(soundToggle.checked);
      if (Dojo.applySoundEnabled) Dojo.applySoundEnabled(soundToggle.checked);
      if (soundToggle.checked && Dojo.sfx) Dojo.sfx.click();
    });

    body.querySelectorAll("[data-bg-stripe]").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-bg-stripe");
        DB.setBgStripe(id);
        if (Dojo.applyBgStripe) Dojo.applyBgStripe(id);
        body.querySelectorAll(".stripe-swatch").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
      });
    });

    body.querySelectorAll("[data-hex-flags]").forEach(btn => {
      btn.addEventListener("click", () => {
        DB.setHexFlags(btn.getAttribute("data-hex-flags"));
        body.querySelectorAll("[data-hex-flags]").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
      });
    });

    body.querySelectorAll("[data-star-links]").forEach(btn => {
      btn.addEventListener("click", () => {
        DB.setStarLinks(btn.getAttribute("data-star-links"));
        body.querySelectorAll("[data-star-links]").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
      });
    });

    body.querySelectorAll("[data-lobby-style]").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-lobby-style");
        DB.setLobbyStyle(id);
        body.querySelectorAll("[data-lobby-style]").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        // Lobby reads DB.getLobbyStyle() itself next time it renders —
        // nothing to push there now, same as a theme choice not
        // repainting a screen you're not on.
      });
    });


    // Codes come from settings/codes.js, which is GITIGNORED and not
    // deployed. If the file isn't there, window.DOJO_CODES is undefined,
    // the whole section hides, and the code strings are nowhere in the
    // shipped JS to be found.
    //
    // This is the only way to actually hide them. A private repo hides
    // the source, not the site: Pages serves this file to everyone, and
    // devtools reads it. The fix is not shipping the strings at all.
    const CODES = window.DOJO_CODES ? window.DOJO_CODES(DB, Dojo) : null;

    const applyBtn = document.getElementById("btn-admin-apply");
    const codeInput = document.getElementById("admin-code-input");
    const msg = document.getElementById("admin-msg");
    function applyCode() {
      const val = (codeInput.value || "").trim();
      // Local dev codes (settings/codes.js) first — gitignored, so this
      // is `null` on the deployed site and the branch never runs there.
      const fn = CODES ? CODES[val] : null;
      if (fn) {
        const result = fn();
        codeInput.value = "";
        msg.textContent = result;
        if (Dojo.renderVitals) Dojo.renderVitals();
        return;
      }
      // The codes that ship everywhere — see data/db.js's ADMIN_CODES /
      // applyAdminCode. Checked second so a local dev code with the
      // same text (there isn't one, but if there ever were) still wins.
      // Returns the message to show, or null for "not a valid code" —
      // this file doesn't need to know which code matched.
      const adminMsg = DB.applyAdminCode(val);
      if (adminMsg) {
        if (Dojo.renderVitals) Dojo.renderVitals();
        if (Dojo.updateProfileBadge) Dojo.updateProfileBadge();
        // XP (and therefore rank, and every rank-gated theme/stripe
        // reward) just changed — the charge bar reads DB.getXp() fresh,
        // but nothing repaints it on its own outside the normal
        // award-XP flow.
        if (Dojo.renderCharge) Dojo.renderCharge();
        // Full re-render so the theme/stripe grids immediately reflect
        // the new unlock state — re-fetch admin-msg after, since this
        // tears down and rebuilds every element in the body, including
        // the one `msg` currently points at.
        renderSettings();
        const freshMsg = document.getElementById("admin-msg");
        if (freshMsg) freshMsg.textContent = adminMsg;
        return;
      }
      msg.textContent = "Not a valid code.";
    }
    if (applyBtn) applyBtn.addEventListener("click", applyCode);
    if (codeInput) codeInput.addEventListener("keydown", e => { if (e.key === "Enter") applyCode(); });

    const shopBtn = document.getElementById("btn-settings-shop");
    if (shopBtn) shopBtn.addEventListener("click", renderShop);

    const exp = document.getElementById("btn-export-2");
    if (exp) exp.addEventListener("click", () => DB.exportData());
    const imp = document.getElementById("btn-import-2");
    if (imp) imp.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (!file) return;
      DB.importData(file).then(() => {
        applyTheme(DB.getTheme());
        renderCharge();
        updateProfileBadge();
        showLobby();
      }).catch(() => alert("Could not read that file."));
    });

    showScreen("settings");
  }

  // ---- seam: what this branch offers to everyone else ----
  Object.assign(Dojo, { renderSettings });
})();
