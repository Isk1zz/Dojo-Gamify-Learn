-- ================================================
-- Knell — 0006: lock down require_uid()
-- ------------------------------------------------
-- Found by the 2026-08-27 pen test. require_uid() was callable directly
-- by any authenticated user, even though 0003 said it "stays internal:
-- it is a helper these call, not an API". The 0003 revoke only named
-- `public, anon`, and Postgres grants EXECUTE to PUBLIC on function
-- creation -- but the `authenticated` role kept a usable path, so it
-- was reachable.
--
-- ---- This is hygiene, not a breach ----
-- require_uid() returns auth.uid() and nothing else -- the caller's own
-- id, straight out of the token they already hold. It discloses
-- nothing, takes no argument, and cannot be pointed at another user. It
-- was flagged only because an exposed internal helper is attack surface
-- that does not need to exist, and matching the stated intent is worth
-- two lines.
--
-- Revoking from `authenticated` does NOT break the functions that call
-- it: award_xp/buy_course/delete_account are SECURITY DEFINER, so their
-- internal call to require_uid() runs as the function owner, who retains
-- execute. Verified by the pen test re-run after this migration.
-- ================================================

revoke execute on function public.require_uid() from authenticated;
revoke execute on function public.require_uid() from public;

-- Belt and suspenders: PUBLIC is where the default creation grant lives.
-- Re-revoking is harmless if already gone.
