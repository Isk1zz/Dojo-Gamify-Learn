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
    document.getElementById("profile-avatar").textContent = name.charAt(0).toUpperCase();
    document.getElementById("profile-name-display").textContent = name;
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

  function renderDropdown() {
    const profile = DB.getActiveProfile();
    const nameInput = document.getElementById("pd-name-edit");
    nameInput.value = profile ? profile.name : "";

    const profiles = DB.listProfiles();
    const list = document.getElementById("pd-profiles-list");
    list.innerHTML = "";

    if (profiles.length > 1) {
      profiles.forEach(p => {
        const item = document.createElement("div");
        item.className = `pd-profile-item${p.id === profile?.id ? " active" : ""}`;
        item.innerHTML = `
          <span>${p.name}</span>
          <span class="pd-topics-done">${p.topicsCompleted}/${ALL_TOPICS.length}</span>
        `;
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
