# BACKEND-ROADMAP.md — Firebase port, accounts, and the legal pack

Status: **planning only, nothing built.** Written 2026-08-13.

This is the roadmap for moving Dojo off "localStorage on one device" and
onto real accounts with a real database, plus what's actually required
to operate it as a registered product in Ukraine.

Read the **Flags** section at the bottom before starting Phase 1. Two
items there change what you should build, not just how.

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
