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

## Live bug reports — resolved since last check-in
- Star lobby "broken" on phone, and Kirigami+stripes "a mess" — both
  confirmed stale-cache artifacts (Batch 30's `CACHE_VERSION` bump);
  code was already correct. Fixed for good going forward.
- "Bought the course, couldn't unlock it" — real bug found: clicking a
  locked course redirected to the Token Shop where the actual buy
  button lived in a separate section further down the page. Fixed with
  a buy-inline modal on the course card itself (Batch 31); Token Shop
  no longer lists courses at all now.
- Mobile XP bar overflow, Career screen mobile overflow, Flashcards
  bypassing course ownership, Sources-box crowding the phase button —
  all found and fixed (Batches 32/33/37).

## Still open — needs your input
- **Token icon renders as silver on the phone screenshot, gold on
  laptop.** Very likely a platform emoji-rendering difference (🪙 is
  drawn by the OS's own emoji font, not CSS), not a code bug. Fix would
  be swapping the emoji for a custom inline SVG coin icon everywhere
  Tokens are shown — real but small work. Confirm it's worth doing
  before I build it.

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
