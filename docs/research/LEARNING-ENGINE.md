# Learning-engine research — capture and assessment

Source: a Gemini deep-research report, *Architectural Foundations of Modern
Learning Platforms*, shared 2026-09-02. **Part 1 of 2** — part 2 is coming and
this file is to be extended, not rewritten.

Not to be acted on yet. The detailed plan comes after the forum is finished.

> **Read this first.** The source is an AI-generated report. It names real
> researchers and gives specific figures, and this session has spent its whole
> length finding places where a confident sentence was not true. Several claims
> below are load-bearing enough that building on them without checking the
> primary source would be a mistake — they are marked **[verify]**. That is not
> a swipe at the report; it is the same standard applied to my own writing an
> hour ago, when a reader caught me claiming the app works offline.

---

## 1. What the report says

### 1.1 Bjork's New Theory of Disuse — the load-bearing idea

Memory is not one quantity but two:

- **Storage strength (S)** — how deeply an item is entrenched. Once
  accumulated, it does not decay.
- **Retrieval strength (R)** — how accessible it is *right now*. Volatile;
  surges after study, decays fast without practice.

The gain from a retrieval is inversely proportional to current accessibility:

```
ΔS ∝ (1 − R)
```

When R is near peak, recall is effortless and adds almost nothing to permanent
memory (ΔS → 0). When R has decayed toward forgetting, reconstructing the trace
produces maximal storage gain (ΔS → max).

The consequence the report draws: **software that removes friction and protects
immediate fluency prevents the partial forgetting that makes later retrieval
potent.** It names the failure the *fluency illusion* — massed practice
saturates R and feels like mastery.

### 1.2 Cognitive Load Theory and backward fading

Working memory holds roughly three to four novel chunks. Load splits into
intrinsic (the material's own difficulty), extraneous (poor presentation) and
germane (building schemas).

The **worked-example effect**: beginners acquire procedural rules faster from
complete annotated solutions than from unguided problem solving. But dropping
them straight from examples into unassisted problems re-floods working memory.

The **backward-fading paradigm** (Renkl, Atkinson) bridges it: across a
multi-step task, scaffolding is removed from the **final** step backward toward
the initial conditions — the learner completes the last step alone first, then
the last two, and so on until they run the whole pipeline.

### 1.3 The 85% Rule  **[verify]**

Wilson, Shenhav, Straccia and Cohen are credited with a computational proof
that learning speed peaks at an error rate of about 15.87% — accuracy ≈ 84.13%,
rounded to 85%. Below that the task is too easy to produce cognitive change;
above it, errors compound and people quit.

The claim is that systems holding difficulty *static* drift away from this
optimum as skill grows, while systems that modulate item difficulty to hold
~85% success accelerate acquisition.

### 1.4 Pretesting, generation, hypercorrection

The first two are already in Knell and already documented. The third is new
here:

**Hypercorrection effect** (Metcalfe, Butterfield): errors made with **high
confidence** are corrected and retained *better* than errors made with low
confidence, provided explicit corrective feedback follows. A confident error
produces metacognitive surprise, which captures attention.

With a caveat the report supplies itself, attributed to Butler and colleagues:
hypercorrected memories hold over a single week, but **unreinforced
misconceptions reassert themselves over longer intervals**. So hypercorrection
has to feed into the spaced schedule, not stand beside it.

### 1.5 Interpolated testing

Szpunar, Khan and Schacter: mind wandering during passive lecture grows over
time, degrading comprehension and producing overconfidence. Inserting brief
mandatory retrieval questions every 3–5 minutes cuts mind wandering by more
than half.

### 1.6 The scheduling algorithms, compared

**SM-2** (Woźniak, 1987) — three variables per card: repetition count, ease
factor, interval.

```
I(n) = 1                if n = 1
       6                if n = 2
       I(n-1) x EF      if n > 2

EF' = EF + (0.1 - (5-q) x (0.08 + (5-q) x 0.02))
```

Failure (q < 3) resets n to 0 and the interval to 1.

Named weaknesses:
- Repeated failure drives EF down into **"ease hell"** — *the report names
  Knell's enforced EF ≥ 1.3 floor as the fix for exactly this.*
- The 1 → 6 day jump is hardcoded regardless of item complexity.
- Total reset on failure discards accumulated storage strength, producing
  excessive review volume.

**Half-Life Regression** (Settles, Meeder — Duolingo):

```
h = 2^(θ·x)          half-life from a feature vector of user history
p = 2^(−Δ/h)         recall probability after elapsed time Δ
L(θ) = Σ(y − p)² + λ‖θ‖²
```

**FSRS v5** (Jarrett Ye) — the DSR model: Difficulty (1–10), Stability (days
for recall probability to fall to a target, typically 90%), Retrievability.

```
R(t,S) = exp(ln(R_target) x t/S)
S'_recall = S x f(D,S,R)
S'_lapse  = g(D,S,R)
```

A successful retrieval at *low* R produces an amplified stability boost —
which is Bjork's ΔS ∝ (1 − R) expressed inside the scheduler.

Claimed result: **15–40% fewer reviews than SM-2 at equal or better
retention** **[verify]**, at the cost of needing roughly **50–1000 reviews**
before the model converges locally.

### 1.7 How the report characterises the competition

| Platform | Retrieval mechanism | Scheduler | Named trade-off |
|---|---|---|---|
| Duolingo | recognition, word-bank sorting | HLR inside Birdbrain (LSTM, 40-dim latent state, Elo-like difficulty) | optimises for daily active usage; users game leagues and streaks, picking the easiest decks |
| TryHackMe | applied execution in live VMs | manual, event-based | high infrastructure cost, no item-level spacing |
| Brilliant | interactive step problem solving | practice sets, post-lesson review | hard to scale to non-visual domains |
| Math Academy | active generation, timed diagnostics | **FIRe** on a prerequisite DAG | rigid, expensive curriculum engineering |
| **Knell** | active generation, confidence flashcards, simulated exams | SM-2 with EF ≥ 1.3 | **"high cognitive friction may deter casual users seeking instant gratification"** |
| MOOCs | end-of-module multiple choice | absent | ~90% attrition |

**Math Academy's two ideas are the most interesting thing in the table.**
*Fractional Implicit Repetition*: solving an advanced problem implicitly
demonstrates competence in its prerequisites, so partial spacing credit is
distributed **down the ancestor nodes** of the knowledge graph. *Spaced
Repetition Compression*: when several reviews come due, the scheduler finds one
advanced topic that exercises all of them and clears them with a single
problem.

---

## 2. My assessment

### 2.1 What confirms decisions already made

**The SM-2-not-FSRS call holds, and the report is the evidence for it.**
`PROJECT.md` §5 says FSRS "needs hundreds of reviews before its model fits, so
it performs worse at small scale." The report independently gives the number:
50–1000 reviews for local convergence. That is not a small-scale algorithm, and
Knell has no users yet.

But the same paragraph records the condition for revisiting — "only with real
usage data" — and the report supplies what is on the other side of that
condition: 15–40% fewer reviews. **That is worth a lot when there is enough
data to earn it, and worth nothing before.** The decision does not change; the
prize for revisiting it later is now quantified.

**The EF ≥ 1.3 floor is named as the fix for a real, named failure mode.** It
was already there. Nothing to do — it is just good to know the guard was
pointed at something documented rather than at a hunch.

**ΔS ∝ (1 − R) is the formal statement of what the Garden already draws.**
Growth by interval rather than by completion is a picture of storage strength;
a plant dropping back on a lapse is R decaying. The Garden turns out to be a
visualisation of the theory rather than a metaphor beside it. Worth saying
that in the app's own words at some point.

### 2.2 What is genuinely new and worth building

**Hypercorrection is the strongest candidate, because the data already exists.**
Flashcard review already collects a four-level confidence rating
(`CONFIDENCE` in `library.js`), and quizzes already record right/wrong. The
pair *confident **and** wrong* is exactly the hypercorrection signal, and
nothing currently does anything with it.

Concretely: an item answered wrong at confidence 3 ("знаю") should get emphatic
corrective feedback and an **aggressively shortened** interval, not the normal
lapse treatment. Butler's caveat says the correction fades over longer
intervals unless spaced — which means this belongs *inside* `scheduleReview`,
not in a separate UI flourish.

Cost: low. The signal is collected, the scheduler exists, and the change is a
branch in one function.

**Backward fading fits the five-phase chunk without adding a phase.** The
`example` phase already carries `steps` (three to four per chunk). Fading means
blanking the last step on first pass, the last two on the next, and so on.
It slots into the existing content schema rather than requiring one.

Cost: medium. The content schema takes it, but every module would need its
steps checked for whether they fade sensibly, and the phase currently has no
per-learner state.

**Interpolated testing mostly does not apply** — there is no video and no
long-form passive stretch. Chunks are ~200 words with a question at the end,
which is already the shape the finding recommends. The one place it might
apply is a chunk whose `explain` has grown long; that is a content-standards
check, not an engine change.

### 2.3 What I would not take

**The 85% Rule should not be applied to the exam pass mark.** They are
different quantities. The rule is about the difficulty of *practice items
during learning*; the 80% pass mark is a *mastery threshold* deciding whether a
topic enters the review schedule. Moving 80 → 85 because a paper says 85 would
be cargo-culting a number across a category boundary.

Applying it properly means **adaptive item difficulty** — selecting the next
question to hold the learner near an 85% success rate. Knell has no difficulty
model per item and no selection engine; every chunk shows its own fixed
question. That is a large build, and it collides with something already
decided: shuffling exists precisely so questions are *not* predictable, and
per-item difficulty estimates need volume Knell does not have.

**Math Academy's DAG is the right idea at the wrong scale.** Fractional
Implicit Repetition is genuinely elegant, and it needs a prerequisite graph
over thousands of micro-topics. Knell has 58 topics across three courses and no
prerequisite edges at all. Building the graph is the whole cost, and the
payoff arrives only when the review queue is big enough to need compressing.

**Duolingo's Birbrain is a cautionary tale here, not a model.** The report's
own criticism of it — that aggressive streaks and leagues push users toward the
easiest decks and away from effortful recall — describes precisely the failure
mode Knell's design documents already argue against, and precisely what the
streak reversal was flagged for.

### 2.4 The criticism of Knell, taken seriously

> "High cognitive friction may deter casual users seeking instant
> gratification."

This is the only line in the report that is *about* Knell rather than
descriptive of it, and it is fair. Every deliberate choice in this app —
retrieval over rereading, mastery floors, no purchasable progress, growth by
interval — trades approachability for durability.

The honest position is that this is the product, not a bug in it: an app that
optimises for the feeling of progress is the thing Knell exists as an argument
against. But "we meant to do that" is not the same as "and therefore nobody
will bounce". Worth deciding, before launch, **who this is for** — and
accepting that the answer excludes people.

The one place friction is worth reducing without touching the argument is
where it is *extraneous* load in CLT's sense — poor presentation, not real
difficulty. That is a UI question, and it is free.

---

## 3. Ranked, for the plan

Order is by (value ÷ cost), not by how interesting the idea is.

| | Change | Cost | Rests on |
|---|---|---|---|
| 1 | **Hypercorrection in `scheduleReview`** — confident-and-wrong gets emphatic feedback and a short interval | low | data already collected |
| 2 | **Say the ΔS ∝ (1−R) argument in the app's own words** — the Garden already draws it | low | nothing new |
| 3 | **Backward fading in the `example` phase** | medium | existing `steps` schema |
| 4 | **Per-item difficulty + adaptive selection (the 85% rule, properly)** | high | needs a difficulty model and volume |
| 5 | **FSRS migration** | high | needs 50–1000 reviews per learner first |
| 6 | **Prerequisite DAG + FIRe** | very high | needs a graph that does not exist |

Items 4–6 are all blocked on the same thing: **usage data Knell does not have
yet.** That is worth stating plainly in the plan, because three of the six
best ideas here cannot be evaluated, let alone tuned, before launch.

---

## 4. To check before building  **[verify]**

- The 85% Rule's exact figures and what they were measured on.
- FSRS's 15–40% review reduction — against which baseline, and at what
  retention target.
- Butler on hypercorrection decay over longer intervals — this is the caveat
  that decides whether change #1 is a scheduler change or a UI change, so it
  matters more than the others.
- Whether Duolingo still uses HLR at all, or whether Birdbrain replaced it
  outright. The report says both in different sentences.

---

## 5. Awaiting part 2

Extend this file rather than starting another. Sections to fill when it lands:
what it adds to §1, what it changes in §2, and whether anything in §3 moves.
