-- ============================================================================
-- Migration: 20260317000000_courses_and_subscriptions.sql
-- Description: Dynamic courses table, unified subscriptions table,
--              FK additions to content tables, and idempotent backfills.
-- ============================================================================

-- 1. Create courses table
CREATE TABLE IF NOT EXISTS public.courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug TEXT UNIQUE NOT NULL,
    code TEXT UNIQUE NOT NULL,
    title TEXT NOT NULL,
    track TEXT NOT NULL CHECK (track IN ('PHYSICS_SEM_3', 'NON_PHYSICS', 'LEGACY', 'ALL')),
    is_active BOOLEAN NOT NULL DEFAULT true,
    sort_order INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Ensure columns exist if table was already created earlier
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS code TEXT;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS track TEXT;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS sort_order INT NOT NULL DEFAULT 0;
ALTER TABLE public.courses ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ NOT NULL DEFAULT now();

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'courses_track_check'
    ) THEN
        ALTER TABLE public.courses ADD CONSTRAINT courses_track_check CHECK (track IN ('PHYSICS_SEM_3', 'NON_PHYSICS', 'LEGACY', 'ALL'));
    END IF;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'courses_slug_key'
    ) THEN
        ALTER TABLE public.courses ADD CONSTRAINT courses_slug_key UNIQUE (slug);
    END IF;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'courses_code_key'
    ) THEN
        ALTER TABLE public.courses ADD CONSTRAINT courses_code_key UNIQUE (code);
    END IF;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Seed standard and legacy courses
INSERT INTO public.courses (slug, code, title, track, sort_order) VALUES
    ('fisdas2', 'FISDAS2', 'Fisika Dasar 2', 'LEGACY', 1),
    ('fismat', 'FISMAT', 'Fisika Matematika', 'LEGACY', 2),
    ('mekanika-newton', 'MEK_NEWTON', 'Mekanika Newton', 'PHYSICS_SEM_3', 10),
    ('fisika-matematika-lanjut', 'FISMAT_LANJUT', 'Fisika-Matematika Lanjut', 'PHYSICS_SEM_3', 20),
    ('gelombang', 'GELOMBANG', 'Gelombang', 'PHYSICS_SEM_3', 30),
    ('elektrostatika', 'ELEKTROSTATIKA', 'Elektrostatika', 'PHYSICS_SEM_3', 40),
    ('termodinamika', 'TERMODINAMIKA', 'Termodinamika', 'PHYSICS_SEM_3', 50),
    ('fisika-komputasi', 'FIS_KOMPUTASI', 'Fisika Komputasi', 'PHYSICS_SEM_3', 60),
    ('fisika-dasar-1', 'FISDAS1', 'Fisika Dasar 1', 'NON_PHYSICS', 100),
    ('fisika-dasar-2', 'FISDAS2_GEN', 'Fisika Dasar 2 (Umum)', 'NON_PHYSICS', 110),
    ('statistika-dan-analisis-data', 'STATISTIKA', 'Statistika dan Analisis Data', 'NON_PHYSICS', 120),
    ('matematika-1', 'MATEMATIKA1', 'Matematika 1', 'NON_PHYSICS', 130)
ON CONFLICT (slug) DO UPDATE SET
    code = EXCLUDED.code,
    title = EXCLUDED.title,
    track = EXCLUDED.track,
    sort_order = EXCLUDED.sort_order;

-- 2. Add course_id to questions, tryouts, materials
ALTER TABLE public.questions ADD COLUMN IF NOT EXISTS course_id UUID REFERENCES public.courses(id) ON DELETE SET NULL;
ALTER TABLE public.tryouts ADD COLUMN IF NOT EXISTS course_id UUID REFERENCES public.courses(id) ON DELETE SET NULL;
ALTER TABLE public.tryouts ADD COLUMN IF NOT EXISTS is_free_sample BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.materials ADD COLUMN IF NOT EXISTS course_id UUID REFERENCES public.courses(id) ON DELETE SET NULL;

-- Backfill course_id from legacy subject column where possible
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'questions' AND column_name = 'subject'
    ) THEN
        UPDATE public.questions q
        SET course_id = c.id
        FROM public.courses c
        WHERE q.course_id IS NULL AND c.code = q.subject::text;
    END IF;

    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'tryouts' AND column_name = 'subject'
    ) THEN
        UPDATE public.tryouts t
        SET course_id = c.id
        FROM public.courses c
        WHERE t.course_id IS NULL AND c.code = t.subject::text;
    END IF;

    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'materials' AND column_name = 'subject'
    ) THEN
        UPDATE public.materials m
        SET course_id = c.id
        FROM public.courses c
        WHERE m.course_id IS NULL AND c.code = m.subject::text;
    END IF;
END $$;

-- 3. Create subscriptions table
CREATE TABLE IF NOT EXISTS public.subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    plan_code TEXT NOT NULL CHECK (plan_code IN ('FREE', 'MONTHLY', 'SEMESTER')),
    track TEXT NOT NULL CHECK (track IN ('PHYSICS_SEM_3', 'NON_PHYSICS', 'LEGACY', 'ALL')),
    status TEXT NOT NULL CHECK (status IN ('PENDING', 'ACTIVE', 'EXPIRED', 'CANCELLED')),
    starts_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    expires_at TIMESTAMPTZ, -- NULL for FREE tier
    registration_id UUID REFERENCES public.registrations(id) ON DELETE SET NULL,
    granted_by TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS subscriptions_user_status_expires_idx 
ON public.subscriptions(user_id, status, expires_at);

-- Add helper columns to registrations table
ALTER TABLE public.registrations ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES public.users(id) ON DELETE SET NULL;
ALTER TABLE public.registrations ADD COLUMN IF NOT EXISTS plan_code TEXT;
ALTER TABLE public.registrations ADD COLUMN IF NOT EXISTS track TEXT;

-- 4. Backfill subscriptions for existing paid users
-- Active paid users in user_subject_access receive an ACTIVE subscription with expires_at = now() + 180 days
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.tables 
        WHERE table_schema = 'public' AND table_name = 'user_subject_access'
    ) THEN
        INSERT INTO public.subscriptions (user_id, plan_code, track, status, starts_at, expires_at, granted_by, notes)
        SELECT DISTINCT ON (usa.user_id)
            usa.user_id,
            'SEMESTER' AS plan_code,
            'LEGACY' AS track,
            'ACTIVE' AS status,
            now() AS starts_at,
            now() + INTERVAL '180 days' AS expires_at,
            'SYSTEM_MIGRATION' AS granted_by,
            'Backfilled from user_subject_access' AS notes
        FROM public.user_subject_access usa
        WHERE usa.is_active = true
          AND usa.role::text IN ('STUDENT_BASIC', 'STUDENT_PREMIUM', 'UTS_FLUX', 'UTS_SENKU', 'UTS_EINSTEIN')
          AND NOT EXISTS (
              SELECT 1 FROM public.subscriptions s
              WHERE s.user_id = usa.user_id AND s.status = 'ACTIVE'
          );
    END IF;
END $$;

-- Ensure all existing users have a FREE tier baseline if they don't have an active subscription
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'users' AND column_name = 'student_category'
    ) THEN
        EXECUTE '
            INSERT INTO public.subscriptions (user_id, plan_code, track, status, starts_at, expires_at, granted_by)
            SELECT 
                u.id,
                ''FREE'',
                CASE 
                    WHEN u.student_category IN (''PHYSICS_SEM_3'', ''NON_PHYSICS'', ''LEGACY'') THEN u.student_category 
                    ELSE ''ALL'' 
                END,
                ''ACTIVE'',
                now(),
                NULL,
                ''SYSTEM_BASELINE''
            FROM public.users u
            WHERE NOT EXISTS (
                SELECT 1 FROM public.subscriptions s 
                WHERE s.user_id = u.id AND s.status = ''ACTIVE''
            )';
    ELSE
        INSERT INTO public.subscriptions (user_id, plan_code, track, status, starts_at, expires_at, granted_by)
        SELECT 
            u.id,
            'FREE',
            'ALL',
            'ACTIVE',
            now(),
            NULL,
            'SYSTEM_BASELINE'
        FROM public.users u
        WHERE NOT EXISTS (
            SELECT 1 FROM public.subscriptions s 
            WHERE s.user_id = u.id AND s.status = 'ACTIVE'
        );
    END IF;
END $$;

-- 5. RLS policies for courses & subscriptions
ALTER TABLE public.courses ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view active courses" ON public.courses;
CREATE POLICY "Anyone can view active courses"
ON public.courses FOR SELECT
USING (is_active = true OR public.is_admin());

DROP POLICY IF EXISTS "Admins can manage courses" ON public.courses;
CREATE POLICY "Admins can manage courses"
ON public.courses FOR ALL
USING (public.is_admin());

ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view own subscriptions" ON public.subscriptions;
CREATE POLICY "Users can view own subscriptions"
ON public.subscriptions FOR SELECT
USING (user_id IN (SELECT id FROM public.users WHERE auth_id = auth.uid()) OR public.is_admin());

DROP POLICY IF EXISTS "Admins can manage subscriptions" ON public.subscriptions;
CREATE POLICY "Admins can manage subscriptions"
ON public.subscriptions FOR ALL
USING (public.is_admin());
