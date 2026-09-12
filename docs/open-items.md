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

## 2. Deferred Features (v1.1+ Roadmap)

The following items are deferred for post-launch evaluation after the store owner begins live fulfillment:

| Feature | Priority | Technical Impact | Notes |
|---|---|---|---|
| **Local SMS Notifications** | Medium | Third-party SMS gateway integration (e.g. SSL Wireless or Twilio) | Automated SMS dispatched when courier marks parcel `out_for_delivery`. |
| **Mobile Banking / Digital Payments** | High | bKash / Nagad / SSLCommerz gateway integration | Optional online prepayment before courier dispatch. |
| **Formal Returns & Exchange Portal** | Low | New customer return request workflow | Owner handles returns via phone/WhatsApp during initial launch phase. |
| **Advanced Sales & Inventory Reporting** | Low | Additional charts and CSV export endpoints | Basic operational metrics and low-stock alerts are sufficient for initial order volume. |
| **Automated Inventory Reservation** | Low | Temporary cart hold with countdown timer | Not needed for current order volume; transactional stock decrement at order creation is sufficient. |

---

## 3. Maintenance Notice

> [!NOTE]
> Following project completion and launch, this document serves as a permanent record of design decisions.
