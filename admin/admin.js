// ================================================
// CS Dojo — ADMIN / Admin Panel, Analytics & User Management
// ------------------------------------------------
// Provides administrative controls, advanced learning
// & economy analytics, real-time event logging,
// direct database inspection, and user moderation (ban, warn, kick, admin roles).
// ================================================

(() => {
  const state = Dojo.state;
  const Router = Dojo.Router;
  const Bus = Dojo.Bus;
  const Logger = Dojo.Logger;

  let activeTab = "profiles";
  let userSearchQuery = "";
  let userRoleFilter = "ALL";
  let logAutoScroll = true;
  let logUnsubscribe = null;

  function getRawDB() {
    try {
      const raw = localStorage.getItem("unit6-dojo-db");
      return raw ? JSON.parse(raw) : (DB.init ? DB.init() : {});
    } catch (e) {
      return {};
    }
  }

  function setRawDB(dbObj) {
    try {
      localStorage.setItem("unit6-dojo-db", JSON.stringify(dbObj));
      return true;
    } catch (e) {
      console.error("[Admin] Failed to save raw DB", e);
      return false;
    }
  }

  // Trimmed from the ported version, which also accepted the bare words
  // "admin" and "dojodev" — those are guessable enough that they were
  // actively worse than no gate (inviting the first thing anyone would
  // type). Kept "adminaccount"/"admin613" only because they're already
  // public: "adminaccount" is data/db.js's own SECRET_ADMIN_NAME cheat
  // (ships client-side by the same accepted trade documented there),
  // and "admin613" is already sitting in this repo's git history from
  // an old settings/codes.js commit. Same underlying limit either way —
  // this is a client-only app, so nothing server-side is actually being
  // protected; devtools + localStorage bypasses this regardless of the
  // key. This is a speed bump against casual poking, not real auth.
  const MASTER_ADMIN_KEYS = ["adminaccount", "admin613"];

  function renderAdminAuthChallenge(container, p) {
    container.innerHTML = `
      <div class="admin-wrapper" style="max-width:500px; padding-top:3.5rem;">
        <div class="admin-card" style="text-align:center; padding:2.25rem 1.75rem; box-shadow:0 10px 40px rgba(0,0,0,0.5); border:1px solid rgba(245,158,11,0.35);">
          <div style="font-size:3rem; margin-bottom:0.75rem;">🔒</div>
          <h2 style="font-size:1.4rem; font-weight:800; color:var(--yellow); margin-bottom:0.5rem;">Admin Access Restricted</h2>
          <p style="font-size:0.85rem; color:var(--text-dim); line-height:1.5; margin-bottom:1.5rem;">
            Account <strong>"${escapeHtml((p && p.name) || 'Current User')}"</strong> is not authorized as an administrator.
            <br>Enter the Master Authorization Key to verify administrative identity.
          </p>

          <div id="auth-error-msg" style="display:none; color:var(--red); font-size:0.82rem; margin-bottom:0.75rem; font-weight:600;"></div>

          <div style="display:flex; flex-direction:column; gap:0.75rem;">
            <input id="admin-passcode-input" type="password" class="modal-input" placeholder="Enter master admin key..." autocomplete="off" spellcheck="false" style="text-align:center; font-family:var(--mono); font-size:0.95rem;" />
            <button id="btn-auth-unlock" class="btn-primary" style="justify-content:center;">🔓 Authenticate &amp; Unlock Admin</button>
            <button id="btn-auth-back" class="btn-ghost" style="justify-content:center;">← Return to Lobby</button>
          </div>
        </div>
      </div>
    `;

    const input = document.getElementById("admin-passcode-input");
    const errMsg = document.getElementById("auth-error-msg");
    const unlockBtn = document.getElementById("btn-auth-unlock");
    const backBtn = document.getElementById("btn-auth-back");

    function tryUnlock() {
      const val = (input.value || "").trim().toLowerCase();
      if (MASTER_ADMIN_KEYS.includes(val)) {
        if (p && p.id && DB.setAdminStatus) {
          DB.setAdminStatus(p.id, true);
        }
        if (Logger && Logger.warn) {
          Logger.warn("AdminAuth", `User "${p ? p.name : 'Unknown'}" elevated to Admin via master key verification.`, { uid: p ? p.id : null });
        }
        renderAdmin();
      } else {
        if (errMsg) {
          errMsg.textContent = "Access Denied: Invalid master authorization key.";
          errMsg.style.display = "block";
        }
        input.value = "";
        input.focus();
      }
    }

    if (unlockBtn) unlockBtn.addEventListener("click", tryUnlock);
    if (input) input.addEventListener("keydown", (e) => { if (e.key === "Enter") tryUnlock(); });
    if (backBtn) backBtn.addEventListener("click", () => Router.go("lobby"));
  }

  function renderAdmin() {
    const container = document.getElementById("admin-body") || document.getElementById("admin");
    if (!container) return;

    const p = DB.getActiveProfile() || { name: "None", chargeEarned: 0, wallet: 0, tokens: 0, tickets: 7, isAdmin: false };
    
    // Strict Admin Protection: Non-admins must authenticate via Master Passcode
    if (!p || !p.isAdmin) {
      renderAdminAuthChallenge(container, p);
      return;
    }

    const allProfiles = DB.listProfiles ? DB.listProfiles() : [];

    container.innerHTML = `
      <div class="admin-wrapper">
        <!-- Header -->
        <div class="admin-header">
          <div class="admin-title-wrap">
            <div class="admin-badge-icon">🛡️</div>
            <div>
              <h1 class="admin-title">Admin &amp; Telemetry Suite</h1>
              <div class="admin-subtitle">
                Logged as: <strong>${escapeHtml(p.name)}</strong>
                ${p.isAdmin ? '<span class="badge-role admin" style="margin-left:0.4rem;">👑 ADMIN</span>' : ''}
                · DB v${getRawDB().version || 9}
              </div>
            </div>
          </div>
          <div class="admin-header-actions">
            <button id="btn-admin-close" class="btn-ghost" style="padding:0.5rem 0.9rem;">← Back to Lobby</button>
          </div>
        </div>

        <!-- Navigation Tabs -->
        <nav class="admin-nav">
          <button class="admin-tab-btn ${activeTab === 'profiles' ? 'active' : ''}" data-tab="profiles">
            👥 User Management
          </button>
          <button class="admin-tab-btn ${activeTab === 'economy' ? 'active' : ''}" data-tab="economy">
            💰 Economy &amp; Cheats
          </button>
          <button class="admin-tab-btn ${activeTab === 'stats' ? 'active' : ''}" data-tab="stats">
            📊 Analytics
          </button>
          <button class="admin-tab-btn ${activeTab === 'logs' ? 'active' : ''}" data-tab="logs">
            📜 Event Logger
          </button>
          <button class="admin-tab-btn ${activeTab === 'rawdb' ? 'active' : ''}" data-tab="rawdb">
            ⚙️ DB Inspector
          </button>
        </nav>

        <!-- Message Banner Area -->
        <div id="admin-banner-area"></div>

        <!-- Tab 1: User Management Table -->
        <div id="pane-profiles" class="admin-tab-pane ${activeTab === 'profiles' ? 'active' : ''}">
          <div class="admin-card">
            <div class="admin-card-header" style="flex-wrap:wrap; gap:0.75rem;">
              <div>
                <span class="admin-card-title">👥 Registered Users &amp; Moderation</span>
                <div class="admin-subtitle" style="margin-top:0.25rem;">Total registered: <strong>${allProfiles.length}</strong></div>
              </div>
              <div style="display:flex; align-items:center; gap:0.5rem; flex-wrap:wrap;">
                <input id="user-search-input" type="text" class="log-search-input" placeholder="Search by name or ID..." value="${escapeHtml(userSearchQuery)}" />
                <select id="user-role-filter" class="log-select">
                  <option value="ALL" ${userRoleFilter === 'ALL' ? 'selected' : ''}>All Users</option>
                  <option value="ADMIN" ${userRoleFilter === 'ADMIN' ? 'selected' : ''}>👑 Admins</option>
                  <option value="BANNED" ${userRoleFilter === 'BANNED' ? 'selected' : ''}>🚫 Banned</option>
                  <option value="WARNED" ${userRoleFilter === 'WARNED' ? 'selected' : ''}>⚠️ With Warnings</option>
                </select>
                <button id="btn-adm-create-user" class="admin-btn-pill success" style="padding:0.45rem 0.8rem;">＋ Create User</button>
              </div>
            </div>

            <!-- Users Table -->
            <div class="table-responsive">
              <table class="admin-table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Status</th>
                    <th>XP &amp; Rank</th>
                    <th>Assets</th>
                    <th>Progress</th>
                    <th>Registered</th>
                    <th style="text-align:right;">Actions</th>
                  </tr>
                </thead>
                <tbody id="users-table-body">
                  ${renderUsersTableRows(allProfiles, p)}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Tab 2: Economy & Dev Cheats -->
        <div id="pane-economy" class="admin-tab-pane ${activeTab === 'economy' ? 'active' : ''}">
          <div class="admin-grid">
            <!-- Active Profile Quick Mutator -->
            <div class="admin-card">
              <div class="admin-card-header">
                <span class="admin-card-title">💰 Live Balance Mutator (${escapeHtml(p.name)})</span>
              </div>
              <div class="admin-field-row">
                <span class="admin-label">⚡ XP (Rank Points)</span>
                <div class="admin-input-group">
                  <input id="input-adm-xp" type="number" class="admin-number-input" value="${p.chargeEarned || 0}" />
                  <button id="btn-set-xp" class="admin-btn-pill">Set</button>
                </div>
              </div>
              <div class="admin-field-row">
                <span class="admin-label">💵 Wallet ($)</span>
                <div class="admin-input-group">
                  <input id="input-adm-wallet" type="number" class="admin-number-input" value="${p.wallet || 0}" />
                  <button id="btn-set-wallet" class="admin-btn-pill">Set</button>
                </div>
              </div>
              <div class="admin-field-row">
                <span class="admin-label">🪙 Tokens (Courses)</span>
                <div class="admin-input-group">
                  <input id="input-adm-tokens" type="number" class="admin-number-input" value="${p.tokens || 0}" />
                  <button id="btn-set-tokens" class="admin-btn-pill">Set</button>
                </div>
              </div>
              <div class="admin-field-row">
                <span class="admin-label">🎫 Arcade Tickets</span>
                <div class="admin-input-group">
                  <input id="input-adm-tickets" type="number" class="admin-number-input" max="7" min="0" value="${p.tickets !== undefined ? p.tickets : 7}" />
                  <button id="btn-set-tickets" class="admin-btn-pill">Set</button>
                </div>
              </div>
            </div>

            <!-- Dev Cheats -->
            <div class="admin-card">
              <div class="admin-card-header">
                <span class="admin-card-title">⚡ Instant Cheats</span>
                <span class="stat-label">One-Click</span>
              </div>
              <div class="admin-cheats-grid">
                <button id="cheat-unlock-all" class="admin-cheat-btn">🔓 Unlock All Units</button>
                <button id="cheat-complete-all" class="admin-cheat-btn">🎓 Master All Topics</button>
                <button id="cheat-add-xp" class="admin-cheat-btn">⚡ +1,000 XP</button>
                <button id="cheat-add-tokens" class="admin-cheat-btn">🪙 +100 Tokens</button>
                <button id="cheat-add-money" class="admin-cheat-btn">💵 +$1,000 Cash</button>
                <button id="cheat-refill-tickets" class="admin-cheat-btn">🎫 Max Tickets (7)</button>
                <button id="cheat-reset-reviews" class="admin-cheat-btn">🔁 Reset SM-2 Schedule</button>
                <button id="cheat-reset-profile" class="admin-cheat-btn" style="color:var(--red);">🧹 Reset Progress</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Tab 3: Advanced Analytics -->
        <div id="pane-stats" class="admin-tab-pane ${activeTab === 'stats' ? 'active' : ''}">
          ${renderStatsTabContent(p)}
        </div>

        <!-- Tab 4: Event Logger -->
        <div id="pane-logs" class="admin-tab-pane ${activeTab === 'logs' ? 'active' : ''}">
          <div class="admin-card">
            <div class="log-toolbar">
              <div class="log-filters">
                <select id="log-level-filter" class="log-select">
                  <option value="ALL">All Levels</option>
                  <option value="EVENT">Events Only</option>
                  <option value="INFO">Info</option>
                  <option value="WARN">Warnings</option>
                  <option value="ERROR">Errors</option>
                </select>
                <input id="log-search" type="text" class="log-search-input" placeholder="Search event / message..." />
              </div>
              <div class="admin-header-actions">
                <button id="btn-test-event" class="admin-btn-pill">Test Event</button>
                <button id="btn-test-error" class="admin-btn-pill danger">Test Error</button>
                <button id="btn-clear-logs" class="admin-btn-pill">Clear</button>
                <button id="btn-export-logs" class="admin-btn-pill success">📥 Export JSON</button>
              </div>
            </div>

            <!-- Console Window -->
            <div id="admin-log-console" class="log-console">
              <!-- Rendered dynamically -->
            </div>
            <div style="display:flex; justify-content:space-between; align-items:center; margin-top:0.5rem; font-size:0.75rem; color:var(--text-muted);">
              <span id="log-counter">0 events recorded</span>
              <label style="cursor:pointer; display:flex; align-items:center; gap:0.4rem;">
                <input type="checkbox" id="chk-autoscroll" ${logAutoScroll ? 'checked' : ''} />
                Auto-scroll to latest
              </label>
            </div>
          </div>
        </div>

        <!-- Tab 5: Database Inspector -->
        <div id="pane-rawdb" class="admin-tab-pane ${activeTab === 'rawdb' ? 'active' : ''}">
          <div class="admin-card">
            <div class="admin-card-header">
              <span class="admin-card-title">🗄️ Raw LocalStorage JSON</span>
              <div class="admin-header-actions">
                <button id="btn-copy-json" class="admin-btn-pill">📋 Copy</button>
                <button id="btn-export-db" class="admin-btn-pill success">📥 Backup DB</button>
                <button id="btn-reset-db" class="admin-btn-pill danger">⚠️ Factory Reset</button>
              </div>
            </div>
            <p class="settings-hint" style="margin-bottom:0.75rem;">
              Direct access to <code>unit6-dojo-db</code>. Modifying this directly mutates the state upon save.
            </p>
            <textarea id="raw-db-textarea" class="db-editor-textarea" spellcheck="false">${JSON.stringify(getRawDB(), null, 2)}</textarea>
            <div style="margin-top:1rem; display:flex; justify-content:flex-end; gap:0.5rem;">
              <button id="btn-reload-json" class="btn-ghost">Revert Changes</button>
              <button id="btn-save-raw-db" class="btn-primary">💾 Validate &amp; Save Database</button>
            </div>
          </div>
        </div>
      </div>
    `;

    bindAdminEvents(container);
    if (activeTab === "logs") {
      refreshLogs();
    }
  }

  function renderUsersTableRows(profiles, activeProfile) {
    let list = profiles.slice();

    if (userSearchQuery) {
      const q = userSearchQuery.toLowerCase();
      list = list.filter(u => u.name.toLowerCase().includes(q) || u.id.toLowerCase().includes(q));
    }

    if (userRoleFilter === "ADMIN") {
      list = list.filter(u => u.isAdmin);
    } else if (userRoleFilter === "BANNED") {
      list = list.filter(u => u.isBanned);
    } else if (userRoleFilter === "WARNED") {
      list = list.filter(u => u.warnings && u.warnings.length > 0);
    }

    if (!list.length) {
      return `<tr><td colspan="7" style="text-align:center; padding:2rem; color:var(--text-muted);">No users match the search filter.</td></tr>`;
    }

    const totalTopicsCount = typeof ALL_TOPICS !== "undefined" ? ALL_TOPICS.length : 48;

    return list.map(u => {
      const isActive = activeProfile && activeProfile.id === u.id;
      const initial = (u.name || "U").charAt(0).toUpperCase();
      const rankInfo = (Dojo.Ranks && Dojo.Ranks.rankFor) ? Dojo.Ranks.rankFor(u.xp) : { n: 1, name: "Student" };
      const warningsCount = (u.warnings || []).length;
      const unreadCount = (u.warnings || []).filter(w => !w.read).length;
      const regDate = u.createdAt ? u.createdAt.slice(0, 10) : "—";

      return `
        <tr data-user-id="${u.id}">
          <td>
            <div class="user-name-cell">
              <div class="user-avatar-circle">${escapeHtml(u.avatar || initial)}</div>
              <div>
                <div style="font-weight:700; color:var(--text);">
                  ${escapeHtml(u.name)}
                  ${isActive ? '<span class="badge-role active" style="margin-left:0.3rem;">Current</span>' : ''}
                </div>
                <div style="font-size:0.7rem; color:var(--text-muted); font-family:var(--mono);">${u.id}</div>
              </div>
            </div>
          </td>
          <td>
            <div style="display:flex; flex-wrap:wrap; gap:0.3rem;">
              ${u.isAdmin ? '<span class="badge-role admin">👑 Admin</span>' : ''}
              ${u.isBanned ? `<span class="badge-role banned" title="${escapeHtml(u.banReason || '')}">🚫 Banned</span>` : ''}
              ${warningsCount > 0 ? `<span class="badge-role warned" title="${unreadCount} unread">⚠️ ${warningsCount} warn</span>` : ''}
              ${!u.isAdmin && !u.isBanned && warningsCount === 0 ? '<span class="badge-role" style="background:rgba(255,255,255,0.05); color:var(--text-muted);">User</span>' : ''}
            </div>
          </td>
          <td>
            <div><strong>Rank ${rankInfo.n}</strong></div>
            <div style="font-size:0.72rem; color:var(--text-muted);">${(u.xp || 0).toLocaleString()} XP</div>
          </td>
          <td>
            <div><span style="color:var(--green); font-weight:600;">$${(u.wallet || 0).toLocaleString()}</span></div>
            <div style="font-size:0.72rem; color:var(--yellow);">🪙 ${u.tokens || 0} tokens</div>
          </td>
          <td>
            <div><strong>${u.topicsCompleted || 0}/${totalTopicsCount}</strong> topics</div>
            <div style="font-size:0.72rem; color:var(--text-muted);">${Math.round(((u.topicsCompleted || 0) / Math.max(1, totalTopicsCount)) * 100)}% done</div>
          </td>
          <td>
            <div style="font-size:0.78rem;">${regDate}</div>
          </td>
          <td style="text-align:right;">
            <div style="display:inline-flex; gap:0.35rem; align-items:center;">
              <button class="admin-btn-pill btn-inspect-user" data-uid="${u.id}" title="Inspect full profile">🔍</button>
              <button class="admin-btn-pill btn-toggle-admin ${u.isAdmin ? 'danger' : 'success'}" data-uid="${u.id}" title="${u.isAdmin ? 'Revoke Admin' : 'Grant Admin'}">
                ${u.isAdmin ? '👑 -' : '👑 +'}
              </button>
              <button class="admin-btn-pill btn-toggle-ban ${u.isBanned ? 'success' : 'danger'}" data-uid="${u.id}" title="${u.isBanned ? 'Unban user' : 'Ban user (wipes their account)'}">
                ${u.isBanned ? '🔓 Unban' : '🚫 Ban'}
              </button>
              <button class="admin-btn-pill btn-warn-user" data-uid="${u.id}" title="Send warning notice">⚠️</button>
              <button class="admin-btn-pill btn-kick-user" data-uid="${u.id}" title="Force logout / Kick">🚪</button>
              ${!isActive ? `<button class="admin-btn-pill btn-switch-user" data-uid="${u.id}" title="Switch to this profile">👤</button>` : ''}
              <button class="admin-btn-pill danger btn-delete-user" data-uid="${u.id}" title="Delete profile">🗑️</button>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  }

  function renderStatsTabContent(p) {
    const rawStats = DB.getStats ? DB.getStats() : null;
    const completedTopics = p.completedTopics || [];
    const totalTopicsCount = typeof ALL_TOPICS !== "undefined" ? ALL_TOPICS.length : 48;
    const completedPct = Math.round((completedTopics.length / Math.max(1, totalTopicsCount)) * 100);

    const reviews = p.reviews || {};
    const dueTopics = DB.getDueTopicIds ? DB.getDueTopicIds() : [];
    const weakSpots = DB.getWeakSpots ? DB.getWeakSpots(5) : [];
    const streak = DB.getStreak ? DB.getStreak() : { count: 0, freezes: 0 };
    const xp = p.chargeEarned || 0;
    const currentRank = (Dojo.Ranks && Dojo.Ranks.rankFor) ? Dojo.Ranks.rankFor(xp) : { n: 1, name: "Student" };

    // SYNTHETIC, not real per-day history — flagged during the port,
    // not fixed, because fixing it for real needs a feature this app
    // doesn't have: a per-day activity log. `getStreak()` only tracks
    // the CURRENT streak count/freezes, not a full calendar of past
    // days, so there's no real data to draw this from yet. The pattern
    // below is deterministic (seeded off array index + streak length,
    // not Math.random()) so it doesn't lie by CHANGING on refresh, but
    // it is still fabricated — do not read individual cells as real
    // history. Labeled "Illustrative" in the card title below rather
    // than silently presenting it as genuine analytics.
    let heatmapCells = "";
    const totalDays = 14 * 7;
    for (let i = 0; i < totalDays; i++) {
      const activeSeed = (i % 7 < 5 && i > (totalDays - (streak.count || 1) * 2));
      const lvl = activeSeed ? Math.min(4, 1 + (i % 4)) : (i % 11 === 0 ? 1 : 0);
      heatmapCells += `<div class="heatmap-cell ${lvl > 0 ? 'lvl-' + lvl : ''}" title="Day -${totalDays - i}"></div>`;
    }

    return `
      <div class="admin-grid">
        <div class="stat-card">
          <div class="stat-value accent">${completedPct}%</div>
          <div class="stat-label">Mastery Progress (${completedTopics.length}/${totalTopicsCount})</div>
        </div>
        <div class="stat-card">
          <div class="stat-value green">Rank ${currentRank.n}</div>
          <div class="stat-label">${currentRank.name} (${xp.toLocaleString()} XP)</div>
        </div>
        <div class="stat-card">
          <div class="stat-value cyan">${rawStats ? rawStats.miniQuizAccuracy : 0}%</div>
          <div class="stat-label">Quiz Accuracy (${rawStats ? rawStats.miniQuizCorrect : 0}/${rawStats ? rawStats.miniQuizTotal : 0})</div>
        </div>
        <div class="stat-card">
          <div class="stat-value yellow">${rawStats ? rawStats.examsPassed : 0}/${rawStats ? rawStats.examsTaken : 0}</div>
          <div class="stat-label">Exams Passed</div>
        </div>
      </div>

      <div class="admin-card" style="margin-bottom:1.5rem;">
        <div class="admin-card-header">
          <span class="admin-card-title">🔁 SM-2 Spaced Repetition Schedule</span>
          <span class="stat-label">${Object.keys(reviews).length} Scheduled</span>
        </div>
        <div class="admin-grid" style="margin-bottom:0.75rem;">
          <div style="background:var(--bg-surface); padding:0.75rem; border-radius:var(--radius-xs);">
            <div style="font-size:1.1rem; font-weight:700; color:var(--yellow);">${dueTopics.length}</div>
            <div style="font-size:0.75rem; color:var(--text-muted);">Due for Review Today</div>
          </div>
          <div style="background:var(--bg-surface); padding:0.75rem; border-radius:var(--radius-xs);">
            <div style="font-size:1.1rem; font-weight:700; color:var(--cyan);">${streak.count} Days</div>
            <div style="font-size:0.75rem; color:var(--text-muted);">Current Streak (🔥)</div>
          </div>
          <div style="background:var(--bg-surface); padding:0.75rem; border-radius:var(--radius-xs);">
            <div style="font-size:1.1rem; font-weight:700; color:var(--green);">${streak.freezes || 0}</div>
            <div style="font-size:0.75rem; color:var(--text-muted);">Streak Freezes Available</div>
          </div>
        </div>

        ${weakSpots.length ? `
          <div class="stats-section-title" style="margin-top:1rem;">🎯 Focus Areas (Lowest Scores)</div>
          <div style="display:flex; flex-direction:column; gap:0.4rem; margin-top:0.5rem;">
            ${weakSpots.map(w => `
              <div style="display:flex; justify-content:space-between; align-items:center; background:var(--bg-surface); padding:0.5rem 0.75rem; border-radius:var(--radius-xs); font-size:0.82rem;">
                <span>${w.topicId}</span>
                <span class="stat-value ${w.lastScore >= 80 ? 'green' : 'red'}" style="font-size:0.85rem;">${w.lastScore}%</span>
              </div>
            `).join('')}
          </div>
        ` : ''}
      </div>

      <div class="admin-card" style="margin-bottom:1.5rem;">
        <div class="admin-card-header">
          <span class="admin-card-title">📅 Study Activity Matrix (Illustrative — not real per-day history)</span>
        </div>
        <div class="heatmap-container">
          <div class="heatmap-grid">
            ${heatmapCells}
          </div>
        </div>
      </div>
    `;
  }

  function showBanner(msg, type = "info") {
    const area = document.getElementById("admin-banner-area");
    if (!area) return;
    area.innerHTML = `
      <div class="admin-banner ${type}">
        <span>${msg}</span>
        <button class="admin-btn-pill" onclick="this.parentElement.remove()">✕</button>
      </div>
    `;
    setTimeout(() => {
      if (area.firstChild) area.innerHTML = "";
    }, 4000);
  }

  function openUserInspector(uid) {
    const u = DB.getProfileById ? DB.getProfileById(uid) : null;
    if (!u) {
      showBanner("Profile not found.", "error");
      return;
    }

    const modal = document.getElementById("user-inspect-modal");
    const body = document.getElementById("user-inspect-body");
    const title = document.getElementById("inspect-modal-title");
    if (!modal || !body) return;

    title.innerHTML = `👤 User Inspector — <span class="accent">${escapeHtml(u.name)}</span>`;

    const totalTopicsCount = typeof ALL_TOPICS !== "undefined" ? ALL_TOPICS.length : 48;
    const warnings = u.warnings || [];
    const rankInfo = (Dojo.Ranks && Dojo.Ranks.rankFor) ? Dojo.Ranks.rankFor(u.chargeEarned || 0) : { n: 1, name: "Student" };

    body.innerHTML = `
      <div class="admin-grid" style="margin-bottom:1rem;">
        <div style="background:var(--bg-surface); padding:1rem; border-radius:var(--radius-sm);">
          <div style="font-size:0.75rem; color:var(--text-muted);">Account Identity</div>
          <div style="font-size:1.1rem; font-weight:700; margin-top:0.25rem;">${escapeHtml(u.name)}</div>
          <div style="font-size:0.75rem; font-family:var(--mono); color:var(--text-dim); margin-top:0.2rem;">ID: ${u.id}</div>
          <div style="margin-top:0.5rem; display:flex; gap:0.4rem; flex-wrap:wrap;">
            ${u.isAdmin ? '<span class="badge-role admin">👑 Admin</span>' : '<span class="badge-role" style="background:rgba(255,255,255,0.05);">User</span>'}
            ${u.isBanned ? '<span class="badge-role banned">🚫 Banned</span>' : '<span class="badge-role active">Active</span>'}
            <span class="badge-role" style="background:rgba(255,255,255,0.05);">${warnings.length} Warnings</span>
          </div>
        </div>

        <div style="background:var(--bg-surface); padding:1rem; border-radius:var(--radius-sm);">
          <div style="font-size:0.75rem; color:var(--text-muted);">Learning &amp; Rank</div>
          <div style="font-size:1.1rem; font-weight:700; margin-top:0.25rem;">Rank ${rankInfo.n} · ${rankInfo.name}</div>
          <div style="font-size:0.85rem; color:var(--accent-light); margin-top:0.2rem;">${(u.chargeEarned || 0).toLocaleString()} XP</div>
          <div style="font-size:0.8rem; color:var(--text-dim); margin-top:0.25rem;">
            Completed: ${(u.completedTopics || []).length}/${totalTopicsCount} topics (${Math.round(((u.completedTopics || []).length / totalTopicsCount) * 100)}%)
          </div>
        </div>

        <div style="background:var(--bg-surface); padding:1rem; border-radius:var(--radius-sm);">
          <div style="font-size:0.75rem; color:var(--text-muted);">Economy &amp; Assets</div>
          <div style="font-size:1.1rem; font-weight:700; color:var(--green); margin-top:0.25rem;">$${(u.wallet || 0).toLocaleString()}</div>
          <div style="font-size:0.85rem; color:var(--yellow); margin-top:0.2rem;">🪙 ${u.tokens || 0} Tokens</div>
          <div style="font-size:0.8rem; color:var(--text-dim); margin-top:0.25rem;">
            Arcade Tickets: ${u.tickets !== undefined ? u.tickets : 7} / 7
          </div>
        </div>
      </div>

      <!-- Quick Actions Toolbar -->
      <div style="background:rgba(99,102,241,0.06); border:1px solid var(--border-accent); border-radius:var(--radius-sm); padding:0.85rem; margin-bottom:1.25rem;">
        <div style="font-size:0.8rem; font-weight:700; margin-bottom:0.6rem;">⚡ Moderate Account (${escapeHtml(u.name)})</div>
        <div style="display:flex; gap:0.5rem; flex-wrap:wrap;">
          <button id="modal-btn-toggle-admin" class="admin-btn-pill ${u.isAdmin ? 'danger' : 'success'}">
            ${u.isAdmin ? '👑 Revoke Admin' : '👑 Grant Admin Rights'}
          </button>
          <button id="modal-btn-toggle-ban" class="admin-btn-pill ${u.isBanned ? 'success' : 'danger'}">
            ${u.isBanned ? '🔓 Unban User' : '🚫 Ban Account'}
          </button>
          <button id="modal-btn-warn" class="admin-btn-pill">
            ⚠️ Issue Warning Notice
          </button>
          <button id="modal-btn-kick" class="admin-btn-pill danger">
            🚪 Force Logout (Kick)
          </button>
        </div>
      </div>

      ${u.isBanned ? `
        <div class="ban-reason-box" style="margin-bottom:1.25rem;">
          <strong>Account Ban Reason:</strong>
          <div style="margin-top:0.25rem;">${escapeHtml(u.banReason || 'No reason provided.')}</div>
        </div>
      ` : ''}

      <!-- Warnings History -->
      <div class="admin-card" style="margin-bottom:1.25rem;">
        <div class="admin-card-header">
          <span class="admin-card-title">⚠️ Warning History (${warnings.length})</span>
          ${warnings.length ? `<button id="modal-btn-clear-warnings" class="admin-btn-pill danger">Clear All Warnings</button>` : ''}
        </div>
        ${warnings.length ? `
          <div style="display:flex; flex-direction:column; gap:0.5rem;">
            ${warnings.map(w => `
              <div style="background:var(--bg-surface); border-left:3px solid var(--yellow); padding:0.6rem 0.8rem; border-radius:4px; font-size:0.82rem;">
                <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.25rem;">
                  <span style="font-size:0.72rem; color:var(--text-muted);">${w.issuedAt ? w.issuedAt.slice(0, 19).replace('T', ' ') : ''}</span>
                  <span class="badge-role ${w.read ? 'active' : 'warned'}">${w.read ? 'Acknowledged' : 'Unread'}</span>
                </div>
                <div style="color:var(--text);">${escapeHtml(w.message)}</div>
              </div>
            `).join('')}
          </div>
        ` : `<div style="font-size:0.82rem; color:var(--text-muted);">No warnings on record.</div>`}
      </div>

      <!-- Raw User JSON -->
      <details class="legal-block">
        <summary style="cursor:pointer; font-weight:600; font-size:0.85rem;">Inspect Raw Profile JSON</summary>
        <pre style="background:#060911; padding:0.75rem; border-radius:var(--radius-xs); font-family:var(--mono); font-size:0.75rem; color:#a5f3fc; overflow-x:auto; margin-top:0.5rem;">${escapeHtml(JSON.stringify(u, null, 2))}</pre>
      </details>
    `;

    modal.style.display = "flex";

    // Bind modal actions
    const closeBtn = document.getElementById("btn-inspect-close");
    if (closeBtn) closeBtn.onclick = () => { modal.style.display = "none"; };

    const btnToggleAdmin = document.getElementById("modal-btn-toggle-admin");
    if (btnToggleAdmin) {
      btnToggleAdmin.onclick = () => {
        DB.setAdminStatus(uid, !u.isAdmin);
        openUserInspector(uid);
        renderAdmin();
        showBanner(`Admin status updated for "${u.name}".`, "success");
      };
    }

    const btnToggleBan = document.getElementById("modal-btn-toggle-ban");
    if (btnToggleBan) {
      btnToggleBan.onclick = () => {
        if (u.isBanned) {
          DB.setBannedStatus(uid, false, "");
          showBanner(`User "${u.name}" unbanned.`, "success");
        } else {
          if (!confirm(`Ban "${u.name}"? This WIPES the account — all progress, XP, wallet, Tokens and Tickets reset to zero, permanently. This cannot be undone.`)) return;
          const reason = prompt("Enter ban reason:", "Violation of Dojo guidelines");
          if (reason !== null) {
            DB.setBannedStatus(uid, true, reason);
            showBanner(`User "${u.name}" banned — account wiped.`, "warn");
          }
        }
        openUserInspector(uid);
        renderAdmin();
      };
    }

    const btnWarn = document.getElementById("modal-btn-warn");
    if (btnWarn) {
      btnWarn.onclick = () => {
        const msg = prompt("Enter warning notice for user:", "Please follow our community learning guidelines.");
        if (msg && msg.trim()) {
          DB.addWarning(uid, msg.trim());
          openUserInspector(uid);
          renderAdmin();
          showBanner(`Warning sent to "${u.name}".`, "success");
        }
      };
    }

    const btnKick = document.getElementById("modal-btn-kick");
    if (btnKick) {
      btnKick.onclick = () => {
        DB.kickProfile(uid);
        modal.style.display = "none";
        renderAdmin();
        showBanner(`Session terminated for "${u.name}".`, "warn");
      };
    }

    const btnClearWarns = document.getElementById("modal-btn-clear-warnings");
    if (btnClearWarns) {
      btnClearWarns.onclick = () => {
        if (confirm(`Clear all warnings for "${u.name}"?`)) {
          DB.clearWarnings(uid);
          openUserInspector(uid);
          renderAdmin();
          showBanner("Warnings cleared.", "info");
        }
      };
    }
  }

  function refreshLogs() {
    const consoleEl = document.getElementById("admin-log-console");
    const countEl = document.getElementById("log-counter");
    if (!consoleEl || !Logger) return;

    const levelFilter = document.getElementById("log-level-filter") ? document.getElementById("log-level-filter").value : "ALL";
    const searchQuery = document.getElementById("log-search") ? document.getElementById("log-search").value : "";

    const logs = Logger.getLogs({ level: levelFilter, search: searchQuery });
    if (countEl) countEl.textContent = `${logs.length} events matching filter`;

    if (!logs.length) {
      consoleEl.innerHTML = `<div style="color:var(--text-muted); text-align:center; padding:2rem;">No logs recorded yet.</div>`;
      return;
    }

    consoleEl.innerHTML = logs.map(l => {
      const timeStr = l.time.slice(11, 19);
      const lvlClass = l.level.toLowerCase();
      const hasData = l.data && Object.keys(l.data).length > 0;
      return `
        <div class="log-entry">
          <span class="log-time">${timeStr}</span>
          <span class="log-badge ${lvlClass}">${l.level}</span>
          <span class="log-tag" title="${l.tag}">${l.tag}</span>
          <span class="log-msg">
            ${escapeHtml(l.message)}
            ${hasData ? `<span class="log-json-toggle" data-log-id="${l.id}">[data]</span>` : ''}
            ${hasData ? `<pre class="log-json-payload" id="payload-${l.id}">${escapeHtml(JSON.stringify(l.data, null, 2))}</pre>` : ''}
          </span>
        </div>
      `;
    }).join("");

    if (logAutoScroll) {
      consoleEl.scrollTop = consoleEl.scrollHeight;
    }

    consoleEl.querySelectorAll(".log-json-toggle").forEach(btn => {
      btn.addEventListener("click", () => {
        const id = btn.getAttribute("data-log-id");
        const payload = document.getElementById(`payload-${id}`);
        if (payload) {
          payload.style.display = payload.style.display === "block" ? "none" : "block";
        }
      });
    });
  }

  function escapeHtml(str) {
    if (typeof str !== "string") return String(str);
    return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }

  function bindAdminEvents(container) {
    // Back to Lobby
    const closeBtn = document.getElementById("btn-admin-close");
    if (closeBtn) closeBtn.addEventListener("click", () => Router.go("lobby"));

    // Tab buttons
    container.querySelectorAll(".admin-tab-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        activeTab = btn.getAttribute("data-tab");
        renderAdmin();
      });
    });

    // Users Table Search & Filter
    const searchInput = document.getElementById("user-search-input");
    if (searchInput) {
      searchInput.addEventListener("input", (e) => {
        userSearchQuery = e.target.value;
        const tbody = document.getElementById("users-table-body");
        if (tbody) tbody.innerHTML = renderUsersTableRows(DB.listProfiles(), DB.getActiveProfile());
        bindTableActionButtons();
      });
    }

    const roleFilter = document.getElementById("user-role-filter");
    if (roleFilter) {
      roleFilter.addEventListener("change", (e) => {
        userRoleFilter = e.target.value;
        const tbody = document.getElementById("users-table-body");
        if (tbody) tbody.innerHTML = renderUsersTableRows(DB.listProfiles(), DB.getActiveProfile());
        bindTableActionButtons();
      });
    }

    // Create User Button
    const btnCreateUser = document.getElementById("btn-adm-create-user");
    if (btnCreateUser) {
      btnCreateUser.addEventListener("click", () => {
        const name = prompt("Enter username for new account:", "Student");
        if (name && name.trim()) {
          DB.createProfile(name.trim());
          Bus.emit("profile:changed");
          renderAdmin();
          showBanner(`User account "${name}" created successfully.`, "success");
        }
      });
    }

    function bindTableActionButtons() {
      // Inspect
      container.querySelectorAll(".btn-inspect-user").forEach(btn => {
        btn.onclick = () => openUserInspector(btn.getAttribute("data-uid"));
      });

      // Toggle Admin
      container.querySelectorAll(".btn-toggle-admin").forEach(btn => {
        btn.onclick = () => {
          const uid = btn.getAttribute("data-uid");
          const u = DB.getProfileById(uid);
          if (u) {
            DB.setAdminStatus(uid, !u.isAdmin);
            renderAdmin();
            showBanner(`Admin privileges ${!u.isAdmin ? 'granted to' : 'revoked from'} "${u.name}".`, "success");
          }
        };
      });

      // Toggle Ban
      container.querySelectorAll(".btn-toggle-ban").forEach(btn => {
        btn.onclick = () => {
          const uid = btn.getAttribute("data-uid");
          const u = DB.getProfileById(uid);
          if (!u) return;
          if (u.isBanned) {
            DB.setBannedStatus(uid, false);
            renderAdmin();
            showBanner(`User "${u.name}" unbanned.`, "success");
          } else {
            if (!confirm(`Ban "${u.name}"? This WIPES the account — all progress, XP, wallet, Tokens and Tickets reset to zero, permanently. This cannot be undone.`)) return;
            const reason = prompt(`Enter ban reason for "${u.name}":`, "Violation of community standards");
            if (reason !== null) {
              DB.setBannedStatus(uid, true, reason);
              renderAdmin();
              showBanner(`User "${u.name}" has been banned — account wiped.`, "warn");
            }
          }
        };
      });

      // Warn
      container.querySelectorAll(".btn-warn-user").forEach(btn => {
        btn.onclick = () => {
          const uid = btn.getAttribute("data-uid");
          const u = DB.getProfileById(uid);
          if (!u) return;
          const msg = prompt(`Issue administrative warning to "${u.name}":`, "Warning: Please adhere to Dojo guidelines.");
          if (msg && msg.trim()) {
            DB.addWarning(uid, msg.trim());
            renderAdmin();
            showBanner(`Warning notice dispatched to "${u.name}".`, "success");
          }
        };
      });

      // Kick
      container.querySelectorAll(".btn-kick-user").forEach(btn => {
        btn.onclick = () => {
          const uid = btn.getAttribute("data-uid");
          const u = DB.getProfileById(uid);
          if (!u) return;
          DB.kickProfile(uid);
          renderAdmin();
          showBanner(`Session terminated (kicked) for "${u.name}".`, "warn");
        };
      });

      // Switch
      container.querySelectorAll(".btn-switch-user").forEach(btn => {
        btn.onclick = () => {
          const uid = btn.getAttribute("data-uid");
          DB.setActiveProfile(uid);
          Bus.emit("profile:changed");
          renderAdmin();
          showBanner(`Switched active profile to "${DB.getActiveProfile().name}".`, "success");
        };
      });

      // Delete
      container.querySelectorAll(".btn-delete-user").forEach(btn => {
        btn.onclick = () => {
          const uid = btn.getAttribute("data-uid");
          const u = DB.getProfileById(uid);
          if (u && confirm(`Delete profile "${u.name}" permanently?`)) {
            DB.deleteProfile(uid);
            Bus.emit("profile:changed");
            renderAdmin();
            showBanner(`Profile "${u.name}" deleted.`, "warn");
          }
        };
      });
    }
    bindTableActionButtons();

    // Set XP
    const btnSetXp = document.getElementById("btn-set-xp");
    if (btnSetXp) {
      btnSetXp.addEventListener("click", () => {
        const val = parseInt(document.getElementById("input-adm-xp").value, 10) || 0;
        const db = getRawDB();
        const prof = db.profiles[db.activeProfileId];
        if (prof) {
          prof.chargeEarned = val;
          prof.charge = val;
          setRawDB(db);
          Bus.emit("profile:changed");
          renderAdmin();
          showBanner(`XP set to ${val}.`, "success");
        }
      });
    }

    // Set Wallet
    const btnSetWallet = document.getElementById("btn-set-wallet");
    if (btnSetWallet) {
      btnSetWallet.addEventListener("click", () => {
        const val = parseInt(document.getElementById("input-adm-wallet").value, 10) || 0;
        const db = getRawDB();
        const prof = db.profiles[db.activeProfileId];
        if (prof) {
          prof.wallet = val;
          setRawDB(db);
          Bus.emit("wallet:changed");
          renderAdmin();
          showBanner(`Wallet set to $${val}.`, "success");
        }
      });
    }

    // Set Tokens
    const btnSetTokens = document.getElementById("btn-set-tokens");
    if (btnSetTokens) {
      btnSetTokens.addEventListener("click", () => {
        const val = parseInt(document.getElementById("input-adm-tokens").value, 10) || 0;
        const db = getRawDB();
        const prof = db.profiles[db.activeProfileId];
        if (prof) {
          prof.tokens = val;
          setRawDB(db);
          Bus.emit("tokens:changed");
          renderAdmin();
          showBanner(`Tokens set to 🪙 ${val}.`, "success");
        }
      });
    }

    // Set Tickets
    const btnSetTickets = document.getElementById("btn-set-tickets");
    if (btnSetTickets) {
      btnSetTickets.addEventListener("click", () => {
        const val = Math.min(7, Math.max(0, parseInt(document.getElementById("input-adm-tickets").value, 10) || 0));
        const db = getRawDB();
        const prof = db.profiles[db.activeProfileId];
        if (prof) {
          prof.tickets = val;
          prof.ticketsUpdatedAt = new Date().toISOString();
          setRawDB(db);
          Bus.emit("profile:changed");
          renderAdmin();
          showBanner(`Arcade tickets set to ${val}.`, "success");
        }
      });
    }

    // Cheats
    const bindCheat = (id, fn) => {
      const el = document.getElementById(id);
      if (el) el.addEventListener("click", () => { fn(); renderAdmin(); });
    };

    bindCheat("cheat-unlock-all", () => {
      const db = getRawDB();
      const p = db.profiles[db.activeProfileId];
      if (p) {
        p.unitsUnlocked = true;
        setRawDB(db);
        Bus.emit("progress:changed");
        showBanner("All course units unlocked.", "success");
      }
    });

    bindCheat("cheat-complete-all", () => {
      const db = getRawDB();
      const p = db.profiles[db.activeProfileId];
      if (p && typeof ALL_TOPICS !== "undefined") {
        ALL_TOPICS.forEach(t => {
          if (!p.completedTopics.includes(t.id)) p.completedTopics.push(t.id);
          p.completedChunks[t.id] = t.chunks.map((_, i) => i);
          if (!p.stats) p.stats = { topicStats: {} };
          if (!p.stats.topicStats) p.stats.topicStats = {};
          p.stats.topicStats[t.id] = { bestScore: 100, attempts: 1 };
        });
        setRawDB(db);
        Bus.emit("progress:changed");
        showBanner("All topics marked complete with 100% score.", "success");
      }
    });

    bindCheat("cheat-add-xp", () => {
      DB.addXp(1000);
      showBanner("Granted +1,000 XP.", "success");
    });

    bindCheat("cheat-add-tokens", () => {
      DB.addTokens(100);
      showBanner("Granted +100 Tokens.", "success");
    });

    bindCheat("cheat-add-money", () => {
      DB.addMoney(1000);
      showBanner("Granted +$1,000 Cash.", "success");
    });

    bindCheat("cheat-refill-tickets", () => {
      DB.refillTickets();
      showBanner("Arcade tickets refilled to maximum.", "success");
    });

    bindCheat("cheat-reset-reviews", () => {
      const db = getRawDB();
      const p = db.profiles[db.activeProfileId];
      if (p) {
        p.reviews = {};
        setRawDB(db);
        showBanner("SM-2 review schedule reset.", "warn");
      }
    });

    bindCheat("cheat-reset-profile", () => {
      if (confirm("Reset current profile progress back to initial zero state?")) {
        const db = getRawDB();
        const p = db.profiles[db.activeProfileId];
        if (p) {
          p.completedTopics = [];
          p.completedChunks = {};
          p.reviews = {};
          p.charge = 0;
          p.chargeEarned = 0;
          p.chargeSpent = 0;
          p.wallet = 0;
          p.tokens = 0;
          p.stats = { miniQuizTotal: 0, miniQuizCorrect: 0, examQuestionsTotal: 0, examQuestionsCorrect: 0, examsTaken: 0, examsPassed: 0, topicStats: {} };
          setRawDB(db);
          Bus.emit("profile:changed");
          Bus.emit("progress:changed");
          showBanner("Profile progress reset.", "warn");
        }
      }
    });

    // Logger Tab Handlers
    if (activeTab === "logs") {
      const filterSelect = document.getElementById("log-level-filter");
      const logSearch = document.getElementById("log-search");
      const chkScroll = document.getElementById("chk-autoscroll");

      if (filterSelect) filterSelect.addEventListener("change", refreshLogs);
      if (logSearch) logSearch.addEventListener("input", refreshLogs);
      if (chkScroll) chkScroll.addEventListener("change", (e) => { logAutoScroll = e.target.checked; });

      const btnClear = document.getElementById("btn-clear-logs");
      if (btnClear) btnClear.addEventListener("click", () => { Logger.clear(); refreshLogs(); });

      const btnExport = document.getElementById("btn-export-logs");
      if (btnExport) btnExport.addEventListener("click", () => Logger.exportLogs());

      const btnTestEvt = document.getElementById("btn-test-event");
      if (btnTestEvt) btnTestEvt.addEventListener("click", () => {
        Logger.info("AdminTest", "Manual test event triggered", { timestamp: Date.now() });
      });

      const btnTestErr = document.getElementById("btn-test-error");
      if (btnTestErr) btnTestErr.addEventListener("click", () => {
        Logger.error("AdminTest", "Manual simulated error exception", { code: 500, reason: "Test exception" });
      });

      if (logUnsubscribe) logUnsubscribe();
      logUnsubscribe = Logger.subscribe(() => {
        if (activeTab === "logs") refreshLogs();
      });
    }

    // Raw DB Editor
    const btnSaveRaw = document.getElementById("btn-save-raw-db");
    if (btnSaveRaw) {
      btnSaveRaw.addEventListener("click", () => {
        const text = document.getElementById("raw-db-textarea").value;
        try {
          const parsed = JSON.parse(text);
          if (!parsed.profiles || typeof parsed.profiles !== "object") {
            throw new Error("Invalid schema: 'profiles' object is required.");
          }
          setRawDB(parsed);
          Bus.emit("profile:changed");
          Bus.emit("progress:changed");
          renderAdmin();
          showBanner("Database JSON saved and verified successfully.", "success");
        } catch (err) {
          showBanner("JSON parse error: " + err.message, "error");
        }
      });
    }

    const btnReloadJson = document.getElementById("btn-reload-json");
    if (btnReloadJson) {
      btnReloadJson.addEventListener("click", () => {
        document.getElementById("raw-db-textarea").value = JSON.stringify(getRawDB(), null, 2);
        showBanner("JSON editor reverted.", "info");
      });
    }

    const btnCopyJson = document.getElementById("btn-copy-json");
    if (btnCopyJson) {
      btnCopyJson.addEventListener("click", () => {
        const text = document.getElementById("raw-db-textarea").value;
        navigator.clipboard.writeText(text).then(() => showBanner("Database JSON copied to clipboard.", "success"));
      });
    }

    const btnExportDb = document.getElementById("btn-export-db");
    if (btnExportDb) {
      btnExportDb.addEventListener("click", () => DB.exportData());
    }

    const btnResetDb = document.getElementById("btn-reset-db");
    if (btnResetDb) {
      btnResetDb.addEventListener("click", () => {
        if (confirm("FACTORY RESET: Erase ALL profiles and reset database to pristine default?")) {
          localStorage.removeItem("unit6-dojo-db");
          DB.init();
          Bus.emit("profile:changed");
          renderAdmin();
          showBanner("Database factory reset completed.", "warn");
        }
      });
    }
  }

  // Register with Router
  if (Router && Router.register) {
    Router.register("admin", { render: renderAdmin });
  }

  Object.assign(Dojo, {
    renderAdmin,
    openUserInspector,
    openAdminTab(tabName) {
      activeTab = tabName || "profiles";
      Router.go("admin");
    }
  });
})();
