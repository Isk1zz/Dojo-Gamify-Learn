-- ================================================
-- Knell - 0013: the topic bonus keeps its exam multiplier, bounded
-- ------------------------------------------------
-- 0012 shipped claim_earning(item_id) with no way to express the one
-- reward in the app that legitimately varies with performance:
--
--   topic bonus = XP earned across the topic's chunks
--                 x (0.7 + score/100 * 0.8)      -> 0.7x .. 1.5x
--
-- Paying a flat amount instead would have removed the reward for doing
-- well, which is a real loss and not one worth taking quietly.
--
-- ---- What is trusted, exactly ----
-- The percentage comes from the client, because the client is still
-- what scores the exam. That is flag 5 and it is not done yet.
--
-- So this bounds it instead of believing it. The value is clamped to
-- 0..100 before use, and it can only ever move the bonus between 0.7x
-- and 1.5x of a figure THE SERVER computed. The most a lie is worth is
-- 2.14x on one topic bonus -- against the previous state of affairs,
-- where the client named any number it liked and got it.
--
-- Everything else stays server-decided: which items exist, what each is
-- worth, that each pays once, the pace, and the daily ceiling.
--
-- When flag 5 lands and the server scores the exam itself, this
-- argument goes away and the multiplier is derived, not passed.
-- ================================================

-- The one-argument form from 0012 is replaced rather than kept
-- alongside. Two overloads would mean two places to keep the rules in
-- step, and nothing calls the old signature yet -- the client wiring is
-- still to be written.
drop function if exists public.claim_earning(text);

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
  pct      int;
  ceiling  int := public.daily_xp_ceiling();
begin
  -- Same lock as grant_reputation, for the same read-then-write shape.
  perform pg_advisory_xact_lock(hashtext('knell.earning'), hashtext(u::text));

  -- Defence 2: only content that exists.
  select * into it from public.content_items where id = item_id;
  if not found then
    raise exception 'no such item' using errcode = 'P0002';
  end if;

  -- Defence 1: only once. A repeat is the normal result of a reload,
  -- not an error, so it returns rather than raising.
  if exists (select 1 from public.earnings where user_id = u and item = item_id) then
    return jsonb_build_object('status', 'already_paid', 'xp', 0, 'money', 0, 'tokens', 0);
  end if;

  -- Defence 3: pace, measured from the previous PAYMENT -- the only
  -- timestamp the server can trust. A duration reported by the client
  -- would be the same mistake award_xp made.
  if it.min_seconds > 0 then
    select max(created_at) into last_at from public.earnings where user_id = u;
    if last_at is not null then
      gap := extract(epoch from (now() - last_at));
      if gap < it.min_seconds then
        -- Not recorded: the item stays unclaimed and can be earned
        -- properly later. Forgiving costs nothing, because defence 1
        -- already caps the total and waiting gains a cheat nothing.
        return jsonb_build_object(
          'status', 'too_fast',
          'wait_seconds', ceil(it.min_seconds - gap),
          'xp', 0, 'money', 0, 'tokens', 0);
      end if;
    end if;
  end if;

  -- The server rolls the jitter. A range in the catalogue is not an
  -- invitation for the client to pick from it.
  pay_xp := it.xp_min + case when it.xp_max > it.xp_min
                             then floor(random() * (it.xp_max - it.xp_min + 1))::int
                             else 0 end;

  -- The bounded multiplier. Clamped first, so a null, a negative or a
  -- 10000 all land somewhere sane instead of being trusted.
  if score_pct is not null then
    pct  := least(100, greatest(0, score_pct));
    mult := 0.7 + (pct::numeric / 100) * 0.8;
    pay_xp := round(pay_xp * mult);
  end if;

  -- Defence 4: daily ceiling.
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
    'capped',  spent + pay_xp >= ceiling);
end;
$$;

revoke all    on function public.claim_earning(text, int)  from public, anon;
grant  execute on function public.claim_earning(text, int) to authenticated;
