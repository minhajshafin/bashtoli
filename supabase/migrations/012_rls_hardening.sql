-- ============================================================
-- 012_rls_hardening.sql
--
-- Fixes low-severity findings from the security audit:
--
-- L-3: profiles UPDATE policies missing proper WITH CHECK clauses.
--      Without proper WITH CHECK on the owner policy, a customer could
--      update their own profile row and escalate their role to 'admin'.
--      Also adds WITH CHECK to admin update policy.
--
-- L-5: order_status_history had no INSERT policies.
--      Added staff/admin INSERT policy and customer cancellation
--      INSERT policy for self-cancellations.
--
-- L-4: Admin audit trail — a dedicated admin_audit_log table records
--      every privileged role change (promote / demote).
-- ============================================================


-- ── L-3: Lock down profiles UPDATE policies ──────────────────
DROP POLICY IF EXISTS "profiles: owner can update own fields" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- Users may only update non-role fields of their own row (role cannot be changed).
CREATE POLICY "profiles: owner can update own fields"
  ON public.profiles
  FOR UPDATE
  USING (id = auth.uid())
  WITH CHECK (
    id = auth.uid()
    AND role = (SELECT p.role FROM public.profiles p WHERE p.id = auth.uid())
  );

-- Admins can update profiles with explicit WITH CHECK.
DROP POLICY IF EXISTS "profiles: admin can update any" ON public.profiles;
CREATE POLICY "profiles: admin can update any"
  ON public.profiles
  FOR UPDATE
  USING (public.is_admin())
  WITH CHECK (public.is_admin());


-- ── L-5: order_status_history INSERT policies ────────────────
DROP POLICY IF EXISTS "order_status_history: staff/admin insert" ON public.order_status_history;
CREATE POLICY "order_status_history: staff/admin insert"
  ON public.order_status_history
  FOR INSERT
  WITH CHECK (public.is_staff_or_admin());

DROP POLICY IF EXISTS "order_status_history: customer insert cancellation" ON public.order_status_history;
DROP POLICY IF EXISTS "Users can log cancelled status on own orders" ON public.order_status_history;
CREATE POLICY "order_status_history: customer insert cancellation"
  ON public.order_status_history
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND status = 'cancelled'
    AND EXISTS (
      SELECT 1 FROM public.orders o
      WHERE o.id = order_status_history.order_id
        AND o.user_id = auth.uid()
    )
  );


-- ── L-4: Admin audit log table ───────────────────────────────
CREATE TABLE IF NOT EXISTS public.admin_audit_log (
  id             uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  performed_by   uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
  action         text NOT NULL,          -- 'promote' | 'demote'
  target_user_id uuid,                   -- user whose role changed
  target_email   text,                   -- snapshot of email at time of action
  old_role       text,
  new_role       text,
  created_at     timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.admin_audit_log ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_audit_log: admin select"
  ON public.admin_audit_log
  FOR SELECT
  USING (public.is_admin());
