# Task: Password Reset

**Phase:** 5 — Customer Accounts  
**Week:** 8

## Goal

Implement forgot password and reset password flows using Supabase Auth email links.

## Requirements

- Forgot password page at `/forgot-password`:
  - Email input form
  - On submit: call `supabase.auth.resetPasswordForEmail()` with redirect URL
  - Show success message regardless of whether email exists (prevents user enumeration)
- Reset password page at `/reset-password`:
  - Supabase sends user to this URL with a token in the URL hash
  - New password + confirm password form
  - On submit: call `supabase.auth.updateUser({ password })`
  - On success: redirect to `/account` or `/login`
- "Forgot password?" link on `/login` page points to `/forgot-password`
- Password validation: minimum 8 characters, must match confirmation

## Acceptance Criteria

- [ ] Forgot password form sends reset email via Supabase Auth
- [ ] Success message shown whether or not the email exists in the system
- [ ] Reset link in email navigates to `/reset-password`
- [ ] New password saved successfully via token
- [ ] Weak or mismatched passwords rejected with clear error
- [ ] Expired or invalid token shows appropriate error
- [ ] User redirected to account or login after successful reset

## Dependencies

- [01-signup-login.md](./01-signup-login.md)

## Files to Modify

| File | Action |
|---|---|
| `app/(storefront)/forgot-password/page.tsx` | Create |
| `app/(storefront)/reset-password/page.tsx` | Create |
| `lib/actions/auth.ts` | Update (add resetPassword and updatePassword actions) |
| `app/(storefront)/login/page.tsx` | Update (add "Forgot password?" link) |

## Definition of Done

- [ ] Full reset flow tested end-to-end
- [ ] Token expiry handled gracefully
- [ ] No user enumeration possible via forgot password form
