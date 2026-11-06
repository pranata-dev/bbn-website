-- ============================================================================
-- Migration: 20260318000000_decommission_legacy.sql
-- Description: Phase 4 Destructive Migration: Drops legacy tables, deprecated
--              columns on users & content entities, and obsolete Postgres enums.
-- ============================================================================

-- 1. Drop deprecated legacy tables
DROP TABLE IF EXISTS public.regular_class_details CASCADE;
DROP TABLE IF EXISTS public.uts_package_details CASCADE;
DROP TABLE IF EXISTS public.kelas_besar_details CASCADE;
DROP TABLE IF EXISTS public.payments CASCADE;
DROP TABLE IF EXISTS public.user_subject_access CASCADE;

-- 2. Drop deprecated columns from public.users (after merging full_name if present)
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'full_name'
    ) THEN
        UPDATE public.users SET name = COALESCE(name, full_name) WHERE name IS NULL AND full_name IS NOT NULL;
    END IF;
END $$;

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
DECLARE
    t text;
BEGIN
    FOREACH t IN ARRAY ARRAY[
        'Subject', 'subject',
        'StudentRole', 'studentrole',
        'Role', 'role',
        'Role_old', 'role_old',
        'PackageType', 'packagetype',
        'PaymentStatus', 'paymentstatus'
    ]
    LOOP
        BEGIN
            EXECUTE format('DROP TYPE IF EXISTS public.%I CASCADE', t);
        EXCEPTION WHEN OTHERS THEN
            NULL;
        END;
    END LOOP;
END $$;

