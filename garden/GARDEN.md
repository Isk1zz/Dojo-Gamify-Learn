# garden/ — plants and what they are worth

Plants are topics. Growth stage is driven by the **SM-2 review interval**, not
by how many topics are finished — so the Garden pictures *retention*, not
coverage. Lapsing a review drops a plant back. That is the app's whole argument
rendered as a picture; don't turn it into a completion tracker.

Stylesheet: `styles/garden.css`.

## Growth stages (v6)

| Stage | Interval | Weight |
|---|---|---|
| 🌑 Fallow | never attempted | — |
| 🌰 Seed | attempted, not mastered | — |
| 🌱 Sprout | mastered, ≤2d | 1 |
| 🌿 Seedling | ≥7d | 1 |
| 🌾 Growing | ≥21d | 2 |
| 🌳 Tree | ≥30d | 2 |
| 🌸 Blossom | ≥60d | 3 |

Thresholds were 6/16/45/120 in v4; the long tail meant almost nobody would
ever see a Tree. The column was `pays` until v6 — see *What the Garden is
worth* below for why it is now `weight`.

**`weight` mirrors the server's `garden_weight()` and must keep mirroring
it.** The server tiers on interval (≥60 → 3, ≥21 → 2, anything else mastered
→ 1, unmastered → 0); this table is the same split spelled out per stage. If
you move a threshold here, move it in the migration too, or the app will
promise an allowance the server refuses to grant.

## Grouped by course

The garden renders **one collapsible plot per course**, not a flat list of
units. With one course the flat list was fine; with several it becomes a wall
of beds you scroll past to reach the one you're actually studying.

- Grouped by **course** rather than unit, because a course is what a person
  thinks they're studying — units are how it's filed.
- Only one plot opens by default: the course with plants needing water, else
  the one with anything planted, else the first. Never all of them; opening
  everything is the same wall with extra clicks.
- Open state (`openCourses`) survives re-renders, so watering a plant doesn't
  fold the garden up under you.
- The head row carries the numbers that decide whether it's worth opening —
  planted count and due count.

## Review lives here

Spaced review used to be a "Review what's due" tile on the lobby, which framed
it as a chore in a list. It now surfaces where the picture already means
retention: **a topic due for review is a plant that needs watering.**

- Due plants get a 💧 marker and an accent-lit cell.
- A panel at the top of the screen counts them and starts the first one via
  `Dojo.startNextDueReview()` (owned by `library/`).
- `gardenSummary()` leads with the watering count, because that is the part
  with a deadline; the explainer comes last.
- **Watering is a flashcard deck, not a topic replay.** It used to re-walk
  every chunk plus the exam again; now it's a quick "knew it / didn't" pass
  built straight from each chunk's existing quiz — see the *Flashcard
  review* section of `library/LIBRARY.md`. The Garden doesn't know or care
  how the review happens, only that `DB.scheduleReview` gets called.

The lobby has no review tile. Don't add one back — two entry points for the
same action is how the Garden becomes decoration again.

## What the Garden is worth (v6 — replaces Dividends)

The Garden pays nothing directly any more. It does two things instead:

1. Sets the **daily reputation allowance** for the forum —
   `min(5, weight / 5)`.
2. Its **surplus** above that cap exchanges into `$` for cosmetics.

A folded panel on the screen explains both, and carries the live weight and
allowance in its head so it is worth reading even shut. It reuses the
course-plot fold (`.gc-head` / `.gc-inner`) rather than adding a second kind
of collapsible.

### Why the dividend panel is gone rather than disabled
Dividends were cut by decision, but the panel outlived the decision and kept
paying — `DB.addMoney` straight into the wallet, client-side, with no RPC
behind it and nothing on the server able to confirm it. Harmless only while
`$` bought nothing; a money printer the moment themes move into the shop,
and a flat contradiction of the rule that `$` comes from reputation surplus.
A panel that pays out for a system nobody kept is worse than no panel.

### gardenWeight() walks completed topics, NOT ALL_TOPICS
This is the correctness of the whole figure. `ALL_TOPICS` holds only the
courses whose content is currently loaded, so someone with six mastered
topics in a course they are not studying right now read as **weight 0 while
the server said 10**. The server counts `completed_topics` and has no idea
what the client has loaded. Count anything else here and the two disagree.

Everything the panel shows is **advisory**. The server recomputes it in
`garden_weight()` and `rep_allowance()` from its own copy of the progress and
takes nothing from the client. If the two ever disagree, the server is right
and the display is the bug.

## Exports
`GROWTH`, `growthFor`, `renderGarden`, `gardenSummary`, `gardenWeight`,
`repAllowance`

`gardenWeight` is exported because the forum needs the same figure. It must
not recompute it from `GROWTH` itself, or the two displays drift the first
time a tier moves.

## Reads / writes
Reads `DB.getReviews`, `getCompletedTopics`, `getStats`, and `ALL_TOPICS`.
**Writes nothing.** It stopped writing when the payout went.

## Emits
Nothing. `wallet:changed` was emitted only for the dividend payout.

## Open
The Garden was originally requested without a spec — this is one
interpretation. Decorations (lanterns, stones, paths) are stubbed as "coming
later" in the Shop and would be the natural next thing here.
