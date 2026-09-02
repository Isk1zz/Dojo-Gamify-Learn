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
  let posts = null;      // last loaded page, or null before the first
  let granted = new Set(); // post ids this account has already paid for
  let me = null;         // own user id, so "your own post" can be shown

  const esc = s => String(s == null ? "" : s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

  // Post bodies are written by other people. They are inserted as TEXT,
  // never as markup — a forum that renders a stranger's HTML is a forum
  // that runs a stranger's script.
  const body = s => esc(s).replace(/\n/g, "<br>");

  function whenText(iso) {
    const mins = Math.floor((Date.now() - new Date(iso).getTime()) / 60000);
    if (mins < 1)   return I18N.t("forum.justNow");
    if (mins < 60)  return I18N.t("forum.minsAgo",  { n: mins });
    const h = Math.floor(mins / 60);
    if (h < 24)     return I18N.t("forum.hoursAgo", { n: h });
    return I18N.t("forum.daysAgo", { n: Math.floor(h / 24) });
  }

  async function fetchStatus() {
    if (!Dojo.Cloud || !Dojo.Cloud.isConfigured()) return { state: "no_backend" };
    let session = null;
    try { session = await Dojo.Cloud.getSession(); } catch (e) { /* offline */ }
    if (!session) return { state: "offline" };
    me = session.user.id;
    try {
      const s = await Dojo.Cloud.repStatus();
      return { state: "ok", s };
    } catch (e) {
      console.info("[forum] rep_status unavailable:", e.message);
      return { state: "offline" };
    }
  }

  // The feed, and which of it this account has already paid for. Both
  // in one place because rendering a give-button without knowing which
  // posts are already granted would offer an action the server refuses.
  async function fetchFeed() {
    try {
      const list = await Dojo.Cloud.feed({ limit: 30 });
      const mine = await Dojo.Cloud.myGrants(list.map(p => p.id));
      posts = list;
      granted = new Set(mine);
    } catch (e) {
      console.info("[forum] feed unavailable:", e.message);
      posts = null;
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

  // One post. The give-button carries its own reason for being off, so
  // a person is never left clicking something that quietly does nothing.
  function postHtml(p, status) {
    const mine = p.author === me;
    const already = granted.has(p.id);
    const noneLeft = !status || status.state !== "ok" || status.s.left_today <= 0;

    let label, why = "", off = true;
    if (mine)            { label = I18N.t("forum.yours"); }
    else if (already)    { label = I18N.t("forum.gave"); }
    else if (noneLeft)   { label = I18N.t("forum.give"); why = I18N.t("forum.noAllowance"); }
    else                 { label = I18N.t("forum.give"); off = false; }

    const who = p.person ? esc(p.person.name) : I18N.t("forum.unknownAuthor");
    const av  = p.person && p.person.avatar ? esc(p.person.avatar) : "\u{1F464}";

    return `
      <article class="post${mine ? " own" : ""}">
        <div class="post-head">
          <span class="post-av">${av}</span>
          <span class="post-who">${who}</span>
          <span class="post-when">${whenText(p.created_at)}</span>
        </div>
        <div class="post-body">${body(p.body)}</div>
        <div class="post-foot">
          <span class="post-score" title="${esc(I18N.t("forum.scoreTip"))}">
            \u{1F44F} <span class="ps-num">${p.score}</span>
          </span>
          <button class="post-give${already ? " done" : ""}"
                  data-post="${esc(p.id)}"
                  ${off ? "disabled" : ""}
                  ${why ? `title="${esc(why)}"` : ""}>${label}</button>
        </div>
      </article>`;
  }

  function feedHtml(status) {
    // Not loaded, or the request failed. The figures panel above already
    // says why the server is unreachable; repeating it here would be
    // two complaints about one problem.
    if (posts === null) {
      return `<p class="settings-hint">${I18N.t("forum.feedUnavailable")}</p>`;
    }
    if (!posts.length) {
      return `
        <p class="settings-hint">${I18N.t("forum.empty1")}</p>
        <p class="settings-hint">${I18N.t("forum.empty2")}</p>`;
    }
    return `<div class="post-list">${posts.map(p => postHtml(p, status)).join("")}</div>`;
  }

  function paint(r) {
    const root = document.getElementById("forum-body");
    if (!root) return;

    const empty = posts === null || !posts.length;

    root.innerHTML = `
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

      <div class="settings-section${empty ? " forum-empty" : ""}">
        <div class="stats-section-title">${empty ? "\u{1F6A7}" : "\u{1F4AC}"} ${
          I18N.t(empty ? "forum.emptyTitle" : "forum.feedTitle")}</div>
        ${feedHtml(r)}
      </div>`;

    root.querySelectorAll(".post-give:not([disabled])").forEach(btn => {
      btn.addEventListener("click", () => give(btn));
    });
  }

  // Giving. The server decides; this only reports what it decided.
  //
  // The button is disabled immediately, before the round trip, so a
  // double click cannot send two grants. The RPC would refuse the
  // second anyway (unique (giver, post), plus the transaction lock in
  // 0011), but making the UI depend on that is how a "why did nothing
  // happen" bug gets written.
  async function give(btn) {
    const id = btn.getAttribute("data-post");
    btn.disabled = true;
    btn.textContent = I18N.t("forum.giving");
    try {
      const r = await Dojo.Cloud.grantReputation(id);
      if (r && r.status === "granted") {
        granted.add(id);
        const p = posts.find(x => x.id === id);
        // The score the SERVER returned, not score + 1 — if the two
        // ever differ, the server is right.
        if (p && r.score != null) p.score = r.score;
      }
      // "already_granted" lands here too, and is the correct outcome of
      // a reload racing a click: mark it and move on.
      if (r && r.status === "already_granted") granted.add(id);
    } catch (e) {
      // A refusal the RPC raises rather than returns — own post, hidden
      // post, allowance spent, monthly limit. Its message is written to
      // be read.
      console.info("[forum] grant refused:", e.message);
    }
    cached = await fetchStatus();
    await fetchFeed();
    paint(cached);
  }

  function renderForum() {
    // Paint immediately with whatever is known, then repaint when the
    // server answers. Showing a blank screen for the length of a round
    // trip would be worse than showing the rule and the empty notice,
    // neither of which depends on the network.
    paint(cached || { state: "loading" });
    showScreen("forum");
    fetchStatus().then(async r => {
      cached = r;
      paint(r);                       // figures first — they arrive first
      if (r.state === "ok") { await fetchFeed(); paint(r); }
    });
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
