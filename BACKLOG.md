# BACKLOG.md — everything flagged 2026-08-12, not yet all done

## Batch 45 — Opera slider fix, flashcard-confidence check, new quote

- [x] **"Star lobby's rotate slider has broken styling in Opera."** The
      slider only used CSS `accent-color`, which tints the thumb and
      the filled portion in Chromium but leaves the *track* drawn by
      the browser's own native form-control theme — plausible that
      Opera's default track renders as a light bar against this dark,
      tightly-cornered control (`.lobby-rotate-control` sits at
      `top/left: 0.2rem`, only 84px wide). Fixed by fully resetting the
      control (`appearance: none`, transparent native background) and
      hand-drawing the track/thumb for both WebKit
      (`::-webkit-slider-runnable-track/-thumb`) and Gecko
      (`::-moz-range-track/-progress/-thumb`), so it no longer depends
      on any engine's native skin. Couldn't verify in real Opera itself
      (not available as an engine in this environment) — confirmed the
      reset applies via computed styles instead; **needs your
      confirmation** it actually looks right on your end.
- [x] **Checked, not a bug: flashcard confidence classification.**
      Verified live that `DB.recordChunkConfidence`/`getChunkConfidence`
      correctly remember a chunk's rating and correctly overwrite it on
      a later re-review with a different answer — two full review
      passes over the same topic, second pass's rating replaced the
      first's in the DB both times. Found one small, separate edge
      case along the way: the confidence buttons don't disable
      themselves the instant they're clicked, so tapping fast enough
      (inside the ~320ms transition to the next card) can register a
      second answer against the still-displayed card. Logged to
      UPDATESTACK.md, not fixed — only hits unusually fast taps.
- [x] **Added a new quote to the wisdom pool** (57 → 58), from a
      Wikipedia link you supplied: Rebbe Shimon Sholom Kalish of
      Amshinov's reframe to the Japanese military governor of Shanghai
      in 1942 ("Zugim weil mir senen orientalim..."), sourced to Warren
      Kozak's *The Rabbi of 84th Street* (2004), p. 177 — verified via
      the article's own citation, not just the Wikipedia summary.
      Tagged `["correction", "limits"]`. `library.js`'s "~6 per module
      against a pool of 57" comment updated to 58 to match.
- [x] **Reprioritized UPDATESTACK.md**: moved the Firebase backend-port
      roadmap to a new "TOP OF STACK" section at the very top, per your
      call. Flagged (not silently fixed) that the older "Blocked on the
      backend" section still says Supabase, not Firebase — unclear if
      that's a separate earlier decision or stale wording; asked you to
      confirm before reconciling it.

## Batch 44 — Wisdom quotes now show on review results too

- [x] **Reported as "quotes stopped showing up after a unit."** Not a
      regression: `pickQuote`/`quoteHtml` and every topic-mastery-exam
      result path were tested directly against all 8 units and every
      topic in the course (57-quote pool, tag-matching, fallback logic)
      with no error or gap found anywhere, and a full live click-through
      of a real unit-completing exam rendered its quote correctly.
      Confirmed with you that the actual gap was by original design:
      `finishFlashcards` (single-topic spaced-repetition review) and
      `finishCustomDeck` (multi-topic custom deck review) both always
      cleared `#result-wisdom` outright — reviews never showed a quote,
      exams always did. Once you're deep enough into a course to have
      due reviews, that split reads as "quotes stopped."
      Fixed by pooling `wisdomTags` the same way the exam path does:
      `finishFlashcards` flatMaps `state.flashTopic.chunks` directly
      (it's a single real topic); `finishCustomDeck` looks each card's
      chunk back up via `ALL_TOPICS` by `topicId`/`chunkIdx`, since deck
      cards only carry those ids, not the chunk object itself.
      **Verified live**: completed a topic exam (unit 1, all 4 topics,
      including the unit-completing one) — quote shown. Ran a real
      single-topic flashcard review — quote shown ("Watered!" screen).
      Built and ran a real 6-card custom deck spanning two topics —
      quote shown ("Deck Cleared!" screen). The Final Quiz result screen
      is untouched and intentionally stays quote-free — it's cumulative
      across all 8 units, so no single tag pool honestly applies.

## Batch 43 — Fixed first-ever-visit lobby never repainting after profile creation

- [x] **Real bug, reported as "first ever opening of the website uses
      cards layout not a star topology."** Root cause was not the
      default (`defaultProfile().lobbyStyle` was already correctly
      `"star"`) and not a caching issue — it was a missing repaint.
      `core/boot.js`'s `btn-start` handler paints the lobby once,
      *before* the profile modal even opens, using
      `DB.getLobbyStyle()`'s no-active-profile fallback (`"classic"`,
      stacked-list) since there's no real profile yet to read a style
      from. `core/profile.js`'s `btn-profile-save` handler then created
      the real profile but never repainted anything behind the modal —
      so that first, fallback-styled paint (wrong layout, "Welcome."
      instead of the real name, stale wallet/XP) sat there permanently
      once the modal closed. Every brand-new user's actual first screen
      was stale until they navigated away and back.
      Fixed by emitting a full `profile:changed` broadcast (not just
      re-running `showLobby()`) plus an explicit `showLobby()` call
      right after `DB.createProfile()`, so theme/bgStripe/hints repaint
      against the fresh profile too, matching how profile-switching
      already behaves in `renderDropdown()`.
      **Verified live**: cleared localStorage + unregistered the
      service worker + cleared the Cache API to simulate a true
      first-ever visit, clicked through the real landing → name-modal →
      save flow. Confirmed the lobby now shows "Welcome back,
      RealFirstUser." and the correct star-ring tile layout immediately,
      with no navigation-away-and-back needed.

## Batch 42 — Security/robustness audit; fixed silent data loss on full storage

- [x] **Fixed a real user-facing data-loss bug found during the audit.**
      `data/db.js`'s `save()` already caught quota exhaustion (and
      Safari private mode) and emitted `"db:saveFailed"` instead of
      throwing — with a comment claiming "the Bus event lets the UI
      warn." Nothing listened to it, and no caller checked `save()`'s
      return value either. So on a full device, progress silently
      stopped persisting while the user kept studying and lost the lot:
      the one failure mode in an offline-first app that actually
      destroys someone's work. The plumbing existed; this connected the
      missing last mile — `core/hud.js`'s `warnSaveFailed` + a listener
      in `core/boot.js`.
      Deliberately unlike the celebration toasts it shares a layer
      with: red not streak-orange, squared not pill-shaped, multi-line,
      and it never auto-dismisses (losing work shouldn't flash by in
      2.6s). Throttled to one visible warning at a time, since `save()`
      fails on every subsequent write and a stack of identical panics
      helps nobody.
      **Verified live** by monkey-patching `localStorage.setItem` to
      throw a real `QuotaExceededError`: warning appears on the first
      failed write, 3 further failures still produce exactly 1 toast,
      and the dismiss button clears it.
- [x] **Audited and documented, no code change needed:** XSS via the
      profile name (the only user-controlled string) is properly
      guarded — every render path uses `.textContent`, verified across
      every name-bearing template literal. `load()` already try/catches
      corrupt JSON and falls back rather than bricking.
- [x] **Findings logged to UPDATESTACK.md rather than silently
      "fixed":** the client-side-only paywall (architectural, not a
      bug), the publicly-readable `adminaccount` string in deployed
      `db.js`, and old cheat codes still present in git history (inert
      on the live site, since `codes.js` is never served — proper fix
      needs a history rewrite, deliberately not done unilaterally).
- [x] **Cleanup assessed and deliberately declined:** the dead life-sim
      profile fields and empty `FEATURES`/`TAB_GATE`/`COMING` objects
      look like easy deletions but are respectively protected by a
      documented "migrations never drop a field" invariant and
      documented as extension seams. Removing either trades a real
      contract for a few bytes.

## Batch 41 — Star lobby back to default: found and fixed the real mobile bug this time

- [x] **"Arcade" → "Arcades"** renamed in the two spots that still said
      the singular (`games.js`'s section title, the landing page's
      feature bullet) — the lobby tile and topbar already said "Arcades".
- [x] **Actually found the mobile Star-lobby bug, instead of blaming
      cache again.** Every earlier check reproduced clean locally, which
      pointed at something environment-specific rather than the code —
      confirmed live: `index.html` loads Google Fonts over the network
      with `display=swap`, and `layoutLobbyRadial` measures the
      container's size exactly ONCE, synchronously, when the lobby
      renders. On a fast/cached local dev connection that measurement
      is already final; on a real phone's first load, the font swap
      (and mobile Safari/Chrome's address-bar-driven viewport resize)
      both happen AFTER that one-shot measurement, leaving tile
      positions stale relative to where the container actually
      settles. Fixed with `core/lobby.js`'s new
      `relayoutIfStarLobbyActive`, hooked to both `document.fonts.ready`
      and a debounced `window resize` listener, guarded to no-op unless
      the lobby is active and Star is equipped.
- [x] **Lobby default flipped back to Star** (`data/db.js`), explicitly
      only once the layout-drift bug above was actually found and
      fixed — confirmed with the requester first since it reversed an
      earlier documented decision (Cards had been made default this
      same session).
- [x] **Verified live**: a manually-dispatched `resize` event correctly
      triggers the debounced relayout and snaps tile positions back to
      match the container's real current size (167.6px → 187.2px →
      167.6px across three width changes); click hit-testing confirmed
      still correct on the settings tile after a relayout; a completely
      fresh profile now opens on Star with no overlap, no artifacts.

## Batch 40 — Final Quiz anti-farming: daily XP cap + minimum-time floor

- [x] **Closed a real farming hole**: the Final Quiz's per-attempt
      scaled XP bonus paid out on EVERY attempt — pass or fail, "usable
      any time," no cooldown, no cap. A 40-question guess-through in a
      few seconds still netted real XP, repeatably, forever. Two
      independent stages added, kept deliberately small per request
      ("drop it on a few stages, stop before reaching limit") rather
      than building a full anti-fraud system:
      - **Stage 1 — daily cap** (`data/db.js`'s `recordFinalQuizResult`,
        `FINAL_QUIZ_XP_ATTEMPTS_PER_DAY = 3`): reuses the exact
        same-shape daily-reset pattern the streak system already uses.
        The quiz itself is never blocked past the cap (no hard locks —
        PROJECT.md §5), only the XP stops.
      - **Stage 2 — minimum-time floor** (`library.js`'s
        `showFinalQuizResults`, 4s/question): a genuine cumulative read
        takes real time even skimming; a bot/guess-through clicking as
        fast as the UI allows finishes in seconds. Also gates the
        one-time first-pass completion bonus — a guessed "pass"
        shouldn't be able to claim that either.
      - Both withhold XP with a visible reason shown on screen, never
        silently.
- [x] **Verified live**: a scripted 40-question guess-through (finished
      in ~1 second) correctly got 0 XP with "finished too fast for a
      genuine read"; 4 backdated-timing attempts in one profile-day
      correctly earned XP on the first 2 (cap already partly consumed
      by the earlier test) and were blocked with "today's Final Quiz
      XP cap is used up" on the rest.

## Batch 39 — Intro to CS price cut 1000 → 250 Tokens; Token rewards cut to match

- [x] **`intro-cs` priceTokens dropped 1000 → 250** — lowering the
      barrier to entry, prompted directly by the ROI conversation:
      $21 to even try the one course that exists is real friction
      against genuinely free alternatives. 250 is comfortably covered
      by the smallest $6.99/350-Token pack alone.
- [x] **Token-side unit rewards cut ÷4 to match** (Unit 3: 15→4, Unit
      5: 30→8, course-complete: 40→10) — keeps the Token RETURN from
      finishing the course the same proportion of the (now lower)
      Token cost. Money rewards (units 1/2/6/7, unchanged) and XP
      rewards (units 4/8, unchanged) are separate currencies from the
      course's own Token price and weren't touched.
- [x] **Fixed a now-stale design note**: `shop/ranks.js`'s comment on
      the 795 free Tokens across the ladder claimed ranking up alone
      could never fully cover a course — true against the old
      1000-Token price, false against the new 250 one (795 > 250).
      Rewritten to say so plainly: a free path into the one course
      that exists is now possible purely by studying, which is treated
      as the point of the price drop, not a leak to close.
- [x] **Verified live**: course price shows 250 everywhere (locked
      card badge, buy modal, Token Shop routing); Token reward chips
      show 🪙4/🪙8 on units 3/5; money ($30/$20/$100/$50) and XP
      (⭐120/⭐240) rewards on units 1/2/6/7/4/8 all confirmed unchanged.

## Batch 38 — Rank ladder doubled again: 100,000 XP, ~15-course target

- [x] **Nobel Laureate ceiling doubled again, 50,000 → 100,000 XP**
      (`shop/ranks.js`), explicitly sized this time against a long-term
      content target rather than what exists today: one course
      completion nets ~6,870 XP, so 100,000 lands at ~14.6 courses'
      worth — "about 15 courses" was the explicit target this number
      was picked to hit. Every rung's threshold and the gaps between
      them scaled proportionally. Header comment rewritten to state the
      15-course target directly and to stop implying the old "day
      1,667" pure-content estimate was ever the realistic path — it
      isn't, once review pays properly and more courses ship.
      Token-reward rank amounts untouched (only XP thresholds moved).
- [x] **Verified live**: ceiling confirmed at 100,000 XP, rank 6 at
      10,800 XP.

## Batch 37 — "Sources & further reading" visual polish

- [x] **Fixed the sources box crowding the phase button below it** —
      reported live as "sits on top of See Example." Not a literal
      overlap, but close to one: only a top margin on the box, nothing
      pushing space underneath, so a plain low-contrast box sat almost
      flush against the bold gradient button right after it. Added
      real bottom margin, an accent-colored left edge so the box reads
      as its own distinct block, and a bolder label (accent-colored
      when open) instead of a barely-there footnote. Verified live in
      both collapsed and open states.

## Batch 36 — XP economy rebalance: review pay fixed, ladder + course XP scaled up

- [x] **Root cause of "way too poor" traced and fixed, not just the
      big numbers.** Review XP was a flat `REVIEW_XP_BASE` (5) applied
      to a WHOLE session regardless of size — a 4-card single-topic
      review and a 50-card custom deck spanning every unit paid the
      exact same 5 XP, making review strictly worse value the more of
      it you did. That's backwards for the one activity meant to carry
      a "long run" habit once the one-time course content is finished.
      Replaced with `REVIEW_XP_PER_CARD`, paid per genuinely-known card
      (real timing, not rushed) in both `finishFlashcards` and
      `finishCustomDeck` — reviewing more now pays more, same as
      original learning already worked.
- [x] **Rank ladder scaled 5x** (`shop/ranks.js`): Nobel Laureate
      10,000 → 50,000 XP, every rung's threshold and the gaps between
      them scaled proportionally. The old ceiling needed ~4-5 courses'
      worth of content to ever reach with exactly one course existing
      — "top of the ladder" was functionally unreachable, not just a
      long climb. Header comment rewritten with the actual math instead
      of the old "double the original" framing.
- [x] **In-course XP scaled up 3x to match** (`library.js`): chunk XP
      15-21 (was 5-7), Final Quiz base 120 (was 40), Final Quiz
      one-time completion bonus 200 (was 100, 2x not 3x — it's already
      a distinct "big deal" spike), Unit 4/8 XP rewards 120/240 (was
      40/80), `REVIEW_XP_PER_CARD` 6 (was the old flat-5 logic,
      replaced above). One full course completion now nets ~6,870 XP
      at a realistic ~90% average score — 13.7% of the new ceiling,
      up from ~4.6% of the old one even before the ladder moved.
- [x] **Verified live**: ladder confirmed at the new 50,000 ceiling
      with rank 6 at 5,400 XP; a real chunk completion granted 18 XP
      (within the new 15-21 range); all four in-course constants
      confirmed present in the served file.

## Batch 35 — Filled the 4 remaining blank rank rungs with Token rewards

- [x] **Ranks 8, 12, 17, 18 (Lab Manager, Master Technician, Program
      Director, Senior Program Director) now grant 50/75/100/120
      Tokens** — the last 4 blank rungs on the ladder. Sized
      deliberately: total free Tokens across all 7 Token-rewarding
      ranks (100+50+150+75+200+100+120 = 795) stays under the
      1000-Token price of the one course that exists, so ranking up
      alone can never fully cover a course — every free-Token profile
      still needs at least one real purchase (or today's demo stub) to
      actually get in. Documented in `shop/ranks.js` with a note to
      re-check the sum if the ladder or a course price ever changes.
      Verified live: all 4 rows now show their Token reward correctly.

## Batch 34 — Rank tier colors

- [x] **Rank abbreviation badges now color-coded by tier** — four even
      5-rank bands (`shop/ranks.js`'s new `rankTier(n)`): basic (1-5,
      gray), mid (6-10, blue), elite (11-15, purple), legendary (16-20,
      gold, with a glow). Applied to both the Career ladder's small
      badges and the current-rank card's big badge. Purely visual —
      nothing about XP, rewards, or unlocks reads the tier; an
      unreached rank still shows its tier color, just dimmed by the
      row's own existing opacity. Verified live: all four tiers render
      distinctly across the full ladder.

## Batch 33 — Unit/course completion rewards (Asphalt-Legends-style track), Final Quiz lock, Career/Flashcards fixes

- [x] **Unit and course completion rewards**, styled as a mobile-racing-
      game career reward track (Asphalt Legends and similar): visible
      chips riding on the unit roadmap nodes themselves, not silent
      balance changes. Final amounts: Unit 1 $30, Unit 2 $20, Unit 3
      🪙15, Unit 4 ⭐40 XP, Unit 5 🪙30, Unit 6 $100, Unit 7 $50, Unit 8
      ⭐80 XP, course complete 🪙40 (a gold trophy chest at the end of
      the roadmap spine). Every unit now carries SOME reward — units 4
      and 8 were the two with nothing, filled with XP specifically
      since that's the one currency shop/ranks.js's pacing already
      accounts for scaling, not a balance to weigh against real money.
      Granted exactly once via the same inventory-string dedup pattern
      as game unlocks/stake tiers/course ownership
      (`library.js`'s `checkCompletionRewards`, hooked in right after
      `DB.markTopicComplete`). A toast + confetti burst
      (`core/hud.js`'s new `celebrateReward`) fires from whichever chip
      the reward actually landed in.
- [x] **Final Quiz locked until every unit is complete** — confirmed
      explicitly before building, since it reverses this app's usual
      "no hard locks" rule (PROJECT.md §5). Everything else in the
      Library stays unlocked; a cumulative exam covering all 8 units is
      the one deliberate exception. Shows "🔒 Locked — finish every
      unit first" and is unclickable until then.
- [x] **Final Quiz first-pass XP bonus** (+100, one-time) — separate
      from the existing per-attempt scaled bonus, which still pays out
      on every attempt regardless. Dedup'd off `finalQuiz.completedAt`,
      which `data/db.js` already only ever sets once.
- [x] **Fixed a real bug found from a live Career screenshot**: the
      reward column only ever checked `reward.theme`/`reward.bgStripe`,
      so every Token-rewarding rank (6/11/15) showed a blank dash
      instead of its reward. `shop/shop.js` now also checks
      `reward.tokens`.
- [x] **Fixed Career screen's mobile layout** — the 4-column rank-row
      grid had no mobile fallback; badge+reward-column minimum widths
      alone summed past a 375px screen before the name got any room,
      pushing reward text off the right edge (matches a live
      screenshot exactly). Stacks to badge+name / xp / reward across
      three rows under 480px instead of one cramped row. Also tightened
      the wallet/Token chip strip's mobile padding as a safety margin.
- [x] **Fixed a real gating hole**: `openFlashcardsHub` always grabbed
      `COURSES[0]` with no ownership check, so pricing `intro-cs`
      (Batch 29) left a side door straight into its flashcard content
      for anyone who hadn't bought it. Now shows an empty/prompt state
      for an unowned course — buy right there (same modal Library
      uses, `showCourseBuyModal` now takes an optional `onUnlocked`
      callback) — and lands directly in the real deck builder the
      moment it's bought, no need to back out through Library.
- [x] **Verified live, full loop**: reward chips render correct
      amounts/icons for all 8 units in both Map and List view; Career's
      Token rewards display; Final Quiz correctly locked with all units
      incomplete and unlocks once they are; mobile Career layout fits
      at 375px with long rank names and 4-digit balances; Flashcards
      void state shows for an unowned course, buying through it lands
      straight in the working deck builder.

## Batch 32 — Mobile XP bar overflow fixed

- [x] **The expanded charge bar (rank icon + name + nickname + track +
      XP value) had no mobile handling at all** — nothing shrank or
      wrapped on a narrow screen, so a long rank name plus the track
      pushed the XP value off the right edge of the viewport, reported
      live ("mobile version's xp bar doesn't fit fully"). Fixed with a
      420px media query: nickname hidden (secondary info, still visible
      in the Career line), rank name truncates with an ellipsis past
      92px, track narrows 100px → 64px, bar/expand gaps tighten.
      Verified live with the worst realistic case (longest rank name,
      "Senior Research Coordinator," plus a long nickname) at 375px —
      fits with room to spare, "30/380 → MGR" fully visible.

## Batch 31 — Fixed the real "can't buy the course" blocker

- [x] **Found the actual bug behind "I still can't buy the course"**
      (reported live, after the cache fix had already resolved the
      phone menu issue). Not a purchase-logic bug — `buyCourse`/
      `spendTokens` worked fine when tested directly. The real problem:
      clicking a locked course redirected to the Token Shop, where the
      actual "Unlock" button lives in a separate Priced Courses section
      further down the page. Read as "the purchase does nothing."
- [x] **New course-buy modal** (`library.js`'s `showCourseBuyModal`,
      new `#course-buy-modal` overlay in `index.html`, reusing the
      contract modal's markup pattern): clicking a locked course now
      shows its unit structure and an inline buy button right there —
      "Unlock for 🪙 N" if affordable, "Need 🪙 N more — Token Shop" if
      not. The Token Shop is now only where you go to buy MORE Tokens,
      not to buy a course. `buyCourse` exported from `shop/tokens.js`
      so `library.js` can call it directly.
- [x] **Verified live, full loop:** modal renders full unit list;
      close button works; insufficient balance shows the correct
      "Need N more" button routing to Token Shop; after buying a
      covering pack, the SAME modal instance re-opens showing "Unlock
      for 🪙 1000" instead; clicking it buys, closes the modal, and
      re-renders the Library card unlocked — one click, no redirect.
- [x] **Removed the now-redundant Priced Courses section from the Token
      Shop entirely** — buying happens in the Library modal above, so
      the Token Shop only sells what it's named after (Token packs).
      Re-verified the full buy loop still works with that section gone.

## Batch 30 — Service worker cache version bumped for the first time all session

- [x] **`sw.js`'s `CACHE_VERSION` bumped `cs-dojo-v2` → `cs-dojo-v3`** —
      it had NOT been touched once across this entire session's ~15
      commits, despite the stale-while-revalidate strategy meaning a
      returning device keeps serving whatever it cached until the
      service worker's own bytes change and it's told to update (see
      `sw.js`'s own "Updating" comment — even then, only on a full
      close-and-reopen, not a plain refresh). Live bug reports came in
      today (Star lobby broken on phone, Kirigami+stripes "a mess") for
      things that were reproducibly ALREADY FIXED in the current code
      when tested fresh — strong evidence the reports were against a
      stale cached build, not the real current state. This is the fix
      for that class of report going forward, not a fix for any one bug.
- [x] **Audited both reported issues against current code before
      concluding "stale cache," not assuming it:**
      - Star (radial) lobby on a 375px mobile viewport: reproduced
        clean, all 6 tiles distinct, no overlap.
      - Kirigami + background stripes: `core/theme.js`'s `stripeCssFor`
        suppresses the stripe layer for any theme whose `bg` is a
        repeating pattern — checked `shop/themes.js` directly, confirmed
        Kirigami, Terminal AND Ronin all match that check (Ronin wasn't
        named in the original comment but its `bg` does contain a
        repeating-gradient layer too), and light themes (Paper, Frost)
        get the stripe recolored dark instead of suppressed. All 7
        striped/themed combinations check out.
- [x] **Logged, not fixed, three items needing your input** (see
      UPDATESTACK.md): whether "bought on phone, didn't unlock" means
      same-device (real bug) or cross-device (expected — no accounts,
      no sync) or is also stale-cache; a scoped "preview + inline buy"
      UX idea for locked course cards; whether the Token icon's
      silver-on-phone/gold-on-laptop difference (a platform emoji-font
      rendering difference, not CSS) is worth swapping for a custom SVG.
- [x] **Logged marketing/growth asks** (hype-topic research, a
      marketing model, a promo plan) as their own non-engineering
      section — flagged so they're not lost, explicitly not something
      with a code deliverable to just start building.

## Batch 29 — Intro to CS priced at 1000 Tokens (the Token gate's first real use)

- [x] **`intro-cs` now costs 🪙 1000** (`priceTokens: 1000` on its
      manifest) — the first time the Token pricing gate built in Batch
      25 actually applies to anything. Priced against the smallest pack
      that actually covers it (the $11.99/654-Token pack falls short,
      so $20.99/1234-Token is the real floor) — ~$21 effective,
      between Udemy's real sale price and Anki's $25 flat fee.
- [x] **Flagged and confirmed before building:** pricing the only
      course that exists creates a real lockout risk — a brand-new
      profile has 0 XP, so the free rank-up Token rewards (ranks
      6/11/15) can't help someone get IN, since those only pay out
      AFTER you're already earning XP inside a course. Confirmed this
      is accepted for now (Tokens are meant to be real-money-first;
      the Token Shop's `buyPack()` demo stub is the actual "way in"
      until real payment exists) rather than silently shipping a
      dead-end. The rank-up Token rewards themselves stay — confirmed
      NOT to be removed, they're just not what unlocks a first course.
- [x] **Verified live, full loop:** fresh profile confirmed 0 Tokens /
      doesn't own the course; Library card renders locked (red border,
      "🪙 1000" badge, hover tooltip); clicking it routes to the Token
      Shop; bought the $20.99 pack (0→1234 Tokens); bought the course
      from the Priced Courses section (1234→234 Tokens); `ownsCourse`
      flipped to `true`; Library re-rendered with the lock fully gone.

## Batch 28 — Final Quiz button moved to the bottom of the unit list

- [x] **Final Quiz entry moved from right-after-"Build a Custom Deck"
      to the bottom of the unit list**, in both List and Map view. It
      used to render before the units existed at all — now
      `renderUnitSelect`'s list branch appends it after the unit grid,
      and the map branch appends it after `renderUnitRoadmap` runs,
      both via one shared `addFinalQuizEntry()` closure so the two
      views can't drift out of sync with each other. Still never
      locked (no hard locks — PROJECT.md §5), just positioned as "after
      you've worked through the units" instead of competing with them
      up top. Verified live in both views: Final Quiz renders last,
      below all 8 units.

## Batch 27 — Token pack repricing + bonus badges

- [x] **Pack amounts changed to 350/6.99, 654/11.99, 1234/20.99,
      2345/37.99, 5000/67.99.** The requested numbers included 6543 for
      the $11.99 pack, which at 545.7 tokens/$ was 9x better value than
      every other pack including the $67.99 one — flagged before
      building (would've made the bigger packs pointless purchases),
      confirmed 654 instead, which fits the same scaling curve the
      other four numbers already formed.
- [x] **Bonus badge added to each pack card** — a green corner pill
      ("+9%", "+17%", "+23%", "+47%") showing tokens-per-dollar gained
      vs. the smallest pack, so the value curve is visible, not just
      implied by the numbers. Computed from the real `tokens`/`price`
      on each pack (`bonusPct()` in `shop/tokens.js`), not hand-typed,
      so it can't drift out of sync if the numbers ever change again.
      Verified live: badges match hand-computed rates exactly, a
      purchase still credits the correct new amount.

## Batch 26 — Popover z-index fix + landing page arrow removed

- [x] **`#wallet-popover` (shared by the $ and 🪙 chips) was rendering
      almost entirely hidden behind a screen's own `.topbar`**, reported
      live on the Token Shop screen ("the popup isn't visible as it's
      under the dollar wallet and the bar itself") — reproduced exactly:
      only a thin sliver peeked out below the topbar. Root cause: a
      `position: sticky` `.topbar` forms its own stacking context, so
      the popover's `z-index: 65` (sized only to clear the 59 vitals
      strip it launched next to) wasn't being compared against it
      directly and lost. Fixed by raising `.streak-popover`'s z-index to
      500 — safely above any screen's own chrome, not just the vitals
      strip. Verified live: real mouse click on the 🪙 chip while on the
      Token Shop screen now shows the popover fully, not clipped.
- [x] **Landing page's "Begin Training" button no longer has a trailing
      arrow.** Was `Begin Training →`; the `<span class="arrow">` is
      removed, not just hidden.

## Batch 25 — 🪙 Tokens economy: earn, spend, Token Shop, priced-course gating

- [x] **Tokens is now a real, third currency**, separate from $ and XP
      (`DB.getTokens/addTokens/spendTokens`, mirroring the `$` wallet
      exactly). Researched the market first (Duolingo $60-120/yr,
      Brilliant $162-336/yr, Coursera Plus $399-708/yr, Quizlet
      $36-45/yr, vs. Anki $25 one-time / Udemy per-course) — Dojo's
      actual shape (offline, no account, one-time unlock) is the Anki/
      Udemy comparable, not the subscription apps, so courses are
      designed as one-time Token unlocks, never a recurring toll.
- [x] **Named Tokens, not Stars — caught mid-build.** ⭐ was already the
      XP glyph (rank chip, "+N XP" fly-bolt, `core/hud.js`) before this
      currency existed; shipped as "Stars" first, then renamed to
      Tokens/🪙 across every file before this ever reached a second
      session, rather than leave two unrelated things sharing a symbol.
- [x] **Free earn path:** `reward: { tokens: N }` added to 3 previously-
      blank rank rungs (6, 11, 15 — 100/150/200 Tokens). Credited exactly
      once per rank crossed via a new `"rank:up"` Bus listener in
      `core/boot.js`, NOT re-derived from XP the way theme/bgStripe
      rewards are — `shop/ranks.js` now documents why that pattern
      doesn't work for a spendable currency.
- [x] **🪙 Token Shop screen** (`shop/tokens.js`, reached from a new
      button in the Library topbar): 5 Token packs ($6.99/350 →
      $67.99/4500, bigger pack = better rate) and a Priced Courses
      section that only appears once a course actually costs Tokens.
- [x] **Real-money purchases are a DELIBERATE STUB, not faked.** No
      backend exists (static GitHub Pages site) to verify a real
      payment, and building one wasn't the ask — confirmed with the
      requester ("leave an imitation, once the project is baked I'll
      legalize it and open a payment system"). `buyPack()` credits the
      pack instantly and labels itself "(demo)" everywhere in the UI
      rather than pretending to check out for real. Swapping in a real
      Stripe Payment Link redirect later touches only that one
      function — earning/spending/gating don't change.
- [x] **Course pricing gate wired end-to-end**, even though no course
      uses it yet: `library/content/registry.js`'s course manifests
      gained an optional `priceTokens` (defaults to 0 = free —
      `intro-cs` is unaffected). `Dojo.ownsCourse(id)` gates
      `renderCourseSelect` the same way Arcade unlocks/stake tiers
      already gate their own screens — a string in `DB`'s generic
      inventory array (`course_<id>`), no new profile field.
- [x] **Wallet-chip popover bug found and fixed while testing the new
      Tokens chip.** Tapping the $ chip then the 🪙 chip right after (or
      vice versa) just closed the popover instead of switching to the
      new chip's content — `toggleWalletPopover` only checked "is a
      popover open," not "open for which chip." `#wallet-popover` now
      tracks which chip it's showing (`dataset.forChip`) and only
      toggle-closes on a second tap of the SAME chip.
- [x] **Verified live, full loop:** fresh profile, forced a rank
      crossing at rank 6 → confirmed exactly 100 Tokens credited; opened
      the Token Shop, bought a pack → balance updated correctly; pushed
      a throwaway `priceTokens: 500` course into `COURSES` at runtime →
      confirmed it rendered locked with a "🪙 500" badge, clicking it
      routed to the Token Shop instead of entering, bought it there,
      confirmed `Dojo.ownsCourse` flipped to `true` and the lock
      cleared. Cleaned up the test course/profile after. Popover fix
      verified separately: wallet→tokens→wallet chip-switching now
      updates content instead of closing, at both desktop and mobile
      viewport widths.

## Batch 24 — Landing page tagline/hint contradiction resolved

- [x] **Dropped "Online" from the landing tagline.** It read "Online
      study system..." directly above "No account needed — progress
      saves automatically, on this device," which contradicted itself.
      Not a copy-only call: the app has no account system or backend
      today, and building one is a real future initiative (web →
      mobile port, real accounts, an online DB) waiting on a teammate
      who knows databases — logged as its own "Long-term roadmap" entry
      in `UPDATESTACK.md`, deliberately placed at the bottom since it's
      explicitly a later-not-now item, not designed here by guesswork.
      Until that lands, the honest copy is the offline one, so the
      tagline now just reads "A study system that keeps what you learn
      from fading..." — verified live, no contradiction with the hint
      line below it.

## Batch 21 — Star lobby: windmill/wind readout out, velocity rotate slider in

- [x] **Windmill (the spinning blades behind the hub) replaced with a
      draggable rotate slider.** First pass: slider set an absolute
      angle, top-left of the ring, Star style only — dragging it feeds
      into the same trig `layoutLobbyRadial` already used for tile
      position and the spoke lines (repositions tiles via `--tx`/`--ty`,
      not a CSS `rotate()` on the container), so tile icons/text stay
      upright and click hit-testing stays correct as it turns. Verified
      live post-rotation: a settled click on a rotated tile navigates to
      the right screen.
- [x] **Wind readout ("💨 N mph DIR") removed entirely; slider reworked
      into a velocity dial.** Follow-up ask: the slider should set spin
      *speed*, not a fixed angle. Centered on 0 (no spin); dragging
      either way sets degrees/second. A `requestAnimationFrame` loop
      (`starSpinTick` in `core/lobby.js`) reads the slider every frame
      and accumulates it into an angle, still fed through the same
      `layoutLobbyRadial` trig. Verified live: off-center spins
      continuously (tile position keeps advancing across a wait), back
      at 0 holds still (`--tx` identical before/after a wait).

## Batch 22 — Per-game stake-cap upgrades

- [x] **Per-game stake-cap upgrades, bought in Arcade → Upgrades.**
      Each of the four games now has its own $50→$75→$100→$150→$200→$250
      cap ladder (5 tiers, $500/$1000/$2000/$4000/$8000, doubling each
      tier), independent per game — maxing Crash says nothing about
      Blackjack. Deliberately kept OUT of the Career screen: `SHOP.md`
      documents Career as read-only ("no money shop any more") after
      the old life-sim shop was removed, and reversing that call wasn't
      the goal — confirmed with the requester before building, landed
      in Arcade instead, right next to the existing game-unlock
      purchases that already spend the same currency there.
      Ownership stored the same way game unlocks are (a string in DB's
      inventory array, `stake_<gameId>_<tier>`) — no `db.js` schema
      change needed. `games/games.js` gained `STAKE_TIERS`,
      `stakeTier`/`stakeCapFor`/`nextStakeTier`/`buyStakeUpgrade`, and a
      second Arcade tab (`renderUpgradesTab`); `beginRound`/
      `rememberStake`/`stakeDefault` all now take a `gameId` and clamp
      to that game's cap instead of one shared `MAX_STAKE`. `lastStake`
      itself stays shared across games on purpose (see `GAMES.md`).
      Verified live end-to-end: unlocked Crash, bought its tier-1
      upgrade ($500, wallet debited exactly that), card redrew in place
      showing Tier 1/5 · $75 cap · next tier $100/$1000, opened Crash
      itself and confirmed its stake input's `max="75"` and its own
      copy ("Max stake $75") both picked up the new cap, confirmed
      `beginRound(100, 'crash')` is rejected (over cap) while
      `beginRound(70, 'crash')` succeeds and debits the wallet.

## Batch 20 — Flashcard review overhaul + two small fixes

- [x] **Bug (screenshot): Star lobby "broken"** — investigated, NOT a
      code bug. The screenshot was taken from `file://…/index.html`
      opened directly, a different origin with no cache-busting path
      available to me; the current committed code renders 6 distinct,
      non-overlapping tile positions when tested fresh. Almost certainly
      a stale cached build — flagged to hard-refresh that tab rather
      than chasing a bug that isn't reproducible in the current code.
- [x] **"Anki-style" wording removed** (copyright concern) — the deck
      builder's intro text now just says "Weakest cards come up first."
- [x] **Default Lobby style changed from Classic to Cards.** Only
      affects brand-new profiles (`defaultProfile()`'s `lobbyStyle`);
      existing profiles keep whatever they already have saved. Classic
      and Star both stay fully pickable in Settings.
- [x] **Flashcard review overhaul** — four related asks, all touching
      the same shared review flow (`renderFlashcard`/`answerFlashcard`
      in `library.js`, used by both the single-topic review and the
      custom deck builder):
      1. **Two-way flip.** Reported live: forgetting what was on the
         other side with no way back to check. The card face is now
         clickable to flip freely in either direction once revealed;
         the original "Show Answer" button still owns the first reveal.
      2. **Four-level self-assessment**, replacing the old binary "Knew
         it" / "Didn't know it": Difficult / Still learning / Has an
         idea / Known best. A brand new `p.stats.topicStats[topicId].
         chunkConfidence` array (`DB.recordChunkConfidence`/
         `getChunkConfidence`) — deliberately **separate** from the
         existing `chunkResults` boolean (which the lesson mini-quiz
         still writes, and which still drives the existing weak/new/
         known chip coloring and "worst-first" sort) so a lesson
         quiz answer and a flashcard confidence rating can never
         overwrite each other; they're answering different questions.
      3. **Requeue on "Difficult."** Rated the worst level: the same
         card reappears 5-10 cards later (spliced straight into
         `state.flashDeck`, so the "X/Y" counter and the final-card
         check both pick up the new total for free), and once more at
         the very end of the stack if it's STILL "Difficult" then.
         Capped at 2 requeues (3 total appearances) so a genuinely hard
         card can't loop forever.
      4. **Optional category filter in the deck builder** — toggle any
         of the 4 confidence chips to narrow the chunk list to only
         chunks last rated at one of the selected levels; empty
         selection (default) shows everything. A chunk never reviewed
         as a flashcard has no rating and drops out once any filter is
         active.
      Verified live end-to-end: flip-back confirmed (front → back →
      front on the same card); rating "Difficult" grew the deck 3→4 with
      `_requeues:1` on the right card; a clean 3-card run recorded
      `chunkConfidence` levels `[3,3,3]` correctly (last-attempt-wins
      confirmed by an earlier messy run being overwritten); the deck
      builder's filter chip for "Known best" correctly showed exactly
      those 3 chunks and nothing else, and "Difficult" correctly showed
      zero once nothing was rated that low anymore.

## Batch 19 — Final Quiz: cumulative exam, all 8 units, built and shipped

- [x] **Content**: `library/content/intro-cs/final_quiz.js`, 40 questions,
      rewritten from the two 20-question reference sets pasted earlier
      this session (kept verbatim in this file's own "Reference"
      section above) into full standalone `{question, options, correct}`
      entries — the originals were terse exam-prep shorthand, not
      ready-to-render option lists.
      - **One factual correction**, not a faithful reproduction: Set 2
        Q6 claimed the Von Neumann architecture is defined by *separate*
        instruction/data memory. Checked against this app's own
        `data_m10.js` ("cf-von-neumann" chunk, written earlier this
        session), which correctly says the opposite — a single SHARED
        memory (the stored-program concept) is the defining trait;
        separate memories is the Harvard architecture, the contrast
        case. Shipping the reference's original wording would have
        taught something the app's own lesson two clicks away directly
        contradicts, so it's fixed rather than reproduced as-is.
      - Kept every other question faithful to the reference's stated
        correct answer, including a couple whose distractor design
        reads a little oddly (flagged as such in the reference itself,
        e.g. the mobile-OS question) — reworded for clarity without
        changing what's being tested.
      - Loaded in `index.html` alongside the other course data files,
        before `course.js`. Full sourcing/correction notes live in the
        file's own header comment.
- [x] **Integration — deliberately does NOT touch real topic/completion
      state.** No new screen built from scratch: reuses the existing
      per-topic exam UI (`renderExamQuestion` only ever reads
      `getTopic().icon/.title` and `state.examQuestions`, neither of
      which cares whether the "topic" is real) by feeding it a
      pseudo-topic. Where it diverges is the RESULT path — `showExamResults`
      now branches to a new `showFinalQuizResults()` before any of
      `DB.recordExamResult`/`markTopicComplete`/`scheduleReview` run,
      because all three assume a real topic id and would have silently
      corrupted `completionPct`, weak-spot lookups, and the SM-2 review
      queue if fed `"final-quiz"`.
      - `data/db.js`: new `p.finalQuiz = {attempts, bestScore, lastScore,
        completedAt}`, its own `recordFinalQuizResult`/`getFinalQuiz` —
        a completely separate record from `stats.topicStats`.
      - `library.js`: `startFinalQuiz()`, `showFinalQuizResults()` (flat
        40-XP-base bonus scaled by score, same 0.7-1.5× multiplier shape
        per-topic exams use, since there's no `topicCharge` to scale
        off — this can be taken cold, any time), `btn-retry`/
        `btn-to-topics` handlers extended with a `"final-quiz"` branch.
      - Entry point: a "🎓 Final Quiz" button in `renderUnitSelect`,
        same placement/styling as the existing "Build a Custom Deck"
        entry. **Never locked** (No hard locks — PROJECT.md §5) — the
        subtitle nudges honestly instead ("All units complete — ready
        when you are" / "Best: N% · passed" once attempted).
      Verified live end-to-end: 40 questions confirmed loaded; answered
      all correct → "Final Quiz Passed!", 100%, +60 XP at the ×1.50
      multiplier; confirmed **zero** corruption of real state
      (`completedTopics` stayed 0, `completionPct` stayed 0, no stray
      `"final-quiz"` entry in `topicStats`); answered a failing run →
      "Not Quite Yet", 25%, correct retry button; retried → attempt
      count incremented to 2, `bestScore` correctly still 100 (a worse
      later attempt doesn't overwrite a better earlier one); button
      subtitle confirmed updating after an attempt.

## Batch 18 — `unlockallunits` cheat code, genuinely distinct from `adminaccount`

- [x] Investigated the flagged concern first rather than assuming: unit
      locking is 100% computed at render time from `completedTopics`
      (no independent "unlocked units" state existed anywhere) — so a
      real "reachable but not completed" code needed a new bypass flag,
      not just a call to the existing `applyAdminStart`.
      - `data/db.js`: new `p.unitsUnlocked` boolean (default `false`),
        `applyUnlockAllUnits(profileId)` sets it, `getUnitsUnlocked()`
        reads it. `applyAdminCode` refactored from a single hardcoded
        check into an `ADMIN_CODES` lookup map (`adminaccount` and
        `unlockallunits`, each with its own handler + message) so a
        third code later is one map entry, not a rewritten function.
      - `library/library.js`: all three places that compute a unit's
        lock state — `renderUnitSelect`'s list view, `renderUnitRoadmap`
        (map view), and the deck builder's `unitLocked` — now OR in
        `DB.getUnitsUnlocked()`. Nothing else changed: `completedTopics`/
        `completedChunks` stay exactly as they were, so unlocked units
        still show their real content as fresh/ungraded.
      - `settings/settings.js`: `applyCode()` now shows whatever message
        `DB.applyAdminCode` returns instead of a hardcoded
        admin-start-specific string.
      - `docs/CHEATCODES.md` rewritten for both codes.
      Verified live end-to-end: unit 2-8 confirmed locked
      (`ahead: true`) on a fresh profile; applied `unlockallunits`
      through the actual Settings UI; re-checked list view, map view,
      AND the deck builder — all three show every unit reachable;
      `completedTopics`, wallet and XP confirmed untouched (`0`, `0`,
      `0`) — genuinely "reachable," not secretly "completed."

## Batch 17 — Star topology: wind + windmill (fun, no game state)

- [x] **Wind speed/direction + spinning windmill, Star lobby only** —
      requested "just for the fun sake." Purely decorative, reads and
      writes no game state:
      - `core/lobby.js`'s new `windReading()` derives a speed (4-26 mph)
        and 8-point compass direction from the calendar day (not
        `Math.random()`) — holds still within a visit/re-render, changes
        day to day rather than being fixed forever or jittering.
      - A small `💨 N mph DIR` badge (`#lobby-wind`) shows above the ring,
        Star mode only.
      - Four blade `<span>`s behind the hub (`#lobby-windmill`,
        `pointer-events: none` so the hub button underneath still works)
        spin via a CSS `@keyframes windmillSpin`, duration driven by
        `--wm-speed` — faster wind spins faster (roughly 1.2s-7.5s per
        rotation across the mph range; `30/speed`, not a real physical
        formula, just tuned to feel right).
      - Hidden entirely outside Star (`display: none` default, same
        pattern the hub/spoke-lines already use).
      Verified live: badge and spin both render in Star, computed
      `animation-name`/`duration` confirmed non-default, both elements
      confirmed `display: none` back in Classic.

## Batch 16 — adminaccount didn't grant rank or rank rewards

- [x] **Bug: `adminaccount` unlocked courses/wallet/tickets but never
      rank.** Reported live: "adminaccount didn't unlock me rank and
      rewards." `applyAdminStart` (`data/db.js`) set
      `completedTopics`/`completedChunks`/`tickets`/`wallet`, but never
      touched `chargeEarned` — the one field `DB.getXp()` actually
      reads. Rank, and every rank-gated theme/background-stripe reward,
      stayed at whatever it was before (usually Lab Intern / 0 XP)
      regardless of how "unlocked" everything else looked.

      Fixed: `applyAdminStart` now also raises `chargeEarned` (and
      `charge`) to 10,000 — the Nobel Laureate ceiling in
      `shop/ranks.js` — if it's currently lower, maxing rank and every
      reward on the ladder. Applies to both entry points (the secret
      profile name at creation, and Batch 14's Settings code box) since
      both call this same function.

      Also fixed while verifying: applying the code updated the wallet/
      vitals strip but never the rank chip itself (`Dojo.renderCharge`
      wasn't called) or the Settings screen's own theme/stripe grids
      (still showing the old locked state until a manual navigation).
      `settings.js`'s success path now calls `renderCharge()` and does a
      full `renderSettings()` re-render, re-attaching the success
      message afterward since the re-render tears down the element it
      was sitting in.

      Verified live: fresh profile → apply code → XP reads exactly
      10,000, rank chip shows "Nobel Laureate" immediately (no reload),
      Awarded Themes reads "8 unlocked. You have them all."

## Batch 15 — Background stripes vs. actual themes: two visibility bugs

Both reported live in one message, both root-caused to the same thing:
`shop/themes.js`'s `BG_STRIPES` were designed against a plain dark
surface and never re-checked against real themes.

- [x] **"kirigami stripes when combined with other ones create a
      mess."** Kirigami's own `bg` is already a repeating diagonal
      line pattern (the torn-paper look); layering a second,
      differently-angled stripe on top read as noise. Fixed generally,
      not just for Kirigami: `core/theme.js`'s new `stripeCssFor(id, t)`
      suppresses the separate stripe layer entirely (`--bg-stripe-image:
      none`) whenever the active theme's own `bg` already contains a
      `repeating-linear-gradient` — catches Terminal's CRT scanlines
      too, same clash, not reported yet but same cause.
- [x] **"paper & frost + stripes poor visibility."** Every stripe's
      `css` is hardcoded `rgba(255,255,255,…)` — reads fine on a dark
      surface, goes nearly invisible on Paper/Frost's light one. Same
      class of gap `core/theme.js` already had a comment flagging for
      other fixed-white overlays. `stripeCssFor` now recolours the
      pattern to `rgba(15, 23, 42, …)` (dark) whenever `t.mode ===
      "light"`, leaving the dark-theme version untouched.
- [x] **Follow-on fix, not separately reported but found while fixing
      the above:** switching (or previewing) a theme never re-painted
      the stripe against it — it was set once, at boot/profile-switch,
      and just sat there unchanged regardless of which theme was
      active. That's *why* the mismatch was invisible until someone
      actually combined the two: nobody had switched theme and stripe
      independently before. `paintTheme(t)` now re-derives
      `--bg-stripe-image` from the currently-equipped stripe every time
      it runs, so it's always correct for whichever theme (real or
      previewed) just painted.

Verified live: Kirigami + Diagonal → `none`; Terminal + Diagonal →
`none`; Paper + Diagonal → dark-recoloured pattern, visibly present in
a screenshot; Indigo (dark, no repeating `bg`) + Diagonal → unchanged
white pattern, confirming dark themes aren't affected by either fix.

## Batch 14 — Admin code reachable without a new profile

- [x] **Bug: `adminaccount` unreachable once a profile already exists.**
      Reported live: "As it doesn't ask the name I can't use
      adminaccount." The secret-profile-name mechanism (Batch 3) only
      ever checked the name at `createProfile` time — the welcome modal
      that asks for a name only appears with zero profiles, so it was a
      one-shot opportunity on a device's very first launch. Every other
      session had no way to reach it at all.

      Fixed by giving the same secret a second, always-available front
      door: `data/db.js`'s new `applyAdminCode(input)` does the identical
      `SECRET_ADMIN_NAME` match and applies to whichever profile is
      **currently active** — no new profile needed. Settings' "Unlock
      code" box, previously hidden entirely unless the gitignored
      `settings/codes.js` happened to be present locally, is now
      **always visible** and checks this first-class committed function
      as a fallback after any local dev codes. Both paths are the same
      check in the same committed file — this isn't a revival of the old
      `codes.js` system, just a second caller into it.
      `docs/CHEATCODES.md` rewritten to document both entry points.
      Verified live: a second profile that never saw the welcome modal
      typed the code in Settings and came back fully unlocked ($50,000,
      tickets full, name confirmed unchanged).
- [x] **Bug (duplicate report): Star lobby topology "misplaced."**
      Already fixed and pushed last turn (`b9e0dfc`) — the overlapping
      Flashcards circle on top of the hub. Re-verified live this turn,
      confirmed clean (single small hub circle, no overlap). If still
      visible on your end, it's a stale cached build — a hard refresh
      should clear it.

## Batch 13 — Shop profile customization, Star topology fix, checkmark sizing

- [x] **Shop: profile customization + avatar/badge "slots"**, the item
      that depended on Batch 12's profile screen. New `shop/avatars.js`
      (pure data, 8 emoji avatars, $30-$75) bought with $ wallet money —
      not XP, mirroring the charge/money split every other purchase in
      the app follows. `data/db.js` gained `avatar`, `ownedAvatars`,
      `pinnedBadges` fields + `getAvatar/setAvatar/getOwnedAvatars/
      buyAvatar/getPinnedBadges/togglePinnedBadge`. Buying equips
      immediately (same "buy = wear it" flow the old life-shop's shelter
      tiers used). The profile dropdown (`core/profile.js`) got an
      "Avatar" picker grid; `#profile-avatar` now shows the equipped
      emoji instead of the name-initial letter once one's bought.
      "Slots" = up to 3 pinned badges — `library/stats.js`'s badge chips
      are now clickable (earned ones only) to pin/unpin, shown as small
      icons next to the profile name (`#profile-pins`). A 4th pin
      attempt shakes instead of silently failing or evicting one.
      Verified live via direct DOM dispatch (coordinate-based clicks are
      unreliable in this session's browser tooling — see Batch 12's
      note): bought+equipped the fox avatar, wallet debited exactly
      $30, avatar rendered in the badge; pinned a badge, `DB.
      getPinnedBadges()` confirmed.
- [x] **Bug: Star lobby topology broken again**, reported live right
      after Flashcards was added to `STAR_ORDER` (Batch 9) — 6 tiles
      fit the ring radius Star was originally tuned for; a 7th (8th
      counting Resume when visible) started overlapping. Rather than
      re-tuning the radius for a count that can grow again later,
      Flashcards moved OFF the ring entirely and into the hub — the
      center element was purely decorative (a static lightning-bolt
      `<div>`) with nothing to click. It's now a real `<button
      id="btn-lobby-hub-flashcards">`, wired in `core/boot.js`, styled
      with proper hover/focus feedback in `styles/base.css`. `STAR_ORDER`
      back to the original 6. Classic/Cards untouched — Flashcards stays
      a normal tile there, this was Star-specific.

      **Follow-up, reported live right after:** the regular Flashcards
      tile was still drawing a second, larger circle exactly on top of
      the hub. Root cause: `showLobby()`'s `tile()` helper sets that
      tile's `display:flex` via **inline style** before
      `layoutLobbyRadial` ever runs, and an inline style beats any
      external stylesheet rule regardless of selector specificity — a
      CSS-only attempt to hide it (`.lobby-style-star
      #btn-lobby-flashcards { display: none; }`) did nothing. Fixed at
      the same layer that caused it: `layoutLobbyRadial` (`core/
      lobby.js`) now explicitly hides that tile itself when laying out
      Star, restored for free next time `showLobby` runs in a non-star
      style since `tile()` sets its display on every call regardless.
      Verified live: single small hub circle, no overlap, hub click
      still opens the deck builder, Classic mode still shows the normal
      Flashcards tile.
- [x] **Roadmap checkmark + green bubble, 20% smaller.** Scoped to
      completed nodes only (`.roadmap-node.completed .roadmap-bubble`
      in `styles/library.css`) — 64px→51px, 1.6rem→1.28rem font-size.
      Current/due/ahead/default bubbles keep the original size; only the
      ✓-on-green state shrank, since that's what was flagged. Verified
      via computed style (51px / 20.48px, both exactly 80% of original).

## Batch 12 — Star lobby hit-testing bug, User profile screen + badges

- [x] **Bug: lobby's mouse position was offset from the real click target
      in Star layout.** Reported live mid-session ("lobby's mouse points
      offset from real position"). Root cause: `.lobby-style-star
      .lobby-tile` positioned itself with a chained
      `rotate(angle) translate(radius) rotate(-angle)` transform driven
      by a single `--angle` custom property — a compound transform is
      exactly the kind of thing browsers' pointer/touch hit-testing
      don't all reliably agree on, so the circle could paint in one spot
      while the point that actually registered a click sat somewhere
      else. Reproduced via a ref-based click landing on the wrong tile
      relative to its visual position.

  Fixed by computing each tile's pixel position in JS with plain trig
  (`core/lobby.js`'s `layoutLobbyRadial` — the same formula already used
  for the SVG spoke lines, now shared by both) and setting it as
  `left`/`top` via new `--tx`/`--ty` properties, with the CSS reduced to
  a single `translate(-50%, -50%)` to center on that point
  (`styles/base.css`). Ordinary box position has exactly one
  interpretation for hit-testing, unlike the rotate chain.

  Verified live: every tile's own bounding-rect center now resolves back
  to itself via `elementFromPoint` (previously inconsistent), all 7
  tiles render and navigate correctly, zero console errors. Note: I
  could not cleanly reproduce the exact human symptom through my own
  click-automation tooling (it has its own screenshot-vs-viewport
  coordinate-scaling quirk, unrelated to the site) — the fix is based on
  the reproducible ref-based mismatch plus a well-documented class of
  real browser behavior for chained CSS transforms, not a byte-for-byte
  repro of what you saw. Worth a quick confirm on your end.
- [x] **User profile screen with stats + badges** — the confirmed
      PROJECT.md §5 reversal, built. Rather than a parallel screen,
      extended the existing Stats modal (`library/stats.js`,
      `#stats-modal`) since it was already the de facto profile surface
      — retitled "👤 Your Profile", Lobby tile subtitle updated to
      mention badges. Added a `BADGES` array (10 badges) computed
      entirely from data that already exists — `DB.getStats()`,
      `DB.getStreak()`, `DB.getXp()` via `Dojo.Ranks.rankFor` — no new
      DB fields, no new writes, stats.js stays read-only over other
      branches' data per its own header comment. Badges are real
      accomplishments only (course completion milestones, a perfect
      exam, a clean exam record, 90%+ accuracy over volume, week/month
      streaks, reaching Lab Manager+), per PROJECT.md's explicit
      "same restraint the rest of the app has, not participation
      trophies" instruction on this exact reversal. Locked badges show
      greyed with a 🔒; earned ones show their real icon. Verified live:
      5/10 correctly earned on the test profile (100% completion, rank
      10, but zero exams taken — exam-gated badges correctly stayed
      locked).
      - Still open, not built here: "Shop: profile customization + item
        slots" (depends on this screen, now unblocked — see
        UPDATESTACK.md).

## Batch 11 — Career reward-display bug, leftover Story text, tagline

- [x] **Bug: Career didn't show background-stripe rewards.** `shop/shop.js`'s
      rank-ladder row only ever checked `r.reward.theme`; ranks with a
      `bgStripe` reward instead (1, 2, 3, 9, 14 — see Batch 9/10) showed a
      blank "—" even though they'd earned something. Now checks both and
      can show both on one rung if a future rank ever carries them
      together, instead of silently dropping one.
- [x] **Leftover "Story tab" text cleaned up** — 4 stale comments found by
      grep across the codebase that survived the Story removal (much
      earlier this session) and, in two cases, the life-sim removal right
      before this: `shop/shop.js` (2, explaining what Career used to be
      called and where money "lived"), `games/games.js` (1, a jump-fix
      comment naming both removed features), `styles/base.css` (1, a
      shared-utilities file list). No functional change — comments only.
- [x] **Landing page tagline changed**, exact text swap as given:
      "An offline study system..." → "Online study system that keeps
      what you learn from fading — chunk by chunk, day by day."
      (`index.html`'s `.landing-sub`).

  > ⚠ **Flagged, not resolved:** the app is not online yet — Batch 6
  > (Supabase backend) is still assigned-but-not-started. The very next
  > line on the same landing page still reads "No account needed —
  > progress saves automatically, on this device" (`.landing-hint`),
  > which now directly contradicts the tagline above it. Left as-is
  > since only the tagline swap was requested — flagging so it's a
  > decision, not a surprise. Worth revisiting either when the backend
  > ships, or sooner if the "online" framing is meant to start now as
  > positioning ahead of the actual feature.
- [ ] **Increase betting cap by upgrading user profile** — new ask, not
      scoped or built. Reads as tying `games.js`'s `MAX_STAKE` ($50, flat
      for everyone today) to something the player can raise — most likely
      rank, given every other progression axis in the app is XP/rank-based
      already. Needs a design pass before building: what raises it
      (rank automatically, like themes/stripes? or a separate purchase?),
      what the new ceiling curve looks like, and whether it interacts with
      the wallet-bank decision (Batch — blocked on backend) at all. Flagged
      here rather than guessed at.

## Batch 10 — life-sim removal, done; two new background stripes

- [x] **Life-sim fully removed**, per Batch 5's scope, re-verified against
      the actual current code rather than followed blind (the plan
      predated the wallet-click explainer and the theme-preview/hints
      work, both of which touched the same files):
      - `shop/life.js` **deleted**. Its script tag removed from
        `index.html`.
      - The wallet strip it also owned (`renderVitals`, the wallet
        popover, `WALLET_HIDDEN_SCREENS`) **moved to `core/hud.js`**
        rather than deleted with the rest — `$` money is core economy
        (Garden dividends, Arcade stakes/payouts), not part of the
        life-sim, and hud.js's own header comment already claimed
        "wallet and energy" as its job. The strip now shows whenever a
        profile is active — the old `survivalOn()` rank-gate on the
        strip itself is gone along with the rank feature that drove it.
      - `games/games.js`: removed the Life tab registration
        (`TAB_GATE.life`, the `registerTab({id:"life"...` block) and
        every `Dojo.LifeShop.isWeak()`/`weakReason()` check (`beginRound`,
        `canPlay`, `gamesSummary`, the tab's warning banner) — the
        Arcade is no longer gated by anything but tickets and wallet.
      - `games/crash.js`, `hilo.js`, `mines.js`, `blackjack.js`: each
        game's own "why did the round refuse to start" message dropped
        its `isWeak()` branch — same 4 files the original scope named.
      - `shop/ranks.js`: `FEATURES.survival` removed (the only feature
        that ever used the mechanism); `hasFeature`/`featureRank` kept
        as infra for whatever rank-gated feature comes next.
      - `data/db.js`: removed `getVitals`, `patchVitals`,
        `consumeInventory`, and `getLastVitalTick`/`setLastVitalTick`
        (the last two were already fully dead before this — nothing
        called them even before the removal). **Kept**
        `getInventory`/`addInventory` — `games.js` reuses them for an
        unrelated purpose (tracking unlocked arcade games), confirmed
        by grep before touching anything. The `vitals`, `lastVitalTick`,
        `storyProgress`, `inventory` **fields** stay in
        `defaultProfile()`/migrations, per the standing "never drop a
        field" rule.
      - `styles/shop.css`: removed the now-fully-dead `.vitals-detail`,
        `.vd-*`, `.vitals-warn`, `.bag-*` rules. Kept `.v-track`/`.v-fill`
        (shared with the Career and Arcade progress bars) and
        `.vitals-strip`/`.vital-wallet` (the surviving wallet strip).
      - Docs updated: `shop/SHOP.md` (the whole life-shop section
        rewritten), `games/GAMES.md` (stale Story-tab-arrives-with-rank
        section replaced with a short current `TAB_GATE` note),
        `docs/ARCHITECTURE.md` (event list, tab example, invariants
        list), `data/DATA.md` (field-retention note extended).
      - A first pass literally deleted `shop/life.js` wholesale per the
        plan's own wording, which would have taken the wallet strip
        down with it — caught before shipping by re-deriving what else
        depended on the file (same check the Story removal used
        earlier), not from a bug report.
      - Verified live: full nav sweep (Lobby → Arcade → Crash round →
        Garden → Settings), zero console errors, zero `life.js` network
        requests, `Dojo.LifeShop` undefined everywhere it used to be
        checked, Arcade still gated correctly by tickets/wallet alone.
      - One real bug caught during verification: the DB export object
        still listed the just-deleted function names
        (`consumeInventory`, `getVitals`, etc.), which threw
        `ReferenceError` on load — fixed immediately, re-verified clean.
- [x] **Two more background-stripe rewards**, requested mid-task: Lattice
      (rank 9, Senior Lab Manager) and Origami (rank 14, Postdoctoral
      Researcher) added to `shop/themes.js`'s `BG_STRIPES` and wired into
      `shop/ranks.js`. Research Assistant II already had Herringbone from
      Batch 9, so nothing changed there. Verified live at the current
      profile's rank: Lattice unlocked, Origami correctly still locked
      with "Rank 14 · PDR" showing.

## Batch 9 — Crash reskin, background stripes, Flashcards hub, card VFX

- [x] **Crash game reskin (ball on fire).** `games/crash.js`'s rocket
      glyph is now a spinning ⚽ with a flickering orange radial-glow
      flame trailing it (`.ball-flame`, `styles/games.css`); explosion
      state still swaps to \u{1F4A5} on a bust. The wrapper no longer rotates
      to a travel angle (a ball has no "facing" the way the rocket did)
      — `core/theme.js`-style small refactor split the position-only
      transform out. Verified live: mid-flight the ball spins with a
      visible flame trail, cash-out leaves it intact, a bust swaps it
      to the explosion glyph.
- [x] **Kirigami-style background stripes, rank-gated.** A new axis
      independent of colour theme — `shop/themes.js`'s `BG_STRIPES`
      (Diagonal, Cross-hatch, Herringbone), unlocked via
      `shop/ranks.js`'s `reward.bgStripe` on ranks 1/2/3 (Diagonal is
      free from rank 1, i.e. immediately; the other two gate at 120xp
      and 300xp). Painted onto a second `--bg-stripe-image` CSS layer
      (`core/theme.js`'s `applyBgStripe`, `styles/base.css`) under the
      theme's own background, so it mixes with any theme. New
      "Background stripes" picker in Settings, same locked-swatch
      treatment as the theme grid. Verified live at xp 0/120/300 via
      `Dojo.Ranks.unlockedBgStripes` and by selecting each swatch and
      watching the page-wide overlay change.
- [x] **Flashcards manager — promoted to a standalone Lobby tile**, per
      the scoping decision (new screen, not a rename of "Build a Custom
      Deck," which keeps its existing label and location in Library
      unchanged). New "🗒️ Flashcards" tile on the Lobby
      (`index.html`, `core/lobby.js`, wired in `core/boot.js`) opens
      `library.js`'s existing deck builder directly via a new
      `openFlashcardsHub()` — auto-selects the one course that exists
      today (a second course would need a picker in front of this; the
      seam is there but not built, since there's nothing to pick from
      yet). The deck builder's back button now reads "← Lobby" and
      returns there when entered this way, "← Unit" and returns to
      Library's unit-select otherwise (`state.deckBuilderFromLobby`
      flag). The tile's subtitle reports total chunks reviewed so far.
      "Track flashcard history" is covered by the picker's existing
      weak/new/known colour-coding per chunk, not a separate log — kept
      in scope rather than building a second history view. Verified
      live: tile opens the builder with the right back-button label,
      selecting chunks and completing a review writes back and shows
      updated colours on return, "← Lobby" returns to the Lobby.
- [x] **VFX for flashcards** — all three variants the user picked:
      - *Flip animation*: the CSS 3D flip in `styles/library.css` already
        existed but never actually played — `renderFlashcard()` was
        rebuilding the card's innerHTML on every flip, so the DOM node
        the transition was defined on got destroyed and recreated
        already in its end state (an instant pop, not a turn). Fixed by
        keeping both control rows in the DOM from the start and toggling
        `.flipped` on the existing node instead of re-rendering.
      - *Correct/wrong feedback burst*: a green glow on the back face for
        "Knew it," a red shake on the wrapper for "Didn't know it"
        (`.fc-correct` / `.fc-wrong`, `styles/library.css`), with a short
        320ms pause before the next card so the feedback is visible.
      - *Deck-complete celebration*: `core/hud.js`'s existing confetti
        burst (previously only used for streaks) is now exported as
        `Dojo.burstConfetti` and fired from both `finishFlashcards()` and
        `finishCustomDeck()` once the result screen shows.
      Verified live end-to-end: flip visibly turns the card now (confirmed
      via computed style, not just class name), advancing cards shows the
      glow/shake, finishing a 5-card deck reaches "Deck Cleared!" with
      `Dojo.burstConfetti` confirmed callable and wired at that exact
      point in the code path.

## Batch 8 — theme preview + hints toggle, done

- [x] **Theme preview for locked themes in Settings.** Every locked
      premium theme now renders as its own swatch (lock badge + the
      rank/abbr that unlocks it, via `Dojo.Ranks.themeRank`) instead of
      just a "N more locked" count. Tapping one repaints the whole app
      in that theme's colours without unlocking or persisting anything
      — `core/theme.js` split `applyTheme` into a gated `resolveTheme`
      path and a new `previewTheme(id)` that paints straight from
      `ALL_THEMES`, skipping the rank check on purpose. A "Previewing
      X · Restore my theme" bar appears while active; the real theme
      restores on Restore, on picking any owned theme, or on leaving
      Settings via the Lobby back button (capture-phase listener, bound
      once since that button lives outside the re-rendered body).
      Verified live: preview paints instantly, restore returns to
      Indigo Night, and the app doesn't get stuck wearing an unbought
      theme.
- [x] **Settings: hints on/off toggle.** New checkbox in a "Hints"
      settings section; unchecking sets `p.hintsEnabled = false`
      (`DB.getHintsEnabled`/`setHintsEnabled`, defaults to `true` so an
      already-migrated profile never loses hints) and flips a single
      `body.hide-hints` class (`Dojo.applyHints`, `core/core.js`) that
      hides every `.settings-hint` paragraph app-wide — the same class
      already used for guidance text in Shop, Games, Library, etc.
      Applied at boot and on profile switch (`core/boot.js`) so it's
      correct from the first paint, not just after visiting Settings.
      Verified live: toggling off hides all 8 `.settings-hint` nodes on
      both Settings and Arcade, survives a full page reload, toggling
      back on restores them.

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
| Theme preview for locked themes in Settings | **Done (Batch 8)** |
| Flashcards manager (persistent, "near all units") | **Done (Batch 9)** |
| VFX for flashcards | **Done (Batch 9)** |
| Crash game reskin (ball on fire) | **Done (Batch 9)** |
| Kirigami-style background variations, rank-gated | **Done (Batch 9)** |
| Achievements/badges + profile screen | Confirmed (you said build it anyway, reversal written into PROJECT.md) but not built |
| Online database / live backend | Assigned: Supabase (see Batch 6) — nothing built; this gates the next few rows |
| Career weekly XP ladder (#N badge, popup, rank deltas) | Not started — needs the backend above |
| Stars currency for course pricing | Not started — flagged that it's a 3rd currency needing a real design decision, and the ad-watching path needs a real ad network |
| Wallet-click mechanic explainer | Not started |
| Settings hints on/off toggle | **Done (Batch 8)** |
| "Watered! +5xp" overlap on the Garden's single-topic review screen specifically | Not re-verified — the general case was fixed but this exact screen state has never been checked live |
| Wallet bank/stocks (3 stocks, deposits) | Not started — unclear if local-only or tied to the black market's live economy |
| Black market (financial pyramid, bots) | Not started — depends on backend |
| ~~Erase Story mode + hunger/thirst/hygiene~~ | **Done — Story (Batch 4), life-sim removal (Batch 10).** |
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

**Later done:** the life-sim's own removal — see Batch 10 above. "Batch 5"
below is kept as the original scope/plan it followed (re-verified against
the code rather than applied blind — see Batch 10 for what changed).

## Batch 5 — done (see Batch 10): remove the life-sim

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

- [x] **Theme preview in Settings** for locked themes — done, see
      Batch 8 at the top of this file.
- [ ] **New cheat code: `unlockallunits`** — as literally requested,
      but worth flagging: `admin613` already unlocks every unit (unit
      locks are prereq-based off `completedTopics`, and `admin613` sets
      every topic complete). If the intent is "units reachable but
      chunks still fresh/ungraded" that's already exactly what
      `admin613` does today, distinct from `unlockalltopics`. Will add
      the named code regardless since it was explicitly asked for, but
      may just alias `admin613` unless there's a difference in mind
      worth asking about next session.
- [x] **Flashcards manager** — done, see Batch 9. Scoped as a new
      standalone Lobby tile (user's explicit choice over a rename); the
      "rename instead" alternative below was NOT taken.
- [x] ~~Rename/reposition: "Flashcards Deck" instead of "Build a Custom
      Deck."~~ Resolved by AskUserQuestion — user chose the standalone
      screen, not a rename. "Build a Custom Deck" keeps its existing
      label and location in Library, untouched.
- [x] **VFX for flashcards** — done, see Batch 9 (flip animation fixed
      to actually play, correct/wrong glow+shake, deck-complete
      confetti). Scoped via AskUserQuestion once the user's trailed-off
      note was clarified.
- [x] **Crash game reskin** — done, see Batch 9.
- [x] **More background stripe designs** (kirigami-style, several
      variations) — done, see Batch 9.
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
- [x] **Settings: hints on/off toggle** — done, see Batch 8 at the top
      of this file.
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

