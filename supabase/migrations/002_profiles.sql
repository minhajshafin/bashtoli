-- ============================================================
-- 002_profiles.sql
-- User profile table extending auth.users (1:1).
-- ============================================================

CREATE TABLE profiles (
  id          uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role        user_role   NOT NULL DEFAULT 'customer',
  full_name   text,
  phone       text,
  created_at  timestamptz NOT NULL DEFAULT now(),
  updated_at  timestamptz NOT NULL DEFAULT now()
);

-- updated_at is maintained by the trigger in 007_triggers.sql
