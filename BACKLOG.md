# BACKLOG.md — everything flagged 2026-08-12, not yet all done

Dumped in one batch by the user right after the custom flashcard deck
builder shipped. Captured here in full so nothing gets lost before it's
triaged and built. Update this file's checkboxes as items land — don't
let it go stale.

---

## A. Quick, well-defined bugs — done

- [x] **Deck builder entry button overlapped Unit 1's roadmap bubble.**
      Root cause: `renderRoadmap`/`renderUnitRoadmap` started their
      first bubble's y-position at 24px, but the bubble's 116px
      cluster-ring pokes ~58px above its own center — it was poking 34px
      above the roadmap container's top edge the whole time, just with
      nothing sitting close enough above it to make that visible until
      now. Fixed by starting both roadmaps at y=60 instead. Checked
      both Map and List topology in unit-select — List never had the
      bug (normal document flow), Map is now fixed.
- [x] **"+N XP" badge overlapped the Review Again / Back buttons.**
      `#result-charge` and `#result-wisdom` had no margin-bottom, so an
      empty one collapsed to zero height and a populated one sat flush
      against `.result-btns`. Fixed with conditional `:not(:empty)`
      margins on both containers.
- [x] **Unit 5 topic 1's "Take Mastery Exam" button led to the recall
      page.** Not a routing bug — every chunk in the reference modules
      has a `recall` phase, and the quiz-phase button always said "Take
      Mastery Exam 🏆" even when recall was next, not the exam. Fixed:
      that button now says "Continue →" whenever a recall phase
      intervenes; recall's own final button is the one that genuinely
      promises the exam next (already correctly labeled). Shared code,
      so this was never actually Unit-5-specific.
- [x] **Unit 5 predict-phase CSS** — checked live, already fine. This
      was the `.quiz-option`/`.qo-letter`/`.qo-text` fix from earlier
      this session; shared across every module, Unit 5 included.
- [x] **Deck builder didn't respect unit/topic locks** (flagged
      mid-fix, not in the original batch) — it listed every unit and
      topic in the course regardless of lock state. Fixed: locked units
      render as disabled 🔒 pills, locked topics render as a
      non-interactive placeholder with no chunk chips, both using the
      same prereq rule as `renderUnitRoadmap`/`renderRoadmap`.

## C. Confirmed behavior changes — done

- [x] **Streak renews on topic completion, not chunk completion.**
      `DB.touchStreak()` moved from `finishChunk` (fired every chunk)
      to `showExamResults`, gated on `passed` — see PROJECT.md's
      streak-reversal note for the updated rationale.
- [x] **Mastery exam: one retry after a fail, then redo the topic.**
      `state.examAttempts` counts real exam starts, resets in
      `startTopic`. A second failed attempt swaps "Retry Exam" for
      "Redo Topic," which restarts the topic from chunk 0 instead of
      relaunching the exam directly.

## A2. Second bug batch — done

- [x] **Wallet strip was showing on every screen, including mid-lesson
      — distracting.** Clarified answer: hide it everywhere the Library
      owns the screen (course-select, unit-select, topic-map,
      deck-builder, lesson, exam, exam-result, flashcards), keep it in
      Garden and Arcade specifically. Fixed in `shop/life.js`'s
      `renderVitals()`, re-run on every screen switch via a new hook in
      `core/core.js`'s `showScreen()` (the one choke point every
      transition — Router-based or not — passes through).
- [x] **New cheat code: `unlockalltopics`.** Requested mid-session for
      testing the deck builder freely. `admin613` already unlocked
      every topic (and therefore every unit/topic lock, since those are
      all prereq-based off `completedTopics`), but never touched
      `completedChunks` — which the deck builder's default selection
      and known/weak/new indicators actually read. `unlockalltopics`
      marks every topic AND every chunk complete. Added to
      `settings/codes.js`, `settings/codes.example.js`, and
      `docs/CHEATCODES.md`.
- [x] **Deck builder didn't respect unit/topic locks** — see A above,
      already fixed before this cheat code was requested.

## B. Clarified — sequencing below

- [x] **"Add more cards"** — never got a direct answer; folded into the
      `unlockalltopics` cheat code instead, since the actual blocker
      turned out to be "nothing to test with," not a picker default.
      Revisit if there's still a gap once real content exists.
- [x] **"Hide money wallet"** — answered and fixed, see A2 above.
- [x] **Contract/signature popup** — answered: **real data collection**,
      not flavor-text roleplay.
- [x] **Post-completion questionnaire** — answered: **both** learner
      feedback on the course AND user research/demographics.

Both of the last two now collect real personal data in an app that is,
per PROJECT.md, offline-first with **no backend and no server** —
everything currently lives in `localStorage` on the user's own device
(see `data/DATA.md`). Resolved: the contract turned out to mean a fun
drawable signature, not real PII — see below, done.

## A3. Contract popup — done

- [x] **Course contract with a drawable signature**, CS:GO-throwback
      style. Shown once, the first time a course is entered (checked
      via `DB.hasSignedContract`). A canvas signature pad (mouse +
      touch), funny in-theme "trainee pledge" copy, no real personal
      data — the drawing itself is downsized to a small JPEG dataURL
      and stored in the profile (`p.courseContracts`), same place
      everything else already lives. `data/db.js` bumped to v9 with a
      migration step. Verified live: modal renders, signing persists,
      re-entering the course skips straight past it.
- [ ] **Post-completion questionnaire** — still open, and still the
      real-data-collection one. Same backend/storage question as
      before: there's no server, so "real data collection" needs a
      destination decided before any UI gets built.

## D. New features (sequence, largest last)

- [ ] **User profile screen with stats and badges** — confirmed, build
      it. Reversal now written into PROJECT.md §5 next to the streak
      one it mirrors. Not yet started.
- [ ] **Shop: spend $ to customize your profile**, plus "slots" to
      display badges/items earned. Depends on the profile screen above
      existing first.
- [ ] **Post-completion questionnaire** — blocked on the backend/
      storage question above.
- [ ] **Final Quiz / Concluding-the-Course exam** — a cumulative exam
      drawing questions across every unit (2 real example quizzes were
      pasted covering unit 5-8 material: networks, databases, OS,
      Boolean algebra, number systems, mobile OS, Big Data, ML,
      blockchain, IoT, VR — 40 sample questions total). This is a
      content-authoring task on the scale of a full unit, not a quick
      add.

## E. Not a coding task — answered

- [x] **"What is the marketing model to use this website and make
      money"** — answered in chat, see that response.

---

## Reference: the two pasted sample "Final Quiz" question sets

Kept here verbatim so the eventual final-exam content pass has the
real source material, rather than re-asking the user for it.

<details>
<summary>Set 1 — 20 questions, unanswered (topic list only)</summary>

1. The _____ transmission modes double the utilization of transmission
   bandwidth — half-duplex / **full-duplex** / simple / unicast
2. Main function of an ISP — **connect users to the internet** / manage
   networks / hardware support / develop software
3. A=1,B=0,C=1: A + B·C = ? — OR / AND / 0 / **1**
4. Mainframes are commonly used for ______ — **scientific research** /
   gaming / personal tasks / embedded systems
5. "Data independence" means — encrypted data / irrelevant data / data
   defined separately from programs / **ability to modify schema
   without affecting applications**
6. A block in a blockchain is — database record / cryptographic key /
   encryption algorithm / **a group of transactions**
7. Program structured as classes/objects for communication —
   procedural / imperative / **object-oriented** / functional
8. Protocol for WWW communication — FTP / IP / TCP / **HTTP**
9. Data abstraction level dealing with physical storage/retrieval —
   external / **physical** / conceptual / logical
10. "Debugging" refers to — analysing specs / **eliminating errors** /
    writing docs / identifying requirements
11. Generation introduced with Integrated Circuits — second / fourth /
    first / **third**
12. Function of an actuator in IoT — sensing / processing /
    **initiating actions from received data** / transmitting to cloud
13. Preserved in isolated transaction execution — dependency /
    consistency / **atomicity** / security
14. Enables hierarchical relationships in OOP — object / **inheritance**
    / attributes / polymorphism
15. Control structure for decisions based on conditions — iteration /
    abstraction / **selection** / sequencing
16. Elasticity in cloud computing = — **dynamic scaling of resources on
    demand** / reduced latency / higher upfront cost / better security
17. Primary advantage of Unicode over ASCII — simplicity / speed /
    **larger character set** / lower memory
18. "Scalability is the OS characteristic of handling more work by
    adding resources" — FALSE / **TRUE**
19. Iterative control structure — decision making / **loop** /
    sequential / jump
20. First step in top-down analysis — hierarchy of lower modules /
    flow charts / **identifying top-level functions** / random assembly

</details>

<details>
<summary>Set 2 — 20 questions, with a real student's answer key (mix of correct/incorrect shown)</summary>

1. External schema = **how data is viewed by specific user groups**
   (conceptual org. / physical storage / logical structure were wrong
   options)
2. OS part managing hardware requests/allocation = **Device
   management** (not Security / Control of System performance / File
   Management)
3. Primary goal of VR = **create a completely new reality** (not
   replace computers / enhance physical reality / improve internet)
4. Purpose of a Network OS = **managing shared resources and
   facilitating communication in a network**
5. Distributive law result = **A·(B+C) = A·B + A·C**
6. Von Neumann architecture characterized by = **separate data and
   instruction memory** (not lack of control unit / analog circuits /
   parallel processing)
7. Software category incl. games/browsers/productivity tools =
   **Application software**
8. "Velocity" in Big Data = **speed data is generated and processed**
9. Mobile OS runs on = **tablets** (among PC/palmtop/laptop distractors
   — question is oddly worded, keep as-is if reused)
10. Smallest unit of data in memory = **Bit**
11. Topology involving tokens = **Ring**
12. Common application of unsupervised learning = **Anomaly detection**
13. Gate with output 0 when at least one input is 1 = **NOR**
14. Next step after identifying a logical error = **Fix the error**
15. Purpose of BCD coding = **Efficient storage of numeric data**
16. Method to convert octal to decimal = **Multiply by 8**
17. Discovering patterns/knowledge from large datasets = **Data
    mining**
18. OS that runs on a server, manages data/users/groups =
    **Network operating system**
19. Convert hex 3A.5 to binary = **111010.0101**
20. "Problem analysis is done after system design" = **FALSE**

</details>

