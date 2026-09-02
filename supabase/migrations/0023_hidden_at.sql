-- ================================================
-- Knell - 0023: hiding gets a timestamp
-- ------------------------------------------------
-- 0022 built the bell on one idea: everything worth telling somebody
-- about already exists as a row, so the only new state is a mark saying
-- when they last looked. Two of the three things it reports have their
-- own timestamps -- a reply has created_at, a grant has created_at.
--
-- Hiding did not. `hidden` is a boolean, and the notification was dated
-- by the newest report on the post, falling back to the post's own
-- creation time. 0022's header called that approximate and said adding
-- hidden_at was "the honest fix, left for when it matters".
--
-- It mattered immediately. Tested rather than assumed: hiding a post
-- created yesterday produced NO notification, because the fallback date
-- was older than the bell mark. That is not an edge case -- it is every
-- post older than the reader's last visit, which is nearly all of them.
--
-- A bell that silently fails to report one of the three things it exists
-- for is worse than one that reports two: the silence looks like "you
-- have nothing waiting".
--
-- So: a real timestamp, written by the only function that can hide
-- anything. Cleared on unhiding, so a post hidden and then restored does
-- not keep announcing itself.
-- ================================================

alter table public.posts   add column if not exists hidden_at timestamptz;
alter table public.replies add column if not exists hidden_at timestamptz;

-- Backfill: anything already hidden gets the moment of this migration
-- rather than null. Null would mean "hidden but never dated", which the
-- notification query would then have to guess about -- exactly the
-- guessing this column removes.
update public.posts   set hidden_at = now() where hidden and hidden_at is null;
update public.replies set hidden_at = now() where hidden and hidden_at is null;

create or replace function public.admin_set_hidden(
  kind text, target uuid, hide bool
)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare n int;
begin
  if not public.is_admin() then
    raise exception 'admin only' using errcode = '42501';
  end if;
  if kind not in ('post', 'reply') then
    raise exception 'kind must be post or reply' using errcode = 'P0001';
  end if;

  if kind = 'post' then
    update public.posts
       set hidden = hide,
           hidden_at = case when hide then now() else null end
     where id = target;
  else
    update public.replies
       set hidden = hide,
           hidden_at = case when hide then now() else null end
     where id = target;
  end if;
  get diagnostics n = row_count;

  if n = 0 then
    raise exception 'no such %', kind using errcode = 'P0002';
  end if;
  return jsonb_build_object('status', case when hide then 'hidden' else 'visible' end);
end;
$$;

-- ---- The bell, now dating hiding properly ---------------------------
create or replace function public.notifications(limit_n int default 20)
returns table (
  kind text, at timestamptz, post_id uuid,
  excerpt text, detail text, who text, score int
)
language sql
stable
security definer
set search_path = ''
as $$
  with me as (select auth.uid() as uid),
  seen as (select bell_seen_at from public.profiles, me where id = me.uid)

  select 'reply', r.created_at, p.id,
         left(p.body, 80), left(r.body, 120), pr.name, p.score
    from public.replies r
    join public.posts p on p.id = r.post
    join me on p.author = me.uid
    left join public.profiles pr on pr.id = r.author
   where r.author <> me.uid and not r.hidden
     and r.created_at > (select bell_seen_at from seen)

  union all

  -- Who gave the point is deliberately null. The privacy policy says the
  -- giver is not displayed, and a bell that named them would make that
  -- sentence false.
  select 'point', g.created_at, p.id,
         left(p.body, 80), null, null, p.score
    from public.rep_grants g
    join public.posts p on p.id = g.post
    join me on g.receiver = me.uid
   where g.created_at > (select bell_seen_at from seen)

  union all

  -- Now dated by when it was actually hidden. No group-by and no
  -- fallback to the post's own age, which is what made this branch
  -- silent for anything written before the reader's last visit.
  select 'hidden', p.hidden_at, p.id,
         left(p.body, 80), null, null, p.score
    from public.posts p
    join me on p.author = me.uid
   where p.hidden and p.hidden_at is not null
     and p.hidden_at > (select bell_seen_at from seen)

  order by 2 desc
  limit greatest(1, least(coalesce(limit_n, 20), 50))
$$;

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
      where p.hidden and p.hidden_at is not null
        and p.hidden_at > (select bell_seen_at from seen))
  )::int
$$;

revoke all    on function public.admin_set_hidden(text, uuid, bool) from public, anon;
grant  execute on function public.admin_set_hidden(text, uuid, bool) to authenticated;
revoke all    on function public.notifications(int)   from public, anon;
grant  execute on function public.notifications(int)  to authenticated;
revoke all    on function public.notification_count() from public, anon;
grant  execute on function public.notification_count() to authenticated;
