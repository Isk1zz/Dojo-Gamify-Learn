# UPDATESTACK.md — staged asks, not yet done

Working queue, separate from BACKLOG.md (which is the full historical
record). Items here get **erased on completion**, not marked `[x]` and
left — BACKLOG.md is where finished work gets written up. This file is
just "what's still owed."

## Open questions (need your answer before building)
- Landing page contradiction — tagline now says "Online study system,"
  the line right below it still says "No account needed — progress saves
  automatically, on this device." Left both as-is pending your call.

## Needs a design decision first
- Increase betting cap by upgrading user profile — likely rank-tied like
  themes/stripes, but that's a guess, not a decision.
- Stars currency for course pricing — 3rd currency, needs the ad-network
  question resolved.
- Buy stars for money to unlock courses — same currency question as above.

## Ready to build, no blockers
Nothing right now — both items from the last "ready to build" batch are
done (Final Quiz content + `unlockallunits`, see BACKLOG.md).

## New asks, not yet scoped (flagged, needs a decision first)
- XP-farming / bot-prevention on Final Quiz retries — no anti-abuse check
  exists yet on repeated attempts.
- Lock the Final Quiz until all topics AND all units are passed. Note:
  this reverses the "no hard locks" call the Final Quiz was just built
  under — confirm before building.
- Move the Final Quiz entry button from the top to the bottom of the
  unit-select list (currently listed first).

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
