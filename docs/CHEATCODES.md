# Admin access

## The secret profile name

Create a profile named **`adminaccount`** (case-insensitive) in the welcome
modal, and it starts already fully stocked: every course, unit, topic and
chunk unlocked (flashcards included), tickets refilled, wallet set to
exactly $50,000.

This works on the **deployed site**, not just locally — see below for why
that matters and why it isn't a settings-panel toggle instead.

Implementation: `data/db.js`'s `createProfile` checks the name against
`SECRET_ADMIN_NAME` and, on a match, calls `applyAdminStart` once, at
creation. It doesn't keep re-applying on every load — spend the money,
play normally, it behaves like any other profile from then on.

---

## Why not a typed-in "code" (and the history of this file)

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
moved to the secret-profile-name mechanism above instead: a name typed
into the welcome modal isn't gated by what got committed, so it ships
fine without needing a visible "enter code" input anywhere.

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
