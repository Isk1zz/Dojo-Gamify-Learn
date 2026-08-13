# games/ — arcade (games + story)

The Arcade screen has **two tabs**: Games and Story. `story/` registers itself
here at load:

```js
Dojo.Arcade.registerTab({ id: "story", label: "📖 Story", render(body) {...} });
```

That is the whole merge — one call. Story keeps its own folder, its own doc and
its own stylesheet, so it is still a one-folder session. A branch that wants a
place on this screen adds a tab rather than taking a lobby slot of its own.

**Four games are built.**

| File | Role |
|---|---|
| `games.js` | Shell, catalogue, unlocks, the gate, `beginRound`/`settle`, remembered stake |
| `crash.js` | Multiplier game — owns its own curve |
| `hilo.js` | Higher/lower chain — owns its odds table |
| `mines.js` | Pick your field and mine count, reveal tiles — owns its odds table |
| `blackjack.js` | Classic 21 — owns the rules |

`raise(round, amount)` exists for Blackjack's double down: extra money into a
live round still goes through `games.js`, never `DB.spendMoney` from a game
file.

Stylesheet: `styles/games.css` (cards reuse `shop.css` on purpose).

## Unlocks
Each game is bought **once, with money**, and stored in the inventory as
`game_<id>`. Same coin as food and shelter.

| Game | Unlock | What the price is buying |
|---|---|---|
| Crash | $75 | a 4% edge, flat at every target |
| Hi-Lo | $150 | an edge that compounds the further you push |
| Mines | $200 | the same compounding edge, but you choose the field and mine count |
| Blackjack | $300 | a game where paying attention is worth ~3% |

The pricier unlock buys a *better game*, not a better rake.

Charge can never buy an unlock. `beginRound(stake, gameId)` refuses if the game
isn't unlocked, so the gate holds even if a card is rendered wrong.

## The catalogue
Cards are built from `UNLOCK_PRICE` plus whatever `register()` supplied, in
price order. **A game's icon, name and tagline live in its own file only.**
There used to be a second `planned` array in `games.js` repeating all four
fields, which meant every game's metadata sat in two files and could disagree.
`COMING` covers anything announced before it exists; the shell renders that as
"Not built yet", so games can still land one at a time.

**Load order matters.** A game registers itself when its file runs, so its
`<script>` tag must come *after* `games/games.js`:

```html
<script src="games/games.js"></script>
<script src="games/terminal.js"></script>   <!-- and the other three -->
```

If a tag is missing or sits above `games.js`, the id is priced but never
registers. That used to draw a plain "Not built yet" card, which looks like a
decision rather than a missing file — it cost a whole round trip to spot. It
now draws **"Not loaded — see console"** and logs the exact tag to add.

## The gate — already enforced
Per round: **1 ticket**, stake capped at $50 and at the wallet. Tickets: **7
per 6 hours, ceiling 7** — the only limiter.

Energy was removed in v6. It and tickets were two rate limits doing the same
job, and the ticket is the one that reads as "come back later". The `energy`
field still exists in stored profiles because migrations never drop fields, but
nothing reads it and `spendEnergy` is not called anywhere.

Rounds used to also cost a bite out of vitals, and being too weak (any vital
≤15) shut the Arcade — that was the life-sim, removed along with the rest of
it (see `shop/SHOP.md` and BACKLOG.md's Batch 5/9). Tickets are the only gate
now.

That ceiling is the point. The arcade is a break between study sessions, not an
income line — the Garden is the income line, and it pays for *remembering
things*.

## Remembered stake

`games.js` keeps the last stake anyone played and every game pre-fills its box
from `api.stakeDefault()`. The four boxes used to reset to 5 after every round,
so playing at a steady stake meant retyping it all evening.

- It is remembered **before** `beginRound`'s refusals, so a round you couldn't
  afford still leaves the number you meant in the box.
- `stakeDefault()` clamps to the wallet and to `MAX_STAKE`. A pre-filled amount
  you can't afford is worse than a wrong one.
- Session-only, deliberately. A stake is a mood, not a setting, and it would
  otherwise need a `db.js` field.

## Tabs and `TAB_GATE`

The Arcade screen supports tabs via `Arcade.registerTab({ id, label,
render(body) })`; a registered tab may name a rank feature it needs in
`TAB_GATE`, and a locked tab stays on screen wearing a padlock rather than
being hidden — a reward nobody knows about isn't a reward.

`TAB_GATE` is currently **empty**. Story used it (removed earlier), then the
Life tab used it (removed with the life-sim — see `shop/SHOP.md` and
BACKLOG.md's Batch 5/9); nothing gates a tab right now. Kept as infra for
whatever rank-gated feature arrives next, same reasoning `shop/ranks.js`
keeps `hasFeature`/`featureRank` around with an empty `FEATURES` object.

## The seam — use it
```js
const round = Games.beginRound(stake, gameId);   // null if the round can't start
if (!round) return;
// ... play ...
Games.settle(round, payout);                     // payout INCLUDES the stake; 0 = loss
```

**Never call `DB.addMoney` or `DB.spendMoney` from game logic.** Every stake and
every payout goes through these two functions so there is one place to audit,
log, and later rate-limit.

Register a game at load:
```js
Dojo.Games.register({ id, name, tagline, icon, mount(container, api) });
```

## Removed: Terminal Hacker

Built, tested and cut. It never rendered correctly in practice — the script
tag and then the stylesheet each failed to reach the deploy folder — and after
two rounds of that it wasn't worth a third. The code and its 108 tests exist
and can come back; nothing else depends on it.

What it proved is worth keeping, because it applies to any future skill game:

> **A payout ladder a player can climb reliably is farmable.** Skill is exactly
> the thing that removes the variance a bonus is priced against. Crash and Hi-Lo
> can afford a payout ladder because nobody can steer them.

Simulated over 3,000 boards, a two-command recipe returned 111.6% against a
par-based ladder. The fix was to pay the stake back on a solve and nothing
more. If a skill game ever lands here again, start there.

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

### The visual — curve, rocket, sky (purely cosmetic)

Everything below reads `multAt`/`rollCrashPoint`'s output; none of it feeds
back into the maths. Swapping the visuals out entirely would not change the
odds by a cent.

**The curve.** `samples` stores raw `{t, m}` pairs — elapsed ms and the
multiplier at that instant — not pre-scaled pixel coordinates, because the
axes rescale mid-round. X = elapsed time, Y = multiplier *value* (not log),
so the path is genuinely exponential in shape rather than a linear fill bar
pretending to be one. Both axes start with a modest ceiling (5s / 3x) and
multiply themselves up whenever the round is about to outgrow them, so a
typical short round — most of them; `P(crash>=2)=50%` — fills the frame
instead of hugging the bottom-left corner of a chart sized for a 25x round
that almost never happens. Turns red via `redrawCurve(true)` on a loss.

**The rocket** rides the curve's tip, heading set from the tip and the
sample immediately before it — the curve's actual local direction right
at the tip, nothing smoothed over a longer window. That's only stable
because `pushSample` throttles to ~1 sample per 45ms; at the old
one-per-animation-frame rate adjacent points were sub-pixel apart and
the same math produced visible jitter. Swaps to \u{1F4A5} and pops on a
loss (`.crash-rocket.exploded`). Rotation is the raw travel angle with
no offset — verified directly (a rocket rendered at that rotation next
to a reference line drawn at the true travel angle: the two point the
same way).

**The sky** is four absolutely-positioned layers cross-fading by *opacity*,
keyed to the multiplier directly — `skyOpacity(m, lo, hi)` — not to the
chart's own auto-rescaling axes. That matters: "clouds show up around 2x"
has to mean literal 2x every round, whether the chart is currently scaled
to 3x or 20x. Ground/city/mountains/river fade out approaching 2x, clouds
own roughly 1.2x-3x, upper atmosphere 2.5x-5x, deep space with two planets
from ~4x on. All CSS gradients and `clip-path` shapes — no images, nothing
to fail to load.

**Loss** shakes the whole stage (`.crash-stage.shake`) and turns the curve
red. **Win** flashes a brief green overlay (`.crash-stage.flash-win`,
a `::after` pseudo-element so no extra DOM node is needed). Both classes
are removed and force-reflowed (`void stageEl.offsetWidth`) before being
re-added, the same trick `core/hud.js`'s wallet shake uses, so two losses
in a row still replay the animation instead of no-op'ing because the class
was already present.

**Money VFX are NOT per-game.** `core/hud.js`'s `moneyBurst()` fires from
`Games.settle()` in `games.js` — the one choke point every arcade payout
already passes through — so Crash, Hi-Lo, Mines and Blackjack all get the
same coin-burst-on-win / wallet-shake-on-loss for free. Don't add a
per-game version of this; extend `moneyBurst` instead.

**No audio.** The SFX requested alongside this (a payout chime, a loss
sound) needed two Envato Elements assets this session has no purchased
license for, so sound stays out of scope until real files are provided —
see the note in the Stage 13 changelog entry.

## Hi-Lo — chain play (`hilo.js`)

### Fixed in this pass
- **Cash out was live before the first call.** At zero calls the pot is the
  stake, so it handed your money straight back and burned the ticket for
  nothing. Disabled until a call has come in, and it says why.
- **The cash-out handler was `addEventListener("click", cashOut)`,** which
  passes the click event in as the `forced` argument. Truthy — so every manual
  cash-out printed the previous message glued to the front of the new one.
- **The card row showed the current card twice.** It rendered `base`, then the
  word "from", then the whole chain — and after a win `base` *is* the last card
  in the chain, so a two-call chain read "5 from 5 A". Now it's one ordered row,
  oldest to newest, with only the last card marked.
- **The loss message conflated two numbers.** "$52 gone" off a $50 stake at
  1.04x reads as though the wallet lost $52. It never held $52 — that was the
  pot. Both numbers are now named separately.
- **Nothing said which way the ace ranks.** You found out by seeing
  "Lower · impossible" and inferring. Now stated on the card row and in the
  help text — currently **ace-high** (rank 13), the usual poker/blackjack
  convention. (This was ace-low in an earlier build; flipped on request.
  The odds table is unaffected either way — it runs on rank magnitude, not
  on which card holds which rank.)
- **The buttons showed only the step multiplier,** which reads like a total.
  They now show what the pot becomes: `▲ Higher · 1.04× → $52`.
- The chain bar used to keep showing a dead round's multiplier next to a fresh
  Deal button. It now reports the outcome.
- **A winning call could pay nothing, silently.** Money is whole dollars, so a
  1.04x step on a $5 stake is 20 cents and floors away. On a King the only legal
  call *is* that step — so the whole move was forced and paid $0, and the button
  read `1.04x -> $5` next to `$5 riding`, which looks like a bug. The maths was
  right; the screen was lying by omission. Buttons now show the **gain**
  (`+$0`, `+$2`), and when every legal call gains nothing the panel says so and
  names the stake where it stops happening.

### The stake floor
`$25` is not a chosen number — it is where `floor(stake x 1.04) > stake` first
holds, so it's the smallest stake at which *every* call pays at least a dollar.
It's derived in the file rather than typed in, and stated in the game's own help
text. Below it the multiplier still compounds normally; the pot just doesn't
move until it has caught up (five straight wins at $5).

Deliberately **not** enforced as a minimum. Hi-Lo shares one `beginRound` with
the other games, a per-game floor would be a new rule in the seam, and telling
someone why their $5 chain is dull beats refusing to deal it.

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
property as Crash, before the chain compounds it. There is no card that's a
better bet, so a player can't be punished for not knowing an odds table.
Measured range across all 24 valid calls: 95.6–96.2% (rounding to cents).

Sample: 2 higher 1.04x, 3 higher 1.13x, J higher 4.16x, A higher impossible
(button disabled).

A push-on-tie version was tried first and does not work. Calling "higher" on
the lowest card (rank 1) wins 12/13 and pushes 1/13, so it can never lose —
the house could only take a cut by paying under 1x on a *win*, which is
nonsense. Ties losing removes that whole class of problem.

## Mines — configurable field (`mines.js`)

Same shape as Hi-Lo — a chain of picks, cash out anytime, one wrong pick
loses the whole chain — except the player chooses the odds up front by
picking the field size and how many mines are hidden in it, instead of
drawing from a fixed deck.

**Field is one of three square sizes** (4×4, 5×5, 6×6), not a free-form
width/height. An arbitrary grid is more surface for a trivial gain, and a
non-square field doesn't read as "a field" at a glance. Mine count is
player-chosen from 1 to (tiles − 1).

### The odds

With `n` tiles, `m` mines, and `j` already revealed safely, the next reveal
is safe with probability `(n-m-j)/(n-j)` — one fewer safe tile and one
fewer tile overall than a moment ago. The fair step multiplier is the
reciprocal, and RTP is applied per step exactly like Hi-Lo's per-call
payout:

```
step = RTP * (n-j) / (n-m-j)
EV   = ((n-m-j)/(n-j)) * step = RTP,  every step, whatever j is
```

So no field size or mine count is a better bet than another — same honesty
property as Hi-Lo's odds table. **This deliberately follows Hi-Lo's math,
not Crash's**: the edge compounds per reveal, a chain of `k` reveals
returns `0.96^k` overall, and that compounding is the tension the cash-out
button exists for. A flat-return version (Crash's approach) would be more
generous the further a player pushes, which doesn't fit a game whose whole
premise is that every additional reveal is a real, additional risk.

`MAX_MULT` is 50×, the same number as Hi-Lo's `MAX_CHAIN_MULT` — both are
compounding chain games in the same family, so one ceiling for both is
easier to justify than inventing a second number. Without it, a high
mine-density board cleared nearly to the end could pay a multiplier deep
into the hundreds.

### What settle() receives
`{ game: "mines", n, mines, revealed, mult }` — the field size and mine
count travel with every round, unlike Hi-Lo where the "config" is just
which deck (there's only one). Useful later for a stats breakdown by risk
level; nothing currently reads it back.

## Blackjack — the rules (`blackjack.js`)

Six-deck shoe, reshuffled per round. Dealer hits below 17, stands on 17 or
more including soft 17. Blackjack pays 3:2, push returns the stake, double
down on the opening two cards. **Splits are out of scope for v1.**

### Why it's the $300 unlock
Crash and Hi-Lo both return a flat 96% no matter what the player does — there
is nothing to learn. Blackjack is the opposite: played well it returns around
99%, played carelessly rather less. The expensive unlock buys a game where
paying attention is worth something. That answers the open question from stage
3: the pricier unlock buys a *better game*, not a better rake.

Card counting across rounds is pointless here anyway — the shoe is rebuilt
every round, and seven tickets per six hours caps the sample.

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

Terminal Hacker is worth noting here for the opposite reason: it is a wager,
but it has no chance element at all, which is the distinction most of those
rules actually turn on.
