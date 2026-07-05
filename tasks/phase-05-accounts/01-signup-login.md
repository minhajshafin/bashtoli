# Task: Sign Up / Log In

**Phase:** 5 — Customer Accounts  
**Week:** 8

## Goal

Implement customer authentication with Supabase Auth for sign up, log in, and log out.

## Requirements

- Sign up page at `/signup` (email + password)
- Log in page at `/login`
- Log out action (clears session, keeps localStorage guest cart)
- Auto-create `profiles` row on sign up (via DB trigger from Phase 1)
- Redirect to previous page or account dashboard after login
- Link to sign up from login and vice versa
- Password validation (minimum length, etc.)

## Acceptance Criteria

- [ ] New user can sign up with email and password
- [ ] User can log in and see authenticated state in header
- [ ] User can log out; guest cart in localStorage remains
- [ ] Profile row created automatically on sign up with role `customer`
- [ ] Invalid credentials show clear error message
- [ ] Protected account routes redirect to login when unauthenticated

## Dependencies

- Phase 1 (profiles table, auth trigger)
- Phase 4 complete (checkout proven for guests first)

## Files to Modify

| File | Action |
|---|---|
| `app/(storefront)/login/page.tsx` | Create |
| `app/(storefront)/signup/page.tsx` | Create |
| `components/storefront/auth-form.tsx` | Create |
| `lib/actions/auth.ts` | Create |
| `lib/validations/auth.ts` | Create |
| `components/storefront/header.tsx` | Update |

## Definition of Done

- [ ] Sign up, login, logout cycle tested
- [ ] Profile auto-creation verified
- [ ] Guest cart preserved on logout
- [ ] Auth state reflected in UI
