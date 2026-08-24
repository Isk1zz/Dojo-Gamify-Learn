# Knell — Architecture

**Read this before touching any folder. It is short on purpose.**

The app is split into *branches*. A branch is a folder that owns one feature
end to end: its logic, its stylesheet, its screen, its docs. The point of the
split is that you can open a single folder in a fresh chat, hand over that
folder plus this file, and work on it without the other 5,000 lines.

---

## 1. The rule

> A branch may talk to **DB**, **Dojo.Bus**, **Dojo.Router** and the documented
> `Dojo.*` seam of another branch. It may not read another branch's internals,
> its DOM, or its private state.

Everything else follows from that.

---

## 2. The four seams

### `DB` — persistence (`data/db.js`)
The only thing that touches localStorage. Storage only: no prices, no odds, no
payouts, no growth thresholds. Those belong to the branch that owns them.

### `Dojo.Bus` — events
Branches announce **facts**, not instructions.

```js
Bus.emit("topic:completed", { topicId });   // a fact
Bus.on("topic:completed", () => renderGarden());  // whoever cares, reacts
```

Never emit `"renderGarden"`. If you find yourself calling another branch's
render function directly, publish an event instead.

Current events: `screen:changed`, `profile:changed`, `progress:changed`,
`wallet:changed` (reputation), `tokens:changed`, `sky:changed`.

### `Dojo.Router` — navigation
```js
Router.register("garden", { render: renderGarden });   // at load
Router.go("garden");                                    // from anywhere
```
A branch that isn't loaded isn't registered, and its lobby tile hides itself.
That is what makes a folder droppable.

### Tabs — sharing a screen
A branch can take a tab on another branch's screen instead of a lobby slot:
```js
Dojo.Router.register("example", { render(payload) {...} });
```
The host owns the screen and calls `showScreen`; the guest only fills the body
it is handed. Sharing a surface is not merging the code — every one of them
keeps its own folder, doc and stylesheet. (Story used this pattern, then the
Life tab did — both since removed, and so is the Arcade that hosted them. The
empty, kept as infra for whichever branch uses the seam next.)

### `Dojo.<fn>` — the export seam
Every branch ends with:
```js
Object.assign(Dojo, { renderGarden, gardenSummary, ... });
```
and begins with a **shim block** of the things it borrows:
```js
const renderCharge = (...a) => Dojo.renderCharge(...a);
```
Those shims are late-bound on purpose — resolved at *call* time, not load
time — so branch load order doesn't matter and there are no circular imports.

---

## 3. Load order (`index.html`)

Four bands. Order *between* bands is load-bearing; order *within* band 3 is not.

```
1. core/core.js      kernel: state, Bus, Router, utils
   core/i18n.js      language — MUST precede band 2, see below
   data/db.js        persistence
2. library/content/  pure course data (quotes, modules, then data.js)
3. branches          each registers itself on window.Dojo
4. core/boot.js      LAST — registers screens, wires cross-branch buttons, starts
```

Band 2 has its own order: `content/registry.js` → each course's module files →
that course's `course.js` → `content/build.js`. Adding a course is one folder
and its script tags; see `library/LIBRARY.md`.

`core/i18n.js` sits in band 1 for a reason: `Content.course()` resolves a
course manifest's `{en, ru}` values through `I18N.resolve` at registration,
so the language layer has to exist before band 2 runs. It is also what
reveals the first-run language picker.

---

## 4. Working one branch at a time

To pick up a branch in a fresh chat, send:

1. this file,
2. the branch folder (its `.js`, its `.md`, its stylesheet),
3. `data/db.js` only if the change needs a new stored field.

You do **not** need `library/content/` unless you are writing course content —
it is ~3,000 lines of pure data and will eat the session for nothing. And if
you *are* writing content, you need one course folder plus
`content/_template/course.js`, not the branch.

If a change needs something a branch doesn't have, the answer is almost always
"add an export to the seam", not "reach into the other folder".

---

## 5. Two currencies, kept apart

| | earned by | spends on |
|---|---|---|
| ⚡ XP | studying — chunks and exams | **never spent** — raises your rank |
| 👏 reputation | Garden dividends | other people's Forum posts, never your own |

Rewards (themes, background stripes) arrive with a rank; see `shop/SHOP.md`.

**Neither buys the other, ever.** The moment charge buys progress, the
fastest route to a passing score is grinding, and the whole learning
argument in PROJECT.md §5 collapses.

---

## 6. Invariants that must not drift

- `db.js` stores; branches decide. No tuning numbers in `db.js`.
- Migrations are additive. Never drop a field — see PROJECT.md §4.
- Reputation leaves the balance in exactly one place per branch.
  Never call `DB.addMoney` from game logic; go through `Games.settle`.
- The life-sim (vitals, decay, night theft, the goods shop) was removed —
  see `shop/SHOP.md` and BACKLOG.md's Batch 5/9. The Arcade itself is gone —
  its tile is the Forum now (`forum/FORUM.md`).
- Nothing decays on a wall clock. Being away from the app must stay free.
- Every branch owns one stylesheet. `styles/base.css` is the design system and
  the screens core owns; it must not gain rules for another branch's screens.
- **A branch redrawing itself must not go through a screen render.** Calling
  another branch's render to refresh your own DOM ends in `showScreen()` and
  scrolls the page to the top mid-interaction.
- No build step, no dependencies, no network. `index.html` opens and runs.
  The PWA files (`sw.js`, `manifest.webmanifest`, `icons/`) are purely
  additive — delete them and nothing changes. Keep it that way.
