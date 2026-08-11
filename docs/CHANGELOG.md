# Changelog

## Stage 13 — vitals off the top bar, flashcard watering, and a backlog

Requested as one large batch. Denoted here as parts so the scope stays
visible instead of getting lost mid-build; each part lands as its own pass.

**Done:**
- Hunger/thirst/hygiene removed from the always-on top strip — only
  shelter + wallet show there now. Full vitals detail still lives in the
  Story tab's life panel; nothing was lost, just not duplicated everywhere.
- Watering a due plant now launches a flashcard deck (front/back, built
  straight from each chunk's quiz) instead of replaying the whole topic.
  Pays a small XP bonus, gated by a 2.5s-per-card minimum so tapping
  through without reading doesn't count toward it.
- Rank insignia sizing fixed on the HUD chip; the HUD's rank name no
  longer duplicates as both an abbreviation and a full name.
- New premium theme, **Kirigami** (monochrome, torn-paper), awarded at
  General — the one top-of-ladder rank that had no reward.

**Part 1 — done:**
- Vitals decay moved from real-time/per-activity to **story-day** based:
  a story day passes each time a story scene is resolved
  (`LifeShop.storyDayTick()`, called from `story.js#resolveChoice`), not
  on the wall clock. The old real-calendar-day tick (`dailyTick`) and its
  boot-time call are gone; night theft now rolls on a story day instead.
- Streak tracking with 2 freezes/week (`DB.touchStreak`, DB v7), shown on
  the Lobby. This directly reverses a documented decision in
  `PROJECT.md` §5 ("streaks punish taking days off, which is exactly what
  spacing is for") — flagged before building, built as asked. The freeze
  allowance is the standard mitigation for that criticism, not a rebuttal
  of it; the reversal is written down in `PROJECT.md` §5 rather than done
  quietly. A gap longer than the available freezes resets the count; not
  backfilled for existing profiles since there's no record of which real
  days their past progress happened on.

**Part 2 — done:**
- Mines (`games/mines.js`), $200 unlock. Pick a field (4×4/5×5/6×6) and a
  mine count; RTP applied per reveal so the edge compounds over a chain
  (`0.96^k`), same family as Hi-Lo, same 50× cap. Verified against
  `0.96^k` across several field/mine configs.

**Part 3 — done:**
- Crash rework (`games/crash.js`): the multiplier is now drawn as a real
  exponential curve (SVG, raw `{t, m}` samples redrawn each frame, axes
  auto-rescale so a typical short round still fills the frame), red on
  crash. A rocket rides the curve's tip through four cross-fading sky
  layers keyed to the multiplier: ground/city/mountains/river, clouds
  (~1.2×-3×), upper atmosphere (~2.5×-5×), deep space with two planets
  (~4×+) — verified live through a full climb from 1× to a 6.49× cash-out
  showing both planets. Loss shakes the stage and explodes the rocket;
  win flashes green.
- Money VFX centralized in `Games.settle()` (`games.js`) → `moneyBurst()`
  (`core/hud.js`): a coin burst + green pulse on the wallet badge on any
  win, a red shake on any loss — every game gets this for free, not just
  Crash. Global click ripple added app-wide in `core/core.js` (delegated
  `pointerdown`, one listener for the whole shell).
- **No audio** — the two Envato SFX assets requested need a purchased
  license this session doesn't have, so sound stays out of scope until
  real files are provided. Full design writeup in `games/GAMES.md`.

**Part 4 — done:**
- Light themes are real now: `core/theme.js`'s `applyTheme` sets
  `--text`/`--text-dim`/`--text-muted`/`--border` from a light-on-dark or
  dark-on-light pair keyed on a new `mode: "light"` theme field, instead
  of a fixed pair for every theme. Two new themes: **Frost** (free) and
  **Paper** (moved to Awarded, gated to Corporal/390 XP — the next open
  rank rung after Specialist's Sakura). Found and fixed two hardcoded
  dark-literal backgrounds that broke outright on a light theme
  (`.topbar` was a copied `rgba(10,14,26,...)`, not `--bg-deep-rgb`;
  `.theme-swatch` was a white wash invisible on light backgrounds) — a
  few more of the same pattern are flagged as a known gap in `CORE.md`.
- Lobby got a **re-skin**, not a rearrangement (confirmed explicitly
  before building): `DB.getLobbyStyle()` toggles `.lobby-style-cards` on
  the same six tiles — elevated shadow, rounded icon badges — picked in
  Settings alongside the theme, DB v8.
- Settings' "Premium themes" section renamed to **"Awarded themes"** —
  matches the actual model (rank-earned, nothing purchasable); the
  `PREMIUM_THEMES` identifier stays as-is internally.

**Part 5 — queued, largest:**
- Ukrainian localization, confirmed full scope: UI chrome **and** all
  course content (~340KB across 6 modules). A language-switch box goes in
  the top-right. Given the content is citation-checked, pedagogically
  reviewed material, this lands in ordered sub-passes rather than one
  shot — UI chrome first (so the switcher is real and testable), then
  modules in order.

## Stage 12 — release readiness

**Consumables are carried now.** `inventory` was written on every purchase and
read by nothing — buying water applied its effect at the till, making the field
a receipt log. Wrong twice: you couldn't stock up while rich and eat while
broke (which is the actual survival decision), and buying at full thirst burned
the money silently.

Food, water and soap now go in a bag rendered above the shop and are spent with
`use(id)`. Shelter and papers still apply on purchase.

**Bug the harness caught:** buying a hostel bed while holding a lease demoted
you to hostel — the app taking your flat away for $25. A shelter purchase can
now only move you *up* the ladder.

**Privacy Policy written**, and it's unusually clean: everything is in
localStorage, no account, no server, no analytics, nothing transmitted, no
recovery. **Keep it true** — the first feature that phones home invalidates it.

**Terms of Service drafted** — as-is, study aid not accreditation, don't
redistribute the content, arcade money can't be bought or cashed out. Fine for
a free release; needs a lawyer before anyone pays.

**`docs/LEGAL.md`** — the licence decision laid out rather than made: options
for the code (reserved / MIT / Apache-2.0 / AGPL) and separately for the
content (reserved / CC BY-NC-SA), the textbook constraint from PROJECT.md §10,
the purchasable-currency question, and a pre-release checklist.

The repo still has **no LICENSE file**, and that's deliberate: with none,
default copyright applies and nobody may reuse anything, which is the safe
default while the commercial plan is open. It's a business decision, so it
stays yours.

## Stage 11 — installable app, rank codes

**PWA.** Added `manifest.webmanifest`, `sw.js`, `icons/` (192, 512, maskable,
apple-touch) and a guarded registration block. Installs to the home screen on
Android, to its own window on Windows/macOS/Linux from Chrome or Edge, and via
Add to Home Screen on iOS.

All of it is **additive**: over `file://` registration is skipped silently and
the app behaves exactly as before, so the open-the-file property survives.
Service workers need http(s) — `python3 -m http.server 8000` to test.

**No precache file list.** The usual service worker hardcodes an array of every
asset, which then needs hand-syncing with ~30 script tags forever and fails
*silently* when you forget. `sw.js` precaches only `index.html` and caches
same-origin GETs as they're fetched, so after one visit the whole app is
offline and adding a course needs no change here.

Updating means bumping `CACHE_VERSION`. Nothing auto-reloads mid-session — a
study app swapping its JS out mid-exam is worse than a stale tab. Forgetting
the bump is the one real footgun, and it's flagged in `docs/PACKAGING.md`.

**`docs/PACKAGING.md`** covers the whole route: web → PWA → Tauri → stores,
with the two things that will actually block a store build (the
purchasable-and-stakeable currency question, and the missing LICENSE / ToS).

**Codes `capmyrank` and `nullmyrank`.** The documented exception to "no code
touches rank" — rank now gates every theme, so there was no way to review the
late-ladder rewards or check what a new profile sees without grinding to 5,000
XP or wiping the profile. Both set lifetime XP directly so the ladder, the bar
and theme ownership stay in agreement, and `nullmyrank` re-applies the theme so
a reward earned at a rank you no longer hold can't stay equipped.

## Stage 10 — five-phase chunk flow, garden by course, overlap fix

**Overlapping text fixed.** `.settings-hint` carried an unconditional
`margin-top: -0.35rem` to tuck it under a section title — so anywhere it
followed something else it pulled *up into* it, which is what overlapped the
Hi-Lo and Crash stake rows. Now the negative margin only applies via
`.stats-section-title + .settings-hint`.

Root cause worth noting: `.settings-hint` and `.settings-section` lived in
`settings.css` while five branches used them. Moved to `base.css` as shared
utilities, which is what the one-stylesheet-per-branch rule actually implies.

**Garden grouped by course.** One collapsible plot per course instead of a flat
list of units, since more courses would have made it a wall of beds. Grouped by
course rather than unit because that's what a person thinks they're studying.
Only the course needing attention opens by default; open state survives
re-renders so watering doesn't fold the garden up.

**Five-phase chunk flow — schema frozen.**

```
predict → explain → example → apply → recall
```

`predict` and `recall` are optional chunk fields. All 74 existing chunks are
untouched and still run three phases; `data_m5.js` chunk 1 demonstrates all
five. Freezing now is the point — retrofitting ~60 chunks after the remaining
Unit 8 modules were written would have cost far more.

- **Predict is never scored**, never recorded, never counts as a miss, and says
  so on screen. The pretesting effect comes from the attempt, not the answer;
  scoring it would penalise not already knowing the material.
- **Recall is free text with no options**, self-graded against a model answer.
  Generation beats recognition, which is what multiple choice can't test. If
  nothing was written, the model answer says so — reading an answer you never
  attempted is just re-reading.
- `phasesFor(chunk)` derives the flow; the progress bar, back buttons and entry
  phase all read it, so nothing hardcodes phase order.
- `finishChunk()` extracted as the single place a chunk closes out, so the
  question and recall phases can't drift on XP or completion.

## Stage 9 — library stylesheet, Crash auto cash-out

**`styles/library.css` extracted.** 461 lines pulled out of `base.css`: the
topic map, lessons, quizzes, exams, results, the stats modal, source-citation
boxes, wisdom cards, due-for-review chips and weak spots — plus a
library-only media query. `base.css` drops from 1,104 to 664 lines and now
holds only the design system and the screens core owns.

Verified by counting every rule before and after: **259 rules in, 259 out**,
nothing lost, nothing duplicated. The only addition is the second media query.
Every branch now owns exactly one stylesheet, which is written into
`ARCHITECTURE.md`.

**Crash auto cash-out.** A target can be typed or picked from presets
(1.2/1.5/2/3/5) and the round takes itself off the table there.

It does **not** change the odds — 96% at every target, auto or manual,
verified at 1.2x/2x/5x over 200k rounds each. What it removes is reaction
time: a manual cash-out at 1.05x is impossible to hit and an auto one isn't.

Two details that matter: **the crash is checked before the auto in the same
frame**, so a curve that broke below the target still loses and the auto never
jumps the queue; and a fired auto pays the target *exactly* rather than
whatever the frame landed on, so payouts don't drift with frame rate.

## Stage 8 — course folders

**`data.js` is gone.** It held a hardcoded list of every module, every unit and
every course, so adding a course meant editing shared code and loading the
whole content band into a session.

Replaced by three pieces:
- `content/registry.js` — courses register themselves with `Content.course({})`
- `content/<slug>/course.js` — one manifest per course, next to its modules
- `content/build.js` — loads last, publishes `MODULES`, `UNITS`, `COURSES`,
  `ALL_TOPICS`, `UNIT_TOPICS` from whatever registered

Adding a course is now **one folder plus its script tags**. No branch changes,
no edits to any other course. `content/_template/` is a copy-me starter
carrying the module schema and the content standards from PROJECT.md §9–10.

**Duplicate id detection.** Unit and topic ids are global — progress, reviews
and the Garden are keyed on them, so two courses reusing an id would silently
share progress, and the symptom (two topics on one review schedule) looks like
a bug anywhere but in the content. `Content.build()` now names both offenders
in a console error.

**Verified**: 1 course / 3 units / 5 modules / 26 topics rebuild identically to
the old hardcoded arrays; a second course registers and rebuilds to 2/4/27
without touching anything; a deliberate duplicate unit id is caught.

## Stage 7 — story prose, Hi-Lo chains, rank rescale, code sheet

**Rank ceiling 4,180 → 5,000.** All 20 rungs respread; gaps widen smoothly
(60, 90, 110 … 460, 490). At ~30 XP/day that's Sergeant Major ≈ day 60,
Captain ≈ day 107, General ≈ day 167. Worth noting: a 5,000 ceiling is a
*longer* ladder than the 120-day brief — hitting General in 120 days needs
~42 XP/day, nearer 20 minutes than 15.

**Hi-Lo is now a chain.** One ticket buys a whole chain rather than one call.
Correct calls compound the multiplier and the turned card becomes the new base;
cash out whenever, or lose the entire chain on one wrong call. Capped at 50×,
which force-cashes.

Each call is 96%, so an n-call chain returns 0.96ⁿ — 88.5% at three calls,
66.5% at ten. The edge compounds against the player the further they push,
which is the entire point of the cash-out button, and the game's help text
says so outright.

**`agrala`** refills arcade tickets. **`docs/CHEATCODES.md`** added — every
code, where they live, and what they deliberately *don't* do (no code grants
XP, rank or a theme; rank is the one number in the app that has to be earned).

**Story prose written.** All 12 scenes, all 34 win/lose branches, ~1,700 words,
entirely in `story/scenes.js` — `story.js` needed no changes, which is what the
stage-5 split was for.

Tone settled and documented in `STORY.md`: second person, present tense, dry
and observational. Not bleak-documentary (misery with no exit is exhausting in
an app you open at 7am) and not jokey (it's people's actual lives). The
character is competent and unlucky, never pitiable, and nobody in the scenes is
a punchline — including the people who say no.

## Stage 6 — XP and ranks, energy gone, story behind a door

**Energy removed.** Tickets are the only arcade limiter now: 7 per 6 hours.
Energy and tickets were two rate limits doing the same job, and the ticket is
the one that reads as "come back later". The field stays on old profiles —
migrations never drop fields — but nothing reads it.

**Charge → XP (DB v6).** The study currency is no longer a wallet:
- No cap, no spend, no sink to design. It only accumulates.
- The top bar shows **progress to the next rank**, not a balance, so it can
  never fill up and stall — which is what the old cap did twice.
- Stored under the historical `charge`/`chargeEarned` keys; renaming them
  would invalidate every saved profile, so labels changed and keys didn't.

*Why this is better than the v5 fix:* a cap needs a sink, a sink needs prices,
and prices made studying feel like earning tokens. Rank is a record of what
you did rather than a balance you draw down, so there's nothing left to
balance.

**Shop → Inventory, rewards by rank.** 20 military ranks, Recruit → General.
Sized for ~15 min/day: 5 chunks ≈ 30 XP/day, so 120 days ≈ 3,600 XP —
Lieutenant Colonel at day 120, General near day 140. Gaps widen 20 XP per
rank so early ranks land fast and late ones mean something.

Six themes are attached to ranks 4, 7, 10, 13, 16 and 19. **The other 14 ranks
show a blank on purpose** — the empty rungs are visible so the ladder is
honest about what's filled in. Themes bought under the old paid system stay
owned; anything else falls back to Indigo rather than letting an imported
profile wear a reward it never earned.

**Story: acts behind a door.** The Story tab is now a button that opens a
story-mode overlay showing **one act at a time** behind act tabs, with unreached
acts locked. Four act-chains laid out at once spoiled the shape of the arc.

**Fixed: the page jumping to the top.** Every story choice and every life-shop
purchase re-rendered by calling `Dojo.renderGames("story")`, which re-ran the
whole tab and ended in `showScreen()` → `window.scrollTo(0, 0)`. Both now
repaint their own container in place. Written into `ARCHITECTURE.md` as a
rule: a branch redrawing itself must not go through a screen render.

## Stage 5 — the story engine

**Tickets 2 → 7 per 6 hours.** Worth knowing which limit now binds: 7 tickets
is more than a full energy bar allows, so **energy caps a sitting** (10 rounds)
and **tickets cap the day**. Raising tickets alone doesn't open the floodgates;
raising energy would.

**Story split into engine + content**
- `story/scenes.js` — pure data, the whole graph. Stage 6 touches this only.
- `story/story.js` — state, resolution, map and scene rendering.

**The graph** — 12 scenes across 4 acts, each with 1–2 choices, requirements,
odds and outcomes. Harness walks the full arc: every `requires` and `unlock`
resolves, every roll has a lose branch, all odds land between 50% and 90%.

**Scenes can be failed** (the open question from stage 4, answered)
- A choice may carry a `roll`. Losing applies the lose branch and leaves the
  scene incomplete — so the entry fee is charged again on the retry.
- `demote: true` knocks you a rung down the shelter ladder. It's the only way
  to lose ground, and every act has one.
- **Money raises your odds, it never buys the outcome.** The expensive branch
  of a scene is the 85–90% one; the desperate branch is the 50% one.
- Failing never touches course progress, charge or the Library.

**DB** — `storyProgress` gains `attempts: { nodeId: { tries, lastOutcome } }`
and `flags: []`. Both additive with defaults; v4 profiles are unaffected.

**Seams added** — `LifeShop.effect(patch)` and `LifeShop.demoteShelter()`, so
story outcomes change vitals without any branch but `shop/life.js` calling
`DB.patchVitals`.

## Stage 4 — Hi-Lo, Blackjack, night theft

**Night theft — the sink the economy was missing**
On the daily tick, a chance that cash is stolen overnight. Street 1-in-3 for
20–50%; hostel 1-in-12 for 10–25%; car 1-in-20 for 10–20%; apartment never.
A **percentage**, so it bites the same at any wealth level. Measured over 60k
nights: fires 33.1% of the time on the street, takes 20–50%, average 35%.

This is now the main reason to buy shelter and the main reason the wallet
can't run away. Same rule as decay — daily tick only, never a wall clock, so
being away from the app stays free.

**Hi-Lo** — a tie loses, `payout = 0.96 x 13 / w`. Flat 96% for every card and
both directions (measured 95.6–96.2% across all 24 valid calls), so no card is
a better bet than another. The push-on-tie version was tried and discarded:
"higher" on an ace can never lose, so the house could only take a cut by
paying under 1x on a win.

**Blackjack** — six-deck shoe, dealer stands on 17, 3:2 naturals, push
returns, double down in, splits out for v1. It's the $300 unlock because it's
the one game where playing well matters (~99% vs ~96% flat elsewhere) — the
expensive unlock buys a better game, not a better rake.

**Codes** — all cheats now sit in one `CODES` table in `settings.js`:
`admin613` (unlock all topics) and `parnasa100` (+$100).

**Also** — `raise(round, amount)` added to `games.js` so a double down takes
extra money through the seam rather than touching `DB.spendMoney` directly.

## Stage 3 — Crash, game unlocks, and the money side gathered in one place

**Story and the Life shop are one surface**
- The Life shop moved off the Shop screen and onto the **Story tab**: framing
  line, vitals + goods, then the node map, in that order.
- The Shop screen is charge-only again, no tabs.
- The split is now by coin, not by folder: ⚡ buys themes on the Shop screen,
  $ buys everything else on the Story tab. `shop/life.js` still owns the panel
  and renders as a guest into whatever container it's handed.

**Game unlocks** — one-off, bought with money, stored as `game_<id>`
| Crash | Hi-Lo | Blackjack |
|---|---|---|
| $75 | $150 | $300 |

`beginRound(stake, gameId)` refuses a locked game, so the gate holds even if a
card renders wrong. Charge can never buy an unlock.

**Crash — built**
```
crash = 1 / (1 - u)   plus a 4% forced bust at 1.00x
```
`P(crash >= m) = 1/m` makes the raw game exactly fair, so the forced bust is
what creates the edge — and it makes expected return **96% at every target**.
There is no clever multiplier to aim for. Verified at 1.5x/2x/5x/10x over
200k rounds each.

- Doubles every 4s; crash point rolled once up front so waiting can't nudge it.
- `MAX_MULT` 25x caps the tail — 25 x the $50 stake cap is $1,250, already the
  biggest number in the app. Without a cap one round would trivialise the Garden.
- One round live at a time; leaving the panel kills the frame loop.

## Stage 2 — life shop, vitals, and two structural merges

**Story merged into the Arcade**
- The Arcade screen now has Games and Story tabs. `story/` registers itself via
  `Arcade.registerTab` — one call, one line. Both keep their own folder, doc
  and stylesheet, so each is still a one-folder session.
- The standalone Story screen and its lobby tile are gone.
- Story is framed as the survival arc it was always described as: street →
  papers → lease → car.

**Review moved into the Garden**
- The "Review what's due" lobby tile is gone. A topic due for review is now a
  **plant that needs watering**: 💧 marker on the cell, a count panel at the
  top of the Garden, and a button that starts the first one.
- `gardenSummary()` leads with the watering count — it's the part with a
  deadline — and puts dividends second.

**Life shop + vitals (stage 2 proper)**
- Shop screen split into Themes (charge) and Life (money) tabs.
- Vitals strip added under the charge bar: hunger, thirst, hygiene, shelter,
  wallet. Repaints on `vitals:changed` and `wallet:changed`.
- 10 goods across food/water, hygiene, and shelter & papers.
- Shelter tiers change the daily upkeep multiplier: street ×1.0, hostel ×0.7,
  car ×0.55, apartment ×0.35.

**The decay rule — the decision that needed making**
Decay is **per activity, not per clock**. Vitals fall when you do things
(chunk, exam, arcade round, story scene) plus one tick per *day the app is
opened*, softened by shelter. Two weeks away costs one tick, not fourteen.

A real-time drain would have punished taking days off, which is what spacing is
for — PROJECT.md §5 rejected streaks for that exact reason and clock decay is
the same mechanic in a different coat.

**Consequences of running empty (≤15 on any vital)**
Arcade shut, story scenes shut. **The Library is never gated** — studying is
always available. Upkeep runs roughly $9/day at ~10 chunks/day; a three-plant
Garden pays $9/day and a full one pays $78.

**Fixed**
- `fmtWait` could render "23h 60m" — it ceil'd the minute remainder after
  splitting the hours. Now rounds to whole minutes first.

**Verified** by harness: story tab registers inside the Arcade, both tab sets
render, 10 chunks cost −30/−20/−10, a 6-year absence fires exactly one daily
tick, a second tick the same day is skipped, weak state blocks `beginRound`
while `startTopic` stays reachable, and buying recovers.

## Stage 1 — restructure into branches + DB v5 (this session)

**Structure**
- `app.js` (1,561 lines) split into 13 branch modules. The code was *sliced*,
  not retyped — logic is byte-identical apart from the shim/export blocks and
  the specific changes listed below.
- `style.css` (1,180 lines) split into `styles/base.css` plus one stylesheet
  per branch. `base.css` still holds the design system and core screens; it
  can be thinned further later.
- Course content moved to `library/content/`.
- New: `core/core.js` (Bus + Router), `core/boot.js`, `docs/`.
- Every folder has its own `.md`.

**db.js → v5** (migration is additive; v4 profiles keep everything)
- `wallet`, `energy` + `energyUpdatedAt`, `tickets` + `ticketsUpdatedAt`,
  `lastDividendClaim`, `inventory`, `storyProgress`, `vitals`
- from the in-flight work before the spec: `chargeEarned`, `chargeSpent`,
  `ownedThemes`
- `CHARGE_CAP` 150 → 400. It is now a *wallet* cap, not a lifetime cap:
  spending frees room to earn. This retires the "charge goes dead 4 topics
  into a 26-topic course" issue in PROJECT.md §6.
- Energy and tickets regenerate **lazily** — computed from a timestamp on
  read, so nothing breaks when the tab has been shut for three days.

**Themes / charge bar** (the original ask)
- The charge bar hardcoded an indigo strip and a sky-blue fill, so it looked
  pasted in under every theme but Indigo Night. It now reads
  `--bg-deep-rgb` and `--bolt-1/2/3`, set per theme.
- Each free theme got a matching bolt palette.
- 6 premium themes added with a `bg` background layer: Sakura Midnight (90),
  Sumi Ink (110), Amber Terminal (120), Koi Pond (150), Neon Ronin (180),
  Fuji Dawn (220). A premium theme the profile doesn't own falls back to
  Indigo rather than applying silently.

**Features landed**
- Shop screen + lobby tile. Charge sink, cosmetic only.
- Garden: v5 growth thresholds (7/21/30/60d) and daily dividends
  ($1/3/5/7/13/17 by stage, once per 24h).
- Settings: `admin613` unlock code, ToS/Privacy placeholder blocks.

**Skeletons registered but not implemented**
- `games/` — arcade shell, ticket + energy gate, `beginRound`/`settle` seam.
  Crash, Hi-Lo and Blackjack are *not* written.
- `story/` — 4-act node map, unlock logic, placeholder spine of 8 nodes.
  No narrative text.
- `shop/life.js` — life-goods catalogue and `buy()`. No screen, no vitals HUD.

**Bugs found and fixed while restructuring**
- `showScreen` called `closeDropdown`, which after the split lived inside
  another branch's closure — would have thrown on *every* screen change.
  Now guarded through the seam.
- `library.js` called `updateProfileBadge`, `stats.js` called `selectUnit`
  and `startTopic`, all without shims. Fixed.

**Verified** with a stub-DOM harness: 23 files load in order, all 30 seam
exports present, 9 screens render, charge caps, premium purchase and
fallback, dividend claim + 24h block, ticket exhaustion blocks a third round.
