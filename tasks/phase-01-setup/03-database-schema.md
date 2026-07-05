# Task: Database Schema & Migrations

**Phase:** 1 — Setup & Schema  
**Week:** 1–2

## Goal

Create all database tables, indexes, and enums defined in the schema documentation.

## Requirements

- Write SQL migrations for all tables per [Database Schema](../docs/database.md):
  - `profiles`, `categories`, `products`, `product_images`
  - `product_options`, `product_option_values`, `product_variants`
  - `addresses`, `carts`, `cart_items`, `wishlist`
  - `orders`, `order_items`, `order_status_history`
- Create enums: `user_role`, `fulfillment_type`, `order_status`
- Create all indexes listed in [Database — Indexes](../docs/database.md#3-indexes)
- Add trigger to auto-create `profiles` row on `auth.users` insert (default role: `customer`)
- Add `updated_at` auto-update triggers where applicable

## Acceptance Criteria

- [ ] All tables exist with correct columns and types
- [ ] Foreign key constraints enforce referential integrity
- [ ] Indexes created on `orders.order_number`, `orders.status`, `products.category_id`, `products.active`, `product_variants.product_id`
- [ ] `wishlist` has UNIQUE constraint on (`user_id`, `product_id`)
- [ ] New auth user automatically gets a `profiles` row with role `customer`
- [ ] Migrations are idempotent and version-controlled in `supabase/migrations/`

## Dependencies

- [02-supabase-setup.md](./02-supabase-setup.md)

## Files to Modify

| File | Action |
|---|---|
| `supabase/migrations/001_enums.sql` | Create |
| `supabase/migrations/002_profiles.sql` | Create |
| `supabase/migrations/003_catalog.sql` | Create |
| `supabase/migrations/004_cart_wishlist.sql` | Create |
| `supabase/migrations/005_orders.sql` | Create |
| `supabase/migrations/006_indexes.sql` | Create |
| `supabase/migrations/007_triggers.sql` | Create |

## Definition of Done

- [ ] Migrations run cleanly on fresh Supabase project
- [ ] Schema matches [Database](../docs/database.md) documentation
- [ ] Manual verification: insert test rows into each table
- [ ] Migration files committed to repository
