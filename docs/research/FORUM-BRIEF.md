# Knell's Forum — how it works, and what we are unsure about

A brief written to be handed to an outside researcher. It describes a
reputation system that is built and running, then asks the questions we cannot
answer from inside it.

> **Please do not simply agree with this.** A previous research report we
> commissioned turned out to have read our own design documentation and quoted
> it back to us as independent confirmation. That was worthless. The useful
> output here is **disconfirmation**: known failure modes of systems shaped
> like this one, evidence that any of the choices below are wrong, and
> comparable systems that tried something similar and what happened to them.

---

## 1. The one rule everything else follows from

**Reputation cannot be spent on yourself.** It is not a score you accumulate;
it is a daily allowance you may hand to other people's posts. Your own standing
is only ever what others chose to give you.

The consequence: earning and holding are separate. Studying hard buys you
influence over other people's standing, never your own.

## 2. Where the allowance comes from

The right to give is earned by **remembering**, not by posting or by being
present.

The app is a study platform built on spaced repetition (SM-2, ease floor 1.3).
Every topic a learner has mastered carries a weight determined by how long they
have held it:

| Held | Weight |
|---|---|
| up to 2 days | 1 |
| from 7 days | 1 |
| from 21 days | 2 |
| from 30 days | 2 |
| from 60 days | 3 |

Daily allowance = `min(5, total_weight / 5)`.

So five points a day requires a weight of 25 — roughly a dozen topics held for
weeks. Lapsing a review reduces the weight and therefore the allowance. The
right to praise decays if you stop remembering.

**Unspent allowance expires nightly.** It does not accumulate.

## 3. Caps

- **1 point per post**, ever.
- **10 points to any one author per calendar month.**
- **5 per day maximum**, regardless of weight.

The monthly per-author cap is aimed at collusion: reaching it takes a month,
and a full daily allowance spent legitimately has to reach many different
authors.

## 4. The journal is the record

There are no stored reputation counters. Every figure is a query against a
table of individual grants (giver, receiver, post, timestamp).

Three figures are shown on a profile: **given (lifetime)**, **received this
month**, **received lifetime**.

"This month" resets by itself because it is a `WHERE` clause, not an event. We
watched this happen during development: grants made at 23:27 UTC, and the
allowance had refilled by 02:30 with no scheduled job of any kind.

**Given is displayed at the same size as received, deliberately** — a board
that reports only what you received rewards popularity alone.

## 5. What surplus does

A garden can weigh far more than 25, and the cap wastes that. The surplus
exchanges into a cosmetic currency (`$`) that buys interface themes.

**The exchange is one-way and terminal.** `$` never converts back into Tokens
(the paid currency that unlocks courses) and never leaves the app. The line
being defended: studying must not become a way to earn money, because the
moment it is, the incentive stops being learning.

## 6. Writing

- **3 posts per day, 30 replies.** A daily budget rather than a fixed interval,
  because an interval is a rhythm people learn and set reminders for, and it
  punishes the natural shape of writing (two thoughts in an evening, then
  nothing for a week).
- Replies are far freer than posts because a post takes a slot in everyone's
  feed and a reply takes one in a single thread.

## 7. Views

A view is recorded only when a post has been at least half visible on screen
for **five continuous seconds**, and only **once per person per post, ever**.
Scrolling past does not count.

The dwell time is measured on the client, which everywhere else in this system
would be unacceptable. It is tolerable here only because of the once-ever
constraint: the most a liar gains is one view an honest slow reader would have
produced anyway.

## 8. Moderation

Report → a human queue → an admin decides. **No automatic hiding at N
reports**, on the reasoning that on a small forum N people collude trivially
and an automatic threshold becomes a weapon: three people could silence
anyone. Manual is slower, and slow is the price for "cannot be shouted down"
while the population is small.

## 9. Everything above is enforced on the server

The tables have no insert, update or delete policy for any client. Every write
goes through a database function that derives the actor from the session rather
than from an argument. The client cannot name itself, cannot name an amount,
and cannot set a visibility flag.

This is not caution for its own sake — an earlier version of the economy took
an amount from the client and believed it, and four calls from a browser
console put 800 XP on an account that had studied nothing.

---

## What we actually want challenged

**1. Two accounts can trade.** The give-only rule stops self-promotion but not
a pair alternating: each can hand the other 10 a month. Is there a known
mechanism that stops reciprocal trading without either surveillance or a
reputation graph too large for a small community? What have comparable systems
done, and did it work?

**2. Per-account limits are worth what an account costs.** Ours are free and
email confirmation is currently off, so one person can hold many. We know the
ordering (confirmation before opening publicly). What we do not know is what
else is worth requiring at signup that does not turn away the honest.

**3. The allowance may be unspendable at small scale.** Five active authors
posting normally produce maybe 50 places to put a point in a month, against a
combined allowance of roughly 150–270. The number will look broken. Is there
prior art on reputation economies where supply of *places to spend* is the
binding constraint rather than supply of currency?

**4. Does gating the right to give behind study exclude newcomers?** A person
who joins today has weight 0 and therefore no voice in what rises. Is that a
healthy filter or a barrier that prevents the community forming at all?

**5. Is a decaying right to praise defensible?** Stop reviewing and your
allowance shrinks. We think this is correct — it ties standing to current
knowledge rather than past effort — but we can also see it reading as
punishment for taking a break, which is the same objection that applies to
streaks.

**6. Ban versus purge, unresolved.** When somebody is banned, should their
posts disappear? Their posts are other people's context: threads reply to them,
and reputation was already spent on them. We have not decided.

---

## What we are NOT asking

Whether to add points, badges or leaderboards. There are no public
leaderboards and there will not be; the relevant literature (Hanus & Fox,
2015, among others) is already accounted for in the design, and we are aware
that XP and streaks in the study side were added over that objection and
recorded as such.
