# Knell — Project Reference

Everything about how this app works, why it's built this way, and what's still open.
**Read this first if you're picking the project up cold.**

Last updated: August 2026 — the Arcade became the Forum, money became reputation,
and every cosmetic went free. If a section below contradicts that, the section is
older than the change.

---

## 1. What it is

A study app that fights forgetting. Content is broken into small chunks; each chunk
teaches one idea, shows a worked example, and asks a question. Passing a topic's mastery
exam schedules it for spaced review rather than marking it finished forever.

Open `index.html` in a browser. No build step, no server, no npm. That constraint is
deliberate — it means the app works offline, forever, with no maintenance surface.
**Don't add a build step or a dependency without a very good reason.**

Live at `Isk1zz.github.io/Dojo-Gamify-Learn` (GitHub Pages, branch `main`, root).

### Where it is going

Three loops. Two exist, and the third is the one the other two build toward:

1. **Learn** — chunks → topic exam → spaced review. Built.
2. **Retain** — the Garden makes decay visible; watering is reviewing. Built.
3. **Contribute** — post what you know; reputation is what other people gave you.
   **Blocked on accounts.**

The third loop is why the first two are shaped the way they are. The Garden pays
reputation, and reputation can only be spent on *other people's* posts — never your
own, so standing can never be self-farmed. See `forum/FORUM.md`.

It needs a backend: everything is `localStorage`, so two people running this share
nothing. The Supabase port at the top of `UPDATESTACK.md` is a **precondition** for
the Forum, not an enhancement.

### Currencies

Three, deliberately separate, none convertible into another:

| | Earned by | Spent on |
|---|---|---|
| ⚡ XP | Studying | Nothing — it only buys rank |
| 🪙 Tokens | Rank-ups, or bought | Courses |
| 👏 Reputation | The Garden | Other people's posts, never your own |

Cosmetics are **free** — themes, layouts, palettes, decorations and scenery are all
unlocked from the start. The Shop sells courses and patron tiers, nothing else.

---

## 2. Files

`app.js` and `style.css` no longer exist. The app is split into **branch
folders**, each owning one feature end to end and each carrying its own `.md`.

| Folder | Owns | Doc |
|---|---|---|
| `core/` | kernel: state, event bus, router, themes, HUD, profiles, lobby, boot | `core/CORE.md` |
| `data/` | localStorage persistence and migrations | `data/DATA.md` |
| `library/` | courses, units, topics, lessons, exams, stats, all content | `library/LIBRARY.md` |
| `garden/` | plants, growth stages, daily dividends | `garden/GARDEN.md` |
| `shop/` | the Shop (courses, patron tiers), Custom (equip), cosmetics data | `shop/SHOP.md` |
| `forum/` | the Forum and the reputation rule (a shell until accounts exist) | `forum/FORUM.md` |
| `settings/` | themes, data, admin code, legal | `settings/SETTINGS.md` |
| `styles/` | one stylesheet per branch, plus `base.css` | — |
| `docs/` | `ARCHITECTURE.md` (the contract), `CHANGELOG.md` | — |
| — | in-flight work and open decisions live in `UPDATESTACK.md` | — |

**Read `docs/ARCHITECTURE.md` before editing anything.** It defines the four
seams (`DB`, `Bus`, `Router`, `Dojo.*`) and the rule that a branch never reaches
into another branch's internals.

**Script order in `index.html` is load-bearing** — four bands: kernel+DB, then
content, then branches (order within this band doesn't matter), then
`core/boot.js` last.

---

## 3. Adding content

### A new module
1. Create `library/content/<course>/data_mN.js` defining `const MODULE_N = {...}`.
2. Add its `<script>` tag in `index.html`, before that course's `course.js`.
3. Add `MODULE_N` to a unit's `modules` list in `<course>/course.js`.

### A new course
Copy `library/content/_template/`, fill in the manifest, add the script tags.
See `library/LIBRARY.md` — no branch code changes either way.

---

## 4. Data schemas

### Module (`data_m*.js`)

```js
const MODULE_N = {
  id: "slug", unit: 8, title: "...", icon: "🧠",
  topics: [{
    id: "slug", title: "...", desc: "...", icon: "🌱",
    wisdomTags: [],            // optional, on chunks — biases quote selection
    chunks: [{
      title: "...",
      explain: {
        blocks: [{ heading: "...", text: "HTML" }],   // modules 5+
        text: "HTML",                                 // legacy, modules 1–4
        analogy: "...",
        sources: [{ ref: "HTML citation", note: "..." }]
      },
      example: { label: "...", steps: ["HTML", "..."] },
      quiz: { question, options: [4], correct: 0-3, explanation }
    }],
    examQuestions: [{ question, options: [4], correct: 0-3 }]   // 5 per topic
  }]
};
```

`renderExplain` handles both `blocks` and legacy `text`, so modules 1–4 still work
untouched. Always use `blocks` for new content.

### Quote (`quotes.js`)

```js
{ text, author, source, tags: [], verified: bool, note?, rights? }
```

### Profile (`data/db.js`, version 5 — see `data/DATA.md` for the full shape)

```js
{
  name, createdAt,
  completedTopics: [topicId],
  completedChunks: { topicId: [chunkIdx] },
  reviews: { topicId: { due, interval, ease, lapses, reps } },
  seenQuotes: [idx],
  charge: 0,
  theme: "indigo",
  lastPosition: { unitId, topicId, chunkIdx } | null,
  stats: { miniQuizTotal, miniQuizCorrect, examQuestionsTotal,
           examQuestionsCorrect, examsTaken, examsPassed,
           topicStats: { topicId: { attempts, bestScore, lastScore,
                                    completedAt, chunkResults } } }
}
```

**The `miniQuiz*` field names are historical.** The UI calls these "Questions" now.
Renaming the fields would invalidate every saved profile, so they stay. Change labels
in `app.js`, not keys in `db.js`.

### DB migrations
`DB_VERSION` is 5. `migrate()` runs on load and upgrades in place.
- **v1→v2** — legacy `unit6-dojo-progress` key folded into profiles
- **v2→v3** — added `reviews`; already-completed topics seeded as due today
- **v3→v4** — added `charge`, `theme`, `lastPosition`
- **v4→v5** — added `chargeEarned`/`chargeSpent`/`ownedThemes`, then `wallet`,
  `energy`, `tickets`, `lastDividendClaim`, `inventory`, `storyProgress`, `vitals`

Bump `DB_VERSION` and add a branch when the profile shape changes. Never drop existing
fields in a migration.

---

## 5. How the learning system works

The design follows a small number of well-evidenced findings. Each is noted so future
changes don't undo them by accident.

### Spaced review (SM-2)
Passing an exam schedules the topic forward: 1 day, then 6, then `interval × ease`.
Failing resets to 1 day and lowers ease (floored at 1.3). Due topics surface on the unit
map and in the lobby.

Practice testing and distributed practice are the only two techniques rated **high
utility** in Dunlosky et al. (2013)'s review of ten study methods. The app now does both.

**SM-2, not FSRS, deliberately.** FSRS needs hundreds of reviews before its model fits,
so it performs *worse* at small scale. Revisit only with real usage data.

### Question shuffling
Exam questions and their options are shuffled on **every** attempt. Before this, a failed
exam could be retried with byte-identical questions and passed by remembering positions.
`shuffleQuestion` pairs each option with a `wasCorrect` flag before shuffling, then
recomputes `correct`.

### Missed questions come back
A wrong chunk answer queues that chunk to be re-asked before the exam — straight to the
question, no re-reading. Re-reading is one of the *lowest*-rated techniques in the same
review.

### No hard locks
Every topic is reachable. Order is a `→ Recommended next` badge and a
`⤴ Jumping ahead` marker, not a gate. Hard sequencing enforced blocked practice
(interleaving beats it) and removed learner autonomy — the motivational need that
actually predicts engagement.

> **Reversed by explicit request.** Topics, units and individual chunks
> not yet reached now render locked (🔒, red ring, non-clickable) — see
> `library.js`'s `renderRoadmap` / `renderUnitRoadmap` / the list-view
> topic and unit cards. The objection above still stands, unweakened —
> blocked practice really did underperform open order in the literature
> this was originally built against. Flagged at build time, same as the
> streak reversal below; the call to keep it isn't this file's to make
> unilaterally, but it's written down here so it isn't quietly lost.
> `startNextDueReview()` and `resumeAt()` are deliberately exempt — a
> due review or a saved position is continuing progress already made,
> not a new forward jump, so neither is gated by this.

### What was deliberately NOT added
- **No points, badges, or leaderboards.** Meta-analyses find small and unstable
  motivational effects; Hanus & Fox (2015) found badges and leaderboards *reduced*
  motivation. Researchers call the shallow version "racing stripes on a bicycle."
- **No AI features** — they'd break the offline/no-build property.

> **Badges were on this list too, and no longer are.** Added back by explicit
> request (2026-08-12), alongside a real user profile screen showing stats and
> awards. The objection stands — this is the same Hanus & Fox finding the
> streak reversal already overrides, not new evidence against it — and the
> call to keep it isn't this file's to make unilaterally, same as every other
> reversal here. Not yet built as of this note; when it is, badges should earn
> the same restraint the rest of the app has: real accomplishments (topics
> mastered, streaks held, exams passed clean), not participation trophies for
> opening the app.

> **Streaks were on this list too, and no longer are.** Added back by explicit
> request with 2 freezes/week (`DB.touchStreak`, `data/DATA.md`). The
> objection stands — a bare streak punishes taking days off, exactly what
> spacing is for — and freezes are the standard mitigation, not a rebuttal
> of it. Flagged at build time; the decision to keep it is not this file's
> to make unilaterally, but it's written down here so it isn't quietly lost.
>
> **What counts as a "day" moved too.** `DB.touchStreak()` originally fired
> in `finishChunk` — every completed chunk touched the streak, so one
> sitting through a multi-topic study session could register as several
> days' worth of progress on a single calendar day. Moved by explicit
> request to `showExamResults`, gated on `passed` — a streak day now
> requires actually mastering a topic (exam ≥80%), not just working
> through one chunk of it.

The lightning charge (§6) is a progress visualisation with a cap, not a scoring system.
Keep it that way.

---

## 6. Lightning charge

- **+5 to 7 per chunk** completed. Retries pay nothing — otherwise failing on purpose
  would be the fastest way to farm charge.
- **Topic bonus** = accumulated chunk charge × multiplier, where multiplier runs
  `0.7 + (examPct/100 × 0.8)` — so ×0.7 at 0%, ×1.5 at 100%.
- **Capped at `CHARGE_CAP` in `db.js`, currently 150.**
- `addCharge()` returns what was *actually* granted, so the UI never animates a gain
  that didn't happen.

> ✅ **Resolved in v5.** The cap is now a *wallet* cap of 400, and the Shop is the
> sink — spending frees room to earn again, so the bar keeps moving for the whole
> course. Charge buys cosmetic themes only; see `shop/SHOP.md`.

---

## 7. Garden

Growth stage is driven by the **review interval**, not by how many topics are finished:

| Stage | Trigger |
|---|---|
| 🌑 Fallow | Never attempted |
| 🌰 Seed | Attempted, not mastered |
| 🌱 Sprout | Just mastered (interval 1d) |
| 🌿 Seedling | Interval ≥ 6d |
| 🌾 Growing | Interval ≥ 16d |
| 🌳 Tree | Interval ≥ 45d |
| 🌸 Blossom | Interval ≥ 120d |

Lapsing a review drops the plant back. This makes the garden a picture of **retention**
rather than coverage — which is the app's whole argument.

> The Garden was requested without a spec. This is one interpretation. If it should be
> something else — a spendable space, a decorative reward for charge, a social feature —
> it's self-contained in `renderGarden()` and `GROWTH` in `app.js`.

---

## 8. Themes

Eight themes in Settings. Each repaints `--accent`, `--accent-light`, the glow variables,
**and** `--bg-deep`, `--bg-card`, `--bg-card-hover`, `--bg-surface`. Changing only the
accent barely registers — the background is most of what you see.

Text colours are intentionally *not* themed, so contrast stays readable everywhere.

Adding a theme: one entry in the `THEMES` array in `app.js`.

---

## 9. Content standards

These were set deliberately and shouldn't drift.

**Answer keys use the full A–D spread.** Modules 1–4 shipped with 88% of answers on B or
C — guessable without reading anything. Check any new module with:

```bash
grep -ho "correct: [0-3]" data_mN.js | sort | uniq -c
```

**Questions test application, not restatement.** "Which of these is overfitting?" is
recognition. "This model scores 98% on training and 61% on new data — what happened?"
requires running the idea on an unseen case.

**Distractors should be real misconceptions**, so choosing correctly requires
discriminating rather than eliminating nonsense.

**Every explanation block carries citations** in `explain.sources`, rendered in a
collapsible box, so a reader can verify any claim.

**Quotes must be source-checked.** Every entry in `quotes.js` carries a `verified` flag.
Famous quotes are fabricated far more often than people expect — "If you can't explain it
simply, you don't understand it well enough" is **not** Einstein, and "We are what we
repeatedly do" is Will Durant, not Aristotle. Don't add anything without finding the
primary source. Entries marked `verified: false` still need checking before public
release.

---

## 10. Licensing — unresolved, and it matters

The app is intended for eventual commercial release. That creates a real constraint on
where content comes from.

- Course textbooks used for research are **all rights reserved**, and one (Huawei's
  *Cloud Computing Technology*) is **CC BY-NC-ND** — non-commercial, no derivatives.
- Facts and concepts are **not** copyrightable. Particular expression is.

**So the rule for all new content:** teach the concepts, cite authoritative or
public-domain sources, and write original analogies and examples. `data_m5.js` was built
this way — it cites Mitchell, Sutton & Barto, Goodfellow, Hastie, Russell & Norvig, and
uses no textbook's analogies.

For cloud computing specifically, cite **NIST SP 800-145** rather than the Huawei book —
it's the origin of the five characteristics anyway and is US government work in the
public domain.

Quotes: avoid Coleman Barks' Rumi renderings and Tzvi Freeman's Chabad.org renderings.
Both are interpretive paraphrases still in copyright.

**The repo currently has no LICENSE file.** Decide this before adding more content.

*Not legal advice. Worth an hour with a lawyer if real money is involved.*

---

## 11. Current state

**Content:** Units 6 (Networks, Internet, Security), 7 (Programming Fundamentals),
8 (Emerging Technologies). 58 topics, 327 questions across 10 modules. One course, "Intro to CS."

**Screens:** Landing → Lobby → Courses → Units → Topics → Lesson → Exam → Result,
plus Garden, Career, Custom, Shop, Forum, Settings and Admin.

**Shipped since this section was last honest:**
- Arcade removed; the tile is the **Forum** now (a shell — see `forum/FORUM.md`)
- `$` money became **reputation**; storage key stayed `wallet` so no profile lost a balance
- Every cosmetic went **free**; the Shop sells courses and patron tiers only
- Inventory renamed **Custom** and is the single place anything is equipped —
  Settings used to carry a duplicate set of the same controls, which is exactly
  how paid themes became equippable for nothing
- Sky (day/night) is its own scene, locked to a light/dark theme pair
- Warning notices actually reach the user (they were recorded and never shown)

**Not built:**
- Accounts / backend — **the blocker for the Forum**, and therefore for loop 3
- Four more Unit 8 modules — Cloud Computing, Big Data, Blockchain, IoT & Sensors, VR
- The five-phase chunk flow: `predict → explain → example → apply → recall`.
  Adding a **predict** question before instruction exploits the pretesting effect;
  a **recall** prompt with no options at the end exploits the generation effect, which is
  stronger than recognition. Both need new content written per chunk — the schema should
  be frozen with optional `predict` and `recall` fields *before* the remaining modules
  are written, or all five will need retrofitting.
- Launcher / desktop packaging
- Books section

**Open decisions:**
1. Does Unit 8 stay one entry, or split? Five modules ≈ 75 chunks in one track.
2. Reputation can still be traded back and forth between two accounts — the
   give-only rule does not prevent collusion. Decide before the Forum ships.
3. Licence for the repo and the content. The repo is **public with no `LICENSE`**,
   which means default all-rights-reserved — but GitHub's own terms still grant
   every user the right to view and fork it. See `docs/LEGAL.md`.

---

## 12. Gotchas

- **`renderExamQuestion` needs `const topic = getTopic()`.** It was once removed during a
  refactor while `topic.icon` and `topic.title` were still referenced two lines below —
  ReferenceError, blank exam screen, every exam broken. Easy to reintroduce.
- **`startExam` must reset `state.examSubmitted = []`**, or retries render with answers
  already revealed.
- **Exams grade against `state.examQuestions`, not `topic.examQuestions`** — the former is
  the shuffled copy. Grading against the original scores the wrong answers.
- **`completedChunks` is what powers resume.** It was written from v1 and read by nothing
  for a long time. Don't "clean it up."
- **Charge cap** — always use `addCharge`'s return value, not the requested amount.
- The README's clone command historically had both the username and repo name wrong.
  Correct: `git clone https://github.com/Isk1zz/Dojo-Gamify-Learn.git`
