# UPDATESTACK.md — staged asks, not yet done

Working queue, separate from BACKLOG.md (which is the full historical
record). Items here get **erased on completion**, not marked `[x]` and
left — BACKLOG.md is where finished work gets written up. This file is
just "what's still owed."

## Ready to build, no blockers
Nothing right now — Tokens (earn, spend, Token Shop, course-price gating,
see BACKLOG.md) is done. Real-money purchases stay a labeled demo stub
until there's a payment account to wire a Payment Link to — that's a
you-side task, not a code blocker, see `shop/tokens.js`'s `buyPack()`.

## Live bug reports — to re-verify after the cache-version bump
Batch 30 (see BACKLOG.md) bumped `sw.js`'s `CACHE_VERSION` for the first
time all session — every fix below this point may already be live on
GitHub Pages but invisible on a device that visited before, since the
service worker's stale-while-revalidate strategy keeps serving an old
build until it's told a new one exists. **After this deploys, fully close
the tab/PWA and reopen it once** (a plain refresh isn't enough — see
`sw.js`'s own "Updating" comment) before re-checking any of these:
- Star lobby "broken" on phone (tiles overlapping) — reproduced on a
  375px mobile viewport with the CURRENT code and it renders correctly
  (clean 6-tile ring, no overlap). Strong suspect for stale cache, not a
  live bug — please re-test after the hard reopen above.
- Kirigami + background stripes "creating a mess" — `core/theme.js`'s
  `stripeCssFor` already suppresses the stripe layer entirely for any
  theme whose own `bg` is a repeating pattern (confirmed Kirigami,
  Terminal, AND Ronin all match), and recolors the stripe dark on light
  themes (Paper, Frost) for contrast. Checked all 7 striped-and-themed
  combinations in the data — the fix is already in place. Also a strong
  stale-cache suspect.

## Live bug reports — needs your input, not just a re-test
- **"Even after I bought the course I couldn't unlock it (phone &
  laptop)."** Two different explanations, and which one applies changes
  what (if anything) needs fixing:
  1. If you bought it on your PHONE and expected it to show unlocked on
     your LAPTOP too — that's the offline/no-account architecture
     working as designed, not a bug. Every device has its own separate
     local save (see the landing-page copy and the long-term roadmap
     entry below) — there is nowhere for a purchase to sync TO yet.
  2. If it stayed locked on the SAME device you bought it on — that's a
     real bug, and the likely cause is the stale-cache issue above (you
     may have bought it under an old JS bundle that predates some
     Tokens-related fix). Re-test after the hard reopen; tell me if it
     still fails on one device and I'll dig into that specifically.
- **Clicking a locked course should offer to preview its structure, and
  buy inline if affordable** — right now clicking a locked course card
  just routes straight to the Token Shop (`library/library.js`'s
  `renderCourseSelect`). Scoped idea, not yet built: a small
  preview/modal showing the course's unit list, with a "Buy for 🪙 N"
  button right there if the balance covers it, instead of forcing a
  screen change to browse away and come back. Needs a design pass
  before building — how much structure to reveal (unit titles only, or
  topic counts too?) and where the modal lives.
- **Token icon renders as silver on the phone screenshot, gold on
  laptop.** This is very likely a platform emoji-rendering difference
  (🪙 is drawn by the OS's own emoji font — iOS Apple Color Emoji vs.
  Windows/Chrome's — not something CSS controls), not a code bug. If
  exact cross-platform color consistency matters, the fix is swapping
  the emoji for a custom inline SVG coin icon everywhere Tokens are
  shown (`core/hud.js`, `shop/tokens.js`, `library/library.js`) — a
  real but small chunk of work. Confirm whether that's worth doing
  before I build it.

## New asks, not yet scoped (flagged, needs a decision first)
- XP-farming / bot-prevention on Final Quiz retries — no anti-abuse check
  exists yet on repeated attempts.
- Lock the Final Quiz until all topics AND all units are passed. Note:
  this reverses the "no hard locks" call the Final Quiz was just built
  under — confirm before building.

## Blocked on the backend (Supabase — assigned, nothing built)
- Career weekly XP ladder.
- Wallet "bank": deposits + 3 stocks (tied to the black market's live
  economy per your call — also blocked on that design).
- Black market (financial pyramid, bots).

## Blocked — no server to send it to
- Post-completion questionnaire (real data collection, no backend yet).

## Design conversation, not yet decided
- Lobby topology: proposed Trunk line / Binary orbit / Ladder rungs.
  Recommended Trunk line. Waiting on your pick before scoping.

## Marketing / growth — not engineering, needs your input to scope
- Research what's actually driving engagement on hype-topic study/growth
  content right now (what's working on TikTok/social for study apps).
- A model for how to actually market this — audience, channel, hook.
- A promo plan once there's something concrete to point people at.
None of this has a code deliverable yet — it's strategy work, flagged
here so it isn't lost, not something I can just start building.

## Long-term roadmap (later — needs the account/backend question settled first)
- Finish out the web app, then port to iOS and Android.
- Real account system + online database — currently offline/local-only
  (see landing page copy) on purpose, because nobody on the team knows
  databases yet. A friend who does is expected to be free "later" — this
  whole line (accounts, online DB, and everything above that's "Blocked
  on the backend") waits on that, rather than being half-designed now by
  someone who'd be guessing at the DB side.
