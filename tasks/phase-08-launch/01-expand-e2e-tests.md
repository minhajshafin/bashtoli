# Task: Expand E2E Test Coverage (Full Suite)

**Phase:** 8 — QA & Launch  
**Week:** 12

## Goal

Expand Playwright end-to-end test coverage from basic guest checkout into a comprehensive automated test suite covering all critical customer shopping journeys, guest order claiming, customer suggestions, and admin operational workflows built through Phase 7 and the security audit.

## Requirements

Implement high-confidence E2E test specs using Playwright running in headless mode:

1. **Guest Checkout Flow (`tests/e2e/checkout.spec.ts`)**:
   - Storefront browse → product detail → add to bag → bag validation → checkout form.
   - Fill valid Bangladeshi shipping details, select delivery zone (`Inside Dhaka` / `Outside Dhaka`), submit COD order.
   - Verify redirect to `/order/ORD-YYYYMMDD-NNNN` with server-generated order number and snapshot details.

2. **Admin Order Lifecycle & Fulfillment (`tests/e2e/admin-orders.spec.ts`)**:
   - Admin authentication handshake via session cookies.
   - Locate placed test order in `/admin/orders` table.
   - Test status transitions (`pending` → `processing` → `delivered`).
   - Test cancellation flow and verify stock restitution via `increment_stock` RPC.

3. **Guest Order Claiming & Account Sync (`tests/e2e/guest-order-claim.spec.ts`)**:
   - Place an order as a guest with test phone and email.
   - Register a new account using the matching phone or email address.
   - Navigate to `/account/orders`, verify `ClaimOrdersPrompt` banner appears with matching unclaimed guest orders.
   - Click "Link Orders to My Account" and verify atomic execution of `claim_guest_orders` RPC, transitioning orders to the user account.

4. **Wishlist Persistence & Interaction (`tests/e2e/account-wishlist.spec.ts`)**:
   - Guest wishlist: Toggle heart button on product card → verify optimistic state and localStorage persistence.
   - Authenticated wishlist: Log in → verify database sync and item presence on `/account/wishlist`.

5. **Admin Storefront Customization (`tests/e2e/admin-storefront.spec.ts`)**:
   - Navigate to `/admin/storefront`.
   - Update Hero Slide status/order → verify updated slide displays on homepage (`/`).
   - Modify Category Collage 7-slot arrangement → verify featured categories reflect accurately on storefront.

6. **Customer Item Suggestions (`tests/e2e/suggestions.spec.ts`)**:
   - Fill suggestion modal on storefront with name, contact, and item description.
   - Verify honeypot anti-spam defense ignores bot submissions.
   - Verify valid submission shows success feedback and records data.

## Acceptance Criteria

- [ ] `tests/e2e/checkout.spec.ts` passes consistently.
- [ ] `tests/e2e/admin-orders.spec.ts` verifies order fulfillment and status transitions.
- [ ] `tests/e2e/guest-order-claim.spec.ts` verifies guest order detection and claiming via RPC.
- [ ] `tests/e2e/account-wishlist.spec.ts` verifies card heart toggle and `/account/wishlist` page.
- [ ] `tests/e2e/admin-storefront.spec.ts` verifies hero slide and collage updates on homepage.
- [ ] `tests/e2e/suggestions.spec.ts` verifies item suggestion submission and honeypot guard.
- [ ] `npm run test:e2e` executes all tests without flakiness in headless mode.
- [ ] Test execution guidelines and CI configurations documented in `docs/testing.md`.

## Dependencies

- All storefront routes and customer account features (Phases 3, 5).
- Admin management panels and order workflow (Phases 2, 6).
- Post-Phase 7 database RPCs (Migration `019_guest_order_claiming.sql`).
- Seed script (`scripts/seed-mock-products.ts`) to ensure test catalog predictability.

## Files to Modify

| File | Action | Description |
|---|---|---|
| `tests/e2e/checkout.spec.ts` | Update | Maintain and harden guest checkout happy path |
| `tests/e2e/admin-orders.spec.ts` | Create | Admin login, order inspection, and status management |
| `tests/e2e/guest-order-claim.spec.ts` | Create | Unclaimed guest order detection and claiming flow |
| `tests/e2e/account-wishlist.spec.ts` | Create | Product card wishlist toggle and account sync |
| `tests/e2e/admin-storefront.spec.ts` | Create | Hero slides and category collage customization |
| `tests/e2e/suggestions.spec.ts` | Create | Customer product suggestion modal & honeypot |
| `docs/testing.md` | Update | Document Playwright execution, fixtures, and CI commands |

## Definition of Done

- [ ] All 6 E2E test suites pass deterministically (`npm run test:e2e`).
- [ ] Playwright runs cleanly in CI and local environments.
- [ ] No race conditions, unhandled rejections, or flaky timeouts.
- [ ] Test documentation completed in `docs/testing.md`.
