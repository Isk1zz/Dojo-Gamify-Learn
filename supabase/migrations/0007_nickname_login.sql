-- ================================================
-- Knell — 0007: sign in with nickname as well as email
-- ------------------------------------------------
-- Supabase Auth signs in by EMAIL only. To accept a nickname the client
-- must first resolve nickname -> email, and that lookup necessarily runs
-- BEFORE anyone is signed in, so it has to be callable by `anon`.
--
-- ---- The cost, stated plainly ----
-- This is an email-disclosure surface, accepted deliberately after the
-- trade was put and chosen. Anyone can submit a nickname and learn the
-- address behind it. Nicknames are semi-public by design (they appear on
-- Forum posts), email addresses are not, so this links one to the other.
--
-- It is NOT a password oracle, and that distinction is the whole reason
-- this shape was picked over the "verify the password too" version. That
-- alternative looks safer -- return the email only on a correct password
-- -- but it would be a password-testing endpoint that bypasses GoTrue's
-- login rate limits entirely, turning an enumeration leak into a
-- brute-force facility. Strictly worse.
--
-- ---- What limits the damage ----
--   * Exact, case-insensitive match only. No LIKE, no prefix search, no
--     listing: you must already know the nickname to learn its email.
--   * Returns NULL for "no such nickname" -- same shape as a miss, so it
--     cannot be used to confirm a nickname exists without also getting
--     the answer.
--   * STABLE and single-row: no way to batch-harvest.
--   * Supabase's platform rate limits still apply per IP.
--
-- If this ever needs closing, the fix is not to patch this function --
-- it is to stop offering nickname login.
-- ================================================

-- ---- Nicknames must be unique, case-insensitively --------------------
-- Without this the lookup is ambiguous and "log in as Bob" is
-- meaningless. Existing duplicates are suffixed rather than rejected, so
-- the migration cannot fail on live data.
do $$
declare
  r record;
  n int;
begin
  for r in
    select id, name,
           row_number() over (partition by lower(name) order by created_at) as rn
      from public.profiles
     where name is not null
  loop
    if r.rn > 1 then
      update public.profiles
         set name = r.name || '-' || r.rn::text
       where id = r.id;
    end if;
  end loop;
end $$;

create unique index if not exists profiles_name_lower_key
  on public.profiles (lower(name));

-- ---- The lookup ------------------------------------------------------
create or replace function public.email_for_nickname(nickname text)
returns text
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  v_email text;
begin
  if nickname is null or length(trim(nickname)) = 0 then
    return null;
  end if;

  select u.email into v_email
    from public.profiles p
    join auth.users u on u.id = p.id
   where lower(p.name) = lower(trim(nickname))
   limit 1;

  return v_email;   -- NULL when there is no such nickname
end;
$$;

-- Callable by anon BY NECESSITY: it runs before sign-in, when the caller
-- has no session. That is the entire reason it is an exposure.
revoke all on function public.email_for_nickname(text) from public;
grant execute on function public.email_for_nickname(text) to anon, authenticated;

comment on function public.email_for_nickname(text) is
  'Resolves a nickname to its account email so the client can sign in with either. Deliberately callable by anon -- it must run before authentication. This is a known, accepted email-disclosure surface: exact match only, single row, NULL on miss. It is NOT a password oracle.';

-- ---- Availability check for sign-up ----------------------------------
-- Lets the sign-up form reject a taken nickname before submitting,
-- rather than surfacing a raw unique-violation. Returns only a boolean,
-- so it discloses strictly less than the lookup above already does.
create or replace function public.nickname_available(nickname text)
returns boolean
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if nickname is null or length(trim(nickname)) = 0 then
    return false;
  end if;
  return not exists (
    select 1 from public.profiles where lower(name) = lower(trim(nickname))
  );
end;
$$;

revoke all on function public.nickname_available(text) from public;
grant execute on function public.nickname_available(text) to anon, authenticated;
