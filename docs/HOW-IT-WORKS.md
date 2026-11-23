# How Knell works

The whole app in plain words, one idea at a time. Each part ends with where
it lives in the code and where to read more. About fifteen minutes to read.

I designed Knell and directed every decision in it. The code was written with
AI assistance (Claude).

Other documents cover other angles. [SHOWCASE.md](SHOWCASE.md) lists what
works, what is switched off and what was dropped. [INTERVIEW.md](INTERVIEW.md)
answers five questions in a paragraph each. [ARCHITECTURE.md](ARCHITECTURE.md)
is for someone about to change the code. This one is the walk-through between
them.

The demo carries the same walk-through in English and Russian: in its museum
(the lobby tile where the Forum's was), every card that explains something has
a "Read more".

1. [The one idea](#1-the-one-idea)
2. [What a course is made of](#2-what-a-course-is-made-of)
3. [How a lesson goes](#3-how-a-lesson-goes)
4. [How remembering works](#4-how-remembering-works)
5. [The Garden](#5-the-garden)
6. [Rewards, and where they stop](#6-rewards-and-where-they-stop)
7. [Courses as places](#7-courses-as-places)
8. [How the code is organised](#8-how-the-code-is-organised)
9. [The server: built, switched off](#9-the-server-built-switched-off)
10. [The demo](#10-the-demo)
11. [How it was made](#11-how-it-was-made)

---

## 1. The one idea

Knowing something is not having passed it once. It is still having it a month
later.

Knell measures the second and refuses to count the first. Most of the rest
follows from that one choice:

- Progress is not "topics finished". It is how long each topic stays in memory
  before it needs a refresh: its review interval.
- The Garden is a picture of those intervals, so it shows what you remember,
  not what you once read.
- Almost nothing is offered for rereading. Rereading is one of the weakest
  study techniques in the research; being asked is one of the strongest.

```
read a topic ──► pass its exam ──► review it, further apart each time
                      │                           │
                      ▼                           ▼
              a sprout appears           the plant grows with the interval,
              in the Garden              and shrinks when reviews are missed
```

## 2. What a course is made of

A course is split into **units**, a unit into **topics**, a topic into
**chunks**. A chunk is the smallest piece of work: about 200 words of
explanation, an analogy, a worked example and a question.

Courses are data, not code. Each one is a folder in `library/content/` with a
manifest (`course.js`: its units, their order, the exam's terms) and modules
(`data_m*.js`: the topics and their chunks). Text that exists in two languages
is written as a small `{ en, ru }` bag right where it is used.

A written standard says what a chunk must carry
([CONTENT-MODEL.md](../library/content/CONTENT-MODEL.md)), and a script checks
every module against it (`node library/content/check-content.js`). It currently
fails four modules: the oldest Intro to CS lessons, written before the
standard existed and still waiting for their rewrite.

A few rules sit on top:

- **Order.** Units, topics and chapters open one after another. That was
  argued against with evidence (a fixed order forces blocked practice and takes
  away choice) and added by explicit request; the objection is kept in
  [PROJECT.md](../PROJECT.md) §5. A review that is due, and going back to where
  you stopped, are never blocked.
- **Lazy loading.** A course's lessons load when the course is opened. Intro to
  CS alone used to be 43% of the JavaScript every visit downloaded.
- **The contract.** The first time you enter a course you sign an enrolment
  contract with the mouse. It is a joke in the app's tone: nothing is checked,
  and the drawing never leaves the browser.

Three courses have lessons: *Intro to Computer Science* (48 topics), *A3
Theory — Electric Bicycle* (7, built on the Israeli Ministry of Transport's
published question bank) and *Philosophy: Cicero* (3). That is 58 topics and
171 chunks. Four more courses (biology, chemistry, physics, science literacy)
have a manifest and no lessons yet.

*Where:* `library/library.js`, `library/content/`.
*More:* [LIBRARY.md](../library/LIBRARY.md).

## 3. How a lesson goes

A chunk runs in up to five phases, and the order carries the meaning:

| | Phase | What happens | Why |
|---|---|---|---|
| 1 | **Predict** | A question *before* any explanation, never scored. On the first chunk of each topic. | A wrong guess still improves what is remembered afterwards (the pretesting effect). |
| 2 | **Explain** | The idea in short blocks with headings, and two cited sources. | |
| 3 | **Example** | A worked example, step by step. | Worked examples and retrieval are the techniques with the strongest evidence. |
| 4 | **Apply** | A multiple-choice question. The options are reshuffled on entry and on every retry. | A retry should test the idea, not where the answer was last time. |
| 5 | **Recall** | A free answer with no options, which the learner checks against a list of key points. On every chunk. | Producing an answer holds better than recognising one (the generation effect). |

A chunk that lacks a phase simply runs without it: its list of phases is built
from what it carries. That is why some older Intro to CS chunks run in three.

A wrong answer does not send you back to read. The question is queued and
asked again before the topic's exam.

**The exam** closes a topic: five questions, reshuffled on every attempt, 80%
to pass. One retry; fail twice and the topic is walked again. Passing is the
only way a topic enters the review schedule, which is why this gate matters.
"Continue where you left off" takes you back to the exact chunk you stopped
at.

*Where:* `library/library.js` (`phasesFor`, the quiz, the exam).
*More, in Russian, with the research behind each technique:*
[LEARNING-DESIGN.html](LEARNING-DESIGN.html).

## 4. How remembering works

**The schedule.** Passing a topic's exam does not finish it; it schedules it.
The first review is a day later, the second six days after that, and from
then on each interval is the previous one multiplied by an *ease* number that
starts at 2.5. A good review raises the ease, a shaky one lowers it. Under
half right is a lapse: back to one day, and the ease drops, never below 1.3.
This is SM-2, chosen over the newer FSRS on purpose: FSRS needs hundreds of
reviews before its model fits, and a small app never gives it that many.

**One constant changed, on evidence.** In textbook SM-2 a review that only just
passes leaves the ease where it was, so someone who barely passes every review
is scheduled like someone perfect. With one constant changed, that learner's
sixth review comes at 153 days instead of 238, and a perfect learner's stays
at 393. Checked by driving the real function, not by algebra.

**A review is a deck, not a reread.** A due topic comes back as flashcards
built from questions that already exist, one per chunk quiz and one per exam
question, so nobody writes cards by hand. Each card is rated on four levels of
confidence, from *difficult* to *known*. 80% known passes the review, and the
share known becomes the review's grade for the schedule. Reviews pay a little
XP per card, so a card answered in under 2.5 seconds earns nothing: tapping
through a deck for the reward does not pay.

**Your own decks.** Chunks from different topics and units can be mixed into
one deck and filtered by those confidence levels. Mixing topics is
interleaved practice, which beats practising one block at a time.

**Weak spots** answer the one question a learner really has, *what should I
study now*: last score, minus ten for every lapsed review.

**Mock exam.** For the e-bike course, a rehearsal of the real test on its own
terms: 30 questions, 40 minutes, 26 to pass.

*Where:* `data/db.js` (`scheduleReview`, `getDueTopicIds`, `getWeakSpots`),
`library/library.js` (flashcards, `MIN_CARD_MS`, the deck builder),
`library/exam-sim.js`. *More:* [INTERVIEW.md](INTERVIEW.md), question 1.

## 5. The Garden

Every topic is a plant, and **its growth stage is its review interval**:

| Stage | When | Weight |
|---|---|---|
| 🌑 Fallow | not started | 0 |
| 🌰 Seed | started, exam not passed yet | 0 |
| 🌱 Sprout | an interval of 1 day or more | 1 |
| 🌿 Seedling | 7 days or more | 1 |
| 🌾 Growing | 21 days or more | 2 |
| 🌳 Tree | 30 days or more | 2 |
| 🌸 Blossom | 60 days or more | 3 |

A hundred topics passed once is a field of sprouts. A tree is a topic held
for a month.

Neglect shows. After a week's grace, an overdue topic loses a day of interval
for every day it waits, so its plant shrinks. A holiday mode pauses that, up
to 60 days a year. The Garden lists what needs watering today and starts the
first review in one tap.

The weights add up to what the Garden is worth: every 5 points of weight fund
one point of reputation a day, five at most. Reputation paid for praise in
the Forum (section 9), so the right to praise other people's posts came from
what you remember, not from how much you opened.

*Where:* `garden/garden.js`. *More:* [GARDEN.md](../garden/GARDEN.md).

## 6. Rewards, and where they stop

**XP and ranks.** Finishing chunks and passing exams earns XP. It is never
spent and has no ceiling. Twenty ranks run from Lab Intern at 0 XP to Nobel
Laureate at 100,000, and each rank brings something: a background pattern, a
colour theme or tokens. On a first visit the rank sits under a foil sticker;
rubbing it off takes seven seconds, and then a five-card guide explains the
ladder.

**Badges.** Ten, each for something real: a first topic mastered; a quarter,
half or all of a course; a perfect exam; five exams without a fail; 90%
accuracy over 50 questions; a 7- or 30-day streak; reaching rank 8.

**Streaks.** A day counts when a topic is mastered, not when the app is
opened. Two freezes a week bridge missed days.

**No leaderboards.** XP, badges, streaks and the fixed order of topics were
each argued against first: studies of badges and leaderboards find small,
unstable effects, and some find they lower motivation. Each was then added by
explicit request, and [PROJECT.md](../PROJECT.md) §5 keeps the objection next
to every one. Nothing ranks you against other people.

**Three currencies, kept apart.** Tokens are bought with real money and open
courses; a few ranks give some too. `$` is earned by studying and was meant
for cosmetics, but every cosmetic is now free or arrives with a rank, so there
is nothing to spend it on yet. Reputation is the Garden's daily allowance,
spendable only on other people's posts. Value flows one way: nothing earned by
studying ever turns back into Tokens, so studying can never become a way to
make money. *(ARCHITECTURE.md §5.)*

**The server pays, not the browser.** The browser only reports "this piece of
work is done"; the server decides what it is worth and pays from its own
ledger (section 9). The demo has no server, so studying there earns no XP: its
rank is the one its sample profile starts with.

*Where:* `shop/ranks.js`, `core/peel.js`, `library/stats.js`, `core/earn.js`.

## 7. Courses as places

A course can be drawn as a small isometric diorama in which every chapter
stands where it happens. Pick one, and a little figure walks there and opens
it.

There is one engine, `scenes/scene.js`, and one data recipe per picture. A
recipe lists the ground, buildings, props, pins and a walking graph; the
engine does the rest:

- isometric projection, three parallax depth layers, and a cut-away
  cross-section of the ground under the island;
- sprites sorted by depth, so near things cover far ones;
- shortest paths (Dijkstra) over the walking graph: in the e-bike course the
  figure keeps to the sidewalks and crosses only at the zebras;
- day and night colours that follow the app's sky: lamps go out by day, and a
  window shows the sun;
- pins you can reach with the keyboard, reduced motion respected, and no
  animation while the picture is off screen.

Four recipes exist. The e-bike course is a junction at night, one pin per
topic. Intro to CS is a computer lab, one pin per unit, because 48 topics do
not fit in one picture. Philosophy is the Roman Forum: Cicero's three topics
at the Rostra, a table of scrolls, the Curia. The start screen is a garden
with the Garden's growth stages along one path. Each pin there opens a small
note and plays its own step of a pentatonic scale, and the figure plays them
as it passes; the last pin is a bell it rings, and a mailbox at the gate holds
a letter.

The rule that keeps this cheap: **never a drawing per course**. Each new scene
added general pieces to the engine (walls and wall art for the lab; pitched
roofs, columns and togas for the forum) that every later recipe can use.

*Where:* `scenes/`. A harness for building recipes: `scenes/prototype.html`.

## 8. How the code is organised

- **No framework, no build step, no npm.** Plain JavaScript loaded with
  `<script>` tags in a fixed order. Serve the folder with any static server
  and it runs.
- **A small kernel, and branches around it.** The kernel is persistence
  (`DB`), events (`Dojo.Bus`), screens (`Dojo.Router`) and one place where
  features publish what they offer (`Dojo.<name>`). Every feature folder talks
  only through these, so deleting a folder and its script tags removes that
  feature and leaves the rest running. [ARCHITECTURE.md](ARCHITECTURE.md) has
  the rules and the load order.
- **Storage.** One JSON document in `localStorage`. It carries a schema
  version and is migrated forward when it loads, so an old save always opens
  in a new build. [DATA.md](../data/DATA.md).
- **Two languages.** Course text is resolved once per page load; the interface
  has about 350 keyed strings. The language belongs to the device, and
  switching it reloads the page: a reload is cheap, and it makes a
  half-switched screen impossible.
- **Sound** is synthesised in the browser, with no audio files, and honours the
  mute setting.
- **Checks from the command line.** `check-content.js` holds lessons to the
  content standard, `supabase/check-schema.js` catches drift between the app's
  profile fields and the database's columns, and `tools/make-demo.js`
  (section 10) checks its own output.

## 9. The server: built, switched off

Knell has a real backend on Supabase (Postgres): accounts, progress synced
across devices, the Forum, reputation, and rewards paid by the server. It was
verified against a live database. That database became unreachable after two
months without use, which is what the free tier does, so the real app now
stops at sign-in. The demo runs without it.

What is worth reading there, in short:

- **No client can write money, XP, reputation or the Forum.** Those tables
  have no write policy at all. Every write goes through a database function
  that takes the user from the session, never from an argument.
- **Rewards are a ledger.** Each piece of work is paid once, only if it is a
  real catalogue item, only at a human pace, and under a daily ceiling. The
  old endpoint that let the client name an amount paid 800 XP in four calls,
  and was removed.
- **Sync merges field by field.** Finished topics are combined, each topic's
  schedule keeps whichever device is further ahead, and counters take the
  higher number. "Last save wins" would let an old phone wipe a week of
  reviews done on a laptop.
- **The known weakness is written down.** A learner's own progress row has to
  be writable, because that is how it syncs, and the Garden's weight is
  computed from it. Forging it forges at most five reputation points a day.

Everything else, with numbers: [SHOWCASE.md](SHOWCASE.md) §2 and
[INTERVIEW.md](INTERVIEW.md).

## 10. The demo

The public demo, <https://isk1zz.github.io/knell_demo/>, is a copy of this app
made by `tools/make-demo.js`. The script switches the demo flag on, blanks the
Supabase address and key, drops the Supabase client and the Forum, renames the
old service worker's cache so each app clears only its own, and then searches
the copy for any production identifier before it finishes.

With the flag on, nobody signs in. A first visit loads a sample student, Alex:
Lab Intern and most of the way to the next rank, a nine-day streak, a topic
half done, a plant at every stage. The demo keeps its storage apart from the
real app's, and a banner says progress stays in this browser. The Forum's tile
opens a museum instead: short exhibits on how the parts work and what was set
aside, each with a "Read more" that carries this document's detail in both
languages, and a hall that walks through the project's history by date, with
pictures of the old versions. The mailbox on the start screen holds a letter from the author.

*Where:* `tools/make-demo.js`, `core/demo.js`, `museum/museum.js`,
`core/letter.js`.

## 11. How it was made

It started at the Open University, where I was studying. Two versions of the
same textbook had drifted apart, and studying from them was irritating enough
to try another way: to gamify studying, automate it and optimise it. The first
attempt was called Dojo; the history hall in the demo's museum walks through
what came after, with pictures of the old versions and what went into them.

I designed Knell and directed it: what a lesson is, when an exam lets a topic
into review, how the Garden grows and withers, what the server must never
trust a browser with. The code was written with Claude under that direction,
and tested as it grew.

Three habits run through the repository:

- **Claims are checked against the code.** Counts in the documents were
  measured, not remembered, and a wrong one is corrected in place, with a
  date, rather than quietly rewritten. Search the docs for "Corrected" to see
  them.
- **Research is checked, not trusted.** Three research reports were
  commissioned. The first quoted the project's own documentation back as
  findings, so the next two were briefed to look for what is wrong. Ten
  decisions came out of the third; one is built, and each is recorded with the
  case against it ([SHOWCASE.md](SHOWCASE.md) §3).
- **A reversal keeps its objection.** Where something was added against the
  evidence, by request, the argument against it stays next to it.

What I would do next is in [INTERVIEW.md](INTERVIEW.md) (three honest
weaknesses) and [SHOWCASE.md](SHOWCASE.md) §3: a longer exam with a check a
day or two later, typed answers in place of self-rated cards, and a server that
checks progress against the work it actually paid for.
