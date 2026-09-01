-- ================================================
-- Knell — 0003: economy RPCs
-- ------------------------------------------------
-- BACKEND-ROADMAP.md Step 5. Everything before this was plumbing; this
-- is the payoff. `economy` has no client write policy, so the ONLY way
-- a balance can change is one of these functions, each of which
-- enforces its own rule server-side instead of trusting the client.
--
-- ---- Scope is NARROWER than the roadmap's Step 5 table ----
-- That table lists add_wallet/spend_wallet/claim_dividend. It was
-- written 2026-08-13 and is stale: UPDATESTACK.md's later decisions
-- removed both of those systems.
--   * Garden dividends were cut ("Earning: Nothing. No Garden
--     dividends, no accumulation") when reputation became a daily
--     ALLOWANCE that expires nightly rather than a balance.
--   * `$` lost every sink when cosmetics went free and the Exchange
--     was removed, so there is nothing to spend it on.
-- Writing those RPCs would have rebuilt two deleted systems in
-- Postgres. Only the live ones are here: XP and course purchase.
--
-- The reputation allowance is NOT here either, on purpose — it pays
-- into a Forum that does not exist yet, and its formula is still open
-- (see UPDATESTACK.md). A server-side rule for it belongs in the same
-- batch as the Forum, not ahead of it.
--
-- ---- Why SECURITY DEFINER ----
-- These run as the function owner, which bypasses RLS — that is exactly
-- why they can write a table the caller cannot. That also makes them the
-- most dangerous objects in the schema, so every one of them:
--   * derives the user from auth.uid(), NEVER from an argument. A
--     user_id parameter would let any caller name someone else's row.
--   * validates its own inputs before touching anything.
--   * has an empty search_path pinned, so a hostile schema earlier on
--     the path cannot shadow a function these call.
--   * is revoked from public/anon and granted only to authenticated.
--
-- ---- Flag 1 is structural here, not a policy ----
-- Flag 1 requires that $ (earned) and Tokens (bought with real money)
-- never interconvert. There is deliberately NO function here that reads
-- one and writes the other. The boundary is enforced by the absence of
-- code rather than a check inside one, which is the stronger form:
-- there is nothing to get wrong later.
-- ================================================

-- ---- Server-side course prices ---------------------------------------
-- Finding 4: `priceTokens` lives in the client-side course manifests,
-- so buy_course had no trustworthy price to read. Option (a) chosen
-- (see the roadmap): Postgres owns the price, and the manifest's copy
-- becomes display-only. The client's number is never believed.
create table if not exists public.courses (
  id           text primary key,
  price_tokens int  not null default 0 check (price_tokens >= 0),
  available    bool not null default true
);

alter table public.courses enable row level security;

-- Readable by anyone signed in (the buy modal needs to show a price);
-- writable by nobody through the API. Prices change by migration.
drop policy if exists courses_read on public.courses;
create policy courses_read on public.courses
  for select to authenticated using (true);

insert into public.courses (id, price_tokens, available) values
  ('intro-cs',   700, true),
  ('bike-a3',    100, true),
  ('philosophy',   0, true)
on conflict (id) do update
  set price_tokens = excluded.price_tokens,
      available    = excluded.available;

-- ---- Helper: the caller's id, or an error -----------------------------
create or replace function public.require_uid()
returns uuid
language plpgsql
stable
security definer
set search_path = ''
as $$
declare u uuid;
begin
  u := auth.uid();
  if u is null then
    raise exception 'not authenticated' using errcode = '28000';
  end if;
  return u;
end;
$$;

-- ---- award_xp ---------------------------------------------------------
-- `charge` is the historical column name for XP (see data/db.js's
-- defaultProfile comment). Capped per call so a forged value cannot jump
-- the rank ladder in one shot; the cap is generous next to real earnings
-- (5-7 per chunk) and exists to bound abuse, not to pace honest play.
--
-- Still live and still worth protecting: XP drives rank, rank drives
-- rank-gated rewards, and under the decided reputation model it would
-- drive the daily allowance too.
create or replace function public.award_xp(amount int)
returns int
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  u uuid := public.require_uid();
  granted int;
  new_total int;
begin
  if amount is null or amount <= 0 then
    raise exception 'amount must be positive' using errcode = '22023';
  end if;
  granted := least(amount, 200);   -- per-call ceiling

  update public.economy
     set charge        = charge + granted,
         charge_earned = charge_earned + granted
   where user_id = u
   returning charge into new_total;

  if not found then
    raise exception 'no economy row' using errcode = 'P0002';
  end if;
  return new_total;
end;
$$;

-- ---- buy_course -------------------------------------------------------
-- The one that actually closes the paywall. Price comes from
-- public.courses, the discount from the caller's own patron_tier, and
-- the balance check and the debit are a single statement so two
-- concurrent calls cannot both succeed off one balance.
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
  inv jsonb;
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

  if inv ? key then
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
         inventory = inventory || to_jsonb(key)
   where user_id = u
     and tokens >= final_price
   returning tokens into new_tokens;

  if not found then
    raise exception 'insufficient tokens' using errcode = 'P0001';
  end if;

  return jsonb_build_object(
    'status', 'bought', 'charged', final_price, 'tokens_left', new_tokens);
end;
$$;

-- ---- Permissions ------------------------------------------------------
-- Default-deny, then grant only what a signed-in user may call.
-- grant_tokens is deliberately NOT created: it can only exist once a
-- payment webhook can verify a receipt, and a version callable by the
-- client would be a free-token button.
revoke all on function public.require_uid()    from public, anon;
revoke all on function public.award_xp(int)    from public, anon;
revoke all on function public.buy_course(text) from public, anon;

grant execute on function public.award_xp(int)    to authenticated;
grant execute on function public.buy_course(text) to authenticated;
-- require_uid stays internal: it is a helper these call, not an API.
