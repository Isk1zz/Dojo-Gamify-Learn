-- ================================================
-- Knell - 0012: the server pays for work it can see
-- ------------------------------------------------
-- Replaces award_xp(amount), which took the amount FROM THE CLIENT and
-- believed it. Its only guard was a 200 ceiling per call, and nothing
-- capped the number of calls. Four calls from a browser console put 800
-- XP on an account that had studied nothing. A thousand calls is the
-- whole Career ladder, and the ladder hands out 795 Tokens on the way.
-- Tokens buy courses. So the hole did not end at a vanity number -- it
-- ended at paid content.
--
-- ---- The rule this is built on ----
-- The server pays for work it can see, and never for a number the
-- client sends. Everything below follows from that one sentence.
--
-- ---- Four defences, in order of how much they carry ----
--
-- 1. PAY ONCE PER PIECE OF WORK.  The load-bearing one. Each chunk,
--    topic, unit and course pays exactly once, ever, enforced by the
--    primary key on (user_id, item). This kills the loop outright
--    rather than slowing it: the app contains a FINITE amount of work,
--    so a thousand calls earn exactly what one honest pass earns.
--    No rate limit can do that.
--
-- 2. ONLY FOR CONTENT THAT EXISTS.  Without it, defence 1 inverts:
--    unable to claim a real chunk twice, invent ten thousand fake ones.
--    content_items is the catalogue, and an id not in it is refused.
--
-- 3. PACE.  Minimum gap since the previous paid item -- 60s for a
--    theory page, 20s for a one-question quiz, 15s for a thin page.
--    Note this can only ever bite on the FIRST pass, because a re-read
--    is not paid at all and so never reaches the check. A breach does
--    NOT burn the item: it refuses payment and leaves it unclaimed, so
--    someone genuinely quick can come back and be paid properly. That
--    forgiveness costs nothing, because defence 1 already caps the
--    total; waiting gains a cheat nothing.
--
-- 4. DAILY CEILING.  Insurance against a mistake in 1-3. It has earned
--    its place once already: the reputation cap meant that when a race
--    turned up in grant_reputation, the overrun was four times the cap
--    rather than a thousand.
--
-- Exam scoring (the client still asserts its own percentage) is NOT in
-- this migration. It needs the answer key to move server-side, which is
-- a visible change to how the app behaves offline, and it deserves its
-- own step rather than riding along here.
--
-- ---- What this does not fix, stated plainly ----
-- The answers ship inside library/content/*/data_*.js. Anyone who opens
-- that file can pass honestly, as far as any server can tell. No ledger
-- closes that. The goal these defences can actually meet is narrower
-- and still worth having: make cheating harder than taking the course.
-- ================================================

-- ---- The catalogue -------------------------------------------------
-- What exists, and what each piece is worth. Populated from the content
-- files by a generator, so this table and the app cannot drift apart by
-- hand-editing.
create table if not exists public.content_items (
  -- Shaped 'kind:path', e.g. 'chunk:bike-brakes:2', 'topic:bike-brakes',
  -- 'unit:3', 'course:bike-a3'. Repeatable work carries a date, e.g.
  -- 'review:bike-brakes:2026-09-02' -- see the note on reviews below.
  id           text primary key,
  kind         text not null check (kind in ('chunk','topic','unit','course','final','review')),
  -- XP is a RANGE because chunk XP is deliberately jittered (15-21).
  -- The server rolls it, not the client: a client-chosen number inside
  -- a legal range is still a client-chosen number.
  xp_min       int  not null default 0 check (xp_min >= 0),
  xp_max       int  not null default 0 check (xp_max >= xp_min),
  money        int  not null default 0 check (money  >= 0),
  tokens       int  not null default 0 check (tokens >= 0),
  -- Seconds that must have passed since this user's previous payment.
  min_seconds  int  not null default 0 check (min_seconds >= 0)
);

alter table public.content_items enable row level security;

-- Readable by signed-in users so the app can show what a piece is worth
-- before it is earned. No write policy at all: the catalogue is loaded
-- by the generator through the service key, never from a browser.
drop policy if exists content_items_read on public.content_items;
create policy content_items_read on public.content_items
  for select to authenticated using (true);

-- ---- The ledger ----------------------------------------------------
-- One row per paid piece of work. This is the journal; economy holds
-- the running balance. Same split as rep_grants and posts.score, and
-- for the same reason: the journal is the truth, the balance is a cache
-- that exists so nothing has to sum the journal on every render.
create table if not exists public.earnings (
  user_id    uuid not null references auth.users(id) on delete cascade,
  item       text not null references public.content_items(id) on delete cascade,
  xp         int  not null default 0,
  money      int  not null default 0,
  tokens     int  not null default 0,
  created_at timestamptz not null default now(),
  -- Defence 1, as a constraint rather than a check in code. Code can be
  -- bypassed by a future RPC that forgets the rule; this cannot.
  primary key (user_id, item)
);

alter table public.earnings enable row level security;

drop policy if exists earnings_read_own on public.earnings;
create policy earnings_read_own on public.earnings
  for select to authenticated using (user_id = auth.uid());

-- No insert, update or delete policy. The only way a row appears is the
-- SECURITY DEFINER function below.

create index if not exists earnings_user_time on public.earnings (user_id, created_at desc);

-- ---- Daily ceiling -------------------------------------------------
-- Generous on purpose: it is a backstop against a bug in the defences
-- above, not a pacing mechanism. A determined honest day of study must
-- not hit it. Roughly: 40 chunks at ~18 XP is 720, so 2000 leaves
-- headroom for exams and unit rewards on top.
create or replace function public.daily_xp_ceiling()
returns int language sql immutable set search_path = ''
as $$ select 2000 $$;

-- ---- The one way to earn ------------------------------------------
create or replace function public.claim_earning(item_id text)
returns jsonb
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  u        uuid := public.require_uid();
  it       public.content_items%rowtype;
  last_at  timestamptz;
  gap      numeric;
  spent    int;
  pay_xp   int;
  ceiling  int := public.daily_xp_ceiling();
begin
  -- Serialise this caller. The checks below are read-then-write, which
  -- is exactly the shape that raced in grant_reputation: two calls both
  -- read "nothing paid yet" and both insert. Different users never
  -- contend, so this costs nothing at real concurrency.
  perform pg_advisory_xact_lock(hashtext('knell.earning'), hashtext(u::text));

  -- Defence 2: only content that exists.
  select * into it from public.content_items where id = item_id;
  if not found then
    raise exception 'no such item' using errcode = 'P0002';
  end if;

  -- Defence 1: only once. Returns rather than raises -- a second claim
  -- is the normal result of a reload or a retry, not an error, and the
  -- caller should not have to tell those apart from a real failure.
  if exists (select 1 from public.earnings where user_id = u and item = item_id) then
    return jsonb_build_object('status', 'already_paid', 'xp', 0, 'money', 0, 'tokens', 0);
  end if;

  -- Defence 3: pace. Measured from the previous PAYMENT, which is the
  -- only timestamp the server can actually trust -- it cannot see how
  -- long a page was open, and a duration reported by the client would
  -- be the same mistake this whole migration exists to undo.
  if it.min_seconds > 0 then
    select max(created_at) into last_at from public.earnings where user_id = u;
    if last_at is not null then
      gap := extract(epoch from (now() - last_at));
      if gap < it.min_seconds then
        -- Deliberately NOT recorded: the item stays unclaimed and can
        -- be earned properly later.
        return jsonb_build_object(
          'status', 'too_fast',
          'wait_seconds', ceil(it.min_seconds - gap),
          'xp', 0, 'money', 0, 'tokens', 0);
      end if;
    end if;
  end if;

  -- Defence 4: daily ceiling.
  select coalesce(sum(xp), 0) into spent
    from public.earnings
   where user_id = u and created_at >= current_date;

  -- The roll happens here, on the server. A range in the catalogue is
  -- not an invitation for the client to pick from it.
  pay_xp := it.xp_min + case when it.xp_max > it.xp_min
                             then floor(random() * (it.xp_max - it.xp_min + 1))::int
                             else 0 end;

  if spent + pay_xp > ceiling then
    pay_xp := greatest(0, ceiling - spent);
  end if;

  insert into public.earnings (user_id, item, xp, money, tokens)
  values (u, item_id, pay_xp, it.money, it.tokens);

  update public.economy
     set charge        = charge        + pay_xp,
         charge_earned = charge_earned + pay_xp,
         wallet        = wallet        + it.money,
         tokens        = tokens        + it.tokens,
         updated_at    = now()
   where user_id = u;

  if not found then
    raise exception 'no economy row' using errcode = 'P0002';
  end if;

  return jsonb_build_object(
    'status',  'paid',
    'xp',      pay_xp,
    'money',   it.money,
    'tokens',  it.tokens,
    'capped',  spent + pay_xp >= ceiling);
end;
$$;

-- ---- Close the old hole -------------------------------------------
-- award_xp took its amount from the caller. Nothing in the app has ever
-- called it -- the wrapper in core/supabase.js was written and never
-- wired -- so revoking it breaks nothing, and leaving it reachable
-- would leave the entire ladder purchasable from a console.
--
-- Revoked rather than dropped: dropping it would make an old cached
-- client that somehow did call it fail with a confusing 404 rather than
-- a clear permission error, and the function is worth keeping visible
-- in the schema as a record of what not to do again.
revoke all on function public.award_xp(int) from public, anon, authenticated;

revoke all    on function public.claim_earning(text)  from public, anon;
grant  execute on function public.claim_earning(text) to authenticated;
revoke all    on function public.daily_xp_ceiling()   from public, anon;
grant  execute on function public.daily_xp_ceiling()  to authenticated;
