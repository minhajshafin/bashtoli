# Task: RLS Policies

**Phase:** 1 — Setup & Schema  
**Week:** 2

## Goal

Implement Row-Level Security policies that enforce role-based access control at the database layer.

## Requirements

- Enable RLS on all application tables
- Implement policies per [Database — RLS Policies](../docs/database.md#4-row-level-security-rls-policies):
  - **products/categories:** public read (active only for storefront); staff/admin write
  - **orders:** customer reads own; staff/admin read all; insert via server; guest lookup via server action only
  - **profiles:** user reads/updates own; admin manages staff roles
  - **carts/cart_items/wishlist/addresses:** own data only
  - **product_variants, product_images, product_options, product_option_values:** public read (active); staff/admin write
- Storefront queries must only return active products/variants
- Test policies with each role (`customer`, `staff`, `admin`, anonymous)

## Acceptance Criteria

- [x] Anonymous user can read active products and categories
- [x] Anonymous user cannot read orders, profiles, or other users' carts
- [x] Customer can read/update own profile, addresses, cart, wishlist, and orders
- [x] Customer cannot access `/admin` data or other users' records
- [x] Staff can CRUD products, categories, variants, and read/update all orders
- [x] Admin can manage staff roles in addition to staff permissions
- [x] Deactivated products are hidden from public SELECT policies

## Dependencies

- [03-database-schema.md](./03-database-schema.md)

## Files to Modify

| File | Action |
|---|---|
| `supabase/migrations/008_rls_policies.sql` | Create |
| `lib/supabase/server.ts` | Update (service role for admin ops) |

## Definition of Done

- [x] RLS enabled on all tables
- [x] Policy tests pass for all four access contexts (anon, customer, staff, admin)
- [x] No table accessible without appropriate policy
- [x] Policies documented and match [Database](../docs/database.md)
