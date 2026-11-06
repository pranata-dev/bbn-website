-- ============================================================================
-- Migration: 20260318000000_decommission_legacy.sql
-- Description: Phase 4 Destructive Migration (Staged - To be applied ONLY after
--              Step 3 Live Data Audit & Admin Verification passes).
-- ============================================================================

-- 1. Drop deprecated tables
DROP TABLE IF EXISTS public.regular_class_details CASCADE;
DROP TABLE IF EXISTS public.uts_package_details CASCADE;
DROP TABLE IF EXISTS public.kelas_besar_details CASCADE;
DROP TABLE IF EXISTS public.payments CASCADE;
DROP TABLE IF EXISTS public.user_subject_access CASCADE;

-- 2. Drop deprecated columns from public.users
ALTER TABLE public.users DROP COLUMN IF EXISTS full_name CASCADE;
ALTER TABLE public.users DROP COLUMN IF EXISTS student_category CASCADE;
ALTER TABLE public.users DROP COLUMN IF EXISTS package_type CASCADE;
ALTER TABLE public.users DROP COLUMN IF EXISTS billing_cycle CASCADE;
ALTER TABLE public.users DROP COLUMN IF EXISTS session_token CASCADE;
ALTER TABLE public.users DROP COLUMN IF EXISTS access_ends_at CASCADE;

-- 3. Drop deprecated columns from content and exam tables
ALTER TABLE public.tryouts DROP COLUMN IF EXISTS question_ids CASCADE;
ALTER TABLE public.tryouts DROP COLUMN IF EXISTS subject CASCADE;
ALTER TABLE public.questions DROP COLUMN IF EXISTS subject CASCADE;
ALTER TABLE public.materials DROP COLUMN IF EXISTS subject CASCADE;

-- 4. Clean up legacy enums if no remaining columns depend on them
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'Subject' OR typname = 'subject') THEN
        DROP TYPE IF EXISTS public."Subject" CASCADE;
        DROP TYPE IF EXISTS public.subject CASCADE;
    END IF;

    IF EXISTS (SELECT 1 FROM pg_type WHERE typname = 'StudentRole' OR typname = 'studentrole') THEN
        DROP TYPE IF EXISTS public."StudentRole" CASCADE;
        DROP TYPE IF EXISTS public.studentrole CASCADE;
    END IF;
EXCEPTION WHEN OTHERS THEN
    -- If any object still references the type, don't fail the migration
    NULL;
END $$;

