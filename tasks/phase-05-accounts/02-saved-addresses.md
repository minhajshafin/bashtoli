# Task: Saved Addresses

**Phase:** 5 — Customer Accounts  
**Week:** 8

## Goal

Allow logged-in customers to save, manage, and use addresses that pre-fill the checkout form.

## Requirements

- Address management page at `/account/addresses`
- CRUD: add, edit, delete addresses
- Fields: label, full_address, phone, is_default
- Only one default address per user
- Checkout form pre-fills with default address for logged-in users
- User can select a different saved address at checkout
- Zod validation on all server actions

## Acceptance Criteria

- [x] Logged-in user can add an address with label and phone
- [x] User can set one address as default
- [x] Setting new default unsets previous default
- [x] Checkout form pre-fills name, phone, address from default
- [x] User can switch to a different saved address at checkout
- [x] User can edit and delete addresses
- [x] Guest checkout unaffected (no address saving)

## Dependencies

- [01-signup-login.md](./01-signup-login.md)

## Files to Modify

| File | Action |
|---|---|
| `app/(storefront)/account/addresses/page.tsx` | Create |
| `app/(storefront)/account/layout.tsx` | Create |
| `components/storefront/address-form.tsx` | Create |
| `components/storefront/address-list.tsx` | Create |
| `components/storefront/checkout-form.tsx` | Update |
| `lib/validations/address.ts` | Create |
| `lib/actions/addresses.ts` | Create |

## Definition of Done

- [x] Address CRUD tested
- [x] Default address logic works correctly
- [x] Checkout pre-fill verified for logged-in users
- [x] RLS restricts addresses to own user
