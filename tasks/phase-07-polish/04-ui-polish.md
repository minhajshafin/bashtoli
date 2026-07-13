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
- **Basic accessibility (WCAG 2.1 AA):** keyboard navigation for all interactive elements, visible focus states, meaningful alt text on all images, 4.5:1 minimum color contrast ratio

## Acceptance Criteria

- [x] All pages have appropriate loading states
- [x] 404 page for missing products/routes
- [x] Empty states on cart, wishlist, order history, admin lists
- [x] Admin toasts confirm successful mutations
- [x] Visual consistency across storefront and admin
- [x] Keyboard navigation works for all interactive elements
- [x] All images have meaningful alt text
- [x] Focus states visible on all focusable elements

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

- [x] No page shows blank screen during loading
- [x] Error and empty states user-friendly
- [x] Owner catalog populated with real products
- [x] Visual review completed
