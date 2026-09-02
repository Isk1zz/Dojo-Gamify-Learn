-- ================================================
-- Knell - 0014: the patron multiplier moves to the server
-- ------------------------------------------------
-- DB.addXp has always multiplied by patron tier (1x / 1.5x / 1.75x /
-- 2x) on its way in. With earning moved to claim_earning, that left two
-- bad options and no good one:
--
--   * apply it on the client after the server answers -- which is
--     trusting the client with the size of a reward again, the exact
--     thing 0012 exists to stop; or
--   * drop it -- silently removing what patrons are paying for.
--
-- The server already holds patron_tier in economy. It should apply its
-- own multiplier, and then the number it returns is the whole truth and
-- the client can write it down unchanged.
--
-- Order matters: roll, then the exam multiplier, then patron, then the
-- daily ceiling. The ceiling is a limit on XP actually granted, so it
-- has to come last -- otherwise a tier-3 patron's ceiling would
-- effectively be 4000.
-- ================================================

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

  -- Defence 1: only once.
  if exists (select 1 from public.earnings where user_id = u and item = item_id) then
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

  -- Patron multiplier, from the server's own copy of the tier. Mirrors
  -- PATRON_XP_MULT in data/db.js; an unknown tier falls back to 1x
  -- rather than to nothing.
  select patron_tier into tier from public.economy where user_id = u;
  patron := case coalesce(tier, 0)
              when 1 then 1.5
              when 2 then 1.75
              when 3 then 2
              else 1
            end;
  pay_xp := round(pay_xp * patron);

  -- Defence 4: daily ceiling, applied last so a patron's multiplier
  -- cannot lift the ceiling along with the reward.
  select coalesce(sum(xp), 0) into spent
    from public.earnings
   where user_id = u and created_at >= current_date;

  if spent + pay_xp > ceiling then
    pay_xp := greatest(0, ceiling - spent);
  end if;

  insert into public.earnings (user_id, item, xp, money, tokens)
  values (u, item_id, pay_xp, it.money, it.tokens);

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
    'capped',  spent + pay_xp >= ceiling);
end;
$$;

revoke all    on function public.claim_earning(text, int)  from public, anon;
grant  execute on function public.claim_earning(text, int) to authenticated;
