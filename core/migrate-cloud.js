// ================================================
// Knell — CORE / the claim flow
// ------------------------------------------------
// BACKEND-ROADMAP.md Step 4. Runs once, on the first sign-in that finds
// unclaimed local study history, and uploads it to the account.
//
// ---- The one rule ----
// THE LOCAL COPY IS NEVER DELETED. Not after a successful upload, not
// on sign-out, not ever from this file. Phase 1 states it and it is
// restated here because "tidy up the now-redundant local copy" is the
// single most tempting wrong change anyone will be moved to make to
// this file later. If the upload is wrong, the local data is the only
// way back.
//
// ---- Why economy is not migrated ----
// `progress` and `profiles` upload; `economy` does not, and that is a
// security property rather than an omission. Local economy values live
// in localStorage, which the 2026-08-13 audit established anyone can
// edit — so migrating them would mean the cloud faithfully importing
// whatever token balance someone typed into devtools, laundering a
// local cheat into a server-blessed one. The `economy` table has no
// client write policy at all, so the attempt would fail regardless;
// this file does not even try, so nobody reads a failed write here as
// a bug to "fix".
//
// The cost is real and deliberate: a pre-gate profile that legitimately
// bought a course does not carry that purchase across. That needs a
// human decision (grant it server-side, or honour it some other way),
// not a client-trusted import. Flagged in UPDATESTACK.md rather than
// guessed at.
// ================================================

(() => {
  // camelCase profile field -> snake_case column, per table. Written out
  // rather than derived by regex: the mapping IS the contract with the
  // schema, and check-schema.js verifies the same pairing mechanically.
  const PROGRESS_MAP = {
    completedTopics: "completed_topics",
    completedChunks: "completed_chunks",
    reviews:         "reviews",
    seenQuotes:      "seen_quotes",
    stats:           "stats",
    streak:          "streak",
    storyProgress:   "story_progress",
    vitals:          "vitals",
    lastVitalTick:   "last_vital_tick",
    lastPosition:    "last_position",
    courseContracts: "course_contracts",
    finalQuiz:       "final_quiz"
  };

  const PROFILE_MAP = {
    name:          "name",
    avatar:        "avatar",
    ownedAvatars:  "owned_avatars",
    pinnedBadges:  "pinned_badges",
    theme:         "theme",
    lobbyStyle:    "lobby_style",
    starLinks:     "star_links",
    hexFlags:      "hex_flags",
    spokeFlags:    "spoke_flags",
    hintsEnabled:  "hints_enabled",
    soundEnabled:  "sound_enabled",
    bgStripe:      "bg_stripe",
    bgDecors:      "bg_decors",
    scene:         "scene",
    sky:           "sky",
    unitsUnlocked: "units_unlocked"
  };

  function toRow(profile, map) {
    const row = {};
    for (const [field, col] of Object.entries(map)) {
      if (profile[field] !== undefined) row[col] = profile[field];
    }
    return row;
  }

  // Is there anything here worth uploading? A profile created seconds
  // ago by the sign-in itself has nothing, and claiming it would burn
  // the one-shot marker on an empty snapshot — which would then block
  // the REAL local profile on that device from ever claiming.
  function hasRealHistory(p) {
    if (!p) return false;
    const topics = (p.completedTopics || []).length;
    const chunks = Object.keys(p.completedChunks || {}).length;
    const reviews = Object.keys(p.reviews || {}).length;
    const attempts = (p.stats && p.stats.examsTaken) || 0;
    return topics > 0 || chunks > 0 || reviews > 0 || attempts > 0;
  }

  // Returns one of:
  //   { status: "skipped", reason }   nothing to do, not an error
  //   { status: "claimed", topics }   uploaded this time
  //   { status: "failed",  error }    tried and could not
  //
  // Never throws: this runs inside the sign-in path, and a failed
  // migration must not stop someone entering an app they just proved
  // they own. Worst case they are signed in with local-only data, which
  // is exactly where they were a moment ago.
  async function claimIfNeeded() {
    try {
      if (!Dojo.Cloud || !Dojo.Cloud.isConfigured()) {
        return { status: "skipped", reason: "cloud not configured" };
      }
      const session = await Dojo.Cloud.getSession();
      if (!session) return { status: "skipped", reason: "no session" };

      const local = DB.getActiveProfile();
      if (!hasRealHistory(local)) {
        return { status: "skipped", reason: "no local history to claim" };
      }

      // The guard. Checked against the SERVER row, not a local flag,
      // so a second device or a cleared browser cannot re-run this and
      // overwrite good cloud progress with a stale local snapshot.
      const cloud = await Dojo.Cloud.progress.pull();
      if (cloud && cloud.migrated_at) {
        return { status: "skipped", reason: "already claimed at " + cloud.migrated_at };
      }

      await Dojo.Cloud.progress.push(
        Object.assign(toRow(local, PROGRESS_MAP), { migrated_at: new Date().toISOString() })
      );

      // Cosmetics and identity are a separate table and a separate
      // push. Deliberately AFTER progress: progress is the irreplaceable
      // half (the SM-2 review schedule), so if only one of the two
      // lands, it should be that one.
      try {
        await Dojo.Cloud.profiles.push(toRow(local, PROFILE_MAP));
      } catch (e) {
        console.info("[claim] progress uploaded; profile row did not:", e.message);
      }

      return { status: "claimed", topics: (local.completedTopics || []).length };
    } catch (e) {
      console.info("[claim] could not migrate:", e.message);
      return { status: "failed", error: e.message };
    }
  }

  Dojo.CloudMigrate = { claimIfNeeded, hasRealHistory, PROGRESS_MAP, PROFILE_MAP };
})();
