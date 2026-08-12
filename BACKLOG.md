# BACKLOG.md — everything flagged 2026-08-12, not yet all done

## Batch 7 — two tiny items, done (13% of session left)

- [x] **"Watered! +5xp" overlap — verified, no bug.** Triggered the
      real `startNextDueReview()` → flashcard review → "Watered!"
      screen live (not a mock), confirmed `#result-charge` and
      `.result-btns` don't overlap (16px clean gap). The earlier
      generic CSS fix already covered this screen since it shares the
      same result markup — nothing to change.
- [x] **Wallet-click mechanic explainer** — clicking the wallet chip
      now shows a one-line popover (balance + where it comes from/goes)
      using the exact same toggle/position/outside-click pattern as
      the existing streak popover in `core/hud.js`, reusing its CSS.
      `index.html` (+1 element), `shop/life.js` (+1 handler),
      `styles/shop.css` (+cursor:pointer). Verified live: opens with
      the right text, closes on a second click.

## Status snapshot — relayed back to the user, appended verbatim

This is the full open-items table as sent back to the user after the
Batch 4 security/Story audit, kept here exactly so it isn't lost. **It
is already partly stale as of Batch 4/5/6 above it in this file** — two
rows changed status right after this table was written:

- **"Erase Story mode + hunger/thirst/hygiene"** — Story itself is now
  **done** (see Batch 4). Only the life-sim's *own* removal is still
  open, and it's now separately scoped as Batch 5, smaller than this
  row implies.
- Everything else in the table below is still accurate as of Batch 6.

| Item | Status |
|---|---|
| Theme preview for locked themes in Settings | Not started |
| Flashcards manager (persistent, "near all units") | Not started — likely overlaps with the deck builder, needs a scoping decision |
| VFX for flashcards | Not started — your note trailed off ("vfx (flashcards, ).") before saying what |
| Crash game reskin (ball on fire) | Not started |
| Kirigami-style background variations, rank-gated | Not started |
| Achievements/badges + profile screen | Confirmed (you said build it anyway, reversal written into PROJECT.md) but not built |
| Online database / live backend | Assigned: Supabase (see Batch 6) — nothing built; this gates the next few rows |
| Career weekly XP ladder (#N badge, popup, rank deltas) | Not started — needs the backend above |
| Stars currency for course pricing | Not started — flagged that it's a 3rd currency needing a real design decision, and the ad-watching path needs a real ad network |
| Wallet-click mechanic explainer | Not started |
| Settings hints on/off toggle | Not started |
| "Watered! +5xp" overlap on the Garden's single-topic review screen specifically | Not re-verified — the general case was fixed but this exact screen state has never been checked live |
| Wallet bank/stocks (3 stocks, deposits) | Not started — unclear if local-only or tied to the black market's live economy |
| Black market (financial pyramid, bots) | Not started — depends on backend |
| ~~Erase Story mode + hunger/thirst/hygiene~~ | **Story: done (Batch 4). Life-sim removal: scoped separately, Batch 5.** |
| Post-completion questionnaire | Blocked — confirmed as real data collection with no backend to send it to |
| Final Quiz / cumulative exam content | Reference material saved in this file, content not written |
| "Add more cards" (original ambiguous ask) | Never resolved directly — folded into the cheat-code fix instead |

---

## Batch 4 — security & bug audit, plus Story removal — done

Findings from a deliberate audit pass, each reproduced in the browser
before being fixed rather than assumed:

- [x] **XSS via profile name (confirmed exploitable).** `core/profile.js`
      interpolated `p.name` into `innerHTML` in the profile dropdown. A
      profile named `<img src=x onerror=...>` executed arbitrary JS on
      every dropdown open — and rode along inside exported profile
      files, so a shared "backup" was an attack vector. Every other
      place a name is rendered already used `textContent`; this was the
      one that didn't. Fixed with `textContent` + `append`. Verified:
      0 elements created, payload now renders as literal text.
- [x] **Malformed import bricked the app (confirmed).** `importData`
      validated only that `profiles` was an object, then wrote it
      straight to storage. A profile missing `stats` made `getStats()`
      and `recordQuizAnswer()` throw — Statistics dead, every quiz
      answer dead — recoverable only by clearing localStorage by hand.
      Fixed with a `normalizeProfile()` backstop that heals any missing
      or wrong-typed field, applied to every profile on every migrate.
- [x] **Silent version downgrade.** A file claiming `version: 99` was
      stamped as the current version with no migration, quietly
      dropping whatever this build didn't understand. Import now
      rejects newer-than-known files, treats a missing version as
      oldest-known so every step runs, and routes through `migrate()`
      instead of a raw `save()`.
- [x] **Dangling `activeProfileId`.** Could point at a profile that
      isn't there, leaving a half-loaded state. Now repaired on load.
- [x] **`save()` could throw on a full disk / Safari private mode.**
      It was a bare `localStorage.setItem`. Now returns false and emits
      `db:saveFailed` instead of throwing mid-action. Contract
      signatures made quota a real ceiling, not a theoretical one.
- [x] **Listener leak in the contract modal** (introduced earlier the
      same day): a `window` mouseup handler was added every time the
      modal opened and never removed. Now cleaned up on both exits.

**Story removed**, as requested twice:

- [x] Deleted `story/` and `styles/story.css`; removed the script tags,
      stylesheet link and `#story-modal`; cleared the DB story API
      (the `storyProgress` *field* is kept — this project never drops a
      field in a migration); cleaned every stale reference in
      `games.js`, `boot.js`, `lobby.js`, `ARCHITECTURE.md`, `PROJECT.md`.
- [x] **Caught a soft-lock the removal would have shipped.** The Life
      panel (food/water/shelter) was a *guest on the Story tab* — with
      Story gone it became unreachable, while vitals still decayed on
      every chunk, exam and arcade round and `isWeak()` still shut the
      Arcade. That is a guaranteed, unrecoverable Arcade lockout. Fixed
      by registering the Life panel as its own rank-gated Arcade tab
      (registered from `games.js`, since `life.js` loads first and can't
      see `Arcade.registerTab` yet). Verified the whole loop: drain
      vitals → Arcade shuts → buy from Life tab → Arcade reopens.

**Still open, deliberately not done here:** the life-sim's own removal
— see "Batch 5" below for the scope and plan. The app is fully working
either way, with or without it, as things stand right now.

## Batch 5 — enlisted, not started: remove the life-sim

Re-scoped after the Story audit — smaller than first estimated. Every
`Dojo.LifeShop.*` and `Dojo.renderVitals()` call site outside
`shop/life.js` itself is already `if (Dojo.LifeShop)` / `&&`-guarded,
because the app was already built to tolerate a branch not loading
(see `core/boot.js`'s comment on droppable branches). That means the
blunt version of this removal — just not loading `shop/life.js` — would
mostly already work. The real work is the leftover UI it'd leave behind.

- [ ] **Drop the file and its load.** Remove `shop/life.js`'s
      `<script>` tag from `index.html`, delete the file, delete
      `styles/`'s vitals-strip rules if life.js owned any dedicated ones
      (check `base.css`/`shop.css` — some vitals CSS may be shared with
      other UI, don't delete blind).
- [ ] **Remove the Life tab registration** added this session in
      `games/games.js` (`TAB_GATE.life`, the `registerTab({id:"life"...`
      block) — it calls `Dojo.renderLifeTab`, which won't exist once
      the file's gone; harmless while guarded, but dead code once the
      thing it guards is deleted on purpose.
- [ ] **Clean the 5 UI strings that reference "the Arcade is shut"**
      (`games.js`, `crash.js`, `hilo.js`, `mines.js`, `blackjack.js`) —
      these are inside an `isWeak()` branch that will simply never be
      true once nothing can report weak, so they're dead text, not a
      crash risk. Low priority, cosmetic.
- [ ] **`data/db.js`**: decide whether to also stop WRITING `vitals`,
      `lastVitalTick`, `storyProgress`, `inventory` to new profiles in
      `defaultProfile()`, or leave them (harmless, unread) the way
      `storyProgress` was left after the Story removal. Precedent
      leans toward leaving them — this file never drops a field, and
      an unread field costs nothing.
- [ ] **`shop/ranks.js`**: the `FEATURES.survival` rank-gate (Senior Lab
      Manager, 2220 XP) currently gates the Life tab. Once the tab's
      gone, decide if that rank should gate something else or just sit
      unused — a rank existing with nothing behind it isn't broken, but
      it's a decision either way, not an oversight to silently resolve.
- [ ] **Verify after:** full nav regression (same script used in the
      Story audit — every screen, `Dojo.Games.canPlay()`, an arcade
      round) and confirm `Dojo.LifeShop` being `undefined` doesn't throw
      anywhere it's referenced without a guard (there were none found
      this pass, but re-check — new code may have added one since).

## Batch 6 — backend: assigned, not started

**Decision, not just a recommendation now: Supabase.** Reasoning stands
from the earlier analysis (hosted Postgres + Auth, CDN-loadable client
so the app keeps its no-build identity, and the leaderboard/black-market
features are relational by nature — rankings and payouts fit SQL far
better than Firestore's query model). This is the thing everything in
section G-of-earlier (weekly ladder, black market, cross-device sync)
was blocked on. It's now the assigned direction, not an open question —
what's still open is the *sequencing*, laid out below.

**Nothing built yet.** This is genuinely the largest item in this whole
file — a new external dependency, the first time user data leaves the
device, and the first real ongoing cost. It should start its own
session, not the tail end of one that's mostly out of budget.

1. Create the Supabase project (needs the user's own account/billing —
   not something to spin up unilaterally).
2. Add auth as strictly opt-in ("Sync & Compete"), preserving the
   current "no account needed" solo experience untouched.
3. A thin write-through sync layer — local `data/db.js` stays the
   source of truth for solo play; Supabase is a mirror that powers the
   social features only.
4. Weekly ladder as a backend-computed view, never assembled
   client-side from other users' raw rows.
5. Black market last — the one feature that genuinely needs live
   multi-user interaction and server-side payout logic.

## Batch 3 (2026-08-12, later) — done

- [x] **Rank XP doubled** (`shop/ranks.js`) — grind felt too fast, every
      threshold doubled (5,000 → 10,000 XP ceiling), comments updated.
- [x] **Cheat codes replaced with a secret profile name.** codes.js
      never ships to the deployed site (gitignored on purpose), so the
      `adminaccount` code was unusable in production. Moved to
      `data/db.js`: creating a profile literally named `adminaccount`
      (case-insensitive) now starts it fully unlocked, tickets full,
      wallet at $50,000 — ships fine since it's not a file that has to
      be committed. `codes.js`/`codes.example.js` emptied; `settings/
      CHEATCODES.md` rewritten to document the new mechanism.
- [x] **Bug: locked-unit tooltips showed literal `&ldquo;`/`&rdquo;`
      text** instead of curly quotes (screenshot). CSS `content:
      attr()` never decodes HTML entities — swapped in real Unicode
      quote characters in all 4 occurrences.
- [x] **Bug: Arcade's "← Lobby" button skipped the game list** while
      mid-game, even though each game's own "✕ Close" already
      correctly returned to it. New `backFromArcade()` steps back one
      level at a time; second press reaches the Lobby.
- [x] **Definitions flashcard mode**, built and populated across the
      **entire course** for the user's real final exam: a `glossary:
      [{term, definition}]` field added to all 141 chunks in all 10
      modules (Units 1-8 including the 4 legacy modules), a "📖
      Definitions" toggle added next to the existing quiz-card mode in
      the deck builder, sourcing minimalistic term→definition cards
      instead of MCQ-derived ones. 247 total definition cards.
      Verified live end-to-end.

---

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

# Batch 2 (2026-08-12, later same day)

**Not committed yet — explicit instruction: hold everything until the
usage limit resets, this is planning only.** Nothing below has been
built. Two clarifying questions were asked and answered before writing
this section; both are folded in below rather than left as open
questions.

## F. Resolved contradictions / decisions

- **Story mode: erase it.** The note describing a card-based rework
  ("Action, Rest, Event... turn cards", hunger/thirst/hygiene via a
  daily deck instead of the shop) was sent by mistake — the user's own
  words: *"I forgot to erase this part."* The actual instruction is the
  one right after it: **"Erase the Story - not practical part of the
  service."** Scope: remove the `story/` branch and the hunger/thirst/
  hygiene life-sim it drives (`shop/life.js`'s vitals system), not just
  hide the lobby tile. Touches `index.html` (story-modal, story lobby
  tile), `core/boot.js` wiring, `shop/life.js` (vitals block), and
  whatever in `shop/shop.js` sells shelter/food/hygiene items. Needs a
  proper removal pass, not a quick delete — check what else reads
  `DB.getVitals()`/`survivalOn()` first (the wallet-visibility fix
  earlier this session already depends on `survivalOn()`, for one).
- **Backend direction: start moving toward a real online backend now.**
  This is the single item everything else in this batch either depends
  on or doesn't — see the plan below.

## G. The backend question — a real plan, not yet started

This app is currently a static, dependency-free PWA: no server, no
build step, no accounts — everything lives in one `localStorage` blob
per browser (`data/db.js`, currently DB v9). Three notes in this batch
need a *live, multi-user* backend to mean anything at all:

1. **Weekly XP ladder** (Career screen: a `#N` position badge next to
   rank, a popup showing standings, rank-up deltas accumulated without
   losses on a bad week).
2. **Black market** — a financial-pyramid mini-game against other real
   users (bots for now, explicitly named as a stand-in until real users
   exist).
3. Implicitly, **cross-device sync** — a live ladder is meaningless if
   "you" are a different, disconnected profile on every device.

This is also the **third** reversal of a documented PROJECT.md §5
decision this project has now made by explicit request — streaks, then
badges, now leaderboards. Same treatment: write it down as a flagged
reversal once it's actually built, not silently.

**Recommended approach: Supabase** (hosted Postgres + Auth + a CDN-
loadable JS client, no bundler required — keeps the app's zero-build
identity closer to intact than a custom Node server would).
Why over Firebase: leaderboards and the black-market's risk/payout
logic are relational by nature (rankings, participants, contributions,
payouts) — Postgres window functions and `ORDER BY` are a much more
natural fit than Firestore's query model. Both have workable free
tiers to start.

**Sequencing, once this is actually greenlit to build:**
1. **Accounts as an opt-in layer, not a requirement.** The app's own
   landing copy currently promises *"No account needed — progress saves
   automatically, on this device"* — that should stay true for solo
   study. A new "Sync & Compete" step creates a real Supabase account
   (email/magic-link, no password to manage) only for someone who wants
   the ladder or black market.
2. **Local stays the source of truth for solo progress.** Key events
   (XP gained, topic completed) write through to Supabase as a mirror;
   the app still reads its own local DB first, so it keeps working
   fully offline. The backend is what powers the social features, not
   a replacement for the existing offline-first design.
3. **Weekly ladder as a backend-computed view**, not something the
   client assembles from other users' raw rows (privacy and scale both
   argue against that) — a scheduled reset + a small query the Career
   screen calls for "your rank, delta from last week."
4. **Black market last** — it's the one feature that actually needs
   live multi-user interaction and server-side risk/payout logic (to
   keep a real-money-adjacent mechanic from being trivially cheated
   client-side). Bots first, as already scoped, real users once the
   ladder/sync foundation is proven.

**What deliberately stays local, unaffected by any of this:** course
content (`data_m*.js` files — no reason to move static curriculum into
a database), and solo spaced-repetition state (still local-first,
mirrored up only for the parts of the app that need to see other
people).

**Not yet decided, needs the user's call before step 1 starts:** actual
Supabase project setup/billing owner, and whether "Sync & Compete"
gates on the wallet's real-money features (stocks, black market) too,
or only on the ladder.

## H. Everything else from this batch — mostly small, a few need scoping

- [ ] **Theme preview in Settings** for locked themes — show what a
      locked theme looks like before it's unlocked. Small, self-
      contained, no backend needed.
- [ ] **New cheat code: `unlockallunits`** — as literally requested,
      but worth flagging: `admin613` already unlocks every unit (unit
      locks are prereq-based off `completedTopics`, and `admin613` sets
      every topic complete). If the intent is "units reachable but
      chunks still fresh/ungraded" that's already exactly what
      `admin613` does today, distinct from `unlockalltopics`. Will add
      the named code regardless since it was explicitly asked for, but
      may just alias `admin613` unless there's a difference in mind
      worth asking about next session.
- [ ] **Flashcards manager** — a persistent screen (not tucked inside
      one course's unit-select) to pick any chunk across any unit and
      track flashcard history, positioned near "all units." Sounds like
      the natural evolution of the custom deck builder — likely the
      same underlying picker, promoted to its own lobby-level entry
      rather than a button inside Library. See also the next item.
- [ ] **Rename/reposition: "Flashcards Deck" instead of "Build a Custom
      Deck."** Reads as the same request as the flashcards manager
      above — confirm whether this is a rename of the existing button,
      or describing the standalone manager screen, before touching
      either.
- [ ] **VFX line item is incomplete** — "vfx (flashcards, )." trails
      off. Needs the rest of the sentence before there's anything to
      build.
- [ ] **Crash game reskin** — replace the current rocket-on-an-
      exponential-curve animation with a guy kicking a ball that flies
      fast enough to catch fire, same exponential curve underneath.
      Self-contained visual change in `games/`.
- [ ] **More background stripe designs** (kirigami-style, several
      variations) — one available immediately, a few gated to early
      ranks. Extends the existing theme/rank-reward system
      (`shop/themes.js`-adjacent), doesn't need new infrastructure.
- [ ] **Achievements/badges** — already confirmed and documented as a
      reversal in PROJECT.md §5 last session; this batch just restates
      it. Tracked under section D above, not duplicated here.
- [ ] **Career: weekly ladder position + popup** — see section G, this
      is backend-gated.
- [ ] **Stars currency for course pricing** — a course costs stars
      equal to its chunk count, adjusted by a difficulty/importance
      multiplier (-30% for easy, up to +100% for high-importance
      material), stars bought with wallet $ (shown before the $ price),
      and earnable by watching an ad or paying directly. This adds a
      **third** currency alongside XP (rank) and $ (wallet) — needs a
      real design pass on how they relate (does $ → stars conversion
      have its own rate? can stars ever convert back?), and the
      ad-watching path means integrating an actual ad network, which is
      a real product/legal decision, not just a UI toggle. Flag before
      building: is this meant to replace the wallet as the course-gate
      currency, or sit alongside it permanently?
- [ ] **Wallet click → brief mechanic explainer** — small tooltip/
      popover on tap, no backend needed.
- [ ] **Settings: hints on/off toggle** — small, self-contained.
- [ ] **Bug: "Watered! +5xp sits almost on Review again"** — this is
      the Garden's single-topic flashcard review result screen
      specifically. The general XP-badge-overlap fix earlier this
      session (`#result-charge:not(:empty)` margin) was verified on the
      exam-fail and custom-deck-finish paths, but not re-checked on
      this exact "Watered!" state — needs a live re-check next session
      before assuming it's already covered.
- [ ] **Wallet "bank": deposits + 3 stocks** with different risk/
      benefit profiles. A simulated investment mini-game — can be built
      fully local/offline (fake price movement, no real market data
      needed) unless it's meant to tie into the black-market's
      real-user economy, in which case it's backend-gated too. Needs
      that distinction made before scoping.

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

