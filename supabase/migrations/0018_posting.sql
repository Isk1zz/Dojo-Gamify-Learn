-- ================================================
-- Knell - 0018: publishing, and what stops a flood
-- ------------------------------------------------
-- Posts and replies get RPCs rather than an INSERT policy, for the
-- reason 0008 left every write table without one: the server sets
-- author = auth.uid(), so nothing can be published under someone else's
-- name. A policy of "insert where author = auth.uid()" would be nearly
-- as good and still leaves the client naming itself; this leaves it no
-- say at all.
--
-- ---- The daily caps, and why a budget and not an interval ----
-- 3 posts a day. 30 replies.
--
-- NOT one post every four hours. A fixed interval is a rhythm people
-- learn and set a reminder for, and it punishes the natural shape of
-- writing -- two thoughts in an evening, then quiet for a week. A daily
-- budget allows the burst and still bounds the day.
--
-- Replies are far freer than posts because they are a different act
-- with a different cost: a post takes a slot in everyone's feed, a
-- reply takes one in a single thread. A conversation dies if you may
-- answer three times a day.
--
-- ---- What the cap does NOT do ----
-- A per-account limit is worth exactly what an account costs. Email
-- confirmation is OFF as of writing (see UPDATESTACK.md's launch
-- blockers), so one person can hold a hundred accounts and three a day
-- becomes three hundred.
--
-- The cap is still right and still cheap. It is protection against
-- carelessness, not against intent, and it should not be described as
-- anti-spam until signing up costs something. Confirmation therefore
-- lands BEFORE the forum opens to the public, not after.
--
-- ---- The lock is here from the start, not added after ----
-- count-then-insert is the exact shape that raced in grant_reputation
-- and had to be fixed in 0011. Two concurrent calls both read "2 posts
-- today", both decide they are under 3, and both insert. The advisory
-- lock is written in now rather than discovered later.
-- ================================================

create or replace function public.daily_post_cap()
returns int language sql immutable set search_path = ''
as $$ select 3 $$;

create or replace function public.daily_reply_cap()
returns int language sql immutable set search_path = ''
as $$ select 30 $$;

-- ---- Publishing a post ----------------------------------------------
create or replace function public.create_post(body text)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  u     uuid := public.require_uid();
  txt   text := btrim(coalesce(body, ''));
  today int;
  cap   int := public.daily_post_cap();
  new_id uuid;
begin
  -- Serialise this author. Same read-decide-write shape as 0011.
  perform pg_advisory_xact_lock(hashtext('knell.post'), hashtext(u::text));

  -- Length is checked here as well as by the table's CHECK, so the
  -- caller gets a sentence instead of a constraint violation. The
  -- constraint is what actually enforces it.
  if length(txt) < 1 then
    raise exception 'a post cannot be empty' using errcode = 'P0001';
  end if;
  if length(txt) > 8000 then
    raise exception 'a post cannot be longer than 8000 characters' using errcode = 'P0001';
  end if;

  select count(*) into today from public.posts
   where author = u and created_at >= current_date;

  if today >= cap then
    return jsonb_build_object('status', 'daily_cap', 'cap', cap, 'today', today);
  end if;

  insert into public.posts (author, body) values (u, txt)
  returning id into new_id;

  return jsonb_build_object(
    'status', 'posted', 'id', new_id,
    'left_today', greatest(0, cap - today - 1));
end;
$$;

-- ---- Replying --------------------------------------------------------
create or replace function public.create_reply(post_id uuid, body text)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  u     uuid := public.require_uid();
  txt   text := btrim(coalesce(body, ''));
  today int;
  cap   int := public.daily_reply_cap();
  is_hidden bool;
  new_id uuid;
begin
  perform pg_advisory_xact_lock(hashtext('knell.reply'), hashtext(u::text));

  if length(txt) < 1 then
    raise exception 'a reply cannot be empty' using errcode = 'P0001';
  end if;
  if length(txt) > 4000 then
    raise exception 'a reply cannot be longer than 4000 characters' using errcode = 'P0001';
  end if;

  -- A hidden post is closed to new replies. Moderation that leaves the
  -- conversation running underneath it would not be moderation.
  select hidden into is_hidden from public.posts where id = post_id;
  if not found then
    raise exception 'no such post' using errcode = 'P0002';
  end if;
  if is_hidden then
    raise exception 'that post is hidden' using errcode = 'P0001';
  end if;

  select count(*) into today from public.replies
   where author = u and created_at >= current_date;

  if today >= cap then
    return jsonb_build_object('status', 'daily_cap', 'cap', cap, 'today', today);
  end if;

  insert into public.replies (post, author, body) values (post_id, u, txt)
  returning id into new_id;

  return jsonb_build_object(
    'status', 'replied', 'id', new_id,
    'left_today', greatest(0, cap - today - 1));
end;
$$;

-- ---- What is left to write today, for the compose box ----------------
-- Read by the UI so it can say the number before somebody types eight
-- thousand characters and then learns they had none left.
create or replace function public.write_status()
returns jsonb
language plpgsql
stable
security definer
set search_path = ''
as $$
declare
  u uuid := public.require_uid();
  p int; r int;
begin
  select count(*) into p from public.posts
   where author = u and created_at >= current_date;
  select count(*) into r from public.replies
   where author = u and created_at >= current_date;
  return jsonb_build_object(
    'post_cap',   public.daily_post_cap(),
    'posts_left', greatest(0, public.daily_post_cap()  - p),
    'reply_cap',  public.daily_reply_cap(),
    'replies_left', greatest(0, public.daily_reply_cap() - r));
end;
$$;

revoke all    on function public.create_post(text)         from public, anon;
grant  execute on function public.create_post(text)        to authenticated;
revoke all    on function public.create_reply(uuid, text)  from public, anon;
grant  execute on function public.create_reply(uuid, text) to authenticated;
revoke all    on function public.write_status()            from public, anon;
grant  execute on function public.write_status()           to authenticated;
revoke all    on function public.daily_post_cap()          from public, anon;
grant  execute on function public.daily_post_cap()         to authenticated;
revoke all    on function public.daily_reply_cap()         from public, anon;
grant  execute on function public.daily_reply_cap()        to authenticated;
