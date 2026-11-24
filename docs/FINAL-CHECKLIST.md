# Knell — final-version checklist

Built 2026-11-24 from PROJECT.md, docs/ARCHITECTURE.md, UPDATESTACK.md and
the stack it froze (docs/archive/UPDATESTACK-frozen.md), and BACKLOG.md,
then checked against the code. Worked one item at a time; nothing is
started without an OK.

**The latest version** is this folder, `files/Knell_build/Knell` (git, branch
`main`, github.com/Isk1zz/Dojo-Gamify-Learn). `files/Knell_build/knell-demo`
is generated from it by `tools/make-demo.js`. `Knell_Build_Toolkit`,
`Knell_Toolkit` and `Knell_Encyclopedia` are copies and side projects from
2026-11-02 with no git; the only `CLAUDE.md` files are in those copies, and
they describe the copies, not this app. This repo has no `CLAUDE.md`.

**Legend.** Size: S under an hour, M half a day, L more.
Verified: *code* = confirmed in the code or by running a script here;
*doc* = only in a document. ⚠ = the docs and the code disagree.
Plan: **MVP** = needed for the final either way; **MVP·accounts** = needed
only if accounts come back (path B below); *after* = after release.

---

## 0. One decision first

- [ ] **0. What "final" means.** The server (Supabase project in
  `core/supabase.js:36`) has been asleep since autumn 2026. **A**: the final
  has no accounts — open access, progress in the browser, like the demo;
  most blockers below fall away. **B**: accounts come back — restore the
  server and clear every MVP·accounts item. Recommended: **A for the final,
  B as the first update after it.** · S · doc + code

## 1. LAUNCH BLOCKERS — before a real user signs up

- [ ] **B1. The server is asleep.** Restore or recreate the Supabase project,
  re-run `supabase/migrations/0001…0027`; `check-schema` reports no drift
  today. · `core/supabase.js:36`, `supabase/` · M · code (schema ran) + doc
  (asleep) · MVP·accounts
- [ ] **B2. Email confirmation, domain and SMTP.** ⚠ The frozen stack says
  confirmation is OFF; `core/auth.js:226` says ON. Needs a domain and a
  sender (Resend), then the dashboard switch. · M · doc vs code · MVP·accounts
- [ ] **B3. "Accounts are made by hand-written SQL."** ⚠ The code has a full
  sign-up form (`core/auth.js`, `signUp`). Confirm self-sign-up works on the
  server; never insert `auth.users` by hand (NULL token columns break
  sign-in). · S · doc vs code · MVP·accounts
- [ ] **B4. The nickname is not sent at sign-up.** `signUp({ email, password })`
  (`core/supabase.js:77`) carries no nickname; it is written only on the
  first sign-in from the same device (`core/auth.js:235, 264`). Send it as
  sign-up metadata so migration 0024's trigger sets it; backfill old
  accounts. · S · code · MVP·accounts
- [ ] **B5. No attack pass on sign-in.** Rate limits and email enumeration
  were never tested; `auth.emailTaken` tells anyone an address is
  registered (`core/i18n.js`). · M · code (message) + doc (tests) ·
  MVP·accounts
- [ ] **B6. The checkout is a demo.** Token packs and patron tiers credit
  without payment (`shop/tokens.js` `buyPack`, `tok.demoNote`). Remove buying
  from the final, or wire a payment provider with the country check at
  payment. · S (remove) / L (wire) · code · **MVP**
- [ ] **B7. The real site's front door.** Open access is on only in the demo
  (`core/core.js:46`, `OPEN_ACCESS = DEMO`); the real start page says
  accounts are closed and links to the demo. Path A: turn open access on,
  or point the real address at the demo. · S · code · **MVP**

## 2. BROKEN — bugs, and docs that don't match the code

- [ ] **K1. The content check can't read Hebrew.** `LANGS = ["en", "ru"]`
  (`library/content/check-content.js:51`), so since Hebrew it falsely fails
  the e-bike and philosophy courses ("[object Object]"). Add `he`. · S ·
  code (ran) · **MVP**
- [ ] **K2. Flashcard double tap counts twice.** `answerFlashcard` has no
  guard (`library/library.js:2655`). · S · code · **MVP**
- [ ] **K3. Import wipes everything without asking.** No confirm, no backup
  (`settings/settings.js:217`, `library/stats.js:338`). · S · code · **MVP**
- [ ] **K4. Lobby flashes cards → star on first paint.** Reported 2026-08-27,
  never diagnosed. · M · doc · *after* (needs a repro)
- [ ] **K5. "Watered! +5xp" sits on the Review button.** `BACKLOG.md:2129`.
  · S · doc (old, may be gone) · *after*
- [ ] **K6. PROJECT.md is from August.** ⚠ Says there is no LICENSE (there
  is), accounts aren't wired (they were), five-phase lessons aren't built
  (they are), one course (three), DB version 5, points at `app.js`. · M ·
  code · **MVP**
- [ ] **K7. ARCHITECTURE.md breaks its own rules.** ⚠ "Nothing decays on a
  wall clock" vs the Garden withering (`garden/garden.js`, migration 0026);
  "no network" vs supabase-js; `Games.settle` is gone; museum and letter
  styles sit in `base.css`. · S · code · **MVP**
- [ ] **K8. The frozen stack lists built things as open.** ⚠ Earning is
  wired (`core/supabase.js:202`), the Forum's three figures exist
  (`forum/forum.js:208`), rank icons use the rank number
  (`shop/ranks.js:133`), the public admin strings are gone
  (`data/db.js:398`); counts are off: 5 Intro to CS modules fail (not 4),
  10 quotes are unverified (not 9). Add a correction note. · S · code · **MVP**
- [ ] **K9. BACKLOG.md has 13 open boxes, mostly done or dead.** Final Quiz,
  badges, profile screen, wallet tip are built; Arcade, betting, `$`, Stars
  are gone; `shop/life.js` is already deleted. · S · code · **MVP**
- [ ] **K10. docs/BACKEND-ROADMAP.md is written for Firebase.** Only a
  banner says otherwise. · S · doc · *after*

## 3. UNFINISHED — started, not done

- [ ] **U1. The Forum.** Steps 0–6 built; needs the server; the posts table
  has no scope column; two accounts can trade reputation (undecided). ·
  L · code + doc · *after*
- [ ] **U2. Cloud sync.** Built (`core/sync.js`, field-by-field merge), not
  run since the server slept. · M · code · MVP·accounts
- [ ] **U3. Learning-engine overhaul.** 8 of 10 decided items unbuilt:
  10-question exams at 8/10 with 290 new questions, next-day verification,
  decoupled gate score, typed-recall flashcards, withering → dormancy,
  allowance from review work, Q-matrix. Only #5 is built (`fcd81ae`); exams
  are still 5 questions, no gate in the code. · L · code · *after*
- [ ] **U4. Intro to CS content.** Modules m1–m5 fail the content standard
  (old format, no sources); the course is English-only. · L · code (ran) ·
  *after*
- [ ] **U5. Server-side trust gaps.** Exams are scored on the client and the
  answer keys ship in the data files; no earning rows for reviews or the
  final quiz; rank rewards credited locally; unit rewards only in Intro to
  CS. · L · doc · *after*

## 4. LEGAL

- [ ] **L1. Privacy policy and terms are marked "Draft".** `set.draftNote`
  (`core/i18n.js`, `settings/settings.js:95`). Finalise for the chosen path;
  path A is far simpler (no accounts, no cloud). · M · code · **MVP**
- [ ] **L2. No Forum rules, report handling, or "your posts stay without
  your name".** Only four terms texts exist (`legal.terms*`). · S · code ·
  MVP·accounts
- [ ] **L3. 10 unverified quotes.** `verified: false` in
  `library/content/quotes.js`: verify or remove. · M · code · **MVP**
- [ ] **L4. Licence vs public repo.** LICENSE is All Rights Reserved, the repo
  is public (anyone can read and fork). Keep, or go private. · S (decision)
  · code · **MVP**
- [ ] **L5. "Knell" is not cleared as a name.** USPTO, EUIPO, ILPO, classes 9
  and 41. · M · doc · *after* (MVP before a commercial launch)
- [ ] **L6. The A3 course's official questions.** 40 questions copied word for
  word from gov.il: confirm the reuse terms. The e-bike registration fact
  (since 2024-08-01) is unverified and not in the course. · S–M · code + doc
  · **MVP**
- [ ] **L7. Content rights.** Textbooks are all-rights-reserved (one is
  CC BY-NC-ND); the legacy Intro to CS modules predate the "own words" rule.
  · M · doc · *after*
- [ ] **L8. Old cheat codes in public git history.** `0a4a2d2`; harmless now
  that admin is decided by the server (`admin/admin.js:43`). Rewrite history
  only if a code was reused elsewhere. · S · code · *after*

## 5. POLISH

- [ ] **P1. Lobby and start-screen sounds and effects.** Asked 2026-11-24
  ("lobby + prelobby sfx + vfx"). · M · new ask · **MVP**
- [ ] **P2. No share preview.** `index.html` has no `og:` tags, so a shared
  link shows a grey box. · S · code · **MVP**
- [ ] **P3. The token icon is the 🪙 emoji** (silver on some phones): draw a
  coin. · S · code · *after*
- [ ] **P4. Shareable result cards; links to a topic (`?topic=`).** · M · doc ·
  *after*
- [ ] **P5. Russian «блок» means both unit and chunk.** · S · code · *after*
- [ ] **P6. Design asks never scoped:** flat THE FINALS-style theme, Cosmos
  theme, weather effects, pentagram, ring flourish. · L · doc · *after*
- [ ] **P7. The rotate slider was never checked in real Opera.** · S · doc ·
  *after*

## 6. CUT — drop from the final

- [ ] **C1. The four placeholder courses** (biology, chemistry, physics,
  science literacy): a final shouldn't list courses with no lessons.
  `library/content/` · S · code
- [ ] **C2. The pretend checkout**, if there are no payments: a purchase that
  isn't one reads as a scam. `shop/tokens.js` (goes with B6) · S · code
- [ ] **C3. Leftovers of removed economies** in the backlog: betting cap,
  wallet bank, black market, Career weekly ladder, "spend `$` on profile",
  Stars currency, `unlockallunits`: their systems are gone. · S · doc
- [ ] **C4. Unused helpers** `getLastDividendClaim` / `setLastDividendClaim`
  and `profile.tickets` (keep the stored fields, per the migration rule;
  drop the dead code). `data/db.js` · S · doc
- [ ] **C5. The post-completion questionnaire:** needs a server and a
  purpose. · S · doc
- [ ] **C6. Diia, the marketing strategy, the plan-vs-reality document:** not
  part of shipping the app. · S · doc
- [ ] **C7. `scenes/prototype.html` on the public site:** a developer harness,
  not a screen; keep it in the repo, leave it out of the release copy. · S
  · code

---

## Order

**Path A (recommended):** 0 → B7 → C1, C2 → K1, K2, K3 → P2 → K7, K8, K9 →
L4, L6 → L3 → L1 → K6 → P1. Everything else after release.

**Path B adds, first:** B1 → B4 → B3 → B2 → B5 → U2 → L2.

## Where the docs and the code disagree

B2 (email confirmation on/off), B3 (sign-up form vs "SQL by hand"), K6
(PROJECT.md), K7 (ARCHITECTURE.md), K8 (frozen stack), K9 (BACKLOG boxes).
