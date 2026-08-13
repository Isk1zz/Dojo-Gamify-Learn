// ================================================
// CS Dojo — CORE / profiles
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
    const name = document.getElementById("profile-name-input").value.trim() || "Student";
    DB.createProfile(name);
    hideProfileModal();
    updateProfileBadge();
  });

  document.getElementById("profile-name-input").addEventListener("keydown", (e) => {
    if (e.key === "Enter") document.getElementById("btn-profile-save").click();
  });

  // ---- Profile Badge & Dropdown ----
  function updateProfileBadge() {
    const profile = DB.getActiveProfile();
    if (!profile) return;
    const name = profile.name || "Student";
    const avatarId = DB.getAvatar ? DB.getAvatar() : null;
    const equippedIcon = avatarId && Dojo.avatarIcon ? Dojo.avatarIcon(avatarId) : null;
    document.getElementById("profile-avatar").textContent = equippedIcon || name.charAt(0).toUpperCase();
    document.getElementById("profile-name-display").textContent = name;

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

    const profiles = DB.listProfiles();
    const list = document.getElementById("pd-profiles-list");
    list.innerHTML = "";

    if (profiles.length > 1) {
      profiles.forEach(p => {
        const item = document.createElement("div");
        item.className = `pd-profile-item${p.id === profile?.id ? " active" : ""}`;
        // textContent, NOT innerHTML — a profile name is the one string in
        // this app that is fully user-authored, and it used to be
        // interpolated into markup here. A name like
        // `<img src=x onerror=...>` executed on every dropdown open, and
        // rode along inside exported/imported profile files. Every other
        // name rendered in the app (hud, lobby, badge) already used
        // textContent; this was the one that didn't.
        const nameEl = document.createElement("span");
        nameEl.textContent = p.name;
        const countEl = document.createElement("span");
        countEl.className = "pd-topics-done";
        countEl.textContent = `${p.topicsCompleted}/${ALL_TOPICS.length}`;
        item.append(nameEl, countEl);
        item.addEventListener("click", () => {
          DB.setActiveProfile(p.id);
          // Theme, wallet, garden and owned items are all per-profile.
          // Announce the switch; each branch repaints itself. This file
          // must not grow a list of every branch that needs waking up.
          Bus.emit("profile:changed", { id: p.id });
          Bus.emit("progress:changed", { reason: "profile-switch" });
          renderDropdown();
        });
        list.appendChild(item);
      });
    } else {
      list.innerHTML = '<div style="padding:0.3rem 0.5rem;font-size:0.78rem;color:var(--text-muted);">Only one profile</div>';
    }
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

  document.getElementById("pd-new-profile").addEventListener("click", () => {
    closeDropdown();
    showProfileModal();
  });

  document.getElementById("pd-stats").addEventListener("click", () => {
    closeDropdown();
    showStatsModal();
  });

  // ---- seam: what this branch offers to everyone else ----
  Object.assign(Dojo, { checkProfile, showProfileModal, hideProfileModal, updateProfileBadge, closeDropdown, renderDropdown });
})();
