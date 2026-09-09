-- ============================================================
-- 001_types_and_extensions.sql
-- Extensions, custom ENUM types, and isolated private schema.
-- Run before table definitions.
-- ============================================================

-- ── Extensions ──────────────────────────────────────────────
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── Application ENUM Types ──────────────────────────────────

-- User roles for access control
CREATE TYPE public.user_role AS ENUM ('customer', 'staff', 'admin');

-- How the customer intends to receive their order
CREATE TYPE public.fulfillment_type AS ENUM ('delivery', 'pickup');

-- Order lifecycle states (see PRD §Order Status Workflow)
CREATE TYPE public.order_status AS ENUM (
  'pending',
  'confirmed',
  'shipped',
  'out_for_delivery',
  'delivered',
  'cancelled'
);

-- Delivery zones for fee calculation (null when fulfillment is pickup)
CREATE TYPE public.delivery_zone AS ENUM ('inside_dhaka', 'outside_dhaka');

-- ── Private Schema for Security Functions ───────────────────
-- In Supabase, every function in the 'public' schema is exposed over
-- PostgREST as an RPC endpoint. Helper functions strictly used for
-- Row-Level Security (RLS) live in 'app_private' to prevent exposure.
CREATE SCHEMA IF NOT EXISTS app_private;
GRANT USAGE ON SCHEMA app_private TO authenticated, service_role, anon;
