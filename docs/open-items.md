# Decision Log & Open Items

This document tracks technical, operational, and business policy decisions made throughout the project lifecycle, along with deferred features earmarked for post-launch releases (v1.1+).

---

## 1. Resolved Decisions (v1.0 Launch Scope)

All foundational architectural, operational, and policy decisions for the initial production launch have been resolved and implemented in code:

| Decision Area | Status | Final Resolution | Implemented In |
|---|---|---|---|
| **Delivery Fee Calculation** | ✅ Resolved | Zone-based flat rates: **৳70 inside Dhaka**, **৳120 outside Dhaka**. Store pickup is **৳0 (free)**. | `lib/config/delivery.ts`, `004_functions_and_triggers.sql` |
| **Shipping Regions** | ✅ Resolved | Dhaka Metropolitan Area (`inside_dhaka`) and all other Bangladesh districts (`outside_dhaka`). | `checkout.tsx`, `orders` table |
| **Payment Model** | ✅ Resolved | **Cash on Delivery (COD)** exclusively for v1. Customers pay courier upon parcel inspection. | `checkout` flow, PRD |
| **Customer Cancellation Window** | ✅ Resolved | Customers can cancel strictly within **24 hours** of order placement and only while status is **`pending`**. Enforced by database RLS. | `005_row_level_security.sql`, `orders.ts` |
| **Staff Access & Roles** | ✅ Resolved | Three-tier hierarchy (`customer`, `staff`, `admin`). Staff manage catalog and fulfillment; Admin manages staff accounts and audit logs. | `app_private` schema, `/admin/staff` |
| **Image Storage Strategy** | ✅ Resolved | Single public Supabase storage bucket (`product-images`). File metadata listing restricted to authenticated staff/admins to prevent scraping. | `006_storage.sql` |
| **Slug Generation** | ✅ Resolved | Automatic kebab-case slugification with server-side validation and database UNIQUE constraint. | `lib/validations/product.ts` |
| **Storefront Visual Merchandising** | ✅ Resolved | Database-backed dynamic **Hero Carousel** and **7-slot Category Collage Grid** managed via `/admin/storefront`. | `components/admin/storefront-cms.tsx` |
| **Customer Suggestions** | ✅ Resolved | Modal suggestion submission with silent honeypot anti-spam trap and Resend email delivery. | `lib/actions/suggestions.ts` |
| **Rate Limiting Architecture** | ✅ Resolved | Serverless sliding-window rate limiting via **Upstash Redis** (`rl:auth`, `rl:order`, `rl:checkout`) with fail-open fault tolerance. | `lib/rate-limit.ts` |
| **Observability Strategy** | ✅ Resolved | Zero-dependency `@vercel/analytics` for Core Web Vitals and Vercel edge runtime logging for errors. | `app/layout.tsx` |
| **Database Migration Model** | ✅ Resolved | Consolidated from 19 iterative scripts into **6 clean baseline migrations** plus one-click master script. | `supabase/migrations/` |

---

## 2. Deferred Refactors (Targeted for UI/UX Redesign)

The initial refactoring phases (Steps 1–6 and Step 9 of `docs/REFACTOR_PLAN.md`) successfully consolidated auth guards, base-URL resolution, address management, pure order access control (`resolveOrderAccess`), DTO redaction, and action modularization. The remaining refactor steps and UI components exceeding the 300-line guideline are intentionally deferred to be addressed concurrently with the upcoming UI/UX redesign:

| Refactor Task | Component / File | Current Scope | Resolution Plan |
|---|---|---|---|
| **Step 7: Admin Product Studio** | `components/admin/product-form.tsx` | ~718 lines | Split into 4 subcomponents (basic info, options & matrix, media gallery, inventory pricing) during the Admin UI polish. |
| **Step 8: Admin Storefront** | `hero-slides-manager.tsx`, `category-collage-manager.tsx` | ~590 lines, ~414 lines | Extract slide card items and collage slot tiles into dedicated subcomponents when upgrading storefront visual management. |
| **Step 10: Product Detail UI** | `app/(storefront)/products/[slug]/product-client.tsx` | ~433 lines | Move to `components/storefront/product-detail-client.tsx` and modularize image gallery vs variant picker during storefront UI styling. |
| **Step 11: Checkout Pipeline** | `components/storefront/checkout-form.tsx` | ~580 lines | Modularize into order summary, saved address selector, sticky mobile action dock, and form state manager alongside checkout UX enhancements. |
| **Other UI files >300 lines** | Various storefront / admin UI modules | >300 lines | Splitting presentation-only markup ahead of the redesign would cause double churn. Line count is treated as a guideline; refactor with new design components. |

- **Double Server-Rendering & Suspense Fallback Investigation**: Investigate whether dynamic page content is server-rendered twice (Suspense fallback + streamed boundary). Measure document size and hydration cost on a dynamic page before and after; revisit when doing the UI/UX redesign.

---

## 3. Accepted Risks & Operational Limits

The following architectural and operational constraints have been reviewed and accepted for the v1.0 production launch:

1. **Content Security Policy (CSP) uses `'unsafe-inline'` Scripts**:
   - Next.js App Router inline bootstrap and hydration scripts currently require `'unsafe-inline'` in `script-src` and `style-src`. In production, `'unsafe-eval'` is strictly stripped from the CSP header, but dynamic per-request nonces have not yet been wired into the App Router middleware. A migration to strict cryptographic nonces (`'nonce-...'`) is slated for post-launch.
2. **Per-IP Rate Limits on Shared Mobile Networks (CGNAT)**:
   - In Bangladesh, major telecom operators (Grameenphone, Banglalink, Robi) route substantial mobile subscriber traffic through Carrier-Grade NAT (CGNAT), where thousands of cellular devices share identical public IPv4 gateway addresses.
   - Sliding-window per-IP limits (`rl:auth`: 5 req/min, `rl:order`: 5 orders/10 min, `rl:checkout`: 15 attempts/min) could theoretically throttle distinct mobile shoppers during concurrent sales surges. Rate limits are monitored via Upstash console and can be adjusted if false-positive throttles occur.
3. **Fail-Open Rate Limiting Policy**:
   - If Upstash Redis is unreachable, times out, or experiences service disruption, rate-limiting middleware and server actions fail open (logging a warning and permitting requests to continue). This decision prioritizes store revenue and genuine customer checkouts over strict threat blocking during Redis infrastructure incidents.
4. **Build-Time Dev-Only Advisories**:
   - `npm audit` reports build-time advisories residing in transitive dependencies of `eslint-config-next` and related developer tooling. Because these dependencies execute strictly at build/test time on trusted developer machines or Vercel build runners and are never shipped in the runtime JavaScript bundle, they represent zero runtime risk to production users.
5. **Next.js 16 `partialPrefetching` Configuration Decision**:
   - Next.js 16 emits a build warning when `cacheComponents: true` is configured without an explicit `partialPrefetching` boolean setting. The project intentionally leaves `partialPrefetching` unconfigured at launch, as Cache Components and Partial Prerendering (PPR) conventions are under active upstream development. Explicitly opting into or out of partial prefetching will occur when Next.js 16 formalizes the option in a subsequent release.

---

## 4. Deferred Features (v1.1+ Roadmap)

The following items are deferred for post-launch evaluation after the store owner begins live fulfillment:

| Feature | Priority | Technical Impact | Notes |
|---|---|---|---|
| **Local SMS Notifications** | Medium | Third-party SMS gateway integration (e.g. SSL Wireless or Twilio) | Automated SMS dispatched when courier marks parcel `out_for_delivery`. |
| **Mobile Banking / Digital Payments** | High | bKash / Nagad / SSLCommerz gateway integration | Optional online prepayment before courier dispatch. |
| **Formal Returns & Exchange Portal** | Low | New customer return request workflow | Owner handles returns via phone/WhatsApp during initial launch phase. |
| **Advanced Sales & Inventory Reporting** | Low | Additional charts and CSV export endpoints | Basic operational metrics and low-stock alerts are sufficient for initial order volume. |
| **Automated Inventory Reservation** | Low | Temporary cart hold with countdown timer | Not needed for current order volume; transactional stock decrement at order creation is sufficient. |

---

## 5. Maintenance Notice

> [!NOTE]
> Following project completion and launch, this document serves as a permanent record of design decisions.
