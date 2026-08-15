# forum/ — the Forum

Replaced the Arcade on 2026-08-15. Same lobby slot, same route position, an
entirely different idea of what the fifth tile is for.

## What it is

A place to post, and a currency you can only spend on other people.

```
rank ──sets──▶ daily allowance ──spend on──▶ someone else's post ──▶ they go up
```

ECONOMY (decided 2026-08-16, not built): reputation is a **daily
allowance**, not a balance — `5 + floor(rank/5)` per day, expiring
nightly, spent only on others. The Garden pays nothing. Received
badges accumulate into a season; seasonal achievements pay status,
never currency. Full reasoning in `UPDATESTACK.md`.

CAPS (decided 2026-08-16): max **10 points to any one user per month**,
max **1 point per post**. Kills collusion, and forces breadth — spending a
full allowance means reaching 15-27 different authors.

## The one rule

**You cannot spend reputation on yourself.**

That single constraint is the design. It makes reputation a currency you can
only ever give away, which means:

- Reputation *earned* and reputation *held* are different things. The Garden
  mints the right to give; your standing is only ever what others gave you.
- There is no way to farm your own score. Grinding the Garden all week buys you
  influence over other people's standing, not your own.

Everything else here is negotiable. That isn't.

## Status: a shell, deliberately

`forum.js` renders a real screen with your live reputation and the rule, and
says plainly that nobody is here yet. There are no posts, and there is no
faked community.

**This is not laziness, it's the only honest option available.** A forum is
inherently multi-user; this app is offline-first, stores everything in
`localStorage`, and deploys as static files. Two people running it share
nothing — no posts, no replies, no reputation. Seeding it with invented
"community" posts would look like a forum, teach mechanics that don't exist,
and never have anybody in it. An empty room that explains itself is better
than a stage set.

## What unblocks it

The Firebase port at the top of `UPDATESTACK.md`. Not a nice-to-have for this
feature — a **precondition**. Until accounts exist, nothing here can be more
than it currently is.

When that lands, the pieces this branch needs:

| Piece | Note |
|---|---|
| Accounts | Identity is the whole blocker |
| Posts + replies | Ordinary CRUD, no surprises |
| Reputation transfers | **Must be enforced server-side.** A client-side "can't spend on yourself" check is a suggestion, not a rule — anyone can edit their own client |
| Moderation | `admin/ADMIN.md`'s warnings and bans were built for a single-player app. A ban that wipes an account needs re-examining when that account's posts are other people's context |

## Known open question

Two accounts can still trade reputation back and forth, which the give-only
rule does not prevent. Worth deciding whether that matters **before** it ships,
not after — see `UPDATESTACK.md`.

## Where reputation lives

`data/db.js`, stored under the profile's `wallet` field. It was money until the
Arcade (the thing money was for) became this, and every cosmetic went free,
leaving `$` with no sink. Rather than migrate every existing profile's balance
to a new key, the field kept its storage name and changed meaning.

Use `DB.getReputation` / `addReputation` / `spendReputation` in new code.
`getWallet` / `addMoney` / `spendMoney` still exist as aliases because Garden,
Library and Admin call them.
