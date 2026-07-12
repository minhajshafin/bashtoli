# Task: Playwright E2E — Checkout Happy Path

**Phase:** 4 — Checkout + Emails  
**Week:** 7

## Goal

Write the first Playwright E2E test covering browse → add to cart → COD checkout → order confirmation.

## Requirements

- Install and configure Playwright
- Test flow:
  1. Navigate to product listing
  2. Open a product detail page
  3. Select variant and add to cart
  4. Go to cart, verify item present
  5. Proceed to checkout, fill form, submit
  6. Verify order confirmation page with order number
- Use test data (seed script or known products in dev DB)
- Run in CI-compatible headless mode

## Acceptance Criteria

- [x] Playwright test passes locally in headless mode
- [x] Test covers full guest checkout happy path
- [x] Order number visible on confirmation page
- [x] Test is repeatable (cleans up or uses isolated data)
- [x] `npm run test:e2e` script added to package.json

## Dependencies

- [01-cod-checkout.md](./01-cod-checkout.md)
- [03-guest-cart.md](../phase-03-storefront/03-guest-cart.md)
- Active test products in dev database

## Files to Modify

| File | Action |
|---|---|
| `playwright.config.ts` | Create |
| `tests/e2e/checkout.spec.ts` | Create |
| `package.json` | Update (test:e2e script) |
| `supabase/scripts/seed-test-data.sql` | Create |

## Definition of Done

- [x] E2E test passes consistently
- [x] Test data seed script documented
- [x] Playwright configured for local dev
- [x] Test added to pre-launch checklist
