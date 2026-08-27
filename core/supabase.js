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

  Dojo.Cloud = {
    isConfigured,
    signUp, signIn, signOut, getSession, onAuthStateChange,
    profiles: table("profiles"),
    progress: table("progress"),
    economy
  };
})();
