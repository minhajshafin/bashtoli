# Architecture

## 1. High-Level Overview

Bashtoli is a monolithic Next.js application (App Router) serving both the customer storefront and the admin dashboard from a single codebase. Supabase provides Postgres, authentication, and file storage. External services handle email (Resend) and error monitoring (Sentry).

```
┌─────────────────────────────────────────────────────────────┐
│                        Vercel (Hosting)                      │
│  ┌───────────────────────────────────────────────────────┐  │
│  │              Next.js App (App Router)                  │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌───────────────┐  │  │
│  │  │ Storefront  │  │   Admin     │  │ Server Actions│  │  │
│  │  │  (public)   │  │  /admin/*   │  │ Route Handlers│  │  │
│  │  └─────────────┘  └─────────────┘  └───────────────┘  │  │
│  │         │                 │                  │           │  │
│  │  ┌──────┴─────────────────┴──────────────────┘         │  │
│  │  │ Middleware (auth + role guard for /admin/*)         │  │
│  │  └─────────────────────────────────────────────────────┘  │
│  └───────────────────────────────────────────────────────┘  │
└──────────────────────────┬──────────────────────────────────┘
                           │
         ┌─────────────────┼─────────────────┐
         ▼                 ▼                 ▼
   ┌───────────┐    ┌────────────┐    ┌───────────┐
   │ Supabase  │    │  Supabase  │    │   Resend  │
   │ Postgres  │    │  Storage   │    │  (Email)  │
   │ + Auth    │    │  (Images)  │    └───────────┘
   └───────────┘    └────────────┘
         │
   ┌───────────┐
   │  Sentry   │
   │ (Errors)  │
   └───────────┘
```

## 2. Application Layers

| Layer | Responsibility |
|---|---|
| **Pages (App Router)** | Server-rendered storefront and admin UI |
| **Server Actions / Route Handlers** | Mutations, checkout, guest order lookup — all validated with Zod |
| **Middleware** | Session check + role guard on `/admin/*` routes |
| **Supabase Client** | Browser client for auth; server client with service role for privileged ops |
| **RLS (Postgres)** | Row-level security enforces data access at the database layer |

## 3. Route Structure (Planned)

### Storefront (public)

| Route | Purpose |
|---|---|
| `/` | Home page |
| `/about` | About page |
| `/contact` | Contact page (phone, WhatsApp, hours, map) |
| `/products` | Product listing with category filters |
| `/products/[slug]` | Product detail page (PDP) |
| `/cart` | Shopping cart |
| `/checkout` | COD checkout form |
| `/order/[orderNumber]` | Order confirmation + guest lookup |
| `/account` | Customer account dashboard |
| `/account/orders` | Order history |
| `/account/addresses` | Saved addresses |
| `/account/wishlist` | Wishlist (account-only) |
| `/login`, `/signup` | Auth pages |

### Admin (protected)

| Route | Purpose |
|---|---|
| `/admin` | Dashboard home (today's orders, pending count, low-stock) |
| `/admin/products` | Product list + CRUD |
| `/admin/products/[id]` | Product edit (variants, images) |
| `/admin/categories` | Category management |
| `/admin/orders` | Order list + status updates |
| `/admin/orders/[id]` | Order detail |
| `/admin/staff` | Staff role management (admin only) |

## 4. Authentication & Authorization

### Auth Provider

Supabase Auth manages `auth.users`. A `profiles` table extends user data with role and display fields.

### Roles

| Role | Access |
|---|---|
| `customer` | Storefront, own orders/addresses/wishlist |
| `staff` | Admin dashboard: products, inventory, orders |
| `admin` | Full access including staff management |

### Authorization Flow

1. User authenticates via Supabase Auth (email/password)
2. Middleware reads session on every request
3. `/admin/*` routes require `staff` or `admin` role (checked in middleware + RLS)
4. Database RLS policies enforce read/write rules independently of application code

### Guest Access

- No auth required for browsing, cart (localStorage), or checkout
- Guest order lookup via server action: order number + phone match

## 5. Cart Architecture

```
Guest                          Logged-in
  │                               │
  ▼                               ▼
localStorage              Supabase carts
(cart items JSON)         + cart_items table
  │                               │
  └──────── On login ─────────────┘
              │
         Merge strategy:
         - Keep higher qty on conflict
         - Drop unavailable/deactivated items
         - Persist merged cart to DB
```

## 6. Checkout Flow

```
Cart → Validate stock (server) → Create order (transaction)
                                        │
                    ┌───────────────────┼───────────────────┐
                    ▼                   ▼                   ▼
              Decrement stock    Generate order_number   Send emails
              (WHERE stock >= qty)  (ORD-YYYYMMDD-NNNN)  (Resend)
                    │
                    ▼
              Order confirmation page
              + WhatsApp deep link
```

Stock decrement uses a DB transaction: `UPDATE ... WHERE stock_qty >= qty`; fails if 0 rows affected (handles concurrent orders).

## 7. Order Status State Machine

```
                    ┌──────────┐
                    │ pending  │
                    └────┬─────┘
                         │
              ┌──────────┼──────────┐
              ▼                     ▼
        ┌───────────┐         ┌───────────┐
        │ confirmed │         │ cancelled │ → restock items
        └─────┬─────┘         └───────────┘
              │
              ▼
        ┌───────────┐
        │  shipped  │
        └─────┬─────┘
              │
              ▼ (optional)
   ┌────────────────────┐
   │ out_for_delivery   │
   └─────────┬──────────┘
             │
             ▼
        ┌───────────┐
        │ delivered │
        └───────────┘
```

## 8. File Storage

- Product images stored in Supabase Storage
- Recommended: 1200×1200, WebP/JPEG, max 2 MB per image
- URLs stored in `product_images` table with sort order for gallery

## 9. Email Integration

| Trigger | Recipient | Content |
|---|---|---|
| Order created | Owner/staff | New order alert |
| Order created | Customer (if email provided) | Order confirmation |

Dev: Resend test mode or mail catcher.

## 10. Security Principles

- Service role key used only in server-side code; never in client bundle
- All mutations validated with Zod on the server
- RLS policies as the authoritative access control layer
- Rate limiting on checkout and guest order lookup (recommended)
- Admin routes protected by middleware + RLS (defense in depth)

## 11. SEO Architecture

- Dynamic metadata (`title`, `description`, Open Graph) on product pages
- JSON-LD `Product` schema on PDP
- `robots.txt` + sitemap via Next.js `sitemap.ts`
- Image optimization via Next.js `<Image>` component

## 12. Observability

- **Sentry** on Next.js for error monitoring (set up before launch)
- **Playwright** E2E tests for happy-path checkout (starting Phase 4)

## 13. Planned Directory Structure

```
bashtoli/
├── app/
│   ├── (storefront)/       # Public pages
│   ├── admin/              # Admin dashboard
│   ├── api/                # Route handlers (if needed)
│   └── layout.tsx
├── components/
│   ├── storefront/
│   ├── admin/
│   └── ui/
├── lib/
│   ├── supabase/           # Client helpers
│   ├── validations/        # Zod schemas
│   └── utils/
├── supabase/
│   └── migrations/         # SQL migrations
├── tests/
│   └── e2e/                # Playwright tests
├── docs/
└── tasks/
```
