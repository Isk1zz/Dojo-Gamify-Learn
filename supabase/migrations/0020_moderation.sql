-- ================================================
-- Knell - 0020: moderation, and a unique key that was not unique
-- ------------------------------------------------
--
-- ---- The bug found first ----
-- 0008 wrote:
--
--     unique (reporter, post, reply)
--     -- [0008, in Russian] One person reports one target once.
--
-- It does not do that. A post-report leaves `reply` NULL, and Postgres
-- treats NULLs as DISTINCT in a unique index unless it is declared
-- NULLS NOT DISTINCT. Confirmed by asking the catalogue rather than by
-- reasoning about it: reports_reporter_post_reply_key came back with
-- indnullsnotdistinct = false.
--
-- So one person could report one post any number of times.
--
-- That is not a cosmetic gap. 0.3 chose a human queue over auto-hiding
-- precisely so a small group cannot silence somebody by agreeing with
-- each other -- and this let ONE person bury the queue alone, which is
-- the same attack with fewer participants.
--
-- Fixed with two PARTIAL unique indexes, one per target kind. Each
-- covers only rows where its column is present, so no NULL is ever part
-- of a key and the question does not arise.
--
-- ---- What moderation does ----
-- Report -> queue -> an admin decides. No auto-hiding at N reports, by
-- the decision in 0.3: on a small forum N people collude trivially, and
-- an automatic threshold becomes a weapon. Manual is slower, and slow is
-- the right price for "cannot be shouted down" while the numbers are
-- small. Revisit with data, not with a guess.
--
-- Visibility is only ever changed by an admin, and `hidden` is written
-- by these functions alone -- there is still no write policy on posts
-- or replies for anybody.
-- ================================================

-- ---- The uniqueness fix ---------------------------------------------
alter table public.reports
  drop constraint if exists reports_reporter_post_reply_key;

create unique index if not exists reports_one_per_post
  on public.reports (reporter, post) where post is not null;

create unique index if not exists reports_one_per_reply
  on public.reports (reporter, reply) where reply is not null;

-- ---- Reporting -------------------------------------------------------
-- Exactly one target, checked here as well as by the table constraint so
-- the caller gets a sentence rather than a constraint name.
create or replace function public.report_content(
  post_id uuid default null,
  reply_id uuid default null,
  reason text default ''
)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  u uuid := public.require_uid();
  why text := btrim(coalesce(reason, ''));
begin
  if (post_id is null) = (reply_id is null) then
    raise exception 'report exactly one of a post or a reply' using errcode = 'P0001';
  end if;
  if length(why) < 1 then
    raise exception 'a report needs a reason' using errcode = 'P0001';
  end if;
  if length(why) > 500 then
    raise exception 'a reason cannot be longer than 500 characters' using errcode = 'P0001';
  end if;

  if post_id is not null and not exists (select 1 from public.posts where id = post_id) then
    raise exception 'no such post' using errcode = 'P0002';
  end if;
  if reply_id is not null and not exists (select 1 from public.replies where id = reply_id) then
    raise exception 'no such reply' using errcode = 'P0002';
  end if;

  -- Needs no advisory lock: the partial unique indexes above decide,
  -- and ON CONFLICT means a repeat inserts nothing instead of racing.
  insert into public.reports (reporter, post, reply, reason)
  values (u, post_id, reply_id, why)
  on conflict do nothing;

  if not found then
    return jsonb_build_object('status', 'already_reported');
  end if;
  return jsonb_build_object('status', 'reported');
end;
$$;

-- ---- The queue, for admins only --------------------------------------
-- Returns what the target actually says, so an admin can judge without
-- a second round trip per row. Ordered oldest-first: a queue that shows
-- the newest first quietly abandons the bottom of itself.
create or replace function public.admin_report_queue(include_resolved bool default false)
returns table (
  id uuid, kind text, target uuid, reason text, created_at timestamptz,
  resolved bool, body text, hidden bool, author_name text
)
language sql
stable
security definer
set search_path = ''
as $$
  select r.id,
         case when r.post is not null then 'post' else 'reply' end,
         coalesce(r.post, r.reply),
         r.reason, r.created_at, r.resolved,
         coalesce(p.body, rp.body),
         coalesce(p.hidden, rp.hidden),
         pr.name
    from public.reports r
    left join public.posts   p  on p.id  = r.post
    left join public.replies rp on rp.id = r.reply
    left join public.profiles pr on pr.id = coalesce(p.author, rp.author)
   where public.is_admin()
     and (include_resolved or not r.resolved)
   order by r.created_at asc
$$;

-- ---- Hiding and unhiding ---------------------------------------------
-- One function for both kinds and both directions. Unhiding matters as
-- much as hiding: a moderation tool that can only remove is a tool
-- nobody can be wrong with.
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
    update public.posts set hidden = hide where id = target;
  else
    update public.replies set hidden = hide where id = target;
  end if;
  get diagnostics n = row_count;

  if n = 0 then
    raise exception 'no such %', kind using errcode = 'P0002';
  end if;
  return jsonb_build_object('status', case when hide then 'hidden' else 'visible' end);
end;
$$;

-- Marks a report dealt with. Separate from hiding on purpose: "I looked
-- at this and it is fine" is a real outcome, and a queue where the only
-- way to clear an item is to act on it teaches admins to act.
create or replace function public.admin_resolve_report(report_id uuid, done bool default true)
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
  update public.reports set resolved = done where id = report_id;
  get diagnostics n = row_count;
  if n = 0 then
    raise exception 'no such report' using errcode = 'P0002';
  end if;
  return jsonb_build_object('status', case when done then 'resolved' else 'reopened' end);
end;
$$;

-- How many are waiting, for a badge on the admin screen. Callable by
-- anyone signed in, and returns 0 for anyone who is not an admin --
-- which reveals nothing, because a non-admin has no queue.
create or replace function public.admin_report_count()
returns int
language sql
stable
security definer
set search_path = ''
as $$
  select case when public.is_admin()
    then (select count(*)::int from public.reports where not resolved)
    else 0 end
$$;

revoke all    on function public.report_content(uuid, uuid, text)  from public, anon;
grant  execute on function public.report_content(uuid, uuid, text) to authenticated;
revoke all    on function public.admin_report_queue(bool)          from public, anon;
grant  execute on function public.admin_report_queue(bool)         to authenticated;
revoke all    on function public.admin_set_hidden(text, uuid, bool) from public, anon;
grant  execute on function public.admin_set_hidden(text, uuid, bool) to authenticated;
revoke all    on function public.admin_resolve_report(uuid, bool)  from public, anon;
grant  execute on function public.admin_resolve_report(uuid, bool) to authenticated;
revoke all    on function public.admin_report_count()              from public, anon;
grant  execute on function public.admin_report_count()             to authenticated;
