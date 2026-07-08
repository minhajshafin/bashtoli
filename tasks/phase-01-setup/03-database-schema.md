# Task: Database Schema & Migrations

**Phase:** 1 — Setup & Schema  
**Week:** 1–2

## Goal

Create all database tables, indexes, and enums defined in the schema documentation.

## Requirements

- Write SQL migrations for all tables per [Database Schema](../docs/database.md):
  - `profiles`, `categories` (with `created_at`), `products`, `product_images`
  - `product_options`, `product_option_values`, `product_variants` (with `updated_at`)
  - `addresses`, `carts`, `cart_items`, `wishlist` (with `created_at`)
  - `orders`, `order_items`, `order_status_history` (required, not optional)
- Create enums: `user_role`, `fulfillment_type`, `order_status`, `delivery_zone` (`inside_dhaka` | `outside_dhaka`)
- Add `products.featured boolean DEFAULT false`
- Add `orders.delivery_zone delivery_zone` (nullable; null = pickup)
- Document cascade delete behavior in migrations (see [Database §6](../docs/database.md#6-cascade-delete-rules))
- Create all indexes listed in [Database — Indexes](../docs/database.md#3-indexes)
- Add trigger to auto-create `profiles` row on `auth.users` insert (default role: `customer`)
- Add `updated_at` auto-update triggers where applicable

## Acceptance Criteria

- [x] All tables exist with correct columns and types
- [x] Foreign key constraints enforce referential integrity
- [x] Indexes created on `orders.order_number`, `orders.status`, `products.category_id`, `products.active`, `product_variants.product_id`
- [x] `wishlist` has UNIQUE constraint on (`user_id`, `product_id`)
- [x] New auth user automatically gets a `profiles` row with role `customer`
- [x] Migrations are idempotent and version-controlled in `supabase/migrations/`

## Dependencies

- [02-supabase-setup.md](./02-supabase-setup.md)

## Files to Modify

| File | Action |
|---|---|
| `supabase/migrations/001_enums.sql` | Create (include `delivery_zone` enum) |
| `supabase/migrations/002_profiles.sql` | Create |
| `supabase/migrations/003_catalog.sql` | Create (include `products.featured`) |
| `supabase/migrations/004_cart_wishlist.sql` | Create |
| `supabase/migrations/005_orders.sql` | Create (include `orders.delivery_zone`) |
| `supabase/migrations/006_indexes.sql` | Create |
| `supabase/migrations/007_triggers.sql` | Create |
| `lib/config/delivery.ts` | Create (delivery zone fee constants) |

## Definition of Done

- [x] Migrations run cleanly on fresh Supabase project
- [x] Schema matches [Database](../docs/database.md) documentation
- [ ] Manual verification: insert test rows into each table
- [ ] Migration files committed to repository
