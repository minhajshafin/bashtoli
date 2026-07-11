# Task: Product CRUD

**Phase:** 2 — Admin MVP + Catalog  
**Week:** 2–3

## Goal

Build admin product management with create, edit, delete, and active/draft toggle.

## Requirements

- Product list page at `/admin/products` with active/draft filter
- Create and edit product form: name, slug, description, category, base_price, active toggle, featured toggle
- Product detail/edit page at `/admin/products/[id]`
- Slug auto-generated from name (kebab-case); allow manual override; enforce uniqueness
- Delete product: **block** if any `order_items` reference the product; otherwise soft-delete by setting `active = false` (hard delete only via admin SQL for cleanup)
- Clear visual distinction between draft and active products in list
- Featured products displayed on home page (Phase 7); toggle here sets the `featured` flag
- Zod validation on all server actions

## Acceptance Criteria

- [x] Admin can create a product with all required fields
- [x] Admin can toggle product between draft (inactive) and active
- [x] Admin can toggle product as featured (shows on home page)
- [x] Product list shows status badge (draft/active)
- [x] Admin can filter list by active/inactive/all
- [x] Admin can edit all product fields
- [x] Slug auto-generates from name (kebab-case); can be manually overridden; unique constraint enforced
- [x] Delete blocked with clear message if product has order history; soft-delete used otherwise
- [x] Inactive products do not appear in storefront queries (verified via RLS)

## Dependencies

- [02-category-management.md](./02-category-management.md)

## Files to Modify

| File | Action |
|---|---|
| `app/admin/products/page.tsx` | Create |
| `app/admin/products/new/page.tsx` | Create |
| `app/admin/products/[id]/page.tsx` | Create |
| `components/admin/product-form.tsx` | Create |
| `components/admin/product-list.tsx` | Create |
| `lib/validations/product.ts` | Create |
| `lib/actions/products.ts` | Create |

## Definition of Done

- [x] Product CRUD tested end-to-end
- [x] Active/draft toggle works and affects storefront visibility
- [x] Validation errors displayed in UI
- [x] Owner can begin entering real product data
