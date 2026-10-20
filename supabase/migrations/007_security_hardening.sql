-- ============================================================
-- 007_security_hardening.sql
-- Security Hardening: Atomic Order Cancellation RPC, Principle of
-- Least Privilege Grants, Safe Email-Only Guest Order Claiming,
-- and Table Hardening against Tampering.
-- ============================================================

-- ============================================================
-- 1. ATOMIC ORDER CANCELLATION RPC
-- ============================================================

-- ── cancel_order ─────────────────────────────────────────────
-- Allows authenticated customers to safely self-cancel their pending orders.
-- Restores variant stock quantities, logs status transition, and enforces
-- strict ownership inside a single ACID database transaction.
CREATE OR REPLACE FUNCTION public.cancel_order(
  p_order_id uuid
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id   uuid;
  v_status    public.order_status;
  v_caller_id uuid := auth.uid();
  v_item      RECORD;
BEGIN
  IF p_order_id IS NULL THEN
    RAISE EXCEPTION 'Order ID is required';
  END IF;

  IF v_caller_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  -- Lock the order row FOR UPDATE to prevent race conditions
  SELECT user_id, status
  INTO v_user_id, v_status
  FROM public.orders
  WHERE id = p_order_id
  FOR UPDATE;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Order not found';
  END IF;

  -- Require orders.user_id = auth.uid()
  IF v_user_id IS NULL OR v_user_id <> v_caller_id THEN
    RAISE EXCEPTION 'Unauthorized: Not the order owner';
  END IF;

  -- Require status = 'pending'
  IF v_status <> 'pending' THEN
    RAISE EXCEPTION 'Only pending orders can be cancelled';
  END IF;

  -- Update order status to 'cancelled'
  UPDATE public.orders
  SET status = 'cancelled',
      updated_at = now()
  WHERE id = p_order_id;

  -- Insert status transition history row
  INSERT INTO public.order_status_history (
    order_id,
    status,
    changed_by,
    changed_at
  )
  VALUES (
    p_order_id,
    'cancelled',
    v_caller_id,
    now()
  );

  -- Restore stock for every item associated with the order
  FOR v_item IN
    SELECT variant_id, qty
    FROM public.order_items
    WHERE order_id = p_order_id
  LOOP
    UPDATE public.product_variants
    SET stock_qty  = stock_qty + v_item.qty,
        updated_at = now()
    WHERE id = v_item.variant_id;
  END LOOP;
END;
$$;

REVOKE EXECUTE ON FUNCTION public.cancel_order(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.cancel_order(uuid) TO authenticated, service_role;


-- ============================================================
-- 2. DROP OBSOLETE CUSTOMER WRITE POLICIES
-- ============================================================
-- Cancellation is now strictly handled by the atomic cancel_order RPC above.
-- Direct customer UPDATE on orders and direct customer INSERT into
-- order_status_history are no longer permitted via PostgREST.

DROP POLICY IF EXISTS "orders: customer cancel own" ON public.orders;
DROP POLICY IF EXISTS "order_status_history: customer insert cancellation" ON public.order_status_history;


-- ============================================================
-- 3. RESTRICT ORDERS UPDATE COLUMN GRANTS
-- ============================================================
-- Codebase inspection shows that updateOrderStatusAction (and all other order
-- update paths) only modify the 'status' column. No user-session code modifies
-- price, totals, items, user_id, customer_name, phone, address, or order_number.
-- Revoking table-level UPDATE and granting UPDATE only on 'status' prevents
-- column-tampering via direct PostgREST calls.

REVOKE UPDATE ON public.orders FROM anon, authenticated;
GRANT UPDATE (status) ON public.orders TO authenticated;


-- ============================================================
-- 4. RECREATE GUEST ORDER LINKING FUNCTIONS (EMAIL ONLY)
-- ============================================================
-- Queries and links unclaimed guest orders by matching ONLY lower(guest_email)
-- with the caller's confirmed email from auth.users.
-- Phone matching is completely removed to prevent unverified phone hijacking.

CREATE OR REPLACE FUNCTION public.find_unclaimed_guest_orders()
RETURNS TABLE (
  id           uuid,
  order_number text,
  created_at   timestamptz,
  total        numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id      uuid := auth.uid();
  v_email        text;
  v_confirmed_at timestamptz;
BEGIN
  IF v_user_id IS NULL THEN
    RETURN;
  END IF;

  SELECT email, email_confirmed_at
  INTO v_email, v_confirmed_at
  FROM auth.users
  WHERE id = v_user_id;

  -- Require email to be present and confirmed
  IF v_email IS NULL OR v_confirmed_at IS NULL THEN
    RETURN;
  END IF;

  RETURN QUERY
  SELECT o.id, o.order_number, o.created_at, o.total
  FROM public.orders o
  WHERE o.user_id IS NULL
    AND lower(o.guest_email) = lower(v_email)
  ORDER BY o.created_at DESC;
END;
$$;

REVOKE ALL ON FUNCTION public.find_unclaimed_guest_orders() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.find_unclaimed_guest_orders() TO authenticated, service_role;


CREATE OR REPLACE FUNCTION public.claim_guest_orders(
  p_order_ids uuid[] DEFAULT NULL
)
RETURNS int
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id      uuid := auth.uid();
  v_email        text;
  v_confirmed_at timestamptz;
  claimed_count  int;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT email, email_confirmed_at
  INTO v_email, v_confirmed_at
  FROM auth.users
  WHERE id = v_user_id;

  IF v_email IS NULL OR v_confirmed_at IS NULL THEN
    RAISE EXCEPTION 'User email is not confirmed';
  END IF;

  UPDATE public.orders
  SET user_id    = v_user_id,
      updated_at = now()
  WHERE user_id IS NULL
    AND (p_order_ids IS NULL OR id = ANY(p_order_ids))
    AND lower(guest_email) = lower(v_email);

  GET DIAGNOSTICS claimed_count = ROW_COUNT;
  RETURN claimed_count;
END;
$$;

REVOKE ALL ON FUNCTION public.claim_guest_orders(uuid[]) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.claim_guest_orders(uuid[]) TO authenticated, service_role;


-- ============================================================
-- 5. REVOKE PRIVILEGES ON SENSITIVE TABLES FROM ANON
-- ============================================================
-- Evidence that no anon code path needs them:
-- 1. orders: Guest checkout executes place_order RPC via service_role (adminDb).
--    Guest order tracking (/order/[orderNumber]) and lookupOrderAction read
--    orders using createAdminClient() (service_role).
-- 2. order_items: Written by place_order (service_role) and read by order tracking (service_role)
--    or authenticated users (auth.uid() = user_id).
-- 3. order_status_history: Written by place_order (service_role), cancel_order (RPC), and
--    updateOrderStatusAction (service_role). Read only by customer or staff.
-- 4. profiles: Created by auth trigger handle_new_user(). Read/updated only by owner or staff.
-- No anon client query touches these tables via PostgREST.

REVOKE ALL ON public.orders, public.order_items, public.order_status_history, public.profiles FROM anon;


-- ============================================================
-- 6. REVOKE HIGH-RISK TABLE PRIVILEGES
-- ============================================================
-- Prevent non-administrative roles from executing TRUNCATE, attaching triggers,
-- or creating external foreign keys referencing public schema tables.

REVOKE TRUNCATE, TRIGGER, REFERENCES ON ALL TABLES IN SCHEMA public FROM anon, authenticated;
