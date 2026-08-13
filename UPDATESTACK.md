# UPDATESTACK.md — staged asks, not yet done

Working queue, separate from BACKLOG.md (which is the full historical
record). Items here get **erased on completion**, not marked `[x]` and
left — BACKLOG.md is where finished work gets written up. This file is
just "what's still owed."

## TOP OF STACK — Firebase backend port
Moved to the top per your call. Full plan for Firebase (Auth +
Firestore), accounts, and the legal pack exists as its own doc:
docs/BACKEND-ROADMAP.md. Two things in it need YOUR decision before any
code starts:
1. **Which "register in Diia" you actually mean** — registering a
   business entity, joining Дія.City, or integrating Diia.ID for
   identity verification. Three different projects with different
   requirements; pick one before spending money.
2. **Whether identity documents are really needed** (recommend: no —
   see Flag 2 in the doc). Also read Flag 1 on keeping the Arcade's
   currency separated from real money, which is currently doing real
   legal work by accident and shouldn't be merged casually.
Also note: Cloud Functions needs the paid Blaze plan, which is the one
real "free tier" caveat — the doc lists three ways around it.

**Flagging, not fixing silently:** the older "Blocked on the backend"
section below still says **Supabase**, not Firebase — that predates
this decision. Left as-is since I don't know if that was a separate
call (maybe Supabase for something specific) or just stale wording;
confirm which and I'll reconcile it.

## Ready to build, no blockers
Nothing right now — Tokens (earn, spend, Token Shop, course-price gating,
see BACKLOG.md) is done. Real-money purchases stay a labeled demo stub
until there's a payment account to wire a Payment Link to — that's a
you-side task, not a code blocker, see `shop/tokens.js`'s `buyPack()`.

## NEW IDEA — ad-supported course rental (spec only, explicitly NOT built yet)
Requested 2026-08-13: an alternative to paying 250 Tokens outright —
"rent" the course by agreeing to watch ads, one contract-signing gate
plus a per-unit ad toll. Written up in full so nothing is lost; **you
said "not now, just write it down," so nothing below is implemented.**

**Ad revenue reality check (asked for first, matters for the whole
design):** there's no fixed universal number — it depends heavily on
ad type, network, and geography — but for planning purposes, rough
industry ballparks (2025) are:
- Plain banner/display ads: **~$0.0005–$0.003 per impression** (eCPM
  ~$0.50–$3). Not worth building around — too little per view.
- **Rewarded video** (the closest fit here — user gets something for
  watching a full ad, same shape as "watch this, unlock the unit"):
  **~$0.005–$0.02 per view** (eCPM roughly $5–$20), higher in
  US/EU/tier-1 markets, much lower elsewhere. **Used $0.01/view as the
  working number below** — replace with real numbers once an ad
  network (AdMob, Unity Ads, ironSource, etc.) is actually chosen.
- Interstitial (full-screen, not "rewarded"): ~$0.003–$0.01/view.
**Recommendation: rewarded video, not banner/interstitial** — it's the
only format where "watch this or you don't get the unit" is an honest
trade instead of an annoying tax, and it pays noticeably better.

**The honest gap this creates:** intro-cs costs 250 Tokens, worth
roughly **$5** at the cheapest pack's rate (350 Tokens / $6.99). At
$0.01/rewarded-view, covering that $5 in ad revenue alone would take
**~500 ad views for ONE course unlock** — nowhere close to what a
per-unit "1 to 3 ads" toll can realistically generate (see the table
below: full-course total lands around 10-15 ads). **This can't be
priced to match a Token purchase 1:1 — it has to be treated as a
separate, deliberately-cheaper "free tier with friction" product, not
a like-for-like substitute.** Flagging this now so the numbers below
aren't read as "this replaces buying the course," which they don't.

**Updated 2026-08-13, per your follow-up:** Token rewards on this path
are now **removed entirely (0)**, not halved as first proposed — see
the rewards line below. You also asked for the ad count that would
make this **actually 1:1 with the Token price**, not the "1 to 3 per
unit, ~15 total" number above (which was scoped as low-friction, not
revenue-matched). Here it is:

**True 1:1 ad count (matches the $4.99 real-money value of 250 Tokens
at the cheapest pack's rate, 350 Tokens/$6.99):**

| Rewarded-video rate | Total ads for the WHOLE course | Avg per unit (÷8) |
|---|---|---|
| $0.02/view (high end) | **~250 ads** | ~31/unit |
| $0.01/view (working estimate) | **~499 ads** | ~62/unit |
| $0.005/view (low end) | **~998 ads** | ~125/unit |

Distributed with the same 1:2:3 tiering as the low-friction table below
(units 1-3 : 4-6 : 7-8 = 1 : 2 : 3 shares each), the $0.01/view middle
estimate splits to roughly **~33 ads on units 1-3, ~67 on units 4-6,
~100 on units 7-8** per unit — scale those up ~2x at the low end or
down ~2x at the high end.

**Saying this plainly rather than just handing over the number:**
these are 30-125x the "1 to 3 ads" figure from the low-friction design
above. At the per-unit-gate touchpoint (ads only shown between units,
8 gates total), hitting true revenue parity means tens to ~100 ads at
a single gate, which is not a screen anyone sits through — it would
only be remotely tolerable if spread across many more/smaller
touchpoints (e.g. a couple ads per CHUNK instead of per unit, over the
course's ~150 chunks) rather than 8 big tolls. Flagging this as the
real tradeoff: **cheap-per-touchpoint (1-3/unit) and revenue-matched
(1:1) are not both achievable with 8 gates** — pick which one this
feature is actually for before building either version.

**Ads-per-unit, scaled 1-3 "proportional to value" (the low-friction
version, NOT revenue-matched — see the 1:1 numbers above for that):**
Two ways to define "value" per unit — pick one before building:

| Unit | Topics | Tiered-by-position (simple) | Chunk-count-weighted (closer to actual content) |
|---|---|---|---|
| 1 | 4  | 1 | 1 |
| 2 | 4  | 1 | 1 |
| 3 | 4  | 1 | 1 |
| 4 | 4  | 2 | 1 |
| 5 | 6  | 2 | 1 |
| 6 | 14 | 2 | 3 |
| 7 | 6  | 3 | 2 |
| 8 | 6  | 3 | 2 |

- **Tiered-by-position**: units 1-3 = 1 ad, 4-6 = 2 ads, 7-8 = 3 ads.
  Simple, predictable, easy to implement. Total for the whole 8-unit
  course: **15 ads**.
- **Chunk-count-weighted**: scaled off each unit's real chunk count
  (actual content volume, not just topic count) rather than position.
  More honest ("bigger unit = more ads"), but Unit 6 alone (14 topics,
  by far the largest) would dominate — worth deciding if that's fair
  or needs a cap. Total for the whole course: **~12 ads**.
  Recommend **tiered-by-position** to start — simpler to reason about
  and to explain to the user up front ("early units: 1 ad. late units:
  3 ads."); can move to chunk-weighted later if position-based feels
  arbitrary in practice.

**Contract, logging, and the anti-skip penalty (as specified):**
- A **separate, more serious contract** from the existing "Trainee
  Enrollment Contract" gimmick (`library.js`'s `showContractModal`) —
  that one is deliberately jokey ("legally binding in no jurisdiction
  whatsoever"); this one needs to actually say, in plain terms: ads are
  the price of entry, 1-3 per unit scaled to the unit, no complaining,
  no refund/skip path once agreed. Full contract copy: **write later,
  not drafted yet** — flagged so it isn't forgotten, not attempted here
  since you said "not now."
- **Every ad view/skip logged**, per your "total accounting" ask. Not
  starting from scratch: a downloaded copy of this project at
  `Downloads/Dojo-Gamify-Learn-main/admin/` already has an
  `admin/logger.js` + a documented "Telemetry & Live Event Logger"
  module (intercepts `Dojo.Bus` events, exports logs) that doesn't
  exist in this working copy — worth checking whether that's meant to
  be ported in, since it may already do most of what ad-logging needs.
  Separate decision from the ad-rental feature itself; see the
  question below.
- **Anti-skip penalty**: closing/skipping an ad before it completes
  adds **+1 ad owed** next time (a debt, not a retry of the same ad) —
  matches what you asked ("наебал и закрыл — вернётся с долгом на +1").
- **Token rewards cut entirely (0) on this path** — updated per your
  2026-08-13 follow-up (first pass had proposed halving; now removed
  outright). `COURSE_TOKEN_REWARD` (10) and the `UNIT_TOKEN_REWARD`
  table (units 3/5, currently 4/8) would need an ad-rental variant that
  pays 0 Tokens specifically, while still paying its normal money/XP —
  makes sense as a rule: Tokens are the "you'd otherwise pay real money
  for this" currency, and this path already avoids that payment, so it
  shouldn't also farm the currency that stands in for it. Money and XP
  rewards still untouched/full-rate, not mentioned as cut.

**Not decided, needs you before this becomes buildable:**
1. Which version this feature is actually for — low-friction (1-3
   ads/unit, ~15 total, NOT revenue-matched) or true 1:1 revenue parity
   (~250-1000 ads course-wide, tens to ~100 per unit-gate) — see above,
   these are not compatible with the same 8-unit-gate design.
2. If 1:1 parity is the goal: whether to move off "ads only between
   units" toward more/smaller touchpoints (e.g. per chunk) so the count
   per screen stays tolerable.
3. Whether to port `admin/logger.js` in for the logging requirement, or
   build ad-logging fresh.
4. Contract copy (serious version) — not drafted.

## Live bug reports — resolved since last check-in
- **"Quotes stopped showing up after a unit"** — traced to the review
  result screens (flashcards + custom deck), which always cleared the
  quote by original design. Fixed to pool tags and show a quote there
  too, same as topic exams. Full details + live verification in
  BACKLOG.md Batch 44.
- "First ever opening of the website uses cards layout not a star
  topology" — real bug, not a defaults/cache issue: profile creation
  never repainted the lobby behind the modal, so the pre-profile
  fallback paint (classic/stacked-list, "Welcome.") stuck permanently
  on every brand-new user's first screen. Fixed in Batch 43
  (`core/profile.js`'s save handler now emits `profile:changed` +
  calls `showLobby()`), verified live with a true clean-slate
  first-visit simulation.
- Star lobby "broken" on phone — the FIRST report of this really was a
  stale-cache artifact (Batch 30). A LATER report of the same symptom
  turned out to be a real bug the cache fix didn't touch: fonts loading
  over the network and mobile viewport resize both happen after the
  ring's one-shot layout measurement. Found and fixed for real in
  Batch 41 — don't reach for "stale cache" reflexively next time this
  comes up, check first.
- Kirigami+stripes "a mess" — confirmed stale-cache artifact (Batch 30);
  code was already correct.
- "Bought the course, couldn't unlock it" — real bug found: clicking a
  locked course redirected to the Token Shop where the actual buy
  button lived in a separate section further down the page. Fixed with
  a buy-inline modal on the course card itself (Batch 31); Token Shop
  no longer lists courses at all now.
- Mobile XP bar overflow, Career screen mobile overflow, Flashcards
  bypassing course ownership, Sources-box crowding the phase button —
  all found and fixed (Batches 32/33/37).

## SECURITY AUDIT (2026-08-13) — findings, verified not guessed

**Clean / verified good:**
- **XSS via profile name is properly guarded.** The profile name is the
  only genuinely user-controlled string in the app, and every single
  place it renders uses `.textContent`, never `innerHTML` —
  `core/profile.js` (list + badge), `core/hud.js` (nickname),
  `core/lobby.js` (welcome line). Checked every `${...name...}` template
  literal in the codebase; the rest are app-authored data (theme, rank,
  garden-stage, badge names), not user input.
- **`settings/codes.js` is correctly gitignored and not deployed**, and
  `codes.example.js` is currently empty (`({})`), so no live cheat
  codes ship in the bundle.

**Real findings, in honest severity order:**
1. **The whole paywall is client-side only and bypassable.** Anyone can
   open devtools, edit localStorage, and unlock every course for free.
   This is not a bug to patch — it is a direct consequence of "static
   site, no backend, no accounts." Worth stating plainly because it
   caps what the Token economy can ever be worth commercially until
   there is a server. Everything below is smaller than this.
2. **`SECRET_ADMIN_NAME = "adminaccount"` is hardcoded in tracked,
   deployed `data/db.js`** (line ~341), so it is publicly readable by
   anyone who views source on the live site. Typing it as a profile
   name grants the admin unlock. Note `codes.example.js`'s own comment
   already acknowledges this trade ("that ships fine") — it was a
   deliberate call to make it work on the deployed site. Given finding
   #1 it grants nothing that devtools didn't already, but it should be
   a *known* public string, not one believed to be secret.
3. **Old cheat codes are still in git history** — commit `0a4a2d2`
   committed a `settings/codes.js` containing `admin613`, `agrala`,
   `parnasa100`, `capmyrank`; `9282a36` untracked it, which does NOT
   remove it from history. **Low severity**: those codes only ever
   executed from a locally-present `codes.js`, which is never served,
   so they are inert on the deployed site. Only matters if those
   strings are reused as secrets elsewhere. Fixing properly means
   history rewrite (`git filter-repo`) + force-push — deliberately NOT
   done unilaterally, since that rewrites shared history.

**Not yet audited (next session):** CSP headers; `innerHTML` with
authored course content (low risk, but unreviewed); localStorage quota
exhaustion / corrupt-JSON resilience on `DB.load()`; whether `sw.js`'s
cache-first strategy can pin a broken build.

## CLEANUP — assessed, deliberately NOT executed

- **Dead profile fields** (`energy`, `vitals`, `lastVitalTick`,
  `storyProgress`) are life-sim leftovers nothing reads. They look like
  obvious deletions, but `data/db.js` documents "migrations never drop
  a field" as a deliberate invariant — removing them would break that
  contract and risk old saved profiles. **Recommend leaving them**; the
  cost is a few unread bytes per profile, the risk of removal is real.
- **Empty infra objects** (`FEATURES`, `TAB_GATE`, `COMING`) are all
  documented as intentional extension seams, not oversights. Leave.
- **`settings/codes.js` and `codes.example.js` are byte-identical**
  (both the empty template). Harmless, but the local copy is redundant.

## Still open — needs your input
- **Flashcard confidence rating ("I know this well" etc.) — checked as
  requested, works correctly.** Verified live: rated a chunk, finished
  the review, confirmed `DB.getChunkConfidence` stored it; re-reviewed
  the same chunk with a different rating, confirmed it overwrote
  cleanly. Along the way found a small, separate edge case: the rating
  buttons don't disable themselves the instant they're clicked, so a
  fast double-tap inside the ~320ms transition to the next card could
  register two answers against the same card (double-counts toward the
  session total/XP, and the second tap's rating wins). Minor, only hits
  on unusually fast taps — flagging, not fixing unless you want it.
- **Opera: rotate slider (Star lobby) rendered with broken styling.**
  Root cause: the slider only used CSS `accent-color`, which tints the
  thumb and filled portion in Chromium but leaves the *track* drawn by
  the browser's own native theme — Opera's default track apparently
  renders as a light bar against this dark, tightly-cornered control.
  Fixed by fully resetting the control (`appearance: none`) and drawing
  the track/thumb ourselves for both WebKit and Gecko engines, so it no
  longer depends on any browser's native skin. Couldn't verify in real
  Opera specifically (not available as an engine here), so **please
  confirm on your end** that it now looks right.
- **Token icon renders as silver on the phone screenshot, gold on
  laptop.** Very likely a platform emoji-rendering difference (🪙 is
  drawn by the OS's own emoji font, not CSS), not a code bug. Fix would
  be swapping the emoji for a custom inline SVG coin icon everywhere
  Tokens are shown — real but small work. Confirm it's worth doing
  before I build it.

## Blocked on the backend (Supabase — assigned, nothing built)
- Career weekly XP ladder.
- Wallet "bank": deposits + 3 stocks (tied to the black market's live
  economy per your call — also blocked on that design).
- Black market (financial pyramid, bots).

## Blocked — no server to send it to
- Post-completion questionnaire (real data collection, no backend yet).

## Design conversation, not yet decided
- Lobby topology: proposed Trunk line / Binary orbit / Ladder rungs.
  Recommended Trunk line. Star shipped and iterated on since this was
  raised — likely moot now, confirm before scoping.
- **Weather VFX for the (Star) lobby** — clickable clouds that randomly
  set a weather effect, from a large reference list spanning six
  categories (standard atmospheric, liquid precip, frozen/mixed precip,
  severe/cyclonic, wind/dust, rare/optical — full lists pasted in chat,
  not reproduced here). Explicitly a rough sketch, not a spec — needs a
  real design pass before scoping, not literal implementation of every
  named weather type.
  **Flagged conflict, per your ask to surface these before deciding:**
  the lobby already carries two decorative overlay layers — each
  theme's own `bg` (`shop/themes.js`) and the separate `bgStripe` layer
  on top of it (`core/theme.js`). Three themes (Kirigami, Terminal,
  Ronin) already suppress the stripe layer entirely because their OWN
  `bg` is a repeating pattern and a second one on top just reads as
  noise (see `core/theme.js`'s `stripeCssFor`). A weather layer is a
  THIRD overlay — it will hit the exact same problem, likely worse
  (moving clouds vs. a static pattern), and needs the same kind of
  per-theme suppression/dimming logic worked out, not bolted on blind.
- **"Cosmos" theme** — a new theme option, pitched alongside real
  planetary-weather trivia (Mercury through Neptune, pasted in chat) as
  possible flavor text/tooltips. Also a rough sketch — needs a palette,
  a `bg` treatment, and a decision on where the trivia text actually
  lives (tooltip? an About panel? nowhere, just inspiration for the
  color choice?) before it's buildable.
- **Star lobby decoration ("stars around etc")** — vague ask for more
  visual flourish on the ring itself. No concrete direction yet; would
  benefit from being scoped together with the weather idea above rather
  than separately, since both are "decorate the lobby" asks.

## Marketing / growth — not engineering, needs your input to scope
- Research what's actually driving engagement on hype-topic study/growth
  content right now (what's working on TikTok/social for study apps).
- A model for how to actually market this — audience, channel, hook.
- A promo plan once there's something concrete to point people at.
None of this has a code deliverable yet — it's strategy work, flagged
here so it isn't lost, not something I can just start building.

### Popularization notes — what to BUILD to make it spreadable
Ordered by (impact ÷ effort). These are the code-side changes that would
actually help distribution, as opposed to the strategy work above.

**Highest leverage, genuinely cheap:**
1. **Shareable result cards.** The Final Quiz / topic-mastery result
   screen already computes a score, a rank, and a streak — rendering
   that to a downloadable image (canvas) with the Dojo mark turns every
   pass into an organic post. This is the single most social-shaped
   thing the app already almost has.
2. **Open Graph / Twitter card meta tags.** `index.html` has a
   `description` but no `og:image`/`og:title`. Right now every link
   anyone shares unfurls as a bare grey box — actively costs clicks.
   Near-zero effort, pure upside.
3. **A real favicon/app-icon audit + install prompt polish.** It's
   already an installable PWA; "add to home screen" is a retention
   mechanic that costs nothing extra to lean into.

**Medium effort, high ceiling:**
4. **A free sample unit that needs no purchase.** With the course now
   priced, a first-time visitor hits a paywall before experiencing the
   thing that's actually good (the chunk→predict→explain→quiz loop).
   One free unit is the strongest possible demo of the product.
5. **Deep links to a specific topic/unit** (`?topic=...`). Makes the
   app linkable from a video description or a comment, instead of only
   ever "go to the homepage and find it."
6. **A public "what I learned" streak/stat page** — needs the backend,
   so parked behind the account work, but worth designing toward.

**Worth noting honestly:** the biggest growth blocker is not a missing
feature, it's that there is one course and no distribution channel. #1
and #2 above are the only items here that pay off *before* those two
problems are solved.

## Long-term roadmap (later — needs the account/backend question settled first)
- Finish out the web app, then port to iOS and Android.
- Real account system + online database — currently offline/local-only
  (see landing page copy) on purpose, because nobody on the team knows
  databases yet. A friend who does is expected to be free "later" — this
  whole line (accounts, online DB, and everything above that's "Blocked
  on the backend") waits on that, rather than being half-designed now by
  someone who'd be guessing at the DB side.
