# CS Dojo

An offline, dependency-free study app. Content is broken into small chunks;
each chunk teaches one idea, shows a worked example, and asks a question.
Passing a topic's mastery exam schedules it for spaced review rather than
marking it finished forever.

## Running

```bash
git clone https://github.com/Isk1zz/cs_dojo_demo.git
cd cs_dojo_demo
```

Then open `index.html`. No build step, no dependencies, no server.

To install it as an app (and get offline caching) it needs to be served over
http rather than opened from disk:

```bash
python3 -m http.server 8000
```

See `docs/PACKAGING.md`.

## Where to start

| If you want to… | Read |
|---|---|
| understand how the pieces fit | `docs/ARCHITECTURE.md` |
| know why it's built this way | `PROJECT.md` |
| work on one feature | that folder's `.md` |
| see what changed | `docs/CHANGELOG.md` |
| ship it somewhere | `docs/PACKAGING.md` |
| find a cheat code | `docs/CHEATCODES.md` |
| deal with licensing | `docs/LEGAL.md` |

Each folder is a self-contained branch. To work on one, you need
`docs/ARCHITECTURE.md` plus that folder — not the whole project.
