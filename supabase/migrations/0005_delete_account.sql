-- ================================================
-- Knell — 0005: account deletion
-- ------------------------------------------------
-- BACKEND-ROADMAP.md Step 7 / GDPR Art. 17 (right to erasure).
--
-- The schema already cascades: profiles/progress/economy all reference
-- auth.users(id) ON DELETE CASCADE, so removing the auth row removes
-- everything. What was missing is a way for a user to trigger that
-- themselves — the client holds only the publishable key, which cannot
-- touch auth.users, and the admin API needs the secret key that must
-- never reach a browser.
--
-- Hence this: a SECURITY DEFINER function that deletes exactly one row,
-- the caller's own, chosen by auth.uid() and never by an argument.
-- There is deliberately no delete_account(user_id) form — a parameter
-- would let any signed-in user erase somebody else's account, which is
-- about the worst function this schema could offer.
--
-- ---- This is irreversible and that is the point ----
-- No soft delete, no tombstone, no 30-day grace. "Delete my account"
-- has to actually delete, or the privacy policy saying so is a lie.
-- The UI carries the confirmation and the export prompt; by the time
-- this runs, the decision is made.
-- ================================================

create or replace function public.delete_account()
returns void
language plpgsql
volatile
security definer
set search_path = ''
as $$
declare
  u uuid := public.require_uid();
begin
  -- The three data rows go by cascade. Deleting them explicitly first
  -- would be redundant, and would also mean a partial failure could
  -- leave an auth row with no data attached.
  delete from auth.users where id = u;
end;
$$;

revoke all on function public.delete_account() from public, anon;
grant execute on function public.delete_account() to authenticated;

comment on function public.delete_account() is
  'GDPR Art. 17 erasure. Deletes the CALLER''s auth.users row; profiles/progress/economy follow by ON DELETE CASCADE. Takes no arguments on purpose: the target is always auth.uid(), so it cannot be pointed at another account.';
