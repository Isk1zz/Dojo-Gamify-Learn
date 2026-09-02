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
      <!-- Holiday. In Settings rather than the lobby on purpose: it is a
           rare, deliberate act, and a switch that pauses the Garden
           should not sit where somebody taps by accident. Painted empty
           and filled in when the server answers — the budget is the
           server's to report, and inventing a number here would be the
           thing this project keeps correcting. -->
      <div class="settings-section" id="holiday-section" style="display:none;">
        <div class="stats-section-title">\u{1F334} ${I18N.t("set.holidayTitle")}</div>
        <p class="settings-hint">${I18N.t("set.holidayNote")}</p>
        <div id="holiday-body"></div>
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
          <p>${I18N.t("legal.privacyIntro")}</p>
          <p>${I18N.t("legal.privacyLocal")}</p>
          <p>${I18N.t("legal.privacyCloud")}</p>
          <p>${I18N.t("legal.privacyForum")}</p>
          <p>${I18N.t("legal.privacyNoTrack")}</p>
          <p>${I18N.t("legal.privacyRights")}</p>
        </details>
        <details class="legal-block">
          <summary>${I18N.t("set.terms")}</summary>
          <p><em>${I18N.t("set.draftNote")}</em></p>
          <p>${I18N.t("legal.termsAsIs")}</p>
          <p>${I18N.t("legal.termsContent")}</p>
          <p>${I18N.t("legal.termsCurrency")}</p>
          <p>${I18N.t("legal.termsAccount")}</p>
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
      </div>
      ${(Dojo.Auth && Dojo.Auth.hasAccount()) ? `
      <div class="settings-section">
        <div class="stats-section-title">\u{1F5D1}\uFE0F ${I18N.t("del.title")}</div>
        <p class="settings-hint">${I18N.t("del.note")}</p>
        <div class="stats-actions">
          <button id="btn-delete-account" class="btn-ghost danger-btn">${I18N.t("del.button")}</button>
        </div>
      </div>` : ""}`;


    // I18N.set reloads the page — see core/i18n.js for why the language
    // is resolved once per load rather than swapped live. Nothing to
    // save first: progress is written to the DB as it happens, and the
    // language itself goes to localStorage inside set().
    body.querySelectorAll(".lang-btn").forEach(btn => {
      btn.addEventListener("click", () => I18N.set(btn.dataset.lang));
    });

    paintHoliday();

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

    // Account deletion. Deliberately awkward: a confirm() would be one
    // careless click away from erasing everything irreversibly, so this
    // asks for a typed word AND offers an export first. Friction is the
    // feature here.
    const delBtn = document.getElementById("btn-delete-account");
    if (delBtn) delBtn.addEventListener("click", () => {
      const overlay = document.getElementById("delete-account-modal");
      if (!overlay) return;
      overlay.style.display = "flex";
      const input = document.getElementById("del-confirm-input");
      const go = document.getElementById("del-confirm-go");
      const err = document.getElementById("del-error");
      input.value = "";
      go.disabled = true;
      err.style.display = "none";

      // The typed word is matched against the ENGLISH literal in both
      // languages on purpose: "DELETE" is what the field label says
      // verbatim, and translating the magic word would mean a Russian
      // user typing what the screen shows and being told it is wrong.
      input.oninput = () => { go.disabled = input.value.trim().toUpperCase() !== "DELETE"; };

      document.getElementById("del-export-first").onclick = () => DB.exportData();
      document.getElementById("del-cancel").onclick = () => { overlay.style.display = "none"; };

      go.onclick = async () => {
        // Check for a session FIRST. Without this, "not signed in" fell
        // through to the generic failure message and told people to
        // check their connection -- reported live, and exactly the kind
        // of misdirection that costs someone ten minutes.
        const session = Dojo.Cloud ? await Dojo.Cloud.getSession().catch(() => null) : null;
        if (!session) {
          err.textContent = I18N.t("del.notSignedIn");
          err.style.display = "block";
          return;
        }
        go.disabled = true;
        go.textContent = I18N.t("del.working");
        try {
          if (Dojo.Auth && Dojo.Cloud) await Dojo.Auth.deleteAccount();
          overlay.style.display = "none";
          // Full reload rather than a re-render: every branch is holding
          // state for a profile that no longer exists, and enumerating
          // them here would be a list that goes stale.
          location.reload();
        } catch (e) {
          err.textContent = I18N.t("del.failed");
          err.style.display = "block";
          go.disabled = false;
          go.textContent = I18N.t("del.button");
        }
      };
    });

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
  // ---- Holiday ---------------------------------------------------------
  // Everything here comes from the server, which owns the flag and the
  // budget (migrations 0026/0027). The section stays hidden until it
  // answers: a switch drawn from a guess would be a switch that lies
  // about how many days are left.
  async function paintHoliday() {
    const section = document.getElementById("holiday-section");
    const body = document.getElementById("holiday-body");
    if (!section || !body) return;
    if (!Dojo.Cloud || !Dojo.Cloud.isConfigured()) return;

    let h = null;
    try {
      const session = await Dojo.Cloud.getSession();
      if (!session) return;               // signed out: nothing to pause
      h = await Dojo.Cloud.holidayStatus();
    } catch (e) { return; }               // offline: leave it hidden
    if (!h) return;

    section.style.display = "";
    const left = h.remaining || 0;

    body.innerHTML = h.away
      ? `<div class="holiday-state away">
           <div class="hs-line">${I18N.t("set.holidayAway")}</div>
           <div class="hs-sub">${I18N.t("set.holidayLeft", { n: left, of: h.budget })}</div>
         </div>
         <button id="holiday-end" class="btn-primary">${I18N.t("set.holidayEnd")}</button>`
      : `<div class="holiday-state">
           <div class="hs-sub">${I18N.t("set.holidayLeft", { n: left, of: h.budget })}</div>
         </div>
         <button id="holiday-start" class="btn-ghost" ${left <= 0 ? "disabled" : ""}
                 ${left <= 0 ? `title="${I18N.t("set.holidayNoBudget")}"` : ""}>
           ${I18N.t("set.holidayStart")}</button>`;

    const start = document.getElementById("holiday-start");
    if (start) start.addEventListener("click", async () => {
      start.disabled = true;
      try {
        const r = await Dojo.Cloud.startHoliday();
        if (r && r.status === "away") DB.setHoliday(r.since);
      } catch (e) { console.info("[holiday] start failed:", e.message); }
      paintHoliday();
    });

    const end = document.getElementById("holiday-end");
    if (end) end.addEventListener("click", async () => {
      end.disabled = true;
      try {
        const r = await Dojo.Cloud.endHoliday();
        // The SERVER decides how many days are forgiven; the client
        // shifts its own due dates by exactly that number so the two
        // never drift. Days taken past the budget are not in it.
        if (r && r.status === "back") DB.endHoliday(r.days || 0);
      } catch (e) { console.info("[holiday] end failed:", e.message); }
      paintHoliday();
      if (Dojo.renderGarden && document.querySelector("#garden.active")) Dojo.renderGarden();
    });
  }

  Object.assign(Dojo, { renderSettings });
})();
