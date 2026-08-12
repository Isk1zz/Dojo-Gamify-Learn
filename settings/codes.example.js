// ================================================
// CS Dojo — cheat codes TEMPLATE (this file IS committed)
// ------------------------------------------------
// Copy this file to settings/codes.js to enable codes locally:
//
//     cp settings/codes.example.js settings/codes.js
//
// codes.js is gitignored, so it is never committed, pushed or served.
// Without it, settings.js hides the Codes section entirely and none of
// these strings exist in the shipped JavaScript.
//
// That is the point. A private repo hides the SOURCE; GitHub Pages
// still serves the built site to anyone with the URL, and devtools
// reads it. The only real way to keep a code secret is not to ship it.
//
// If you change the codes, change them here too so a fresh clone still
// has something to copy.
//
// Full reference: docs/CHEATCODES.md
// ================================================

window.DOJO_CODES = (DB, Dojo) => ({
  admin613: () => {
    const ids = (typeof ALL_TOPICS !== "undefined" ? ALL_TOPICS : []).map(t => t.id);
    const n = DB.unlockAllTopics(ids);
    Dojo.Bus.emit("progress:changed", { reason: "admin" });
    return `Unlocked. ${n} topics marked complete.`;
  },
  // Like admin613, but for testing the custom flashcard deck builder —
  // that also needs completedChunks populated (admin613 only ever
  // touched completedTopics), since the picker's default selection and
  // its known/weak/new chip indicators both read chunk-level state, not
  // topic-level. Every unit/topic lock in the app is prereq-based off
  // completedTopics, so this also fully opens the roadmap and unit
  // list, same as admin613 does.
  unlockalltopics: () => {
    const topics = (typeof ALL_TOPICS !== "undefined" ? ALL_TOPICS : []);
    const n = DB.unlockAllTopics(topics.map(t => t.id));
    let chunks = 0;
    topics.forEach(t => {
      t.chunks.forEach((c, idx) => { DB.markChunkComplete(t.id, idx); chunks++; });
    });
    Dojo.Bus.emit("progress:changed", { reason: "admin" });
    return `Unlocked. ${n} topics and ${chunks} chunks marked complete — every unit, topic and chunk is now reachable.`;
  },
  agrala: () => {
    const n = DB.refillTickets();
    Dojo.Bus.emit("tickets:changed", { tickets: n });
    return `Tickets refilled to ${n}.`;
  },
  parnasa100: () => {
    DB.addMoney(100);
    Dojo.Bus.emit("wallet:changed", { delta: 100, reason: "code" });
    return `+$100. Wallet is now $${DB.getWallet()}.`;
  },
  capmyrank: () => {
    const R = Dojo.Ranks.RANKS;
    const top = R[R.length - 1];
    DB.setXp(top.xp);
    Dojo.applyTheme(DB.getTheme());
    Dojo.renderCharge();
    return `Rank set to ${top.name} (${top.xp} XP). Every reward unlocked.`;
  },
  nullmyrank: () => {
    DB.setXp(0);
    // A theme earned at a rank you no longer hold can't stay on —
    // applyTheme resolves ownership and falls back on its own.
    Dojo.applyTheme(DB.getTheme());
    Dojo.renderCharge();
    return `XP reset to 0. Back to ${Dojo.Ranks.RANKS[0].name}.`;
  }
});
