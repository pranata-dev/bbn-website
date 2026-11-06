-- ============================================================================
-- Migration: 20260316000000_baseline_and_rls.sql
-- Description: Establishes users.role, public.is_admin() helper, baseline columns,
--              and configures self-access & admin policies on core student tables.
-- ============================================================================

-- 0. Ensure role column exists on public.users with valid check constraint
ALTER TABLE public.users ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'STUDENT';

DO $$
BEGIN
    -- Normalize any legacy/null values to STUDENT
    UPDATE public.users 
    SET role = 'STUDENT' 
    WHERE role IS NULL OR role NOT IN ('ADMIN', 'STUDENT');

    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'users_role_check'
    ) THEN
        ALTER TABLE public.users ADD CONSTRAINT users_role_check CHECK (role IN ('STUDENT', 'ADMIN'));
    END IF;
EXCEPTION WHEN duplicate_object THEN
    NULL;
END $$;

-- Bootstrap admin account
UPDATE public.users SET role = 'ADMIN' WHERE email = 'dzulfikaryudha@gmail.com';

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
    WHERE auth_id::text = auth.uid()::text
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
USING (auth_id::text = auth.uid()::text OR public.is_admin());

CREATE POLICY "Users can update own profile"
ON public.users FOR UPDATE
USING (auth_id::text = auth.uid()::text OR public.is_admin());

CREATE POLICY "Admins have full access to users"
ON public.users FOR ALL
USING (public.is_admin());

-- 3. Ensure baseline status columns exist on tryouts & materials before RLS
ALTER TABLE public.tryouts ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;

-- If status column exists, sync is_active from status
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'tryouts' AND column_name = 'status'
    ) THEN
        UPDATE public.tryouts SET is_active = (status::text = 'ACTIVE') WHERE status IS NOT NULL;
    END IF;
END $$;

ALTER TABLE public.materials ADD COLUMN IF NOT EXISTS is_published BOOLEAN NOT NULL DEFAULT true;

-- 4. RLS for submissions & answers
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own submissions" ON public.submissions;
CREATE POLICY "Users can view own submissions"
ON public.submissions FOR SELECT
USING (user_id IN (SELECT id FROM public.users WHERE auth_id::text = auth.uid()::text) OR public.is_admin());

DROP POLICY IF EXISTS "Users can insert own submissions" ON public.submissions;
CREATE POLICY "Users can insert own submissions"
ON public.submissions FOR INSERT
WITH CHECK (user_id IN (SELECT id FROM public.users WHERE auth_id::text = auth.uid()::text) OR public.is_admin());

DROP POLICY IF EXISTS "Users can update own submissions" ON public.submissions;
CREATE POLICY "Users can update own submissions"
ON public.submissions FOR UPDATE
USING (user_id IN (SELECT id FROM public.users WHERE auth_id::text = auth.uid()::text) OR public.is_admin());

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
    WHERE u.auth_id::text = auth.uid()::text
  ) OR public.is_admin()
);

DROP POLICY IF EXISTS "Users can upsert own answers" ON public.answers;
CREATE POLICY "Users can upsert own answers"
ON public.answers FOR ALL
USING (
  submission_id IN (
    SELECT s.id FROM public.submissions s
    JOIN public.users u ON s.user_id = u.id
    WHERE u.auth_id::text = auth.uid()::text
  ) OR public.is_admin()
)
WITH CHECK (
  submission_id IN (
    SELECT s.id FROM public.submissions s
    JOIN public.users u ON s.user_id = u.id
    WHERE u.auth_id::text = auth.uid()::text
  ) OR public.is_admin()
);

DROP POLICY IF EXISTS "Admins have full access to answers" ON public.answers;
CREATE POLICY "Admins have full access to answers"
ON public.answers FOR ALL
USING (public.is_admin());

-- 5. RLS for tryouts & questions
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

-- 6. RLS for registrations
ALTER TABLE public.registrations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can insert registrations" ON public.registrations;
CREATE POLICY "Anyone can insert registrations"
ON public.registrations FOR INSERT
WITH CHECK (true);

DROP POLICY IF EXISTS "Users can view own registrations" ON public.registrations;
CREATE POLICY "Users can view own registrations"
ON public.registrations FOR SELECT
USING (
  user_id IN (SELECT id FROM public.users WHERE auth_id::text = auth.uid()::text)
  OR email = auth.jwt()->>'email'
  OR public.is_admin()
);

DROP POLICY IF EXISTS "Admins have full access to registrations" ON public.registrations;
CREATE POLICY "Admins have full access to registrations"
ON public.registrations FOR ALL
USING (public.is_admin());
