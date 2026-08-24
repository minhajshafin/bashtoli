-- ============================================================
-- 013_security_hardening.sql
--
-- Fixes three findings from the v2 security audit:
--
-- H-NEW-1: Drop the old 12-param place_order() overload that
--          was created by migration 010 and never removed by 011.
--          Because 011 used CREATE OR REPLACE with a DIFFERENT
--          parameter list, PostgreSQL kept both overloads alive.
--          The old version accepts caller-supplied financial totals
--          (p_subtotal, p_delivery_fee, p_total) and was still
--          callable directly via the PostgREST /rpc/ endpoint.
--
-- H-NEW-2: The "orders: customer cancel own" RLS UPDATE policy
--          only checked ownership (user_id = auth.uid()), not
--          which columns were being changed. A customer could
--          PATCH their own order's total, status, address, etc.
--          directly via the PostgREST API.
--          Fixed to only allow status → 'cancelled' on pending orders.
--
-- L-NEW-5: admin_audit_log rows had no immutability enforcement.
--          A compromised service-role key could DELETE or UPDATE
--          audit records. Fixed via a BEFORE UPDATE/DELETE trigger.
-- ============================================================


-- ── H-NEW-1: Drop the old vulnerable place_order overload ────
-- The old function accepted p_subtotal, p_delivery_fee, p_total
-- from the caller. Drop it by its exact 12-parameter signature.
DROP FUNCTION IF EXISTS public.place_order(
  uuid,    -- p_user_id
  text,    -- p_customer_name
  text,    -- p_phone
  text,    -- p_guest_email
  text,    -- p_address
  text,    -- p_notes
  text,    -- p_fulfillment_type
  text,    -- p_delivery_zone
  numeric, -- p_subtotal      ← the dangerous caller-supplied param
  numeric, -- p_delivery_fee  ← the dangerous caller-supplied param
  numeric, -- p_total         ← the dangerous caller-supplied param
  jsonb    -- p_items
);


-- ── H-NEW-2: Narrow the customer cancel UPDATE policy ─────────
-- Old policy allowed updating ANY column on owned orders.
-- New policy strictly allows: status = 'pending' → 'cancelled' only.
DROP POLICY IF EXISTS "orders: customer cancel own" ON public.orders;

CREATE POLICY "orders: customer cancel own"
  ON public.orders
  FOR UPDATE
  USING (
    -- The row being targeted must belong to this user AND still be pending
    user_id = auth.uid()
    AND status = 'pending'
  )
  WITH CHECK (
    -- The resulting row must still belong to this user AND status must be 'cancelled'
    user_id = auth.uid()
    AND status = 'cancelled'
  );


-- ── L-NEW-5: Make admin_audit_log rows immutable ──────────────
-- The service role can still INSERT (bypasses RLS), but UPDATE
-- and DELETE are blocked at the trigger level for all roles.
CREATE OR REPLACE FUNCTION public.prevent_audit_log_modification()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  RAISE EXCEPTION 'admin_audit_log rows are immutable and cannot be modified or deleted.';
END;
$$;

DROP TRIGGER IF EXISTS trg_audit_log_immutable ON public.admin_audit_log;
CREATE TRIGGER trg_audit_log_immutable
  BEFORE UPDATE OR DELETE ON public.admin_audit_log
  FOR EACH ROW EXECUTE FUNCTION public.prevent_audit_log_modification();
