# Task: Expand E2E Test Coverage

**Phase:** 8 — QA & Launch  
**Week:** 12

## Goal

Expand Playwright E2E tests beyond checkout to cover admin order visibility and critical account flows.

## Requirements

- Extend existing checkout test if needed
- Add test: admin login → view new order in admin dashboard
- Add test: customer signup → add to wishlist → verify wishlist page
- Add test: guest order lookup with valid credentials
- All tests pass in headless mode
- Document how to run tests locally and in CI

## Acceptance Criteria

- [ ] Checkout happy path test still passes
- [ ] Admin sees order placed by E2E checkout test
- [ ] Account wishlist test passes
- [ ] Guest order lookup test passes
- [ ] `npm run test:e2e` runs all tests successfully
- [ ] Test documentation in [Testing](../docs/testing.md)

## Dependencies

- [04-playwright-e2e.md](../phase-04-checkout/04-playwright-e2e.md)
- Phases 5–6 complete

## Files to Modify

| File | Action |
|---|---|
| `tests/e2e/checkout.spec.ts` | Update |
| `tests/e2e/admin-order.spec.ts` | Create |
| `tests/e2e/account-wishlist.spec.ts` | Create |
| `tests/e2e/guest-lookup.spec.ts` | Create |
| `docs/testing.md` | Update |

## Definition of Done

- [ ] All E2E tests pass consistently
- [ ] Test suite documented
- [ ] No flaky tests
