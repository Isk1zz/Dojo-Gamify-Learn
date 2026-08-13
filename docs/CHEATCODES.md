# Admin access

The secret is the string **`adminaccount`** (case-insensitive). Two ways
to use it — same effect either way: every course, unit, topic and chunk
unlocked (flashcards included), tickets refilled, wallet set to exactly
$50,000, applied to whichever profile ends up active.

## 1. As a profile name (at creation only)

Create a profile named `adminaccount` in the welcome modal.
`data/db.js`'s `createProfile` checks the name against
`SECRET_ADMIN_NAME` and, on a match, calls `applyAdminStart` once, at
creation. Only reachable from the "new profile" screen — no use once a
profile already exists, which is every session after the first.

## 2. As a typed code in Settings (works any time)

Added because of exactly that gap — reported live: "As it doesn't ask
the name I can't use adminaccount." Settings' "Unlock code" box (always
visible now, not gated behind anything) checks the typed text against
`DB.applyAdminCode(input)`, which does the same
`SECRET_ADMIN_NAME` match and calls `applyAdminStart` on the **current**
active profile — no new profile needed. Both paths are the same
committed check in `data/db.js`; the code box is just a second front
door to it.

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
