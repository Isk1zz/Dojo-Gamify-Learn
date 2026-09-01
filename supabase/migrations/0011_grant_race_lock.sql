-- ================================================
-- Knell - 0011: close the TOCTOU window in grant_reputation
-- ------------------------------------------------
-- 0010's allowance check is:
--
--     select count(*) into spent ...     -- read
--     if spent >= allowed then ...       -- decide
--     insert into rep_grants ...         -- write
--
-- Three separate steps. Two concurrent calls can both read spent = 1
-- against an allowance of 2, both decide they are within it, and both
-- insert -- spending 3 against a cap of 2.
--
-- This is NOT how buy_course works, and the difference is worth stating.
-- There the check and the debit are ONE statement:
--
--     update economy set tokens = tokens - price
--      where user_id = u and tokens >= price
--
-- The row lock does the serialising, so the ten-way concurrent purchase
-- test held honestly. A count-then-insert has no such row to lock:
-- rep_grants rows are INSERTED, and you cannot lock a row that does not
-- exist yet.
--
-- ---- Why this is being fixed despite the test passing ----
-- Three parallel fetches from a browser did produce exactly 2 grants.
-- That is not evidence: HTTP requests through PostgREST are unlikely to
-- land inside the same few microseconds, so the test never really
-- exercised the window. Treating that as proof would repeat the 0004
-- mistake, where an attack "failed" for entirely the wrong reason and
-- looked like security.
--
-- ---- The fix ----
-- A transaction-scoped advisory lock keyed on the GIVER. Every grant by
-- one person serialises; grants by different people do not contend at
-- all, so this costs nothing at any realistic concurrency. It releases
-- automatically when the function's transaction ends -- no unlock path
-- to forget, and no lock leak if the function raises.
--
-- Namespaced with a constant first argument so it cannot collide with
-- any other advisory lock this database might take later.
-- ================================================

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

  -- Serialise this caller's grants for the rest of the transaction.
  -- Taken BEFORE any counting, so the read-decide-write sequence below
  -- is atomic with respect to this user's other calls.
  perform pg_advisory_xact_lock(hashtext('knell.rep_grant'), hashtext(u::text));

  select author, hidden into author_id, is_hidden
    from public.posts where id = post_id;
  if not found then
    raise exception 'no such post' using errcode = 'P0002';
  end if;
  if is_hidden then
    raise exception 'post is hidden' using errcode = 'P0001';
  end if;

  -- Never yourself. The check constraint enforces it regardless; this
  -- exists so the caller gets a sentence rather than a constraint error.
  if author_id = u then
    raise exception 'cannot grant to yourself' using errcode = 'P0001';
  end if;

  -- One point per post. Likewise backed by unique(giver, post).
  if exists (select 1 from public.rep_grants where giver = u and post = post_id) then
    return jsonb_build_object('status', 'already_granted', 'spent', 0);
  end if;

  -- Ten to any one author per month: what makes collusion pointless
  -- rather than policed.
  select count(*) into to_author from public.rep_grants
   where giver = u and receiver = author_id
     and created_at >= date_trunc('month', now());
  if to_author >= 10 then
    raise exception 'monthly limit for this author reached' using errcode = 'P0001';
  end if;

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

revoke execute on function public.grant_reputation(uuid) from public, anon;
grant  execute on function public.grant_reputation(uuid) to authenticated;
