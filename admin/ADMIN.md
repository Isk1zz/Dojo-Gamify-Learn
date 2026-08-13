# admin/ — Administration, Telemetry & User Moderation Suite

Stylesheet: `styles/admin.css`.
Scripts: `admin/logger.js`, `admin/admin.js`.

**Ported into this project 2026-08-14** from a separate downloaded copy
that wasn't part of this repo. `data/db.js` didn't have the
isAdmin/isBanned/warnings fields or the setAdminStatus/setBannedStatus/
addWarning/clearWarnings/getProfileById/kickProfile functions this
panel calls — those were added as part of the port, along with
expanding `listProfiles()` to include xp/wallet/tokens/tickets/avatar
(it previously only returned id/name/createdAt/topicsCompleted). Also
fixed during the port: every `rankInfo.title` reference read a field
that doesn't exist on this project's rank objects (they use `name`) —
was rendering literally "undefined" for every rank name in the table,
inspector, and analytics tab. And trimmed `MASTER_ADMIN_KEYS` — the
ported list also accepted the bare words "admin" and "dojodev", which
are guessable enough to be worse than no gate at all.

**Known gap, NOT built as part of this port:** the ban/warning
enforcement side described below (the suspension overlay, the
notice-modal) isn't implemented anywhere outside this panel — banning
someone currently only sets the flag, nothing in the rest of the app
checks it yet. The 14-week activity heatmap on the Analytics tab is
also synthetic (deterministic, not random, but not real per-day
history either) — labeled "Illustrative" in its own card title rather
than presented as genuine data, since `DB.getStreak()` only tracks the
current streak count, not a day-by-day log.

## Overview

The `admin` branch provides an administrative and moderation suite:
1. **User Management & Moderation** (user table, deep inspector, admin role grant/revoke, ban/unban with custom reason, administrative warnings, force logout / kick).
2. **Economy & Cheats** (live currency mutators, instant unit and topic unlocks).
3. **Advanced Analytics** (mastery KPIs, SM-2 spaced repetition queue, 14-week activity heatmap).
4. **Telemetry & Live Event Logger** (`Dojo.Bus` event interception, uncaught error monitoring, log export).
5. **Raw Database Inspector** (direct `localStorage` JSON editor with safety validation).

---

## 1. User Management & Moderation Actions

- 🔍 **Inspect User**: Opens the User Details modal showing complete learning history, wallet balances, SM-2 queue, warnings history, and raw profile JSON.
- 👑 **Grant / Revoke Admin**: Toggles `isAdmin` flag on any profile. Admin profiles have gold `👑 ADMIN` indicators.
- 🚫 **Ban / Unban User**: Ban is a full, irreversible WIPE (2026-08-14
  change, by explicit request) — progress, XP, wallet, Tokens and
  Tickets all reset to a fresh profile's defaults, with a confirm
  dialog stating this before it happens. Name, account creation date,
  and warning history survive the wipe; `isAdmin` is forced off.
  Unbanning only clears the `isBanned` flag on the now-empty account —
  it does not and cannot restore what was wiped. (Older note, no
  longer accurate: this used to be a soft lockout with a suspension
  overlay; it isn't anymore.)
- ⚠️ **Send Warning Notice**: Dispatches an official administrative warning (`warnings: [{ id, message, issuedAt, read }]`). The next time the user enters, an **Administrative Notice** modal displays the warning with an acknowledgment button.
- 🚪 **Force Logout (Kick)**: Terminates the active session (`activeProfileId: null`) and redirects to the landing/profile login screen.
- 👤 **Switch Active Profile**: Instantly switches current session to the selected profile.
- 🗑️ **Delete Profile**: Permanently deletes a profile and cleans up storage.

---

## 2. Accessing the Admin Suite

- **Shortcut**: <kbd>Ctrl</kbd> + <kbd>Shift</kbd> + <kbd>A</kbd> or <kbd>F2</kbd> — wired in `core/boot.js`.
- **Profile Dropdown**: Click profile badge → select **«🛡️ Admin & Logs»** — wired in `core/profile.js`.
- **Router Navigation**: `Dojo.Router.go("admin")` (admin.js registers this itself).
- **Not wired**: a Settings unlock-code entry point (`admin`/`admin613`/`dev`/`debug`)
  was documented in the source this was ported from, but this project's
  `settings/codes.js` is gitignored/local-only by design (see the
  security audit in UPDATESTACK.md) — adding codes to it isn't
  something to do from a port. The two entry points above are the real
  ones.

Once on the screen, `renderAdmin()` itself gates further: an
unrecognized profile sees the passcode challenge (`MASTER_ADMIN_KEYS`
in admin.js), not the suite. Same underlying limit as everything else
client-side-only in this app — see the security audit in
UPDATESTACK.md — a determined user can just set `isAdmin: true` via
devtools regardless of the passcode. This is a speed bump, not real
auth, and shouldn't be treated as one.
