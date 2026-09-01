// ================================================
// Knell — CORE / accounts
// ------------------------------------------------
// The sign-in gate. Owns the #auth-modal UI and the one question the
// rest of the app asks it: "may this person study?"
//
// Implements BACKEND-ROADMAP.md Step 3. Talks to Supabase only through
// Dojo.Cloud (core/supabase.js) — no direct client, no direct table
// access, and nothing here ever touches the economy.
//
// ---- Mandatory account, NOT mandatory connection ----
// Login is required (Step 0's decision). It is deliberately NOT
// implemented as "block the app whenever there is no live session",
// because this is an offline-first installable PWA: sw.js caches the
// whole thing so it runs with no network, and gating on a live session
// would lock someone out of a fully-cached app the moment a refresh
// token lapsed on a plane.
//
// So the gate reads a localStorage marker — "has this device ever
// completed a sign-in" — which costs no network call. First launch
// needs connectivity exactly once, to create the account. After that,
// studying always works; only SYNC waits for the network.
//
// ---- What this file does NOT do yet ----
// No ongoing cloud sync (Step 6): after sign-in, study writes still go
// to the local profile only and nothing pushes them up as you go.
//
// The one-time claim (Step 4) IS wired, but lives in
// core/migrate-cloud.js rather than here — this file owns identity, that
// one owns data movement. It is called once from the sign-in path below.
// ================================================

(() => {
  const Bus = Dojo.Bus;

  // Whether this device has ever completed a sign-in. Its own key, not
  // derived from Supabase's session storage: that entry is cleared on
  // sign-out and on token expiry, and both of those must still leave a
  // returning user able to open the app offline.
  //
  // Name matches the app's existing convention of a stable key that
  // addresses data (see data/db.js's note on never renaming these).
  const GATE_KEY = "knell-has-account";

  function hasAccount() {
    try { return localStorage.getItem(GATE_KEY) === "1"; }
    catch (e) { return false; }   // private mode, storage blocked, etc.
  }
  function markHasAccount() {
    try { localStorage.setItem(GATE_KEY, "1"); } catch (e) { /* non-fatal */ }
  }

  // ---- Error text ---------------------------------------------------
  // Supabase returns operator-facing English strings. Map the ones a
  // normal person can actually hit onto translated, actionable text;
  // anything unmapped falls through with its original message rather
  // than being swallowed into a useless "something went wrong".
  function friendlyError(err) {
    const raw = (err && err.message) || "";
    const m = raw.toLowerCase();
    if (m.includes("invalid login credentials")) return I18N.t("auth.badLogin");
    if (m.includes("email not confirmed"))       return I18N.t("auth.notConfirmed");
    if (m.includes("already registered") ||
        m.includes("already been registered"))   return I18N.t("auth.emailTaken");
    if (m.includes("rate limit"))                return I18N.t("auth.rateLimited");
    if (m.includes("failed to fetch") ||
        m.includes("networkerror"))              return I18N.t("auth.offline");
    return raw || I18N.t("auth.badLogin");
  }

  // ---- UI ------------------------------------------------------------
  let mode = "in";           // "in" | "up"
  let busy = false;

  const $ = id => document.getElementById(id);

  function showError(msg) {
    const box = $("auth-error");
    if (!box) return;
    // textContent, not innerHTML: friendlyError can pass a raw server
    // string straight through, and a server message is not markup.
    box.textContent = msg;
    box.style.display = msg ? "block" : "none";
  }

  function setMode(next) {
    mode = next;
    $("auth-tab-in").classList.toggle("active", next === "in");
    $("auth-tab-up").classList.toggle("active", next === "up");
    $("auth-row-nickname").style.display = next === "up" ? "" : "none";
    $("auth-row-country").style.display  = next === "up" ? "" : "none";
    $("auth-submit-label").textContent =
      I18N.t(next === "up" ? "auth.signUpBtn" : "auth.signInBtn");
    // A password manager offers to SAVE on a new-password field and to
    // FILL on a current-password one; getting this wrong is why signup
    // forms so often autofill the wrong thing.
    $("auth-password").setAttribute("autocomplete",
      next === "up" ? "new-password" : "current-password");
    showError("");
  }

  function setBusy(on) {
    busy = on;
    const btn = $("auth-submit");
    if (!btn) return;
    btn.disabled = on;
    $("auth-submit-label").textContent = on
      ? I18N.t("auth.working")
      : I18N.t(mode === "up" ? "auth.signUpBtn" : "auth.signInBtn");
  }

  function open() {
    const m = $("auth-modal");
    if (!m) return;
    m.style.display = "flex";
    $("auth-form").style.display = "";
    $("auth-sent").style.display = "none";
    setMode("in");
    setTimeout(() => $("auth-email").focus(), 100);
  }

  function close() {
    const m = $("auth-modal");
    if (m) m.style.display = "none";
  }

  // ---- The local profile behind the account --------------------------
  // Identity lives in Supabase; the app's own data still lives in the
  // local profile, and every branch reads that. So a signed-in person
  // needs one. Created here rather than in core/profile.js because the
  // NAME comes from the account (the nickname typed at signup, or the
  // cloud profile row), not from the local "what should we call you?"
  // prompt this replaces.
  function ensureLocalProfile(name) {
    if (DB.getActiveProfile()) return;
    DB.createProfile(name || I18N.t("profile.defaultName"));
    if (Bus) Bus.emit("profile:changed");
  }

  async function submit() {
    if (busy) return;
    const email = ($("auth-email").value || "").trim();
    const password = $("auth-password").value || "";
    const nickname = ($("auth-nickname").value || "").trim();
    const country = ($("auth-country").value || "").trim();

    if (!email || !password) return showError(I18N.t("auth.needEmailPass"));
    if (mode === "up") {
      if (!nickname) return showError(I18N.t("auth.needNickname"));
      // Matches the project's own minimum (Supabase Auth > Email >
      // "Minimum password length"), checked here so the message is
      // immediate and translated rather than a round-trip in English.
      if (password.length < 6) return showError(I18N.t("auth.shortPassword"));
    }

    setBusy(true);
    showError("");
    try {
      if (mode === "up") {
        await Dojo.Cloud.signUp(email, password);
        // Email confirmation is ON, so no session comes back and the
        // person cannot sign in yet. Say that explicitly — a login that
        // silently fails afterwards is the worst version of this.
        //
        // The nickname and country are held locally until the first
        // successful sign-in writes them to the cloud profile row.
        // Nothing can be written now: with no session, RLS correctly
        // refuses, which is the system working.
        try {
          localStorage.setItem("knell-pending-signup",
            JSON.stringify({ nickname, country }));
        } catch (e) { /* non-fatal; they can rename in the profile menu */ }

        $("auth-form").style.display = "none";
        $("auth-sent").style.display = "";
        $("auth-sent-body").innerHTML = I18N.t("auth.checkInboxBody", {
          // Escaped: an email address is user input and this one goes
          // through innerHTML for the <strong> in the template.
          email: email.replace(/[&<>"]/g, c =>
            ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]))
        });
        return;
      }

      // ---- sign in ----
      await Dojo.Cloud.signIn(email, password);

      let pending = null;
      try { pending = JSON.parse(localStorage.getItem("knell-pending-signup") || "null"); }
      catch (e) { pending = null; }

      // Name the local profile after the cloud one where possible, so
      // the same account looks the same on a second device.
      let name = (pending && pending.nickname) || "";
      if (!name) {
        try {
          const row = await Dojo.Cloud.profiles.pull();
          if (row && row.name) name = row.name;
        } catch (e) { /* offline or row missing — fall through to default */ }
      }

      markHasAccount();

      // ORDER MATTERS. The claim (Step 4) has to run against the local
      // profile that existed BEFORE this sign-in, so it goes ahead of
      // ensureLocalProfile() -- which would otherwise create an empty
      // one on a fresh device and leave the claim looking at that
      // instead of at real history.
      //
      // Awaited, not fired-and-forgotten: closing the modal first would
      // drop someone into a lobby rendering local data that is halfway
      // through being uploaded. It is a one-time cost on one sign-in.
      if (Dojo.CloudMigrate) {
        const claim = await Dojo.CloudMigrate.claimIfNeeded();
        if (claim.status === "claimed") {
          console.info(`[auth] claimed ${claim.topics} completed topic(s) into this account.`);
        }
      }

      // AFTER the claim, deliberately. The claim uploads the local
      // profile including its name, so writing the sign-up nickname
      // first meant the old local name silently won -- caught in the
      // 2026-08-27 run-through, where an account created as "RunThru"
      // came back named "PreGateUser".
      //
      // The nickname is the more recent and more explicit statement of
      // what someone wants to be called, so it lands last. Best-effort:
      // a failure here must not block entry to an app they just proved
      // they own.
      if (pending) {
        try {
          const patch = {};
          if (pending.nickname) patch.name = pending.nickname;
          if (pending.country) patch.country = pending.country;
          if (Object.keys(patch).length) await Dojo.Cloud.profiles.push(patch);
          localStorage.removeItem("knell-pending-signup");
        } catch (e) {
          console.info("[auth] could not write profile row yet:", e.message);
        }
      }

      ensureLocalProfile(name);
      close();
      if (Dojo.updateProfileBadge) Dojo.updateProfileBadge();
      if (Dojo.showLobby) Dojo.showLobby();
    } catch (e) {
      showError(friendlyError(e));
    } finally {
      setBusy(false);
    }
  }

  // ---- The gate -------------------------------------------------------
  // Called instead of core/profile.js's checkProfile() from the landing
  // page's Start button. Returns true when the app may proceed.
  function requireAccount() {
    if (!hasAccount()) { open(); return false; }
    // Signed in on this device before: let them in regardless of whether
    // a session can be refreshed right now. Sync is what waits for the
    // network, never study.
    ensureLocalProfile();
    return true;
  }

  async function signOut() {
    try { await Dojo.Cloud.signOut(); }
    catch (e) { console.info("[auth] sign-out call failed (likely offline):", e.message); }
    // The gate marker is cleared deliberately: signing out should mean
    // the next launch asks who you are. Local profiles and their
    // progress are NOT touched — nothing here deletes study data.
    try { localStorage.removeItem(GATE_KEY); } catch (e) { /* ignore */ }
    open();
  }

  // Erase the account, then this device. ORDER MATTERS: the cloud call
  // goes FIRST and its failure aborts the whole thing. Wiping local
  // first would leave someone with no data and a live account they can
  // no longer reach the delete button from — the exact opposite of what
  // they asked for.
  async function deleteAccount() {
    await Dojo.Cloud.deleteAccount();     // throws -> nothing local is touched

    // Only now is it safe to clear the device. The gate marker goes so
    // the next launch asks who you are, and the local profile goes
    // because leaving study data behind after "delete everything" would
    // be its own broken promise.
    try {
      const p = DB.getActiveProfile();
      if (p && DB.deleteProfile) DB.deleteProfile(p.id);
    } catch (e) { console.info("[auth] local profile cleanup:", e.message); }
    try {
      localStorage.removeItem(GATE_KEY);
      localStorage.removeItem("knell-pending-signup");
    } catch (e) { /* ignore */ }
  }

  // Current account email, for display. Null when offline or expired —
  // callers must treat that as "unknown", never as "signed out".
  async function currentEmail() {
    try {
      const s = await Dojo.Cloud.getSession();
      return s ? s.user.email : null;
    } catch (e) { return null; }
  }

  // ---- Wiring ---------------------------------------------------------
  function bind() {
    if (!$("auth-modal")) return;
    $("auth-tab-in").addEventListener("click", () => setMode("in"));
    $("auth-tab-up").addEventListener("click", () => setMode("up"));
    $("auth-submit").addEventListener("click", submit);
    $("auth-back").addEventListener("click", () => {
      $("auth-sent").style.display = "none";
      $("auth-form").style.display = "";
      setMode("in");
    });
    ["auth-email", "auth-password", "auth-nickname", "auth-country"].forEach(id => {
      const el = $(id);
      if (el) el.addEventListener("keydown", e => { if (e.key === "Enter") submit(); });
    });
  }
  bind();

  Dojo.Auth = { requireAccount, hasAccount, open, close, signOut, currentEmail, deleteAccount };
})();
