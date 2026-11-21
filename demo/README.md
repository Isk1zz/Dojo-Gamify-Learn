# Knell — demo

**Knell is a study web app that teaches in short chunks, schedules what you pass for spaced review, and shows that schedule as a garden.**

**▶ Live demo: <https://isk1zz.github.io/knell_demo/>** — opens straight in, no account. It starts on a prepared sample profile, and your progress stays in your browser.

<p align="center">
  <img src="docs/screenshots/demo-lobby.jpg" width="49%" alt="Lobby of a sample student: rank, a 9-day streak, the menu">
  <img src="docs/screenshots/demo-course-scene.jpg" width="49%" alt="The e-bike course drawn as a junction; finished chapters ticked, the next one highlighted">
  <img src="docs/screenshots/demo-garden.jpg" width="49%" alt="The Garden: topics at different growth stages, three due for review">
  <img src="docs/screenshots/demo-lesson.jpg" width="49%" alt="A lesson in progress, resumed where the student left off">
</p>

## How it works

- **Chunks.** A topic is taught in short chunks. Each one explains one idea, shows a worked example, then asks a question.
- **Missed questions come back.** A question answered wrong is asked again before the exam, straight away and without re-reading, with its options in a new order.
- **Mastery exam.** Each topic ends in a 5-question exam. 80% (4 of 5) passes. Fail twice and the topic has to be worked through again.
- **Reshuffled on every attempt.** The exam's questions and each question's options come in a new order every time, so an exam can't be passed from memory of where the right answer sat.
- **Spaced review (SM-2).** Passing doesn't finish a topic: it schedules it for review. Reviews you get right push the next one further out (1 day, 6 days, then multiplying). A failed review sends it back to tomorrow.
- **The Garden.** Every topic you have passed is a plant, and its size is its review interval: a sprout at 1 day, a blossom at 60+. Topics left overdue for more than a week start to shrink.

## Under the hood

- **Plain JavaScript.** No framework, no build step, no npm packages.
- **Supabase (PostgreSQL) backend** in the full version: accounts, sync and the rewards economy, across 28 migrations.
- **The server decides rewards.** The browser only reports what was finished; the server decides what it is worth and whether it was already paid. An early audit found that anything kept in the browser, course ownership included, could be changed in devtools, and that is why.
- **Sync merges field by field.** Sync never takes "latest save wins". Finished topics are combined, each topic's review schedule keeps whichever device is further ahead, and counters take the higher value, so syncing twice changes nothing.
- **English and Russian**, switchable at any time.

## What this demo is, and is not

- **A copy of the app with its server switched off.** It holds no database address and no key, and it never contacts the backend. Because rewards come from the server, nothing earns XP here; the sample profile's rank stays where it is.
- **The Forum is built but not launched yet.** It needs the server, so here its tile only says so.
- **Course scenes** (a course drawn as a place you walk through) exist for one course so far, the e-bike course.

Full source, backend and history: <https://github.com/Isk1zz/Dojo-Gamify-Learn>

## My role

I designed Knell and directed every decision in it. The code was written with AI assistance (Claude).

## Licence

All rights reserved. The source is public to read, not licensed for reuse.
