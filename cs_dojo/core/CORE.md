# core/ — kernel

The parts every other branch depends on. Core knows nothing about courses,
plants, cards, prices or themes. **If you are adding domain knowledge here,
it belongs in a branch folder instead.**

| File | Role |
|---|---|
| `core.js` | `Dojo.state`, `Bus`, `Router`, `showScreen`, shuffle + quote utils |
| `theme.js` | Paints a theme id into CSS variables on `:root` |
| `hud.js` | The fixed top strip: charge bar, flying bolt |
| `profile.js` | Profile creation, name badge, profile switcher |
| `lobby.js` | The hub screen |
| `boot.js` | Loads last: registers screens, wires cross-branch buttons, starts |

Stylesheet: `styles/base.css` (also still holds the shared design system).

## Exports
`state`, `Bus`, `Router`, `showScreen`, `shuffled`, `shuffleQuestion`,
`pickQuote`, `quoteHtml`, `applyTheme`, `resolveTheme`, `hexToRgb`, `shade`,
`renderCharge`, `awardCharge`, `flyBolt`, `checkProfile`, `updateProfileBadge`,
`closeDropdown`, `renderDropdown`, `showLobby`

## Borrows
`Dojo.THEMES` / `PREMIUM_THEMES` (from shop), and each branch's
`*Summary()` for the lobby tiles.

## The lobby contract
The lobby does **not** compute another branch's numbers. Each branch exports a
`somethingSummary()` returning one line of text, or `null` to hide the tile:

```js
tile("btn-lobby-garden", "lobby-garden-sub", gardenSummary());
```

A branch that isn't loaded returns nothing, and its tile hides. That is how a
folder stays droppable.

## Theme painting
`applyTheme(id)` sets, on `:root`:
`--accent`, `--accent-light`, `--accent-glow`, `--accent-glow-strong`,
`--border-accent`, `--bg-deep`, `--bg-deep-rgb`, `--bg-card`, `--bg-card-hover`,
`--bg-surface`, `--bolt-1/2/3`, `--bolt-glow`, `--bg-image`.

Text colours are deliberately **not** themed, so contrast stays readable
whatever is picked.

`--bg-deep-rgb` exists because the charge bar needs a translucent version of
the page background and CSS can't add alpha to a hex variable.

A premium theme the active profile doesn't own falls back to Indigo — an
imported profile must not wear something it never bought.

## Charge
`awardCharge(amount, originEl)` returns what was **actually** granted, which is
0 at the cap. Animate the return value, never the requested amount.

Charge is earned here and spent in `shop/`. This file never decides what
charge is worth.

## Gotchas
- `boot.js` must load last. It assumes every branch has already registered.
- `showScreen` guards `Dojo.closeDropdown` because `profile.js` may not be
  loaded. Anything core calls into a branch needs the same guard.
- Profile switching emits `profile:changed` and `progress:changed`. Do not
  add per-branch repaint calls to `profile.js` — subscribe from the branch.
