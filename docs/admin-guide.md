# Store Owner & Staff Operations Manual

Welcome to the **Bashtoli Operations Manual**. This comprehensive guide provides step-by-step instructions for the store owner and staff to manage catalog products, variant inventory, order fulfillment, visual homepage merchandising, and handle operational emergencies.

> [!NOTE]
> **Operational Reference**:
> This document is the permanent operations manual for the Bashtoli platform.

---

## Table of Contents

1. [Access & Role Permissions](#1-access--role-permissions)
2. [Admin Dashboard Overview](#2-admin-dashboard-overview)
3. [Catalog & Inventory Management](#3-catalog--inventory-management)
4. [Order Fulfillment Workflow](#4-order-fulfillment-workflow)
5. [Homepage Visual Merchandising](#5-homepage-visual-merchandising)
6. [Staff & Security Administration](#6-staff--security-administration)
7. [Customer Suggestions](#7-customer-suggestions)
8. [Incident & Emergency Runbook](#8-incident--emergency-runbook)

---

## 1. Access & Role Permissions

The administrative panel is located at:
```
https://bashtoli.com/admin
```
*(or your local development URL: `http://localhost:3000/admin`)*

### Role Differences

| Feature / Area | Staff | Admin (Store Owner) |
|---|:---:|:---:|
| View Dashboard Metrics (Orders, Revenue, Low-Stock) | ✅ | ✅ |
| Create, Edit & Deactivate Products | ✅ | ✅ |
| Manage Variant SKUs & Stock Quantities | ✅ | ✅ |
| Upload & Reorder Product Images | ✅ | ✅ |
| Fulfill Orders & Update Statuses (`pending` → `delivered`) | ✅ | ✅ |
| Cancel Orders & Trigger Automated Restocking | ✅ | ✅ |
| Customize Homepage Hero Carousel & Category Collage | ✅ | ✅ |
| Invite New Staff Members & Change User Roles | ❌ | ✅ |
| Inspect Administrative Role Audit Log | ❌ | ✅ |

### Initial Admin Setup (Bootstrap)
The very first admin account is provisioned via the Supabase SQL Editor:
1. Sign up on the storefront with your owner email address.
2. Open **Supabase Dashboard → Authentication → Users** and copy your User UUID.
3. Open **SQL Editor**, open [`supabase/scripts/bootstrap-admin.sql`](../supabase/scripts/bootstrap-admin.sql), paste your UUID into `target_user_id`, and click **Run**.

---

## 2. Admin Dashboard Overview

When you log in to `/admin`, the main dashboard displays critical real-time operational indicators:

- **Today's Orders**: Total number of orders placed in the current 24-hour cycle.
- **Pending Queue**: Highlighted badge showing orders awaiting staff phone confirmation or preparation.
- **Revenue Snapshot**: Total gross sales for today's orders (COD value).
- **Low-Stock Alert**: Urgent indicator listing any product variant with **fewer than 5 units remaining**. Clicking this jumps directly to the product inventory editor.

---

## 3. Catalog & Inventory Management

Navigate to **Admin → Products** (`/admin/products`) to view your catalog.

### Adding a New Product (`/admin/products/new`)
1. **Basic Details**:
   - **Product Name**: e.g., *"Handcrafted Bamboo Serving Tray"*.
   - **Slug**: Auto-generated kebab-case identifier (e.g. `handcrafted-bamboo-serving-tray`).
   - **Category**: Select the parent category from the dropdown.
   - **Base Price**: Reference retail price in Bangladeshi Taka (BDT).
   - **Description**: Rich details on materials, artisan origin, dimensions, and care instructions.
   - **Visibility**: Leave as **Draft** while preparing details, or toggle to **Active** to publish immediately to the live storefront.

2. **Uploading Product Images**:
   - Recommended dimensions: **1200 × 1200 px** (1:1 square ratio).
   - File formats accepted: **JPEG, PNG, WebP** (max **2 MB** per file).
   - Drag and drop to reorder images. The **first image** serves as the primary storefront thumbnail.

3. **Defining Options & Variants**:
   - If the product comes in different versions (e.g., Sizes: *Medium*, *Large* or Finishes: *Natural Wood*, *Dark Polish*):
     - Click **Add Option** (e.g. "Finish").
     - Add the option values (e.g. "Natural Wood", "Dark Polish").
     - The variant table will automatically generate one row per combination.
   - For each variant row:
     - Assign a unique **SKU** (e.g. `BAM-TRY-NAT`).
     - Set the absolute **Price** (variants can have different prices).
     - Enter the current **Stock Quantity**.

4. **Saving**: Click **Publish Product**.

### Deactivating or Deleting a Product
- **Deactivate (Recommended)**: Toggle `Active = false`. The product is immediately hidden from the storefront, cannot be purchased, but all historical order records remain intact.
- **Delete**: If a product has zero historical orders, it can be permanently deleted. If customers have previously ordered this product, the system protects historical receipts by safely soft-deleting it.

---

## 4. Order Fulfillment Workflow

Navigate to **Admin → Orders** (`/admin/orders`) to manage customer orders.

### Order Status Lifecycle

```
[ pending ] ──► [ confirmed ] ──► [ shipped ] ──► [ out_for_delivery ] ──► [ delivered ]
     │                 │
     ▼                 ▼
[ cancelled ]     [ cancelled ]  (Automatically restores stock to inventory)
```

1. **`pending` (Order Placed)**:
   - The customer completed checkout. Inventory was atomically decremented in the database.
   - **Action**: Staff contacts the customer via phone call or WhatsApp to verify delivery address and intent to receive the parcel.
2. **`confirmed` (Customer Verified)**:
   - Staff verified the customer. Warehouse packages the parcel and schedules courier handover.
3. **`shipped` (In Transit to Courier)**:
   - Parcel handed over to the courier (e.g. Steadfast, Pathao, RedX).
   - Customer receives an automated email notification that their parcel is on its way.
4. **`out_for_delivery` (Optional Delivery Milestone)**:
   - Courier rider is delivering the parcel today.
5. **`delivered` (Fulfilled & Paid)**:
   - Courier successfully collected Cash-on-Delivery and delivered the goods. Order is complete.
6. **`cancelled` (Restocked)**:
   - Customer requested cancellation or failed phone verification.
   - **Crucial**: Setting status to `cancelled` automatically triggers database inventory restitution, adding the item quantities back into available stock.

### Delivery Zones & Fees (Cash on Delivery)
- **Inside Dhaka**: ৳70 flat delivery fee.
- **Outside Dhaka**: ৳120 flat delivery fee across all districts of Bangladesh.
- **Store Pickup**: ৳0 (free).

---

## 5. Homepage Visual Merchandising

Navigate to **Admin → Storefront** (`/admin/storefront`) to adjust homepage merchandising without touching code.

### Hero Carousel Manager
- **Headline & Subtext**: Customize the primary promotional message.
- **Badge Text & Color Preset**: Set seasonal labels (e.g. *"New Collection"*, *"Limited Stock"*) with presets (`gold`, `forest`, `crimson`, `ocean`, `slate`).
- **Destination Link**: Specify where the banner links (e.g. `/products?category=bamboo-crafts`).
- **Artwork Upload**: High-resolution wide banner image.
- **Active Toggle**: Enable or disable slides instantly.

### Category Collage Manager (7-Slot Grid)
The homepage features a curated **7-slot visual collage** of top product categories:
- Toggle categories between **Available** and **Featured in Collage** (maximum 7).
- Reorder slots using the **Up / Down** controls to assign which category occupies the primary prominent visual tile.
- Upload high-quality category cover photography (max 3 MB).

---

## 6. Staff & Security Administration

Navigate to **Admin → Staff** (`/admin/staff`) *(Admin role only)*.

### Adding New Staff
1. Have the employee create an account on the storefront via `/signup`.
2. Find their email in `/admin/staff`.
3. Select their role (`staff` or `admin`) and click **Update Role**.
4. The user will immediately gain access to `/admin`.

### Audit Trail
Every single role promotion or demotion is permanently written to the immutable `admin_audit_log` table, recording who performed the change, target user, old role, new role, and exact timestamp.

---

## 7. Customer Suggestions

Customers can recommend new artisanal items via the **"Suggest an Item"** button on the storefront.
- Submissions are delivered directly to the store owner inbox (`ADMIN_NOTIFICATION_EMAIL`).
- **Anti-Spam Bot Defense**: The form features an invisible honeypot trap. Automated spam bots attempting to spam the inbox are silently acknowledged without forwarding junk mail to your inbox.

---

## 8. Incident & Emergency Runbook

### Scenario A: Customer Requests Order Cancellation
- **Within 24 hours (Pending)**: If the customer calls or messages to cancel before dispatch:
  1. Open `/admin/orders/[id]`.
  2. Click **Update Status** → Select **Cancelled**.
  3. Enter cancellation notes (e.g. *"Customer requested cancellation via WhatsApp"*).
  4. The system automatically executes the `increment_stock` procedure, returning stock to the catalog.

### Scenario B: Physical Stock Does Not Match Database Count
If warehouse physical inventory is lower than the database count:
1. Immediately navigate to `/admin/products/[id]`.
2. Locate the specific variant row in the inventory table.
3. Overwrite the **Stock Qty** field with the true physical count.
4. Click **Save Product Changes**.
5. If physical stock is 0, the storefront will display *"Sold Out"* and prevent checkout.

### Scenario C: Customer Reports "Too Many Requests" (Rate Limit Error)
Bashtoli protects against checkout bots via Upstash Redis. Legitimate users will rarely see this unless clicking rapidly:
1. Ask the customer to wait 60 seconds and refresh the checkout page.
2. In an emergency, the store administrator can log into the Upstash Redis Console and delete keys matching `rl:order:*` or `rl:checkout:*`.

### Scenario D: Courier Cash-on-Delivery Reconciliation
When courier disbursements are deposited to the company bank account:
1. Cross-reference the courier consignment bill against orders marked `delivered` in `/admin/orders`.
2. Verify total collected: `Item Subtotal + Delivery Fee (৳70 or ৳120)`.
3. If an order was rejected by the customer at doorstep:
   - Mark order status as **Cancelled** in the admin panel to replenish inventory once the returned parcel arrives back at the warehouse.
