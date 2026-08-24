# library/ — courses (was: "Courses")

The study half of the app. Courses → Units → Topics → Lesson chunks → Mastery
exam, plus the Stats modal. This is the **only** branch that touches course
content.

| File | Role |
|---|---|
| `library.js` | All course navigation, lesson rendering, exam logic |
| `stats.js` | The Stats modal (read-only over everyone's data) |
| `content/CONTENT-MODEL.md` | **The content standard.** Read before writing any module. |
| `content/check-content.js` | Command-line checker for that standard. Not loaded by the app. |
| `content/registry.js` | The loader. Turns registered courses into the globals. |
| `content/build.js` | Publishes those globals. Loads last of the content band. |
| `content/quotes.js` | The wisdom pool, shared across courses. |
| `content/<slug>/` | **One folder per course**: its module files + `course.js`. |
| `content/_template/` | Copy-this-to-start-a-course. Not loaded. |

Stylesheet: `styles/library.css`.

## Exports
`renderCourseSelect`, `renderUnitSelect`, `selectUnit`, `renderTopicMap`,
`updateGlobalProgress`, `startTopic`, `getTopic`, `startExam`, `libraryTotals`,
`resumeAt`, `startNextDueReview`, `showStatsModal`, `renderStats`

`resumeAt(pos)` and `startNextDueReview()` exist because the **lobby** owns the
Resume and Review tiles but must not know how to walk a course. It hands the
request over instead.

## Emits
`chunk:completed`, `topic:completed`, `exam:finished`, `review:finished`,
`progress:changed`

## Topic map: List vs. Map
`renderTopicMap()` draws one of two views over the same topics, same
completion/due state, same navigation — a session-only toggle
(`state.topicMapView`, not persisted to a profile, unlike theme or lobby
style: this is "how do I want to look at it right now").

- **List** — the original module-grouped card grid.
- **Map** — `renderRoadmap()`. Topics as bubbles along a winding path
  (sine-wave x offset per topic index, so consecutive bubbles never
  stack), one SVG spine connecting them, module boundaries as small
  labels along the path. Each bubble's chunks are small satellite dots
  orbiting it — same hub-and-spoke angle math as the Star lobby layout
  in `core/lobby.js`, computed in JS per topic because chunk count
  varies (a fixed CSS pattern can't do that). Clicking an unlocked chunk
  dot jumps straight into that chunk (`startTopic(idx, chunkIdx)`);
  clicking an unlocked bubble opens the topic at its resume point, same
  as a List card. Locked ones do neither — see below.

Both views also carry a **Flashcards** button per topic (🗂️, its own
click target, `stopPropagation`'d off the bubble/card underneath) —
`startFlashcardReview(topic)` on demand, for any *unlocked* topic, not
gated on it being due or even completed. Previously the only way to
reach a flashcard deck was `startNextDueReview()` from a due Garden
plant. The button doesn't render at all on a locked topic — a deck
built from content you haven't reached would just be spoilers.

### Roadmap detail: cluster ring, hover glow, and locking
Each topic bubble sits inside a faint dashed `.roadmap-cluster-ring` —
without it there was nothing telling the eye where one topic's
chunk-dot cluster ends and the next begins, since the spine runs
straight through both. Colour-coded the same as the bubble
(green = completed, accent = current), plain border otherwise.

Hovering a bubble adds a colour-coded glow **on top of**, not instead
of, the current topic's permanent accent ring:
- **Green** — open and yours to study now.
- **Red**, plus a brief `data-explain` tooltip naming what to finish
  first (pure CSS, from an attribute, no separate element to keep in
  sync) — genuinely locked. This is a real gate now, not a suggestion —
  see PROJECT.md §5's "No hard locks" section for the reversal and why
  it's flagged there rather than quietly changed. A locked bubble shows
  🔒 instead of its icon, drops its click handler and its Flashcards
  button entirely, and every one of its chunk dots locks with it.
  `renderUnitRoadmap` and the list-view topic/unit cards
  (`.topic-card.ahead`) all use the identical red-glow-plus-tooltip
  treatment, including `renderCourseSelect()`'s unavailable-course
  cards (`.course-card.restricted`), which had it first.

Within an unlocked topic, chunks past the furthest one actually reached
lock the same way (red, `.roadmap-chunk-dot.locked`) — jumping to
chunk 3 before finishing chunk 1 is exactly the kind of skip this
reversal closes off, not just skipping whole topics.

## Flashcard review (watering)
`startNextDueReview()` no longer replays the whole topic (explain + example +
quiz per chunk, then the exam). It launches a **flashcard deck** instead —
`startFlashcardReview(topic)`, `screen: flashcards`.

### Lazy course content

`intro-cs` ships its manifest only; its modules are injected on open —
see `docs/ARCHITECTURE.md` §3. Two consequences for anyone editing here:

- `renderCourseSelect` cannot count a lazy course's topics before it
  loads, so it falls back to `unitOutline` in the manifest. Those numbers
  are checked against the real modules by `check-content.js`, which fails
  the build on drift — do not "fix" a wrong count by editing the outline
  without checking which side is actually wrong.
- Opening a course goes through `Content.load()` and is therefore
  **async**. It resolves immediately for an eager course, so no caller
  needs to special-case the difference, but a new entry point into a
  course must await it or it will render a course with no units.

- One card per chunk, built by `buildFlashDeck(topic)` straight from that
  chunk's existing `quiz` — front is the question, back is the correct option
  plus its explanation. No separate flashcard content to author.
- **Plus one card per exam question** (2026-08-24). Before that a topic's
  `examQuestions` were reachable in an exam and nowhere else, which barely
  mattered for Intro to CS and mattered a great deal for A3, where the exam
  questions ARE the material: only 10 of the Ministry's 40 live as chunk
  quizzes. Exam cards carry `chunkIdx: null` and every write-back checks
  `isChunkCard` first — an exam question owns no chunk, so grading one must
  not move a chunk's weakness or its review schedule.
- Self-reported (**Knew it / Didn't**), not graded, because there's no
  multiple-choice to check automatically. The tally still maps onto SM-2's
  0-5 quality scale the same way `showExamResults()` does, so a review
  advances (or lapses) the interval exactly like retaking the exam used to.
- `finishFlashcards()` calls `DB.scheduleReview` — no `recordExamResult`,
  no `markTopicComplete`. It isn't an exam, and the topic is already
  mastered (that's why it was due).
- **Pays a small XP bonus** (`REVIEW_XP_BASE = 5`, on the order of one
  chunk — a review isn't new learning, so it must not out-earn actually
  studying). Gated by `MIN_CARD_MS = 2500`: a card answered faster than
  that couldn't have been read, so it doesn't count toward `genuineKnown`
  even if marked "Knew it". Self-report with no cost was fine; self-report
  with a payout needs a reason not to just tap through — this is it, not
  an arbitrary daily cap.
- The result screen (`#exam-result`) is shared with the mastery exam.
  `state.lastReviewMode` tells the retry button which flow to relaunch —
  set it if you add a third thing that can land on that screen.

## Content schema
**`content/CONTENT-MODEL.md` is the standard** — length, blocks, citations, where
`predict`/`recall` go, the licensing constraint. Module 5 is the reference
implementation. PROJECT.md §4 is the older, thinner version of the same thing.

`renderExplain` still handles both `blocks` (modules 5+) and legacy `text`
(modules 1–4), because modules 1–4 have not been backfilled yet. Do not write new
content as `text`.

Check a course against the standard with:

```
node library/content/check-content.js            # every course
node library/content/check-content.js intro-cs   # one course
```

Modules 1–4 currently report failures on purpose: they predate the standard and
are queued for backfill (m3 → m1 → m2 → m4).

## The five-phase chunk flow — SCHEMA FROZEN

```
predict → explain → example → apply → recall
```

`predict` and `recall` are **optional fields on a chunk**. A chunk without them
runs the original three-phase flow untouched, so every existing module keeps
working and new content adopts the phases one chunk at a time.

**Freezing this before the remaining modules is the whole point.** Retrofitting
~60 chunks later would have cost far more than an optional field costs now.

```js
predict: {
  question: "...",              // asked BEFORE any instruction
  options: [4],
  reveal: "..."                 // optional line shown after they commit
},
recall: {
  prompt: "...",                // free text, no options
  answer: "...",                // model answer, shown on request
  points: ["..."]               // optional checklist to self-grade against
}
```

`apply` is the existing multiple-choice question. It is still `chunk.quiz` in
the data — renaming the field would invalidate saved progress for no gain.

`data_m5.js` chunk 1 is the worked example of both.

### The evidence, so a later change doesn't undo it
- **Predict** exploits the *pretesting effect*: attempting a question before
  instruction improves later retention **even when the guess is wrong**. The
  value is in the attempt, so it is **never scored, never recorded in stats,
  and never counted as a missed chunk** — and the learner is told outright that
  guessing is the point. Scoring it would turn the strongest thing about the
  phase into a penalty for not already knowing the material.
- **Recall** exploits the *generation effect*: producing an answer beats
  recognising one, which is precisely what multiple choice cannot test. It is
  self-graded, which is honest about an offline app — nothing here can mark
  prose, and a generous self-grade costs nothing because it isn't scored either.
  If the learner writes nothing, the model answer says so: reading an answer you
  never attempted is just re-reading, one of the weakest techniques in
  Dunlosky et al.

### Implementation notes
- `phasesFor(chunk)` builds the phase list from what the chunk actually has.
  Nothing else should hardcode phase order — the progress bar, the back
  buttons and the entry phase all derive from it, so a chunk with five phases
  shows an honest bar instead of one that jumps.
- `finishChunk(originEl)` is the **single** place a chunk closes out: the
  completion record, the XP award, the vitals cost and the routing all live
  there, so the question phase and the recall phase can't drift apart.

## Adding a course

1. `cp -r library/content/_template library/content/<slug>`
2. Write one `data_m*.js` per module.
3. Fill in the manifest in `<slug>/course.js` — a `Content.course({...})` call
   listing units and which module constants each contains.
4. Add the script tags in `index.html`, between `registry.js` and `build.js`.
   **Module files before the course file** — the manifest references the
   `MODULE_N` constants directly.

No branch changes. No edits to any other course. `data.js` is gone; nothing
has a hardcoded list of modules any more.

**Working on a course in a fresh session costs you that one folder** — not
`library.js`, not the other courses. That is the whole point of the split.

### Unit and topic ids are global
Progress, reviews and the Garden are keyed on unit and topic ids, so two
courses reusing an id would silently share progress. `Content.build()` checks
and logs a console error naming both offenders — but pick fresh ids rather
than relying on it. Units 6, 7 and 8 are taken by Intro to CS and are
historical names kept because saved progress depends on them.

## Learning-design decisions that must not be undone
Full reasoning in PROJECT.md §5. Short version:

- Exam questions **and** their options are shuffled every attempt. Before this
  a failed exam could be retried and passed from position memory.
- **Chunk-question options are shuffled on entry to the question phase**, and
  again on a re-ask. Written order was badly skewed — module 3 answered B on ten
  of eleven questions, module 4 on sixteen of eighteen, so pressing B cleared
  units 6–7 without reading. Shuffling fixes every module at once; rebalancing
  57 answer keys by hand would have fixed only the ones someone remembered to
  check. `openQuiz()` is the only place that shuffle happens — never inside
  `renderQuiz`, which re-runs on every click.
- Wrong chunk answers re-ask that chunk before the exam, straight to the
  question — no re-reading.
- No hard locks. Order is a recommendation badge, not a gate.
- No points, badges, streaks or leaderboards.
- **Nothing in the Shop or Arcade may buy progress, hints, retries or exam
  advantage.** That is the line the whole design rests on.

## Gotchas
- `renderExamQuestion` needs `const topic = getTopic()`. It was once removed
  during a refactor while `topic.icon` was still referenced two lines below —
  ReferenceError, blank exam screen, every exam broken.
- `startExam` must reset `state.examSubmitted = []` or retries render with
  answers pre-revealed.
- `renderQuiz` grades against `quizView(chunk)`, never `chunk.quiz` — the same
  discipline as the exam. Entering the question phase must go through
  `openQuiz()`; setting `state.chunkPhase = "quiz"` directly leaves the written
  order on screen.
- Exams grade against `state.examQuestions` (the shuffled copy), never
  `topic.examQuestions`.
- Content load order: `registry.js` → per-course modules → that course's
  `course.js` → `build.js`. A course file references `MODULE_N` constants
  directly, so its modules must load first.
- **A missing module `<script>` tag used to empty the whole Library.** The
  course file names `MODULE_N` directly, so a missing or late-ordered module
  file threw a `ReferenceError` that aborted `course.js` — `Content.course()`
  never ran, no course registered, and every screen came up blank. The symptom
  pointed nowhere near the cause. `intro-cs/course.js` now reads each module
  through a `typeof` guard and a `mod()` helper that `console.error`s the exact
  script tag to add and drops only that unit. Copy the pattern into any new
  course file; do not go back to bare `MODULE_N` references.
- `build.js` is the only file that creates `MODULES`, `UNITS`, `COURSES`,
  `ALL_TOPICS` and `UNIT_TOPICS`, and it creates them from whatever registered
  itself. Don't hardcode a course anywhere.

## Not done
- **Backfill of modules 1–4** to `CONTENT-MODEL.md`: 57 chunks needing block
  explanations (~200 words each, currently 84), ~114 citations (currently zero),
  `wisdomTags`, and `predict`/`recall` at topic edges. Roughly four modules of
  writing, not an edit pass. Order: m3 → m1 → m2 → m4.
- `wisdomTags` is read by `library.js` and set by **no chunk in any module**, so
  every post-exam quote is currently drawn at random from the whole pool.

