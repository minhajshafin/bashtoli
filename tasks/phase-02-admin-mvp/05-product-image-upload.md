# Task: Product Image Upload

**Phase:** 2 — Admin MVP + Catalog  
**Week:** 3

## Goal

Allow admin to upload, reorder, and delete multiple images per product via Supabase Storage.

## Requirements

- Multi-image upload on product edit page
- Upload to Supabase Storage `product-images` bucket
- Store URLs in `product_images` table with alt_text and sort_order
- Drag-and-drop or manual reordering of gallery images
- Delete individual images (removes from Storage and DB)
- Enforce recommended constraints: 1200×1200, WebP/JPEG, max 2 MB
- Show upload progress and error states

## Acceptance Criteria

- [ ] Admin can upload multiple images to a product
- [ ] Images stored in Supabase Storage with public read URL
- [ ] Admin can reorder images (sort_order updates)
- [ ] Admin can set alt_text per image
- [ ] Admin can delete an image (removed from Storage and DB)
- [ ] Files over 2 MB rejected with clear error
- [ ] Non-image file types rejected

## Dependencies

- [03-product-crud.md](./03-product-crud.md)
- [02-supabase-setup.md](../phase-01-setup/02-supabase-setup.md)

## Files to Modify

| File | Action |
|---|---|
| `app/admin/products/[id]/page.tsx` | Update |
| `components/admin/image-uploader.tsx` | Create |
| `components/admin/image-gallery-admin.tsx` | Create |
| `lib/actions/product-images.ts` | Create |
| `lib/validations/product-image.ts` | Create |

## Definition of Done

- [ ] Multi-image upload tested with real files
- [ ] Reorder and delete work correctly
- [ ] Storage cleanup on delete verified
- [ ] Owner can upload real product photos
