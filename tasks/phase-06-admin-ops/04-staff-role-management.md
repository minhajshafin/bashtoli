# Task: Staff Role Management

**Phase:** 6 — Admin Ops  
**Week:** 9–10

## Goal

Allow admin users to promote customers to staff and manage staff accounts.

## Requirements

- Staff management page at `/admin/staff` (admin only)
- List users with role `staff` or `admin`
- Promote customer → staff (search by email)
- Demote staff → customer
- Admin cannot demote themselves
- Only `admin` role can access this page (not `staff`)
- Zod validation on role change server action

## Acceptance Criteria

- [x] Admin can view list of staff and admin users
- [x] Admin can promote a customer to staff by email
- [x] Promoted staff can access admin dashboard
- [x] Admin can demote staff back to customer
- [x] Demoted user loses admin access immediately
- [x] Staff role cannot access `/admin/staff`
- [x] Admin cannot demote their own account

## Dependencies

- [01-admin-auth-middleware.md](../phase-02-admin-mvp/01-admin-auth-middleware.md)
- Staff access model decision from [Open Items](../docs/open-items.md)

## Files to Modify

| File | Action |
|---|---|
| `app/admin/staff/page.tsx` | Create |
| `components/admin/staff-list.tsx` | Create |
| `components/admin/promote-user-form.tsx` | Create |
| `lib/actions/staff.ts` | Create |
| `lib/validations/staff.ts` | Create |

## Definition of Done

- [x] Role promotion/demotion tested
- [x] Access control verified (admin only page, staff blocked)
- [x] Self-demotion prevented
- [x] RLS allows admin role management
