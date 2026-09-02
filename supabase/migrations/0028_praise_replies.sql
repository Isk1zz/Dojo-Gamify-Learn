-- ================================================
-- Knell - 0028: reputation can be given to replies
-- ------------------------------------------------
-- The largest single fix for a problem an outside review quantified:
-- a five-person cohort at full weight issues 750 points a month and can
-- place at most 200 of them, because points go only to top-level posts
-- and there are not many. **Over 73% of all issued praise expires
-- unspent.**
--
-- Two things follow from a currency nobody can spend. It stops reading
-- as appreciation and starts reading as abundant -- and people
-- quota-dump near the reset, casting unconsidered points to avoid
-- "wasting" them, which is the exact behaviour nightly expiry was meant
-- to prevent.
--
-- Replies are where most of the writing will be: the caps are 3 posts a
-- day against 30 replies. Opening them to praise multiplies the places
-- a point can go by roughly the same ratio, using content that already
-- exists.
--
-- ---- The NULL trap, avoided rather than discovered ----
-- rep_grants becomes polymorphic: a grant targets a post OR a reply.
-- That is the same shape as `reports`, where
--
--     unique (reporter, post, reply)
--
-- silently did nothing, because Postgres treats NULLs as distinct and a
-- post-report leaves `reply` NULL. It let one person report one post a
-- thousand times, and it was found by asking the catalogue rather than
-- by reading the constraint.
--
-- So the same mistake is not repeated here. Two PARTIAL unique indexes,
-- one per target kind, each covering only rows where its column is
-- present. No NULL is ever part of a key.
--
-- ---- What does NOT change ----
-- One point per target, ten per author per month, five a day, never to
-- yourself. A reply is another thing worth praising, not another
-- allowance.
-- ================================================

alter table public.rep_grants
  add column if not exists reply uuid references public.replies(id) on delete cascade;

-- `post` has to become nullable for a reply-grant to exist at all.
alter table public.rep_grants alter column post drop not null;

-- Exactly one target. Same constraint reports carries, and it is what
-- makes the partial indexes below total.
alter table public.rep_grants drop constraint if exists rep_grants_one_target;
alter table public.rep_grants add constraint rep_grants_one_target
  check (num_nonnulls(post, reply) = 1);

-- The old key covered (giver, post) with post NOT NULL, so it was sound.
-- It is replaced anyway: with post now nullable it would stop being
-- sound the moment a second reply-grant arrived with post NULL.
alter table public.rep_grants drop constraint if exists rep_grants_giver_post_key;

create unique index if not exists rep_grants_one_per_post
  on public.rep_grants (giver, post) where post is not null;

create unique index if not exists rep_grants_one_per_reply
  on public.rep_grants (giver, reply) where reply is not null;

-- Replies need the same denormalised counter posts carry, for the same
-- reason: the journal is the truth and this is a cache so a thread does
-- not COUNT(*) per row. Added BEFORE the function that writes it.
alter table public.replies
  add column if not exists score int not null default 0 check (score >= 0);

update public.replies r
   set score = coalesce((select count(*) from public.rep_grants g
                          where g.reply = r.id), 0)
 where r.score <> coalesce((select count(*) from public.rep_grants g
                             where g.reply = r.id), 0);

-- The old single-argument signature goes FIRST. Creating the two-arg
-- version while it still existed would leave grant_reputation(uuid)
-- ambiguous -- the new one has defaults, so a one-argument call could
-- match either, and Postgres refuses rather than guessing.
drop function if exists public.grant_reputation(uuid);

-- ---- Granting, to either kind ----------------------------------------
create or replace function public.grant_reputation(
  post_id uuid default null,
  reply_id uuid default null
)
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
  allowed int;
  spent int;
  to_author int;
  new_score int;
  kind text;
begin
  if (post_id is null) = (reply_id is null) then
    raise exception 'grant to exactly one of a post or a reply' using errcode = 'P0001';
  end if;
  kind := case when post_id is not null then 'post' else 'reply' end;

  -- Same lock as before: the allowance check is read-then-write, which
  -- is the shape that raced and needed 0011.
  perform pg_advisory_xact_lock(hashtext('knell.rep_grant'), hashtext(u::text));

  if kind = 'post' then
    select author, hidden into author_id, is_hidden
      from public.posts where id = post_id;
  else
    select author, hidden into author_id, is_hidden
      from public.replies where id = reply_id;
  end if;

  if not found then
    raise exception 'no such %', kind using errcode = 'P0002';
  end if;
  if is_hidden then
    raise exception 'that % is hidden', kind using errcode = 'P0001';
  end if;
  if author_id = u then
    raise exception 'cannot grant to yourself' using errcode = 'P0001';
  end if;

  if exists (select 1 from public.rep_grants
              where giver = u
                and ((kind = 'post'  and post  = post_id)
                  or (kind = 'reply' and reply = reply_id))) then
    return jsonb_build_object('status', 'already_granted', 'spent', 0);
  end if;

  -- Ten to any one author per month, counting BOTH kinds. A per-kind
  -- cap would have doubled what one person can hand to another, which
  -- is exactly the number an outside review said already defines the
  -- exchange rate for a colluding pair.
  select count(*) into to_author from public.rep_grants
   where giver = u and receiver = author_id
     and created_at >= date_trunc('month', now());
  if to_author >= 10 then
    raise exception 'monthly limit for this author reached' using errcode = 'P0001';
  end if;

  allowed := public.rep_allowance();
  select count(*) into spent from public.rep_grants
   where giver = u and created_at >= current_date;
  if spent >= allowed then
    raise exception 'daily allowance spent' using errcode = 'P0001';
  end if;

  insert into public.rep_grants (giver, receiver, post, reply)
  values (u, author_id, post_id, reply_id);

  if kind = 'post' then
    update public.posts set score = score + 1
     where id = post_id returning score into new_score;
  else
    update public.replies set score = score + 1
     where id = reply_id returning score into new_score;
  end if;

  return jsonb_build_object(
    'status', 'granted', 'kind', kind, 'score', new_score,
    'left_today', greatest(0, allowed - spent - 1));
end;
$$;

revoke all    on function public.grant_reputation(uuid, uuid)  from public, anon;
grant  execute on function public.grant_reputation(uuid, uuid) to authenticated;
