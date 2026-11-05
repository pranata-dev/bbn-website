-- ============================================================================
-- Migration: 20260316000000_baseline_and_rls.sql
-- Description: Establishes public.is_admin() helper, fixes recursive RLS policy,
--              and configures self-access policies on core student tables.
-- ============================================================================

-- 1. Helper function for admin check without recursive RLS
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.users
    WHERE auth_id = auth.uid()
      AND role = 'ADMIN'
  );
$$;

-- 2. Fix RLS on public.users
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins have full access to users" ON public.users;
DROP POLICY IF EXISTS "Admins can read all data" ON public.users;
DROP POLICY IF EXISTS "Users can view own profile" ON public.users;
DROP POLICY IF EXISTS "Users can update own profile" ON public.users;

CREATE POLICY "Users can view own profile"
ON public.users FOR SELECT
USING (auth_id = auth.uid() OR public.is_admin());

CREATE POLICY "Users can update own profile"
ON public.users FOR UPDATE
USING (auth_id = auth.uid() OR public.is_admin());

CREATE POLICY "Admins have full access to users"
ON public.users FOR ALL
USING (public.is_admin());

-- 3. RLS for submissions & answers
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own submissions" ON public.submissions;
CREATE POLICY "Users can view own submissions"
ON public.submissions FOR SELECT
USING (user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()) OR public.is_admin());

DROP POLICY IF EXISTS "Users can update own submissions" ON public.submissions;
CREATE POLICY "Users can update own submissions"
ON public.submissions FOR UPDATE
USING (user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()) OR public.is_admin());

ALTER TABLE public.answers ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own answers" ON public.answers;
CREATE POLICY "Users can view own answers"
ON public.answers FOR SELECT
USING (
  submission_id IN (
    SELECT s.id FROM public.submissions s
    JOIN public.users u ON s.user_id = u.id
    WHERE u.auth_id = auth.uid()
  ) OR public.is_admin()
);

DROP POLICY IF EXISTS "Users can upsert own answers" ON public.answers;
CREATE POLICY "Users can upsert own answers"
ON public.answers FOR ALL
USING (
  submission_id IN (
    SELECT s.id FROM public.submissions s
    JOIN public.users u ON s.user_id = u.id
    WHERE u.auth_id = auth.uid()
  ) OR public.is_admin()
);

