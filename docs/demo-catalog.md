# Demo Catalog & Placeholder Importer

This document describes the staging demo catalog, the deterministic placeholder generator, and the safety procedures for importing and resetting demo data in Bashtoli.

---

## 1. Catalog Structure (`supabase/seed/demo-catalog.json`)

The demo catalog provides realistic stationery catalog data tailored for a local Dhaka stationery shop. It is intended exclusively for the **Staging** environment to facilitate UI/UX design, testing pagination, search indexing, and administrative controls.

- **Schema Version:** `4`
- **Categories (8 total):**
  - 7 featured categories for the homepage collage (featured orders 1–7):
    1. *Notebooks & Journals* (`notebooks-and-journals`) — color: `forest`
    2. *Pens & Pencils* (`pens-and-pencils`) — color: `ink`
    3. *Art & Drawing* (`art-and-drawing`) — color: `terracotta`
    4. *Paper & Printing* (`paper-and-printing`) — color: `cream`
    5. *Desk & Office* (`desk-and-office`) — color: `slate`
    6. *Math & Geometry* (`math-and-geometry`) — color: `ocean`
    7. *Gift & Craft* (`gift-and-craft`) — color: `gold`
  - 1 unfeatured category:
    8. *Study & Exam Essentials* (`study-and-exam-essentials`) — color: `moss`
- **Products (50 total):**
  - Spans all 8 categories (5–8 items per category).
  - Realistic everyday items and artisan Bangladeshi stationery (e.g. handmade Lokta journals, jute diaries, Sonargaon clay pen stands).
  - Pricing in Bangladeshi Taka (BDT) ranging from 15 BDT to 1,200 BDT.
  - Edge cases included: single-variant products, multi-variant products (e.g. Size, Color, Ruling), products with zero images (`felt-surface-document-ink-stamp-pad`), inactive/draft products (`active: false`).
- **Hero Slides (3 total):**
  - Artisan Stationery (Preset: `forest`)
  - Study & Exam Season (Preset: `ocean`)
  - Paper & Craft Studio (Preset: `gold`)

---

## 2. Deterministic Local Placeholder Generation

All placeholder images are rendered offline and deterministically using `sharp` from lightweight SVG templates. No external image CDNs, stock photo APIs, or third-party placeholder services are used.

### Display Locations & Dimensions
- **Product Images:**
  - Card Aspect Ratio: `3:4` (`aspect-[3/4]` in `components/storefront/product-card.tsx#L134`)
  - Gallery Aspect Ratio: `4:3` on mobile / `1:1` square on desktop (`components/storefront/image-gallery.tsx#L93,L132`)
  - Chosen Dimensions: **600 x 800 px** (3:4 WebP, ~8–15 KB per file, well below 300 KB limit).
  - Secondary Images (`image_slots: 2` or `3`): Provide distinct perspective callouts (e.g. "Page Spread", "Stitching Detail").
- **Category Tiles:**
  - Grid Display: Masonry tiles in `components/storefront/category-grid.tsx#L176-L215`
  - Chosen Dimensions: **800 x 600 px** (4:3 WebP, ~6–12 KB).
- **Hero Slides:**
  - Display: `aspect-[16/10] sm:aspect-[4/5]` in `components/storefront/hero.tsx#L35`
  - Chosen Dimensions: **800 x 1000 px** (4:5 WebP, ~10–18 KB).

### Design Tokens & Typography
- **Palette Tokens:** `forest` (`#1e3d2c`), `gold` (`#c4a265`), `cream` (`#f6f0e4`), `terracotta` (`#8f3621`), `ink` (`#102218`), `moss` (`#386b4f`), `ocean` (`#3b7097`), `slate` (`#5c6460`).
- **Typography:** Rendered using neutral system fonts with ASCII-only sanitization (`/[^\x20-\x7E]/g`) and full XML entity escaping to avoid font rendering glitches.
- **Storage Bucket:** Uploaded to the public `product-images` bucket under `demo/products/`, `demo/categories/`, and `demo/hero/`.

---

## 3. Safety Controls & Execution Procedures

The importer script (`scripts/import-demo-catalog.ts`) is fortified with multi-layered safety guards to prevent accidental execution against production:

1. **Target URL Guard (`assertScriptTarget`):** Execution is refused unless `SCRIPT_TARGET_URL` matches `NEXT_PUBLIC_SUPABASE_URL`.
2. **Production Block:** The script immediately throws if `process.env.NODE_ENV === 'production'`.
3. **Dry Run Default:** Running without flags performs zero database writes and zero storage uploads. It prints the execution plan and target hostname.
4. **Explicit Confirmation for Writes:** Applying writes requires **both** `--apply` and `--confirm-host=<hostname>`, where `<hostname>` must exactly match the parsed hostname of `NEXT_PUBLIC_SUPABASE_URL`.
5. **No Production Credentials:** Production keys are never provided to agents. Only the staging project owner runs apply commands.
6. **Isolation from E2E Fixtures:** Never touches `e2e-test-category`, `e2e-test-bamboo-product`, `E2E-TEST-SKU-001`, or real customer data.

---

## 4. Running the Importer

### Dry Run (Default)
Inspect what would be created without altering database or storage state:

```bash
SCRIPT_TARGET_URL="https://<staging-ref>.supabase.co" npm run seed:demo
```

Output:
```text
[script guard] Target project hostname: <staging-ref>.supabase.co
[DRY RUN] Plan summary:
- Categories to upsert: 8
- Hero slides to upsert: 3
- Products to upsert: 50
- Variants to reconcile: 73
- Images to generate: 80 (8 categories, 3 hero, 69 products)
...
[DRY RUN] Completed. Zero database or storage writes performed.
```

### Apply Mode (Staging Owner Only)
Write demo catalog and placeholders to the staging project:

```bash
SCRIPT_TARGET_URL="https://<staging-ref>.supabase.co" \
npm run seed:demo -- --apply --confirm-host=<staging-ref>.supabase.co
```

---

## 5. Resetting Demo Data

To clear demo products, categories, hero slides, and storage images:

### Dry Run Reset
```bash
SCRIPT_TARGET_URL="https://<staging-ref>.supabase.co" \
npm run seed:demo -- --reset-demo
```

### Apply Reset
```bash
SCRIPT_TARGET_URL="https://<staging-ref>.supabase.co" \
npm run seed:demo -- --reset-demo --apply --confirm-host=<staging-ref>.supabase.co
```

### Financial Record Protection during Reset
If any demo product is referenced in `order_items`:
- It is **soft-deleted** (`active: false`) instead of hard-deleted, strictly matching `lib/actions/product-delete.ts`.
- Order history and financial records remain intact.
- Demo products without order history are cleanly deleted along with their variants and storage files.
