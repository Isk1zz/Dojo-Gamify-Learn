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

## Live bug reports — resolved since last check-in
- **Admin & Telemetry Suite ported and live** (Ctrl+Shift+A / F2, or
  profile dropdown → "🛡️ Admin & Logs"). Wasn't a bug report, but
  worth flagging here since it's new capability, not a stack item —
  full account in BACKLOG.md Batch 47, including a real bug found and
  fixed during the port (every rank name in the panel rendered as
  literal "undefined" from a field-name mismatch) and what was
  deliberately NOT built (ban/warning enforcement outside the panel
  itself — banning currently only sets a flag, nothing checks it yet).
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
- **Admin panel: warning notices still don't reach the user.** Settled
  the bigger half of this — per your call, Ban is now a full
  irreversible account WIPE (progress/XP/wallet/Tokens/Tickets all
  reset, confirm dialog before it fires), not a soft lockout, so there
  is no "suspended" state left to enforce — the wipe IS the
  enforcement. What's still genuinely unbuilt: warnings
  (`DB.addWarning`) are recorded but nothing ever shows them to the
  warned user — ADMIN.md describes an acknowledgment modal on next
  entry that isn't implemented. Confirm if you want that built, or if
  warnings are just an internal moderation note for now.
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
- **Opera: rotate slider (Star lobby) rendered with broken styling —
  fixed, and a second real bug found in the same control.** Root
  cause #1: the slider only used CSS `accent-color`, which tints the
  thumb and filled portion in Chromium but leaves the *track* drawn by
  the browser's own native theme. Fixed by fully resetting the control
  (`appearance: none`) and hand-drawing the track/thumb for both
  WebKit and Gecko. Couldn't verify in real Opera (not available as an
  engine here) — still needs your confirmation on that front.
  **Root cause #2, found live after that fix**: the hand-drawn track
  was hardcoded to a white-based rgba, invisible on light themes
  (reported as "the slider isn't visible" on the Paper theme — a
  near-transparent white line on a cream background). Fixed to use
  `--border-accent`, the same variable `core/theme.js` already
  repaints per theme. Verified live on both Paper (light) and Indigo
  (dark) — visible and theme-colored on both.
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
