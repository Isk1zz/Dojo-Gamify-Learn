# shop/ — career & rewards

> The folder is still called `shop/`; the screen is called **Career**.
> Nothing is bought with study currency any more.

Three currencies now, still deliberately separate — see `stars.js` below
for the newest one.

| File | Role |
|---|---|
| `themes.js` | Pure data: free `THEMES` + reward `PREMIUM_THEMES`. No DOM, no DB. |
| `ranks.js` | Pure data: the 20-rank ladder, XP thresholds, rewards, lookups. |
| `shop.js` | The Career screen — rank, the full ladder, what each rung awards. Read-only: it doesn't equip anything, see below. |
| `stars.js` | The ⭐ Star Shop screen (reached from Library) — packs and priced-course purchases. See its own section below. |

`life.js` (the life-sim: vitals, decay, night theft, the goods shop) was
**removed** — see BACKLOG.md's Batch 5/9. The wallet strip it also used to
own moved to `core/hud.js`, which already claimed "wallet and energy" as
its job in its own header comment. `$` money is still core economy (Garden
dividends, Arcade stakes/payouts) — only the survival sim on top of it is
gone.

Stylesheet: `styles/shop.css`.

## The currency rule
| | earned by | does what |
|---|---|---|
| ⚡ XP | studying | **never spent** — it raises your rank |
| $ money | Garden, Arcade | food, hygiene, shelter, story scenes, game unlocks, Arcade stake-cap upgrades |
| ⭐ Stars | rank-up rewards, real-money packs (currently a demo stub) | unlocks priced Library courses |

**None of the three convert to each other**, and nothing anywhere buys
progress, hints, retries or exam advantage.

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

## One shop, one screen

- **Career screen** — charge only. Rank and its rewards, read-only.
  `shop/shop.js`.

There is no money shop any more. `$` still exists as core economy —
`DB.getWallet`/`addMoney`/`spendMoney`, earned via Garden dividends and
Arcade payouts, spent on Arcade unlocks and stakes — it just no longer
buys anything survival-related, because there's no survival system left
to buy for.

## Stars (`stars.js`) — the Library's own currency

A course opts into costing Stars by setting `priceStars` on its manifest
(`library/content/registry.js` defaults it to 0 = free). No course does
today — `intro-cs` stays free — so this is machinery for the day a second,
paid course exists, not a change to anything currently gated.

**Earning:** a handful of rank-up rewards carry `reward: { stars: N }`
(ranks 6, 11, 15 right now) — credited exactly ONCE per rank crossed, via
`core/boot.js`'s `"rank:up"` Bus listener, not re-derived from XP the way
theme/bgStripe rewards are (see the comment on that in `ranks.js` — Stars
are spendable, so a membership-scan pattern would re-grant them forever).

**Spending / buying:** `Dojo.ownsCourse(id)` / the Star Shop's `buyCourse`
gate courses the same way Arcade unlocks and stake-cap tiers do — a string
in `DB`'s generic inventory array (`course_<id>`), no bespoke profile
field. `buyPack()` is the real-money side, and **it's a deliberate stub**:
there's no backend (static GitHub Pages site), so nothing here can verify a
real payment yet. It credits the pack instantly and says so in the UI
rather than faking a checkout flow — swap that one function for a real
Stripe Payment Link redirect once there's an account to wire it to; the
rest of the economy (earning, spending, gating) doesn't need to change.

Course pricing was benchmarked against the market before building this —
Dojo's actual shape (offline, no account, one-time unlock) is closer to
Anki ($25 once, own forever) and Udemy (per-course, not subscription) than
to Duolingo/Brilliant/Coursera's subscriptions, which is why courses are
priced as one-time Star unlocks, not a recurring toll.

## The wallet strip (moved to `core/hud.js`)

The always-on top strip shows the wallet balance whenever a profile is
active, hidden only on screens where a running balance would be noise
(course/unit select, a lesson, an exam, flashcards — see
`WALLET_HIDDEN_SCREENS` in `core/hud.js`). `renderVitals()` /
`#vitals-strip` keep their names for continuity with every call site that
already calls them (`core/core.js`'s `showScreen` choke point, several
`Bus.on` reactions in `core/boot.js`) even though "vitals" is now just the
wallet — there's nothing else left to render there.

## Exports
`THEMES`, `PREMIUM_THEMES`, `ALL_THEMES`, `isPremium`, `renderShop`, `shopSummary`,
`renderStarShop`, `ownsCourse`

## Emits
`wallet:changed`, `stars:changed`
