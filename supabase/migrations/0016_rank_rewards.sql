-- ================================================
-- Knell - 0016: rank rewards, and the server verifies the rank itself
-- ------------------------------------------------
-- The last client-side grant. core/boot.js listened for `rank:up` and
-- called DB.addTokens(bonus) -- so the free Tokens the Career ladder
-- hands out were written locally, the server never heard of them, and
-- the next economy pull erased them. The same bug XP had, on the
-- currency that costs real money.
--
-- ---- Why these are STRONGER than every other catalogue item ----
-- Every other item trusts progress. The client pushes completed_topics,
-- and the server pays for what is in it; forging progress forges the
-- payment. That is a known, accepted weakness -- the Garden and the
-- reputation allowance already rest on it.
--
-- A rank reward does not have to. The server holds charge_earned, and
-- it has held it since 0012, when XP stopped being something the client
-- could name. So a rank reward is paid against a number the server
-- computed from payments it made itself. Nothing in the request is
-- believed: not the rank, not the XP, not the amount.
--
-- Hence require_xp. It is a general column rather than a rank-only
-- mechanism, because "you may claim this once you have genuinely earned
-- N XP" is a shape other rewards will want.
--
-- ---- The numbers ----
-- Read from shop/ranks.js: n=6 -> 100, n=8 -> 50, n=12 -> 75,
-- n=15 -> 200, n=18 -> 120. Five rewards, 545 Tokens across the ladder.
--
-- NOT the 795 that file's own header comment claims. That figure sums
-- seven rewards (100+50+150+75+200+100+120); two of them no longer
-- exist in the array below it. The comment was not updated when they
-- went. Taken from the array, which is what the app actually runs.
--
-- These rows live here rather than in build-catalogue.js because they
-- come from the rank ladder, not from course content -- regenerating
-- the catalogue after adding a course must not need to know about them.
-- ================================================

alter table public.content_items
  add column if not exists require_xp int not null default 0;

-- 'rank' is a new kind, and 0012's CHECK does not know about it. The
-- constraint is worth keeping rather than dropping: it is what catches a
-- typo in a generated catalogue before it becomes 4000 unclaimable rows.
alter table public.content_items drop constraint if exists content_items_kind_check;
alter table public.content_items add constraint content_items_kind_check
  check (kind in ('chunk','topic','unit','course','final','review','rank'));

create or replace function public.claim_earning(item_id text, score_pct int default null)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  u        uuid := public.require_uid();
  it       public.content_items%rowtype;
  per      date;
  last_at  timestamptz;
  gap      numeric;
  spent    int;
  earned   int;
  pay_xp   int;
  mult     numeric := 1;
  patron   numeric := 1;
  tier     smallint;
  pct      int;
  ceiling  int := public.daily_xp_ceiling();
begin
  perform pg_advisory_xact_lock(hashtext('knell.earning'), hashtext(u::text));

  -- Defence 2: only content that exists.
  select * into it from public.content_items where id = item_id;
  if not found then
    raise exception 'no such item' using errcode = 'P0002';
  end if;

  per := case when it.repeat_daily then current_date else date '1970-01-01' end;

  -- Defence 1: once per item, per period.
  if exists (select 1 from public.earnings
              where user_id = u and item = item_id and period = per) then
    return jsonb_build_object('status', 'already_paid', 'xp', 0, 'money', 0, 'tokens', 0);
  end if;

  -- Defence 5 (new): an XP threshold the SERVER checks against its own
  -- ledger. Placed before the pace check on purpose -- "you have not
  -- earned this yet" is a truer answer than "slow down", and a rank the
  -- caller has not reached should say so whatever the timing.
  if it.require_xp > 0 then
    select charge_earned into earned from public.economy where user_id = u;
    if coalesce(earned, 0) < it.require_xp then
      return jsonb_build_object(
        'status', 'not_yet',
        'need_xp', it.require_xp,
        'have_xp', coalesce(earned, 0),
        'xp', 0, 'money', 0, 'tokens', 0);
    end if;
  end if;

  -- Defence 3: pace, measured from the previous PAYMENT.
  if it.min_seconds > 0 then
    select max(created_at) into last_at from public.earnings where user_id = u;
    if last_at is not null then
      gap := extract(epoch from (now() - last_at));
      if gap < it.min_seconds then
        return jsonb_build_object(
          'status', 'too_fast',
          'wait_seconds', ceil(it.min_seconds - gap),
          'xp', 0, 'money', 0, 'tokens', 0);
      end if;
    end if;
  end if;

  -- The server rolls the jitter.
  pay_xp := it.xp_min + case when it.xp_max > it.xp_min
                             then floor(random() * (it.xp_max - it.xp_min + 1))::int
                             else 0 end;

  -- Exam multiplier: clamped, never believed.
  if score_pct is not null then
    pct  := least(100, greatest(0, score_pct));
    mult := 0.7 + (pct::numeric / 100) * 0.8;
    pay_xp := round(pay_xp * mult);
  end if;

  -- Patron multiplier, from the server's own copy of the tier.
  select patron_tier into tier from public.economy where user_id = u;
  patron := case coalesce(tier, 0)
              when 1 then 1.5 when 2 then 1.75 when 3 then 2 else 1 end;
  pay_xp := round(pay_xp * patron);

  -- Defence 4: daily ceiling, last so a multiplier cannot lift it.
  select coalesce(sum(xp), 0) into spent
    from public.earnings
   where user_id = u and created_at >= current_date;

  if spent + pay_xp > ceiling then
    pay_xp := greatest(0, ceiling - spent);
  end if;

  insert into public.earnings (user_id, item, period, xp, money, tokens)
  values (u, item_id, per, pay_xp, it.money, it.tokens);

  update public.economy
     set charge        = charge        + pay_xp,
         charge_earned = charge_earned + pay_xp,
         wallet        = wallet        + it.money,
         tokens        = tokens        + it.tokens,
         updated_at    = now()
   where user_id = u;

  if not found then
    raise exception 'no economy row' using errcode = 'P0002';
  end if;

  return jsonb_build_object(
    'status',  'paid',
    'xp',      pay_xp,
    'money',   it.money,
    'tokens',  it.tokens,
    'mult',    round(mult, 2),
    'patron',  patron,
    'daily',   it.repeat_daily,
    'capped',  spent + pay_xp >= ceiling);
end;
$$;

-- The five rank rewards. min_seconds is 0: crossing a rank boundary
-- happens in the same instant as the payment that caused it, so any
-- pace threshold would refuse every one of them.
insert into public.content_items
  (id, kind, xp_min, xp_max, money, tokens, min_seconds, repeat_daily, require_xp)
values
  ('rank:6',  'rank', 0, 0, 0, 100, 0, false, 10800),
  ('rank:8',  'rank', 0, 0, 0,  50, 0, false, 18000),
  ('rank:12', 'rank', 0, 0, 0,  75, 0, false, 37200),
  ('rank:15', 'rank', 0, 0, 0, 200, 0, false, 56400),
  ('rank:18', 'rank', 0, 0, 0, 120, 0, false, 81000)
on conflict (id) do update set
  tokens = excluded.tokens, require_xp = excluded.require_xp, kind = excluded.kind;

revoke all    on function public.claim_earning(text, int)  from public, anon;
grant  execute on function public.claim_earning(text, int) to authenticated;
