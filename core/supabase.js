// ================================================
// Knell — Supabase client
// ------------------------------------------------
// The first real dependency this project has — see docs/BACKEND-ROADMAP.md
// Phase 1, point 2: "the 'no build step, no dependencies' property in
// ARCHITECTURE.md ends here." Loaded via CDN script tag like everything
// else, not npm — there is still no build step.
//
// ---- What this file does and does not do ----
// This is plumbing only: a client, auth, and read/write helpers for the
// three tables in supabase/migrations/0001_init.sql. It does NOT touch
// core/profile.js's UI, does NOT auto-migrate localStorage on load, and
// does NOT run unless something calls it. Local-only mode keeps working
// exactly as it does today — see Phase 1 point 4. Wiring a sign-in
// screen into the profile modal is next session's work, once this
// plumbing is confirmed against the real project.
//
// ---- Why economy has no write helper ----
// Dojo.Cloud.economy.pull() exists; there is no push(). That is not an
// oversight — see the migration's comment on the economy table. Writing
// XP, tokens, or wallet from the client is exactly the hole
// BACKEND-ROADMAP.md's Phase 3 exists to close. When the RPC functions
// (award_xp, spend_tokens, claim_dividend, ...) get written, THAT is
// where economy mutation goes — a Postgres function call, never a
// direct table write.
//
// ---- Configuration ----
// SUPABASE_URL and SUPABASE_PUBLISHABLE_KEY are safe to hardcode and commit —
// the anon key is designed to sit in client code. It authenticates as
// the "anonymous/public" Postgres role; RLS is what actually protects
// data, not secrecy of this key. The service_role key is the one that
// must never appear here — it bypasses RLS entirely.
// ================================================

(() => {
  const SUPABASE_URL = "https://sadelbwxiplsbisvyzsx.supabase.co";
  // Supabase renamed these in 2026: what the header below calls the
  // "anon key" is now the PUBLISHABLE key (sb_publishable_...). Same
  // role, same safety property — it is meant to sit in client code and
  // RLS is what actually protects the data. The old anon/service_role
  // pair still exists under a "Legacy API keys" tab; this project uses
  // the new format.
  //
  // Its counterpart is the SECRET key (sb_secret_..., formerly
  // service_role). That one bypasses RLS completely and must never
  // appear in this file, in this repo, or anywhere a browser can read.
  const SUPABASE_PUBLISHABLE_KEY = "sb_publishable_co6T7kHmuZ00IGB_6gOQ4A_YR5P7WIM";

  function isConfigured() {
    return !!(SUPABASE_URL && SUPABASE_PUBLISHABLE_KEY);
  }

  let client = null;
  function getClient() {
    if (!isConfigured()) {
      throw new Error(
        "[Cloud] Supabase is not configured. Set SUPABASE_URL and " +
        "SUPABASE_PUBLISHABLE_KEY at the top of core/supabase.js — both come " +
        "from Project Settings > API in the Supabase dashboard, and " +
        "neither is a secret."
      );
    }
    if (!client) {
      if (typeof window.supabase === "undefined") {
        throw new Error(
          "[Cloud] The supabase-js CDN script did not load. Check the " +
          "<script src> tag in index.html is BEFORE core/supabase.js."
        );
      }
      client = window.supabase.createClient(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);
    }
    return client;
  }

  // ---- Auth --------------------------------------------------------

  async function signUp(email, password) {
    const { data, error } = await getClient().auth.signUp({ email, password });
    if (error) throw error;
    return data;
  }

  async function signIn(email, password) {
    const { data, error } = await getClient().auth.signInWithPassword({ email, password });
    if (error) throw error;
    return data;
  }

  async function signOut() {
    const { error } = await getClient().auth.signOut();
    if (error) throw error;
  }

  async function getSession() {
    const { data, error } = await getClient().auth.getSession();
    if (error) throw error;
    return data.session;
  }

  // fn receives (event, session). Returns an unsubscribe function.
  function onAuthStateChange(fn) {
    const { data } = getClient().auth.onAuthStateChange(fn);
    return () => data.subscription.unsubscribe();
  }

  // ---- profiles / progress: client-writable, own row only ------------
  // Both follow the same shape: pull() reads the caller's row, push(patch)
  // updates only the given keys (never a blind overwrite, so a stale tab
  // can't clobber fields it never touched).

  function table(name) {
    return {
      async pull() {
        const session = await getSession();
        if (!session) return null;
        const { data, error } = await getClient()
          .from(name)
          .select("*")
          .eq(name === "profiles" ? "id" : "user_id", session.user.id)
          .single();
        if (error) throw error;
        return data;
      },
      async push(patch) {
        const session = await getSession();
        if (!session) throw new Error("[Cloud] push() called with no signed-in session.");
        const idCol = name === "profiles" ? "id" : "user_id";
        const { data, error } = await getClient()
          .from(name)
          .update(patch)
          .eq(idCol, session.user.id)
          .select()
          .single();
        if (error) throw error;
        return data;
      }
    };
  }

  // ---- economy: read-only from the client, on purpose -----------------
  const economy = {
    async pull() {
      const session = await getSession();
      if (!session) return null;
      const { data, error } = await getClient()
        .from("economy")
        .select("*")
        .eq("user_id", session.user.id)
        .single();
      if (error) throw error;
      return data;
    }
    // No push(). See the file header and the migration's comment on
    // the economy table for why this is not an oversight.
  };

  // Resolves a nickname to its account email so sign-in can accept
  // either (0007). Returns null when there is no such nickname.
  async function emailForNickname(nickname) {
    const { data, error } = await getClient().rpc("email_for_nickname", { nickname });
    if (error) throw error;
    return data || null;
  }

  async function nicknameAvailable(nickname) {
    const { data, error } = await getClient().rpc("nickname_available", { nickname });
    if (error) throw error;
    return !!data;
  }

  // Server-side purchase (0003/0004). Returns the RPC's own verdict:
  // { status: "bought"|"already_owned", charged, tokens_left }. Throws
  // on refusal, so "insufficient tokens" cannot be mistaken for success
  // — a lesson from 0004, where a failed buy returned HTTP 200.
  async function buyCourse(courseId) {
    const { data, error } = await getClient().rpc("buy_course", { course_id: courseId });
    if (error) throw error;
    return data;
  }

  // Claim payment for one piece of finished work.
  //
  // This REPLACES awardXp, which sent an amount and had it believed.
  // Four console calls put 800 XP on an account that had studied
  // nothing, and the Career ladder hands out 795 Tokens on the way up,
  // so the hole ended at paid content rather than at a vanity number.
  // award_xp is revoked server-side as of 0012; the wrapper is gone
  // rather than left broken.
  //
  // The client no longer says HOW MUCH. It says WHICH PIECE OF WORK,
  // and the server decides what that is worth, whether it was already
  // paid, whether it came too fast, and whether the day's ceiling is
  // reached. `scorePct` is only ever a multiplier between 0.7x and 1.5x
  // on a figure the server computed, clamped there — it is passed for
  // the topic bonus and left out everywhere else.
  //
  // Never throws on a refusal. "already paid", "too fast" and "no such
  // item" are ordinary answers, not failures, and a caller should not
  // have to tell them apart from a dropped connection.
  async function claimEarning(itemId, scorePct) {
    const { data, error } = await getClient()
      .rpc("claim_earning", { item_id: itemId, score_pct: scorePct ?? null });
    if (error) throw error;
    return data;
  }

  // Everything the Forum needs to draw a person's standing, in one call.
  //
  // Returns allowance, left_today, spent_today, given_total,
  // received_month, received_total and garden_weight — all derived from
  // the rep_grants journal rather than from stored counters, which is
  // why the season resets on its own: "this month" is a WHERE clause,
  // not an event somebody has to remember to fire.
  //
  // No argument on purpose. The server reads auth.uid(), so this cannot
  // be aimed at anyone else. Reading a DIFFERENT person's figures needs
  // its own RPC and its own decision about what a stranger may see —
  // see FORUM-PLAN.md step 3.
  async function repStatus() {
    const { data, error } = await getClient().rpc("rep_status");
    if (error) throw error;
    return data;
  }

  // ---- Forum reading ------------------------------------------------

  // One page of the feed, with author names already attached.
  //
  // Two calls, not a join: posts and profiles cannot be joined through
  // PostgREST here, because profiles is readable only for your own row
  // (0001's "read own" policy, deliberately kept). Author identity comes
  // from public_profiles (0017), which publishes name, avatar and pinned
  // badges and nothing else — country in particular stays private.
  //
  // Sorted by score then date, per FORUM-PLAN.md step 4. Hidden posts
  // are excluded by the read policy in 0008, not by this query — a
  // client-side filter would be a suggestion.
  async function feed({ limit = 30, before = null } = {}) {
    let q = getClient()
      .from("posts")
      .select("id, author, body, score, created_at")
      .order("score", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(limit);
    if (before) q = q.lt("created_at", before);

    const { data: posts, error } = await q;
    if (error) throw error;
    if (!posts.length) return [];

    const ids = [...new Set(posts.map(p => p.author))];
    const { data: people, error: pe } = await getClient()
      .rpc("public_profiles", { ids });
    if (pe) throw pe;

    const by = {};
    (people || []).forEach(p => { by[p.id] = p; });
    // An author with no profile row still gets a post rendered. Losing
    // the whole feed because one row is missing would be the wrong
    // trade — the post is the content, the name is the decoration.
    return posts.map(p => ({ ...p, person: by[p.author] || null }));
  }

  // Which of these posts the caller has already given a point to.
  // rep_grants is readable for your own rows only, which is exactly the
  // question being asked.
  async function myGrants(postIds) {
    if (!postIds.length) return [];
    const { data, error } = await getClient()
      .from("rep_grants").select("post").in("post", postIds);
    if (error) throw error;
    return (data || []).map(r => r.post);
  }

  // Give one point. Every rule lives in the RPC (0010/0011): not your
  // own post, once per post, ten per author per month, the daily
  // allowance, and a transaction lock so two clicks cannot both land.
  // Refusals come back as data with a status, not as an exception.
  async function grantReputation(postId) {
    const { data, error } = await getClient()
      .rpc("grant_reputation", { post_id: postId });
    if (error) throw error;
    return data;
  }

  // ---- Forum writing --------------------------------------------------
  // All three are RPCs, never inserts. The server sets author from
  // auth.uid(), so nothing can be published under another name, and the
  // daily caps live in the same function as the insert (0018).

  // Returns { status: "posted", id, left_today } or
  // { status: "daily_cap", cap, today }. A refused post is data, not an
  // exception — running out of allowance is an ordinary afternoon.
  async function createPost(text) {
    const { data, error } = await getClient().rpc("create_post", { body: text });
    if (error) throw error;
    return data;
  }

  async function createReply(postId, text) {
    const { data, error } = await getClient()
      .rpc("create_reply", { post_id: postId, body: text });
    if (error) throw error;
    return data;
  }

  // What is left to write today. Read before the compose box opens, so
  // it can say the number rather than letting somebody type at length
  // and only then learn they had nothing left.
  async function writeStatus() {
    const { data, error } = await getClient().rpc("write_status");
    if (error) throw error;
    return data;
  }

  // A thread's replies, oldest first — a conversation reads forwards.
  async function replies(postId) {
    const { data, error } = await getClient()
      .from("replies")
      .select("id, author, body, created_at")
      .eq("post", postId)
      .order("created_at", { ascending: true });
    if (error) throw error;
    if (!data.length) return [];

    const ids = [...new Set(data.map(r => r.author))];
    const { data: people, error: pe } = await getClient()
      .rpc("public_profiles", { ids });
    if (pe) throw pe;
    const by = {};
    (people || []).forEach(p => { by[p.id] = p; });
    return data.map(r => ({ ...r, person: by[r.author] || null }));
  }

  // GDPR Art. 17. Calls the RPC in 0005_delete_account.sql, which
  // deletes the CALLER's auth.users row; the three data tables follow by
  // ON DELETE CASCADE. Takes no argument on purpose — the server picks
  // the target from auth.uid(), so this cannot be aimed at anyone else.
  async function deleteAccount() {
    const { error } = await getClient().rpc("delete_account");
    if (error) throw error;
  }

  Dojo.Cloud = {
    isConfigured,
    deleteAccount, buyCourse, claimEarning, repStatus,
    feed, myGrants, grantReputation,
    createPost, createReply, writeStatus, replies,
    emailForNickname, nicknameAvailable,
    signUp, signIn, signOut, getSession, onAuthStateChange,
    profiles: table("profiles"),
    progress: table("progress"),
    economy
  };
})();
