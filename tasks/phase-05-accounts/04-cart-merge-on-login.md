# Task: Cart Merge on Login

**Phase:** 5 — Customer Accounts  
**Week:** 8

## Goal

Merge guest localStorage cart into the user's server-side cart on login, and persist logged-in cart in Supabase.

## Requirements

- On login: read guest cart from localStorage, merge into DB cart (`carts` + `cart_items`)
- Merge strategy: keep higher quantity on conflict; drop unavailable or deactivated items
- Logged-in cart stored in Supabase (`carts` + `cart_items`)
- Cart page and header badge read from DB when authenticated
- On logout: keep localStorage guest cart (do not clear)
- Add to cart from PDP writes to DB when logged in

## Acceptance Criteria

- [ ] Guest adds items, logs in → items appear in account cart
- [ ] Conflicting quantities: higher qty kept
- [ ] Deactivated product in guest cart dropped on merge with notification
- [ ] Logged-in user adds item → saved to DB cart
- [ ] Cart persists across devices for logged-in user
- [ ] Logout preserves localStorage guest cart
- [ ] Cart page works for both guest (localStorage) and logged-in (DB) contexts

## Dependencies

- [01-signup-login.md](./01-signup-login.md)
- [03-guest-cart.md](../phase-03-storefront/03-guest-cart.md)

## Files to Modify

| File | Action |
|---|---|
| `lib/cart/merge-cart.ts` | Create |
| `lib/cart/db-cart.ts` | Create |
| `lib/cart/cart-context.tsx` | Update |
| `lib/actions/auth.ts` | Update (trigger merge on login) |
| `lib/actions/cart.ts` | Create |

## Definition of Done

- [ ] Merge tested with various scenarios (empty, overlap, deactivated items)
- [ ] DB cart CRUD works for logged-in users
- [ ] Guest and logged-in cart paths both functional
- [ ] No data loss on login/logout cycle
