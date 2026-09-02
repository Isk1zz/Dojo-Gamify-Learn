# Learning-engine research — capture and assessment

Source: a Gemini deep-research report, *Architectural Foundations of Modern
Learning Platforms*, shared 2026-09-02 in two parts. **Both parts are in.**

Not to be acted on yet. The detailed plan comes after the forum is finished.

---

## 0. Two things to know before reading it

### 0.1 The report read our own documentation

`LEARNING-DESIGN.html` — the page written in this repo an hour before the
report was generated — **appears in its source list.**

That changes what the report can be used for. Its description of Knell, its
praise of the EF ≥ 1.3 floor, its account of the five-phase chunk, and its
citation of the answer-key skew (option B correct in 10 of 11 questions in
module 3) are all **read back out of our own file.** Where it agrees with us
about us, that is an echo, not a second opinion.

Citing it as external validation would be circular. What it *is* good for:
the parts about **other** systems, the algorithms, and the research it points
at — none of which came from here.

### 0.2 Some citations check out; the format still hides which

The source list contains real primary work — `bjorklab.psych.ucla.edu`,
`pmc.ncbi.nlm.nih.gov` on interpolated testing, `columbia.edu` on
hypercorrection of high-confidence errors, ResearchGate on *The Eighty Five
Percent Rule for optimal learning*. That last one **upgrades the 85% Rule from
"unverified" to "has a real paper behind it"**, which it did not have after
part 1.

It also contains a lot of blog and Medium secondary coverage. Nothing wrong
with that, but a figure quoted from a blog quoting a paper is not the same as
a figure from the paper. Items still marked **[verify]** below are ones where
the number itself decides a build.

---

## 1. What the report says

### 1.1 Bjork's New Theory of Disuse — the load-bearing idea

Memory is not one quantity but two:

- **Storage strength (S)** — how deeply entrenched. Once accumulated, does
  not decay.
- **Retrieval strength (R)** — how accessible *right now*. Volatile; surges
  after study, decays fast.

```
ΔS ∝ (1 − R)
```

Near-peak R means effortless recall and almost no permanent gain. R decayed
toward forgetting means reconstruction, and maximal gain. The *fluency
illusion* is R saturating under massed practice and feeling like mastery.

### 1.2 Cognitive Load Theory and backward fading

Working memory holds three to four novel chunks. Load splits into intrinsic
(the material), extraneous (bad presentation) and germane (schema building).

The **worked-example effect**: beginners learn procedures faster from complete
annotated solutions than from unguided problem solving. But dropping them
straight into unassisted problems re-floods working memory.

**Backward fading** (Renkl, Atkinson) bridges it. Scaffolds are removed from
the **last** step backward:

1. fully worked, every stage explained;
2. system does everything but the final step;
3. penultimate and intermediate steps withheld in turn;
4. learner runs the whole pipeline.

### 1.3 The 85% Rule

Wilson, Shenhav, Straccia, Cohen: learning speed peaks at an error rate of
about 15.87% — accuracy ≈ 84.13%. Static difficulty drifts away from that
optimum as skill grows; systems that modulate item difficulty to hold ~85%
success accelerate acquisition.

### 1.4 Pretesting, generation, hypercorrection

Pretesting and generation are already in Knell and already documented. The
third is not:

**Hypercorrection** (Metcalfe, Butterfield): errors made with **high
confidence** are corrected and retained *better* than low-confidence errors,
given explicit corrective feedback. A confident error produces metacognitive
surprise, which captures attention.

**Butler's caveat**: hypercorrected memories hold over a week, but
unreinforced misconceptions reassert over longer intervals. Hypercorrection
must feed the spaced schedule, not sit beside it.

### 1.5 The acquisition / review split  — *the most useful idea in the report*

SRS algorithms are **review** schedulers. They assume the material is already
encoded. Feeding novel, unencoded content into an SRS queue produces immediate
failure loops.

So the architecture is two state machines, not one:

```
ACQUISITION STATE   short fixed steps: 1 min -> 10 min -> 1 day
        |
        v   mastery gate: exam passed >= 80%
REVIEW STATE        continuous SRS scheduling
```

Only after unassisted mastery does an item enter the review queue. Before
that it stays on short intraday intervals with worked examples and
application tasks.

### 1.6 Bloom's 2 Sigma and mastery gates

Bloom (1984): students under mastery-learning conditions performed two
standard deviations above conventionally taught peers — 50th to 98th
percentile. Operationalised as: content locked until prerequisites clear,
advancement requires 80–90% on an end-of-topic exam, and passing that exam is
the **exclusive** trigger registering the topic into the spaced schedule.

### 1.7 Anti-cheating mechanics

- **Fisher-Yates shuffle** on question order *and* option arrays, on every
  presentation and retry — otherwise retries are passed from spatial memory.
- Shuffling also masks human authoring bias in answer keys.
- **Anti-speedrun lockout**: any review submitted faster than ~2.5 s is an
  invalid retrieval event; withhold credit, return the card to the deck.

### 1.8 Interleaving and confidence-filtered decks

Blocked practice (AAAA→BBBB) accelerates initial performance and feels
productive, but produces weak retention and poor transfer — the learner never
has to work out *which* approach applies. Interleaved practice (ABACBCBA)
introduces contextual interference and forces category discrimination first.

Custom decks filtered by confidence tier (Hard / Learning / Developing /
Mastered) encourage metacognitive monitoring.

### 1.9 Motivation: SDT, overjustification, Hanus & Fox

Deci and Ryan's **Self-Determination Theory**: sustained motivation needs
autonomy, competence and relatedness.

**Overjustification**: explicit contingent external rewards shift the
perceived locus of causality from internal curiosity to external compliance.
Two consequences — learners game the system toward the path of least
cognitive resistance, and **post-reward cessation**, where removing the points
drops engagement *below* the pre-gamification baseline.

**Hanus & Fox**, 16-week longitudinal, *Computers & Education*: the gamified
cohort showed decreased intrinsic motivation, course satisfaction and
empowerment — **and scored significantly lower on the final exam** than the
non-gamified control.

The report's own taxonomy:

| | Controlling feedback | Informational feedback |
|---|---|---|
| Mechanisms | public leaderboards, countdown timers, hearts lost on error, guilt alerts | retention garden, knowledge profile, weak-spot telemetry |
| Locus | external — "I am forced to perform" | internal — "I am building mastery" |
| Effect | overjustification, gaming, lower exam scores | supports autonomy and competence |

Notably: deducting lives on an honest mistake **penalises exactly the ~15%
error rate the 85% Rule says is optimal.**

### 1.10 The schedulers

**SM-2** (Woźniak 1987):

```
I(n) = 1  if n=1   |   6  if n=2   |   I(n-1) x EF  if n>2
EF' = EF + (0.1 - (5-q) x (0.08 + (5-q) x 0.02))
```

Failure (q<3) resets n to 0 and I to 1. Weaknesses: ease hell without a floor
(*Knell's EF ≥ 1.3 is named as the fix — but see §0.1*); the 1→6 jump is
hardcoded; the full reset on failure discards accumulated storage strength.

**HLR** (Settles, Meeder — Duolingo): `h = 2^(θ·x)`, `p = 2^(−Δ/h)`,
minimising `Σ(y−p)² + λ‖θ‖²`.

**FSRS v5** (Jarrett Ye) — DSR: Difficulty, Stability, Retrievability.

```
R(t,S) = exp(ln(R_target) x t/S)
S'_recall = S x f(D,S,R)      S'_lapse = g(D,S,R)
```

Retrieval at low R gives an amplified stability boost — Bjork's ΔS ∝ (1−R)
inside the scheduler. Claimed **15–40% fewer reviews at equal or better
retention** **[verify]**, needing **≈50–1000 reviews** to converge. Production
systems seed new users with population-level defaults and shift toward
personal weights as data accumulates.

### 1.11 The operational metric suite

The report's most directly usable contribution. Targets are its own
**[verify]**.

| Metric | Definition | Target | Watches for |
|---|---|---|---|
| **SER** system error rate | 1 − correct/total | 14–18% | the 85% Rule |
| **DRR** delayed retention | successful reviews at t>7d ÷ scheduled at t>7d | ≥85–90% | storage-strength consolidation |
| **SDI** speedrun defect | interactions <2.5 s ÷ total | ≤2% | fluency illusion, deck-tapping |
| **MGV** mastery gate velocity | passed exams ÷ attempts | 70–85% | gate too trivial above 95% |
| **HRI** hypercorrection recovery | correct retests on confident errors ÷ confident errors | ≥75% | whether corrections stick |
| **IPR** interleaved practice | interleaved sessions ÷ total | ≥40% | siloed studying |

And a **Weak Spot Metric**:

```
WSM = (100 − Score_last) + 10 x N_lapses + 5 x max(0, t_overdue)
```

### 1.12 How it characterises the competition

| Platform | Retrieval | Scheduler | Named trade-off |
|---|---|---|---|
| Duolingo | recognition, word-bank | HLR inside Birdbrain — LSTM, 40-dim latent state, Elo-like item difficulty, tens of billions of inferences daily | optimises daily active usage; users game leagues and pick the easiest decks |
| TryHackMe | applied execution in live VMs | manual, event-based | infrastructure cost; no item-level spacing |
| Brilliant | interactive step solving | practice sets, post-lesson review | hard to scale to non-visual domains |
| Math Academy | active generation, timed diagnostics | **FIRe** on a prerequisite DAG | rigid, expensive curriculum engineering |
| Knell | active generation, confidence flashcards, simulated exams | SM-2 with EF ≥ 1.3 | **"high cognitive friction may deter casual users"** |
| MOOCs | end-of-module multiple choice | absent | >90% attrition |

**Math Academy's two ideas remain the most interesting.** *Fractional Implicit
Repetition*: solving an advanced problem implicitly demonstrates its
prerequisites, so partial spacing credit flows **down the ancestor nodes**.
*Spaced Repetition Compression*: when several reviews come due, find one
advanced topic exercising all of them and clear them with a single problem.
Plus **diagnostic binary search** over the DAG at onboarding — validating
downstream prerequisites on a pass, descending on a failure — claimed to cut
diagnostic time by up to 70% **[verify]**.

---

## 2. Assessment

### 2.1 Already in Knell, and the report is not the reason to believe it

Everything in this list is present in the app *and* described in the report —
but §0.1 means the report is reading it off our own page. Listed so the plan
does not re-propose work that exists:

- 80% mastery gate as the sole trigger for the spaced schedule.
- EF ≥ 1.3 floor.
- Fisher-Yates on questions and options, every attempt.
- Anti-speedrun: `MIN_CARD_MS = 2500` in `library.js` — the report's 2.5 s
  threshold, to the millisecond.
- Wrong answers queue a question-only retry rather than a reread.
- Five-phase chunk: predict → explain → example → apply → recall.
- Confidence tiers on flashcards; custom cross-topic decks (interleaving).
- Growth by interval, decaying on lapse.
- Dual-currency firewall, one-way.
- No public leaderboards.

### 2.2 What is genuinely new and worth building

**(a) The acquisition / review split — the biggest idea here.**

Knell has the *gate* (80% exam triggers `scheduleReview`) but not the
*acquisition state*. A topic being studied for the first time gets chunk
questions and then the exam; there is no 1 min → 10 min → 1 day intraday
ladder before the SRS takes over.

Whether that matters depends on a question the report answers only
generically: is the exam a strong enough encoding check on its own? Our exam
is five questions immediately after the chunks — high R, low elapsed time,
which is precisely the fluency-illusion condition §1.1 warns about. **A topic
can pass at 80% on retrieval strength alone and enter the review queue on a
1-day interval it has not earned.**

That is a real, specific weakness, and it follows from the report's own theory
rather than from its praise. Worth investigating first.

**(b) Confidence before feedback, and the hypercorrection flow.**

Part 2 makes this concrete in a way part 1 did not. The confidence rating must
come **after the answer, before the feedback** — Guessing / Uncertain /
Certain. Then, on a confident error:

1. juxtapose the chosen misconception against the correct principle, to
   maximise surprise;
2. require a brief diagnostic reflection on *why* it was wrong;
3. schedule a re-test in **24–48 hours**, because the benefit fades in about
   a week.

Knell collects confidence, but only in flashcard review and only *as* the
answer, not before feedback on a quiz. So the signal we have is not quite the
signal the effect needs. That is a smaller change than building it from
nothing, and larger than the one line part 1 implied.

**(c) The Weak Spot Metric is missing a term.**

Ours, in `db.js`:

```js
weakness = lastScore - (lapses * 10)      // filtered < 80
```

Theirs adds overdue days:

```
WSM = (100 - Score_last) + 10 x N_lapses + 5 x max(0, t_overdue)
```

Same two components, opposite sign convention, **plus a third we do not
have**. A topic three weeks overdue is weak *because it is overdue*, and we do
not currently say so. Small, concrete, cheap.

**(d) The metric suite is what would tell us whether any of this works.**

Six numbers, and we already collect most of the inputs — `stats` holds
mini-quiz and exam totals, `flashTimings` holds per-card latency, `reviews`
holds intervals and lapses.

SER and SDI could be computed today. DRR needs review outcomes tagged with
elapsed time. HRI needs (b) first, by definition.

**But none of them mean anything with one user.** Which is the honest reason
to build the collection now and read the numbers later.

### 2.3 What I would not take

**The 85% Rule still must not touch the 80% pass mark.** Part 2 makes the
distinction *sharper*, not weaker: it puts the 85% figure on practice-item
difficulty inside the acquisition state, and separately endorses an
**80–90% mastery floor** on the gate exam. They are different numbers doing
different jobs in the same document. Moving one toward the other would be
misreading it.

**Full adaptive difficulty is still out of reach.** Holding a learner at ~85%
success needs a per-item difficulty model and a selection engine. Duolingo
runs tens of billions of inferences a day to do it. We have 171 chunks and no
users.

**The DAG is still the right idea at the wrong scale.** FIRe and compression
need a prerequisite graph over thousands of micro-topics; we have 58 topics
and no edges. The 70% onboarding-diagnostic claim is attractive and equally
gated on the graph existing.

**FSRS is still premature**, and part 2 says so more precisely than part 1:
uncalibrated parameters can schedule a card 47 days out after two reviews.
Population-level priors are the mitigation, and we have no population.

### 2.4 The two criticisms worth sitting with

**"High cognitive friction may deter casual users."** Fair, and it is the
flip side of every deliberate choice here. The honest position is that this is
the product, not a defect in it — but "we meant to" is not "and therefore
nobody bounces". The place to reduce friction without touching the argument is
where it is *extraneous* load in CLT's sense: bad presentation, not real
difficulty. That is a UI question and it is free.

**SDT gives a second, independent framing of the locked-topics objection.**
`PROJECT.md` records that hard locks were removed for interleaving and learner
autonomy, then reinstated by request, with the objection preserved. The report
arrives at autonomy from a different direction — it is one of SDT's three
needs, and removing it is named as a driver of the same overjustification
dynamic that produced Hanus & Fox's lower exam scores.

That is not new evidence. It is the same objection with a second mechanism
attached, and it is worth reading before the locks are treated as settled.

Note the report **also** endorses locking, under Bloom's mastery gates. It is
arguing both sides in different sections and does not notice. The resolution
is probably that Bloom's gates are about *prerequisites* — you may not do
calculus before algebra — while our locks are about *sequence within a course*
that may have no prerequisite relation at all. Worth checking topic by topic
rather than as one policy.

---

## 3. Ranked, for the plan

By (value ÷ cost), not by how interesting the idea is.

| | Change | Cost | Blocked on |
|---|---|---|---|
| 1 | **Raise five-phase coverage from 19%** — see §5 | content work, no code | nothing |
| 2 | **WSM gains the overdue term** | trivial | nothing |
| 3 | **Start collecting SER and SDI** — inputs already exist | low | nothing |
| 4 | **Confidence before feedback + hypercorrection flow** (24–48h re-test) | medium | nothing |
| 5 | **Acquisition state** — intraday ladder before the SRS takes over | medium | deciding whether the exam alone is a strong enough encoding check |
| 6 | **Backward fading in the `example` phase** | medium | #1 first — fading a chunk with no predict and no recall decorates a room with two walls missing |
| 7 | **DRR, MGV, HRI, IPR telemetry** | medium | #4 must land first for HRI |
| 8 | **Per-item difficulty + adaptive selection** | high | usage data |
| 9 | **FSRS migration** | high | 50–1000 reviews per learner |
| 10 | **Prerequisite DAG + FIRe** | very high | a graph that does not exist |

**Items 7–10 are all blocked on users.** Four of the ten best ideas here
cannot be evaluated, let alone tuned, before launch — which is itself an
argument for shipping and then reading the numbers.

---

## 4. Still to check  **[verify]**

- FSRS's 15–40% review reduction: baseline and retention target.
- The metric suite's targets. They read as reasonable but no source is given
  for any of them specifically, and #2 and #6 would be built against them.
- Butler on hypercorrection decay: the 24–48h window and the one-week fade
  both come from it, and both are load-bearing for #3.
- The 70% onboarding-diagnostic reduction — only matters if the DAG is ever
  built.

The 85% Rule now has a real paper behind it (*The Eighty Five Percent Rule for
optimal learning*) and comes off this list.

---

## 5. The thing the report could not see — MEASURED

It describes the five-phase unit as though every chunk has five. Both
`predict` and `recall` are OPTIONAL in the schema, and `phasesFor()` builds
the list from whatever a chunk actually carries.

Counted, 2026-09-02, with `library/content/count-phases.js`:

| Course | Chunks | predict | recall | all five |
|---|---|---|---|---|
| bike-a3 | 21 | 7 | 21 | 7 |
| intro-cs | 141 | 23 | 67 | 23 |
| philosophy | 9 | 3 | 9 | 3 |
| **Total** | **171** | **33 (19%)** | **97 (57%)** | **33 (19%)** |

**81% of chunks run the three-phase flow.** The two phases missing are
pretesting and generation — the two with the strongest evidence behind them
in the entire app, and the two the report spends whole sections on.

This is not an engine problem. The engine supports all five and has since the
schema was frozen. It is **content that never adopted them**, and it is worth
more than anything else on the shortlist: turning on a technique already built
beats adding a technique that is not.

Note the split is uneven in a way that suggests how it happened.  is
at 57% and  at 19%; bike-a3 and philosophy have recall on *every*
chunk but predict on a third. Recall was adopted as content was written;
predict mostly was not.

Nothing in the research shortlist should start before this number is either
raised or deliberately accepted. Adding backward fading to a  phase
in a chunk that has no  and no  is decorating a room with
two walls missing.
