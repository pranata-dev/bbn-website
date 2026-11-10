-- ============================================================================
-- Migration: 20260319000000_harden_rls_policies.sql
-- Description: Hardens Row-Level Security (RLS) across users, questions,
--              submissions, answers, materials, and storage buckets to prevent
--              privilege escalation, answer key leakage, score/timer tampering,
--              and freemium paywall bypass.
-- ============================================================================

-- 1. Prevent privilege escalation on public.users (role, is_active, auth_id)
CREATE OR REPLACE FUNCTION public.prevent_user_privilege_escalation()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Allow service_role, postgres, or verified admins to modify privileged fields
  IF current_setting('role', true) IN ('anon', 'authenticated') AND NOT public.is_admin() THEN
    NEW.role := OLD.role;
    NEW.is_active := OLD.is_active;
    NEW.auth_id := OLD.auth_id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_user_privilege_escalation ON public.users;
CREATE TRIGGER trg_prevent_user_privilege_escalation
BEFORE UPDATE ON public.users
FOR EACH ROW
EXECUTE FUNCTION public.prevent_user_privilege_escalation();

DROP POLICY IF EXISTS "Users can update own profile" ON public.users;
CREATE POLICY "Users can update own profile"
ON public.users FOR UPDATE
USING (auth_id::text = auth.uid()::text OR public.is_admin())
WITH CHECK (
  (auth_id::text = auth.uid()::text AND role = 'STUDENT')
  OR public.is_admin()
);

-- 2. Prevent direct client-side answer key & explanation leakage on public.questions
-- Student question delivery is handled exclusively via server API routes using service_role
-- (/api/tryouts/[id]/start strips correct_answer & explanation; /api/tryouts/[id]/submission gates review).
DROP POLICY IF EXISTS "Anyone can read questions" ON public.questions;
DROP POLICY IF EXISTS "Admins can read questions" ON public.questions;
CREATE POLICY "Admins can read questions"
ON public.questions FOR SELECT
USING (public.is_admin());

-- 3. Prevent direct client-side score, timer, and answer tampering on submissions & answers
-- All exam start, answer auto-save, and final grading mutations execute server-side via service_role.
DROP POLICY IF EXISTS "Users can insert own submissions" ON public.submissions;
DROP POLICY IF EXISTS "Users can update own submissions" ON public.submissions;
DROP POLICY IF EXISTS "Users can upsert own answers" ON public.answers;

-- 4. Enforce freemium & subscription track entitlement on public.materials
CREATE OR REPLACE FUNCTION public.can_access_material_row(
  p_course_id TEXT,
  p_is_free_preview BOOLEAN
)
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT
    COALESCE(p_is_free_preview, false)
    OR public.is_admin()
    OR EXISTS (
      SELECT 1
      FROM public.subscriptions s
      JOIN public.users u ON u.id = s.user_id
      LEFT JOIN public.courses c ON c.id = p_course_id
      WHERE u.auth_id::text = auth.uid()::text
        AND s.status = 'ACTIVE'
        AND s.plan_code <> 'FREE'
        AND (s.expires_at IS NULL OR s.expires_at > now())
        AND (
          s.track = 'ALL'
          OR c.track IS NULL
          OR c.track = 'ALL'
          OR s.track = c.track
        )
    );
$$;

DROP POLICY IF EXISTS "Anyone can read published materials" ON public.materials;
CREATE POLICY "Entitled users can read published materials"
ON public.materials FOR SELECT
USING (
  (is_published = true AND public.can_access_material_row(course_id, is_free_preview))
  OR public.is_admin()
);

-- 5. Ensure Admins and owning users can read payment-proofs objects regardless of subfolder
DROP POLICY IF EXISTS "Users can read own payment proofs or admin" ON storage.objects;
CREATE POLICY "Users can read own payment proofs or admin"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'payment-proofs'
  AND (
    public.is_admin()
    OR (storage.foldername(name))[1] = auth.uid()::text
  )
);

