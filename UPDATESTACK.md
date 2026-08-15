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
   see Flag 2 in the doc). Flag 1 (keep the Arcade's currency separated
   from real money) **no longer binds the way it did** — the casino
   games were removed on 2026-08-14, so there is nothing to wager on;
   see the Arcade section below before acting on either flag.
Also note: Cloud Functions needs the paid Blaze plan, which is the one
real "free tier" caveat — the doc lists three ways around it.

**Flagging, not fixing silently:** the older "Blocked on the backend"
section below still says **Supabase**, not Firebase — that predates
this decision. Left as-is since I don't know if that was a separate
call (maybe Supabase for something specific) or just stale wording;
confirm which and I'll reconcile it.

## NEW IDEA — user forum with $-funded reputation (noted only, nothing built)
Raised 2026-08-14, explicitly "don't mind this for now just denote".

The shape as described: a forum where users earn **reputation**, and
reputation comes from **other users spending their `$` on you** — the
money converts into rep rather than transferring as money. Rep then
drives **post ranking** (bringing posts up), plus other changes not yet
specified.

Not designed, not scoped, nothing written. Three things to think
through before it ever gets built, flagged now while it's cheap:
1. **This is the first feature that would make one user's actions
   affect another user's state**, which every existing system in this
   app deliberately avoids — it's why everything works offline on
   localStorage. A forum is not portable to the current architecture at
   all; it hard-requires the backend (docs/BACKEND-ROADMAP.md) plus
   moderation, which the admin panel only half-covers today.
2. **`$` gaining an exit path changes the Arcade's legal position.**
   BACKEND-ROADMAP.md's Flag 1 records that the Arcade is currently
   safe specifically because `$` is earned in-app, can't be bought, and
   can't leave. "Spend `$` on another user" is a transfer — it makes
   `$` worth acquiring for reasons outside the games. Re-read that flag
   before designing the economics, not after.
3. **Paid-for reputation ranks posts**, which means whoever spends most
   is most visible. Worth deciding early whether that's the intent (a
   tip-jar signal) or an accident (pay-to-win visibility), because it's
   very hard to walk back once people have paid into it.

## DECIDED 2026-08-15: Arcade becomes a FORUM, Garden pays reputation
Supersedes the "needs a new game set designed" section below — there
will be no new game set. The Arcade tile becomes a **Forum**, and the
Garden stops paying `$` and starts paying **reputation points** you
spend on other people's posts.

**The rule, as given:** you cannot spend reputation on yourself. Whoever
posts and receives it goes up.

That single rule is doing a lot of work and is worth stating plainly:
it makes reputation a currency you can only ever give away, which is
what stops it collapsing into "grind the Garden, inflate yourself". It
also means reputation earned ≠ reputation held — a person's standing is
what OTHERS gave them, and the Garden only mints the right to give.

### Nothing here is buildable yet — one hard blocker
A forum is inherently multi-user; this app is offline-first with
`localStorage` as its only store and no server (static GitHub Pages).
Posts, votes and reputation cannot cross between people without a
backend. So this lands squarely on the **TOP OF STACK Firebase port** —
it isn't a nice-to-have for the forum, it's a precondition. Anything
built before then can only be a single-player mock, and a forum with no
one else in it is worse than no forum.

### Open questions before it can be designed properly
- **What happens to `$` money?** With the Arcade gone AND every cosmetic
  now free (below), `$` has no sink and no purpose left. Either it goes,
  or the Garden keeps paying it for something not yet decided. Related:
  the Tokens → `$` exchange becomes pointless if `$` buys nothing.
- **Moderation.** Warnings/bans exist (admin/ADMIN.md) but were built for
  a single-player app. A forum needs report flows, and the wipe-on-ban
  behaviour needs re-examining when a user's posts are other people's
  context.
- **Abuse of the give-only rule.** Two accounts can still trade
  reputation back and forth. Worth deciding whether that matters before
  it's built, not after.
- **Does the Garden still grow plants?** It currently means retention;
  paying reputation from it needs the metaphor re-checked so watering a
  plant and funding a stranger's post don't feel unrelated.

## SUPERSEDED — Arcade game set (kept for the reasoning)
Casino games (Crash, Hi-Lo, Mines, Blackjack) removed 2026-08-14 on
request. The shell is intact and waiting: tickets (7 per 6h), stake
caps, the Upgrades tab, the `$` economy and the `register()` seam all
still work, so a replacement plugs in without touching any of it.

**What this changed beyond the games themselves — worth knowing before
the next economy decision:**
- **The gambling-shaped exposure is gone.** `docs/BACKEND-ROADMAP.md`'s
  Flag 1 said the Arcade was only safe because `$` (staked) and Tokens
  (real-money-bought) never convert. With nothing to wager on, that
  constraint is much weaker — which means the **"buy `$` with Tokens"
  exchange rate you asked about is now a reasonable thing to build**,
  where before I advised against it. It stops being reasonable again
  the moment a wagering game returns, so decide the games first and the
  exchange second, not the other way round.
- **Age-gating pressure drops too** (Flag 2), which matters if Diia.ID
  ever happens.

**Suggested direction, not built:** keep the loop (spend `$`, take a
risk, win `$`) but wrap it in study formats rather than casino ones —
a timed recall sprint, a "double or nothing" on a review session, a
streak wager. Same dopamine, no licensing exposure, and it finally ties
the Arcade to the thing the app is actually for. Needs a real design
pass.

### ⚠️ The exchange shipped FIRST — this section's advice was inverted
The note above says "decide the games first and the exchange second,
not the other way round." That is not what happened: the Tokens → `$`
exchange shipped 2026-08-15 on request, while the Arcade is still empty.

That was safe **only because there is nothing to wager on**. The order
now matters more than it did, not less:

- Tokens are bought with real money. `$` is now reachable FROM Tokens
  (10:1, one-way). So the moment a game lets you stake `$` on a random
  outcome, there is an unbroken path from **real money → Tokens → `$` →
  wager**, which is the exact chain `docs/BACKEND-ROADMAP.md`'s Flag 1
  was written to keep broken.
- **Therefore: any new Arcade game must either (a) not be wagering-
  shaped, or (b) ship together with removing or gating the exchange.**
  The study-formats direction above satisfies (a) — a recall sprint
  rewards skill, not chance — which is now a compliance argument for it,
  not just a thematic one.

Do not treat "the exchange already exists" as settling this. It is the
constraint on the game design, not permission to ignore it.

## All paid cosmetics are FREE (2026-08-15)
Per "paid customs are to be set free" — every purchasable cosmetic is
now price 0: base themes (Ember/Jade/Rose/Ice/Sepia/Violet/Slate),
layouts (Classic/Cards/Star of David), flag palettes
(Ukraine/Israel/USA) and scenery (River/Island). `ownsLayout` and
`ownsPalette` gained the same "price 0 = always owned" tier that themes,
decorations and scenery already had, so nothing needs buying to be
equipped.

Verified on a fresh `$0` profile with an empty inventory: every cosmetic
unlocked, and the Custom Shop shows its "you own everything here" state
with zero buy buttons.

**Awarded themes were deliberately NOT freed.** They're rank rewards,
not purchases — "paid customs set free" and "give away the things people
earn" are different sentences, and freeing them would delete the only
reason the rank ladder pays out anything cosmetic. They stay behind
their ranks.

**Consequence to settle:** `$` money now has no sink whatsoever — the
Arcade is gone and nothing is for sale. See the Forum section at the top
of this file; deciding what `$` is FOR (or removing it) is now an open
question rather than a detail. The Tokens → `$` exchange has the same
problem: it converts into a currency that currently buys nothing.

## Day = white theme, and a lobby switch (2026-08-15)
- **Day now means a WHITE app, not just a bright sky.** Locked pair, per
  your call to pick from existing and fix it: day = **Frost**, night =
  **Indigo Night**. Both free, so the switch can never land you on a
  theme you don't own, and "day" means the same thing every time rather
  than depending on which themes you last used.
- **The lock runs BOTH ways.** `setSky` picks the theme; `syncSkyToTheme`
  picks the sky for whatever theme is equipped, and runs on boot, on
  profile change, and whenever the lobby renders. That fixes "first
  launch showed a day topic with night sky" at the source — verified by
  forcing the broken state into storage (theme frost + sky night) and
  cold-loading: it reconciles to day with the sun out. Equipping a theme
  in Custom now goes through `Dojo.equipTheme`, so picking a light theme
  brings the day sky with it.
- **Lobby switch, positioned so it moves nothing.** First attempt put it
  in `.lobby-dials`, which is `justify-content: space-between` — a third
  child there re-positioned the rotate and spark controls already in the
  row ("the layout shouldn't affect previous buttons"). Second attempt
  pinned it absolutely inside `.lobby-inner`, which landed it on top of
  the spark stepper. It's now `position: fixed` directly under the
  sun/moon, out of every flex flow and out of the content column.
  Verified zero overlap with the rotate slider, spark stepper/count, or
  any ring tile — and it's lobby-only, hidden on other screens.
- Sun/moon SVGs got `overflow: visible`: an `<svg>` clips to its viewBox
  by default and the halo scales past it (r44 → r64 on the poke flare),
  so the flare was being sliced off square ("dashes into a square box
  and gets cut").

## Library tile "bigger than the rest" — it wasn't (2026-08-15)
Measured all six ring tiles: every one is exactly 112x112. Library only
LOOKED bigger because `.lobby-tile.primary` filled it with
`--accent-glow` while the others stayed outlined, and a filled shape
reads larger than an outlined one at identical geometry. Fixed by
perception, not by geometry: in the Star layout the primary tile now
keeps an accent RING instead of a filled disc, so it's still the obvious
starting point without appearing to outweigh its neighbours.

Worth remembering as a pattern — "X is bigger" was a real complaint about
a real visual problem, but the size was never wrong, so resizing would
have introduced an actual inconsistency while chasing a perceived one.

## Sky is its own scene now (2026-08-15)
Day/night was derived from whether the equipped THEME was light or dark.
That conflated two unrelated choices — which colours the app uses, and
what time of day it is outside — so picking a colour scheme silently
changed the sky. They're separate now:

- New `sky` profile field (`DB.getSky/setSky`, default `night`) and
  `data-sky` on `<html>`. Sun-vs-moon, the stars and the doubled cloud
  count all key off it. A dark theme in daylight and a light theme at
  night are both possible now; verified Frost + night sky renders the
  moon.
- **Two ways to change it, one state:** the ☀️/🌙 button in the vitals
  strip, and a "Sky" slot in Custom (Night / Day, free — it's a time of
  day, not merchandise). Verified both write the same field.
- `data-theme-mode` was removed. It existed only to drive the sun/moon
  swap; with the sky owning that, nothing read it, so it went rather
  than sitting there looking load-bearing.

**Clouds moved back BEHIND the app** (`#bg-decor-front` z-index 55 → -1).
They were only in front so they could be clicked, but clicks are resolved
by rect hit-testing now, so being on top bought nothing and cost real
damage: a drifting cloud washed over the lobby tiles (reported with the
Library tile circled). Verified the tile is unobscured and still takes
the click, and clouds are still pokeable — that never depended on
stacking order.

**Sun glows at rest.** Reported as "static and doesn't glow unless
clicked", and true in effect: the idle halo pulsed 0.10→0.20 opacity and
the rays took 44s per revolution — animation you can measure but not
see. Now a real drop-shadow bloom, a halo pulsing across a visible
range, a throbbing disc and rays at 18s. The poked state was raised well
above the new idle so a click still reads as an escalation.

## Sky polish round 2 (2026-08-15)
- **Bird bolt fixed — "some tp, some natural" was a specificity bug.**
  The clone kept its original classes, so `.decor-usa_eagles.eagle-2`
  (0,2,0) and its `animation-duration: 23s` / `animation-delay: -9s`
  longhands beat the shorthand in `.fx-eagle-rush` (0,1,0). That bird
  began its 1.5s bolt already 9s in and simply vanished; eagle-1 had no
  such override, hence one looked right and one teleported. The clone is
  now stripped to a single class and `.fx-eagle-rush` carries complete
  standalone styling. Verified both birds: 1.5s / 0s / clean class.
  - Second teleport, same report: the real bird used to RESUME its loop
    wherever it had got to, popping back mid-screen. It now restarts
    from the beginning of its path (off-screen) with an inline
    `animation-delay: 0s` to override the CSS stagger, so it flies back
    in instead of reappearing.
- **Low clouds now throw study emoji** — 60-odd of them (books, pens,
  microscopes, timers, trophies), verified 46 distinct in 120 pokes.
  Safe on Windows in a way 🇺🇦 was not: only regional-indicator pairs
  lack glyphs there. Kept to single-codepoint emoji, no ZWJ sequences
  (👩‍🏫 splits where unsupported) and nothing past Emoji 12. The drawn
  hammer and flipped-U arch stay in the rotation as the odd one out.
- **Poke the sun** and it spins up like a fan for two turns, the disc
  runs hot (fill animates toward orange), the halo flares, and a heat
  wave pushes outward past it. Higher specificity than the idle drift,
  so it takes over and hands back cleanly.
- **Day/night toggle** in the vitals strip. "Day" and "night" aren't a
  separate setting — they're whether the equipped THEME is light or
  dark, which already drives the sun/moon swap, the stars and the extra
  clouds, so the toggle flips the theme and everything follows. Each
  side remembers the last theme you were actually on: verified that
  Jade → day → back returns to Jade, not to the default. Only owned
  themes are eligible, so it can't become a back door onto a paid one
  the way Settings once was.

## Birds, daytime sky, low-cloud gags (2026-08-15)
- **Poke a bird.** A feather comes loose and drifts down (own fall +
  sway animations on nested elements — one element can't run two
  conflicting transforms), and the bird bolts off-screen with a
  panicked wingbeat. The bolt is a CLONE in the fx layer; the real
  element keeps running its own loop invisibly and reappears on its next
  pass, so re-timing never fights the keyframes that own its transform.
  Birds are hit-tested BEFORE clouds — they're small and usually drawn
  over one, so the cloud would otherwise swallow every attempt.
- **Daytime sky.** With the sun out there are no stars (they read as a
  rendering fault in daylight) and twice the clouds instead — six extra
  `.cloud-day` ones interleaved between the originals' heights, so it
  reads as a fuller sky rather than a second band. Verified: 6 clouds +
  stars at night, 12 clouds + no stars by day.
  - Bug caught in the same pass: the general cloud reveal matched
    `.cloud-day` too, so all twelve showed at night. Fixed with
    `:not(.cloud-day)` on that rule.
- **Low clouds do something else.** Weather falling out of a cloud that
  sits below the content reads backwards, so any cloud whose centre is
  in the bottom half skips the weather table entirely: either a little
  creature leaps out and drops back in, or a prop (a hammer, or the
  flipped-U arch) spins straight through. Both drawn, not emoji — the
  Windows flag-glyph lesson applies to any decorative character.
  Verified the split: bottom cloud yields only bounce/fly-through, top
  cloud still yields rain/lightning/rainbow/fairy.

## Moon becomes a Sun on light themes (2026-08-15)
One decoration, two faces. `core/theme.js`'s `paintTheme` now publishes
`data-theme-mode="light|dark"` on `<html>` (new, and reusable — anything
decorative can now react to day vs night without re-deriving it), and
the `moon` id renders a moon under `dark` and a sun under `light`, same
slot and same size so switching theme doesn't shift the composition.

The LABEL follows too, via `Dojo.decorFace(d)` — Custom and the Shop say
"Sun ☀️" on a light theme. Without that the tile would read "Moon" with a
sun plainly visible behind it. Written as a lookup on optional
`lightName`/`lightIcon`/`lightDesc` fields rather than an `if (id ===
"moon")`, so a second two-faced decoration needs no new plumbing.

Sun colours are deliberately softer than a "correct" sun would be: on a
light background a solid yellow disc is much louder than a pale moon is
on a dark one.

**Still odd, not changed — your call:** the Stars decoration stays
visible on light themes, which is the same daylight problem the moon
had. Left alone because hiding stars by day would silently disable a
decoration the user switched on; say the word and it can either hide
with the moon or fade to a daytime intensity.

## Clouds no longer eat clicks (2026-08-15) — self-inflicted, fixed
Reported: "menu isn't opening what I need if a cloud is passing by."
Entirely my doing. To make clouds pokeable I put them in a layer above
the app with `pointer-events: auto`, which meant a cloud drifting over a
control captured the tap meant for it. Decoration beat function — the
wrong way round.

Clouds are now `pointer-events: none` and can never intercept anything.
`shop/decor.js` instead listens for clicks that hit NO interactive
element (`button, a, input, …, [role="button"], [tabindex]`) and only
then rect-tests whether one landed on a cloud. Real UI wins by
construction rather than by luck, and poking still works anywhere you'd
otherwise be clicking dead background.

Verified both directions in one synchronous execution, so no timing
ambiguity: a cloud parked over the Settings tile → Settings opens, zero
effects; the same cloud over empty background → rain fires, screen
unchanged. (An earlier "no effect" reading was just tool-call latency
outliving a 700ms effect, not a failure — worth knowing before chasing
it again.)

## Inventory → "Custom", and Settings stops duplicating it (2026-08-15)
One surface per job: **Shop buys, Custom equips, Settings does
behaviour.** Settings had carried a full second copy of the cosmetic
controls — colour theme, awarded themes, lobby style, star links,
palettes, background stripes — all writing the same state Custom writes.
That duplication wasn't just clutter, it was the *cause* of the paid-
theme paywall hole fixed earlier the same day: two screens writing the
same state, only one of them checking ownership.

- Settings now has a single **🎨 Appearance** section that links to
  Custom, and keeps only what it's actually for: Hints, Sound, Unlock
  code, Legal, Your data.
- Verified nothing was lost: every cosmetic section that used to be in
  Settings has a matching slot in Custom (Colour themes, Awarded themes,
  Lobby style, Star links, Spoke/Star-of-David colours, Background
  stripes), plus Decorations and Scenery which were never in Settings.
  Zero `[data-theme]` / `[data-bg-stripe]` / `[data-lobby-style]` /
  `[data-star-links]` / `[data-hex-flags]` / preview-bar nodes remain in
  `#settings-body`.
- ~230 lines of now-dead swatch builders and orphaned handlers deleted
  from `settings/settings.js`, along with its theme-preview state
  (`previewing`, `backBtnBound`) — Custom has its own preview + restore.
- **Renamed in the UI only.** The lobby tile, the screen header and all
  Shop copy say "Custom"; the route id, `shop/inventory.js`, and the
  `#inventory` DOM ids stay as they are. Renaming those would be churn
  across boot.js/index.html/CSS for no user-visible gain.

## Shipped 2026-08-15 (second batch)
- **Warning notices now actually reach the user.** `DB.addWarning` has
  always recorded them and `admin/ADMIN.md` has always described an
  acknowledgment modal on next entry, but nothing ever displayed one —
  every warning sat at `read: false` forever and moderation had no
  effect the user could see. New `core/warnings.js` + `#warning-modal`,
  fired from both `profile:changed` and cold start (reopening with a
  profile already active is the commonest way a warned user returns,
  and `profile:changed` doesn't fire for it). No close X and no
  click-outside dismiss — the acknowledge button is the only way out.
  Acknowledging marks `read: true` but does NOT delete: the moderation
  trail has to survive being read. Messages render via `textContent`,
  never `innerHTML` — they're operator-typed, and verified live that a
  `<script>` payload renders as literal text with zero nodes injected.
- **PAYWALL HOLE FIXED: paid themes were free from Settings.** Settings
  rendered every base theme as selectable, ignoring the ownership added
  when themes became purchasable — so a $500 theme could be equipped
  for nothing while the Shop still charged for it. Exactly the same
  hole layouts had. Unowned paid themes now render preview-only with
  "$N in the Shop" as the requirement label. Verified: on a $0 profile
  Rose has no selectable swatch, and clicking its preview leaves the
  equipped theme unchanged.
- **Owned stock leaves the Shop.** Every pane now filters out what you
  already own, a section with nothing left to sell renders as nothing
  at all rather than a wall of disabled "Owned" buttons, and an aisle
  where everything is bought shows a "you own everything" state with a
  link to the Inventory. Since all decorations are free, that pane is
  empty in practice — correct, not a bug; it stays so the next PAID
  decoration needs no new plumbing.
- **Buying no longer throws you to the top of the Shop.** `renderStore`
  rebuilds via `innerHTML`, which destroys the nodes holding scroll
  position. Now captured and restored around the rebuild — except on a
  category change, which is a different screen and legitimately starts
  at the top.

## Renamed to "Unnamed App" (2026-08-15)
The app's user-facing name is now **Unnamed App**, replacing
"Dojo道場" / "Dojo - Gamify & Learn". Changed in all five places it
surfaced: the `<title>`, the manifest's `name` AND `short_name`, the
`apple-mobile-web-app-title` meta, the landing wordmark, the lobby
wordmark, and the first-run welcome modal. (The wordmark needed an
explicit `&nbsp;` — "Dojo道場" needed no space between Latin and CJK,
"Unnamed App" does, and without it it rendered as "UnnamedApp".)

**Deliberately NOT renamed:** the `Dojo` global object, the `cs_dojo`
directory, and the repo. Those are code identity, not the product name
— renaming the global would touch every file in the project for zero
user-visible gain. If the name is meant to reach the code too, say so
and it's a separate, mechanical pass.

## NOT YET BUILT from the 2026-08-14 restructure ask
Everything from that message has now shipped (see BACKLOG.md).

- ~~**US theme: eagles flying around + stars in the top-left corner,
  each separately purchasable.**~~ Shipped 2026-08-15, built as a
  GENERAL decoration layer rather than a US-only one (your call), so
  Weather VFX and any future overlay can reuse it instead of getting
  its own mechanism:
  - **New layer**: `#bg-decor-layer` in index.html — fixed,
    `pointer-events:none`, `z-index:-1`. Each piece is hidden by default
    and revealed by `html[data-bg-decor~="<id>"]`, so on/off is pure CSS
    and the markup exists exactly once.
  - **New ownership shape**: decorations are a SET, not a slot —
    `DB.getBgDecors/setBgDecors/toggleBgDecor`, so Stars and Eagles can
    both be on at once. Inventory's slot carries `multi: true` and the
    dropzone renders a chip per active piece rather than one item.
  - **Suppression**: `core/theme.js`'s `applyBgDecors` reuses the exact
    rule `stripeCssFor` already applies — a theme whose own `bg` is a
    repeating pattern (Kirigami/Terminal/Ronin) blanks decorations, so
    the third overlay can't fight the first two. Verified live against
    Kirigami.
  - **Now FREE and default, per your call** ("set this bundle for
    default (free)" = whatever was on screen). Stars, Eagles, Clouds and
    Moon are all price 0 — always owned, same convention Indigo/Frost
    use — and a new profile ships with all four ON plus the Jungle scene
    equipped (`data/db.js` profile defaults). Verified on a fresh $0
    profile with an empty inventory: full look, nothing bought. Each is
    still individually switchable in the Inventory. Only River ($250)
    and Island ($350) remain paid.
  - **The Liberty Bundle was DELETED, not repriced.** It sold Stars +
    Eagles + the USA palette for $650; with both decorations now free it
    would have been a $650 wrapper around a $400 palette — strictly
    worse than buying the palette alone, which is a trap rather than a
    discount. The USA palette is still sold normally under Styles.
  - **Art pass, same day**: Stars went from 5 identical glyphs on a grid
    to 9 at mixed sizes on an irregular scatter, with per-star twinkle
    rates and a slow drift on the whole cluster. Eagles went from the
    🦅 emoji (can't animate, and at the mercy of the OS font — the same
    trap the country-flag labels fell into) to a drawn SVG with wings
    that beat, on a separate animation from the flight path so the
    glide stays linear while the wingbeat eases.
  - Two of my own bugs, both caught only by looking at the live page:
    (1) the hide rule was written `#bg-decor-layer > *`, which scores
    (1,0,0) on the id and silently beat every reveal rule (0,2,1) — so
    NO decoration rendered even with its token set; fixed with
    `:where()` to zero the specificity. (2) The first eagle drawing was
    a concave notched tail + long triangular beak + straight body,
    which is fletching + arrowhead + shaft — it read as an arrow, not a
    bird ("it looks like an arrow with wings lol"). Redrawn with a
    convex fanned tail, a blunt beak, and notched wing primaries.
  - Reduced-motion: all decoration animation stops and the eagles hide
    entirely — it's ambient motion with no informational content. The
    cloud-poke effects stay (user-initiated, not ambient) minus the
    lightning flash, which is the one piece that could actually hurt.
  - **Clickable clouds + weather** (2026-08-15, second pass). Poking a
    cloud rolls a weighted outcome: drizzle / light rain / heavy rain /
    lightning / rainbow / a fairy who was hiding in it and flies away
    (rarest at 8%). This is the first real piece of the parked Weather
    VFX idea, built on the decoration layer rather than a new one.
    - Clouds had to MOVE to their own layer (`#bg-decor-front`,
      z-index 55) to be clickable at all: at z-index -1 the screen
      `<section>` covers the viewport and swallowed every click —
      verified, the hit target at a cloud's centre was `SECTION.screen`.
      Everything else stays behind the app. They're faint enough that
      drifting over a card reads as atmosphere.
    - Effects render in a third layer (`#decor-fx`, z-index 60, under
      hud.js's bolt layer) because a response to a click has to be
      visible OVER cards, unlike ambient background art.
    - The rainbow was rebuilt after you called the first one gross: six
      hard saturated SVG strokes read as a croquet hoop. It's now
      concentric radial-gradient rings (red outside, violet in — the
      real order), soft-blended, blurred, and masked to fade out before
      the legs reach the horizon.
  - **Scenery** (2026-08-15): a bottom-of-screen horizon — Jungle
    (free/default), River $250, Island $350. A SLOT, not a set
    (`DB.getScene/setScene`) — you can't stand on a jungle floor and a
    city street at once. Two depth bands per scene done with opacity
    rather than picked colours, so it works on every theme. NOT run
    through the busy-theme suppression: a bottom-anchored silhouette
    doesn't tile, so it can't fight a patterned theme the way stripes
    and drifting decorations do.
    - **City and Village were built and pulled the same day** on your
      call ("remove buildings from below — it used to be better"). Drawn
      as rectangles-plus-triangles they read as flat cut-outs next to
      the organic curves of the other three. Their markup and CSS are
      still in place; re-listing them in `SCENES` is all it takes to
      bring them back once they're drawn to the same standard.
    - **Mountains: tried and removed.** Added as a test distant range
      behind the scene, first tucked behind the canopy (read as
      foreground clutter), then raised to the ring's level and faded
      back. Cut on your call — fully removed, markup and CSS both, not
      left dormant like City/Village. Don't re-propose it as an
      improvement; it was built and judged.
      Final depth order: stars/moon → scene → clouds (front).
- ~~**Windows shows country-flag emoji as letter pairs, not flags.**~~
  Resolved as a side effect of two separate fixes: the 🇺🇦/🇮🇱/🇺🇸 labels
  were already stripped to plain text everywhere (2026-08-14), and the
  2026-08-15 "flags in shop" fix replaced the Shop's gradient bars with
  real drawn `.flag-swatch` art. No emoji-as-sole-identifier spot is
  left in Settings, Shop, or Inventory — all three already draw a real
  CSS swatch next to the text label.

## Ready to build, no blockers
Nothing right now — Tokens (earn, spend, Token Shop, course-price gating,
see BACKLOG.md) is done. Real-money purchases stay a labeled demo stub
until there's a payment account to wire a Payment Link to — that's a
you-side task, not a code blocker, see `shop/tokens.js`'s `buyPack()`.

## Shipped 2026-08-14 (detail in BACKLOG.md)
Shop/Inventory/economy rework, in one run:
- **Unified Shop** (`shop/store.js`) — three aisles: 🪙 Token packs ·
  🎨 Custom Shop · 💜 Support the Dojo. Wallet chip opens it on `$`,
  token chip on 🪙. The standalone Token Shop screen was deleted (its
  duplicated panes had already gone stale once).
- **Inventory** (`shop/inventory.js`) — tree on the left (Layout /
  Style / Colour theme), item grid, drag-a-tile-onto-the-slot to equip
  (click still works — drag doesn't exist on touch), live lobby preview
  bottom-right.
- **Sold with `$`:** layouts (Classic 200 / Cards 250 / Star of David
  350; Star free), base themes (rose+jade 500, violet 400,
  sepia+ember 250, ice 100, slate 50; Indigo Night + Frost free),
  palettes (300/300/400; Mixtape free). Awarded themes are listed but
  never sold — they show the rank instead.
- **Patron tiers now do something real:** −10/−20/−30% off every course
  price, applied through one helper used wherever the price is both
  shown AND charged.
- **Statistics** merged into Career, with an "All courses" + per-course
  menu instead of one flat 48-row list.
- Two bugs of mine caught by verification and fixed: layouts were
  purchasable but equipping them was ungated (Inventory handed out what
  the Shop sold), and a CSS truncation silently deleted the Shop's
  sidebar styles.

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

## Still open — needs your input (2026-08-14 batch)
- ~~**"Flags in shop should be fixed."**~~ Shipped 2026-08-15 — both
  ART and ORDER, per your answer. Art: palette cards now draw each flag
  as an actual 3:2 rectangle (`.flag-swatch`) instead of a full-bleed
  bar, with Israel's Star of David and the USA's dotted canton drawn
  back in (`flagArt()` in shop/store.js). Order: `HEX_FLAG_MODES` in
  core/lobby.js now lists Ukraine/Israel/USA before Mixtape, not after
  — the combo is built FROM the other two, so it reads better last.
- ~~**Preview for things you don't own yet.**~~ Shipped 2026-08-15. Every
  locked tile in Inventory (base themes, awarded themes, lobby layouts,
  star links, Star-of-David/spoke palettes) now previews on click instead
  of routing straight to the Shop — themes repaint the whole app via the
  same `Dojo.previewTheme` Settings already used, layouts/links/palettes
  show in the bottom-right mini-lobby panel. A banner appears with either
  "Buy — $X" (routes to Shop) or "Reach Rank N" for awarded themes, plus
  a Restore button. Nothing is written to DB until it's actually bought.
  Preview clears automatically on switching branches or leaving the
  screen, so it can never leak into the rest of the app. Also fixed a
  real bug this surfaced: awarded themes' old preview branch lived
  inside `slot.equip`, but the click handler intercepted locked tiles
  before `equip` was ever called — so that preview path was dead code,
  never actually reachable.
- ~~**New background-stripe shapes.**~~ Shipped 2026-08-15. Added two:
  Trellis (rank 11, replacing that rank's old 150-token reward — a
  60°/-60° diamond grid, wider and shallower than Lattice's 0°/90° one)
  and Sunburst (rank 17, replacing that rank's old 100-token reward —
  rays fanning from the top via `repeating-conic-gradient`, the first
  non-linear shape in the set). You said "either" on rank-earned vs.
  sellable, so these stayed rank-earned to match the existing five
  rather than standing up a new Shop category and pricing for just two
  items — sellable stripes are still on the table later if you want
  more of them.
- ~~**Buy `$` with Tokens (exchange rate).**~~ Shipped 2026-08-15. New
  "🔁 Exchange" tab under Tokens in the Shop, one-way only (no `$` →
  Tokens direction, same reasoning SHOP.md gives for keeping XP/money
  apart). Rate started at 50 Tokens = $1, then bumped 5x on request to
  **10 Tokens = $1** — a generous conversion now, not a loss-sink.
  `shop/tokens.js`'s `exchangeTokens()`/`exchangeQuote()`, wired through
  `shop/store.js`'s new `exchange` category.

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

## Blocked on the backend (Supabase — see the Firebase note at the top; one of these two labels is stale)
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
  **Overlay conflict — now largely solved, as of 2026-08-15.** This was
  flagged as the blocker: the lobby already carried two decorative
  layers (each theme's own `bg`, plus `bgStripe` on top), and three
  themes suppress the stripe entirely because two patterns fight. The
  US-decorations work above built the THIRD layer properly —
  `#bg-decor-layer` + `applyBgDecors`, with the same per-theme
  suppression rule stripes use. Weather VFX should be built ON that
  layer (a decoration id like any other) rather than inventing a
  fourth. What's still undesigned is weather-specific: which effects
  from the six-category reference list actually ship, whether clouds
  are clickable, and whether weather is bought or earned.
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
