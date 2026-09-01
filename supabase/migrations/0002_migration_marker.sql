-- ================================================
-- Knell — 0002: the one-time claim marker
-- ------------------------------------------------
-- BACKEND-ROADMAP.md Step 4. 0001 has already run against the live
-- project, so this is a separate file rather than an edit to it —
-- editing a migration that has run is how two environments quietly stop
-- matching.
--
-- ---- Why a column and not a localStorage flag ----
-- The guard has to survive the thing it is guarding against. A local
-- flag would be missing on a second device, on a cleared browser, and
-- on the exact "signed in again from somewhere else" case that would
-- overwrite good cloud progress with a stale local snapshot. Putting it
-- on the row means the answer to "has this account already claimed a
-- local profile?" travels with the account.
--
-- Nullable with no default on purpose: NULL means "never claimed", and
-- that is the state every existing row is already in, so no backfill.
-- ================================================

alter table public.progress
  add column if not exists migrated_at timestamptz;

comment on column public.progress.migrated_at is
  'Set once, by the client, the first time a pre-existing local profile is uploaded (Step 4 claim flow). NULL = never claimed. Checked before any upload so a second sign-in cannot re-clobber cloud progress with a stale local snapshot.';

-- No new RLS policy needed: `progress` already carries own-row
-- select/update for the authenticated user, and migrated_at is just
-- another column on that row. It is deliberately client-writable —
-- unlike economy, this is the user's own study history, and the worst
-- a malicious client can do by forging it is decline to import its own
-- backup.
