# Legal — what's decided, what isn't

*Not legal advice. If real money is involved, an hour with a lawyer is cheap
compared to the alternative.*

---

## 1. Privacy Policy — written, and it's the easy one

The factual position is unusually clean, and the policy in Settings now says
exactly it:

- Everything is in the browser's `localStorage`.
- There is no account, no server, no analytics, no telemetry, no third party.
- Nothing is transmitted anywhere, because there is nothing to transmit to.
- Clearing site data, or Delete Profile, erases it. There is no copy elsewhere.

**Keep this true.** The moment anything phones home — a sync feature, an error
reporter, a font from a CDN — this policy stops being accurate and needs
rewriting first. That is a genuine constraint on future features, and it is
worth the trade: "your data never leaves your machine" is a real selling point
and almost nothing else in this category can say it.

## 2. Terms of Service — drafted, needs a lawyer before money changes hands

The draft in Settings covers the ordinary ground: it's provided as-is, it's a
study aid rather than accredited instruction, don't rely on it as your only
source, and don't redistribute the content. Fine for a free public release.

**Before charging anyone**, it needs refunds, a governing-law clause, and
whatever consumer law applies where the buyer is — which for a paid app is
wherever the store sells it, not where you are.

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
