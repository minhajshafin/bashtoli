# Architecture

## 1. High-Level Overview

Bashtoli is a monolithic Next.js application (App Router) serving both the customer storefront and the administrative dashboard from a unified codebase. Supabase provides managed PostgreSQL, authentication, and file storage. Upstash Redis handles distributed edge rate limiting. Resend manages transactional email communications. Observability is powered by native Vercel Runtime Logging and `@vercel/analytics`.

```
┌────────────────────────────────────────────────────────────────────────┐
│                          Vercel (Edge & Hosting)                       │
│  ┌──────────────────────────────────────────────────────────────────┐  │
│  │                     Next.js App Router (16+)                     │  │
│  │  ┌──────────────┐  ┌───────────────┐  ┌───────────────────────┐  │  │
│  │  │  Storefront  │  │  Admin Panel  │  │ Server Actions / RPCs │  │  │
│  │  │   (Public)   │  │  (/admin/*)   │  │   (Zod-Validated)     │  │  │
│  │  └──────────────┘  └───────────────┘  └───────────────────────┘  │  │
│  │         │                  │                      │              │  │
│  │  ┌──────┴──────────────────┴──────────────────────┴───────────┐  │  │
│  │  │        Next.js Middleware (Session & Role Verification)    │  │  │
│  │  └────────────────────────────────────────────────────────────┘  │  │
│  └─────────────────────────────────┬────────────────────────────────┘  │
└────────────────────────────────────┼───────────────────────────────────┘
                                     │
         ┌───────────────────────────┼──────────────────────────┐
         ▼                           ▼                          ▼
   ┌───────────┐               ┌───────────┐              ┌───────────┐
   │ Supabase  │               │  Upstash  │              │  Resend   │
   │ Postgres, │               │ Serverless│              │  (Email   │
   │ Auth, &   │               │   Redis   │              │ Delivery) │
   │ Storage   │               │(RateLimit)│              └───────────┘
   └───────────┘               └───────────┘
         │                           │
         ▼                           ▼
   ┌───────────────────────────────────────┐
   │     Vercel Observability Suite        │
   │ (@vercel/analytics + Runtime Logging) │
   └───────────────────────────────────────┘
```

---

## 2. Application Layers

| Layer | Technology | Primary Responsibilities |
|---|---|---|
| **Presentation (Pages & Layouts)** | Next.js Server & Client Components | Renders responsive storefront, category grids, dynamic hero carousel, cart drawers, and administrative management dashboards. |
| **Mutation & Business Logic** | Next.js Server Actions | Encapsulates all state mutations (order creation, catalog editing, customer profile updates) backed by strict Zod schema validation. |
| **Route Protection & Security** | Next.js Middleware | Intercepts requests to enforce session validity, inspect customer roles, and guard `/admin/*` routes from unauthorized access. |
| **Distributed Rate Limiting** | Upstash Redis (`@upstash/ratelimit`) | Enforces sliding-window request limits on authentication (`rl:auth`), order placement (`rl:order`), and checkout validation (`rl:checkout`). Operates with fail-open fault tolerance. |
| **Data & Storage Access** | Supabase JavaScript SDK | Interacts with Supabase Auth, PostgreSQL tables, and the `product-images` storage bucket using cookie-based authentication headers. |
| **Database Security & Procedures** | PostgreSQL (Supabase) | Authoritative security via Row-Level Security (RLS), isolated `app_private` role helpers, and atomic transactional RPCs (`place_order`, `increment_stock`, `claim_guest_orders`). |

---

## 3. Route Structure

### Storefront (Public & Customer Account)

| Route | Access | Purpose |
|---|---|---|
| `/` | Public | Homepage with dynamic hero carousel, 7-slot category collage, and featured items |
| `/products` | Public | Catalog browsing with category filtering, search, and sorting |
| `/products/[slug]` | Public | Product detail page (PDP) with multi-variant selectors, gallery, and stock indicator |
| `/bag` / `/cart` | Public | Shopping bag overview with quantity modification and checkout launch |
| `/checkout` | Public | Cash-on-Delivery (COD) checkout form (pre-filled for authenticated customers) |
| `/order/[orderNumber]` | Public | Order confirmation page with human-readable order number and WhatsApp deep link |
| `/order/lookup` | Public | Self-service guest order status lookup (Order Number + Phone Number) |
| `/account` | Authenticated | Customer account dashboard overview |
| `/account/orders` | Authenticated | Order history and real-time unclaimed guest order detection / linking prompt |
| `/account/addresses` | Authenticated | Saved shipping address management |
| `/account/wishlist` | Authenticated | Saved customer wishlist items (persisted across devices) |
| `/account/profile` | Authenticated | Personal details, phone verification, and password change |
| `/login`, `/signup` | Public | Customer authentication forms |
| `/privacy`, `/terms` | Public | Store policies and customer terms |

### Admin Dashboard (Protected: `staff` or `admin` role)

| Route | Allowed Roles | Purpose |
|---|---|---|
| `/admin` | Staff, Admin | Dashboard metrics: today's orders, revenue, pending queue, low-stock warnings |
| `/admin/orders` | Staff, Admin | Order fulfillment list, status filtering, and search |
| `/admin/orders/[id]` | Staff, Admin | Detailed order view, line items, customer notes, and status transitions |
| `/admin/products` | Staff, Admin | Catalog product management and search |
| `/admin/products/new` | Staff, Admin | Multi-step product creation with image uploads and variant generation |
| `/admin/products/[id]` | Staff, Admin | Product, image gallery, and SKU variant inventory editing |
| `/admin/categories` | Staff, Admin | Category creation, slug assignment, and display ordering |
| `/admin/storefront` | Staff, Admin | Visual merchandising: Hero carousel management and 7-slot category collage grid |
| `/admin/staff` | Admin only | Staff account invitations, role toggles, and immutable audit trail inspection |

---

## 4. Authentication & Authorization

### Auth Provider
Supabase Auth manages user credentials in `auth.users`. An automatic database trigger (`trg_on_auth_user_created`) provisions a matching record in `public.profiles` with `role = 'customer'`.

### Role Hierarchy
- **`customer`**: Can browse, order, save addresses, maintain a persistent wishlist, and view personal order history.
- **`staff`**: Can access `/admin/*` to manage catalog products, variant stock, order fulfillment, and storefront visual merchandising.
- **`admin`**: Full system access, including staff role elevation/demotion and audit log inspection.

### Security Isolation (`app_private`)
To prevent unauthorized users from executing internal role check functions over PostgREST API endpoints, functions `is_admin()` and `is_staff_or_admin()` reside in an isolated schema: `app_private`. PostgreSQL's RLS engine accesses this schema internally, while PostgREST hides it from public API reflection.

---

## 5. Cart Architecture

```
Guest (Unauthenticated)                     Customer (Authenticated)
         │                                              │
         ▼                                              ▼
    localStorage                                  Supabase Tables
 (JSON serialized items)                    (carts + cart_items via RLS)
         │                                              │
         └───────────── On Customer Sign-In ────────────┘
                                │
                         Merge Strategy:
                         1. Max quantity resolution on duplicate variants
                         2. Deactivated or out-of-stock items pruned
                         3. Atomically written to DB via cart_add_or_increment RPC
```

---

## 6. Atomic Checkout Transaction (`place_order`)

Order placement executes within a single PostgreSQL transaction via the `place_order` stored procedure (restricted to `service_role` execution):

```
1. Delivery Fee Computation:
   - Evaluates fulfillment_type (delivery vs pickup) and delivery_zone (inside_dhaka: ৳70, outside_dhaka: ৳120).
2. Server-Authoritative Pricing:
   - Fetches prices directly from product_variants. Caller-submitted totals are ignored.
3. Advisory Locking:
   - Acquires pg_advisory_xact_lock(YYYYMMDD) to serialize daily order sequence generation (ORD-YYYYMMDD-NNNN).
4. Atomic Stock Decrement:
   - UPDATE product_variants SET stock_qty = stock_qty - qty WHERE id = variant_id AND stock_qty >= qty.
   - If ROW_COUNT == 0, the entire transaction rolls back immediately with INSUFFICIENT_STOCK.
5. Record Insertion:
   - Creates orders row, order_items snapshot, and order_status_history entry.
6. Email Notification (Fire-and-Forget):
   - Dispatches confirmation email to customer (if email provided) and admin notification via Resend.
```

---

## 7. Order Status Lifecycle & Restock Flow

```
pending ──────► confirmed ──────► shipped ──────► out_for_delivery ──────► delivered
   │                │
   ▼                ▼
cancelled       cancelled
   │
   └─► Restocks inventory atomically via increment_stock(variant_id, qty)
```

- **Customer Cancellation**: Permitted exclusively while order is in `pending` status and within 24 hours of placement.
- **Staff Cancellation**: Permitted at any non-final status (`pending`, `confirmed`, `shipped`, `out_for_delivery`).
- **Restocking**: Cancellation invokes the atomic `increment_stock` RPC to restore inventory without race conditions.

---

## 8. Distributed Rate Limiting

Rate limiting is orchestrated via `@upstash/ratelimit` on server action invocations:

| Rate Limiter | Scope | Limit | Window | Action on Limit Exceeded |
|---|---|---|---|---|
| `authLimiter` | `rl:auth:<ip>` | 5 requests | 60 seconds | Blocks brute-force login/signup with user-friendly retry message |
| `orderLimiter` | `rl:order:<ip>` | 5 orders | 10 minutes | Blocks automated checkout spam |
| `checkoutLimiter` | `rl:checkout:<ip>` | 15 attempts | 60 seconds | Protects order validation and pricing calculations |

**Fail-Open Guarantee**: If the Redis cluster is unreachable or unconfigured, rate limiters gracefully log a warning and allow legitimate customer traffic to proceed uninterrupted.

---

## 9. Observability & Logging

- **Vercel Analytics**: Client-side Web Vitals (LCP, INP, CLS) and page view analytics without tracking cookies or GDPR banners.
- **Runtime Logging**: Structured Next.js server logs for order placement, Resend email status, and background tasks.
- **Playwright Regression Suite**: 8 automated end-to-end tests validating guest checkout, admin fulfillment, guest claiming, suggestions, and visual CMS.

---

## 10. Repository Directory Structure

```
bashtoli/
├── app/                        # Next.js App Router routes & layouts
│   ├── (storefront)/           # Public storefront pages
│   ├── account/                # Customer account pages
│   ├── admin/                  # Protected administrative dashboard
│   ├── api/                    # System route handlers
│   └── layout.tsx              # Root HTML layout & fonts
├── components/                 # React UI components
│   ├── admin/                  # Admin-specific management controls
│   ├── storefront/             # Storefront header, footer, carousel, collage
│   └── ui/                     # Reusable design system primitives
├── lib/                        # Shared utility libraries
│   ├── actions/                # Next.js Server Actions (mutations)
│   ├── config/                 # Delivery fees & application constants
│   ├── email/                  # Resend templates and mail dispatchers
│   ├── queries/                # Database query helpers
│   ├── rate-limit.ts           # Upstash Redis rate limiting cluster
│   ├── supabase/               # Client, server, and admin Supabase instances
│   └── validations/            # Zod validation schemas
├── supabase/                   # Database configuration
│   ├── migrations/             # 6 consolidated production SQL migrations
│   └── scripts/                # Master schema and admin bootstrap scripts
├── tests/                      # Automated test suites
│   ├── e2e/                    # Playwright integration test specs
│   └── unit/                   # Vitest unit test suites
└── docs/                       # Permanent technical & operational documentation
```

> [!NOTE]
> The root `tasks/` directory contains internal phase-by-phase implementation sprint tracking used during development and will be removed upon final handover to the client.
