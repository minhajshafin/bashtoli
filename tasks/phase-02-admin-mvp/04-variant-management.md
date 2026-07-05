# Task: Variant Management

**Phase:** 2 — Admin MVP + Catalog  
**Week:** 3

## Goal

Enable admin to define product options and create sellable SKU variants with per-variant stock and price.

## Requirements

- Option management on product edit page: add option axes (e.g. Size, Color) with values
- Variant generation: one row per sellable SKU combination
- Each variant has: option_values (jsonb), stock_qty, price (absolute), active toggle, optional SKU code
- Support single-dimension variants at launch (size OR color)
- Support multi-dimension variants (size AND color) via full SKU model
- Inline editing of variant stock and price
- Bulk activate/deactivate variants

## Acceptance Criteria

- [ ] Admin can add option "Size" with values S, M, L to a product
- [ ] System generates one variant row per option value (single dimension)
- [ ] Admin can set stock_qty and price per variant
- [ ] Admin can add second option dimension (e.g. Color) and system generates combined SKUs
- [ ] Each variant stores option_values as jsonb (e.g. `{"size":"L","color":"Red"}`)
- [ ] Admin can deactivate individual variants
- [ ] Variants with zero stock are visually flagged in admin

## Dependencies

- [03-product-crud.md](./03-product-crud.md)

## Files to Modify

| File | Action |
|---|---|
| `app/admin/products/[id]/page.tsx` | Update |
| `components/admin/option-manager.tsx` | Create |
| `components/admin/variant-table.tsx` | Create |
| `lib/validations/variant.ts` | Create |
| `lib/actions/variants.ts` | Create |
| `lib/utils/generate-variants.ts` | Create |

## Definition of Done

- [ ] Single-dimension and multi-dimension variants both work
- [ ] Stock and price editable per variant
- [ ] Variant data matches [Database — product_variants](../docs/database.md#product_variants)
- [ ] Owner can configure real product variants
