-- ================================================
-- Knell - 0027: 60 holiday days a year
-- ------------------------------------------------
-- DECIDED 2026-09-03. 0026 shipped holiday with no limit at all, on the
-- reasoning that zeroing the reputation allowance makes a permanent
-- holiday self-defeating.
--
-- That reasoning only holds for somebody who wants the Forum. To
-- somebody who does not, a permanent holiday costs nothing, and their
-- Garden stays a picture of a personal best forever -- which is the
-- thing the Garden exists not to be. The safeguard covered cheating
-- other people and missed cheating yourself, and the Garden is looked
-- at by its owner first.
--
-- **The cost of this was raised and accepted**: a 60-day budget
-- punishes a long illness, which is precisely the case holiday was
-- added for. Recorded here rather than argued again later.
--
-- ---- A rolling year, not a calendar one ----
-- A calendar budget resets on 1 January, so the limit is avoidable by
-- waiting. The window is the last 365 days, always.
--
-- ---- Counted from elapsed time, not from button presses ----
-- The obvious implementation adds up finished holidays. Somebody who
-- starts one and never presses "back" would then never spend any
-- budget, and the limit would be decoration.
--
-- So the budget is computed from real elapsed time, including an
-- ongoing holiday up to this moment. Forgiveness stops the instant the
-- 60 days are used, whether or not the flag is still set -- and once it
-- stops, the Garden withers again with the flag still on. That is what
-- gives somebody a reason to end it.
-- ================================================

create table if not exists public.holidays (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users(id) on delete cascade,
  started_at timestamptz not null default now(),
  -- Null while it is still running.
  ended_at   timestamptz,
  check (ended_at is null or ended_at >= started_at)
);

alter table public.holidays enable row level security;

drop policy if exists holidays_read_own on public.holidays;
create policy holidays_read_own on public.holidays
  for select to authenticated using (user_id = auth.uid());

-- No write policy. start_holiday and end_holiday are the only writers.

create index if not exists holidays_user_started
  on public.holidays (user_id, started_at desc);

create or replace function public.holiday_budget_days()
returns int language sql immutable set search_path = ''
as $$ select 60 $$;

-- Days used inside the trailing year, counting an unfinished holiday up
-- to right now. Clipped at the window edge so a holiday that began 400
-- days ago only contributes the part inside the window.
create or replace function public.holiday_used_days(u uuid)
returns int
language sql
stable
security definer
set search_path = ''
as $$
  select coalesce(ceil(sum(
    extract(epoch from (
      least(coalesce(h.ended_at, now()), now())
      - greatest(h.started_at, now() - interval '365 days')
    )) / 86400
  ))::int, 0)
  from public.holidays h
  where h.user_id = u
    and coalesce(h.ended_at, now()) > now() - interval '365 days'
$$;

create or replace function public.holiday_remaining_days()
returns int
language sql
stable
security definer
set search_path = ''
as $$
  select greatest(0, public.holiday_budget_days()
                   - public.holiday_used_days(auth.uid()))
$$;

-- ---- Weight, with the budget enforced --------------------------------
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
  remaining int := 0;
begin
  if u is null then return 0; end if;

  select (holiday_since is not null), coalesce(holiday_days, 0)
    into on_holiday, banked
    from public.profiles where id = u;

  remaining := greatest(0, public.holiday_budget_days() - public.holiday_used_days(u));

  if on_holiday and remaining > 0 then
    -- Nothing withers while away AND within budget. A grace larger than
    -- any interval zeroes the decay term without a second code path.
    grace := 100000;
  else
    -- Out of budget: decay resumes even though the flag is still set.
    -- That is the whole point of a budget, and it is what gives someone
    -- a reason to end a holiday they forgot about.
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

-- ---- Starting, ending, reporting -------------------------------------
create or replace function public.start_holiday()
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  u uuid := public.require_uid();
  already timestamptz;
  left_days int;
begin
  select holiday_since into already from public.profiles where id = u;
  if already is not null then
    return jsonb_build_object('status', 'already_away', 'since', already);
  end if;

  left_days := greatest(0, public.holiday_budget_days() - public.holiday_used_days(u));
  if left_days <= 0 then
    return jsonb_build_object('status', 'no_budget', 'remaining', 0,
                              'budget', public.holiday_budget_days());
  end if;

  insert into public.holidays (user_id) values (u);
  update public.profiles set holiday_since = now() where id = u;
  return jsonb_build_object('status', 'away', 'since', now(), 'remaining', left_days);
end;
$$;

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
  allowed int;
begin
  select holiday_since into since from public.profiles where id = u;
  if since is null then
    return jsonb_build_object('status', 'not_away', 'days', 0);
  end if;

  update public.holidays set ended_at = now()
   where user_id = u and ended_at is null;

  -- Rounded up: half a day away still displaced a day's reviews.
  days := greatest(0, ceil(extract(epoch from (now() - since)) / 86400)::int);

  -- Only forgive what the budget actually covered. Days taken past the
  -- limit were not forgiven at the time -- the Garden was withering
  -- through them -- so banking them now would hand back what was
  -- already spent.
  allowed := greatest(0, public.holiday_budget_days()
                       - (public.holiday_used_days(u) - days));
  days := least(days, allowed);

  update public.profiles
     set holiday_since = null,
         holiday_days = coalesce(holiday_days, 0) + days
   where id = u;

  return jsonb_build_object('status', 'back', 'days', days,
                            'remaining', public.holiday_remaining_days());
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
    'away',      (p.holiday_since is not null),
    'since',     p.holiday_since,
    'banked',    coalesce(p.holiday_days, 0),
    'used',      public.holiday_used_days(auth.uid()),
    'budget',    public.holiday_budget_days(),
    'remaining', public.holiday_remaining_days())
    from public.profiles p where p.id = auth.uid()
$$;

revoke all    on function public.holiday_budget_days()     from public, anon;
grant  execute on function public.holiday_budget_days()    to authenticated;
revoke all    on function public.holiday_used_days(uuid)   from public, anon;
grant  execute on function public.holiday_used_days(uuid)  to authenticated;
revoke all    on function public.holiday_remaining_days()  from public, anon;
grant  execute on function public.holiday_remaining_days() to authenticated;
