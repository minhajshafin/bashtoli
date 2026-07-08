-- ============================================================
-- 001_enums.sql
-- Create all application-level enum types.
-- Run before any table migration that references these types.
-- ============================================================

-- User roles for access control
CREATE TYPE user_role AS ENUM ('customer', 'staff', 'admin');

-- How the customer intends to receive their order
CREATE TYPE fulfillment_type AS ENUM ('delivery', 'pickup');

-- Order lifecycle states (see PRD §Order Status Workflow)
CREATE TYPE order_status AS ENUM (
  'pending',
  'confirmed',
  'shipped',
  'out_for_delivery',
  'delivered',
  'cancelled'
);

-- Delivery zones for fee calculation (null = pickup, no zone applies)
CREATE TYPE delivery_zone AS ENUM ('inside_dhaka', 'outside_dhaka');
