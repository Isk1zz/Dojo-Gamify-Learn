// ================================================
// Knell — CORE / profiles
// ------------------------------------------------
// Profile creation, the name badge, and the switcher dropdown.
// Every branch's data is per-profile, so switching profile must
// repaint everything — it does that by emitting profile:changed
// rather than by calling each branch itself.
// ================================================

(() => {
  // ---- seam: everything this branch borrows from elsewhere ----
  // Late-bound on purpose. A branch may be loaded before the branch
  // it calls into, so these resolve at call time, not at load time.
  const state = Dojo.state;
  const Bus = Dojo.Bus;
  const Router = Dojo.Router;
  const AVATARS = Dojo.AVATARS;
  const applyTheme = (...a) => Dojo.applyTheme(...a);
  const renderCharge = (...a) => Dojo.renderCharge(...a);
  const renderTopicMap = (...a) => Dojo.renderTopicMap(...a);
  const showStatsModal = (...a) => Dojo.showStatsModal(...a);
  const renderStats = (...a) => Dojo.renderStats(...a);

  // ---- Profile Setup ----
  function checkProfile() {
    const profile = DB.getActiveProfile();
    if (!profile) {
      showProfileModal();
    }
  }

  function showProfileModal() {
    const modal = document.getElementById("profile-modal");
    const input = document.getElementById("profile-name-input");
    modal.style.display = "flex";
    input.value = "";
    setTimeout(() => input.focus(), 100);
  }

  function hideProfileModal() {
    document.getElementById("profile-modal").style.display = "none";
  }

  document.getElementById("btn-profile-save").addEventListener("click", () => {
    const name = document.getElementById("profile-name-input").value.trim() || I18N.t("profile.defaultName");
    DB.createProfile(name);
    hideProfileModal();
    updateProfileBadge();
    // The lobby behind this modal is already painted — btn-start's own
    // handler (core/boot.js) calls showLobby() BEFORE this modal even
    // opens, using DB.getLobbyStyle()'s no-active-profile fallback,
    // since there was no profile yet to read a real style from. That
    // paint (wrong lobby style, "Welcome." instead of the real name,
    // stale wallet/XP) used to sit there PERMANENTLY once this modal
    // closed — nothing here ever repainted it. Every brand-new user's
    // very first real screen was stale until they navigated away and
    // back. Full profile:changed broadcast, not just showLobby(), so
    // theme/bgStripe/hints all repaint against the fresh profile too.
    if (Dojo.Bus) Dojo.Bus.emit("profile:changed");
    if (Dojo.showLobby) Dojo.showLobby();
  });

  document.getElementById("profile-name-input").addEventListener("keydown", (e) => {
    if (e.key === "Enter") document.getElementById("btn-profile-save").click();
  });

  // ---- Profile Badge & Dropdown ----
  function updateProfileBadge() {
    const profile = DB.getActiveProfile();
    if (!profile) return;
    const name = profile.name || I18N.t("profile.defaultName");
    const avatarId = DB.getAvatar ? DB.getAvatar() : null;
    const equippedIcon = avatarId && Dojo.avatarIcon ? Dojo.avatarIcon(avatarId) : null;
    document.getElementById("profile-avatar").textContent = equippedIcon || name.charAt(0).toUpperCase();
    document.getElementById("profile-name-display").textContent = name;

    // Patron star — a support-recognition tier (shop/tokens.js's
    // PATRON_TIERS), not an earned badge, so it's a separate span next
    // to the name rather than mixed into the pinned-badges row below.
    const starEl = document.getElementById("profile-patron-star");
    if (starEl) {
      const tier = DB.getPatronTier ? DB.getPatronTier() : 0;
      const table = Dojo.PATRON_TIERS || [];
      const info = table.find(t => t.tier === tier);
      if (info) {
        starEl.textContent = info.star;
        starEl.className = `profile-patron-star tier-${info.tier}`;
        starEl.title = `${info.label} — thank you for supporting the Dojo`;
        starEl.style.display = "";
      } else {
        starEl.style.display = "none";
      }
    }

    // Pinned badges — up to 3, showcased right next to the name. Reads
    // library/stats.js's BADGES table for the icon; if that branch isn't
    // loaded (or nothing's pinned) this is just an empty span.
    const pinsEl = document.getElementById("profile-pins");
    if (pinsEl) {
      const pinned = DB.getPinnedBadges ? DB.getPinnedBadges() : [];
      const table = Dojo.BADGES || [];
      pinsEl.textContent = "";
      pinned.forEach(id => {
        const b = table.find(x => x.id === id);
        if (!b) return;
        const span = document.createElement("span");
        span.className = "pin-icon";
        span.textContent = b.icon;
        span.title = b.name;
        pinsEl.appendChild(span);
      });
    }
  }

  function toggleDropdown() {
    state.dropdownOpen = !state.dropdownOpen;
    const dd = document.getElementById("profile-dropdown");
    if (state.dropdownOpen) {
      dd.style.display = "block";
      renderDropdown();
    } else {
      dd.style.display = "none";
    }
  }

  function closeDropdown() {
    state.dropdownOpen = false;
    document.getElementById("profile-dropdown").style.display = "none";
  }

  document.getElementById("profile-badge").addEventListener("click", (e) => {
    e.stopPropagation();
    toggleDropdown();
  });

  document.addEventListener("click", (e) => {
    if (state.dropdownOpen && !document.getElementById("profile-dropdown").contains(e.target)) {
      closeDropdown();
    }
  });

  // Bought with $, equipped on purchase — same one-click "buy = wear it"
  // flow the old life-shop's shelter tiers used. Re-clicking an OWNED
  // avatar just re-equips it (or lets you switch back after trying
  // another), never charges twice.
  function renderAvatarGrid() {
    const grid = document.getElementById("pd-avatars-grid");
    const walletNote = document.getElementById("pd-avatar-wallet");
    if (!grid || !AVATARS) return;
    const owned = new Set(DB.getOwnedAvatars ? DB.getOwnedAvatars() : []);
    const equipped = DB.getAvatar ? DB.getAvatar() : null;
    const wallet = DB.getWallet ? DB.getWallet() : 0;
    if (walletNote) walletNote.textContent = `$${wallet}`;

    grid.innerHTML = AVATARS.map(a => {
      const have = owned.has(a.id);
      const active = equipped === a.id;
      return `
        <button type="button" class="pd-avatar-swatch${active ? " active" : ""}" data-avatar="${a.id}"
                title="${a.name}${have ? "" : ` — $${a.price}`}">
          <span class="pd-avatar-icon">${a.icon}</span>
          ${have ? "" : `<span class="pd-avatar-price">$${a.price}</span>`}
        </button>`;
    }).join("");

    grid.querySelectorAll("[data-avatar]").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-avatar");
        const a = AVATARS.find(x => x.id === id);
        if (!a) return;
        const ok = DB.buyAvatar(id, a.price);
        if (!ok) {
          btn.classList.add("shake");
          setTimeout(() => btn.classList.remove("shake"), 350);
          return;
        }
        updateProfileBadge();
        renderAvatarGrid();
      });
    });
  }

  function renderDropdown() {
    const profile = DB.getActiveProfile();
    const nameInput = document.getElementById("pd-name-edit");
    nameInput.value = profile ? profile.name : "";
    renderAvatarGrid();

    renderAccountLine();
  }

  // The signed-in account, shown where the profile switcher used to be.
  // Async because the email comes from the session; the label is painted
  // immediately and filled in when that resolves, so a slow or offline
  // lookup never leaves the dropdown looking broken.
  //
  // A null email means "cannot ask right now" (offline, or the refresh
  // token lapsed) — NOT "signed out". Saying "signed out" there would be
  // a lie that invites someone to re-authenticate they don't need, so it
  // says so honestly instead.
  function renderAccountLine() {
    const box = document.getElementById("pd-account");
    if (!box) return;
    box.innerHTML = "";

    const label = document.createElement("strong");
    label.textContent = I18N.t("auth.signedInAs");
    const who = document.createElement("span");
    who.textContent = "…";
    box.append(label, who);

    const out = document.createElement("button");
    out.className = "pd-action";
    out.textContent = "🚪 " + I18N.t("auth.signOut");
    out.addEventListener("click", () => {
      if (Dojo.Auth) Dojo.Auth.signOut();
      const dd = document.getElementById("profile-dropdown");
      if (dd) dd.style.display = "none";
    });
    box.appendChild(out);

    if (!Dojo.Auth) { who.textContent = "—"; return; }
    Dojo.Auth.currentEmail().then(email => {
      who.textContent = email || I18N.t("auth.offlineNote");
    });
  }

  document.getElementById("pd-name-save").addEventListener("click", () => {
    const name = document.getElementById("pd-name-edit").value.trim();
    if (name) {
      DB.updateProfileName(name);
      updateProfileBadge();
    }
  });

  document.getElementById("pd-name-edit").addEventListener("keydown", (e) => {
    if (e.key === "Enter") document.getElementById("pd-name-save").click();
  });

  // "+ New Profile" was removed with the switcher (Step 0b: one account,
  // one profile). showProfileModal() itself STAYS -- core/auth.js has no
  // use for it, but a build without auth.js falls back to the old
  // name-prompt path through Dojo.checkProfile (see core/boot.js), and
  // that still needs this modal to exist.

  document.getElementById("pd-stats").addEventListener("click", () => {
    closeDropdown();
    showStatsModal();
  });

  // admin/admin.js registers "admin" with Router and owns the isAdmin
  // gate itself (shows a passcode challenge if the active profile isn't
  // one yet) — this button is just the entry point, same as any other
  // Router.go call elsewhere in the app.
  const pdAdminBtn = document.getElementById("pd-admin");
  if (pdAdminBtn) {
    pdAdminBtn.addEventListener("click", () => {
      closeDropdown();
      if (Router) Router.go("admin");
    });
  }

  // ---- seam: what this branch offers to everyone else ----
  Object.assign(Dojo, { checkProfile, showProfileModal, hideProfileModal, updateProfileBadge, closeDropdown, renderDropdown });
})();
