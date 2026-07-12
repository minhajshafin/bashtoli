# Task: Sign Up / Log In

**Phase:** 5 — Customer Accounts  
**Week:** 8

## Goal

Implement customer authentication with Supabase Auth for sign up, log in, and log out.

## Requirements

- Sign up page at `/signup` (email + password)
- Log in page at `/login` — **enhances** the minimal login page from Phase 1 (Task 1-06) with signup link, full styling, and improved UX
- Log out action (clears session, keeps localStorage guest cart)
- **Email verification required:** Supabase Auth sends verification email on signup; user must verify before logging in (configured in Supabase Auth settings — enable email confirmations)
- Auto-create `profiles` row on sign up (via DB trigger from Phase 1)
- Redirect to previous page or account dashboard after login
- Link to sign up from login and vice versa
- Password validation (minimum 8 characters)
- "Forgot password?" link on login page (implemented in Task 5-06)

## Acceptance Criteria

- [x] New user can sign up with email and password
- [x] Verification email sent after signup; login blocked until email verified
- [x] User can log in and see authenticated state in header
- [x] User can log out; guest cart in localStorage remains
- [x] Profile row created automatically on sign up with role `customer`
- [x] Invalid credentials show clear error message
- [x] Protected account routes redirect to login when unauthenticated
- [x] "Forgot password?" link visible on login page

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

- [x] Sign up, login, logout cycle tested
- [x] Profile auto-creation verified
- [x] Guest cart preserved on logout
- [x] Auth state reflected in UI
