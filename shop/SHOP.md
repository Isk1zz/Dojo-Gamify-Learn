# shop/ — career & rewards

> The folder is still called `shop/`; the screen is called **Career**.
> Nothing is bought with study currency any more.

Two shops, two currencies, deliberately separate.

| File | Role |
|---|---|
| `themes.js` | Pure data: free `THEMES` + reward `PREMIUM_THEMES`. No DOM, no DB. |
| `ranks.js` | Pure data: the 20-rank ladder, XP thresholds, rewards, lookups. |
| `shop.js` | The Career screen — rank, the full ladder, what each rung awards. Read-only: it doesn't equip anything, see below. |
| `life.js` | The money shop — vitals model, decay, goods, the wallet strip. **Built.** |

Stylesheet: `styles/shop.css`.

## The currency rule
| | earned by | does what |
|---|---|---|
| ⚡ XP | studying | **never spent** — it raises your rank |
| $ money | Garden, Arcade | food, hygiene, shelter, story scenes, game unlocks |

**Neither converts to the other**, and nothing anywhere buys progress, hints,
retries or exam advantage.

### Why XP isn't a currency any more
The study side was a capped wallet through v5, and a cap needs a sink, a sink
needs prices, and prices made studying feel like earning tokens. XP has no
ceiling and no spend: it only accumulates, and **rank** is what it produces.
There is nothing left to balance.

## The rank ladder (`ranks.js`)

20 ranks on a research-lab hierarchy, Lab Intern → Nobel Laureate, with
rewards attached to eight of them.

**How it was sized.** The ceiling is 5,000 XP at Nobel Laureate, with the
rungs below spread so gaps widen smoothly (60, 90, 110 … 460, 490).

At ~30 XP/day (15 min ≈ 5 chunks): Director of Operations around day 60,
Lead Investigator around day 107, Nobel Laureate around day 167.

**Note the trade.** A 5,000 ceiling is a *longer* ladder than the original
120-day brief — finishing it in 120 days needs ~42 XP/day, closer to 20
minutes than 15. Running out of ladder is worse than having some left, so this
is the right way round, but it is a trade and it is written down rather than
left as a surprise.

*If XP per chunk ever changes, re-check the comment at the top of `ranks.js` —
it is the only place the 15-minute assumption is written down.*

| Rank | XP | Reward |
|---|---|---|
| 4 Lab Technician | 260 | Sakura Midnight |
| 5 Shift Supervisor | 390 | Paper (first light theme) |
| 7 Senior Research Coordinator | 710 | Sumi Ink |
| 10 Chief Technician | 1,340 | Amber Terminal |
| 13 Principal Investigator | 2,150 | Koi Pond |
| 16 Lead Investigator | 3,200 | Neon Ronin |
| 19 Vice President of R&D | 4,510 | Fuji Dawn |
| 20 Nobel Laureate | 5,000 | Kirigami |

**`reward: null` is deliberate, not an oversight.** The other 12 ranks still
rank up and still show on the ladder with a blank — fill them in when there is
something worth giving. Showing the empty rungs is the honest version of a
rewards list.

Adding a theme is one entry in `themes.js` plus a rank in `ranks.js`. The card
paints itself in the theme it shows, so no preview image is needed.

A theme applies only if the rank was reached (or it was bought under the old
paid system — those stay owned). `Dojo.themeUnlocked(id)` is the check, and
`resolveTheme` falls back to Indigo rather than letting an imported profile
wear a reward it never earned.

**Career shows rewards, it doesn't equip them.** The ladder used to have its
own theme grid with Equip buttons, sitting right next to Settings' identical
picker — two places to do the same thing. Removed; Career is read-only now
(rank, ladder, what each rung awards) and Settings' "Awarded themes" section
is the one place to actually equip one.

## Two shops, two screens

The split is by **coin**, not by folder:

- **Career screen** — charge only. Rank and its rewards, read-only.
  `shop/shop.js`.
- **Story tab of the Arcade** — money only. Vitals, food, hygiene, shelter,
  papers. `shop/life.js` renders there as a guest.

Staying alive and getting off the street are the same coin and the same
fiction, so they share one surface: your state and what you can buy sit
directly above the map they are for. `renderLifeTab(body)` draws into whatever
container it is handed and never calls `showScreen` — the Arcade owns that
screen.

## Vitals and decay (`life.js`)

**Hunger/thirst/hygiene, and now shelter too, no longer show on the
always-on top strip** — only the wallet does. Shelter is a Story-fiction
detail ("where you sleep"), same reasoning that already moved the three
vitals off this strip. All four are still visible inside the Story tab's
life-shop panel (`renderLifeTab`'s `.vitals-detail` / `.sw-meta`), which
already had full detail, so nothing was lost — it's just not shown outside
the Story tab any more. `renderVitals()` / `#vitals-strip` keep their names
even though they only render the wallet now.

> **Resolved.** Decay moved to a **story-day** concept: a day is now a
> resolved story scene, not a real calendar day. See below.

**Decay is per activity, not per clock.** This is the decision to protect.

A real-time drain would mean coming back from a week away to a starving
character — the app would punish taking days off, which is exactly what
spacing is for and exactly why PROJECT.md §5 rejected streaks. Clock-based
vitals are a streak wearing a different hat.

| Trigger | thirst / hunger / hygiene |
|---|---|
| lesson chunk | −3 / −2 / −1 |
| mastery exam | −5 / −4 / −2 |
| arcade round | −2 / −2 / −2 |
| story scene = **one story day** | −8 / −8 / −6 |

There is no longer a separate real-calendar-day tick. `story.js`'s
`resolveChoice` calls `cost("story")` for that vitals hit, then
`LifeShop.storyDayTick()` for the other thing a day used to trigger (night
theft, below) — both keyed to a scene resolving, never to the wall clock.
Being away is still free; only playing through a scene costs anything, and
it costs the same whether you come back in an hour or a month.

The old daily tick applied a shelter multiplier to soften its vitals cost.
That multiplier had nothing left to soften once the vitals cost moved onto
`cost("story")` (which was already flat), so shelter's effect on upkeep now
runs entirely through THEFT's per-tier rates below, not through vitals too.

### Night theft — the economy's sink

On a story day (a resolved scene) there is a chance somebody goes through
your pockets and takes a **percentage** of your cash.

| Sleeping | Chance | Taken |
|---|---|---|
| Street | 1 in 3 | 20–50% |
| Hostel | 1 in 12 | 10–25% |
| Car | 1 in 20 | 10–20% |
| Apartment | never | — |

This is the main reason shelter is worth buying, and the main reason money
doesn't run away. Without it the wallet only ever goes up: the Garden pays
every day forever while upkeep is a few dollars, so a long-term player ends
up with a number that means nothing.

**It's a percentage, not a flat amount,** so it keeps biting at any wealth
level — losing $40 of $80 and $4,000 of $8,000 hurt the same.

Like decay, it only fires on a story day — a scene you actually resolved,
never a timer. Being away is still free. The result is reported once via
`LifeShop.lastNight()` and shown as a banner on the Story tab.

### Consequences of running empty (≤15 on any vital)
- Arcade closed, story scenes closed.
- **The Library is never gated.** You can always study, whatever state you're
  in. If a future change makes low vitals block a lesson, that change is wrong.

### Prices
At the intended pace (~10 chunks plus a daily tick) upkeep runs about $9/day.
A three-plant Garden pays $9/day; a full one pays $78. Early play is tight and
later play is comfortable — deliberately.

> Stale since the story-day change above: this math assumed a flat daily
> tick independent of story activity. Upkeep is now driven by story scenes
> resolved, not days elapsed, so "$9/day" needs re-deriving against however
> often a player actually resolves a scene. Not recalculated yet — don't
> treat the number above as current.

`buy(id)` is the only path that may touch the wallet or vitals from a
purchase. Other branches call `LifeShop.cost(kind)`, never `DB.patchVitals`.

## Exports
`THEMES`, `PREMIUM_THEMES`, `ALL_THEMES`, `isPremium`, `renderShop`,
`shopSummary`, `Dojo.LifeShop = { LIFE_ITEMS, item, buy }`

## Emits
`wallet:changed`, `vitals:changed`

## The bag — consumables are carried

`inventory` used to be written on every purchase and read by nothing: buying
water applied +35 thirst at the till, so the field was a receipt log. That was
wrong twice over — you couldn't stock up while rich and eat while broke, which
*is* the survival decision, and buying at full thirst wasted the money silently.

Now:
- **Consumables and hygiene go in the bag** (`buy` → `DB.addInventory`) and are
  spent with `use(id)`, which returns false if there isn't one so the UI can
  never show an effect that didn't land.
- **Unlocks apply on purchase** — a hostel bed is a night, not a thing in a bag.
- **A shelter purchase can never move you *down* the ladder.** Buying a hostel
  bed while holding a lease used to demote you to hostel, i.e. the app took your
  flat away for $25. `LADDER` position is compared before the effect applies.

`bag()` returns counts per item; the Story tab renders it above the shop.

## Not done
- Garden decorations and quote packs (stubbed as "coming later").
- `id_card` and `licence` have no vitals effect; they exist for story nodes to
  require, which they now do.
