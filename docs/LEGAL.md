# Legal — what's decided, what isn't

*Not legal advice. If real money is involved, an hour with a lawyer is cheap
compared to the alternative.*

---

## 1. Privacy Policy — REWRITTEN 2026-08-27, because the old one became false

> **The warning below was written, and then came true.** The previous version
> of this section said: *"Keep this true. The moment anything phones home — a
> sync feature — this policy stops being accurate and needs rewriting first."*
> Accounts and cloud sync shipped in Steps 3–6, and the policy in Settings went
> on claiming "there is no account, no server" for the whole of that time. It
> was false in the app, in two languages, until this rewrite. Kept visible
> rather than quietly corrected: a doc that predicted its own failure mode and
> was ignored is worth more as a record than as a clean page.

**The factual position now.** There are two copies of a user's data:

- **On the device.** Profile, progress, review schedule, statistics, settings —
  in `localStorage`, which is what makes the app work offline.
- **In the account.** Email, nickname, optional country, and the same study
  data, held by **Supabase on servers in the EU (Ireland)**.

**What is NOT collected, and it is still a short list:** no analytics, no
telemetry, no advertising, no third-party tracking, no payment details (there
is no payment processor yet). Study data is never sold or shared.

**Passwords.** Never stored by this app. `core/auth.js` passes the password
straight to Supabase's `signUp`/`signInWithPassword` and keeps no copy —
verified by audit 2026-08-27: the only `password` references in the whole
codebase are that one local variable and those two calls. Supabase hashes it
server-side; this app cannot read it back.

**GDPR positions, since EU servers and EU users both now apply:**
- **Art. 15/20 (access + portability)** — satisfied by Export Data, which
  predates accounts and writes a complete JSON copy the user controls.
- **Art. 17 (erasure)** — satisfied by Delete Account (Settings → Delete
  account), which calls `delete_account()` (`supabase/migrations/0005`).
  That deletes the caller's `auth.users` row; profiles/progress/economy follow
  by `ON DELETE CASCADE`. It is a real delete, not a soft-delete flag.
- **Lawful basis** — contract performance for the account data (you cannot have
  an account without an email), which is the cleanest basis available and is
  why the field list was kept to the minimum in Step 0.

**Still owed before a public launch:** a named data controller (a person or
entity, with a contact address), a stated retention period for inactive
accounts, and confirmation of whether Supabase's DPA needs signing for this
usage tier.

## 2. Terms of Service — expanded 2026-08-27, still needs a lawyer before money

The draft in Settings covers the ordinary ground: provided as-is, a study aid
rather than accredited instruction, don't rely on it as your only source, don't
redistribute the content. Fine for a free public release.

**Added with the account system**, both now in the app in both languages:
- **Virtual currency has no cash value** (Flag 1's requirement, finally stated
  to users rather than only in this repo). Tokens are a licence to open course
  content, not money: not exchangeable for currency, not transferable between
  people, not refundable once spent, and no in-app balance can be cashed out.
- **Account responsibility** — the user keeps their own password.

**Before charging anyone**, it still needs refunds, a governing-law clause, and
whatever consumer law applies where the BUYER is. Note the old text here also
described "the arcade", which was deleted in 2026-08-14 — a reminder that ToS
text goes stale exactly as fast as the features it describes.

## 3. LICENSE — still undecided, and it's yours to decide

The repo has no LICENSE file. **This is deliberate, not an oversight:** with no
licence, default copyright applies and nobody may reuse anything. That's the
safe default while the commercial plan is undecided, but it also means nobody
can contribute, and GitHub shows the repo as "all rights reserved".

The decision splits in two, and they don't have to match:

**The code** — the engine, branches, DB, garden, forum.
| Option | Means |
|---|---|
| All rights reserved (now) | Nobody may copy or reuse it. Maximum freedom to sell later. |
| MIT / Apache-2.0 | Anyone may reuse it, including commercially. Buys goodwill and contributors; you can still sell your own build. Apache-2.0 adds a patent grant. |
| AGPL-3.0 | Anyone may reuse it but must publish their changes. Stops someone hosting a closed copy. |

**The content** — the courses, quotes, the story.
| Option | Means |
|---|---|
| All rights reserved | The default. Right if it's what you'd sell. |
| CC BY-NC-SA | Free to share and adapt, non-commercially, with credit. |

A common split is permissive code plus reserved content: the engine is the part
worth sharing, the courses are the part worth selling.

### The constraint that already applies either way
From PROJECT.md §10, and it doesn't depend on which licence you pick:

- Facts and concepts **are not** copyrightable. Particular expression **is**.
- The course textbooks used for research are all rights reserved, and Huawei's
  *Cloud Computing Technology* is **CC BY-NC-ND** — non-commercial, no
  derivatives. Nothing derived from it can be sold.
- So: teach the concepts, cite authoritative or public-domain sources, write
  your own analogies and examples. `data_m5.js` was built that way.
- For cloud specifically, cite **NIST SP 800-145** rather than the Huawei book.
  It's the origin of the five characteristics anyway and is US government work
  in the public domain.
- Quotes: avoid Coleman Barks' Rumi and Tzvi Freeman's Chabad.org renderings.
  Both are interpretive paraphrases still in copyright. Entries in `quotes.js`
  marked `verified: false` still need checking before any public release.

## 4. The arcade — REMOVED 2026-08-14 (kept for the reasoning)

**As long as `$` is earned in-app only, never purchasable with real money and
never cashable out, the arcade was a closed loop** — ordinary, and what most
games do.

Add a "buy stars" button next to a blackjack table and some jurisdictions treat
it as gambling regardless of intent, and both app stores treat it as a
restricted category. Decide before building a store release, because it changes
the schema, not just the UI.

## 5. Checklist before any public release

- [ ] Pick a licence for the code, and one for the content. Add the file.
- [ ] Have the ToS reviewed if money is involved.
- [ ] Verify the 9 `verified: false` quotes, or drop them.
- [ ] Confirm no new dependency phones home, so the privacy policy stays true.
- [ ] Settle the purchasable-currency question.

---

## When you actually need to do legal things — a trigger map

**Not legal advice.** This is a map of *what event* makes each item
necessary, so nothing gets done early out of anxiety or late out of
surprise. Decided 2026-08-16: **none of it is needed right now.**

### Right now — pre-release, single-player, no money changes hands
**You need nothing.** No entity, no registration, no policies. The app
stores everything on the user's own device, has no accounts, takes no
payments (Token packs are a labelled demo stub that credits instantly),
and collects no personal data. There is nothing to disclose and nobody
to disclose it to.

### Trigger 1 — you add ACCOUNTS *(comes first, before money)*
The moment a server stores an email address, you are handling personal
data. This lands with the Supabase port, **not** with payments — which is
the part people get backwards.

What it needs, in rough order of effort:
- **Privacy policy** — what you store, why, how long, how to delete it.
- **Terms of Service** — the rules, and your right to remove accounts.
- **A working delete-my-account path.** Not a promise in a document; an
  actual button. `DB.exportData` already exists, which is half of the
  data-portability story.

### Trigger 2 — you add the FORUM *(user-generated content)*
Now you are hosting things other people wrote, which is a different
liability from hosting your own content.
- A **reporting route** and a **takedown process** — even an email that
  a human reads counts at small scale.
- Moderation rules written down somewhere users can see.
- `admin/ADMIN.md`'s warnings and bans were built for a single-player
  app. A ban that wipes an account needs re-examining when that account's
  posts are other people's context.

### Trigger 3 — you take REAL money

**Sequencing decided 2026-08-16: payments come AFTER the engine is
finished.** Not before. Token packs stay a labelled demo stub until
then, which is also what keeps triggers 3 and 4 switched off — no
entity, no VAT, no merchant account needed while nothing is sold.
Only when Token packs stop being a stub.
- The simplest route by far is a **merchant of record** (Paddle,
  Lemon Squeezy, Gumroad). They sell to the customer, handle VAT in every
  country, and pay you — which means you do **not** need an entity in
  each jurisdiction, and usually not one at all to start.
- Stripe is cheaper per transaction but makes VAT and invoicing *your*
  problem, which is where a business registration (ФОП or similar) starts
  being genuinely necessary.
- **Recommendation: start with a merchant of record.** You can move to
  Stripe later when volume justifies the paperwork. Doing it the other
  way round is painful.

### Trigger 4 — employees, or serious revenue
**Дія.City** is a tax regime for IT companies with staff. Irrelevant to a
solo pre-release project. Revisit only if this becomes a company.

### Diia.ID (verifying real identity documents) — recommend never
Handling government ID puts you in a much heavier compliance category.
The only reason a study app would need it is age-gating something like
gambling — and the Arcade was removed on 2026-08-14, so that reason is
gone. **Do not add this unless something forces it.**

### The short version
```
now              → nothing
accounts         → privacy policy + ToS + delete button
forum            → reporting + takedown + moderation rules
real money       → merchant of record (entity only if you outgrow it)
staff/revenue    → look at Дія.City
identity docs    → don't
```
