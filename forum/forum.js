// ================================================
// Knell — FORUM
// ------------------------------------------------
// Replaces the Arcade (2026-08-15 decision). The tile, the route and
// the screen are all real; the POSTS are not, and cannot be yet.
//
// ---- Why this ships as a shell and says so ----
// A forum is inherently multi-user. This app is offline-first: its only
// store is localStorage, there is no server, and it deploys as static
// files to GitHub Pages. Two people running it share nothing — no
// posts, no replies, no reputation. Faking that with seeded "community"
// posts would be the one thing worse than an empty room: it would look
// like a forum, teach the mechanics, and then never have anybody in it.
//
// So this screen is honest about the state it's in, and shows the parts
// that ARE real today: your reputation balance, where it comes from,
// and the rule that governs it. It becomes a working forum when the
// Firebase port at the top of UPDATESTACK.md lands — that isn't a
// nice-to-have for this feature, it's the precondition.
//
// ---- The one rule ----
// Reputation cannot be spent on yourself. You earn the right to give in
// the Garden; your standing is only ever what other people gave you.
// That single constraint is what stops it collapsing into "grind, then
// inflate yourself", and it has to be enforced server-side when the
// backend exists — a client-side check is a suggestion, not a rule.
// ================================================

(() => {
  const showScreen = Dojo.showScreen;

  // Reputation is stored in the profile's `wallet` field. It was money
  // until 2026-08-15, when the Arcade (the thing money was for) became
  // this, and every cosmetic went free. Rather than migrate every
  // profile's saved balance to a new key, the field keeps its name in
  // storage and changes meaning — see data/db.js's getReputation.
  function reputation() {
    return DB.getReputation ? DB.getReputation() : (DB.getWallet ? DB.getWallet() : 0);
  }

  function renderForum() {
    const body = document.getElementById("forum-body");
    if (!body) return;

    body.innerHTML = `
      <div class="settings-section">
        <div class="stats-section-title">\u{1F44F} ${I18N.t("forum.repTitle")}</div>
        <div class="forum-rep">${reputation()}</div>
        <p class="settings-hint">
          ${I18N.t("forum.repNote")}
        </p>
      </div>

      <div class="settings-section">
        <div class="stats-section-title">\u{1F4DC} ${I18N.t("forum.ruleTitle")}</div>
        <p class="settings-hint">
          <strong>${I18N.t("forum.notYourself")}</strong> ${I18N.t("forum.ruleRest")}
        </p>
      </div>

      <div class="settings-section forum-empty">
        <div class="stats-section-title">\u{1F6A7} ${I18N.t("forum.emptyTitle")}</div>
        <p class="settings-hint">
          ${I18N.t("forum.empty1")}
        </p>
        <p class="settings-hint">
          ${I18N.t("forum.empty2")}
        </p>
      </div>`;

    showScreen("forum");
  }

  // The lobby tile's one-line summary, same seam every other branch uses.
  function forumSummary() {
    return I18N.t("ui.sum.forum", { n: reputation() });
  }

  Object.assign(Dojo, { renderForum, forumSummary });
})();
