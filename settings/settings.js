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
  const showScreen = Dojo.showScreen;
  const Router = Dojo.Router;
  const Bus = Dojo.Bus;
  const applyTheme = (...a) => Dojo.applyTheme(...a);
  const renderShop = (...a) => Dojo.renderShop(...a);
  const renderCharge = (...a) => Dojo.renderCharge(...a);
  const updateProfileBadge = (...a) => Dojo.updateProfileBadge(...a);
  const showLobby = (...a) => Dojo.showLobby(...a);

  // ---- Settings ----
  function renderSettings() {
    const body = document.getElementById("settings-body");
    const current = DB.getTheme();
    const owned = PREMIUM_THEMES.filter(t => Dojo.themeUnlocked(t.id));
    const locked = PREMIUM_THEMES.length - owned.length;
    const lobbyStyle = DB.getLobbyStyle ? DB.getLobbyStyle() : "classic";

    const swatch = t => `
      <button class="theme-swatch${t.id === current ? " active" : ""}"
              data-theme="${t.id}" style="--sw:${t.swatch};--sw-bg:${t.card}">
        <span class="sw-preview"><span class="sw-dot"></span></span>
        <span class="sw-name">${t.name}</span>
      </button>`;

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
    const lobbyStyleSwatch = (id, name, kind) => `
      <button class="style-swatch${id === lobbyStyle ? " active" : ""}" data-lobby-style="${id}">
        ${kind === "star" ? starPreview() : barsPreview(kind === "cards")}
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
          ${locked ? `${locked} more are waiting further up the rank ladder.` : "You have them all."}
        </p>
        ${owned.length ? `<div class="theme-grid">${owned.map(swatch).join("")}</div>` : ""}
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
      ${window.DOJO_CODES ? `
      <div class="settings-section">
        <div class="stats-section-title">\u{1F511} Unlock code</div>
        <p class="settings-hint">For testing and demos. The full list is in
        <code>docs/CHEATCODES.md</code>.</p>
        <div class="admin-row">
          <input id="admin-code-input" class="modal-input admin-input" type="text"
                 placeholder="Enter code..." autocomplete="off" spellcheck="false" />
          <button id="btn-admin-apply" class="btn-ghost">Apply</button>
        </div>
        <div id="admin-msg" class="settings-hint" style="margin-top:0.5rem;"></div>
      </div>` : ""}
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

    body.querySelectorAll(".theme-swatch").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-theme");
        DB.setTheme(id);
        applyTheme(id);
        body.querySelectorAll(".theme-swatch").forEach(b => b.classList.remove("active"));
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
      if (!CODES) return;
      const val = (codeInput.value || "").trim();
      const fn = CODES[val];
      if (!fn) { msg.textContent = "Not a valid code."; return; }
      const result = fn();
      codeInput.value = "";
      msg.textContent = result;
      if (Dojo.renderVitals) Dojo.renderVitals();
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
