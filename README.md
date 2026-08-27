# Knell

A study app that fights forgetting.

Content arrives in small chunks — each teaches one idea, shows a worked
example, asks a question. Passing a topic's mastery exam does not mark it
finished; it schedules it for spaced review. The Garden is that schedule made
visible: topics you are losing are plants that need watering.

No build step, no dependencies. Runs entirely on `localStorage` today —
that's the current implementation, not the destination: the plan is an
online database (Supabase) that holds progress across devices and
actually enforces the rules (course ownership, the economy), not just a
client-side flag anyone can edit in devtools. See `docs/BACKEND-ROADMAP.md`.

## The end goal

Three loops, only two of which exist today:

| Loop | What it does | Status |
|---|---|---|
| **Learn** | Chunks → topic exam → spaced review | Built |
| **Retain** | Garden shows decay; watering is reviewing | Built |
| **Contribute** | Post what you know; reputation is what others gave you | **Blocked — needs accounts** |

The third is the point the first two build toward. Studying alone is where
this starts, not where it is meant to end: the Garden pays **reputation**, and
reputation can only ever be spent on *other people's* posts — never your own.
See `forum/FORUM.md`.

That third loop needs a backend — but it's not the only reason for one.
Everything is `localStorage` today: progress doesn't follow you across
devices, and course ownership is a flag the client trusts, which means
it's a flag anyone can edit. The Supabase port at the top of
`UPDATESTACK.md` fixes both, with the Forum as one thing it unlocks
rather than the reason it exists.

## Running

```bash
git clone https://github.com/Isk1zz/Dojo-Gamify-Learn.git
```

Then open `index.html`. That is the whole setup.

Installing it as an app (and getting the offline cache) needs it served over
http rather than opened from disk:

```bash
python3 -m http.server 8000
```

See `docs/PACKAGING.md`.

## Currencies

Three, deliberately separate, and none of them convert into another:

| | Earned by | Spent on |
|---|---|---|
| ⚡ **XP** | Studying | Nothing — it only buys rank |
| 🪙 **Tokens** | Rank-ups, or bought | Courses |
| 👏 **Reputation** | The Garden | Other people's posts, never your own |

Cosmetics are **free**. Themes, layouts, palettes, decorations and scenery are
all unlocked from the start — the Shop sells courses and nothing else.

## Where to start

| If you want to… | Read |
|---|---|
| understand how the pieces fit | `docs/ARCHITECTURE.md` |
| know why it's built this way | `PROJECT.md` |
| work on one feature | that folder's `.md` |
| know what's in flight right now | `UPDATESTACK.md` |
| see what changed | `docs/CHANGELOG.md` |
| ship it somewhere | `docs/PACKAGING.md` |
| deal with licensing | `docs/LEGAL.md` |

Each folder is a self-contained branch. To work on one you need
`docs/ARCHITECTURE.md` plus that folder — not the whole project. Deleting a
branch's folder and its `<script>` tags removes the feature cleanly; that
property is load-bearing and worth preserving.

## Status

Pre-release and single-player. The name is a placeholder.
