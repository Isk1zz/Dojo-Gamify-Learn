# settings/ — preferences, data, legal

Stylesheet: `styles/settings.css`.

## Sections
1. **Colour theme** — free themes, always available. Two are `mode: "light"`
   (Frost, and Paper under Awarded themes below) — see core/theme.js for
   what that flag actually changes.
2. **Awarded themes** — only the ones this profile owns, plus a link to
   Career. Ownership lives in `db.js`; the catalogue (still internally
   `PREMIUM_THEMES` — that identifier doesn't need to match the UI label)
   lives in `shop/themes.js`. This file owns neither. This is the **only**
   place a theme gets equipped — Career's ladder shows what each rank
   awards but doesn't let you pick, on purpose (see `shop/SHOP.md`).
3. **Lobby style** — `DB.getLobbyStyle()`/`setLobbyStyle()`, read by
   `core/lobby.js` to toggle a `.lobby-style-*` class on `#lobby-actions`.
   Three options: **Classic** (the plain list), **Cards** (a re-skin —
   same tiles, same order, just more visual weight), and **Star** (an
   actual rearrangement into a circle of nodes around a center hub,
   with glowing spoke lines to each one — a literal network topology).
   A plain circle-with-no-hub "Radial" option shipped alongside Star and
   was cut a day later for being strictly a worse Star. Star needs
   `core/lobby.js#layoutLobbyRadial` to compute a per-tile angle in JS —
   the Resume tile toggles visibility on its own, so a fixed CSS
   nth-child angle would leave a gap at its slot whenever it's hidden.
   See `styles/base.css`.
4. **Codes** — loaded from `settings/codes.js`, which is **gitignored and not
   deployed**. Copy `settings/codes.example.js` to `settings/codes.js` to
   enable them locally. Without that file the whole section hides and the code
   strings aren't in the shipped JS at all.

   | Code | Effect |
   |---|---|
   | `admin613` | Marks every topic complete |
   | `parnasa100` | +$100 to the wallet |
   | `agrala` | Refills arcade tickets to full |
   | `capmyrank` | Jumps to the top of the rank ladder |
   | `nullmyrank` | Resets XP to zero |

   Full reference with the reasoning: **`docs/CHEATCODES.md`**.

   `admin613` deliberately does not touch reviews, stats or the wallet, so a
   cheated profile still looks cheated in Stats.
5. **Your data** — export/import. Progress is localStorage only.
6. **Legal** — Privacy Policy (written and accurate) and a Terms of Service
   draft. Reasoning, the licence decision and the pre-release checklist are in
   **`docs/LEGAL.md`**.

## Exports
`renderSettings`

## Emits
`progress:changed` (after an admin unlock)

## Legal
The Privacy Policy is written and true: everything is in localStorage, no
account, no server, no analytics, nothing transmitted. **Keep it true** — the
first feature that phones home invalidates it and needs it rewritten first.

The ToS is a draft; it needs a lawyer before money changes hands.

The licence is still undecided and is deliberately not chosen for you. Options,
the split between code and content, and the pre-release checklist are all in
`docs/LEGAL.md`.
