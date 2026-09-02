-- ================================================
-- Knell - 0021: a ban closes the door, not the archive
-- ------------------------------------------------
-- DECIDED 2026-09-02, closing the question 0.2 left open.
--
-- ---- A ban ends participation, not the record ----
-- A banned person's posts STAY. Threads reply to them, and reputation
-- other people spent on them was spent on something. Hiding the posts
-- would break both: the replies become answers to nothing, and the
-- points become spent on nothing.
--
-- What changes is that the post is labelled. A reader who does not know
-- the author is banned will write a reply and wait for an answer that
-- cannot come.
--
-- ---- Hiding stays a separate, human decision ----
-- Reports raise a post in the queue. They never hide it. 0.3's
-- reasoning is unchanged: on a small forum N people collude trivially,
-- and an automatic threshold is a weapon rather than a safeguard.
--
-- Raising is not silencing, which is why THIS threshold is safe where
-- an auto-hide threshold would not be. Three people acting together can
-- move something to the top of an admin's list. They cannot remove it,
-- and the admin still reads it.
--
-- ---- Why the queue has two bands rather than one sort ----
-- The queue was ordered oldest-first on the reasoning that a
-- newest-first queue quietly abandons its own bottom. Sorting by report
-- count instead would reintroduce exactly that: a one-report item from
-- last week would sit under every noisy new one forever.
--
-- So: two bands, urgent (3+ reports) and ordinary, each oldest-first,
-- both on one screen. Loud things are seen at once and nothing at the
-- bottom is forgotten.
-- ================================================

-- ---- public_profiles gains the ban flag ------------------------------
-- Dropped first: the return type changes, and CREATE OR REPLACE cannot
-- change a function's output columns.
--
-- Publishing "this account is banned" is a moderation state attached to
-- content that stays visible, and it is the label that makes leaving
-- the content honest. It says nothing about why, and nothing about the
-- person beyond their standing to reply.
drop function if exists public.public_profiles(uuid[]);

create or replace function public.public_profiles(ids uuid[])
returns table (id uuid, name text, avatar text, pinned_badges text[], banned bool)
language sql
stable
security definer
set search_path = ''
as $$
  select p.id, p.name, p.avatar, p.pinned_badges,
         coalesce(e.is_banned, false)
    from public.profiles p
    left join public.economy e on e.user_id = p.id
   where p.id = any(ids)
$$;

revoke all    on function public.public_profiles(uuid[]) from public, anon;
grant  execute on function public.public_profiles(uuid[]) to authenticated;

-- ---- The queue, banded -----------------------------------------------
-- `reports` counts how many people flagged this same target, which is
-- what decides the band. The row is still one report; the count is
-- context for judging it.
-- Dropped first for the same reason as public_profiles above: the
-- return type gains author_banned, reports and urgent, and CREATE OR
-- REPLACE cannot change a function's output columns. Missing this on
-- the first run is what 42P13 says.
drop function if exists public.admin_report_queue(bool);

create or replace function public.admin_report_queue(include_resolved bool default false)
returns table (
  id uuid, kind text, target uuid, reason text, created_at timestamptz,
  resolved bool, body text, hidden bool, author_name text,
  author_banned bool, reports int, urgent bool
)
language sql
stable
security definer
set search_path = ''
as $$
  with counted as (
    select coalesce(r.post, r.reply) as tgt, count(*)::int as n
      from public.reports r
     where not r.resolved
     group by 1
  )
  select r.id,
         case when r.post is not null then 'post' else 'reply' end,
         coalesce(r.post, r.reply),
         r.reason, r.created_at, r.resolved,
         coalesce(p.body, rp.body),
         coalesce(p.hidden, rp.hidden),
         pr.name,
         coalesce(e.is_banned, false),
         coalesce(c.n, 1),
         coalesce(c.n, 1) >= 3
    from public.reports r
    left join public.posts    p  on p.id  = r.post
    left join public.replies  rp on rp.id = r.reply
    left join public.profiles pr on pr.id = coalesce(p.author, rp.author)
    left join public.economy  e  on e.user_id = coalesce(p.author, rp.author)
    left join counted c on c.tgt = coalesce(r.post, r.reply)
   where public.is_admin()
     and (include_resolved or not r.resolved)
   -- Urgent first, then oldest-first WITHIN each band. Not a single
   -- sort by count: that would bury a lone old report under every noisy
   -- new one, which is the failure oldest-first exists to prevent.
   order by (coalesce(c.n, 1) >= 3) desc, r.created_at asc
$$;

revoke all    on function public.admin_report_queue(bool)  from public, anon;
grant  execute on function public.admin_report_queue(bool) to authenticated;
