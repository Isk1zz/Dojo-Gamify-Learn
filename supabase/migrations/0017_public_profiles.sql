-- ================================================
-- Knell - 0017: what a stranger may see about an author
-- ------------------------------------------------
-- The feed needs author names. It cannot have them: profiles carries
-- one policy, "read own", so a signed-in person sees exactly one row --
-- their own. Verified against the live database before writing this:
-- five posts by two distinct authors, one profile readable.
--
-- ---- Why not simply open the table ----
-- Because RLS grants rows, not columns, and profiles holds things that
-- are nobody else's business:
--
--   country          entered for COURSE TARGETING -- bike-a3 is
--                    Israel-specific. 0001's own comment says it is not
--                    a legal or tax field and must not silently become
--                    one. Publishing it to every signed-in stranger
--                    would be exactly that kind of silent growth.
--   hints_enabled    how somebody studies
--   units_unlocked   where they are in the material
--   theme, sky, scene, bg_decors, star_links, ...
--                    their settings, harmless and still not public
--
-- ---- What IS published, and why those three ----
-- name            already public by construction: it is the unique
--                 nickname sign-in accepts, and 0007 indexes it
--                 lower-case precisely so two people cannot share one.
-- avatar          chosen to be looked at.
-- pinned_badges   exists for no other purpose than being displayed.
--
-- Nothing else. Adding a field here is a decision about somebody's
-- privacy, not a convenience, and it should be made on its own.
--
-- ---- Why a function and not a view ----
-- A security_invoker view inherits the base table's RLS and would
-- return the same one row. A view with security_invoker off is a
-- SECURITY DEFINER by another name, with the permissions harder to see.
-- This is explicit about what it does.
--
-- Standing (received_total and friends) is deliberately NOT here. The
-- feed does not need it, and "what does a stranger learn about how
-- respected you are" is its own question -- see FORUM-PLAN.md step 3.
-- ================================================

create or replace function public.public_profiles(ids uuid[])
returns table (id uuid, name text, avatar text, pinned_badges text[])
language sql
stable
security definer
set search_path = ''
as $$
  select p.id, p.name, p.avatar, p.pinned_badges
    from public.profiles p
   where p.id = any(ids)
$$;

-- Batched on purpose: a feed of twenty posts is one call, not twenty.
-- The argument is a list of ids the caller already has from posts they
-- were allowed to read, so this exposes nothing that reading the feed
-- did not already imply.
--
-- It cannot be used to enumerate the user base: with no ids you get no
-- rows, and an id is a uuid nobody can guess.

revoke all    on function public.public_profiles(uuid[]) from public, anon;
grant  execute on function public.public_profiles(uuid[]) to authenticated;
