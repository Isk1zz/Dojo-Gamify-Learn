-- ================================================
-- Knell - 0024: deleting an account anonymises, it does not erase others
-- ------------------------------------------------
-- DECIDED 2026-09-02, closing the deletion half of step 7.
--
-- ---- What was wrong ----
-- delete_account deleted the auth.users row and let everything cascade.
-- posts, replies, rep_grants and reports all carry
-- `references auth.users(id) on delete cascade`, so all of it went.
--
-- Three consequences, in increasing order of how quietly they broke
-- things:
--
--   1. Posts vanished, so replies underneath them answered nothing.
--      This is the one the plan already knew about.
--
--   2. Somebody ELSE'S standing dropped. received_total is counted from
--      rep_grants, and a giver's rows went with their account -- so
--      leaving the app silently took points off the people you had
--      praised. They did nothing, and their number fell.
--
--   3. posts.score and the rep_grants journal diverged PERMANENTLY.
--      score is a cache incremented by +1 per grant; nothing decrements
--      it, and there is no trigger (checked: zero triggers on either
--      table). After one deletion the cache is high forever and nobody
--      would ever notice.
--
-- All three are the same mistake: erasing one person's account erased
-- other people's context along with it.
--
-- ---- What replaces it ----
-- The account, the email, the nickname, the country, the progress and
-- the economy are all destroyed. That is the erasure, and it is total.
--
-- The posts stay, with no author. This is what Reddit, StackOverflow
-- and Discourse do, and the reasoning is the same: the personal data is
-- the account, not the sentence somebody wrote in a conversation other
-- people are still having.
--
-- ---- How, given the schema says ON DELETE CASCADE ----
-- By re-pointing the rows BEFORE the auth row goes. A single shared
-- "deleted author" placeholder in auth.users owns them afterwards. It
-- is a real row with no email, no password and no way to sign in --
-- created here, once, and never again.
--
-- The alternative was making author nullable and dropping the cascade,
-- which is a bigger schema change and leaves every query having to cope
-- with a null author forever.
-- ================================================

-- ---- The placeholder -------------------------------------------------
-- A fixed uuid, so this is idempotent and so the client can recognise
-- it without a lookup. Instance token columns are '' rather than NULL:
-- GoTrue scans them into Go strings and a NULL there produces "Database
-- error querying schema" on every subsequent auth call -- learned the
-- hard way when accounts were first created by hand.
insert into auth.users (
  instance_id, id, aud, role, email,
  encrypted_password, email_confirmed_at,
  raw_app_meta_data, raw_user_meta_data,
  created_at, updated_at,
  confirmation_token, recovery_token,
  email_change_token_new, email_change
)
values (
  '00000000-0000-0000-0000-000000000000',
  '00000000-0000-0000-0000-0000000de1ed',   -- "deleted"
  'authenticated', 'authenticated', null,
  null, now(),
  '{"provider":"none","providers":[]}'::jsonb, '{}'::jsonb,
  now(), now(),
  '', '', '', ''
)
on conflict (id) do nothing;

-- A profile row so the feed can render a name for it. public_profiles
-- reads profiles, and an author with no row renders as "Someone" --
-- correct, but less clear than saying it outright.
insert into public.profiles (id, name, avatar)
values ('00000000-0000-0000-0000-0000000de1ed', 'Deleted account', null)
on conflict (id) do update set name = excluded.name;

create or replace function public.deleted_author()
returns uuid language sql immutable set search_path = ''
as $$ select '00000000-0000-0000-0000-0000000de1ed'::uuid $$;

-- ---- Deletion ---------------------------------------------------------
create or replace function public.delete_account()
returns void
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  u uuid := public.require_uid();
  ghost uuid := public.deleted_author();
begin
  if u = ghost then
    raise exception 'not a real account' using errcode = 'P0001';
  end if;

  -- Content stays, authorship goes. Done BEFORE the auth row is
  -- removed, because after it the cascade has already taken them.
  update public.posts   set author = ghost where author = u;
  update public.replies set author = ghost where author = u;

  -- rep_grants is different, and deliberately so.
  --
  -- The GIVER is re-pointed, not deleted, because deleting the row
  -- would take a point off somebody who still has the post it was given
  -- to -- and would leave posts.score counting a grant the journal no
  -- longer has. Anonymising keeps both numbers true.
  --
  -- unique (giver, post) still holds afterwards: the ghost cannot have
  -- given twice to one post, because each departing account gave at
  -- most once and their rows are distinct by post. Two different people
  -- who both gave to the SAME post and both leave would collide, so the
  -- conflict is swallowed and the row dropped -- which loses one point
  -- from the journal, and the score is corrected below to match.
  delete from public.rep_grants g
   where g.giver = u
     and exists (select 1 from public.rep_grants x
                  where x.giver = ghost and x.post = g.post);
  update public.rep_grants set giver = ghost where giver = u;

  -- Grants RECEIVED by the departing account: the post is about to have
  -- no author worth crediting, and the receiver column must not point
  -- at a deleted user. Re-pointed the same way.
  update public.rep_grants set receiver = ghost where receiver = u;

  -- Reports are moderation records, not content. They go: a report is
  -- about somebody's judgement of a post, and once the reporter is gone
  -- there is nobody whose judgement it was.
  delete from public.reports where reporter = u;

  -- Views: anonymous by nature, and (post, viewer) unique means
  -- re-pointing would collide constantly. Dropped.
  delete from public.post_views where viewer = u;

  -- Now the account itself, and progress/economy/profile by cascade.
  delete from auth.users where id = u;

  -- Finally, make the cache agree with the journal. Only posts touched
  -- above can have drifted, but recomputing all of them is cheap at
  -- this scale and cannot miss one.
  update public.posts p
     set score = coalesce((select count(*) from public.rep_grants g where g.post = p.id), 0)
   where p.score <> coalesce((select count(*) from public.rep_grants g where g.post = p.id), 0);
end;
$$;

revoke all    on function public.delete_account()  from public, anon;
grant  execute on function public.delete_account() to authenticated;
revoke all    on function public.deleted_author()  from public, anon;
grant  execute on function public.deleted_author() to authenticated;
