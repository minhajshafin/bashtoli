# Task: Bootstrap First Admin

**Phase:** 1 — Setup & Schema  
**Week:** 2

## Goal

Provide a one-time mechanism to create the first admin user so the owner can access the admin dashboard.

## Requirements

- Write SQL script to promote an existing auth user to `admin` role
- Document the bootstrap process (sign up via Supabase Auth, then run script)
- Alternative: Supabase dashboard manual role update documented as fallback
- Verify admin user can pass middleware role guard (stub OK at this stage)

## Acceptance Criteria

- [x] SQL script updates `profiles.role` to `admin` for a given user ID
- [x] Script is idempotent (safe to run multiple times on same user)
- [x] Documentation explains step-by-step bootstrap process
- [x] Test admin user exists in dev environment

## Dependencies

- [03-database-schema.md](./03-database-schema.md)
- [04-rls-policies.md](./04-rls-policies.md)

## Files to Modify

| File | Action |
|---|---|
| `supabase/scripts/bootstrap-admin.sql` | Create |
| `docs/deployment.md` | Update (bootstrap section) |

## Definition of Done

- [x] Bootstrap script tested on dev Supabase project
- [x] First admin user can authenticate
- [x] Process documented for production deployment
- [x] No hardcoded credentials in repository
