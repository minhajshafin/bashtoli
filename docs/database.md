# Database Schema

Auth is handled by Supabase `auth.users`. Application data lives in `profiles` and related tables.

## 1. Entity Relationship Overview

```
auth.users
    │
    └── profiles (1:1)
            │
            ├── addresses (1:N)
            ├── carts (1:1)
            │       └── cart_items (1:N) → product_variants
            ├── wishlist (1:N) → products
            └── orders (1:N)
                    └── order_items (1:N) → products, product_variants

categories (1:N) → products (1:N) → product_images
                              (1:N) → product_options (1:N) → product_option_values
                              (1:N) → product_variants
```

## 2. Tables

### profiles

Extends Supabase Auth users with application-specific data.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid (PK, FK) | References `auth.users.id` |
| `role` | enum | `customer` \| `staff` \| `admin` |
| `full_name` | text | |
| `phone` | text | |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | |

### categories

| Column | Type | Notes |
|---|---|---|
| `id` | uuid (PK) | |
| `name` | text | |
| `slug` | text | Unique |
| `sort_order` | integer | Display ordering |
| `created_at` | timestamptz | |

### products

| Column | Type | Notes |
|---|---|---|
| `id` | uuid (PK) | |
| `name` | text | |
| `slug` | text | Unique |
| `description` | text | |
| `category_id` | uuid (FK) | → categories.id |
| `base_price` | numeric | Reference price; variants may override |
| `active` | boolean | Draft vs active toggle |
| `featured` | boolean | Show in home page featured section; default false |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | |

### product_images

| Column | Type | Notes |
|---|---|---|
| `id` | uuid (PK) | |
| `product_id` | uuid (FK) | → products.id |
| `url` | text | Supabase Storage URL |
| `alt_text` | text | |
| `sort_order` | integer | Gallery ordering |

### product_options

Defines option axes for admin UI (e.g. Size, Color).

| Column | Type | Notes |
|---|---|---|
| `id` | uuid (PK) | |
| `product_id` | uuid (FK) | → products.id |
| `name` | text | e.g. "Size", "Color" |
| `sort_order` | integer | |

### product_option_values

Values per option (e.g. S/M/L, Red/Blue).

| Column | Type | Notes |
|---|---|---|
| `id` | uuid (PK) | |
| `option_id` | uuid (FK) | → product_options.id |
| `value` | text | e.g. "L", "Red" |
| `sort_order` | integer | |

### product_variants

One row per sellable SKU.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid (PK) | |
| `product_id` | uuid (FK) | → products.id |
| `sku` | text | Optional |
| `option_values` | jsonb | e.g. `{"size":"L","color":"Red"}` |
| `stock_qty` | integer | Current stock |
| `price` | numeric | Absolute price for this SKU |
| `active` | boolean | |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | |

### addresses

| Column | Type | Notes |
|---|---|---|
| `id` | uuid (PK) | |
| `user_id` | uuid (FK) | → profiles.id |
| `label` | text | e.g. "Home", "Work" |
| `full_address` | text | |
| `phone` | text | |
| `is_default` | boolean | One default per user |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | |

### carts

| Column | Type | Notes |
|---|---|---|
| `id` | uuid (PK) | |
| `user_id` | uuid (FK) | → profiles.id |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | |

### cart_items

| Column | Type | Notes |
|---|---|---|
| `id` | uuid (PK) | |
| `cart_id` | uuid (FK) | → carts.id |
| `variant_id` | uuid (FK) | → product_variants.id |
| `qty` | integer | |

### wishlist

| Column | Type | Notes |
|---|---|---|
| `id` | uuid (PK) | |
| `user_id` | uuid (FK) | → profiles.id |
| `product_id` | uuid (FK) | → products.id |
| `created_at` | timestamptz | |

**Constraint:** UNIQUE (`user_id`, `product_id`)

### orders

| Column | Type | Notes |
|---|---|---|
| `id` | uuid (PK) | |
| `order_number` | text | Unique, indexed. Format: `ORD-YYYYMMDD-NNNN` |
| `user_id` | uuid (FK, nullable) | → profiles.id; null for guest orders |
| `customer_name` | text | |
| `phone` | text | |
| `guest_email` | text (nullable) | |
| `address` | text | |
| `notes` | text | |
| `fulfillment_type` | enum | `delivery` \| `pickup` |
| `delivery_zone` | enum (nullable) | `inside_dhaka` \| `outside_dhaka`; null when fulfillment is pickup |
| `subtotal` | numeric | |
| `delivery_fee` | numeric | ৳70 inside Dhaka, ৳120 outside Dhaka, 0 for pickup |
| `total` | numeric | |
| `status` | enum | See order workflow in [PRD](./prd.md) |
| `created_at` | timestamptz | |
| `updated_at` | timestamptz | |

### order_items

Snapshot of purchased items at time of order.

| Column | Type | Notes |
|---|---|---|
| `id` | uuid (PK) | |
| `order_id` | uuid (FK) | → orders.id |
| `product_id` | uuid (FK) | → products.id |
| `variant_id` | uuid (FK) | → product_variants.id |
| `qty` | integer | |
| `price_at_purchase` | numeric | Price snapshot |
| `product_name` | text | Name snapshot |

### order_status_history

| Column | Type | Notes |
|---|---|---|
| `id` | uuid (PK) | |
| `order_id` | uuid (FK) | → orders.id |
| `status` | enum | Status at time of change |
| `changed_by` | uuid (FK) | → profiles.id |
| `changed_at` | timestamptz | |

## 3. Indexes

Create upfront:

| Table | Column(s) | Purpose |
|---|---|---|
| `orders` | `order_number` | Guest lookup, admin search |
| `orders` | `status` | Filter by status |
| `products` | `category_id` | Category filtering |
| `products` | `active` | Storefront queries |
| `product_variants` | `product_id` | Variant lookups |

## 4. Row-Level Security (RLS) Policies

### products / categories

| Operation | Rule |
|---|---|
| SELECT | Public (active products only for storefront) |
| INSERT/UPDATE/DELETE | `staff` or `admin` role |

### orders

| Operation | Rule |
|---|---|
| SELECT (customer) | Own orders (`user_id` match) |
| SELECT (staff/admin) | All orders |
| INSERT | Server action only (service role or validated insert) |
| UPDATE | `staff` or `admin` role |
| Guest lookup | Server action only (order_number + phone match) |

### profiles

| Operation | Rule |
|---|---|
| SELECT/UPDATE | Own profile |
| Role management | `admin` only |

### carts / cart_items / wishlist / addresses

| Operation | Rule |
|---|---|
| All | Own data only (`user_id` match) |

## 5. Inventory Rules

| Scenario | Rule |
|---|---|
| Checkout with insufficient stock | Reject with clear message; do not create order |
| Concurrent orders for last item | DB transaction: `UPDATE ... WHERE stock_qty >= qty`; fail if 0 rows affected |
| Order cancelled | Restock all items in `order_items` |
| Deactivated product | Hidden from storefront; cart shows "unavailable" |
| Made-to-order products | Display lead time on PDP if owner sets it (field TBD) |

No reservation holds for v1 — transactional stock decrement at order creation is sufficient at this order volume.

## 6. Cascade Delete Rules

| Parent deleted | Child behavior |
|---|---|
| `products` | Block if referenced in `order_items`; otherwise CASCADE to `product_images`, `product_options`, `product_option_values`, `product_variants` |
| `product_options` | CASCADE to `product_option_values` |
| `categories` | SET NULL on `products.category_id` (products remain, just uncategorized) |
| `orders` | CASCADE to `order_items`, `order_status_history` |
| `carts` | CASCADE to `cart_items` |
| `profiles` | CASCADE to `addresses`, `carts`, `wishlist`; SET NULL on `orders.user_id` |

> **Tech debt:** `product_variants.option_values` is JSONB with no FK to `product_option_values`. Application-layer Server Actions must validate JSONB values match existing option values on every variant create/update.

## 7. Delivery Zone Configuration

Delivery fees are hardcoded constants in `lib/config/delivery.ts` — no database settings table needed for v1.

| Zone | Fee (BDT) | `delivery_zone` enum value |
|---|---|---|
| Inside Dhaka | 70 | `inside_dhaka` |
| Outside Dhaka | 120 | `outside_dhaka` |
| Pickup | 0 (free) | — (use `fulfillment_type = pickup`) |

## 8. Order Number Generation

Format: `ORD-YYYYMMDD-NNNN`

Example: `ORD-20260703-0042`

- Date prefix for human readability
- Sequential counter per day
- Unique constraint + index on `orders.order_number`

## 9. Migrations

SQL migrations will live in `supabase/migrations/`. Phase 1 creates all tables, indexes, RLS policies, and the first-admin bootstrap script.
