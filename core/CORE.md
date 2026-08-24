# core/ — kernel

The parts every other branch depends on. Core knows nothing about courses,
plants, cards, prices or themes. **If you are adding domain knowledge here,
it belongs in a branch folder instead.**

| File | Role |
|---|---|
| `core.js` | `Dojo.state`, `Bus`, `Router`, `showScreen`, shuffle + quote utils |
| `i18n.js` | Language: `I18N.resolve` for course content, `I18N.t` for chrome, the first-run picker |
| `crypto.js` | `Dojo.Crypto`: device key pair, signing, passphrase encryption. Web Crypto only |

## Dojo.Crypto

A thin wrapper over the browser's `crypto.subtle`. Nothing in it
implements a cipher or modular arithmetic by hand, and nothing should.

| Call | Does |
|---|---|
| `isAvailable()` | False outside a secure context (https / localhost) |
| `getDeviceKeys()` | ECDSA P-256 pair, generated once, kept in IndexedDB `knell-keys` |
| `getPublicKeyJwk()` / `getFingerprint()` | The half that may leave the device, and a short stable id for it |
| `sign(data)` / `verify(data, sig, jwk?)` | Objects are hashed through `stableStringify`, so key order cannot change a signature |
| `encryptWithPassphrase` / `decryptWithPassphrase` | PBKDF2-SHA256 600k → AES-256-GCM, self-describing envelope |
| `signEnvelope` / `verifyEnvelope` | Payload + signature + public key, for an export somebody else will check |

Three things to keep straight:

- **The private key cannot be exported.** It is generated with
  `extractable: false` and lives in IndexedDB as a live `CryptoKey` —
  localStorage could not hold it without making it extractable, which
  would defeat the point. `resetDeviceKeys()` destroys it; there is no
  backup, by design.
- **A self-signed envelope proves integrity, not identity.** Anyone can
  sign with their own pair and ship the matching public key inside.
  `verifyEnvelope` returns `selfSigned: true` when no trusted key was
  supplied, and that flag is the whole warning. A server must compare
  against a key it already holds.
- **None of this protects the local economy.** Tokens and XP live on the
  user's machine, and so does any key used to sign them; the user can
  always re-sign what they edited. Only a server that keeps its own
  authoritative numbers can fix that — see the online-database work.
| `theme.js` | Paints a theme id into CSS variables on `:root` |
| `hud.js` | The fixed top strip: charge bar, flying bolt, rank insignia, streak badge |
| `profile.js` | Profile creation, name badge, profile switcher |
| `lobby.js` | The hub screen |
| `boot.js` | Loads last: registers screens, wires cross-branch buttons, starts |

Stylesheet: `styles/base.css` (also still holds the shared design system).

## Exports
`state`, `Bus`, `Router`, `showScreen`, `shuffled`, `shuffleQuestion`,
`pickQuote`, `quoteHtml`, `applyTheme`, `resolveTheme`, `hexToRgb`, `shade`,
`renderCharge`, `awardCharge`, `flyBolt`, `checkProfile`, `updateProfileBadge`,
`closeDropdown`, `renderDropdown`, `showLobby`, `renderStreak`, `celebrateStreak`

## Borrows
`Dojo.THEMES` / `PREMIUM_THEMES` (from shop), each branch's `*Summary()` for
the lobby tiles, and `Dojo.Ranks.progress` / `Dojo.Ranks.insigniaSvg` (from
`shop/ranks.js`) for the charge bar's rank chip.

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
`--bg-surface`, `--bolt-1/2/3`, `--bolt-glow`, `--bg-image`, `--text`,
`--text-dim`, `--text-muted`, `--border`.

**Text colour now moves, but only with `t.mode`.** It used to be fixed —
every theme was a dark background, so one light-text pair had contrast
everywhere. A light theme (`mode: "light"`, e.g. Frost, Paper) breaks that
outright, so `applyTheme` now sets text/border from one of two fixed pairs
(`LIGHT_TEXT` / `DARK_TEXT` in `theme.js`) keyed on `t.mode`, never a
per-theme value — every dark theme still shares the exact one text colour,
which is the property the original decision was protecting.

Known gap: some hover/overlay effects across the stylesheets are still
hardcoded `rgba(255,255,255,0.0N)` — a white wash that lightens a dark
surface. On a light theme that reads as a near-invisible white-on-white
instead of the intended subtle darken. Not fully audited; fix instances as
they're found (two already were: `.topbar`, `.theme-swatch`).

`--bg-deep-rgb` exists because the charge bar needs a translucent version of
the page background and CSS can't add alpha to a hex variable.

A premium theme the active profile doesn't own falls back to Indigo — an
imported profile must not wear something it never bought.

## Charge
`awardCharge(amount, originEl)` returns what was **actually** granted, which is
0 at the cap. Animate the return value, never the requested amount.

Charge is earned here and spent in `shop/`. This file never decides what
charge is worth.

## Charge bar: collapsed by default
The bar shows only the rank chip (insignia + full rank name) at rest — the
track and XP number live in `.charge-expand`, which reveals on hover/focus of
the chip or for a few seconds after `awardCharge` lands (`revealBar()`), then
collapses again. Height is fixed so expanding never reflows `.vitals-strip`
below it. Rank badge SVGs are generated by `shop/ranks.js#insigniaSvg`
from a per-rank emoji lookup (`RANK_EMOJI`), not 20 hand-drawn assets and
not hand-drawn line art either — see that file for why (the earlier
chevron/tick/ring scheme overlapped itself at this render size).

`#hud-nickname` sits inside the same chip, right after the rank name —
the active profile's name, so the chip reads "Nobel Laureate · Alice"
rather than just the rank. Set from `renderCharge()` (already called on
boot, profile switch and every XP change), not its own render path.

## Streak badge
Top-right of the charge bar (`#streak-chip`, `margin-left:auto` in a flex
row that otherwise only has left-aligned content). `DB.getStreak()` drives
it; `renderStreak()` shows/hides the badge and is called from `boot.js`,
`lobby.js`, and after `library.js`'s `finishChunk` touches the streak.

- Click/tap toggles `#streak-popover` (freeze count, positioned under the
  badge via `getBoundingClientRect`) — a document-level click listener
  closes it on any click outside `#streak-popover`/`#streak-chip`.
- `celebrateStreak(count)` pops a `#streak-toast-layer` toast for ~2.6s.
  Callers only fire it when `DB.touchStreak()`'s `changed` flag is true —
  that's the one call per real day that actually moved the count, not
  every same-day re-touch.
- This reverses a documented PROJECT.md §5 decision against streaks. See
  that file and `data/DATA.md` for the reasoning and the flag raised
  before building it.

## Gotchas
- `boot.js` must load last. It assumes every branch has already registered.
- `showScreen` guards `Dojo.closeDropdown` because `profile.js` may not be
  loaded. Anything core calls into a branch needs the same guard.
- Profile switching emits `profile:changed` and `progress:changed`. Do not
  add per-branch repaint calls to `profile.js` — subscribe from the branch.
