# games/ — arcade (games + story)

The Arcade screen has **two tabs**: Games and Story. `story/` registers itself
here at load:

```js
Dojo.Arcade.registerTab({ id: "story", label: "📖 Story", render(body) {...} });
```

That is the whole merge — one call. Story keeps its own folder, its own doc and
its own stylesheet, so it is still a one-folder session. A branch that wants a
place on this screen adds a tab rather than taking a lobby slot of its own.

**Skeleton. The gate is real; the games are not written.**

| File | Role |
|---|---|
| `games.js` | Shell, registry, unlocks, the gate, `beginRound`/`settle` |
| `crash.js` | **Built.** Multiplier game — owns its own curve |
| `hilo.js` | **Built.** Higher/lower — owns its odds table |
| `blackjack.js` | **Built.** Classic 21 — owns the rules |

All three games are in. `raise(round, amount)` exists for Blackjack's double
down: extra money into a live round still goes through `games.js`, never
`DB.spendMoney` from a game file.

## Unlocks
Each game is bought **once, with money**, and stored in the inventory as
`game_<id>`. Same coin as food and shelter.

| Game | Unlock |
|---|---|
| Crash | $75 |
| Hi-Lo | $150 |
| Blackjack | $300 |

Charge can never buy one. `beginRound(stake, gameId)` refuses if the game
isn't unlocked, so the gate holds even if a card is rendered wrong.
Stylesheet: `styles/games.css` (cards reuse `shop.css` on purpose).

## The gate — already enforced
Per round: **1 ticket + a bite out of vitals**, stake capped at $50 and at the
wallet. Tickets: **7 per 6 hours, ceiling 7** — the only limiter.

Energy was removed in v6. It and tickets were two rate limits doing the same
job, and the ticket is the one that reads as "come back later". The `energy`
field still exists in stored profiles because migrations never drop fields,
but nothing reads it. If any vital is at or below 15, `beginRound` returns `null`
and `canPlay()` is false — you are too weak to play. The Library is never gated
this way; see `shop/SHOP.md`.
Tickets: **2 per 6 hours, ceiling 2.** A round cannot start unless
`spendTicket()` *and* `spendEnergy()` both succeed, and a partial failure
refunds the stake.

That ceiling is the point. The arcade is a break between study sessions, not
an income line — the Garden is the income line, and it pays for *remembering
things*. Two entries per six hours also caps what a bad run can cost.

## The seam — use it
```js
const round = Games.beginRound(stake);   // null if the round can't start
if (!round) return;
// ... play ...
Games.settle(round, payout);             // payout INCLUDES the stake; 0 = loss
```

**Never call `DB.addMoney` or `DB.spendMoney` from game logic.** Every stake
and every payout goes through these two functions so there is one place to
audit, log, and later rate-limit.

Register a game at load:
```js
Dojo.Games.register({ id, name, tagline, icon, mount(container, api) });
```
The shell renders any registered game as playable and any planned-but-absent
one as "Not built yet", so games can land one at a time.

## Crash — the maths (`crash.js`)

```
crash = 1 / (1 - u),   u uniform on [0, 1)
```

This gives `P(crash >= m) = 1/m`, so cashing out at any target `m` returns
`m x (1/m) = 1` — a perfectly fair game with no edge. So **4% of rounds are
forced to bust instantly at 1.00x**, making the expected return exactly 96%
*whatever multiplier you aim for*.

That flatness is the point: there is no clever target. Verified by simulation
at 1.5x / 2x / 5x / 10x over 200k rounds each — all land on 96%.

- `MAX_MULT` 25x caps the tail. Without it one lucky round at the $50 stake
  cap could pay four figures and make the Garden pointless. 25 x $50 = $1,250
  is already the largest number in the app.
- The multiplier doubles every 4 seconds (`GROWTH_SECONDS`).
- **Auto cash-out.** A target can be preset (typed, or one of 1.2/1.5/2/3/5)
  and the round takes itself off the table there. It does **not** change the
  odds — return is 96% at every target, auto or manual, verified at 1.2x/2x/5x
  over 200k rounds each. What it removes is *reaction time*: a manual cash-out
  at 1.05x is impossible to hit and an auto one isn't. Floor `MIN_AUTO` 1.01x,
  ceiling `MAX_MULT`.
- **The crash is checked before the auto, in the same frame.** If the curve
  broke below the target the round is lost; the auto never jumps the queue.
  When it does fire it pays the target exactly, not whatever the frame landed
  on, so the payout can't drift with frame rate.
- The crash point is rolled **once, up front**, so waiting can't nudge it.
- One round can be live at a time; `stop()` kills the frame loop, and leaving
  the panel calls it.

## Hi-Lo — chain play (`hilo.js`)

**One ticket buys a whole chain, not one call.** Get a call right and the card
you turned becomes the new base; keep calling as long as you like with the
multiplier compounding, and cash out whenever you want. Get one wrong and the
entire chain goes, not just that call.

Charging per call would have made it Crash with cards. Charging per chain puts
the whole game in one decision: *when do you stop?*

Each call is independent at 96%, so an n-call chain returns **0.96ⁿ** — the
edge compounds against the player the further they push:

| Chain | Expected return |
|---|---|
| 1 call | 96.0% |
| 3 calls | 88.5% |
| 5 calls | 81.5% |
| 10 calls | 66.5% |

That is the tension the cash-out button exists for, and it is stated plainly in
the game's own help text rather than hidden.

`MAX_CHAIN_MULT` is 50×, and hitting it force-cashes. Without a ceiling a freak
run at the $50 stake cap could pay five figures and make every other system in
the app pointless; 50 × $50 = $2,500 is already the largest number anywhere.

### The per-call odds

**A tie loses.** That one rule is what makes the table clean:

```
w      = cards that win the call
payout = 0.96 x 13 / w
EV     = (w/13) x payout = 0.96,  every card, both directions
```

Flat 96% per call whichever card is showing and whichever way you call — same
property as Crash, before the chain compounds it. There is no card that's a better bet, so a player can't be punished
for not knowing an odds table. Measured range across all 24 valid calls:
95.6–96.2% (rounding to cents).

Sample: A higher 1.04x, 2 higher 1.13x, 10 higher 4.16x, K higher impossible
(button disabled).

A push-on-tie version was tried first and does not work. Calling "higher" on an
ace wins 12/13 and pushes 1/13, so it can never lose — the house could only
take a cut by paying under 1x on a *win*, which is nonsense. Ties losing
removes that whole class of problem.

## Blackjack — the rules (`blackjack.js`)

Six-deck shoe, reshuffled per round. Dealer hits below 17, stands on 17 or
more including soft 17. Blackjack pays 3:2, push returns the stake, double
down on the opening two cards. **Splits are out of scope for v1.**

### Why it's the $300 unlock
Crash and Hi-Lo both return a flat 96% no matter what the player does — there
is nothing to learn. Blackjack is the opposite: played well it returns around
99%, played carelessly rather less. The expensive unlock buys a game where
paying attention is worth something, which is the only kind of "skill" this
app should be selling. That answers the open question from stage 3: the
pricier unlock buys a *better game*, not a better rake.

Card counting across rounds is pointless here anyway — the shoe is rebuilt
every round, and two tickets per six hours caps the sample.

## One honest flag
Real-money-style casino mechanics in a study app carry two real-world
problems, worth deciding on before this branch is finished, not after:

1. **Store policy.** Apple and Google both treat simulated gambling as a
   restricted category, and it interacts badly with any plan to sell a premium
   currency for real money. If "stars purchasable for money" and a casino
   coexist, some jurisdictions treat that as gambling regardless of intent.
2. **Audience.** The users are students, and a chunk of them are under 18.

Neither kills the idea — a closed-loop currency you can't cash out is the
normal way this is handled — but "the money must never be purchasable *and*
stakeable" is a decision to make now, because it changes the schema.
