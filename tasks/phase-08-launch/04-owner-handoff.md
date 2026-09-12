# Task: Store Owner Handoff, Operations Guide & Incident Runbook

**Phase:** 8 — QA & Launch  
**Week:** 12

## Goal

Deliver the Comprehensive Store Owner & Staff Operations Manual (`docs/admin-guide.md`), train the business owner and operational staff to independently manage products, variants, orders, and homepage visual content, and establish an incident runbook for operational emergencies.

## Requirements

1. **Comprehensive Admin Operations Guide (`docs/admin-guide.md`)**:
   - **Catalog & Variant Management**:
     - Adding and updating products (title, slug, base price, compare-at price, description, category assignment).
     - Managing multi-variant matrices (sizes, materials, SKUs, inventory counts per variant).
     - Image handling: 2 MB limit per image, drag-and-drop reordering, primary cover selection, and automatic optimization.
     - Product visibility: draft mode, active status, and low-stock warning indicators.
   - **Order Processing & Fulfillment Workflow**:
     - Order status lifecycle: `pending` → `confirmed` → `processing` → `shipped` → `delivered` (or `cancelled`).
     - Delivery zone logistics: Inside Dhaka (80 BDT) vs Outside Dhaka (150 BDT) Cash-on-Delivery handling.
     - Inspecting customer delivery notes, phone numbers, and full itemized order breakdowns.
     - Understanding atomic stock reservation and automatic stock restoration upon cancellation.
   - **Storefront Customization Controls**:
     - **Hero Carousel**: Adding slides, setting badge text, headline, subtitle, primary/secondary CTA links, uploading slide artwork, toggling active states, and reordering.
     - **Category Collage**: Managing the 7-slot visual homepage grid, assigning categories to specific slot configurations, and uploading 3 MB category covers to the `category-covers` storage bucket.
   - **Customer Suggestions**:
     - Reviewing customer-submitted item recommendations, customer contact details, and filtering out spam (bot protection verification).
   - **Role-Based Access Control (Admin vs Staff)**:
     - Clear distinction between roles: Admin (full system access, role assignment, financial overview) vs Staff (catalog and order management).
     - Procedure for inviting new staff members and safely promoting users.

2. **Incident & Emergency Runbook**:
   - **Customer Order Cancellations**:
     - Step-by-step procedure to cancel an order from the admin interface.
     - Verifying that cancelled order items automatically increment product variant inventory back to stock.
   - **Inventory Discrepancy & Emergency Sold-Out Recovery**:
     - Immediate steps to clamp stock or hide a sold-out product from public storefront.
     - Handling overselling edge cases if physical inventory differs from database count.
   - **Rate Limit False-Positive Troubleshooting**:
     - How to diagnose customer reports of HTTP 429 ("Too many requests") via Upstash Redis console.
     - Safe steps to flush or adjust rate limit keys (`rl:order:*`, `rl:checkout:*`, `rl:auth:*`).
   - **Courier & COD Payment Reconciliation**:
     - Reconciling Cash-on-Delivery collections with courier disbursement statements.
     - Handling returned parcels / failed deliveries and status transitions.

3. **Hands-On Training & Validation Session**:
   - Conduct structured walkthrough session with the business owner:
     1. Owner independently creates a product with 2 variants, sets inventory, and uploads images.
     2. Owner processes a test order from `pending` to `shipped`.
     3. Owner updates a hero banner slide and verifies live changes on the homepage.
     4. Owner reviews a submitted customer suggestion.
     5. Owner simulates an order cancellation and verifies stock replenishment.
   - Provide technical support contact information, escalation paths, and hosting maintenance schedule.

## Acceptance Criteria

- [x] Complete `docs/admin-guide.md` and `docs/handover.md` created with clear, structured operational instructions.
- [x] Incident Runbook documented covering order cancellations, stock recovery, rate limit unblocking, and COD reconciliation.
- [x] Store owner operational guides for product creation, order status updates, and hero banner edits verified.
- [x] Staff vs Admin permission levels clearly documented and established.
- [x] Post-launch support contact and bug reporting escalation pathways established.

## Dependencies

- [03-production-deployment.md](./03-production-deployment.md)
- Complete admin features across Catalog, Orders, Storefront Manager, and Suggestions.

## Files to Modify

| File | Action | Description |
|---|---|---|
| `docs/admin-guide.md` | Create | Comprehensive operations guide and incident runbook |
| `docs/handover.md` | Create | Comprehensive project handover, credentials, workflows, and sign-off |
| `docs/deployment.md` | Update | Add post-launch maintenance references |

## Definition of Done

- [x] `docs/admin-guide.md` and `docs/handover.md` written, verified, and published in repository.
- [x] Operational guides and incident runbook verified with simulated order cancellation and restock.
- [x] Hand-off sign-off documented and Phase 8 complete.
