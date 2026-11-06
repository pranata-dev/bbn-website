-- ============================================================================
-- Migration: 20260316000000_baseline_and_rls.sql
-- Description: Establishes public.is_admin() helper, fixes recursive RLS policy,
--              and configures self-access & admin policies on core student tables.
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

DROP POLICY IF EXISTS "Users can insert own submissions" ON public.submissions;
CREATE POLICY "Users can insert own submissions"
ON public.submissions FOR INSERT
WITH CHECK (user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()) OR public.is_admin());

DROP POLICY IF EXISTS "Users can update own submissions" ON public.submissions;
CREATE POLICY "Users can update own submissions"
ON public.submissions FOR UPDATE
USING (user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()) OR public.is_admin());

DROP POLICY IF EXISTS "Admins have full access to submissions" ON public.submissions;
CREATE POLICY "Admins have full access to submissions"
ON public.submissions FOR ALL
USING (public.is_admin());

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
)
WITH CHECK (
  submission_id IN (
    SELECT s.id FROM public.submissions s
    JOIN public.users u ON s.user_id = u.id
    WHERE u.auth_id = auth.uid()
  ) OR public.is_admin()
);

DROP POLICY IF EXISTS "Admins have full access to answers" ON public.answers;
CREATE POLICY "Admins have full access to answers"
ON public.answers FOR ALL
USING (public.is_admin());

-- 4. RLS for tryouts & questions
ALTER TABLE public.tryouts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view active tryouts" ON public.tryouts;
CREATE POLICY "Anyone can view active tryouts"
ON public.tryouts FOR SELECT
USING (is_active = true OR public.is_admin());

DROP POLICY IF EXISTS "Admins have full access to tryouts" ON public.tryouts;
CREATE POLICY "Admins have full access to tryouts"
ON public.tryouts FOR ALL
USING (public.is_admin());

ALTER TABLE public.questions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read questions" ON public.questions;
CREATE POLICY "Anyone can read questions"
ON public.questions FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Admins have full access to questions" ON public.questions;
CREATE POLICY "Admins have full access to questions"
ON public.questions FOR ALL
USING (public.is_admin());

-- 5. RLS for registrations
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can insert registrations" ON public.registrations;
CREATE POLICY "Anyone can insert registrations"
ON public.registrations FOR INSERT
WITH CHECK (true);

DROP POLICY IF EXISTS "Users can view own registrations" ON public.registrations;
CREATE POLICY "Users can view own registrations"
ON public.registrations FOR SELECT
USING (
  user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid())
  OR email = auth.jwt()->>'email'
  OR public.is_admin()
);

DROP POLICY IF EXISTS "Admins have full access to registrations" ON public.registrations;
CREATE POLICY "Admins have full access to registrations"
ON public.registrations FOR ALL
USING (public.is_admin());
