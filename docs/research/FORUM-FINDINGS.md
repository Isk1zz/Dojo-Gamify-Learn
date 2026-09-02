# What the outside review found — and what it changes

Source: a Gemini deep-research report answering `FORUM-BRIEF.md`, received
2026-09-02. The brief opened by asking the reader **not** to agree, because the
previous report had read our own documentation and quoted it back as
independent confirmation.

**This one disagrees, in specific and checkable ways.** That is what makes it
worth acting on. It is recorded here separately from `LEARNING-ENGINE.md`
because that file is about the study engine and this is about the Forum.

> Nothing below is applied yet. This file is the record; the changes are
> queued in `UPDATESTACK.md`.

---

## 1. Where it corrected me, not the design

### Views: my reasoning about client-measured dwell was wrong

I wrote, in migration 0019 and in the brief:

> "The most a lie can win is ONE view on ONE post -- exactly the view an
> honest slow reader was going to produce anyway. There is no loop to run, so
> there is nothing to defend."

The report's objection: a script can post view events for **every post at
once**, without rendering anything. No single post gains more than one view,
which is what I checked — but every post gains one from every fake account
simultaneously, and the number stops meaning anything.

**I modelled the wrong attack.** I pictured inflating one post and proved that
bounded; the cheap attack is inflating everything.

**What saves it today:** views are displayed and nothing else. They do not sort
the feed, do not feed rewards, do not affect ranking. The exposure is a wrong
number on a card.

**What makes it real:** the first time views influence ordering or anything
earnable.

Their fix, if it becomes real: an HMAC challenge-response. The server signs
`(user, post, t_start)` when the post enters the viewport; the client returns
that token after the dwell; the server checks the signature and that enough
time actually elapsed between issuing and returning. A script cannot forge the
elapsed time because it did not hold the token.

---

## 2. Where it confirmed a hole we already suspected

### Reciprocal trading works, and the monthly cap sets its exchange rate

Our assumption was that "no self-grants, plus 10 per author per month" makes
collusion pointless. The report is blunt: the cap **does not prevent
collusion, it defines the optimal rate for a colluding pair.** Two accounts
each posting ten times a month trade ten points each way and both max out.

Worse, a three-way ring defeats naive detection entirely: A gives to B, B to C,
C to A. Pairwise reciprocity between any two of them is **zero**, so any check
looking for mutual votes sees nothing.

Two mitigations offered, in increasing cost:

- **Reciprocity discount.** For a pair, compare volume given each way. Perfectly
  balanced exchange scores 1 and is discounted hardest; one-directional
  scores 0 and is untouched. Catches pairs. Does not catch rings.
- **Spectral trust** (EigenTrust / Personalized PageRank) seeded from trusted
  accounts, computed off-peak. A ring that only praises itself stays walled
  inside its own cluster, because its influence is bounded by its paths to the
  seeds. Catches rings, needs a graph and a seed set.

**My reading:** the discount is cheap and worth doing before launch. Spectral
trust is correct and premature — it needs a community that does not exist yet.

### The allowance is mostly unspendable, and the number is worse than I guessed

I estimated "5 authors, maybe 50 places to spend against 150–270 issued". The
report does the arithmetic properly:

| | |
|---|---|
| 5 learners at full weight | 5 points/day each |
| Issued per month | 5 x 5 x 30 = **750** |
| Realistic posts per author per month | ~10, so ~50 posts total |
| One point per post, 10 per author per month, no self-grants | each learner can spend at most 4 x 10 = **40** |
| Spendable per month, whole cohort | 5 x 40 = **200** |

**Over 73% of all issued praise expires unspent.**

Two consequences it names: the currency stops feeling like a mark of
appreciation and starts feeling abundant, and people **quota-dump** — casting
unconsidered votes near the reset to avoid "wasting" them. That second one is
the same failure the midnight expiry was meant to prevent.

Their fixes:

- **Let replies be praised, not just posts.** We allow 30 replies a day against
  3 posts, so replies are where most of the writing will be. This is the
  cheapest fix and the largest one.
- **Scale the allowance to how many active authors there are**, so an early
  cohort is not issued ten times what it can place.

### Newcomers really are locked out, and the fix is two tiers

A learner on day one has weight 0 and therefore no voice at all. The report
names the consequence: established learners control what rises, newcomers are
passive consumers, and the reciprocal acknowledgement that makes a new person
stay is impossible for them to give.

Its answer separates two things we had merged:

- **Conversational acknowledgement** — "helpful", "understood" — available to
  everyone from the first day, affecting nothing but the author's day.
- **Reputation** — our system, unchanged, tied to retention, driving ordering
  and the `$` conversion.

This is the strongest single suggestion in the report. It preserves the whole
argument for earning the right to *rank* people, while removing the part that
makes a new person mute.

### Decay carries the streak risk, and there is a standard mitigation

We knew this reads as punishment for taking a break. The report names the
failure — the **streak-drop abandonment spiral**, where a returning user finds
their standing diminished and rebuilding feels not worth starting — and gives
the usual answer: a **grace window** (about a week) during which the allowance
holds at its peak before decaying, rather than dropping the moment a review
lapses.

Also: replace the midnight reset with a **rolling window** (~48h), which
removes the quota-dumping deadline without removing expiry.

---

## 3. What it taught us that we had not asked about

### Filtering Russian text by substring will block physics

We have no content filter, and this is the reason to be careful when we build
one. Russian profanity is built on a few roots that appear **inside ordinary
academic words**. The report's example is exact and alarming:

- the root `бля` sits inside **колебания** (oscillations — a physics word we
  will certainly use) and inside **употреблять** (to use / to apply).

So naive substring matching blocks the curriculum. And the opposite — matching
whole words only — fails too, because Russian inflects: one root becomes dozens
of surface forms across cases, aspects and genders that a static list cannot
enumerate.

The workable approach it describes: **lemmatise first** (reduce each word to
its dictionary form), then match, and keep an allowlist of academic vocabulary.

Also worth having whenever we filter anything: a normalisation pass before
matching — Unicode NFKC, stripping zero-width characters used to break words
apart, and mapping Cyrillic letters that are visually identical to Latin ones
(**а с е о р х у** are different codepoints from a c e o p x y) onto one form.
Without that pass, evasion is a copy-paste away.

### `UNIQUE NULLS NOT DISTINCT` is the declarative form of the bug I fixed

Postgres 15 added it, and it is exactly the fix for the reports table: it makes
NULLs compare equal inside a unique constraint, so `(reporter, post, NULL)`
twice is a violation.

I fixed the same bug in 0020 with two partial unique indexes instead. Both are
correct; the partial indexes never index a NULL at all, which I still prefer.
**No change needed** — but it is good to know the bug is a documented class with
a documented cure, rather than something I reasoned my way into alone.

### Confirmations worth noting, needing no work

- **No auto-hiding at N reports** — it agrees, and states the cost of the attack
  we avoided: a fixed threshold is a denial-of-service on the moderation queue
  costing one attacker three sockpuppets.
- **Tombstoning on ban and on deletion** — it describes exactly what we decided
  independently: keep the row, keep the thread structure, detach the identity.
- **Free accounts undermine per-account limits** — same conclusion we recorded,
  same ordering: verification before opening publicly.
- **All writes through server functions with the actor from the session** —
  what we already do everywhere.

---

## 4. Ranked, for the plan

By (value / cost), and marked with whether it is needed before launch.

| | Change | Cost | Before launch? |
|---|---|---|---|
| 1 | **Reputation on replies**, not just posts | low | yes — it is most of the fix for 73% waste |
| 2 | **Two-tier feedback**: free reactions for everyone, reputation as-is | medium | yes — otherwise newcomers are mute |
| 3 | **Grace window before decay** (~7 days) | low | yes — cheap, removes the abandonment spiral |
| 4 | **Rolling expiry window** instead of midnight | low | probably — kills quota-dumping |
| 5 | **Reciprocity discount** for balanced pairs | medium | yes — the cap alone does not work |
| 6 | **Allowance scaled to active author count** | medium | no — matters once there are cohorts |
| 7 | **Lemmatising content filter** with an academic allowlist | high | only when a filter is built at all |
| 8 | **Signed dwell tokens for views** | medium | only if views ever affect ordering |
| 9 | **Spectral trust for collusion rings** | very high | no — needs a community first |

---

## 5. Still to verify

The report is AI-generated, like the last one. Its reasoning is checkable and
mostly checked itself, but two figures are load-bearing and cited to nothing in
particular:

- the claim that toxicity classifiers score roughly 7.7 points lower F1 on
  lower-resource languages than on English — relevant only if we buy one;
- the specific latency and hosting numbers in its classifier comparison.

Neither blocks anything on the list above.
