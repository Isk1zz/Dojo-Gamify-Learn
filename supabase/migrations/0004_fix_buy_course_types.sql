-- ================================================
-- Knell — 0004: fix buy_course's array handling
-- ------------------------------------------------
-- 0003 shipped buy_course using JSONB operators against
-- `economy.inventory`, which is `text[]` (0001 line 124), not jsonb.
-- Postgres rejected it at runtime with:
--
--   operator does not exist: text[] || jsonb
--
-- Caught by attacking the live function rather than by reading it: the
-- attempt to buy a 700-token course on a 0-token balance came back as a
-- TYPE error, not as "insufficient tokens". Worth stating plainly,
-- because the surface behaviour looked like a pass — the purchase did
-- fail and no course was granted — but for entirely the wrong reason.
-- The balance check was never reached, so the function was broken, not
-- secure. A "the attack failed" result is only meaningful once you read
-- WHY it failed.
--
-- Three swaps, no logic change:
--   inv jsonb                     -> inv text[]
--   inv ? key                     -> key = any(inv)
--   inventory || to_jsonb(key)    -> inventory || key
-- ================================================

create or replace function public.buy_course(course_id text)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  u uuid := public.require_uid();
  base_price int;
  is_available bool;
  tier int;
  discount numeric;
  final_price int;
  key text;
  new_tokens int;
  inv text[];
begin
  select price_tokens, available into base_price, is_available
    from public.courses where id = course_id;

  if not found then
    raise exception 'no such course' using errcode = 'P0002';
  end if;
  if not is_available then
    raise exception 'course not available' using errcode = 'P0001';
  end if;

  key := 'course_' || course_id;

  select patron_tier, inventory into tier, inv
    from public.economy where user_id = u for update;

  if key = any(inv) then
    -- Idempotent rather than an error: a double-tap on Buy must not
    -- charge twice, and "you already own this" is not a failure.
    return jsonb_build_object('status', 'already_owned', 'charged', 0);
  end if;

  discount := case tier when 1 then 0.10 when 2 then 0.20 when 3 then 0.30 else 0 end;
  final_price := case
    when base_price = 0 then 0
    else greatest(1, round(base_price * (1 - discount))::int)
  end;

  update public.economy
     set tokens    = tokens - final_price,
         inventory = inventory || key      -- text[] append
   where user_id = u
     and tokens >= final_price             -- check and debit, one statement
   returning tokens into new_tokens;

  if not found then
    raise exception 'insufficient tokens' using errcode = 'P0001';
  end if;

  return jsonb_build_object(
    'status', 'bought', 'charged', final_price, 'tokens_left', new_tokens);
end;
$$;

revoke all on function public.buy_course(text) from public, anon;
grant execute on function public.buy_course(text) to authenticated;
