-- ================================================
-- Knell — 0010: reputation RPCs
-- ------------------------------------------------
-- docs/FORUM-PLAN.md step 2. The step everything else exists for: every
-- rule about the allowance and both caps live HERE, because this is the
-- only place they cannot be bypassed.
--
-- ---- The allowance is NEVER STORED ----
-- There is no balance column anywhere, and that is the implementation of
-- "it expires nightly" rather than an omission. Today's allowance is
-- computed from the Garden; today's spend is a COUNT over the grant
-- journal since midnight. Tomorrow the count resets on its own because
-- the date moved -- no cron, no nightly job, neither of which the free
-- tier offers.
--
-- ---- Column types differ, and mixing them up already cost once ----
-- progress.completed_topics is TEXT[] but progress.reviews is JSONB. The
-- 0004 fix existed because 0003 used jsonb operators on a text[]. So:
-- unnest() over the array, -> over the json. Not interchangeable.
--
-- ---- Midnight is UTC ----
-- current_date is the server's, so the reset lands at 00:00 UTC (03:00
-- for a user in UTC+3). Acceptable while the audience is small and one
-- consistent moment beats a per-user one; revisit if it ever annoys
-- anyone. Stated because "why did my allowance reset at 3am" deserves an
-- answer that exists in writing.
-- ================================================

-- ---- Garden weight -------------------------------------------------
-- Decided 2026-09-01. Only MASTERED topics weigh anything: an allowance
-- for retention should not pay for opening fifty topics and finishing
-- none. Maturity is read from the SM-2 interval, the same number the
-- Garden draws its growth stages from.
--
--   mastered, interval <  21 : 1   (Sprout / Seedling)
--   mastered, interval >= 21 : 2   (Growing / Tree)
--   mastered, interval >= 60 : 3   (Blossom)
--
-- The scale is deliberately shallow. At 25 units per cap, steeper
-- weights would let three plants reach the ceiling and everything past
-- that would stop meaning anything -- maturity would devalue itself.
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
begin
  if u is null then return 0; end if;

  select completed_topics, reviews into done, revs
    from public.progress where user_id = u;
  if not found then return 0; end if;

  -- unnest over text[]; the jsonb lookup is a separate operation.
  foreach t in array coalesce(done, array[]::text[])
  loop
    iv := coalesce((revs -> t ->> 'interval')::numeric, 1);
    total := total + case
      when iv >= 60 then 3
      when iv >= 21 then 2
      else 1
    end;
  end loop;

  return total;
end;
$$;

-- ---- Today's allowance ---------------------------------------------
create or replace function public.rep_allowance()
returns int
language sql
stable
security definer
set search_path = ''
as $$
  select least(5, public.garden_weight() / 5);
$$;

-- ---- What the UI needs to render the bar ---------------------------
-- One round trip instead of three. Also the honest answer to "why is my
-- allowance 0" -- weight is returned so the interface can say "keep
-- reviewing" rather than showing a bare zero.
create or replace function public.rep_status()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  u uuid := auth.uid();
  w int;
  allowed int;
  spent int;
begin
  if u is null then
    raise exception 'not authenticated' using errcode = '28000';
  end if;
  w := public.garden_weight();
  allowed := least(5, w / 5);
  select count(*) into spent from public.rep_grants
   where giver = u and created_at >= current_date;

  return jsonb_build_object(
    'garden_weight', w,
    'allowance', allowed,
    'spent_today', spent,
    'left_today', greatest(0, allowed - spent),
    -- Lifetime given and the two received figures. Straight from the
    -- journal, never stored: the season resets by itself because "this
    -- month" is a where-clause, not an event.
    'given_total',    (select count(*) from public.rep_grants where giver = u),
    'received_month', (select count(*) from public.rep_grants
                        where receiver = u and created_at >= date_trunc('month', now())),
    'received_total', (select count(*) from public.rep_grants where receiver = u)
  );
end;
$$;

-- ---- The grant -----------------------------------------------------
create or replace function public.grant_reputation(post_id uuid)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  u uuid := auth.uid();
  author_id uuid;
  is_hidden bool;
  allowed int;
  spent int;
  to_author int;
  new_score int;
begin
  if u is null then
    raise exception 'not authenticated' using errcode = '28000';
  end if;

  select author, hidden into author_id, is_hidden
    from public.posts where id = post_id;
  if not found then
    raise exception 'no such post' using errcode = 'P0002';
  end if;
  if is_hidden then
    raise exception 'post is hidden' using errcode = 'P0001';
  end if;

  -- Never yourself. The check constraint on rep_grants enforces this
  -- regardless; this exists so the caller gets a sentence instead of a
  -- constraint violation.
  if author_id = u then
    raise exception 'cannot grant to yourself' using errcode = 'P0001';
  end if;

  -- One point per post. Same arrangement: unique(giver, post) is the
  -- real rule, this is the readable error.
  if exists (select 1 from public.rep_grants where giver = u and post = post_id) then
    return jsonb_build_object('status', 'already_granted', 'spent', 0);
  end if;

  -- Ten to any one author per month. THIS is what makes collusion
  -- pointless rather than policed: two friends trading can move 10 a
  -- month between them instead of ~150.
  select count(*) into to_author from public.rep_grants
   where giver = u and receiver = author_id
     and created_at >= date_trunc('month', now());
  if to_author >= 10 then
    raise exception 'monthly limit for this author reached' using errcode = 'P0001';
  end if;

  -- The daily allowance.
  allowed := least(5, public.garden_weight() / 5);
  select count(*) into spent from public.rep_grants
   where giver = u and created_at >= current_date;
  if spent >= allowed then
    raise exception 'daily allowance spent' using errcode = 'P0001';
  end if;

  insert into public.rep_grants (giver, receiver, post)
  values (u, author_id, post_id);

  update public.posts set score = score + 1
   where id = post_id
   returning score into new_score;

  return jsonb_build_object(
    'status', 'granted',
    'score', new_score,
    'left_today', greatest(0, allowed - spent - 1));
end;
$$;

-- ---- Permissions ---------------------------------------------------
-- garden_weight stays internal: it is a helper the two public functions
-- call, and both of them run SECURITY DEFINER so the internal call is
-- made as the owner. Unlike is_admin() in 0008, no RLS policy calls it,
-- so revoking it breaks nothing -- that distinction is exactly what 0009
-- was about.
revoke execute on function public.garden_weight()          from public, anon, authenticated;
revoke execute on function public.rep_allowance()          from public, anon;
revoke execute on function public.rep_status()             from public, anon;
revoke execute on function public.grant_reputation(uuid)   from public, anon;

grant execute on function public.rep_allowance()        to authenticated;
grant execute on function public.rep_status()           to authenticated;
grant execute on function public.grant_reputation(uuid) to authenticated;
