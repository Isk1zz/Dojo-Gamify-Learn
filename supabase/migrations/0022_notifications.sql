-- ================================================
-- Knell - 0022: the bell
-- ------------------------------------------------
-- Three things a person is told about, decided 2026-09-02:
--
--   1. somebody replied to your post
--   2. your post was given a reputation point
--   3. a moderator hid your post
--
-- Deliberately NOT the admin report queue. It has its own place on the
-- admin screen, and mixing "your work was noticed" with "there is
-- moderation waiting" in one bell makes both easier to ignore.
--
-- ---- There is no notifications table ----
-- Every one of those three already exists as a row somewhere: replies
-- in `replies`, points in `rep_grants`, hiding as `posts.hidden`. A
-- notifications table would be a fourth copy of facts the database
-- already holds, kept in step by triggers, and drifting the first time
-- one of them was forgotten.
--
-- So the only new state is ONE TIMESTAMP per person: when they last
-- looked. Everything newer than that mark is unread. That is the whole
-- design.
--
-- Two consequences worth stating, because they are trades and not
-- oversights:
--
--   * Hiding has no timestamp of its own -- `posts.hidden` is a flag.
--     A hidden post is therefore reported as news whenever it is
--     hidden, using the post's own updated_at... which posts do not
--     have. So hiding is dated by the moderation report that led to it
--     where one exists, and otherwise shows without a time. Adding
--     hidden_at is the honest fix and is left for when it matters.
--
--   * Marking read is a single point in time, so it cannot mark ONE
--     item read. That is a feature at this size: a bell you clear in
--     one press is a bell people actually clear.
-- ================================================

alter table public.profiles
  add column if not exists bell_seen_at timestamptz not null default now();

-- ---- What is waiting -------------------------------------------------
-- Returns the newest first, capped. The cap is why the count is
-- separate: past it the UI says "and N more" rather than growing
-- without limit, which is what was asked for.
create or replace function public.notifications(limit_n int default 20)
returns table (
  kind text,          -- 'reply' | 'point' | 'hidden'
  at timestamptz,
  post_id uuid,
  excerpt text,       -- the post of yours it concerns
  detail text,        -- the reply's text, or null
  who text,           -- who replied; NEVER who gave a point
  score int
)
language sql
stable
security definer
set search_path = ''
as $$
  with me as (select auth.uid() as uid),
  seen as (select bell_seen_at from public.profiles, me where id = me.uid)

  -- 1. Replies to your posts, by anybody but you.
  select 'reply', r.created_at, p.id,
         left(p.body, 80), left(r.body, 120), pr.name, p.score
    from public.replies r
    join public.posts p on p.id = r.post
    join me on p.author = me.uid
    left join public.profiles pr on pr.id = r.author
   where r.author <> me.uid and not r.hidden
     and r.created_at > (select bell_seen_at from seen)

  union all

  -- 2. Points given to your posts. WHO gave it is deliberately null:
  --    the privacy policy says the giver is not displayed, and a bell
  --    that named them would make that false.
  select 'point', g.created_at, p.id,
         left(p.body, 80), null, null, p.score
    from public.rep_grants g
    join public.posts p on p.id = g.post
    join me on g.receiver = me.uid
   where g.created_at > (select bell_seen_at from seen)

  union all

  -- 3. Your posts a moderator hid. Dated by the report that led to it
  --    when there is one -- see the header on why this is approximate.
  select 'hidden', coalesce(max(rep.created_at), p.created_at), p.id,
         left(p.body, 80), null, null, p.score
    from public.posts p
    join me on p.author = me.uid
    left join public.reports rep on rep.post = p.id
   where p.hidden
   group by p.id, p.body, p.created_at, p.score
  having coalesce(max(rep.created_at), p.created_at) > (select bell_seen_at from seen)

  order by 2 desc
  limit greatest(1, least(coalesce(limit_n, 20), 50))
$$;

-- ---- How many, for the badge ----------------------------------------
-- Counts the same three things without the bodies, so the lobby can
-- paint a number without pulling text it will not show.
create or replace function public.notification_count()
returns int
language sql
stable
security definer
set search_path = ''
as $$
  with me as (select auth.uid() as uid),
  seen as (select bell_seen_at from public.profiles, me where id = me.uid)
  select (
    (select count(*) from public.replies r
       join public.posts p on p.id = r.post
       join me on p.author = me.uid
      where r.author <> me.uid and not r.hidden
        and r.created_at > (select bell_seen_at from seen))
  + (select count(*) from public.rep_grants g
       join public.posts p on p.id = g.post
       join me on g.receiver = me.uid
      where g.created_at > (select bell_seen_at from seen))
  + (select count(*) from public.posts p
       join me on p.author = me.uid
      where p.hidden
        and coalesce((select max(created_at) from public.reports where post = p.id),
                     p.created_at) > (select bell_seen_at from seen))
  )::int
$$;

-- ---- Clearing it -----------------------------------------------------
-- One mark, not per item. See the header.
create or replace function public.mark_bell_seen()
returns timestamptz
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare u uuid := public.require_uid(); t timestamptz := now();
begin
  update public.profiles set bell_seen_at = t where id = u;
  return t;
end;
$$;

revoke all    on function public.notifications(int)   from public, anon;
grant  execute on function public.notifications(int)  to authenticated;
revoke all    on function public.notification_count() from public, anon;
grant  execute on function public.notification_count() to authenticated;
revoke all    on function public.mark_bell_seen()     from public, anon;
grant  execute on function public.mark_bell_seen()    to authenticated;
