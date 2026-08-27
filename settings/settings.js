// ================================================
// Knell — SETTINGS
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
        <div class="stats-section-title">🎨 ${I18N.t("set.appearance")}</div>
        <p class="settings-hint">${I18N.t("set.appearanceNote")}</p>
        <button id="btn-settings-custom" class="btn-ghost">🎒 ${I18N.t("set.openCustom")}</button>
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
        <div class="stats-section-title">\u{1F4A1} ${I18N.t("set.hintsTitle")}</div>
        <p class="settings-hint">${I18N.t("set.hintsExample")}</p>
        <label class="hint-toggle-row">
          <input type="checkbox" id="hints-toggle" ${hintsOn ? "checked" : ""} />
          <span>${I18N.t("set.showHints")}</span>
        </label>
      </div>
      <div class="settings-section">
        <div class="stats-section-title">\u{1F50A} ${I18N.t("set.soundTitle")}</div>
        <p class="settings-hint">${I18N.t("set.soundNote")}</p>
        <label class="hint-toggle-row">
          <input type="checkbox" id="sound-toggle" ${soundOn ? "checked" : ""} />
          <span>${I18N.t("set.sound")}</span>
        </label>
      </div>
      <div class="settings-section">
        <div class="stats-section-title">\u{1F4C4} ${I18N.t("set.legal")}</div>
        <details class="legal-block">
          <summary>${I18N.t("set.privacy")}</summary>
          <p><strong>${I18N.t("set.staysLocal")}</strong></p>
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
          <summary>${I18N.t("set.terms")}</summary>
          <p><em>${I18N.t("set.draftNote")}</em></p>
          <p>Knell is provided as-is, with no warranty. It is a study aid, not
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
        <div class="stats-section-title">\u{1F4BE} ${I18N.t("set.yourData")}</div>
        <p class="settings-hint">${I18N.t("set.dataNote")}</p>
        <div class="stats-actions">
          <button id="btn-export-2" class="btn-ghost">\u{1F4E5} ${I18N.t("set.export")}</button>
          <label class="btn-ghost import-label">
            \u{1F4E4} ${I18N.t("set.import")}
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



    // The Unlock-code box lived here and was removed 2026-08-27: the
    // Admin panel (admin/admin.js, Ctrl+Shift+A) does everything it did
    // — grant XP/Tokens/Cash, unlock every unit, toggle admin — behind a
    // real isAdmin gate rather than a typed string. Two doors to the
    // same privileged room, and this was the one anyone could try.
    //
    // Becoming admin in the first place is UNAFFECTED: that has always
    // been a secret PROFILE NAME (data/db.js's createProfile ->
    // applyAdminStart), never this box.

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
