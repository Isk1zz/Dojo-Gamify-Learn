# garden/ — plants and dividends

Plants are topics. Growth stage is driven by the **SM-2 review interval**, not
by how many topics are finished — so the Garden pictures *retention*, not
coverage. Lapsing a review drops a plant back. That is the app's whole argument
rendered as a picture; don't turn it into a completion tracker.

Stylesheet: `styles/garden.css`.

## Growth stages (v5)

| Stage | Interval | Pays/day |
|---|---|---|
| 🌑 Fallow | never attempted | — |
| 🌰 Seed | attempted, not mastered | $1 |
| 🌱 Sprout | mastered, ≤2d | $3 |
| 🌿 Seedling | ≥7d | $5 |
| 🌾 Growing | ≥21d | $7 |
| 🌳 Tree | ≥30d | $13 |
| 🌸 Blossom | ≥60d | $17 |

Thresholds were 6/16/45/120 in v4; the long tail meant almost nobody would
ever see a Tree. `pays` lives in this table, not in `db.js`.

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
  with a deadline; dividends come second.

The lobby has no review tile. Don't add one back — two entry points for the
same action is how the Garden becomes decoration again.

## Dividends
One claim per 24 hours (`DB.getLastDividendClaim`). Pays the sum of every
plant's `pays`. This is the main non-gambling income line, and it is
deliberately tied to review interval: **the way to earn more is to keep
remembering things**, not to grind.

`claimDividends()` returns the amount actually paid — 0 means "nothing to pay"
or "too soon". Never animate a payout that didn't land.

## Exports
`GROWTH`, `growthFor`, `renderGarden`, `gardenSummary`, `dividendPreview`,
`claimDividends`, `msUntilClaim`

## Reads / writes
Reads `DB.getReviews`, `getCompletedTopics`, `getStats`, and `ALL_TOPICS`.
Writes only `wallet` and `lastDividendClaim`.

## Emits
`wallet:changed`

## Open
The Garden was originally requested without a spec — this is one
interpretation. Decorations (lanterns, stones, paths) are stubbed as "coming
later" in the Shop and would be the natural next thing here.
