# Knell — what is in, what is out, and why

A snapshot taken on **2026-11-19**, when Knell was packaged as a portfolio
piece. Every number below was measured from the code on that day, not
remembered. Where something is not built, this says so and says why.

Four groups, in order of how real they are:

1. [In the demo and working](#1-in-the-demo-and-working)
2. [Built, but switched off in the demo](#2-built-but-switched-off-in-the-demo)
3. [Decided, not yet built](#3-decided-not-yet-built)
4. [Not done, or dropped](#4-not-done-or-dropped)

---

## 1. In the demo and working

| What | Where | How it works | Why it is this way |
|---|---|---|---|
| **Chunked lessons** | `library/library.js`, `library/content/` | Every one of the 171 chunks explains one idea, shows a worked example and asks a question. 114 of them meet the full standard of about 200 words and two cited sources; 166 carry an analogy. 57% of topics also open with a guess before reading, and 97 chunks close with free recall. | Retrieval and worked examples are the techniques with the strongest evidence. A guess before reading helps even when it is wrong, because the correction is what sticks. |
| **Mastery exam** | `library/library.js` `showExamResults` | 5 questions per topic, 80% to pass, shuffled each attempt. One retry; fail twice and the topic has to be walked again. | Passing is the only way a topic enters spaced review, so the gate decides what the schedule trusts. |
| **Spaced review** | `data/db.js` `scheduleReview` | SM-2 with one changed constant (0.08 to 0.15). | Textbook SM-2 changes ease by exactly zero at the pass mark, so someone who barely passes every review got the same intervals as someone perfect: 6th review at 238 days. Now 153. A perfect learner is untouched (393), because the changed term multiplies by zero at full marks. Checked by driving the real function, not by algebra. |
| **Flashcard reviews** | `library/library.js` | A due topic is reviewed as a deck built from content that already exists: one card per chunk quiz plus one per exam question. | No separate flashcard authoring. The self-rating these cards use is the system's weakest measurement, see section 3, item 6. |
| **The Garden** | `garden/garden.js` | Each mastered topic is a plant, and **its growth stage is its review interval**: a sprout at 1 day, a blossom at 60+. A neglected topic loses a day of interval per overdue day after a 7-day grace. Holiday mode pauses that, up to 60 days a year. | It pictures what you remember, not what you once finished. A hundred topics passed once is a field of sprouts. |
| **Course scenes** | `scenes/scene.js`, `scenes/bike-a3.js` | The e-bike course is drawn as an isometric diorama of a junction at night. Its seven chapters stand where they happen: *Junctions* at the junction, *Lights & gear* under a street lamp. Pick one and a small figure runs there along the sidewalks, **crossing only at zebras**, then opens it. | Borrowed from Knell Atlas, a separate 3D encyclopedia project, and translated to flat SVG for phones. The rule taken with it: **one engine, a data recipe per course**, never a drawing per course, so the second scene costs a fraction of the first. |
| **Start screen** | `index.html`, `core/boot.js` | The real course scene, playable before you begin. Under the button, a line that says this is a demo with no account. | The first thing a visitor reads has to be true. The previous line promised an account that syncs to any device. |
| **Mock exam** | `library/exam-sim.js` | For the e-bike course: 30 questions, 40 minutes, 26 to pass, built from the course manifest. | The real test's terms. The course carries the Ministry of Transport's published question bank. |
| **Two languages** | `core/i18n.js` | English and Russian. Interface strings are `{ en, ru }` "language bags", over 350 of them. Two of the three real courses carry content in the same shape; Intro to CS is English only. | One shape for both, so a translation pass is a fill-in, not a rewrite. |
| **Look and feel** | `core/theme.js`, `shop/` | Themes, a day and night sky, cosmetics. All unlocked in the demo. | |

---

## 2. Built, but switched off in the demo

**All of this exists in the repository and was verified against a live
database. It is off because that database is gone.**

| What | Where |
|---|---|
| Accounts and sign-in | `core/auth.js`, Supabase Auth |
| Progress synced across devices | `core/sync.js`, tables `profiles`, `progress`, `economy` |
| **The Forum**: posts, replies, praise, reports, moderation, bans, a notification bell, view counts | `forum/`, migrations 0008 onward |
| Reputation, earned by remembering, spendable only on other people's posts | `rep_allowance`, `garden_weight`, `grant_reputation` |
| Rewards paid by the server, never by the client | `core/earn.js`, migration 0012 |
| Account deletion that anonymises instead of breaking threads | migration 0025 |

### Why it is off

The Supabase project stopped resolving (`ERR_NAME_NOT_RESOLVED`) after about
two months without use, which is what the free tier does. Accounts were
mandatory, so the sign-in gate stood in front of the whole app and **nobody
could get in at all**. A portfolio demo has to open for anyone, first time.

### How it is off

One switch: `Dojo.OPEN_ACCESS` in `core/core.js`. Every gate reads it
at the moment it is asked: sign-in, the profile menu, unlocks for themes,
units, courses and topic order. Pressing *Sign in* shows a grey form under
a red lock that says sign-in is switched off. **Nothing was deleted.**

**Changed 2026-11-21.** This said the switch was simply set to `true`, and for
two days it was, in the real app as well. Now it follows `Dojo.DEMO`
(`core/demo.js`): off in this repository, where sign-in is back on, and on only
in the separate demo copy that `tools/make-demo.js` produces. That copy also
holds no Supabase address or key.

**Changed 2026-11-22.** The demo copy now leaves the Forum out entirely,
because without its server it could only be an empty screen. Its lobby
tile opens a small museum (`museum/museum.js`), where the Forum is the
first exhibit. It is the same tile with the same id, not a new one: two of
the Star lobby looks count tiles exactly, and with one tile fewer the Star
of David falls back to spokes and the pentagram is drawn lopsided.

### Engineering worth looking at in the dormant half

- **Money, XP, reputation and the Forum cannot be written by a client.**
  Those tables have no write policy for anyone. Every write goes through a
  `SECURITY DEFINER` function with `search_path = ''` that takes the actor
  from `auth.uid()`, never from an argument. The exception is deliberate: a
  learner may update their own `profiles` and `progress` rows, because that
  is how progress syncs.
- **The one known weakness, stated in the code.** The Garden's weight, and
  so the reputation allowance, is computed from `progress`, which its owner
  writes. Forge your progress and you forge your allowance. Migrations 0016
  and 0026 say so in as many words; the damage is capped at five points a
  day, and server-side validation of progress is queued in `UPDATESTACK.md`.
- **A race found and closed.** Granting reputation was count, then decide,
  then insert, which is a time-of-check to time-of-use gap. Fired
  concurrently, 8 of 8 grants went through; with an advisory lock per giver,
  exactly the 2 the allowance permitted did.
- **A unique constraint that was not unique.** `unique (reporter, post, reply)`
  let one person report one post any number of times, because Postgres treats
  NULLs as distinct. Found by asking the catalogue (`indnullsnotdistinct`)
  rather than by reading the constraint. Fixed with partial unique indexes.
- **A farmable reward endpoint.** `award_xp` paid 800 XP in four calls.
  It was revoked and replaced by an earnings ledger with four defences:
  pay once per item, catalogue items only, a pace check, and a daily ceiling.
- **View counts that ignore scrolling past.** A view counts after 5 seconds
  on screen. Measured: a 1.2 s scroll-past counts 0, a 6.5 s read counts 1,
  a revisit still counts once, and your own post counts 0.

### To bring it back

Create a Supabase project, run `supabase/migrations/` in numeric order, put
its URL and publishable key in `core/supabase.js`, and set `OPEN_ACCESS` to
`false`. Before real people sign up, the launch blockers in `UPDATESTACK.md`
still apply. Email confirmation is off because there was no mail sender, and
a mail sender needs a domain.

---

## 3. Decided, not yet built

A third commissioned research report reviewed the learning engine. Its
arithmetic was checked rather than trusted. The headline numbers reproduced
exactly; **its proposed ease formula did not do what its own table claimed**
(+0.03 where it said −0.07), and two rows of its test-length table were wrong.
Ten decisions came out of it, taken one at a time. **One is built.**

| # | Decision | Status | Why not yet |
|---|---|---|---|
| 1 | Exam grows from 5 to 10 questions, pass mark 8 of 10 | decided | Needs 290 new questions. With 5, a learner who truly knows 70% passes in two tries **77.7%** of the time. With 10, it falls to 61.9%. |
| 2 | The 5 new questions are written from scratch, not adapted from chunk quizzes | decided | Content. A quiz question seen minutes earlier tests memory of the question, not of the idea. |
| 3 | An exam pass becomes provisional, confirmed by a short check 1–2 days later | decided | Code, plus 3–4 more questions per topic. An exam five minutes after reading measures what is still in short-term memory. |
| 4 | The exam score stops setting the review pace; everyone enters at the same start | decided | Code. With every later review identical, one exam question currently moves the fifth review by 17–25 days. |
| 5 | A marginal review lowers ease instead of holding it | **built** | |
| 6 | Self-rated flashcards replaced: type the answer, then tick key points; exam cards marked by the machine | decided | Code. The key points already exist on 97 of 171 chunks. |
| 7 | Fill the gaps in guess-first and recall-last (about 51 blocks) | decided | Content. |
| 8 | Neglect still withers a plant, but one good review restores it in full | decided | Code. Visible loss with no way back is what Duolingo retired its cracked skills over. |
| 9 | Reputation funded by finishing the day's due reviews, not by garden size | decided | Server change, and it needs the server. |
| 10 | Each exam question records which chunks it tests | decided | Content. Must be done while the 290 are written, not after. |

Each decision, with the case made against it where there was one, is in
`UPDATESTACK.md` under *learning-engine overhaul*.

---

## 4. Not done, or dropped

| What | State | Why |
|---|---|---|
| Four of seven courses | Shells: biology, chemistry, physics and science literacy have a manifest and no lessons | Content takes about 4–6 hours per researched topic |
| The oldest 57 lessons | Intro to CS modules 1–4 average 72–89 words and cite no sources, against a standard of about 200 words and two sources that the other 114 meet | Written before the standard existed; the rewrite was queued and never done |
| Scenes for other courses | Two have one: the e-bike course (a junction, a pin per topic) and Intro to CS (a computer lab, a pin per unit, because 48 topics do not fit in one picture). Philosophy and the four empty courses have none | The engine is general; each course needs a recipe, not code. The lab added walls and wall art to the engine, and nothing course-specific |
| Five more languages | Not started. Intro to CS is English only, 5,115 strings and no language bags | Decided: write in English first, translate as its own pass |
| Light themes and the scene | The scene is a night picture on every theme | Not tuned yet |
| Offline use | Not claimed | A service worker caches what has been visited, but a course that was never opened is not there offline |
| Forum legal text | Not written | Needed before a public forum, not before a demo |
| A nickname bug | Known: the chosen nickname does not reach the server profile | Moot while accounts are off; the diagnosis is in `UPDATESTACK.md` |
| A theme styled after THE FINALS | Written up, not built | Cosmetic; recorded so it is not lost |
| Streaks | **In the app**: a day counts when a topic is completed, with two freezes a week to bridge missed days. *Corrected 2026-11-21: this row said streaks had been removed on purpose. They were in an early design, then brought back (see `data/DATA.md`); the streak chip is in the top bar.* | Recorded because the claim was wrong, not because anything changed |
| The Arcade | **Removed on purpose** | Replaced by the Forum, where reputation earned by remembering is given to other people |

---

## For LinkedIn

**Title:** Knell — a study app that keeps what you learn from fading

**One line:** Lessons in small chunks, spaced review that schedules itself,
and courses drawn as places you walk through. Vanilla JavaScript, no build
step; a Postgres backend where no client can write directly.

**Link to put there:** <https://isk1zz.github.io/knell_demo/> — the demo,
which opens with no account. Not this repository's own site, which stops at
sign-in.

**What to look at first:** the start screen. Tap a chapter and the runner
crosses at the zebras.
