-- ============================================================
-- 019_guest_order_claiming.sql
--
-- Enables authenticated customers to safely query and claim past
-- guest orders placed with their verified email or phone number.
--
-- Resolves:
-- 1. Orders RLS policy ("orders: customer select own") blocked reading
--    guest orders because user_id IS NULL.
-- 2. Orders RLS policy ("orders: customer cancel own") blocked updating
--    guest orders to assign user_id = auth.uid().
--
-- Solution:
-- 1. Add SELECT RLS policy allowing authenticated users to see unclaimed
--    guest orders where phone matches their profile or email matches their auth JWT.
-- 2. Provide SECURITY DEFINER RPCs:
--    - find_unclaimed_guest_orders(): returns unclaimed orders matching user profile/auth.
--    - claim_guest_orders(p_order_ids): atomically links matching orders to auth.uid().
-- ============================================================

-- ── 1. SELECT RLS policy for unclaimed guest orders ───────────
DROP POLICY IF EXISTS "orders: customer select unclaimed guest orders" ON public.orders;

CREATE POLICY "orders: customer select unclaimed guest orders"
  ON public.orders FOR SELECT
  USING (
    user_id IS NULL
    AND auth.uid() IS NOT NULL
    AND (
      (guest_email IS NOT NULL AND lower(guest_email) = lower(auth.jwt()->>'email'))
      OR
      (phone IS NOT NULL AND phone = (SELECT p.phone FROM public.profiles p WHERE p.id = auth.uid()))
    )
  );

-- ── 2. RPC to find unclaimed guest orders ─────────────────────
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
  v_user_id uuid := auth.uid();
  v_email   text := auth.jwt()->>'email';
  v_phone   text;
BEGIN
  IF v_user_id IS NULL THEN
    RETURN;
  END IF;

  SELECT phone INTO v_phone
  FROM public.profiles
  WHERE id = v_user_id;

  RETURN QUERY
  SELECT o.id, o.order_number, o.created_at, o.total
  FROM public.orders o
  WHERE o.user_id IS NULL
    AND (
      (v_email IS NOT NULL AND lower(o.guest_email) = lower(v_email))
      OR
      (v_phone IS NOT NULL AND v_phone <> '' AND o.phone = v_phone)
    )
  ORDER BY o.created_at DESC;
END;
$$;

REVOKE ALL ON FUNCTION public.find_unclaimed_guest_orders() FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.find_unclaimed_guest_orders() TO authenticated, service_role;

-- ── 3. RPC to atomically claim guest orders ───────────────────
CREATE OR REPLACE FUNCTION public.claim_guest_orders(
  p_order_ids uuid[] DEFAULT NULL
)
RETURNS int
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id     uuid := auth.uid();
  v_email       text := auth.jwt()->>'email';
  v_phone       text;
  claimed_count int;
BEGIN
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  SELECT phone INTO v_phone
  FROM public.profiles
  WHERE id = v_user_id;

  UPDATE public.orders
  SET user_id    = v_user_id,
      updated_at = now()
  WHERE user_id IS NULL
    AND (p_order_ids IS NULL OR id = ANY(p_order_ids))
    AND (
      (v_email IS NOT NULL AND lower(guest_email) = lower(v_email))
      OR
      (v_phone IS NOT NULL AND v_phone <> '' AND phone = v_phone)
    );

  GET DIAGNOSTICS claimed_count = ROW_COUNT;
  RETURN claimed_count;
END;
$$;

REVOKE ALL ON FUNCTION public.claim_guest_orders(uuid[]) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.claim_guest_orders(uuid[]) TO authenticated, service_role;
