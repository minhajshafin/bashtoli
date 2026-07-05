# Task: UI Polish

**Phase:** 7 — Polish & Content  
**Week:** 11

## Goal

Apply final UI polish: consistent styling, loading states, error handling, and empty states across the application.

## Requirements

- Consistent color palette, typography, and spacing (Tailwind design tokens)
- Loading skeletons on data-fetching pages
- Error boundaries and friendly error pages (404, 500)
- Empty states: empty cart, empty wishlist, no orders, no products
- Toast notifications for admin actions (product saved, order updated, etc.)
- Form error display consistent across all forms
- Owner completes real product catalog during this phase

## Acceptance Criteria

- [ ] All pages have appropriate loading states
- [ ] 404 page for missing products/routes
- [ ] Empty states on cart, wishlist, order history, admin lists
- [ ] Admin toasts confirm successful mutations
- [ ] Visual consistency across storefront and admin
- [ ] Owner has entered real product catalog (>10 products)

## Dependencies

- Phases 2–6 complete
- [02-responsive-design.md](./02-responsive-design.md)

## Files to Modify

| File | Action |
|---|---|
| `app/not-found.tsx` | Create |
| `app/error.tsx` | Create |
| `components/ui/skeleton.tsx` | Create |
| `components/ui/toast.tsx` | Create |
| `components/ui/empty-state.tsx` | Create |
| `app/globals.css` | Update (design tokens) |
| Various page files | Update (loading/error states) |

## Definition of Done

- [ ] No page shows blank screen during loading
- [ ] Error and empty states user-friendly
- [ ] Owner catalog populated with real products
- [ ] Visual review completed
