# PLAN.md — start here when you come back

Written 2026-08-16, before a break. **You do not need to remember
anything to use this.** Everything is committed and pushed; the app runs.

Order matters below. Each phase is independently useful — stopping after
any one of them leaves the app in a working state.

---

## Phase 1 — Notes  *(no blockers, build any time)*

The only substantial feature that needs nothing from anyone else.

**What it is:** write notes on any topic or chunk. Yours, private,
offline, exported with your data.

**Why it comes first:** a note is a **draft**. When the Forum opens,
publishing a note as a post is a small step from something you already
wrote — which is how the Forum gets content on day one instead of
showing everyone a blank page.

**Shape:**
- New branch folder `notes/` + `notes/NOTES.md` (every branch has a doc)
- Store: `DB.getNotes/setNote/deleteNote`, keyed by topic id
- Entry points: a note button in the lesson view; a list on the Notes screen
- Export: fold into the existing `DB.exportData`
- Lobby: **the Star ring holds 6 tiles.** A 7th needs the ring geometry
  revisited — that is the one non-obvious cost here.

---

## Phase 2 — Science Literacy content  *(needs your source material)*

**Why this course first:** 4 units instead of 6, no maths dependency, it
teaches the reasoning the other three lean on, and method/reasoning are
*concepts* rather than anyone's expression — the most defensible thing
to write from scratch.

**Sources:** OpenStax is CC BY — figures and examples may be adapted
with attribution, unlike the CS textbooks. See
`library/content/CURRICULUM-PLAN.md` §1. **Never invent a citation.**

**Units 27–30** (already reserved, full topic list in CURRICULUM-PLAN):
27 Method & Evidence · 28 Data & Statistics · 29 Reasoning & Bias ·
30 Science in the World

**What I need from you:** source text, chapter outlines or extracts.
Without them I would be writing from general knowledge, which is exactly
how invented citations happen.

**Shape per module:** 6 topics × 3 chunks, ~200 words explanation per
chunk, 2 real citations, 5 exam questions per topic, questions test
*application* not recognition. Run
`node library/content/check-content.js science-literacy` before committing.

---

## Phase 3 — Supabase  *(needs you; unblocks everything social)*

This is the gate. The Forum, reputation, seasons and Notes-sync are all
downstream of it and **cannot** be built first.

### 3a. What you do (about an hour, no code)
1. Create a project at **supabase.com** (free tier is enough — this is
   why Supabase beat Firebase: no paid plan needed for server-side logic).
2. Copy the **project URL** and **anon key** into a config file.
3. Enable **email auth** (magic link is simplest — no password handling).
4. Nothing else. Do not create tables by hand; migrations come with code.

### 3b. What I do
- `data/remote.js` — a sync seam next to `DB`, so `db.js` stays the
  local store and nothing else in the app learns the network exists
- Auth screens (sign in / out), profile linking
- Tables: `profiles`, `notes`, `posts`, `points`, `seasons`
- **Row-level security** — the rules that must be server-side:
  - you cannot give points to yourself
  - max 10 points to one user per month
  - max 1 point per post
  - a client-side check is a suggestion; anyone can edit their client

### 3c. Legal, triggered by accounts *(not by payments)*
The moment a server stores an email you are handling personal data:
- privacy policy · terms of service · **a working delete-my-account button**

Full trigger map in `docs/LEGAL.md`. Payments come **after the engine is
finished** — decided, so Token packs stay a labelled demo until then.

---

## Phase 4 — Forum goes live  *(after Phase 3)*

Everything is already specified. Nothing here needs a new decision:

- Allowance `5 + floor(rank/5)` per day, **expires nightly**, never banks
- Spend only on others · max 10/user/month · max 1/post
- Received points accumulate into a **month**; that is the season
- Profile shows: contributed · monthly awarded · total awarded
- Achievements pay **status, never currency** (currency compounds into
  an elite by season three)
- Garden pays nothing

Reasoning for every line is in `UPDATESTACK.md`.

---

## Still undecided (one thing)

**Repo is public** with an all-rights-reserved `LICENSE`. The licence
records intent; only going private actually stops copying. Your call,
no rush.

---

## Where things are

| Doc | For |
|---|---|
| `README.md` | what the app is, the three loops |
| `PROJECT.md` | how it works, schemas, gotchas |
| `docs/ARCHITECTURE.md` | the branch contract — read before editing |
| `UPDATESTACK.md` | in-flight work, every decision and why |
| `library/content/CURRICULUM-PLAN.md` | the four science courses |
| `docs/LEGAL.md` | what triggers each legal step |
| `forum/FORUM.md` | the reputation rules |

## State of things

- Everything committed and pushed to `main`
- 1 course live (58 topics, 327 questions), 4 scaffolded as coming soon
- Library groups by track; Forum is an honest shell; cosmetics all free
- No known bugs open

---

**Nothing here expires. Come back when you feel like it.**
