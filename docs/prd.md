# Product Requirements Document (PRD)

## 1. Overview

| Field | Value |
|---|---|
| **Project** | Bashtoli E-Commerce |
| **Client** | Local business selling handcrafted items, mugs, hats, and similar products |
| **Goal** | Customer-facing storefront + owner/staff inventory and order management |
| **Timeline** | 12 weeks (3 months) |
| **Dev tool** | Cursor |

## 2. Scope

- Catalog size: <100 products (small scale)
- Order volume: Few orders/week
- Payment: Cash on Delivery (COD) / manual only — no online payment gateway
- Guest checkout allowed; customer accounts optional but incentivized
- **Variants (v1):** One sellable SKU per variant combination (e.g. "Red / Large" has its own stock and price). Products with only one option dimension (size OR color) are supported at launch; multi-option products (size AND color) use the full SKU model
- **Content pages:** Home, About, Contact (phone, WhatsApp link, hours, location/map)
- **Fulfillment:** Delivery and/or pickup — fee logic and service area to be confirmed with owner (columns reserved in schema from day one)

## 3. Customer-Facing Storefront

- Browse products by category (handcrafts, mugs, hats, etc.)
- Product detail page: multiple images (gallery), description, price, variants (e.g. size/color), stock availability
- Add to cart (guest-accessible, no login required)
- Cart supports multiple items and quantities
- Checkout: COD form (name, phone, email optional, address, notes, fulfillment type)
  - Pre-filled automatically for logged-in users with saved address
  - Delivery fee applied based on owner-configured rules (flat fee or zone-based — TBD)
- Order confirmation page shows human-readable **order number** (e.g. `ORD-20260703-0042`)
- Order confirmation emailed when email is provided (guest or account)
- WhatsApp deep link on confirmation page ("Message us about your order")
- Static pages: Home, About, Contact

## 4. Customer Accounts

- Sign up / log in (Supabase Auth)
- Save address(es) to skip re-entering checkout form; one address marked as default
- Wishlist / save-for-later (account-only, not visible to guests)
- Order history (linked orders by `user_id`)

## 5. Guest Experience

- Full cart and checkout functionality without an account
- No wishlist access
- **Guest order lookup:** order number + phone → current status (no account required)

## 6. Cart Rules

| Context | Storage | Behavior |
|---|---|---|
| Guest | `localStorage` | Persists across sessions on same browser |
| Logged-in | DB (`carts` + `cart_items`) | Synced server-side |
| On login | Merge guest → account | Keep higher quantity on conflict; drop unavailable or deactivated items |
| On logout | Keep `localStorage` cart | Guest cart remains usable without re-adding items |
| Deactivated product in cart | Show "unavailable" | Block checkout until item removed |

## 7. Admin / Staff Dashboard

Split into two delivery slices: **Admin MVP** (early — feeds storefront development) and **Admin Ops** (late — depends on checkout).

### Admin MVP (weeks 2–3)

- Role-based route protection via Next.js middleware + Supabase RLS
- Product CRUD (create, edit, delete, activate/deactivate)
- Category management
- Variant management: one row per sellable SKU with per-SKU stock and absolute price
- Multi-image upload per product (recommended: 1200×1200, WebP/JPEG, max 2 MB per image)
- Clear **draft vs active** toggle in UI

### Admin Ops (weeks 9–10)

- Role-based access:
  - **Admin**: full access, manage staff accounts, all permissions below
  - **Staff**: manage products/inventory, view and update orders
  - **Customer**: no dashboard access
- Inventory tracking — stock auto-decrements on order placement
- Low-stock indicator on dashboard home
- Dashboard home: today's orders, pending order count, low-stock count
- Order management: view orders, update status
- Email notification sent to owner/staff on new order
- Bootstrap first admin via one-time SQL script or Supabase dashboard (Phase 1)

## 8. Order Status Workflow

```
pending → confirmed → shipped → out_for_delivery (optional) → delivered
                ↘ cancelled (restocks items)
```

- `cancelled` restocks all order items automatically
- `out_for_delivery` optional — use if owner delivers locally and wants that step
- Return/refund flow deferred until owner confirms policy (see [Open Items](./open-items.md))

## 9. Notifications

- Email via Resend triggered on order creation:
  - To owner/staff: new order alert
  - To customer: confirmation (when email provided)
- Order confirmation page: WhatsApp deep link for customer follow-up
- **Out of scope for v1 (fast follow-up):** SMS order confirmation via Twilio or local provider

## 10. Non-Functional Requirements

- Mobile-responsive (majority of local customers likely on mobile)
- Fast page loads for product browsing (image optimization via Next.js)
- SEO:
  - Dynamic `title`, `description`, and Open Graph tags on product pages
  - JSON-LD `Product` schema on product detail pages
  - `robots.txt` + sitemap via Next.js `sitemap.ts`
- Secure role-based access via Supabase RLS policies
- All checkout and admin mutations via Server Actions or Route Handlers with Zod validation
- Service role key used only on server; never exposed in client bundle
- Admin routes (`/admin/*`): middleware session + role guard, backed by RLS
- Basic rate limiting on checkout and guest order lookup (optional but recommended)
- Simple enough for the owner/staff (non-technical) to use the admin dashboard

## 11. Out of Scope (v1)

- Online payment gateway integration (card/mobile banking)
- Multi-language support
- Advanced analytics/reporting beyond basic order/stock views on admin dashboard
- SMS notifications (v1.1 fast follow-up)
- Inventory reservation holds
- Bulk product import/export

## 12. Phases & Timeline

| Phase | Weeks | Deliverables |
|---|---|---|
| **1. Setup & schema** | 1–2 | Supabase project, profiles/roles, RLS policy draft, first-admin bootstrap, env setup |
| **2. Admin MVP + catalog** | 2–3 | Product/variant/image CRUD, categories; owner starts entering real products |
| **3. Storefront core** | 4–5 | Product listing, category filters, PDP with variants & image gallery, guest cart |
| **4. Checkout + emails** | 6–7 | COD checkout, order numbers, guest lookup, delivery fee placeholder, Resend, Playwright E2E |
| **5. Customer accounts** | 8 | Signup/login, saved addresses, wishlist, cart merge on login |
| **6. Admin ops** | 9 | Order management, status workflow, low-stock alerts, staff role management |
| **7. Polish & content** | 10–11 | Responsive pass, About/Contact pages, owner finishes catalog, SEO pass, UI polish |
| **8. QA & launch** | 12 | E2E tests, bug fixes, Sentry setup, Vercel deploy, handoff + training |

See [tasks/](../tasks/README.md) for detailed task breakdowns.
