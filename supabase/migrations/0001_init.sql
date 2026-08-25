-- ================================================
-- Knell — initial Supabase schema
-- ------------------------------------------------
-- Translates docs/BACKEND-ROADMAP.md's Phase 2 (data model) and Phase 3
-- (security rules) from the Firebase language it was written in to
-- actual Postgres. Three tables, split by WHO may write them:
--
--   profiles  — cosmetic/identity. Client-writable, own row only.
--   progress  — study data (completed topics, SM-2 reviews, stats).
--               Client-writable, own row only. Worst case a user
--               cheats their own review schedule; harms only them.
--   economy   — XP, wallet ($), tokens, inventory, patron tier, admin
--               flags. NO client write policy exists for this table
--               AT ALL. Not even an UPDATE policy scoped to "own row" —
--               there is no INSERT/UPDATE/DELETE policy, full stop.
--               The client can only SELECT it.
--
-- Per the roadmap's Phase 3: "if the client can write it, the client
-- can cheat it, and you're back where you started." A Firebase-based
-- plan would need the paid Blaze tier to enforce this server-side.
-- Postgres gives it for free — the ABSENCE of a policy is the
-- enforcement, RLS defaults to deny.
--
-- What this migration deliberately does NOT do: wire up the actual
-- economy-mutation RPCs (award XP, spend tokens on a course, claim a
-- garden dividend, buy a shop cosmetic). Each of those is a distinct
-- business rule with its own validation, and porting them one at a time
-- is real work, not schema work. Today's job is building the vault;
-- deciding what goes in it and how it's spent is the next session.
-- The one exception is new-account seeding (below) — a brand new row
-- of zeros needs no validation, so it's safe to do today.
-- ================================================

-- ---- profiles ----------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text not null default 'Student',
  avatar text,
  owned_avatars text[] not null default '{}',
  pinned_badges text[] not null default '{}',
  theme text not null default 'indigo',
  lobby_style text not null default 'star',
  star_links text not null default 'spokes',
  hex_flags text not null default 'combined',
  spoke_flags text not null default 'combined',
  hints_enabled boolean not null default true,
  sound_enabled boolean not null default true,
  bg_stripe text not null default 'none',
  bg_decors text[] not null default array['usa_stars','moon','clouds','usa_eagles'],
  scene text not null default 'jungle',
  sky text not null default 'night',
  units_unlocked boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.profiles is
  'Cosmetic/identity fields from data/db.js defaultProfile(). Client-writable, own row only — nothing here has cash value.';

alter table public.profiles enable row level security;

create policy "profiles: read own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles: update own"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

-- No insert/delete policy: rows are created only by handle_new_user()
-- below (SECURITY DEFINER, runs as postgres) and deleted only by the
-- auth.users cascade. A user can shape their own profile; they cannot
-- create or destroy the row that anchors it.

-- ---- progress ------------------------------------------------------
create table public.progress (
  user_id uuid primary key references auth.users(id) on delete cascade,
  completed_topics text[] not null default '{}',
  completed_chunks jsonb not null default '{}'::jsonb,
  reviews jsonb not null default '{}'::jsonb,
  seen_quotes int[] not null default '{}',
  stats jsonb not null default '{"miniQuizTotal":0,"miniQuizCorrect":0,"examQuestionsTotal":0,"examQuestionsCorrect":0,"examsTaken":0,"examsPassed":0,"topicStats":{}}'::jsonb,
  streak jsonb not null default '{"count":0,"lastActiveDate":null,"freezes":2,"freezeWeekStart":null}'::jsonb,
  story_progress jsonb not null default '{"unlockedNodes":["act1_node1"],"completedNodes":[],"attempts":{},"flags":[]}'::jsonb,
  vitals jsonb not null default '{"hunger":100,"thirst":100,"hygiene":100,"shelterTier":"street"}'::jsonb,
  last_vital_tick date,
  last_position jsonb,
  course_contracts jsonb not null default '{}'::jsonb,
  final_quiz jsonb not null default '{"attempts":0,"bestScore":0,"lastScore":0,"completedAt":null,"xpAttemptsToday":0,"xpAttemptsDate":null}'::jsonb,
  updated_at timestamptz not null default now()
);

comment on table public.progress is
  'Study data: completed topics/chunks, SM-2 review schedule, stats. Client-writable, own row only — the roadmap explicitly accepts this as cheatable-but-harmless.';

alter table public.progress enable row level security;

create policy "progress: read own"
  on public.progress for select
  using (auth.uid() = user_id);

create policy "progress: update own"
  on public.progress for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- ---- economy ---------------------------------------------------------
create table public.economy (
  user_id uuid primary key references auth.users(id) on delete cascade,
  charge int not null default 0,
  charge_earned int not null default 0,
  charge_spent int not null default 0,
  wallet int not null default 0,
  tokens int not null default 0,
  owned_themes text[] not null default '{}',
  inventory text[] not null default '{}',
  patron_tier smallint not null default 0,
  is_admin boolean not null default false,
  is_banned boolean not null default false,
  ban_reason text not null default '',
  warnings jsonb not null default '[]'::jsonb,
  last_dividend_claim timestamptz,
  updated_at timestamptz not null default now()
);

comment on table public.economy is
  'XP, wallet ($), tokens, inventory, admin flags. SERVER-OWNED per BACKEND-ROADMAP.md Phase 3: no client write policy exists for this table. Mutations only via SECURITY DEFINER RPCs, none of which are written yet.';

alter table public.economy enable row level security;

create policy "economy: read own"
  on public.economy for select
  using (auth.uid() = user_id);

-- Deliberately no insert/update/delete policy of any kind. RLS default
-- is deny; the absence of a policy IS the enforcement. Do not add an
-- "update own row" policy here later without re-reading Flag 1 and
-- Flag 2 in BACKEND-ROADMAP.md first — that policy is exactly the hole
-- the whole roadmap exists to avoid.

-- ---- $ / Tokens never convert (Flag 1) --------------------------------
-- Documented here, not just in the roadmap, because a schema is where a
-- future migration would actually violate it. wallet ($, earned in-app,
-- staked in the Arcade) and tokens (bought with real money, spent on
-- courses) are separate columns on purpose. Do not add a function that
-- moves value between them, and do not add a column that lets $ be
-- purchased or tokens be cashed out. See BACKEND-ROADMAP.md Flag 1 —
-- that separation is the thing keeping the Arcade out of gambling
-- regulation (KRAIL), not a coding convenience.

-- ---- New-account seeding ----------------------------------------------
-- The one place client-influenced values are safe to trust at economy
-- creation: a brand new account has no adversarial history, so seeding
-- at zero needs no validation. Everything after this trigger runs is
-- protected by the absence of policies above.
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id) values (new.id);
  insert into public.progress (user_id) values (new.id);
  insert into public.economy (user_id) values (new.id);
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---- updated_at bookkeeping --------------------------------------------
create function public.touch_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_touch before update on public.profiles
  for each row execute function public.touch_updated_at();
create trigger progress_touch before update on public.progress
  for each row execute function public.touch_updated_at();
create trigger economy_touch before update on public.economy
  for each row execute function public.touch_updated_at();
