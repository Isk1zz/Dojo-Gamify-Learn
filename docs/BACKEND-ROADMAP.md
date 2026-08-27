# BACKEND-ROADMAP.md — backend port, accounts, and the legal pack

> ## ⚠️ VENDOR CORRECTED 2026-08-16 — the database is **Supabase**, not Firebase
>
> This document is written throughout against Firebase (Auth + Firestore +
> Cloud Functions). That was never confirmed, and when finally asked, the
> answer was **Supabase**. The older note elsewhere in the stack was the
> correct one.
>
> **What still applies:** everything about SHAPE — that accounts are the
> precondition, what has to be enforced server-side rather than in the
> client, the legal pack, the migration path off `localStorage`, and the
> data model. None of that is vendor-specific.
>
> **What no longer applies:** Firestore's document model (Supabase is
> Postgres with row-level security), and — usefully — **the Blaze plan
> problem**. Needing a paid plan for Cloud Functions was the single real
> caveat here. Supabase runs Edge Functions and RLS on the free tier, so
> the server-side rules the Forum depends on (self-spend, the 10/user/month
> cap) can be written without paying up front.
>
> Not rewritten wholesale on purpose: the reasoning is the valuable part
> and it survives the vendor swap. Translate as you implement.


Status: **Phase 1-3 scaffolding built, 2026-08-25.** Schema and RLS
exist (`supabase/migrations/0001_init.sql`), client plumbing exists
(`core/supabase.js`), neither is wired into the UI yet and neither has
been run against a real project. Written 2026-08-13.

**What exists now:**
- `profiles` and `progress` tables, RLS scoped to own-row read/write.
- `economy` table, RLS scoped to own-row READ ONLY -- no write policy
  exists at all, which is the enforcement (see the migration file's
  comments). This is Phase 3 done first, not deferred to "later."
- `handle_new_user()` trigger seeds all three rows at signup.
- `core/supabase.js`: auth (signUp/signIn/signOut/session) and
  pull/push helpers for profiles + progress. `economy` only has
  `pull()` -- no `push()`, on purpose.

**What does NOT exist yet:**
- SUPABASE_URL / SUPABASE_ANON_KEY are blank in core/supabase.js.
- The migration has not been run against the live project.
- No sign-in UI. core/profile.js is untouched.
- No localStorage -> cloud migration path.
- No economy-mutation RPCs (award_xp, spend_tokens, claim_dividend, ...)
  -- the vault exists, nothing can be put in or taken out of it yet.

This is the roadmap for moving Dojo off "localStorage on one device" and
onto real accounts with a real database, plus what's actually required
to operate it as a registered product in Ukraine.

Read the **Flags** section at the bottom before starting Phase 1. Two
items there change what you should build, not just how.

---

## The account-system build plan (2026-08-27)

This supersedes Phases 1/3/4 below wherever they still speak Firebase —
those stay for the reasoning, this is the concrete, ordered, Supabase-
real version of the same plan. Every step names what "done" looks like,
so it's checkable, not just describable.

**Four things every step below is weighed against, in this order when
they conflict:**

1. **Never lose a user's data.** Nothing overwrites a profile without a
   proven-good copy existing somewhere else first. This is Step 2, and
   it comes *before* sign-in exists at all — an export button that
   works on the current, local-only app is a backup mechanism whether
   or not accounts ever ship.
2. **Safety.** The client never gets to assert anything about money.
   Every `economy` mutation is a `SECURITY DEFINER` Postgres function,
   never a table write — that's the whole point of the schema already
   in place. Passwords never touch anything but the one `signUp`/
   `signIn` call; nothing else in this app should ever see one.
3. **Usability.** Offline/local play keeps working, unmodified, at
   every single step until the last one. A person who never signs in
   should never notice any of this exists. Signing in is a *claim* on
   progress you already have, never a wipe-and-restart.
4. **Efficiency.** Batch writes — once per study session, not once per
   click. Supabase's free tier (500 MB DB, 5 GB bandwidth/mo, 50k MAU)
   has far more headroom than Firebase Spark ever did, but "don't write
   on every keystroke" is good practice regardless of quota.

### Step 0 — Decide what you actually collect
**Yours to decide, not mine — hours, no code.** Recommendation from
Phase 0 below still stands: email + password, nothing else. No phone,
no country, no documents, unless something forces it. This has to be
settled before Step 3 (the sign-in form's field list follows directly
from the answer).

### Step 1 — Stand up the real Supabase project
Create the project (free tier), run `supabase/migrations/0001_init.sql`
against it for real — it has never touched a live database — and fill
in `SUPABASE_URL`/`SUPABASE_ANON_KEY` at the top of `core/supabase.js`
(both are safe to commit; the anon key is meant to be public, RLS is
the actual protection). **Done looks like:** a throwaway test account
can sign up, and `select * from profiles/progress/economy` in the
Supabase dashboard shows three seeded rows with `handle_new_user()`'s
defaults — proving the trigger and RLS both fired correctly before any
app code depends on them.

### Step 2 — Local export/import, BEFORE anything touches real accounts
The backup mechanism has to exist first, not as an afterthought bolted
onto migration. A "Download my data" button in Settings that serializes
the current `DB` profile to a JSON file the user can save anywhere —
this is useful **today**, with zero accounts involved, and it's the
thing that makes every later step reversible: if a cloud migration ever
goes wrong, this file is the independent, user-held copy of record. An
"Import" counterpart restores from that file, validated against the
same shape `data/db.js`'s `migrate()` already checks. **Done looks
like:** export → wipe the profile → import round-trips every field
losslessly, verified against a real profile with study history, not an
empty one.

### Step 3 — Sign-in UI
Built into the existing `core/profile.js` modal — it already owns "who
are you" and the multi-profile concept, so this is a new tab on
something that exists, not a new screen. Email/password only (per Step
0). **Anonymous-first, matching Phase 1 point 4**: nothing forces
sign-in before studying — a "Save my progress" prompt after a real
accomplishment (finishing a topic, hitting a streak) is the natural
moment to offer it, not a wall on first launch. **Done looks like:**
sign up, sign in, sign out, and a wrong-password error all work against
the real project from Step 1, on a throwaway test account.

### Step 4 — One-time upload migration (the "claim" flow)
On first real sign-in, if `localStorage` has a profile and the cloud
row is still at `handle_new_user()`'s zeroed defaults, upload the local
profile once. **The local copy is never deleted** — Phase 1's rule,
restated because it's the one most tempting to "clean up" later. Guard
against double-upload (a second sign-in on the same device must not
re-clobber cloud progress with a now-stale local snapshot) by checking
a `migrated_at` marker before ever pushing. **Done looks like:** a
profile with real study history migrates once, correctly, and a second
sign-in from the same browser is a no-op rather than a second upload.

### Step 5 — Economy RPCs (the step that actually closes the paywall hole)
Everything before this is plumbing; this is the payoff. One
`SECURITY DEFINER` Postgres function per mutation the client currently
performs directly against `localStorage` in `data/db.js`/`garden/
garden.js`/`shop/tokens.js` — each validates its own business rule
server-side instead of trusting whatever the client sends:

| RPC | Mirrors (client-side today) | Validates |
|---|---|---|
| `award_xp(amount)` | `addXp` | Per-call cap, so a forged huge value can't jump rank in one call |
| `add_wallet` / `spend_wallet` | `addMoney`/`spendMoney` | Balance never goes negative; **no path exists that converts `$` into `tokens`, ever** — see Flag 1 |
| `claim_dividend` | `claimDividends` | One claim per 24h server-side (`last_dividend_claim`), not client-timed |
| `spend_tokens` / `buy_course(course_id)` | `spendTokens`/`buyCourse` | Price is looked up server-side from a Postgres table, never trusted from the client; balance checked atomically so two concurrent buys can't both succeed off one balance |
| `grant_tokens(amount, receipt_id)` | `buyPack` (currently a demo stub) | Only callable from a payment-webhook-verified context once real payment is wired — never directly by the client |

**Done looks like:** with the client's Supabase session, a direct
`update economy set tokens = 99999` fails (no policy permits it — this
is already true today, verifiable now, before any RPC exists), while
`select buy_course('bike-a3')` succeeds exactly when the balance
actually covers the price and fails otherwise, tested against both
sides of that boundary.

### Step 6 — Ongoing sync, merge-safe
Once signed in, push `progress` in a batch at natural checkpoints
(finishing a chunk, finishing an exam, closing the tab) rather than on
every state change. **Merge policy is per-field, not whole-document
last-write-wins** — two devices studying different topics must union,
not overwrite:
- `completed_topics`, `completed_chunks`, `seen_quotes` — set union.
- `reviews` (the SM-2 schedule) — per-topic, keep whichever side has
  the later `due` date; this is the single most valuable thing a user
  owns and the one field where silently picking the wrong side is
  worst.
- `stats`, `streak` — additive counters merge by max/sum as the field
  implies; never a blind overwrite.
- Settings-shaped fields (`theme`, `lobby_style`, etc., on `profiles`)
  are fine as last-write-wins — cosmetics, no data loss risk.
A `cloud sync failed, working locally` notice (same honesty pattern as
the existing `db:saveFailed` warning) covers the offline case — sync
failing must never block studying. **Done looks like:** two browser
sessions signed into the same test account, each completing a
*different* topic while offline from each other, reconcile to both
topics completed after both come back online — not one clobbering the
other.

### Step 7 — Legal pack, in parallel, before real payments go live
Privacy policy, ToS (including "virtual currency has no cash value,
non-refundable" — Flag 1), a real account-deletion path that actually
deletes (`auth.users` cascade already covers this at the schema level —
the missing piece is a UI button and confirmation flow, not new
schema), and data export (Step 2's button already satisfies GDPR Art.
20 for free, having been built for backup reasons first). Full checklist
in Phase 5 below — nothing there has changed, only that Step 2 already
covers one line item early.

### What "done" looks like overall, and the rollback plan
The whole plan is reversible at every step because Step 2 exists before
Step 3: at any point, a user's local export is the ground truth
independent of whatever the cloud side is doing. If a migration or sync
step is ever found to corrupt or lose data post-launch, the response is
"re-import from the last export," not "hope the last cloud write was
the good one." Consider requiring a fresh export immediately before
Step 4 runs for any given user, as cheap insurance for a step that only
ever needs to work once per person.

---

## What this actually fixes (and what it doesn't)

The security audit (UPDATESTACK.md) found that the whole paywall is
bypassable — anyone can edit localStorage and unlock every course.
That's not a bug; it's what "static site, no backend" means.

**A backend is the fix — but only if the server decides things.** Moving
data to Firestore while the client still decides "you own this course"
changes nothing at all. The thing that makes the paywall real is
**Firestore Security Rules** (Phase 3), not the database itself. If you
do Phases 1–2 and skip 3, you've added complexity and fixed nothing.

---

## Phase 0 — Decide what data you actually need (before any code)

Every field you collect is a permanent liability. The current ask was
"password, email, phone, country, documents." Work through this list and
justify each one, because the answer changes your legal obligations:

| Field | Needed for what? | Cost of holding it |
|---|---|---|
| Email | Login, password reset, re-engagement | Low. Standard. |
| Password | Login | Low **if** you never store it yourself (Firebase Auth handles hashing — never roll your own) |
| Phone | SMS login, or 2FA | Medium. Firebase phone auth costs money past a small free quota |
| Country | Pricing/tax, content localisation | Low — but derive from billing, don't ask |
| **Documents (passport/ID)** | ??? | **Very high. See Flag 2.** |

**Recommendation:** start with **email + password only**. Firebase Auth
gives you that plus Google/Apple sign-in for free. Add phone only if you
need 2FA. Do not collect documents unless something below forces it.

---

## Phase 1 — Firebase Auth

Free tier (Spark) covers this comfortably.

1. Create a Firebase project, enable **Email/Password** and **Google**
   sign-in providers.
2. Add the Firebase JS SDK. It's the first real dependency this project
   will have — the "no build step, no dependencies" property in
   ARCHITECTURE.md ends here. That's a deliberate trade, worth writing
   down when it happens.
3. Add a sign-in screen. The existing profile modal
   (`core/profile.js`) is the natural place — it already owns "who are
   you" and already has the multi-profile concept.
4. **Keep local-only mode working.** Anonymous/offline use is a real
   differentiator (see the landing copy). Firebase Anonymous Auth can
   bridge this: play offline, then "claim" the account later and keep
   your progress.

**Migration path for existing users:** on first sign-in, if localStorage
has a profile and the cloud has none, upload it. That's a one-time
`localStorage → Firestore` copy. Don't delete the local copy.

---

## Phase 2 — Firestore data model

The current shape (`data/db.js`'s `defaultProfile`) maps over almost
directly. Suggested layout:

```
users/{uid}
  profile:      { name, avatar, country, createdAt }
  progress:     { completedTopics[], completedChunks{}, reviews{}, stats{} }
  economy:      { xp, wallet, tokens, inventory[] }      <-- SERVER-OWNED
  settings:     { theme, bgStripe, lobbyStyle, hintsEnabled }
```

Notes that matter:

- **Split `economy` into its own document.** It's the only part that
  must be write-protected (Phase 3). Mixing it with settings means every
  theme change fights the same rules.
- `reviews{}` (the SM-2 spaced-repetition schedule) is the single most
  valuable thing a user owns. Back it up first, migrate it carefully.
- Firestore charges per **document read**, not per field. Keep these as
  ~4 documents per user, not one document per topic — 48 topics × per-read
  costs would burn the free quota fast.

**Free tier (Spark) limits:** ~1 GiB stored, 50K reads/day, 20K
writes/day. At ~5 KB/user that's plenty of headroom on storage; the
read/write quota is the real ceiling. Batch writes (one per session, not
one per chunk) and cache aggressively.

---

## Phase 3 — Security Rules (THE phase that matters)

This is where the paywall becomes real. Rules run on Google's servers
and the client cannot bypass them.

Principles:

1. **A user may read their own data, and nothing else.**
2. **A user may NOT write their own `economy` document.** Not XP, not
   tokens, not `inventory` (course ownership). If the client can write
   it, the client can cheat it, and you're back where you started.
3. Progress writes (`completedTopics`, `reviews`) can be
   client-writable — worst case someone cheats their own study
   schedule, which harms only them and has no monetary value.

**The hard part:** if the client can't write `economy`, something
trusted must. That means server code — and **Cloud Functions requires
the paid Blaze plan** (pay-as-you-go). It has a generous free monthly
allowance, but it needs a card on file. This is the single biggest
"free tier" caveat in this whole plan.

Options if you want to stay strictly free:
- **(a)** Accept client-written XP (cheatable, but XP has no cash value)
  and only server-protect `inventory`/course ownership via purchase
  receipts.
- **(b)** Defer real purchases; keep the demo stub until Blaze is
  acceptable.
- **(c)** Use Firestore Rules alone with tight `request.resource.data`
  validation (e.g. XP may only increase, by ≤ N per write). Weaker than
  server code, far better than nothing, and genuinely free.

Recommendation: **(c) now, Cloud Functions when real money starts.**

---

## Phase 4 — Sync & offline

Don't lose the offline-first property; it's a real strength.

- Firestore has built-in offline persistence — enable it.
- Conflict policy: **last-write-wins per document** is fine for
  settings, **wrong for progress**. Two devices studying different
  topics must merge, not overwrite. Keep `completedTopics` as a set
  union, not a replace.
- The existing `db:saveFailed` warning (Batch 42) should get a sibling
  for "cloud sync failed, working locally" — same honesty principle.

---

## Phase 5 — The legal/compliance pack

Required regardless of Diia, the moment you have accounts + payments:

- [ ] **Privacy Policy** — what you collect, why, how long, who else
      sees it (Google/Firebase is a processor), how to delete.
- [ ] **Terms of Service** — including that virtual currency has no
      cash value and is non-refundable (see Flag 1).
- [ ] **Cookie/storage notice** — you use localStorage for function;
      analytics would add consent requirements.
- [ ] **Account deletion** — legally required in most jurisdictions and
      an app-store requirement. Must actually delete, not deactivate.
- [ ] **Data export** — GDPR Art. 20 if you have any EU users.
- [ ] **A named data controller** — a real legal entity (ФОП or TOV),
      which is where Diia registration comes in.
- [ ] **DPA with Google** — accept Firebase's data-processing terms.

### DECIDED (2026-08-13): Diia scope = (a) + (c)

Answered by the owner: **(a) register a business entity via Diia**, and
**(c) integrate Diia.ID / Diia.Signature for identity verification**.
Дія.City (b) is NOT in scope.

What each half implies, to pick up next session:

**(a) Entity registration** — this is the prerequisite for everything in
Phase 5: you need a legal entity to be the named data controller, to
take payments, and to sign a DPA with Google. Straightforward; an
accountant handles it. Decide ФОП vs TOV with them (tax treatment of
digital sales to non-UA customers is the deciding factor).

**(c) Diia.ID integration** — this is the bigger one, and it interacts
directly with Flag 2 below. Integrating government identity
verification means you WILL be handling verified identity data, which
is exactly the liability escalation Flag 2 warns about. Before building
it, answer: **what does the app actually do differently for a
Diia-verified user vs. an unverified one?** If there's no concrete
answer, this is cost and risk with no product benefit. If the answer is
"age-gate the Arcade," re-read Flag 1 first — that's a signal about the
product's direction, not just a feature.

Also note (c) is a partner/API integration with a government service,
not a library you can just npm install — expect an application process
and technical requirements set by them, on their timeline. Treat it as
a dependency with lead time, not a sprint task.

### Ukraine / Diia — what I can and can't tell you

Honestly: **I'm not a reliable source on current Ukrainian regulatory
requirements, and this is exactly the area where being confidently wrong
is expensive.** What I can say usefully:

- "Registering in Diia" most likely means one of three different things
  — **(a)** registering a business entity (ФОП / TOV) through Diia's
  portal, **(b)** joining **Дія.City**, the special tax/legal regime for
  IT companies, or **(c)** integrating Diia.Signature / Diia.ID for
  identity verification inside your app. These have very different
  requirements. Decide which you actually mean before spending money.
- **Дія.City has real eligibility criteria** (employee counts, minimum
  salary thresholds, qualifying activity types) and they change. Do not
  plan around numbers from me or from a blog post — get them from the
  official source or an accountant.
- You will need a Ukrainian **accountant/lawyer** for: entity choice,
  the tax regime, VAT treatment of digital sales to non-UA customers,
  and personal-data registration obligations. This is a few hundred
  dollars that prevents five-figure mistakes.

**Concrete next step:** write down which of (a)/(b)/(c) you mean, then
take *that specific question* to a Ukrainian accountant.

---

## Flags — read before building

### Flag 1 — The Arcade is gambling-shaped. Keep it separated.

The app has Crash, Mines, Blackjack and Hi-Lo: staking a currency on
games of chance. Right now this is almost certainly fine, because of one
specific property:

- Real money buys **Tokens** → Tokens buy **courses**.
- **$ money** (a different currency) is earned in-app and staked in the
  Arcade.
- The two **do not convert**, and **$ cannot be cashed out**.

That separation is doing real legal work. Gambling regulation generally
needs *consideration* (paying in), *chance*, and a *prize of value*. No
cash-out and no purchase path into the games means no prize of value.

**Do not, without legal advice:**
- let Tokens (real-money-bought) be staked in Arcade games;
- let `$` be bought with real money;
- let anything be cashed out, traded, or transferred between users.

Any one of those could pull the product under Ukraine's gambling
licensing regime (KRAIL), which is a completely different and much more
expensive category of business. The current currency split should be
treated as a **deliberate compliance boundary**, and documented as one
in SHOP.md — not casually merged later for convenience.

### Flag 2 — Don't collect identity documents unless forced

Passport/ID collection is a step-change in liability: it's sensitive
personal data, it makes you a target, breach-notification duties get
much heavier, and it kills conversion at signup.

A study app essentially never needs it. The plausible reasons someone
would are **age verification** (usually because of the gambling-shaped
mechanics in Flag 1) or **KYC for payouts** (only if money leaves the
platform — which per Flag 1 it shouldn't).

If it's age verification you're after, cheaper and safer options exist:
a self-declared date of birth, or a payment-provider signal. **If you
find yourself needing real KYC, that's a strong signal the product has
drifted into being a gambling product** — worth noticing early.

If you genuinely must collect documents: never store them in Firestore
as images, use a dedicated verification provider, keep only their
pass/fail verdict, and delete the source.

---

## Suggested order

1. Phase 0 (decide the fields) — hours, no code.
2. Answer the Diia (a)/(b)/(c) question — hours, no code.
3. Phase 1 Auth + Phase 2 model behind a flag — the real work.
4. **Phase 3 Rules** — do not ship accounts without this.
5. Phase 4 sync hardening.
6. Phase 5 legal pack — in parallel, before any real payment goes live.
