# Admin access

Two codes, both live in `data/db.js`'s `ADMIN_CODES` map, both typeable
into Settings' "Unlock code" box (always visible, checks
`DB.applyAdminCode(input)`) — applied to whichever profile is currently
active.

## `adminaccount` — full admin start

Every course, unit, topic and chunk unlocked (flashcards included),
tickets refilled, wallet set to exactly $50,000, rank maxed to 10,000 XP
(Nobel Laureate — every theme and background-stripe reward with it).
`applyAdminStart` in `data/db.js`.

**Also usable as a profile name**, at creation only: create a profile
named `adminaccount` in the welcome modal and `createProfile` applies it
immediately. Only reachable from the "new profile" screen — no use once
a profile already exists, which is every session after the first. The
Settings code box was added because of exactly that gap, reported live:
"As it doesn't ask the name I can't use adminaccount." Same underlying
function either way; the code box is just a second front door to it.

## `unlockallunits` — reachable, not completed

Deliberately **not** an alias of `adminaccount`. Flips one boolean
(`p.unitsUnlocked`) that bypasses the "finish the previous unit" prereq
in all three places that check it (`library.js`'s unit-select list view,
its map/roadmap view, and the deck builder) — every unit becomes
clickable, but no topic or chunk is marked complete, so the content
inside still shows as fresh/ungraded rather than already mastered.
`applyUnlockAllUnits` in `data/db.js`.

Requested explicitly, flagged first because `admin613` (an old,
now-removed `codes.js` code) already unlocked every unit as a side
effect of marking every topic complete — this exists specifically for
the case that isn't: reachable without being done.

---

## Why not a `settings/codes.js`-style system (history)

Earlier versions of this app had a `settings/codes.js` cheat-code system:
type a string into Settings → Codes, press Apply. `codes.js` was
deliberately `.gitignore`d — GitHub Pages serves the **built site** to
anyone with the URL, and devtools reads any shipped JS in seconds, so a
code that ships is a code the public can use. Not shipping it was the
only real way to keep it secret.

That worked for local testing, but it meant the Codes UI **never
appeared on the deployed site at all** — there was no way to reach
`adminaccount` (or any code) outside a local clone. By explicit request
(2026-08-12), the one code that actually needed to work in production
moved to the secret-profile-name mechanism above instead — a check
that lives in committed, always-shipped code, unlike `codes.js`. The
Settings code box above reuses that same committed check rather than
reviving the old gitignored-file system.

`settings/codes.js` / `codes.example.js` still exist, now empty, for
anything that genuinely should only ever work locally (never on the
deployed site) in the future:

```
settings/codes.example.js   committed — the template
settings/codes.js           gitignored — your working copy
```

```bash
cp settings/codes.example.js settings/codes.js
```

Without that file, `window.DOJO_CODES` is undefined and `settings.js`
hides the Codes section entirely.

## Before shipping

If `settings/codes.js` ever holds something again, delete it or gate it
before a release. There is no other place to check. The secret profile
name above is *meant* to ship — it isn't subject to this rule.
