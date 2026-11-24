# Knell as proof of skills — an honest version

Written 2026-11-24 for a LinkedIn profile. Knell was designed and directed
by its author; the code was written by Claude (an AI) under that direction.
Every claim below points at something in this repository. Where the proof
is weak, this says so.

(Not to be confused with `docs/SHOWCASE.md`, which lists what is in and
out of the app.)

## Evidence, per skill

| Skill | What in Knell proves it | Whose | Confidence |
|---|---|---|---|
| Product Design | The decisions below, each recorded with its reason in `docs/archive/UPDATESTACK-frozen.md` and `BACKLOG.md`; the live demo | Decisions: the author's. Building them: Claude's | **Strong** |
| AI-Assisted Development | The whole repository: 223 commits, 192 of them carrying Claude's co-author line (the rest are early uploads and a merge); the working method (a queue of asks, one decision at a time, nothing done until seen in a browser) in `UPDATESTACK.md` and `BACKLOG.md` | Direction: the author's. Code: Claude's | **Strong** |
| SQL | 28 Postgres migrations in `supabase/migrations/`: row-level security, a rewards ledger, race-safe purchases | The rules they enforce: the author's. Every line of SQL: Claude's | **Weak** until the migrations below are understood |
| Python | Nothing. Knell has no Python | — | **None** |
| Java | Nothing. Knell has no Java | — | **None** |

**Before claiming SQL from Knell, understand these six migrations:**
`0001_init.sql` (tables and row-level security), `0003_economy_rpcs.sql`
(server functions the browser may call), `0011_grant_race_lock.sql` (two
requests at once), `0012_earning_ledger.sql` (paying each reward once),
`0025_delete_anonymises.sql` (deleting an account without breaking
threads), `0026_overdue_decay.sql` (the Garden's withering, computed by
the server).

One correction against overclaiming: the Garden was the author's request,
but its rule (a plant's size is its review interval) was Claude's reading
of it; `PROJECT.md` says the Garden "was requested without a spec".

## 1. For LinkedIn — one line per skill (under 200 characters)

- **Product Design:** Designed Knell, a study app (live demo): plants that grow only with what you remember, give-only reputation, rewards paid by the server. Every product call mine.
- **AI-Assisted Development:** Directed an AI (Claude) to build Knell: 223 commits, one decision at a time, every change checked in a browser. I set the rules and priorities; the AI wrote the code.
- **SQL:** Specified the server rules of Knell in Postgres (row-level security, a once-only rewards ledger, race-safe purchases). The SQL was AI-written to my spec.
- **Python:** Not shown in Knell.
- **Java:** Not shown in Knell.

## 2. Ten product decisions

1. **Rewards are paid by the server, and the app waits for its answer** — a number shown is a number that is true; devtools can no longer mint XP or tokens (claim_earning, 0012).
2. **Reputation can only be given away, never spent on yourself** — your standing is what others gave you, so it cannot be farmed.
3. **Reputation is a daily allowance that expires, not a balance** — nothing to hoard or trade, so it stays a vote, not a currency.
4. **The Arcade's games were removed and its tile became a Forum** — studying stopped paying into gambling-style games and started paying into helping others.
5. **Every cosmetic became free** — the shop stopped selling looks; money and rank no longer decide how the app feels.
6. **A streak day requires passing a topic exam** — a streak measures learning, not opening the app.
7. **The exam gate: 10 questions at 8/10, chosen over 9/10 with the error rates of both on the table** — decided, not built yet.
8. **A ban wipes the account** — no half-state of suspension to enforce or explain.
9. **One account, one profile** — the data model, sync and the Forum's identity all became simpler.
10. **Retired features are kept as museum exhibits, and the demo holds no production key** — the history stays visible to anyone, an employer included, without exposing the server.

## 3. Learn before claiming

**Spaced repetition (SM-2).** After you pass a topic it comes back for
review after 1 day, then 6, then each gap times an "ease" number. Get it
right and the gaps grow; get it wrong and it comes back tomorrow. The
point is to review just before you would forget, which is cheaper than
reviewing on a fixed schedule.

**Row-level security.** The database itself checks who is asking before
it returns or changes a row. A policy says, for example, "a user may read
and write only rows where user_id is their own id". It is enforced on the
server, so a modified browser cannot get around it.

**Server functions (RPCs).** Some actions, like paying a reward or buying
a course, are not done by writing to a table but by calling a function on
the server. The function checks the rules and changes the data in one
step, with rights the browser does not have. That is why the browser can
ask for a reward but cannot grant one.

**A ledger that pays once.** Every reward has an id, like
"topic:networks". The server records each id it has paid, and a second
claim for the same id is refused. This makes repeating a request, by
accident or on purpose, harmless.

**Race conditions.** Two requests arriving at the same moment can both
see "enough tokens" and both spend them. The fix is to check and change
the balance in one statement, or to lock the row while checking. Knell's
test sent ten purchases at once and exactly one succeeded.

**Migrations.** The database's shape is built by numbered scripts run in
order, and each one only adds or changes, never silently rewrites
history. Anyone can rebuild the same database from scratch by running
them. Knell checks that the scripts and the app agree (`check-schema.js`).

**What "AI-assisted" honestly means here.** The author decided what to
build and why, wrote down each decision, and checked the result; the AI
wrote the code and the SQL. Be ready to say which parts you could rebuild
yourself and which you would need to read first. That honesty is a
stronger answer than claiming everything.

## 4. Screenshots to take

| Screen and state | Skill |
|---|---|
| The demo's start screen: the garden scene with a note open after tapping a plant | Product Design |
| The Garden screen with its scene and a drop over a plant that is due | Product Design |
| GitHub, the commit list showing "Co-Authored-By: Claude" and a commit message that explains a decision | AI-Assisted Development |
| `supabase/migrations/0012_earning_ledger.sql` open on GitHub | SQL (after learning it) |
