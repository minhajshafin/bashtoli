# Task: Admin Auth & Middleware

**Phase:** 2 — Admin MVP + Catalog  
**Week:** 2–3

## Goal

Protect all `/admin/*` routes with session-based authentication and role-based access control.

## Requirements

- Extend Next.js middleware to refresh Supabase session on every request
- Add role guard: only `staff` and `admin` roles can access `/admin/*`
- Redirect unauthenticated users to `/login`
- Redirect authenticated customers away from admin routes
- Create admin layout shell with navigation sidebar
- Display current user name and role in admin header

## Acceptance Criteria

- [ ] Unauthenticated request to `/admin` redirects to `/login`
- [ ] Customer role cannot access any `/admin/*` route
- [ ] Staff and admin roles can access admin routes
- [ ] Session persists across page navigations
- [ ] Admin layout renders with navigation links (Products, Categories, Orders placeholder)

## Dependencies

- Phase 1 complete (all setup tasks)
- [05-bootstrap-admin.md](../phase-01-setup/05-bootstrap-admin.md)
- [06-minimal-login-page.md](../phase-01-setup/06-minimal-login-page.md) — `/login` page must exist before this task

## Files to Modify

| File | Action |
|---|---|
| `middleware.ts` | Update |
| `lib/supabase/middleware.ts` | Update |
| `app/admin/layout.tsx` | Create |
| `app/admin/page.tsx` | Create (placeholder dashboard) |
| `components/admin/sidebar.tsx` | Create |
| `components/admin/header.tsx` | Create |

## Definition of Done

- [ ] Role guard tested with customer, staff, and admin accounts
- [ ] Middleware does not break public storefront routes
- [ ] Admin shell layout is functional and navigable
- [ ] No admin routes accessible without proper role
