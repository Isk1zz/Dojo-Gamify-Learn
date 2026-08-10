# data/ — persistence

`db.js` is the only file that touches `localStorage`. Key: `unit6-dojo-db`
(historical name, kept — renaming it would orphan every saved profile).

**db.js stores. Branches decide.** No prices, odds, payout tables, growth
thresholds or decay rates in this file, ever. If you are adding a tuning
number here, it belongs in the branch that owns the feature.

## Version 6

```js
{
  name, createdAt,
  completedTopics: [topicId],
  completedChunks: { topicId: [chunkIdx] },
  reviews: { topicId: { due, interval, ease, lapses, reps } },
  seenQuotes: [idx],

  // XP (⚡) — study progress. Historical keys; `chargeEarned` is the
  // lifetime total that RANK is computed from. Never spent, never capped.
  charge, chargeEarned, chargeSpent, ownedThemes: [themeId],

  theme, lastPosition: { unitId, topicId, chunkIdx } | null,

  // v5 — money ($), energy, arcade tickets, life sim
  wallet,
  tickets, ticketsUpdatedAt,
  lastDividendClaim,
  inventory: [itemId],
  storyProgress: { unlockedNodes: [], completedNodes: [] },
  vitals: { hunger, thirst, hygiene, shelterTier },

  stats: { miniQuizTotal, miniQuizCorrect, examQuestionsTotal,
           examQuestionsCorrect, examsTaken, examsPassed, topicStats }
}
```

### Migrations
`DB_VERSION` is 5; `migrate()` upgrades in place on load.

- v1→v2 legacy key folded into profiles
- v2→v3 `reviews` added, completed topics seeded due today
- v3→v4 `charge`, `theme`, `lastPosition`
- v4→v5 `chargeEarned`/`chargeSpent`/`ownedThemes`, then `wallet`, `energy`,
  `tickets`, `lastDividendClaim`, `inventory`, `storyProgress`, `vitals`
- v5→v6 energy retired and the XP cap removed. `chargeEarned` is topped up to
  at least the held balance so a long-standing profile doesn't rank from zero.
  The `energy` field is left in place on old profiles — migrations never drop
  fields — but nothing reads it.

**Every migration is additive with a safe default. Never drop a field.**
`miniQuiz*` keys are historical — the UI says "Questions". Change labels in
the branch, never keys here.

## Lazy regeneration
Tickets are **not** on a timer. `regen()` works out how much time passed since
the stored timestamp and credits that on read, which keeps the number correct
after the tab has been closed for three days.

- Tickets: 7 max, 7 per 6h

## All-or-nothing spends
`spendMoney` and `spendTicket` return a boolean and change nothing on failure,
so a caller can never half-buy something. `addXp` has no failure mode — XP is
uncapped and never spent.

## Gotchas
- `completedChunks` powers resume. It went unread for a long time. Don't
  "clean it up".
- `unlockAllTopics` (the admin code) deliberately does not touch reviews,
  stats or the wallet — a cheated profile should still look cheated in Stats.
