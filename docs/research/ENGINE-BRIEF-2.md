# Knell's learning engine — the built machine, and where we think it lies to us

A brief written to be handed to an outside researcher. It describes a study
system that is built and running against real content, then asks the questions
we cannot answer from inside it.

Every number below was measured from the source on 2026-09-03, not recalled.
Where we state a mechanism, it is because we read the function that implements
it. Where we are guessing, it says so.

---

## 0. What went wrong with the last two reports — please read this first

**Report 1 quoted our own design documentation back to us as independent
confirmation.** It had evidently read the repository's README and PROJECT.md
and returned our stated intentions as findings. That output was worthless.

**We then put a false premise into the brief for report 2**, and the report
faithfully built a whole section on solving a problem that did not exist. We
claimed the reputation allowance decays when a learner stops reviewing. It
does not — the variable in question is written in exactly one function, and
that function only runs when somebody *does* review. Nobody checked, on
either side.

Two consequences for this brief:

1. **Disconfirmation is the deliverable.** Known failure modes of systems
   shaped like this one; evidence that the choices below are wrong; comparable
   systems that tried something similar and what happened to them. Agreement
   is only useful when it arrives with a citation we did not already have.
2. **Challenge our premises, including the factual ones.** If a claim in §1
   does not follow from the mechanism as described, say so. We would rather
   find a second invented problem here than in the implementation.

We are also not looking for a literature review of spaced repetition. We have
one. We are looking for what breaks.

---

## 1. The machine as built

Vanilla JavaScript, no framework. Progress is mirrored to a Postgres server
which is the authority on all rewards; the client cannot pay itself.

### 1.1 The content shape — measured, not targeted

```
Course -> Unit -> Topic -> Chunk
58 topics, 171 chunks, 2.95 chunks per topic
Exam questions per topic: 5, in every single topic (min 5, max 5)
```

A **chunk** is the atom of study. Its full form has five phases:

| Phase | What it is | Coverage |
|---|---|---|
| `predict` | a question asked BEFORE the material, then a reveal | first chunk of a topic; present in 33 of 58 topics (57%) |
| `explain` | ~200 words in 3 blocks, plus an analogy and 2 citations | every chunk |
| `example` | a worked example, 3-4 contrasting steps | every chunk |
| `quiz` | one 4-option question, with an explanation | every chunk |
| `recall` | free-recall prompt with a model answer and key points | intended for the last chunk of a topic; actually present on 97 of 171 chunks |

Note the mismatch in the last row. Our content specification says `recall`
belongs on the closing chunk only. Authors put it on 65 chunks where the
specification forbids it. We suspect the specification is the thing that is
wrong — the generation effect is a property of each retrieval attempt, not of
a topic boundary — but we have not found the evidence to settle it.

**Question A. Is per-topic placement of `predict` and `recall` defensible at
all, or should both be per-chunk?** Specifically: does the pretesting effect
require the genuinely unstudied state — so, once per topic, before anything —
or does it survive being asked at the head of every chunk inside a topic the
learner is already working through?

### 1.2 The exam and the mastery gate

After a learner finishes a topic's chunks, the exam runs **immediately**: 5
questions, 4 options each, question order and option order shuffled on every
attempt.

- Pass mark is **80%** — with 5 questions this means 4 correct.
- Passing is the **only** way a topic enters the spaced schedule.
- Score maps to SM-2 quality as `round(percent / 20)`, so with 5 questions
  quality equals the number correct, exactly.
- One retry on failure. After two failed attempts the exam is no longer
  directly retriable and the topic must be walked through again.

**The concern we cannot resolve.** The exam runs at the moment of peak
retrieval strength — minutes after reading the material, in the same session,
with no delay and no interference. That is the textbook condition for the
fluency illusion. Our worry: a topic can clear 80% on short-term strength
alone and enter the review queue on a 1-day interval it has not earned.

An earlier report proposed an acquisition state to fix this: fixed intraday
steps (1 min, 10 min, 1 day) before SRS takes over, with the gate at the end.
We have not built it, and we are not confident it is the right shape for an
app people open once a day rather than sit inside for an hour.

**Question B. Is an immediate end-of-topic exam a strong enough encoding check
to justify entry into a spaced schedule?** If not, what is the cheapest
sufficient fix — a delayed gate (the topic stays provisional until a next-day
check passes), an intraday ladder, a shorter first interval, or something
else? We want the intervention with the best evidence per unit of friction,
and we would rather be told "the immediate exam is fine, the first interval is
the problem" than be handed a five-stage ladder.

**Question C, from the app's owner, offered as a hypothesis to attack rather
than a decision to implement.** The proposal was: expand the exam from 5 to 10
questions, and add a second question format — multi-step problems rather than
recognition items — drawing several of them from the chunk quizzes.

Our own reading is that doubling the count at the same moment increases the
precision of a measurement without touching the timing problem in Question B,
and that the *format* half is the part with evidence behind it. **Is that
reading right?** Concretely:

- Does test length independently affect retention via the testing effect, or
  only the reliability of the pass/fail decision? Is there a known point of
  diminishing returns for a mastery gate specifically?
- Is there evidence that mixed-format assessment (recognition + constructed
  response + multi-step problem) produces better transfer than a same-length
  all-recognition test?
- Reusing a chunk quiz question inside the exam means the learner saw it
  minutes earlier in the same session. Does that make it a weaker gate item
  (recognition of a recent event) or a stronger one (spaced within-session
  retrieval)?

### 1.3 The scheduler

Textbook SM-2, ease floored at 1.3.

```
quality < 3   -> interval = 1, lapse recorded, reps reset to 0
reps == 1     -> interval = 1
reps == 2     -> interval = 6
reps >= 3     -> interval = round(interval * ease)
ease += 0.1 - (5-q) * (0.08 + (5-q) * 0.02)      floored at 1.3
```

At exactly the pass mark (quality 4) the ease adjustment evaluates to zero, so
a learner who scrapes through repeatedly holds a flat ease of 2.5 forever. We
did not plan this; we noticed it while writing this brief. It reads as benign,
but we would like to know whether it is.

**Question D. Should the mastery gate and the scheduling quality be the same
number at all?** Right now one exam score both decides "does this enter the
schedule" and "how far ahead is it scheduled". A learner who passes at 80% and
one who passes at 100% differ by four days on the second review and by weeks
by the fifth. Is one measurement doing two jobs defensible here, or is it a
known anti-pattern?

### 1.4 Flashcards — what a due review actually is

When a topic comes due, the learner does **not** retake the exam. They get a
flashcard deck built from content that already exists, with nothing extra
authored:

- one card per chunk, from that chunk's quiz question
- plus one card per exam question (5 more)

so a typical deck is about 8 cards. Grading is **self-reported**, on four
levels: Difficult / Still learning / Has an idea / Known. There is no multiple
choice on these cards — the answer is revealed and the learner rates
themselves.

The tally maps to SM-2 through the same `round(percent / 20)`, where "percent"
is the share of cards marked known. Cards answered faster than a minimum time
threshold do not count toward the reward, and the learner can filter a custom
deck by their own last confidence rating.

**Question E. Self-report is the single largest measurement risk in the
system.** The whole schedule — and, through the garden below, the whole social
economy — runs on a number the learner enters about themselves, with the
answer visible on screen. What is the evidence on self-graded recall versus
objective scoring for *scheduling accuracy*? Anki's four-button self-report is
the obvious prior art and is enormously deployed; is there evidence it is
actually good, or only that it is tolerated? If we can afford one intervention
here, is it forcing typed free recall before the reveal, withholding the
answer until a confidence rating is given, or something else?

**Question F.** Exam-question cards deliberately write back to nothing: an
exam question belongs to no chunk, so grading one must not rewrite some
chunk's weakness data or its review schedule. The consequence is that five of
about eight cards in a deck produce no diagnostic signal at all. Is that a
real loss, and is there a standard way to attribute a topic-level item to
sub-topic weakness?

### 1.5 The garden — the schedule made visible, and made social

Every mastered topic is a plant. **The growth stage is the review interval**,
not whether the topic was ever passed:

| Interval | Stage | Weight |
|---|---|---|
| not started / attempted only | Fallow / Seed | 0 |
| 1-6 days | Sprout | 1 |
| 7-20 days | Seedling | 1 |
| 21-29 days | Growing | 2 |
| 30-59 days | Tree | 2 |
| 60+ days | Blossom | 3 |

So the garden pictures **retention, not coverage**. A hundred topics passed
once is a field of sprouts.

Reaching the top stage takes five successful reviews and, at the pass mark,
about 60 days of real elapsed time. It cannot be rushed, by construction.

**Withering.** A review left overdue loses one day of interval per day
overdue, after seven days of grace. Plants visibly shrink. There is a holiday
mode with a budget of 60 days a year on a rolling window, counted from elapsed
time rather than from button presses, during which decay is suspended.

**The weights are a currency.** Total weight sets a daily allowance of
reputation points, which can only ever be given to *other people's* forum
posts and never kept. Reputation converts to cosmetic currency. So the chain
is:

```
remember something for two months -> weight 3 -> more points to give away
-> other people's standing -> your own cosmetics
```

**Question G. Does making the review schedule visible and socially valuable
corrupt the schedule?** The learner controls the input — self-reported
confidence, §1.4 — to a number that is now worth something. We think the
firewall (you can never give points to yourself) blunts this, but the
incentive to over-report on flashcards to keep plants growing is direct and
unmediated. What does the literature say about gamified metrics that the
player also measures?

**Question H. Is decay-on-neglect the right pressure, or a known driver of
abandonment?** Withering is honest: an unreviewed topic *is* being forgotten,
and drawing it as a healthy tree would be the lie. But visible loss is also
the mechanic most associated with people quitting streak-based apps — and we
deliberately removed streaks from this app for exactly that reason. We may
have removed the streak and rebuilt it in the shape of a plant.

---

## 2. Decisions already taken, so they are not re-proposed

These are settled. Argue against them only with evidence, not preference.

- **No public leaderboards.** No rank comparison between learners.
- **No hard content locks.** Nothing is unreachable; the gate controls
  scheduling, not access.
- **Reputation cannot be spent on yourself** and does not accumulate — the
  daily allowance expires nightly.
- **Two currencies, one-way.** Study currency buys cosmetics. Cosmetics buy
  nothing.
- **80% pass mark** is fixed. An earlier report suggested an adaptive
  difficulty target near an 85% success rate; we treat that as a different
  number doing a different job and will not let it move the gate.
- **No streaks.** Removed deliberately.
- **Everything paid is paid by the server**, from a catalogue, once per item,
  with a pace check and a daily ceiling.

---

## 3. What we would most like back

Ranked. If there is only room for three, do the first three.

1. **Question B** — is the immediate post-topic exam a sufficient encoding
   check, and if not, the cheapest sufficient fix.
2. **Question E** — self-reported recall as the input to a schedule that now
   carries economic value.
3. **Question C** — whether exam length or exam format is the lever, stated as
   a correction to the owner's proposal if that is what the evidence says.
4. **Questions G and H** together — the cost of making the schedule visible.
5. **Question A** — phase placement.
6. **Questions D and F.**

For each, we want: the finding, the strength of the evidence behind it, and
what it would concretely change in the mechanisms described above. A
recommendation we cannot map onto a specific number or function in §1 is one
we cannot use.
