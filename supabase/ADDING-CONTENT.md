# Adding a course — the step that is easy to forget

**After adding or changing ANY course content, the catalogue must be
regenerated and re-applied.** Skip it and the new content pays nothing:
the server refuses to pay for work it does not have in
`public.content_items`, and `claim_earning` answers `no such item`.

The failure is silent from the outside. Nothing crashes, nothing logs an
error in the app — a learner just finishes chunk after chunk and watches
the XP bar sit still.

---

## The two commands

```bash
node supabase/build-catalogue.js --summary
```

Prints the counts and nothing else. Run it first and check the numbers
look like the content you just added.

```bash
node supabase/build-catalogue.js > catalogue.sql
```

Writes the SQL. Paste the whole file into the Supabase SQL editor and
run it.

That is the entire procedure.

---

## What the generator does

It walks `library/content/*/data_m*.js`, runs each in a bare VM (no app,
no browser), and emits one row per piece of payable work:

| Id shape | What it is | Paid |
|---|---|---|
| `chunk:<topicId>:<index>` | a page of theory | once ever |
| `topic:<topicId>` | the topic exam bonus | once ever |
| `unit:<number>` | a unit finished | once ever |
| `course:<courseId>` | a course finished | once ever |
| `review:<topicId>` | spaced review | once per **day** |
| `final:<courseId>` | final quiz attempt | once per **day** |
| `final-first:<courseId>` | first final-quiz pass | once ever |

The reward numbers are **read out of `library/library.js`**, not retyped
— `UNIT_MONEY_REWARD`, `UNIT_TOKEN_REWARD`, `UNIT_XP_REWARD`,
`COURSE_TOKEN_REWARD`, `REVIEW_XP_PER_CARD`, `FINAL_QUIZ_XP_BASE`,
`FINAL_QUIZ_COMPLETION_XP`. Change a reward there and the next run
follows. That is deliberate: two copies of a number drift, and drift
here is invisible until someone asks why they earned nothing.

Chunk XP is the exception. It lives in the generator (`CHUNK_XP`)
because the client no longer holds it at all — the server rolls the
15-21 itself.

---

## Rows are updated, never deleted

The SQL is an upsert. `earnings` references `content_items`, so deleting
a row somebody has already been paid for would cascade their history
away. Content that disappears leaves its row behind: unclaimable, but
intact.

If a course is genuinely retired and you want its rows gone, that is a
deliberate decision to erase what people earned in it — do it by hand,
knowingly, not as a side effect of a regeneration.

---

## Things the generator will shout about

It is written to fail loudly rather than emit a wrong catalogue.

**`duplicate item id: topic:x`** — two topics share an id. Finishing one
would silently pay for the other. Fix the content.

A repeated **unit** id is not an error and is merged quietly: a unit
legitimately spans several module files (intro-cs unit 6 is networks +
internet + security, and its reward lands only when all their topics are
done).

**`UNIT_MONEY_REWARD not found in library.js, or no longer a flat object
literal`** — someone changed how a reward table is written. The
generator refuses to guess.

**`chunk XP expression not found`** — this one already happened once, and
it did its job: wiring the client to the server deleted the line the
generator was reading, and it stopped instead of writing a catalogue
that paid zero for every chunk in the app.

---

## Unit numbers must stay globally unique

`unit:<number>` uses the bare number, because `UNIT_MONEY_REWARD` is
keyed that way in the app. Today: intro-cs holds 1-8, bike-a3 holds 31,
philosophy holds 41.

**A new course must not reuse a number.** Two courses sharing unit 6
would share the unit-6 reward, and the second one to be finished would
be told it was already paid. Pick a fresh block (51, 61, ...).

The generator cannot catch this on its own — it merges repeated unit ids
on purpose, for the multi-file case above.

---

## Unit rewards are currently intro-cs only

`UNIT_MONEY_REWARD` and friends only carry keys 1-8. A new course's
units therefore pay **nothing** at unit level unless its numbers are
added to those tables in `library/library.js`.

That is today's behaviour faithfully mirrored, not a considered
decision. Worth revisiting when a second course is finished end to end.

---

## Verifying it landed

```sql
select kind, count(*) from public.content_items group by kind order by kind;
```

Compare against what `--summary` printed. They should agree exactly.
