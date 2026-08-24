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
  const showScreen = Dojo.showScreen;
  const Router = Dojo.Router;
  const Bus = Dojo.Bus;
  // THEMES / PREMIUM_THEMES / BG_STRIPES and the theme-preview state
  // (backBtnBound, previewing) were dropped with the cosmetic sections —
  // Custom owns all of that now, including its own preview + restore.
  const renderShop = (...a) => Dojo.renderShop(...a);
  const renderCharge = (...a) => Dojo.renderCharge(...a);
  const updateProfileBadge = (...a) => Dojo.updateProfileBadge(...a);
  const showLobby = (...a) => Dojo.showLobby(...a);

  // ---- Settings ----
  function renderSettings() {
    const body = document.getElementById("settings-body");
    const hintsOn = DB.getHintsEnabled ? DB.getHintsEnabled() : true;
    const soundOn = DB.getSoundEnabled ? DB.getSoundEnabled() : true;

    // Every cosmetic control that used to live here — colour theme,
    // awarded themes, lobby style, star links, palettes, background
    // stripes — now lives ONLY in Custom. Settings had become a second
    // place to equip the same things Custom equips, which is exactly how
    // paid themes ended up equippable for free from here: two screens
    // writing the same state, only one of them checking ownership. One
    // surface to buy (Shop), one to equip (Custom), and Settings keeps
    // what it is actually for — how the app BEHAVES, not how it looks.
    body.innerHTML = `
      <div class="settings-section">
        <div class="stats-section-title">🎨 Appearance</div>
        <p class="settings-hint">Themes, lobby layout, colours, stripes, decorations and scenery all live in Custom now — one place to equip everything you own, instead of the same controls in two screens.</p>
        <button id="btn-settings-custom" class="btn-ghost">🎒 Open Custom</button>
      </div>
      <div class="settings-section">
        <div class="stats-section-title">\u{1F310} ${I18N.t("lang.label")}</div>
        <p class="settings-hint">${I18N.t("lang.note")}</p>
        <div class="lang-row">
          ${I18N.langs().map(l => `
            <button class="btn-ghost lang-btn${I18N.lang() === l ? " active" : ""}"
                    data-lang="${l}"${I18N.lang() === l ? " aria-current=\"true\"" : ""}>
              ${I18N.nativeName(l)}
            </button>`).join("")}
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


    // I18N.set reloads the page — see core/i18n.js for why the language
    // is resolved once per load rather than swapped live. Nothing to
    // save first: progress is written to the DB as it happens, and the
    // language itself goes to localStorage inside set().
    body.querySelectorAll(".lang-btn").forEach(btn => {
      btn.addEventListener("click", () => I18N.set(btn.dataset.lang));
    });

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

    const customBtn = document.getElementById("btn-settings-custom");
    if (customBtn) customBtn.addEventListener("click", () => Router.go("inventory"));

    const exp = document.getElementById("btn-export-2");
    if (exp) exp.addEventListener("click", () => DB.exportData());
    const imp = document.getElementById("btn-import-2");
    if (imp) imp.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (!file) return;
      DB.importData(file).then(() => {
        Dojo.applyTheme(DB.getTheme());
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
