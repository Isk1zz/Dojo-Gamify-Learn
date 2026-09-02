-- ================================================
-- Knell - 0019: views, counted once and only when read
-- ------------------------------------------------
-- A view should mean somebody READ the post, not that it went past on
-- the way to something else. Two rules do that:
--
--   1. The client only reports a post after it has been ON SCREEN for a
--      dwell threshold of 5 SECONDS. Scrolling past takes a fraction of
--      that, so it does not qualify.
--
--      5 and not 10: a short post is honestly read in four seconds, and
--      a ten-second floor would start discarding real reads rather than
--      scrolls. 5 clears scrolling by an order of magnitude, which is
--      the only thing the threshold has to do.
--   2. The server records it ONCE per person per post, ever.
--
-- ---- Why client-measured time is acceptable here ----
-- It normally is not: the whole earning system exists because a number
-- the client chooses is a number the client can inflate. The difference
-- is the unique constraint. The most a lie can win is ONE view on ONE
-- post -- exactly the view an honest slow reader was going to produce
-- anyway. There is no loop to run, so there is nothing to defend.
--
-- Compare grant_reputation, where the same trust would have been
-- unacceptable: a point given is a point somebody else RECEIVES, and it
-- moves a ranking.
--
-- ---- Why a table and not a bare counter ----
-- Same split as rep_grants and posts.score: the table is the record,
-- posts.views is a cache so a feed does not COUNT(*) per row. The
-- unique key IS the once-per-person rule -- it cannot be forgotten by a
-- later function the way a check in code can.
--
-- ---- Your own post does not count ----
-- Otherwise a view counter measures how often the author reloaded.
-- ================================================

alter table public.posts
  add column if not exists views int not null default 0 check (views >= 0);

create table if not exists public.post_views (
  post       uuid not null references public.posts(id) on delete cascade,
  viewer     uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (post, viewer)
);

alter table public.post_views enable row level security;

-- Readable for your own rows, so the client can avoid re-reporting what
-- it already knows landed. No insert/update/delete policy at all: the
-- RPC below is the only way a row appears.
drop policy if exists post_views_read_own on public.post_views;
create policy post_views_read_own on public.post_views
  for select to authenticated using (viewer = auth.uid());

-- Records a view. Returns quietly on every refusal, because none of
-- them are worth telling a reader about: they are all "this was already
-- counted" in one form or another.
create or replace function public.mark_viewed(post_id uuid)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  u uuid := public.require_uid();
  author_id uuid;
  is_hidden bool;
  n int;
begin
  select author, hidden into author_id, is_hidden
    from public.posts where id = post_id;
  if not found then
    return jsonb_build_object('status', 'no_such_post');
  end if;
  if is_hidden then
    return jsonb_build_object('status', 'hidden');
  end if;
  if author_id = u then
    return jsonb_build_object('status', 'own_post');
  end if;

  -- ON CONFLICT rather than a check-then-insert, so this needs no
  -- advisory lock: the unique key does the work, and a second call
  -- inserts nothing rather than racing. That is the shape
  -- grant_reputation could not use, because it has counting to do
  -- between the check and the write.
  insert into public.post_views (post, viewer) values (post_id, u)
  on conflict (post, viewer) do nothing;

  if not found then
    return jsonb_build_object('status', 'already_viewed');
  end if;

  update public.posts set views = views + 1
   where id = post_id
   returning views into n;

  return jsonb_build_object('status', 'counted', 'views', n);
end;
$$;

revoke all    on function public.mark_viewed(uuid)  from public, anon;
grant  execute on function public.mark_viewed(uuid) to authenticated;
