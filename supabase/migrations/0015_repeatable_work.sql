-- ================================================
-- Knell - 0015: work that legitimately repeats
-- ------------------------------------------------
-- 0012's defence 1 is "pay once per piece of work, ever", enforced by
-- the primary key on (user_id, item). That is exactly right for a chunk
-- or a unit, and exactly wrong for the two rewards that are SUPPOSED to
-- come back:
--
--   * spaced review -- the whole point is returning to the same topic
--     next week and the week after;
--   * the final quiz -- retakeable, and already carrying its own
--     per-day attempt cap in the client (final_quiz.xpAttemptsToday).
--
-- Left as they were, both would have paid once and never again, which
-- is a worse failure than the one being fixed: the app would quietly
-- stop rewarding the habit it exists to build.
--
-- ---- The shape ----
-- The ledger key grows a `period`. One-time work stamps a fixed
-- sentinel date, so its behaviour is unchanged -- (user, item) is still
-- unique for it. Daily work stamps the current date, so it is unique
-- per user per item PER DAY: claimable again tomorrow, never twice in
-- one day.
--
-- 'epoch' (1970-01-01) is the sentinel rather than NULL, because NULL in
-- a primary key is not allowed and a nullable unique key would let the
-- same one-time item be paid any number of times.
--
-- ---- Why the amount is flat, not per card ----
-- Review used to pay REVIEW_XP_PER_CARD for each card the learner said
-- they knew. That count comes from the client, and "how many did you
-- get right" is precisely the number a console can inflate. A flat
-- amount per topic per day says the same thing -- you sat with this and
-- it stuck -- and asks the client for nothing.
-- ================================================

alter table public.content_items
  add column if not exists repeat_daily boolean not null default false;

-- Rebuild the ledger key to include the period.
--
-- The existing rows are one-time work, so they take the sentinel and
-- keep behaving exactly as before. Adding the column with a default and
-- then swapping the key means no row is lost -- deleting and recreating
-- would erase what people had already earned, which is the one thing
-- this table exists to prevent.
alter table public.earnings
  add column if not exists period date not null default date '1970-01-01';

alter table public.earnings drop constraint if exists earnings_pkey;
alter table public.earnings add primary key (user_id, item, period);

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

  -- Which bucket this claim falls in. Daily work gets today; everything
  -- else gets the sentinel, so it stays once-ever.
  per := case when it.repeat_daily then current_date else date '1970-01-01' end;

  -- Defence 1: once per item, per period.
  if exists (select 1 from public.earnings
              where user_id = u and item = item_id and period = per) then
    return jsonb_build_object('status', 'already_paid', 'xp', 0, 'money', 0, 'tokens', 0);
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

revoke all    on function public.claim_earning(text, int)  from public, anon;
grant  execute on function public.claim_earning(text, int) to authenticated;
