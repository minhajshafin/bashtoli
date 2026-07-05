# Task: Product CRUD

**Phase:** 2 — Admin MVP + Catalog  
**Week:** 2–3

## Goal

Build admin product management with create, edit, delete, and active/draft toggle.

## Requirements

- Product list page at `/admin/products` with active/draft filter
- Create and edit product form: name, slug, description, category, base_price, active toggle
- Product detail/edit page at `/admin/products/[id]`
- Delete product (with confirmation; cascade or block if variants exist — document choice)
- Clear visual distinction between draft and active products in list
- Zod validation on all server actions

## Acceptance Criteria

- [ ] Admin can create a product with all required fields
- [ ] Admin can toggle product between draft (inactive) and active
- [ ] Product list shows status badge (draft/active)
- [ ] Admin can filter list by active/inactive/all
- [ ] Admin can edit all product fields
- [ ] Slug auto-generates from name
- [ ] Inactive products do not appear in storefront queries (verified via RLS)

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

- [ ] Product CRUD tested end-to-end
- [ ] Active/draft toggle works and affects storefront visibility
- [ ] Validation errors displayed in UI
- [ ] Owner can begin entering real product data
