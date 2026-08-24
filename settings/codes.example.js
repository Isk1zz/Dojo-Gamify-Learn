// ================================================
// Knell — cheat codes TEMPLATE (this file IS committed)
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
//
// Empty by explicit request (2026-08-12) — the one code this held
// (`adminaccount`) needed to work on the deployed site too, which a
// gitignored file structurally can't do. It moved to a secret PROFILE
// NAME instead (data/db.js's createProfile/applyAdminStart) — that
// ships fine, since a name typed into the welcome modal isn't gated by
// what got committed. Add new codes here when there's something that
// genuinely only needs to work locally.
// ================================================

window.DOJO_CODES = (DB, Dojo) => ({});
