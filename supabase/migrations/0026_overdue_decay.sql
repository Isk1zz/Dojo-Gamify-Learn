-- ================================================
-- Knell - 0026: the Garden withers when neglected, and holiday mode
-- ------------------------------------------------
-- DECIDED 2026-09-03, two decisions in one migration because the second
-- changes the shape of the first.
--
-- ---- What was wrong ----
-- The Garden's whole claim is that it pictures RETENTION. The app says
-- so in as many words: "Skip reviews and a plant drops back."
--
-- It did not. `interval` is written in exactly one place --
-- scheduleReview in data/db.js -- which runs when somebody DOES a
-- review. Skipping one changed nothing; only the due date passed. A
-- lapse (quality < 3) drops the interval, but a lapse means you sat
-- down and failed, not that you stayed away.
--
-- So somebody who abandoned the app kept a garden of trees forever, and
-- the reputation allowance those trees pay for kept paying. The Garden
-- pictured a personal best, not a memory.
--
-- Worth recording because it was stated as fact in a research brief:
-- the brief told an outside reviewer "the right to praise decays if you
-- stop remembering", and it did not. A whole section of advice came
-- back addressing a decay that never existed. Checking the code before
-- describing it would have cost one grep.
--
-- ---- Decay ----
--     overdue   = days past due, or 0
--     effective = interval                              if overdue <= grace
--               = max(1, interval - (overdue - grace))  otherwise
--
-- One day off the interval per day overdue, after a week of grace. A
-- 30-day tree five days late is still a tree; fourteen days late it is
-- 23 days, one stage down. It never falls below 1: those topics were
-- genuinely learned once and the app should not pretend otherwise.
--
-- Linear, not exponential, because it can be said in one sentence to
-- the person it happens to. A half-life fits forgetting better in
-- theory; nobody can predict it while looking at their own garden, and
-- a rule you cannot anticipate reads as arbitrary.
--
-- ---- Holiday ----
-- A week of grace does not cover illness or a real holiday, so those
-- can be declared. While on holiday nothing withers.
--
-- The safeguard is not a quota. **Holiday also sets the reputation
-- allowance to zero.** Leaving it switched on permanently means giving
-- up your voice on the Forum to protect a number, so the arrangement
-- balances itself: the cost only bites when somebody is trying to have
-- it both ways.
--
-- On return, the days spent away are BANKED and added to the grace, so
-- a fortnight's absence does not arrive as a fortnight of decay. The
-- client shifts its own due dates by the same number so the watering
-- queue is the size it was on leaving, rather than a wall of forty --
-- which is a known reason people abandon spaced repetition entirely.
--
-- ---- What this rests on, stated plainly ----
-- Decay is computed from `due` inside progress.reviews, and progress is
-- pushed by the client. A client that moved its due dates forward would
-- protect its own weight.
--
-- That is not a new hole: completed_topics is pushed the same way and
-- already grants weight. It is the same trust, and it closes the same
-- way -- with the server-side content validation already queued in
-- UPDATESTACK.md. Worth naming here so nobody reads this migration as
-- more airtight than it is.
-- ================================================

alter table public.profiles
  add column if not exists holiday_since timestamptz,
  -- Days banked from finished holidays. Added to the grace window, so
  -- time away is forgiven rather than merely paused.
  add column if not exists holiday_days int not null default 0
    check (holiday_days >= 0);

-- ---- The rule, in one place -----------------------------------------
create or replace function public.effective_interval(
  iv numeric, due_text text, grace int default 7
)
returns numeric
language sql
immutable
set search_path = ''
as $$
  select case
    when iv is null then 1
    when due_text is null then iv          -- never scheduled: nothing is overdue
    else greatest(1, iv - greatest(0, (current_date - due_text::date) - greatest(0, grace)))
  end
$$;

-- ---- Weight ----------------------------------------------------------
create or replace function public.garden_weight()
returns int
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  u uuid := auth.uid();
  done text[];
  revs jsonb;
  t text;
  iv numeric;
  total int := 0;
  grace int := 7;
  on_holiday bool := false;
  banked int := 0;
begin
  if u is null then return 0; end if;

  select (holiday_since is not null), coalesce(holiday_days, 0)
    into on_holiday, banked
    from public.profiles where id = u;

  if on_holiday then
    -- Nothing withers while away. A grace larger than any interval
    -- makes the decay term zero without a second code path.
    grace := 100000;
  else
    grace := 7 + banked;
  end if;

  select completed_topics, reviews into done, revs
    from public.progress where user_id = u;
  if not found then return 0; end if;

  foreach t in array coalesce(done, array[]::text[])
  loop
    iv := public.effective_interval(
            coalesce((revs -> t ->> 'interval')::numeric, 1),
            revs -> t ->> 'due',
            grace);
    total := total + case
      when iv >= 60 then 3
      when iv >= 21 then 2
      else 1
    end;
  end loop;

  return total;
end;
$$;

-- ---- Allowance: zero while away --------------------------------------
-- This is the whole safeguard. Holiday has no quota and no limit
-- because it costs the one thing somebody would be gaming it for.
create or replace function public.rep_allowance()
returns int
language plpgsql
stable
security definer
set search_path = ''
as $$
declare u uuid := auth.uid(); away bool;
begin
  if u is null then return 0; end if;
  select (holiday_since is not null) into away from public.profiles where id = u;
  if coalesce(away, false) then return 0; end if;
  return least(5, public.garden_weight() / 5);
end;
$$;

-- ---- Starting and ending -------------------------------------------
create or replace function public.start_holiday()
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare u uuid := public.require_uid(); already timestamptz;
begin
  select holiday_since into already from public.profiles where id = u;
  if already is not null then
    return jsonb_build_object('status', 'already_away', 'since', already);
  end if;
  update public.profiles set holiday_since = now() where id = u;
  return jsonb_build_object('status', 'away', 'since', now());
end;
$$;

-- Returns the number of days to shift local due dates by, so the client
-- and this function apply the same number and cannot drift.
create or replace function public.end_holiday()
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  u uuid := public.require_uid();
  since timestamptz;
  days int;
begin
  select holiday_since into since from public.profiles where id = u;
  if since is null then
    return jsonb_build_object('status', 'not_away', 'days', 0);
  end if;

  -- Rounded up: half a day away still displaced a day's reviews.
  days := greatest(0, ceil(extract(epoch from (now() - since)) / 86400)::int);

  update public.profiles
     set holiday_since = null,
         holiday_days = coalesce(holiday_days, 0) + days
   where id = u;

  return jsonb_build_object('status', 'back', 'days', days);
end;
$$;

create or replace function public.holiday_status()
returns jsonb
language sql
stable
security definer
set search_path = ''
as $$
  select jsonb_build_object(
    'away',  (holiday_since is not null),
    'since', holiday_since,
    'banked', coalesce(holiday_days, 0))
    from public.profiles where id = auth.uid()
$$;

revoke all    on function public.effective_interval(numeric, text, int)  from public, anon;
grant  execute on function public.effective_interval(numeric, text, int) to authenticated;
revoke all    on function public.start_holiday()   from public, anon;
grant  execute on function public.start_holiday()  to authenticated;
revoke all    on function public.end_holiday()     from public, anon;
grant  execute on function public.end_holiday()    to authenticated;
revoke all    on function public.holiday_status()  from public, anon;
grant  execute on function public.holiday_status() to authenticated;
