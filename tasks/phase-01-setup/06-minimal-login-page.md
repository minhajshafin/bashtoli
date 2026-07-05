# Task: Minimal Login Page

**Phase:** 1 — Setup & Schema  
**Week:** 2

## Goal

Create a minimal `/login` page so the admin auth middleware (Phase 2) has a redirect destination. Full auth flow (signup, styling, email verification) is completed in Phase 5.

## Requirements

- Login page at `/login` with email + password form
- On submit: call Supabase Auth `signInWithPassword`; show error on failure
- On success: redirect to `/admin` (temporary; Phase 5 adds return-URL support)
- Minimal styling (functional, not polished — Phase 5 handles full design)

## Acceptance Criteria

- [ ] `/login` page renders without error
- [ ] Admin user can log in with email and password
- [ ] Invalid credentials show an error message
- [ ] Successful login redirects to `/admin`
- [ ] Page does not link to sign-up (that is Phase 5)

## Dependencies

- [02-supabase-setup.md](./02-supabase-setup.md)
- [05-bootstrap-admin.md](./05-bootstrap-admin.md) (admin user must exist to test)

## Files to Modify

| File | Action |
|---|---|
| `app/(storefront)/login/page.tsx` | Create (minimal form) |
| `lib/actions/auth.ts` | Create (login Server Action only) |

## Definition of Done

- [ ] Admin can log in via `/login` and reach `/admin`
- [ ] Login errors handled gracefully
- [ ] No broken redirect when Phase 2 middleware fires
