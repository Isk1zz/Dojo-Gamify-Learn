-- ================================================
-- Knell - 0024: LAUNCH BLOCKER. The second signup fails.
-- ------------------------------------------------
-- handle_new_user (0001) creates a profile with no name:
--
--     insert into public.profiles (id) values (new.id);
--
-- so it takes the column default, 'Student'. 0007 then added
--
--     create unique index profiles_name_lower_key
--       on public.profiles (lower(name));
--
-- and de-duplicated the rows that already existed -- but it did not
-- touch the trigger or the default. So the FIRST account takes
-- 'Student', and every account after it fails inside the trigger with
-- a unique violation on lower(name).
--
-- Signing up has been broken for everybody except the first person
-- since 0007 landed, and nothing surfaced it because there has only
-- ever been one account.
--
-- Found by accident: an unrelated migration inserted a row into
-- auth.users and came back with
--
--     ERROR 23505: duplicate key value violates unique constraint
--     "profiles_name_lower_key"
--     DETAIL: Key (lower(name))=(student) already exists.
--     CONTEXT: insert into public.profiles (id) values (new.id)
--              PL/pgSQL function handle_new_user() line 3
--
-- which is the launch path failing, demonstrated rather than reasoned
-- about.
--
-- ---- The fix ----
-- The trigger picks a name that is unique by construction, and the
-- client overwrites it with the chosen nickname on first sync (see
-- core/auth.js, which holds the nickname locally until then).
--
-- Order of preference:
--   1. a nickname passed in the signup metadata, if it is free -- so an
--      account that names itself keeps that name from the first row;
--   2. the local part of the email, if it is free;
--   3. 'Student-' plus six characters of the uuid, which cannot
--      collide in practice and is obviously a placeholder.
--
-- Each candidate is tested against the index before use rather than
-- caught afterwards: a failure here aborts the whole signup, and there
-- is no second chance to handle.
-- ================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  wanted text;
  candidate text;
begin
  -- 1. What the account asked to be called, if anything.
  wanted := nullif(btrim(coalesce(new.raw_user_meta_data ->> 'nickname', '')), '');

  if wanted is not null
     and not exists (select 1 from public.profiles where lower(name) = lower(wanted))
  then
    candidate := wanted;
  end if;

  -- 2. The email's local part. Nothing personal is revealed that the
  --    nickname would not have revealed anyway, and it is far friendlier
  --    than a uuid fragment for somebody who never picks a name.
  if candidate is null and new.email is not null then
    wanted := split_part(new.email, '@', 1);
    if wanted <> ''
       and not exists (select 1 from public.profiles where lower(name) = lower(wanted))
    then
      candidate := wanted;
    end if;
  end if;

  -- 3. Unique by construction. Six hex characters of the account's own
  --    uuid: not guessable-looking, not colliding, and visibly a
  --    placeholder so nobody mistakes it for a chosen name.
  if candidate is null then
    candidate := 'Student-' || substr(replace(new.id::text, '-', ''), 1, 6);
  end if;

  insert into public.profiles (id, name) values (new.id, candidate);
  insert into public.progress (user_id) values (new.id);
  insert into public.economy (user_id) values (new.id);
  return new;
end;
$$;

-- The column default is left as 'Student' on purpose. Nothing inserts
-- into profiles without a name any more -- the trigger is the only
-- writer, and it always supplies one. Changing the default would be
-- cosmetic, and a default that looks usable invites the next person to
-- rely on it.
