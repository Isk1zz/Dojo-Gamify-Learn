# CONTENT-MODEL.md — the standard every module is written to

**This file is the spec.** `_template/` is the starter, `registry.js` is the loader,
PROJECT.md §9/§10 is the history. When they disagree, this file wins.

Module 5 (Unit 8, Machine Learning) is the reference implementation. Modules 1–4
predate it and are being brought up to it — see *Backfill status* at the bottom.

Everything here is a **content convention**, not a schema change. `library.js`
already renders all of it. Nothing below requires touching a branch.

---

## 1. The shape

```
Course → Unit → Topic → Chunk → 5 exam questions
```

Measured from module 5, and these are the targets, not averages to drift from:

| Level | Target | m5 actual | m1–m4 actual |
|---|---|---|---|
| Topics per module | 6 | 6 | 4–6 |
| Chunks per topic | 3 | 3 | 2–4 |
| Exam questions per topic | 5 | 5 | 5 ✓ |
| `explain.blocks` per chunk | 3 (2–4) | 3 | **0 — legacy `text`** |
| Words of explanation per chunk | **~200** | 202 | **72–89** |
| `explain.sources` per chunk | **2** | 2.1 | **0** |
| Analogy length | ~45 words | 45 | 13–35 |
| `example.steps` per chunk | 3–4 | 3.4 | 2–6 |

The 200-word figure is the single biggest difference between Unit 8 and Units 6–7.
Units 6–7 average **84 words per chunk** — roughly one paragraph. That is a
definition, not a lesson.

---

## 2. The chunk

### 2.1 `explain` — always `blocks`, never `text`

`renderExplain` still accepts a bare `text` string so modules 1–4 keep working.
**Do not write new content that way.** One string renders as a wall; blocks render
with sub-headings a reader can navigate.

```js
explain: {
  blocks: [
    { text: `...` },                          // the lede — NO heading
    { heading: "The formal version", text: `...` },
    { heading: "Why this matters in practice", text: `...` }
  ],
  analogy: `...`,
  sources: [{ ref: `...`, note: `...` }]
}
```

**Block 1 never carries a heading.** It states the idea in plain words before any
terminology arrives. Blocks 2+ always carry one — the heading is the reader's map.

A useful three-block spine, borrowed from m5 and worth defaulting to:

1. **The plain statement** — what it is, no jargon, no heading.
2. **The precise version** — the formal definition, the standard, the mechanism.
3. **Why it matters / what it rules out** — the boundary case that makes it real.

`text` is HTML. `<strong>` for the term being defined the first time it appears,
`<em>` for emphasis, `<br><br>` between paragraphs inside one block.

### 2.2 `analogy` — yours, always

One analogy per chunk, ~45 words, and it must be **written for this app**. Do not
lift the textbook's analogy. This is a licensing requirement (§5), not a style note.

The m1–m4 analogies are mostly one clause ("Like a postal system connecting
different houses"). That's a restatement wearing an analogy's clothes. A real one
carries a *second* move — it shows where the mapping holds and where it breaks.

### 2.3 `sources` — two per chunk, real ones

Every chunk cites what its claims rest on. Rendered in a collapsible
`<details>` box, so it costs the reader nothing and lets them verify.

```js
sources: [
  { ref: `Mitchell, T. M. (1997). <em>Machine Learning</em> (p. 2). McGraw-Hill.`,
    note: `The E / T / P definition quoted above.` }
]
```

`note` says **what this source supports**, not what the source is about. A citation
that doesn't attach to a specific claim is decoration.

Prefer, in this order: primary standards (RFC, NIST SP, IEEE, ISO) → the standard
textbook → a named paper. For Units 6–7 the primary sources are unusually good and
freely readable — RFC 791/793/1034/2616, IEEE 802.3 / 802.11, NIST SP 800-63B.
Use them.

**Never invent a citation.** Not a page number, not an edition, not a quote. The
same rule that governs `quotes.js` governs this — see its header for why.

### 2.4 `example` — 3–4 steps, contrasting

The strongest examples in m5 are **discrimination sets**: three cases where two
fail the definition and one passes ("Is It Learning? Three Cases"). That teaches the
boundary. A list of three things that are all obviously the concept teaches nothing.

### 2.5 `quiz` — the apply phase

One question. **Application, not restatement.**

- ✗ "What is the primary purpose of a computer network?" (m1 — recognition)
- ✓ "A model scores 98% on training and 61% on new data — what happened?" (m5)

All four distractors must be **real misconceptions** someone could actually hold.
"To increase the physical weight of computers" (m1) is a wasted slot — it reduces
a 4-way question to a 3-way one.

`explanation` says why the right answer is right **and** why the tempting wrong one
is tempting.

### 2.6 `wisdomTags` — currently used by nothing

`library.js` pools the tags of every chunk in a topic and biases the quote shown on
the exam-pass screen. **Zero chunks across all five modules set it**, so every quote
is currently drawn at random from the whole pool.

Set it. Vocabulary already present in `quotes.js`:

```
beginning · persistence · effort · uncertainty · tradition · self-knowledge
self-deception · correction · evidence · change · planning · limits
feedback · simplicity
```

1–2 tags per chunk. Pick for the *learner's state* at that chunk, not the subject
matter — a chunk on debugging wants `correction`, not `evidence`.

---

## 3. Where `predict` and `recall` go

The schema is frozen and both fields are optional (LIBRARY.md). m5 uses them on
**one chunk out of eighteen** — the worked example. "Match module 5" therefore
doesn't answer the question, so here is the rule:

> **`predict` on the FIRST chunk of a topic. `recall` on EVERY chunk.**

A 3-chunk topic runs:

```
chunk 1   predict → explain → example → apply → recall
chunk 2             explain → example → apply → recall
chunk 3             explain → example → apply → recall
```

**`recall` moved.** It was last-chunk-only in this file's first draft, to save
writing. That was wrong once the review queue was looked at properly:

`startNextDueReview()` hands off to `startTopic()`, which walks the topic from
`resumeChunkFor()` — and that returns 0 for a finished topic, so a due review
**re-reads the whole topic and retakes the same exam**. Re-reading is the weakest
technique in Dunlosky et al., which LIBRARY.md itself says. The review is meant to
serve `recall` cards instead. At one card per topic a 26-topic course has a
26-card deck, which is not a deck. Per chunk it is ~78.

So `recall` now does two jobs — closing out a chunk, and stocking the review
queue — and the cost argument that justified writing fewer of them no longer
holds. Writing them now costs a paragraph each; retrofitting 26 topics later
would cost what retrofitting always costs.

`predict` stays first-chunk-only. **Pretesting** works at first contact with an
idea; by chunk 2 the learner has already read about it, so a "guess before you
read" prompt is just a quiz with a friendlier label and its whole value — the
unprimed attempt — is gone.

### `points` is mandatory, not optional

LIBRARY.md argues a generous self-grade costs nothing *because recall isn't
scored*. True while recall was only a learning phase. Once it drives the SM-2
interval it **is** scored, and being generous buys a **longer** gap — which is
the same as choosing to forget.

So every `recall` carries a `points` checklist and the learner grades against it
("you hit 2 of 4"), never against a feeling. The checker fails a recall without
one.

---

## 4. Answer keys — read this before "fixing" anything

Two different problems that look identical in a grep, and only one of them is real.

**Exam questions: already solved in code.** `startExam` runs
`shuffled(topic.examQuestions).map(shuffleQuestion)` on every attempt, including
retries. The stored `correct` index is discarded before the learner sees anything.
Rebalancing exam answer keys by hand is busywork.

**Chunk quizzes: live exploit.** `chunk.quiz` is rendered straight from the data,
in stored order. Measured:

| Module | Unit | chunk quiz A / B / C / D |
|---|---|---|
| 1 Networks | 6 | 0% / 42% / 50% / 8% |
| 2 The Internet | 6 | 6% / 38% / 50% / 6% |
| 3 Security | 6 | **0% / 91% / 9% / 0%** |
| 4 Programming | 7 | **0% / 89% / 11% / 0%** |
| 5 Machine Learning | 8 | 22% / 22% / 28% / 28% |

In Module 3, ten of eleven chunk questions answer B. **Pressing B clears Units 6–7
without reading.** That is not a content-quality problem, it's a broken assessment.

The permanent fix is to apply the existing `shuffleQuestion` to chunk quizzes too —
one place in `library.js`, and it immunises all 26 topics and every future course
against this. No option text anywhere is position-dependent (checked: no "both A
and B", no "none of the above"), so it is safe.

Until that lands, write new content to a genuine A–D spread and check it with:

```
node library/content/check-content.js
```

---

## 5. Licensing — the constraint that shapes the writing

The course textbooks are all-rights-reserved and one is CC BY-NC-ND. The app is
intended for commercial release. Therefore:

- **Teach the concept.** Concepts aren't copyrightable; expression is.
- **Cite an authoritative or public-domain source** for the claim.
- **Write your own analogy, your own example, your own question.**
- Never paraphrase a textbook passage closely enough that the sentence structure
  survives. If you're editing their sentence, you're copying it.

Module 5 was written this way end to end and is the proof it's workable.

---

## 6. Global ids

Unit ids and topic ids are unique **across every course**, because progress,
reviews and the Garden are keyed on them. Two courses reusing an id silently share
progress. `Content.build()` logs a console error naming both offenders — don't rely
on it, pick fresh ids.

Taken: units **1, 2, 3, 4, 5, 6, 7, 8** (Intro to CS). Ids 6–8 are historical
names kept because saved progress depends on them; units 1, 2, 3, 4 and 5
were added later and match the course's own numbering, so they sort before
the historical ones rather than after.

Also taken: **31** (Теория A3 — электровелосипед). **9–30 are reserved** for
the four science courses — CURRICULUM-PLAN.md §2 holds that allocation, so a
course that grabs one of them collides with a plan rather than with existing
content, which is worse: nothing errors until the science course is written.
**Next free id: 32.**

---

## 7. Checklist before a module ships

- [ ] 6 topics, 3 chunks each, 5 exam questions per topic
- [ ] Every `explain` uses `blocks`, first block unheaded, ~200 words total
- [ ] 2 sources on every chunk, each `note` naming the claim it supports
- [ ] Analogy original and ~45 words, showing where the mapping breaks
- [ ] `example.steps` contrast rather than enumerate
- [ ] Every quiz tests application; all four distractors plausible
- [ ] `predict` on chunk 1 of each topic, `recall` on EVERY chunk with `points`
- [ ] `wisdomTags` set on every chunk
- [ ] `node library/content/check-content.js` reports no failures
- [ ] Topic and unit ids don't collide with anything in §6

---

## Backfill status

| Module | Unit | Blocks | Sources | ~Words/chunk | Quiz spread | predict/recall | wisdomTags |
|---|---|---|---|---|---|---|---|
| 1 Networks | 6 | ✗ legacy | ✗ 0 | 84 | ✗ | ✗ | ✗ |
| 2 The Internet | 6 | ✗ legacy | ✗ 0 | 72 | ✗ | ✗ | ✗ |
| 3 Security | 6 | ✗ legacy | ✗ 0 | 77 | ✗ 91% B | ✗ | ✗ |
| 4 Programming | 7 | ✗ legacy | ✗ 0 | 89 | ✗ 89% B | ✗ | ✗ |
| 5 Machine Learning | 8 | ✓ | ✓ 38 | 202 | ✓ | 1 chunk | ✗ |
| 6 Databases | 5 | ✓ | ✓ 36 | 213 | ✓ | ✓ full | ✓ |
| A3 Электровелосипед | 31 | ✓ | ✓ 38 | 168 | ✓ | ✓ full | ✓ |

The A3 module is the first one written to this file from scratch rather than
brought up to it, and it is the only one reporting zero warnings as well as
zero failures. Worth opening next to whatever you write — it is shorter than
module 6 and the whole standard is visible in one file.

Its 168 words/chunk sits below the 200 target and that is a **language
artifact, not thin content**: the module is in Russian, which carries in one
inflected word what English spends two or three on ("на велосипеде" vs "on the
bicycle"). `words()` counts space-separated tokens and cannot see that. The
150-word floor still catches genuinely thin chunks, so the check was left
alone rather than given a per-language target — but don't "fix" this row by
padding the Russian, and don't take 168 as licence to write 168 in English.

57 chunks across modules 1–4 to bring up. Roughly 11,500 words of new explanation,
~114 citations, 57 quizzes rewritten. That is four modules of writing, not an edit
pass — stage it one module at a time, smallest first (m3 → m1 → m2 → m4).
