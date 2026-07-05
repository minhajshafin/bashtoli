# Task: Category Management

**Phase:** 2 — Admin MVP + Catalog  
**Week:** 2–3

## Goal

Build admin CRUD for product categories with slug generation and sort ordering.

## Requirements

- Category list page at `/admin/categories`
- Create, edit, and delete categories
- Fields: name, slug (auto-generated from name), sort_order
- Zod validation on all server actions
- Confirm dialog before delete
- Prevent delete if category has associated products (show count)

## Acceptance Criteria

- [ ] Admin can create a category with name and sort order
- [ ] Slug auto-generates from name and is editable
- [ ] Admin can reorder categories via sort_order field
- [ ] Admin can edit existing category name/slug/sort_order
- [ ] Delete blocked with message when category has products
- [ ] Delete succeeds when category has no products
- [ ] Invalid input rejected with clear error messages

## Dependencies

- [01-admin-auth-middleware.md](./01-admin-auth-middleware.md)

## Files to Modify

| File | Action |
|---|---|
| `app/admin/categories/page.tsx` | Create |
| `components/admin/category-form.tsx` | Create |
| `components/admin/category-list.tsx` | Create |
| `lib/validations/category.ts` | Create |
| `lib/actions/categories.ts` | Create |

## Definition of Done

- [ ] Full CRUD cycle tested manually
- [ ] Server-side Zod validation on all mutations
- [ ] RLS policies allow staff/admin write, block customer
- [ ] UI follows admin layout conventions
