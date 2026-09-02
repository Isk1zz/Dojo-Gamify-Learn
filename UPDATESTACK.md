# UPDATESTACK.md — staged asks, not yet done

Working queue, separate from BACKLOG.md (which is the full historical
record). Items here get **erased on completion**, not marked `[x]` and
left — BACKLOG.md is where finished work gets written up. This file is
just "what's still owed."

## ASKED 2026-09-02 — a document that tracks plan against reality

> «Я бы хотел документ так же который держит все планы и задумки и
> сопоставляет действительные апдейты и не сбеги»

A single page holding every plan and intention, set against what was
actually shipped. Recorded here so it does not get lost.

**What it is NOT: another file that says what the others say.** There
are already five documents claiming to describe this project, and this
session found four of them wrong:

| Document | What it still claims | What is true |
|---|---|---|
| `PROJECT.md` §7 | Garden thresholds 6/16/45/120 | 1/7/21/30/60 |
| `PROJECT.md` §5 | "the offline/no-build property" | offline study only on a device that has signed in; no fresh sign-in, no rewards, no forum |
| `LIBRARY.md` | "no points, badges, streaks or leaderboards" | XP and streaks shipped |
| `shop/ranks.js` | 795 free Tokens over seven ranks | 545 over five |

Every one of those was a stale copy of a number or a claim that lived
somewhere else too. So the document is only worth building if it
**derives** what it can rather than restating it — the same discipline
as `supabase/build-catalogue.js`, which reads its numbers out of
`library.js` instead of holding a second copy, and `check-schema.js`,
which fails the build when the two sides disagree.

Shape to settle when it is built:

- **Generated, not written**, wherever a fact already exists in code:
  thresholds, rewards, currencies, migration list, catalogue counts.
  A hand-typed number here becomes the fifth wrong document.
- **Plan vs. shipped** as the organising axis — every intention with its
  status, and for a reversal, the objection kept beside it. The pattern
  is already in `PROJECT.md`'s reversal blockquotes and in
  `docs/LEARNING-DESIGN.html`; this generalises it.
- **Where does it supersede?** `UPDATESTACK.md` is "what is still
  owed", `BACKLOG.md` is the historical record, `PLAN.md` and
  `BACKEND-ROADMAP.md` are forward-looking. A fifth file that overlaps
  all four makes the problem worse, not better. Decide what it replaces
  before writing it.

---

## QUEUED 2026-09-02 — four asks, in the order they were given

Recorded, NOT started. Forum step 3 is the one to resume on.

### 1. Forum step 3 — three figures in the profile  [PRIORITY]

Given (доотдано / получено за месяц / получено всего). The server side
is already done: `rep_status` returns all three and was verified when
step 2 closed. The work is client-side only.

One decision still open, from before the pause. Own figures come from
`rep_status` in a single call; SOMEONE ELSE'S do not — no RPC returns
another person's counts, and there is nowhere to open a foreign profile
from until the feed lands in step 4. Either build only your own now, or
write the public-figures RPC at the same time so step 4 finds it ready.
The recommendation was to do both: the RPC is small, and "what a
stranger may see" is a privacy decision better made on its own than
hurriedly in the middle of laying out a feed.

### 2. Sun glow is one-sided; add weather and tints

The click glow lights in one direction instead of evenly.
`shop/decor.js` — `pokeSun()` builds an `.fx-heat` element positioned
from the sun's bounding box; the asymmetry is in that element's CSS,
not in the placement maths.

Then the larger half of the ask: **weather conditions with colour
tints**, inspiration taken from the GTA weather page —
https://gta.fandom.com/ru/wiki/Погода

Worth noting before starting: the sky is already its own scene with
day/night driven by `DB.getSky()` and themes coupled through
`syncSkyToTheme`. Weather is a third axis on top of those two, so the
first question is how it composes with them — a tint that fights the
active theme would undo the appearance work rather than add to it.

### 3. Rank insignia is missing — and it is EVERY rank, not one

Reported as "Стажёр без иконки". It is wider than that: in Russian the
HUD chip renders an empty rounded rectangle for **every** rank.

`shop/ranks.js`: `RANK_EMOJI` is keyed by the English abbreviations
(INT, RA1, TCH...), but `RANKS` is passed through `I18N.resolve()`, so
by the time `insigniaSvg()` reads `rank.abbr` it holds the RUSSIAN
abbreviation ("СТЖ"). Every lookup misses and the `<text>` node is
never emitted. Confirmed live: the HUD holds `<rect>` and nothing else.

The fix is to key the emoji off something that does not get translated
— `rank.n` is the obvious candidate. Do NOT fix it by adding Russian
keys to the map: that leaves the same trap set for the next language.

### 4. "Бесплатный аккаунт" — change the word

`core/i18n.js` `ui.landing.hint`, and the fallback copy in
`index.html:529`:

> Бесплатный аккаунт — прогресс с вами на любом устройстве
> Free account — your progress follows you to any device

To be reworded because cross-device progress is to sit behind a support
subscription, which makes "бесплатный" false about the very thing the
sentence promises.

Two things to settle when this is done, not now:

- **The word is the smaller half.** If sync becomes paid, the sentence
  needs to say what the free tier actually gets, or it repeats the
  privacy-policy mistake — shipped text asserting something the product
  does not do. Both locales, and `index.html`'s fallback copy, which
  is a second copy of the same sentence.
- **The gating does not exist yet.** Sync is free for everyone today,
  and nothing in the code knows about a support tier
  (`economy.patron_tier` exists but only multiplies XP). Rewording
  ahead of the gate is fine; promising the gate is not.

---

## OPEN 2026-09-02: earning is server-side, the client is not wired yet

Server side is DONE and verified (0012, 0013, build-catalogue.js).
award_xp is revoked, the catalogue holds 242 items, claim_earning is the
only way to earn, and all four defences were proven against the live
database.

**The app does not call it yet.** XP, `$` and Tokens are still written
locally and still evaporate on the next economy pull. Six places grant
them today:

| Where | What | File |
|---|---|---|
| Chunk finished | 15-21 XP | `library.js:1506` |
| Topic exam | chunk sum x 0.7-1.5 | `library.js:1731` |
| Unit finished | `$` / Tokens / XP | `library.js:117-123` |
| Course finished | 10 Tokens | `library.js:135` |
| Final quiz | 120 XP scaled + 200 one-time | `library.js:1809,1831` |
| Review cards | 6 XP per genuinely-known | `library.js:2534,2596` |

DECIDED: the app waits for the server's answer rather than showing a
number and correcting it. Half a second of delay against a screen that
is always true -- and the whole reason this work exists is that the
screen was not. Offline, the claim QUEUES and goes out on reconnect, or
studying without a network would earn nothing.

Item ids are `chunk:<topicId>:<index>`, `topic:<topicId>`,
`unit:<number>`, `course:<courseId>`.

### Still open after the wiring

- **Flag 5 — the server does not score exams.** The percentage comes
  from the client, clamped to move the topic bonus only within
  0.7x-1.5x. Closing it means moving the answer key off the client,
  which changes how the app behaves with no network. Its own step.
- **Answers ship in `library/content/*/data_*.js`.** Anyone reading
  that file passes honestly as far as any server can tell. No ledger
  closes this; it is the ceiling on what these defences can achieve.
- **Repeatable work has no catalogue rows yet.** Reviews and final-quiz
  attempts legitimately repeat, so they need date-stamped ids
  (`review:<topicId>:<date>`) rather than pay-once. The generator does
  not emit them.
- **Rank rewards (795 Tokens across the ladder) are still client-side.**
  `shop/ranks.js` credits them locally, so they evaporate like the rest.
- **Unit reward tables are intro-cs only.** bike-a3 (unit 31) and
  philosophy (unit 41) pay nothing at unit level. Faithful to today's
  behaviour, but probably not intended forever.
- **`library.js:117` unit reward can grant Tokens** (`UNIT_TOKEN_REWARD`
  units 3 and 5). Tokens cost real money, so that path deserves a second
  look independently of where it is written.

## DECIDED 2026-08-27: country restrictions apply at PAYMENT, not signup

Asked for as "countries from registration should be according to payment
restrictions and laws". Settled the other way round, deliberately:
**anyone may register and study from anywhere; the country check belongs
at the moment money changes hands.**

Why not at registration: studying is free. Someone in a country you
cannot take payment from is still a legitimate user, and gating signup
would turn a *payment* restriction into a *product* restriction — losing
free users for a rule that does not apply to them. The legal barrier
exists at the transaction, so the check goes there.

**Nothing to build yet, and that is the finding.** `buyPack` in
`shop/tokens.js` is still a stub; there is no payment provider, no
processor account, and no real money path. A country gate today would
guard a function that takes no payments. When a provider is wired, the
gate goes in the same place as the price check — server-side, in the
RPC, never in the client — and the `profiles.country` field collected at
signup (optional, already in the schema) is what it reads.

**Two things to settle when that happens, neither of which is code:**
- Which restriction actually binds — your payment provider's supported-
  country list, sanctions/export rules, or consumer-law obligations in
  the buyer's country. These are different lists and the strictest wins.
- Whether a self-declared country is enough, or whether the provider's
  own geolocation/card-country signal is authoritative. Self-declared is
  trivially editable; the provider's is not. Flag 2 (never collect
  identity documents) still applies either way.

## 🚨 LAUNCH BLOCKERS — must be done before anyone real signs up

Two switches are deliberately set to the wrong thing for production,
because they are right for *now*. Both were conscious calls, and both
will look like oversights to whoever reads the code later, so they are
recorded here rather than in a comment nobody opens.

### 1. Email confirmation is OFF (turned off 2026-08-27)

**Turn it back on before public launch.** Supabase → Authentication →
Sign In / Providers → User Signups → "Confirm email".

Why it is off: there is no working email sender. Supabase's built-in one
is shared, rate-limited to a few messages an hour, and frequently never
arrives — so with confirmation ON, *nobody could sign up at all*, and
the protection it nominally provides was protecting no one.

The risk it normally guards is real and comes straight back the moment
email works: a typo'd address means a confirmation, and eventually a
password reset, landing in a stranger's inbox. That was the correct
objection when this was first raised, and it still stands — it is simply
not the binding constraint while emails do not send.

**Blocked on:** a domain name, then an SMTP provider (Resend's free tier
is 3,000/month and is the usual pick). Free senders will only deliver to
the account owner's own address until a domain is verified, which is why
a domain comes first.

### 2. Accounts are created by hand-written SQL

Fine while it is one person and a couple of testers; not a system. It
also has a trap that already bit once — see below.

**⚠️ Manual `auth.users` inserts must set the token columns to `''`,
not leave them NULL.** GoTrue (Supabase's auth service) is Go, and scans
`confirmation_token`, `recovery_token`, `email_change`,
`email_change_token_new`, `email_change_token_current`, `phone_change`,
`phone_change_token` and `reauthentication_token` into plain strings.
NULL is unreadable to it, and the symptom is the deeply unhelpful
**"Database error querying schema"** at sign-in — which looks like a
schema or permissions fault and is neither. Supabase's own signup path
sets these; a hand-written INSERT does not. Cost about ten minutes of
confusion on 2026-08-27.

---

## Queued 2026-08-27, session paused mid-Step-3 — six items

Session was paused with the account gate half-verified (a stale-lobby
`renderDayNight` crash was found live, not yet confirmed fixed) and a
list of asks that came in faster than they could be actioned. Recorded
here rather than lost.

1. **Password hashing — client side VALIDATED 2026-08-27, server side
   still unverified.** Audited every `password` reference across
   `core/auth.js`, `core/supabase.js` and `data/db.js`: the only ones
   that exist are the local variable read from the form and the two
   calls that hand it to `supabase.auth.signUp` /
   `signInWithPassword`. It is never written to localStorage (auth.js
   stores exactly two keys — the gate marker and a
   `{nickname, country}` pending-signup blob, no credential), never
   put in a profile field, never logged. So nothing in THIS codebase
   persists a password anywhere.

   What remains genuinely unverified is Supabase's own storage —
   `auth.users.encrypted_password` is expected to be a bcrypt hash,
   but that has not been looked at. Confirm from the dashboard or
   their docs before calling this settled.

2. **Sign-in/sign-up needs the same attack pass Step 1's economy check
   got.** That check proved a signed-in user can't rewrite `economy`.
   It did NOT test the auth surface itself: rate-limit behavior on
   repeated failed logins, whether the publishable key alone can
   enumerate whether an email is registered, session-fixation/replay,
   and what `core/auth.js`'s error-message mapping leaks (e.g. does
   "email already registered" on signup let someone confirm an address
   exists?). Do this before Step 3 is called done, not after.

3. **BLOCKING finding, not a request: the admin bootstrap is still a
   public string.** `SECRET_ADMIN_NAME` (`data/db.js`) is a plain
   constant in shipped, view-source-able JS — this is SECURITY AUDIT
   finding #2 below, still open. A request came in to replace it with a
   new secret string; **not done, on purpose** — a stronger string is
   exactly as publicly readable as the current one, so swapping it
   would look like a fix while changing nothing. The candidate string
   that was proposed is also now sitting in a chat log, which is its
   own reason not to use it as a real secret anywhere.

   **CONFIRMED EXPLOITABLE 2026-08-27, and worse than written above.**
   Validating this item found a SECOND public admin door that nothing
   had recorded: `admin/admin.js` line 51 carries
   `MASTER_ADMIN_KEYS = ["adminaccount", "admin613"]`, and the panel's
   "not authorized" screen accepts either one as a Master Authorization
   Key, calling `DB.setAdminStatus(p.id, true)` on a match.

   Demonstrated live, not reasoned about: a freshly created non-admin
   profile typed `admin613` into that challenge and came out with
   `isAdmin === true` and all seven cheat tools (`cheat-unlock-all`,
   `cheat-complete-all`, `cheat-add-xp`, `cheat-add-tokens`,
   `cheat-add-money`, `cheat-reset-reviews`, `cheat-reset-profile`)
   rendered and usable.

   Two things make this worse than finding #2 alone:
   - **`admin613` is already burned.** It was one of the cheat codes
     committed in `0a4a2d2` and is in git history permanently (see
     SECURITY AUDIT finding #3 below, which called those codes "inert
     on the deployed site" — that was true of `settings/codes.js`, but
     NOT of this constant, which ships).
   - **Removing the Settings cheat box did not close this.** That
     commit's message says the Admin panel gates "behind an isAdmin
     gate rather than a string anyone could type" — incomplete. The
     gate is `isAdmin` **OR** a typed public string, so the second door
     was left standing while the first was bricked up.

   This does not change the fix (server-side `isAdmin`, below); it
   raises the priority and adds `MASTER_ADMIN_KEYS` to the list of what
   that fix has to retire.

   **The real fix, and it's now buildable:** make `isAdmin` a
   server-side-only flag — an `economy`-style column with no client
   write policy, set only via direct SQL or a future admin RPC — instead
   of a client-recognized string at all. This retires
   `SECRET_ADMIN_NAME`/`ADMIN_CODES`'s bootstrap path entirely rather
   than patching it. Natural follow-on to Step 5 (economy RPCs), same
   pattern.

4. **Full cybersecurity pass on the Admin panel + "other parts."**
   Requested but not scoped. Given (3), should probably happen together
   with moving `isAdmin` server-side rather than as a separate pass on
   the current client-only version.

5. **Visual cleanup of background decorations** — birds, clouds, "and
   else." Read as: the ambient decoration layer (`#bg-decor-layer`,
   Stars/Eagles/Clouds/Moon, per BACKLOG's 2026-08-15 batch) wants a
   pass for restraint/visibility, not a functional bug. Not scoped —
   needs a concrete "too much of X" or "Y is distracting" to act on,
   same as every other vague visual ask in this file gets deferred until
   scoped.

6. **Process ask: a session dedicated fully to account dev, separated
   from everything else.** Stated reason: "sometimes its in the way" —
   account/backend work interleaved with unrelated fixes (the lobby
   switch, the cheat-code panel) mid-session made both harder to track.
   Worth honoring next time this thread of work resumes: one session,
   one focus, rather than folding backend steps into whatever else comes
   up.

## TOP OF STACK — Supabase backend port
**Scope note, 2026-08-27: this is not just the Forum's precondition
anymore.** Earlier framing (below, and in README/PROJECT.md) sold this
purely as "the Forum needs accounts." The actual target is broader:
`progress` moves off single-device `localStorage` onto the database, and
`economy` stops being a client-trusted flag — RLS is what makes course
ownership real instead of editable in devtools (see SECURITY AUDIT
finding #1 near the bottom of this file). The Forum is one consumer of
this backend, not the reason for it.

**Phase 1-3 scaffolding built, 2026-08-25 — not wired in yet.** Schema
+ RLS exist (`supabase/migrations/0001_init.sql`: `profiles`/`progress`
own-row RLS, `economy` READ-ONLY with no write policy at all, which
*is* the enforcement) and a client wrapper exists (`core/supabase.js`:
auth + pull/push for profiles+progress, `economy` pull-only). Neither
has touched the UI and neither has run against a real project — no
URL/anon key set, no sign-in screen, no localStorage→cloud migration,
no economy-mutation RPCs (award_xp/spend_tokens/claim_dividend/...).
Full breakdown in `docs/BACKEND-ROADMAP.md`'s status header. **Concrete,
ordered build plan (2026-08-27, replaces the old Firebase-flavored
"Suggested order")** is in that doc's "The account-system build plan"
section, right below the status header.

**Then verified against the actual source, same day** — see that doc's
"Plan verified against the actual code". Four findings, two of which
changed the plan:
1. Schema checked mechanically against `defaultProfile()`: **42/42
   fields map, zero orphans.** The highest-risk assumption held.
2. **Step 2 was already built** — `DB.exportData()`/`importData()` have
   existed all along, wired into Settings/stats/admin, and handle
   version safety better than the step specified. Rewritten from "build
   it" to "harden it" (add a pre-import auto-backup; import currently
   replaces everything with no confirmation and no undo).
3. ~~BLOCKING: the schema silently kills multi-profile.~~ **DECIDED
   2026-08-27: one account = one profile.** The schema was already
   written for this, so nothing changes there and Step 1 is unblocked.
   The switcher UI in `core/profile.js` goes when the login gate ships;
   `DB.listProfiles`/`createProfile` etc. all **stay**, because the
   admin panel is built on them and Step 4 needs to enumerate
   pre-existing local profiles to ask which one to claim. Full
   trace-of-what-it-touches in the doc's Step 0b.
4. `buy_course` has no server-side price to look up — prices live in
   the client-side course manifests. Needs a `courses` table, which
   creates a two-sources-of-truth problem; options in Step 5.

**STEP 1 DONE 2026-08-27 — the backend is live.** Project `Knell App DB`
(`sadelbwxiplsbisvyzsx`, eu-west-1, free). Migration ran, seeding
trigger verified (2 signups → 2/2/2 rows), and **the paywall hole is
provably closed**: signed in as a real user and ran the cheat attempts
straight at the REST API — a million tokens, both paid courses for
free, self-promotion to admin. All three changed zero rows, while a
control write to `progress` succeeded, proving RLS is selectively
configured rather than blanket-broken. Full table in the roadmap doc.

One implementation gotcha recorded there, worth knowing before writing
any sync code: **a blocked write returns HTTP 200 with `[]`, not 403.**
RLS hides the row from the UPDATE rather than erroring. Check the
returned row count, never the status code.

**Next: Step 3 (sign-in UI) or Step 2 (pre-import auto-backup).**
Neither is blocked on anything now.

**Settled 2026-08-16: the database is Supabase, not Firebase.** The two
labels had been contradicting each other in this file for weeks; asked
and answered. `docs/BACKEND-ROADMAP.md` is still written against
Firebase and carries a correction banner — its SHAPE (auth, accounts,
the legal pack, what has to be server-side) all still applies, but the
vendor specifics do not.

One consequence worth having: **the Blaze-plan problem disappears.**
Firebase needed a paid plan for Cloud Functions, which was the single
real caveat in that doc. Supabase runs Postgres with row-level security
and Edge Functions on the free tier, so the server-side enforcement the
Forum requires — the self-spend rule, the 10/user/month cap — can be
written without paying up front.

**Diia: SETTLED 2026-08-16 — not now.** None of it is needed to build
accounts or the Forum. A trigger map (what event makes each legal step
necessary, in plain language) is in . The short version:
nothing now; accounts need a privacy policy, ToS and a real delete
button; the Forum needs a reporting/takedown route; real money is best
started through a merchant of record rather than an entity; Дія.City
only matters with staff; Diia.ID identity verification — recommend
never, since the only reason for it (age-gating the Arcade) is gone.

Still needs YOUR decision before code starts:
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

**RESOLVED 2026-08-16.** This section used to flag that the older
"Blocked on the backend" heading said Supabase while the top said
Firebase. Asked, and Supabase is the real answer — so the older note
was right all along and the Firebase label was the stale one.

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
backend. So this lands squarely on the **TOP OF STACK Supabase port** —
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

## DECIDED 2026-08-16: reputation is a daily ALLOWANCE, not a balance

Supersedes every earlier reputation note in this file, including the
100:1 badge conversion and the Garden-pays-reputation model. Settled in
discussion; **not built** — see "why not yet" at the end.

### The model
| Piece | Rule |
|---|---|
| Earning | **Nothing.** No Garden dividends, no accumulation |
| Allowance | `5 + floor(rank / 5)` per day — R1 = 5, R10 = 7, R20 = 9 |
| Banking | **None.** Expires nightly, use it or lose it |
| Spending | Only on other people's posts. Never your own |
| Receiving | Accumulates within a **season**, then resets |
| Achievements | Seasonal thresholds pay **status, never currency** |

### Why each piece is that way
- **Allowance, not balance.** Proven design — Slashdot mod points are
  exactly this. Reddit and HN don't pay you to upvote either.
- **Garden stops paying.** Its dividends created a 44x spread between a
  new and a mature garden (10/day vs ~440/day at 26 topics), so no flat
  badge price could work at both ends. Worse, dividends gave a reason to
  farm plants that has nothing to do with remembering anything — working
  against the Garden's own purpose. Without them it goes back to being
  purely retention made visible.
- **Rank scales it, gently.** A flat allowance gives someone who has
  never studied the same voice as a year-long user, which is odd in a
  study app and free for lurkers. Rank is already "how much have you
  studied", is 20 tiers deep and slow to move. **The spread is kept
  under 2x on purpose** — recognition, not hierarchy. Scaling to 50/day
  at the top would rebuild the spread we just deleted and hand the forum
  to long-term users.
- **Non-banking.** A banked allowance is a hoard, and seniority wins
  again. Expiry is also what makes people read something *today*.
- **Achievements pay status only.** If a seasonal achievement granted
  badges or a bigger allowance, top receivers would gain more power to
  boost each other and compound into an elite by season three. Same trap
  as pay-for-visibility.
- **Seasonal reset on received.** Makes standing recent rather than
  historical, so old accounts don't permanently outrank newer ones.

### Allowance formula REOPENED 2026-08-27 — study-based, not rank-based

The table above says `5 + floor(rank / 5)` per day. Superseded in
conversation: the allowance should be **a daily amount derived from
completed UNITS, counting the chunks within them, and capped.**
Spendable on the Forum, same give-only rule as before.

Not yet a spec — three things need settling before it can be built:
- **The formula.** "Units, considering chunks within" needs actual
  numbers. A unit is worth what, and does a part-finished unit pay
  pro-rata by chunks or nothing at all?
- **The cap.** The whole reason the rank version used `5 + floor(rank/5)`
  was to keep the spread under 2x — a study-based figure scales with
  how much someone has finished, which is exactly the 44x-spread problem
  that killed Garden dividends. The cap is what prevents that, so it is
  load-bearing, not a detail.
- **Does it still not bank?** The decided model expires nightly. A
  study-based allowance is compatible with that, but it should be
  restated deliberately rather than assumed to carry over.

**Caught a real mistake, worth recording:** Step 5's first draft of
`0003_economy_rpcs.sql` included `claim_dividend` and `spend_wallet`,
written straight from `docs/BACKEND-ROADMAP.md`'s Step 5 table. That
table dates from 2026-08-13 and predates BOTH the dividend removal and
the `$`-sink removal — so following it would have rebuilt two
deliberately deleted systems in Postgres, where they would have been
much harder to notice than in JS. Spotted on review before the
migration was ever run. **The roadmap doc's Step 5 table is stale;
UPDATESTACK's later decisions win.**

### Confirmed 2026-08-16: no accumulation, and what the profile records
Points **cannot be accumulated to spend**. The daily allowance is
transferred to blogs/posts on the Forum, or it is gone. This settles the
old-balance question by dissolving it: there is nothing to migrate,
because a balance was never the thing.

The profile records three figures instead — the ledger IS the record:

| Figure | Side | Meaning |
|---|---|---|
| Points contributed | given | lifetime total you have handed to other people |
| Monthly awarded | received | what you were given this month (the season) |
| Total awarded | received | lifetime received |

Two consequences worth noting:
- **The season is a month.** "Monthly awarded" is the seasonal figure
  that resets; "total awarded" is the permanent one that does not.
- **Generosity is visible.** Tracking *contributed* alongside *received*
  means the ledger shows what you gave, not only what you got — a
  counterweight to a scoreboard that would otherwise only reward being
  popular. Worth keeping: it is cheap now and hard to add later without
  backfilled data nobody has.

### All economy questions are now SETTLED (nothing open here)
### Settled 2026-08-16: per-recipient and per-post caps
- **Max 10 points to any one user per month.**
- **Max 1 point per post.**

**Collusion is solved outright.** Two friends swapping can move at most
10 each per month, not ~150. It stops being a strategy rather than being
policed.

**Two properties that fall out of this for free, worth keeping on
purpose:**
- **You must read widely to spend at all.** An allowance of 5-9/day is
  ~150-270 a month, and no single author can absorb more than 10 of it.
  Spending it fully means engaging with **15-27 different authors**.
  That is real pressure toward breadth, and it came from the cap rather
  than from a rule saying "read widely".
- **Nobody can be carried by one superfan.** Since a single giver is
  worth at most 10, a high monthly total requires many distinct people.
  Popularity has to be broad, not deep.
- 1 point per post also means 10 points to one author requires them to
  have written **10 posts** that month — so the ceiling rewards
  sustained output, not one viral hit.

**Interaction to handle in the UI, not a flaw:** on a small forum the
allowance is mostly untouchable. Five active posters means at most 50
points can be placed all month against an allowance of ~150-270. The
number will look broken unless the UI frames it as "up to N per day" and
shows what is actually placeable, rather than advertising a balance the
forum has nowhere to put. Revisit the daily figure once posting volume
is known — it is far easier to raise later than to cut.

  person within a season.
- ~~Existing `wallet` balances.~~ SETTLED: nothing accumulates, so there is nothing to migrate. Old text: profiles carry accumulated dividends.
  Under an allowance model that stored number means nothing. Decide
  deliberately: retire it, or pay it out once as a launch bonus. Do not
  leave it sitting there looking authoritative — that field has already
  meant three different things (money, then reputation, now nothing).

### Why this is NOT built yet
The allowance only does anything when there is someone else to give it
to, and the Forum is blocked on accounts (`forum/FORUM.md`). Building
the giving machinery now would produce a daily allowance, expiring
nightly, spendable on nobody — and the self-spend rule has to be
enforced server-side regardless, so the client half would need rewriting
against the real backend anyway. This belongs in the same batch as
accounts, not before them.

## Docs & protection overhaul — pieces 1-4 done, 5 open (2026-08-16)

Requested: rethink the project files for the app as it actually is now,
cut what is dead, improve protection and optimization, and make the
plan documents state the real end goal.

**Done and pushed:**
1. **Dead weight** — deleted `games/` (held only GAMES.md: 426 lines on
   four removed games and a `story/` folder that never existed). Wrote
   `forum/FORUM.md`. Fixed 6 code comments pointing at deleted files.
   Bumped SW cache to v4 — stale-while-revalidate never re-fetches a
   DELETED file, so `games.js`/`games.css` would have sat cached forever.
2. **Identity** — `README.md` and `PROJECT.md` rewritten around the three
   loops (learn / retain / **contribute**, the third blocked on
   accounts). Both had the wrong app name and a `git clone` URL pointing
   at a repo that isn't this one.
3. **Stale refs** — 18 lines across 6 docs describing the Arcade API, `$`
   money, and the standalone Token Shop. `docs/ARCHITECTURE.md` mattered
   most: it is the contract new work is written against.
4. **Protection** — added `LICENSE` (all rights reserved, explicit).

**Security spot-check (no action needed):** profile names — the one
user-controlled string rendered — already go through `escapeHtml()` in
`admin/admin.js` and `textContent` in `core/profile.js`. Warning notices
were built the same way. No injection gap found in that surface.

### Piece 5 — OPTIMIZATION: dead CSS done, rest assessed
Deliberately left last so it is measured against a clean tree. Candidates,
none yet verified:
- `styles/` may hold rules for deleted screens (games.css is gone, but
  `base.css`/`shop.css` may retain `.sw-*`, `.gp-*`, arcade-era classes).
  **Verify against live DOM before deleting — a class can be built by a
  template string and never appear in markup.**
- `data/db.js` is ~1700 lines and holds `storyProgress` plus ticket
  helpers for a branch that no longer exists. The FIELD must stay
  (migrations never drop data); the dead *helpers* are the question.
- `index.html` loads every branch script eagerly; nothing is deferred.


**Done 2026-08-16:** 14 dead CSS rules removed (−34 lines), verified by
rendering every screen afterwards rather than by grep alone. Two traps
the audit had to survive are worth remembering for the next one:
constructed names (`tier-${n}` means `.tier-2` looks dead), and treating
docs as usage (a class only *discussed* in a .md looked alive — which is
precisely how the `.flag-*` set hid).

**Assessed and deliberately NOT done:**
- **`data/db.js` story/ticket helpers.** The `storyProgress` FIELD must
  stay — migrations never drop data, and that is a rule worth more than
  the few lines saved. The helpers are genuinely unused, but they are
  ~30 lines of a 1,700-line file and removing them changes no behaviour.
  Low value, non-zero risk.
- **Deferring script loads.** `index.html` loads ~30 files eagerly. On a
  local/offline app served from cache this buys close to nothing, and it
  would put the load-order contract (four bands, boot.js last) at risk
  for an unmeasurable gain. Not worth it without a real measurement
  showing a problem.

**Conclusion: optimization is closed.** The remaining candidates cost
more in risk than they return. The real performance characteristic of
this app is that it is a static, cache-first PWA with no build step —
that was the design decision that mattered, and it was made long ago.

### Still genuinely open (not doc debt)
- **Reputation collusion:** two accounts can trade reputation back and
  forth. The give-only rule does not prevent it. Decide before the Forum
  ships, not after.
- **Repo is public.** The licence records intent; it does not stop
  copying. Going private is the only step that actually does.
- `docs/BACKEND-ROADMAP.md` and `docs/CHANGELOG.md` were NOT swept in
  piece 3 — they are historical logs, and rewriting history to match the
  present would destroy their only value.

## Bats fly as a pack; Custom fixed for light themes (2026-08-16)
- **Bats fly as a swarm, in a random direction each time.** They fanned
  across 300°, which read as an explosion rather than a colony leaving a
  roost. Now one heading is rolled per poke and every bat follows it
  with a ±20° deviation, staggered so they string out. Verified over six
  pokes: six different headings, each swarm holding a 22–30° spread.
- **The pale rim is gone.** It made them read as lit from within, which
  nothing in the scene justifies. Visibility now comes from the fill
  being a flat dusk-violet — lighter than the sky, no light source
  implied. (True black was the first attempt and was invisible; a rim
  was the second and was wrong. The fill alone is the answer.)
- **Custom on light themes.** Reported as "only the dark one has colour
  vibes", and the cause was concrete: `.inv-tile-art` separated itself
  from the tile with `--bg-surface`, which sits ~2% from `--bg-card` —
  legible on a dark theme, invisible on white. Switched to
  `--bg-card-hover`, the one token that steps far enough in BOTH
  directions. Light themes additionally get shadows for depth (a dark
  theme leans on accent glow, which lands on white and vanishes), a
  tinted tree panel, and the stronger accent tint for equipped/active
  states.
  - **`data-theme-mode` is back**, and this time it has a real consumer.
    It was removed as dead when the sky stopped deriving from
    light-vs-dark. Using `data-sky` for this instead would work only by
    accident — the two are locked together today, but a sky is a scene
    and this is a colour mode.

## Poke the moon: bats. Sun spin fixed. (2026-08-16)
- **Sun spin direction fixed.** Poking swapped the rays' animation from
  the idle turn to the burst, which restarts rotation at 0deg — so the
  sun visibly jerked BACKWARDS before spinning. The rays now sit in two
  nested groups: the outer holds the idle turn, the inner takes the
  burst. They compose instead of replacing, so two turns are added on
  top of wherever the idle rotation had reached.
- **Poke the moon and a colony scatters out from behind it** — six bats
  and, once per poke at a random position in the pack, the Batman
  emblem. Outer div flies, inner svg flaps (the same two-element split
  the feather and startled eagle use, because one element can't run two
  transforms).
- **"From behind the moon, not out of it"** — bats do NOT go in the fx
  layer like every other effect. That layer sits above the app and
  painted them ON TOP of the moon, which reads as erupting out of it.
  They're inserted into the decoration layer BEFORE the moon in DOM
  order, so its disc hides them until they clear the edge. Two traps
  found doing it:
  - `.fx-bat` had `z-index: 1`, and a positioned element with a z-index
    paints above an auto-z-index sibling whatever the DOM order says —
    which put them back in front. Removed.
  - The layer's blanket `:where(#bg-decor-layer) > * { display: none }`
    swallowed them: they spawned in the right place, in the right
    order, invisible. Now `:not(.fx-bat)`.
- **The moon overlapped the vitals chips** (moon top 64px, strip bottom
  77px). The chips correctly won the click — they're UI — but that made
  the moon's upper third un-pokeable and clicking it opened the Shop.
  Measured and moved to 5.6rem; sun and the day/night switch share the
  offset so all three stay stacked. Verified zero overlap.
- Bats are slate-violet with a pale rim, not black: a true-black bat on
  a night sky is realistic and invisible. The first pass rendered
  `#17131f` and vanished a few px from the moon.

## Shop loses Money + Exchange; effects follow their cloud (2026-08-15)
- **Two aisles removed.** The Custom Shop had nothing left to sell once
  every cosmetic went free, and the Exchange converted Tokens into `$`,
  a currency that now buys nothing — a working conversion into a dead
  end is worse than no conversion. ~190 lines of pane builders and buy
  handlers deleted with them. The `ownsX`/`xPrice` helpers STAY: Custom
  still asks them what's unlocked, they just all answer yes now.
- **Cloud effects track their cloud.** Rain, lightning, rainbows and the
  low-cloud gags used to spawn at the cloud's position and stay put
  while it drifted off. I'd defended that as "what actually happens",
  which was a rationalisation — it read as detached because it was.
  They now follow by rewriting `left`/`top` each frame, NOT by applying
  a transform: every effect already animates its own `transform`, so a
  transform here would fight it; nothing touches left/top, so that
  channel was free. Verified all four types move in step with their
  cloud to the pixel. The fairy stays unanchored on purpose — she's
  leaving.
- **"First click switched to the same state" could NOT be reproduced**
  on the current build, from either a stored-day cold start or a
  wiped-storage true first launch; the first click flips correctly both
  ways. It matches the desync fixed a few commits earlier
  (`syncSkyToTheme` in `showLobby`), so it was most likely a cached
  build. Flagged rather than "fixed" — there is no change here to
  point at, and claiming one would be false.

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

## Renamed to "Knell" (2026-08-24)
The app is **Knell**, replacing "Unnamed App". A knell is the toll of a
bell marking a death — chosen for an app whose whole mechanic is
intervals coming due and a garden that wilts when they are missed.

**Why the rename happened at all,** because this is the part worth
keeping: the working name "CS Dojo" sits in an occupied and defended
corner. [CS Dojo](https://www.csdojo.io) is an established programming-
education channel, ClassDojo is a large edtech brand, and Coding Dojo
holds registered USPTO marks on **CODING DOJO** for *educational
services in computer programming* — the exact category — under an owner
that paid $52.8M for the company. Three collisions, all in the same
field.

Changed: `<title>`, the manifest's `name` and `short_name`, the
`apple-mobile-web-app-title`, the landing wordmark, the lobby wordmark,
the welcome modal, the `CS Dojo —` banner comment atop 34 source files,
and the README / PROJECT headings. The wordmarks lost their `&nbsp;` —
that existed to hold a two-word name apart, and the accent span now
wraps the whole single word instead of its second half.

**Deliberately NOT renamed, and none of this is tidiness debt:**
- **Every localStorage key.** `unit6-dojo-db` still addresses the entire
  progress database, `cs-dojo-lang` the language, `cs-dojo-sim-*` the
  mock-exam scores. Renaming a key does not migrate data, it orphans it
  — every profile and every review schedule would vanish silently on the
  next load. All three now carry a comment saying so, because this looks
  exactly like leftover branding to anyone tidying up. The name in a key
  is an address, not a label.
- **The `Dojo` JS global** (247 references). An internal identifier is
  not use of a mark in commerce, and renaming it buys nothing visible.
- **The `cs_dojo` directory and the repo.** Same reasoning as last time.
- **The history entries in this file.** A changelog that rewrites what
  the app used to be called is not a changelog.

`sw.js`'s CACHE_VERSION *was* renamed, to `knell-v1`. That one is safe
precisely because it is a cache: activate deletes everything that isn't
the current version, so a rename is just a bump — which index.html and
the manifest needed anyway.

Still open: the name has NOT been cleared. Search turned up nothing in
software, but that is not clearance. Before any logo or store listing,
run USPTO, EUIPO and ILPO in classes 9 and 41, and check the domain.

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

## Ready to build, no blockers (rewritten 2026-08-24)
Four things, agreed or found, none waiting on anything.

**1. Intro to CS in Russian — the big one.** Agreed 2026-08-24: the
whole course, one module at a time. Ten modules, ~137 chunks, on the
order of 60,000 words of technical translation. The machinery is done
and proven — `core/i18n.js` resolves `{en, ru}` bags, `check-content.js`
runs a full pass per language, and the A3 course went through it
end to end. Suggested start: Databases (m6, unit 5), the only large
module already written to CONTENT-MODEL.md and therefore the honest
calibration sample. This is weeks of writing, not an afternoon.

**2. `profile.tickets` is dead state.** Written and migrated by
`data/db.js`, surfaced in Admin, and read by nothing since the Arcade
became the Forum. Removing a persisted field needs its own commit and
its own migration thinking — deliberately left out of the rename.

**3. A free way in — now urgent, and this is new.** As of 2026-08-24
BOTH courses cost Tokens (intro-cs 700, bike-a3 100), so there is no
longer any route into the app that does not pass a purchase. A first
visitor cannot reach the chunk → predict → explain → quiz loop at all,
which is the only thing that would convince them. See item 4 under
Popularization below; it stopped being a nice-to-have the moment A3 was
priced.

**4. Two open facts on the A3 course.** Electric bicycles and scooters
in Israel have required registration and a plate since 1 August 2024 —
found while fact-checking, not verified to the primary source and not in
the course. And the name **Knell has not been cleared**: search turned
up nothing in software, which is not clearance. USPTO, EUIPO and ILPO,
classes 9 and 41, before any logo or store listing.

Real-money purchases remain a labeled demo stub until there's a payment
account to wire a Payment Link to — a you-side task, not a code
blocker, see `shop/tokens.js`'s `buyPack()`.

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

## PENETRATION TEST (2026-08-27) — the backend, attacked live

Full adversarial pass against the real Supabase project, signed in as a
normal non-admin user, hitting the REST/RPC API directly (not through
the app's wrappers — an attacker skips those). **No exploitable
vulnerability found.** This is the counterpart to the 2013-era finding
#1 below ("the whole paywall is client-side only and bypassable") — that
was true of the localStorage app and is now false of the backend.

**Everything that was attacked and held:**
- **Economy writes** — direct PATCH (tokens/is_admin/wallet/charge),
  INSERT, UPSERT (merge-duplicates), DELETE of the row. All refused:
  PATCH/DELETE change 0 rows, INSERT/UPSERT 403 RLS violation. Balance
  untouched.
- **award_xp** — int-max capped to 200; overflow, float and 0 rejected
  with real errors; string coerced safely.
- **buy_course** — SQL injection in `course_id`, null, array and number
  types all parameterised to "no such course"; no injection.
- **Cross-user (horizontal) access** — reading every economy/profile/
  progress row returns ONLY the caller's own; writing to a fabricated
  victim uid changes 0 rows. RLS scopes every read and write.
- **The `courses` price table** — readable (the buy modal needs it),
  but PATCH to make a course free changes 0 rows and INSERT is 403;
  price stayed 700.
- **delete_account** — takes no argument, so it cannot be aimed at a
  victim (`delete_account(user_id)` is "function not found").
- **auth.users** — not reachable through PostgREST at all.
- **Concurrency** — 10 simultaneous buy_course calls on a 100-token
  balance for a 100-token course: exactly ONE succeeded, nine
  "already_owned", ended at 0 tokens, owned once. No double-spend; the
  single-statement check-and-debit held under a real race.
- **Anon (no token)** — economy read empty, buy_course 401.
- **JWT forgery** — alg:none, tampered payload with kept signature,
  role→service_role escalation, empty signature: every one 401. The
  publishable key used as a bearer token is treated as anon and sees
  nothing. Signatures are validated; the signing secret is not in the
  client, so a forgery cannot be produced.

**One informational finding, fixed (0006_lock_require_uid.sql):**
`require_uid()` was callable directly by authenticated users despite
0003 intending it internal. It returns only the caller's own
`auth.uid()`, so it disclosed nothing and could not be aimed at anyone
— hygiene, not a breach. Revoked from `authenticated`; the SECURITY
DEFINER functions that call it are unaffected (they run as the owner).

**Note on scope:** this tested the DATA plane (RLS, RPCs, JWT). The auth
plane's own rate-limits and email-enumeration behaviour (queued item 2)
were not part of this pass and are still owed before launch.

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

## Still open — needs your input (2026-08-27 batch)
- **Lobby flashes cards → star topology on first paint — reported
  again, not yet diagnosed.** A near-identical bug ("first ever opening
  uses cards not star") was fixed in Batch 43 (`core/profile.js`
  repainting the lobby after profile creation), but this report is
  worded differently — an EXISTING profile's first paint of a session
  visibly switches layout after the fact, not a brand-new profile. Not
  yet confirmed whether Batch 43's fix has a gap or this is a distinct
  cause (e.g. a second render pass using a different default before
  `DB` finishes loading the real `lobbyStyle`).
- **First-time onboarding: offer topology/style customization instead
  of silently defaulting.** Ask, verbatim: explain briefly why, do it in
  a few minimal steps, don't bombard with data, mini chunks, appealing
  choices. Not started. Natural pairing with the bug above — whatever
  causes the flash is also the moment a first-run picker would need to
  hook into, so worth scoping together rather than sequentially.

## Shipped 2026-08-27 — course audit + About-this-course
Asked: validate every reference/unit across the newly-built Cicero
topic 3, answer "what does this course sell on" for all three built
courses, and add an About section for each. Full account in the git
log (`About-this-course everywhere it's needed, plus the bugs that
surfaced fixing it`) and `BACKLOG.md`; summary here since this was a
multi-part ask:
- One mis-cited reference found and fixed (*De Re Publica* 6.12 → 6.15),
  mirrored into `docs/research/cicero.md`.
- `about` manifest field wired end-to-end (registry.js/KNOWN_KEYS, new
  i18n key, content for all three courses, both languages), rendered on
  unit-select AND the pre-purchase buy modal (the first cut missed the
  buy modal — reported and fixed same session).
- Two bugs the buy-modal wiring surfaced, both fixed: unit count read 0
  for a lazy/unloaded course (intro-cs) at buy time; Garden force-opened
  an empty course plot on first paint. Sign-contract modal also gained a
  line explaining WHY signing matters (it plants the course's first
  Garden seed).

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

## Blocked on the backend (Supabase — confirmed 2026-08-16)
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
- **Pentagram topology — new idea, 2026-08-27, image reference only.**
  A five-point star drawn as one continuous stroke (five nodes, each
  connected to the two non-adjacent ones — the same "connect every
  vertex by skipping one" construction as the hexagram in
  `starLinks: "hexagram"`, one point fewer). Not scoped: no node count
  vs. the current six/seven-tile lobby has been reconciled, and
  `layoutLobbyRadial` (core/lobby.js) would need a pentagram-specific
  angle+link table the way hexagram already has its own. Closest
  existing precedent to build from: `starLinks`'s hexagram mode.
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
   that to a downloadable image (canvas) with the Knell mark turns every
   pass into an organic post. This is the single most social-shaped
   thing the app already almost has. The A3 mock exam raised the ceiling
   on this one: "passed the theory, 28/30" is a card someone posts to
   people who are also about to sit it, which the CS course has no
   equivalent of.
2. **Open Graph / Twitter card meta tags.** `index.html` has a
   `description` but no `og:image`/`og:title`. Right now every link
   anyone shares unfurls as a bare grey box — actively costs clicks.
   Near-zero effort, pure upside.
3. **A real favicon/app-icon audit + install prompt polish.** It's
   already an installable PWA; "add to home screen" is a retention
   mechanic that costs nothing extra to lean into.

**Medium effort, high ceiling — except #4, which is now the top of this
whole list:**
4. **A free way in — PROMOTED 2026-08-24, was "medium effort".** Both
   courses are priced now (intro-cs 700, bike-a3 100), so a stranger
   meets a purchase before they meet the product. Nobody buys a study
   app on a description; they buy it after the chunk → predict →
   explain → quiz loop has landed once. Right now nothing lets that
   happen.
   Cheapest shapes, in order: one free unit inside a paid course; or a
   free trial course of a handful of topics; or make the A3 mock exam
   playable unowned, since it is self-contained, needs no progress, and
   is the most convincing single screen in the app. Whichever — the
   requirement is that a first visit reaches real content without a
   purchase.
5. **Deep links to a specific topic/unit** (`?topic=...`). Makes the
   app linkable from a video description or a comment, instead of only
   ever "go to the homepage and find it."
6. **A public "what I learned" streak/stat page** — needs the backend,
   so parked behind the account work, but worth designing toward.

**Worth noting honestly (updated 2026-08-24):** there are two courses
now, not one, and the second one changes the picture. A3 has something
the CS course does not — an audience with a date, a fee and a real
consequence, all of whom are already searching for exactly this. That is
a distribution channel in a way "learn CS" never was.

What has NOT improved is the way in. Both courses are priced, so a
stranger meets a purchase before they meet the product. #1 and #2 below
still pay off before anything else, and #4 moved from "medium effort" to
"the thing standing between the app and its first user".

## Long-term roadmap

**Plan shifted 2026-08-27: the online database is no longer a someday
item waiting on a person to be free — it's the active plan.** The old
framing below ("offline/local-only on purpose... waits on that") was
written when nobody on the team knew databases and a friend who did was
the whole plan. That's stale: Phase 1-3 Supabase scaffolding is already
built (see TOP OF STACK) precisely because building toward it started
without waiting for that friend. Progress storage AND system
enforcement — not just the Forum — are now expected to live server-side:
`localStorage` stays the offline cache and first-run experience, but
the source of truth moves to Supabase, and course ownership stops being
a client-side flag anyone can edit in devtools (SECURITY AUDIT finding
#1, below). Everything under "Blocked on the backend" is blocked on
*wiring*, not on the vendor decision or on someone learning databases —
both of those are already settled.

- Finish out the web app, then port to iOS and Android.
- ~~Real account system + online database — currently offline/local-only
  (see landing page copy) on purpose, because nobody on the team knows
  databases yet. A friend who does is expected to be free "later" — this
  whole line (accounts, online DB, and everything above that's "Blocked
  on the backend") waits on that, rather than being half-designed now by
  someone who'd be guessing at the DB side.~~ Superseded by the note
  above.
