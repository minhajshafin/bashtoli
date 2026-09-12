# Project Handover Document — Bashtoli E-Commerce Platform

**Client / Brand:** Bashtoli (বাশতলি)  
**Project:** Artisanal E-Commerce Web Application  
**Platform Version:** 1.0.0 (Production Release)  
**Completion Date:** September 2026  
**Primary Repository:** `minhajshafin/bashtoli` (Branch: `main`)  
**Production URL:** [https://bashtoli.vercel.app](https://bashtoli.vercel.app) *(Custom domain: `bashtoli.com`)*  

---

## Executive Summary

The **Bashtoli** e-commerce platform has been successfully designed, engineered, tested, and deployed to production. Built specifically for an artisanal Bangladeshi brand specializing in handcrafted bamboo crafts, home decor, eco-friendly lifestyle goods, and customized stationery, the application provides an enterprise-grade, high-performance shopping experience tailored for the local market.

### Key Architectural Highlights
- **Modern Next.js 16 Framework**: Leverages Turbopack, React Server Components (RSC), Server Actions, and Partial Prerendering (PPR) for lightning-fast edge performance.
- **Cash-on-Delivery (COD) First**: Seamless guest and registered customer checkout with district-aware delivery pricing (৳70 Inside Dhaka, ৳120 Outside Dhaka, ৳0 Free Pickup) and automated order number formatting (`ORD-YYYYMMDD-NNNN`).
- **Atomic Stock Management**: Zero-risk inventory management powered by PostgreSQL database-level transactional stored procedures (`place_order` and `increment_stock`) with immediate Next.js cache revalidation.
- **Robust Security & Bot Defense**: Upstash Redis serverless sliding-window rate limiters (`rl:auth`, `rl:order`, `rl:checkout`), hidden honeypot spam traps on suggestion forms, and Row Level Security (RLS) across all 16 database tables.
- **Storefront Merchandising CMS**: Zero-code visual management for store operators, including a dynamic Hero Carousel manager and a curated 7-slot homepage Category Collage grid.

---

## 1. Production Services & Infrastructure Matrix

The production application relies on managed, serverless cloud services configured for high availability, zero server maintenance, and optimal latency for users in Bangladesh.

| Service | Provider | Purpose | Region / Tier | Production Identifier / Dashboard |
|---|---|---|---|---|
| **Hosting & CDN** | Vercel | Next.js compute, Edge CDN, SSL, & Analytics | `sin1` (Singapore) / Pro | Project: `bashtoli` |
| **Database & Auth** | Supabase | PostgreSQL 15, Auth engine, & Storage buckets | `ap-southeast-1` (Singapore) | Project ID: `ephzabuabxvjlueshjuc` |
| **Object Storage** | Supabase Storage | Product photos (`product-images`) & Category covers (`category-covers`) | Public read / Authenticated write | Max 5MB per upload |
| **Rate Limiter** | Upstash Redis | Sliding-window DDoS and abuse protection | Singapore Serverless | Database: `bashtoli-ratelimit` |
| **Transactional Email**| Resend | Order confirmation & admin notification emails | Global / Verified Domain | Sender: `orders@bashtoli.com` |
| **Real User Metrics** | @vercel/analytics | Core Web Vitals (LCP, INP, CLS) & visitor traffic | Privacy-preserving (Zero PII) | Vercel Analytics tab |

---

## 2. Environment Variables & Secret Configuration

All production secrets are securely managed in the **Vercel Project Settings → Environment Variables** console. 

> [!CAUTION]
> Never commit actual API keys or secrets to Git. Maintain `.env.local` strictly on secure local machines.

| Variable Name | Environment | Purpose | Security Level |
|---|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | Production & Preview | Base URL for auth redirects, canonical tags, and OpenGraph metadata (`https://bashtoli.com` or `https://bashtoli.vercel.app`). | Public |
| `NEXT_PUBLIC_SUPABASE_URL` | All Environments | Supabase project API endpoint (`https://ephzabuabxvjlueshjuc.supabase.co`). | Public |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | All Environments | Client-side public key restricted by Row-Level Security (RLS) policies. | Public |
| `SUPABASE_SERVICE_ROLE_KEY` | Production Server-Only | Elevated service key for admin backend operations (role verification, system triggers). Never exposed to browser bundles. | **Strictly Confidential** |
| `RESEND_API_KEY` | Production Server-Only | API key used by Next.js Server Actions to dispatch transactional emails via Resend. | **Strictly Confidential** |
| `UPSTASH_REDIS_REST_URL` | Production Server-Only | Upstash Redis REST connection endpoint for sliding-window rate limiters. | Private |
| `UPSTASH_REDIS_REST_TOKEN` | Production Server-Only | Upstash Redis REST access token. | **Strictly Confidential** |
| `ADMIN_NOTIFICATION_EMAIL` | Production Server-Only | Destination email address where new order notices and customer item suggestions are sent. | Private |
| `SUGGESTION_RECIPIENT_EMAIL` | Production Server-Only | Optional fallback inbox for customer artisan suggestions. | Private |

---

## 3. Database Architecture & Schema Baseline

The database schema has been consolidated into **6 clean, idempotent migrations** located in [`supabase/migrations/`](../supabase/migrations/):

1. **`001_types_and_extensions.sql`**: Configures PostgreSQL extensions (`uuid-ossp`, `pgcrypto`), application enums (`order_status`, `user_role`, `delivery_zone`, `fulfillment_type`), and isolates security functions within the private `app_private` schema.
2. **`002_core_tables.sql`**: Defines all 16 core tables:
   - `profiles`, `user_roles`, `admin_audit_log`
   - `categories`, `products`, `product_variants`, `product_images`
   - `orders`, `order_items`, `addresses`, `wishlist`, `cart_items`
   - `hero_slides`, `category_collage_slots`, `customer_suggestions`, `rate_limit_events`
3. **`003_indexes.sql`**: Optimized B-Tree and partial indexes for high-frequency queries (storefront catalog filtering, order number lookups, customer account history, and low-stock alerts).
4. **`004_functions_and_triggers.sql`**:
   - `generate_order_number()`: Thread-safe sequential daily order counter (`ORD-YYYYMMDD-NNNN`).
   - `place_order()`: Atomic RPC that verifies stock, calculates subtotal and shipping, reserves inventory, and writes order items in a single transaction.
   - `increment_stock()`: Atomic inventory restitution triggered automatically when orders are cancelled.
   - `link_guest_orders()`: Claims historical guest orders and links them to newly registered customer accounts.
5. **`005_row_level_security.sql`**: Hardened, non-circular Row Level Security policies protecting customer data while granting authorized staff/admin operations.
6. **`006_storage.sql`**: Storage bucket definitions, MIME type restrictions, and access policies for `product-images` and `category-covers`.

---

## 4. Core Business Workflows

### 4.1. Product & Inventory Management
- **Multi-Variant Capabilities**: Products support multi-dimensional variants (e.g. Size, Color, Finish, Material) with independent SKUs, prices, and stock quantities.
- **Stock Decrement & Restock**:
  - When an order is placed, stock decrements atomically in PostgreSQL.
  - When an order is marked `cancelled` (either by customer within 24h or by staff in `/admin`), stock is immediately restored.
  - Next.js cache tags (`products`, `featured-products`, `categories`) and route paths are immediately purged on write, ensuring real-time stock accuracy on the live storefront.
- **Image Optimization**: Drag-and-drop gallery with primary cover designation, automatic aspect ratio preservation, and 2MB file limit safeguards.

### 4.2. Cash on Delivery (COD) Checkout
- **Guest Checkout**: Customers can order instantly without creating an account. Only name, valid 11-digit Bangladeshi mobile number (`01XXXXXXXXX`), delivery zone, and shipping address are required.
- **Delivery Zone Logistics**:
  - **Inside Dhaka**: Flat ৳70.
  - **Outside Dhaka**: Flat ৳120 across all 64 districts.
  - **Pickup**: ৳0 (Free).
- **Fraud & Spam Mitigation**: Rate-limited at 5 orders per 60 seconds per IP via Upstash Redis (`rl:checkout`).

### 4.3. Customer Accounts & Order Claiming
- Customers can sign up anytime using email verification.
- **Guest Order Claiming**: If a customer registers with the same phone or email previously used for guest checkouts, the system displays an automatic banner on `/account/orders` allowing them to securely link and claim their past order history with a single click.
- **Customer Wishlist & Saved Addresses**: Cloud-synced wishlist and address book for repeat checkout convenience.

### 4.4. Visual Storefront Merchandising
- **Hero Carousel Manager** (`/admin/storefront`): Manage banner artwork, headline text, seasonal badges (e.g. *"New Collection"*), and call-to-action buttons without developer assistance.
- **Category Collage Manager** (`/admin/storefront`): Curate the prominent 7-slot visual homepage grid, reorder slots, and upload dedicated high-resolution cover photos.

### 4.5. Staff & Administrative Governance
- **Role Hierarchy**:
  - **`customer`**: Standard public account; can manage profile, orders, addresses, and wishlist.
  - **`staff`**: Operational staff; can manage products, upload images, fulfill orders, and update order statuses.
  - **`admin`**: Store owner; full access including managing staff roles, system settings, and viewing immutable audit trails (`/admin/staff`).
- **Audit Logging**: Every role promotion or demotion is permanently logged in `admin_audit_log`.

---

## 5. Quality Assurance & Verification Benchmarks

The application meets strict production quality standards verified through automated test suites and live smoke testing:

| Verification Suite | Command | Scope | Result |
|---|---|---|:---:|
| **Unit & Integration Tests** | `npm test` | 15 test suites covering validation, checkout, auth, stock, and UI constraints | **108 / 108 Passed** |
| **End-to-End Tests** | `npm run test:e2e` | 8 complete Playwright browser journeys (Checkout, Admin, Claim, Wishlist, CMS) | **8 / 8 Passed** |
| **Static Code Analysis** | `npm run lint` | ESLint rules across all TypeScript and React components | **0 Errors, 0 Warnings** |
| **Type Integrity** | `npx tsc --noEmit` | Strict TypeScript compiler check | **Clean (0 Errors)** |
| **Production Build** | `npm run build` | Next.js 16 Partial Prerendering compilation across all 54 routes | **Successful** |

---

## 6. Store Operations & Incident Runbook

Detailed operational guides and emergency recovery procedures are documented in [`docs/admin-guide.md`](./admin-guide.md). Below is a summary of key operational scenarios:

### Scenario 1: Order Cancellation & Stock Restocking
- Customers may self-cancel an order strictly while it is in `pending` status within 24 hours of placement.
- Staff can cancel any order at any stage prior to delivery from `/admin/orders/[id]`.
- **Outcome**: The cancellation automatically triggers `increment_stock()` in the database and clears Next.js product caches.

### Scenario 2: Physical Stock Discrepancy (Emergency Override)
If warehouse stock is lower than displayed online:
1. Navigate to `/admin/products/[id]`.
2. Update the variant row with the true physical quantity.
3. Click **Save Product Changes**. The storefront immediately updates; if set to `0`, the variant will show *"Sold Out"* and prevent purchases.

### Scenario 3: Courier Cash Reconciliation
1. At the end of each courier settlement cycle, download the courier statement (Steadfast, Pathao, RedX).
2. Filter `/admin/orders` by status `delivered`.
3. Match the collected amount: `Item Subtotal + Delivery Fee (৳70 or ৳120)`.
4. If a package was rejected at the customer's door, mark the order as `cancelled` once the package physically returns to the warehouse to restore inventory.

### Scenario 4: Rate Limit False-Positive Recovery
If a customer reports receiving an HTTP 429 ("Too Many Requests") error:
1. Advise the customer to wait 60 seconds.
2. In an emergency, an administrator can open the Upstash Redis console and clear keys matching `rl:order:<IP>` or `rl:checkout:<IP>`.
3. If Redis experiences an outage, the system's **fail-open** resilience ensures legitimate customer checkouts continue uninterrupted.

---

## 7. Handover Checklist & Sign-Off

- [x] **Source Code**: Fully pushed and synchronized to GitHub `main` branch.
- [x] **Production Deployment**: Live and functional on Vercel (`https://bashtoli.vercel.app`).
- [x] **Database & Migrations**: Consolidated 001–006 migrations applied to production Supabase.
- [x] **Initial Admin User**: Store owner account bootstrapped with `admin` privileges.
- [x] **Rate Limiting**: Upstash Redis sliding-window active with fail-open safety.
- [x] **Transactional Emails**: Resend operational for customer and admin notifications.
- [x] **Operations Guide**: Complete operational manual delivered in [`docs/admin-guide.md`](./admin-guide.md).
- [x] **Incident Runbook**: Emergency recovery procedures documented and verified.
- [x] **Automated Tests**: 108 unit tests and 8 E2E journeys passing.
- [x] **Technical Documentation**: Architecture, Database, Deployment, and Handover guides published in `docs/`.

---

## 8. Ongoing Maintenance & Support Contacts

### Maintenance Recommendations
- **Weekly**: Check `/admin` for low-stock variant alerts and reconcile completed COD orders.
- **Monthly**: Review Vercel Web Analytics for Core Web Vitals performance and inspect Supabase database storage growth.
- **Quarterly**: Run `npm audit` to check for dependency updates and review staff access privileges.

### Support & Escalation
- **Primary Technical Escalation**: Engineering Team / Repository Maintainer
- **Hosting Support**: [Vercel Help Center](https://vercel.com/help)
- **Database & Auth Support**: [Supabase Support Portal](https://supabase.com/dashboard/support/new)
- **Transactional Email Support**: [Resend Documentation](https://resend.com/docs)
