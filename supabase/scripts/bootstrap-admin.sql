-- ============================================================
-- bootstrap-admin.sql
-- Promotes an existing auth user to the 'admin' role.
--
-- USAGE
-- ─────
-- 1. Sign up normally via the app or Supabase Auth dashboard.
-- 2. Copy the user's UUID from:
--      Supabase Dashboard → Authentication → Users
-- 3. Replace <USER_UUID> below with that UUID.
-- 4. Run this script in:
--      Supabase Dashboard → SQL Editor
--
-- This script is IDEMPOTENT — safe to run multiple times.
-- Running it on an already-admin user leaves the role unchanged.
-- ============================================================

-- Replace this value with the actual user UUID before running
DO $$
DECLARE
  target_user_id uuid := '<USER_UUID>';  -- ← paste UUID here
BEGIN
  -- Verify the user exists in auth.users before promoting
  IF NOT EXISTS (SELECT 1 FROM auth.users WHERE id = target_user_id) THEN
    RAISE EXCEPTION 'User % not found in auth.users. Check the UUID.', target_user_id;
  END IF;

  -- Update the profiles row (created automatically on signup by trigger)
  UPDATE public.profiles
  SET role = 'admin'
  WHERE id = target_user_id;

  -- Confirm how many rows were updated
  IF NOT FOUND THEN
    RAISE EXCEPTION 'profiles row not found for user %. Did the signup trigger run correctly?', target_user_id;
  END IF;

  RAISE NOTICE 'User % has been promoted to admin.', target_user_id;
END;
$$;

-- Verify the result
SELECT id, role, full_name, created_at
FROM public.profiles
WHERE role = 'admin';
