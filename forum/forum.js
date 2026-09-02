// ================================================
// Knell — FORUM
// ------------------------------------------------
// Replaces the Arcade (2026-08-15 decision). The tile, the route and
// the screen are all real; the POSTS are not yet — that is step 4.
//
// ---- What step 3 changed ----
// This screen used to show DB.getReputation(), a number out of the
// local `wallet` field. That number was fiction. Reputation is not a
// stored balance any more: it is a daily ALLOWANCE derived from the
// Garden, plus a journal of who gave what to whom, and the server
// computes all of it from rep_grants. A locally stored figure could
// only ever disagree with the truth.
//
// So the screen now asks the server (rep_status) and draws what comes
// back. When there is no server to ask, it says so rather than falling
// back to a number it cannot stand behind — the whole point of the
// change.
//
// ---- The three figures ----
// Decided 2026-08-16: the journal IS the record, so there are no
// counters to keep. All three are queries against rep_grants.
//
//   given_total     what you have handed out, ever
//   received_month  a season, and it resets by itself, because
//                   "this month" is a WHERE clause and not an event
//   received_total  lifetime, never resets
//
// Given is shown BESIDE received deliberately. A board that reports
// only what you received rewards popularity alone; showing generosity
// next to it is cheap now and impossible to add later, because nobody
// would have the data.
//
// ---- The one rule ----
// Reputation cannot be spent on yourself. You earn the right to give in
// the Garden; your standing is only ever what other people gave you.
// Enforced in grant_reputation and by a CHECK constraint on rep_grants
// — a client-side check would be a suggestion, not a rule.
// ================================================

(() => {
  const showScreen = Dojo.showScreen;

  // Cached so switching to the Forum and back does not re-query, but
  // never trusted across a session: a grant made elsewhere changes
  // these numbers, and there is no push channel to hear about it.
  let cached = null;

  async function fetchStatus() {
    if (!Dojo.Cloud || !Dojo.Cloud.isConfigured()) return { state: "no_backend" };
    let session = null;
    try { session = await Dojo.Cloud.getSession(); } catch (e) { /* offline */ }
    if (!session) return { state: "offline" };
    try {
      const s = await Dojo.Cloud.repStatus();
      return { state: "ok", s };
    } catch (e) {
      console.info("[forum] rep_status unavailable:", e.message);
      return { state: "offline" };
    }
  }

  const num = n => `<span class="fs-num">${n == null ? "—" : n}</span>`;

  function figuresHtml(r) {
    // Not signed in, or no network. Say which, and show nothing rather
    // than a stale or invented number.
    if (r.state !== "ok") {
      return `<p class="settings-hint">${I18N.t(
        r.state === "no_backend" ? "forum.figuresNoBackend" : "forum.figuresOffline")}</p>`;
    }
    const s = r.s;

    // The allowance line comes first because it is the only one with a
    // deadline: unspent points do not carry to tomorrow.
    const allowance = s.allowance > 0
      ? I18N.t("forum.todayHave", { left: s.left_today, of: s.allowance })
      : I18N.t("forum.todayNone");

    return `
      <div class="forum-today${s.left_today > 0 ? " has" : ""}">
        <div class="ft-line">${allowance}</div>
        <div class="ft-sub">${I18N.t("forum.fromGarden", { w: s.garden_weight })}</div>
      </div>

      <div class="forum-figures">
        <div class="fig">
          <div class="fig-label">${I18N.t("forum.given")}</div>
          ${num(s.given_total)}
        </div>
        <div class="fig">
          <div class="fig-label">${I18N.t("forum.gotMonth")}</div>
          ${num(s.received_month)}
        </div>
        <div class="fig">
          <div class="fig-label">${I18N.t("forum.gotTotal")}</div>
          ${num(s.received_total)}
        </div>
      </div>
      <p class="settings-hint">${I18N.t("forum.seasonNote")}</p>`;
  }

  function paint(r) {
    const body = document.getElementById("forum-body");
    if (!body) return;

    body.innerHTML = `
      <div class="settings-section">
        <div class="stats-section-title">\u{1F44F} ${I18N.t("forum.repTitle")}</div>
        ${figuresHtml(r)}
        <p class="settings-hint">${I18N.t("forum.repNote")}</p>
      </div>

      <div class="settings-section">
        <div class="stats-section-title">\u{1F4DC} ${I18N.t("forum.ruleTitle")}</div>
        <p class="settings-hint">
          <strong>${I18N.t("forum.notYourself")}</strong> ${I18N.t("forum.ruleRest")}
        </p>
      </div>

      <div class="settings-section forum-empty">
        <div class="stats-section-title">\u{1F6A7} ${I18N.t("forum.emptyTitle")}</div>
        <p class="settings-hint">${I18N.t("forum.empty1")}</p>
        <p class="settings-hint">${I18N.t("forum.empty2")}</p>
      </div>`;
  }

  function renderForum() {
    // Paint immediately with whatever is known, then repaint when the
    // server answers. Showing a blank screen for the length of a round
    // trip would be worse than showing the rule and the empty notice,
    // neither of which depends on the network.
    paint(cached || { state: "loading" });
    showScreen("forum");
    fetchStatus().then(r => { cached = r; paint(r); });
  }

  // The lobby tile's one-line summary, same seam every other branch
  // uses. It must not trigger a network call — the lobby paints on
  // every return to it — so it reads the cache and says nothing about
  // reputation until the Forum has been opened once.
  function forumSummary() {
    if (cached && cached.state === "ok") {
      return I18N.t("ui.sum.forum", { n: cached.s.left_today });
    }
    return I18N.t("ui.sum.forumIdle");
  }

  Object.assign(Dojo, { renderForum, forumSummary });
})();
