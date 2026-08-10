# settings/ — preferences, data, legal

Stylesheet: `styles/settings.css`.

## Sections
1. **Colour theme** — free themes, always available.
2. **Premium themes** — only the ones this profile owns, plus a link to the
   Shop. Ownership lives in `db.js`; the catalogue lives in `shop/themes.js`.
   This file owns neither.
3. **Codes** — loaded from `settings/codes.js`, which is **gitignored and not
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
4. **Your data** — export/import. Progress is localStorage only.
5. **Legal** — Privacy Policy (written and accurate) and a Terms of Service
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
