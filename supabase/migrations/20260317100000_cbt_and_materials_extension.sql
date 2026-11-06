-- ============================================================================
-- Migration: 20260317100000_cbt_and_materials_extension.sql
-- Description: Phase 1 & 2 schema additions: materials extensions (slug, content_md,
--              preview flags), submissions extensions (expires_at, tab_switch_count,
--              max_score), answers extensions (flagged, unique constraint),
--              tryout_questions backfill from question_ids, and role detachment.
-- ============================================================================

-- 1. Detach users.role from enum to text with check constraint
DO $$
BEGIN
    ALTER TABLE public.users ALTER COLUMN role TYPE text USING role::text;
    
    -- Normalize legacy roles ('STUDENT_BASIC', 'STUDENT_PREMIUM', etc.) to 'STUDENT'
    UPDATE public.users 
    SET role = 'STUDENT' 
    WHERE role IS NULL OR role NOT IN ('ADMIN', 'STUDENT');

    ALTER TABLE public.users ALTER COLUMN role SET DEFAULT 'STUDENT';
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'users_role_check'
    ) THEN
        ALTER TABLE public.users ADD CONSTRAINT users_role_check CHECK (role IN ('STUDENT', 'ADMIN'));
    END IF;
EXCEPTION WHEN duplicate_object THEN
    NULL;
END $$;

-- 2. Update Auth Synchronization Trigger so new signups receive valid 'STUDENT' role
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, auth_id, email, name, role, is_active, created_at, updated_at)
  VALUES (
    gen_random_uuid(),
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    'STUDENT',
    true,
    now(),
    now()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Extend materials table
ALTER TABLE public.materials ADD COLUMN IF NOT EXISTS slug TEXT;
ALTER TABLE public.materials ADD COLUMN IF NOT EXISTS summary TEXT;
ALTER TABLE public.materials ADD COLUMN IF NOT EXISTS content_md TEXT;
ALTER TABLE public.materials ADD COLUMN IF NOT EXISTS module_number INT;
ALTER TABLE public.materials ADD COLUMN IF NOT EXISTS sort_order INT NOT NULL DEFAULT 0;
ALTER TABLE public.materials ADD COLUMN IF NOT EXISTS reading_time_minutes INT;
ALTER TABLE public.materials ADD COLUMN IF NOT EXISTS is_free_preview BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE public.materials ADD COLUMN IF NOT EXISTS is_published BOOLEAN NOT NULL DEFAULT true;

-- Backfill slugs collision-free for existing materials that lack one
UPDATE public.materials
SET slug = lower(regexp_replace(coalesce(title, 'materi'), '[^a-zA-Z0-9]+', '-', 'g')) || '-' || substring(id::text from 1 for 8)
WHERE slug IS NULL OR slug = '';

-- Add unique constraint on slug if not present
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'materials_slug_key'
    ) THEN
        ALTER TABLE public.materials ADD CONSTRAINT materials_slug_key UNIQUE (slug);
    END IF;
EXCEPTION WHEN duplicate_object THEN
    NULL;
END $$;

-- 4. Extend submissions table
ALTER TABLE public.submissions ADD COLUMN IF NOT EXISTS expires_at TIMESTAMPTZ;
ALTER TABLE public.submissions ADD COLUMN IF NOT EXISTS tab_switch_count INT NOT NULL DEFAULT 0;
ALTER TABLE public.submissions ADD COLUMN IF NOT EXISTS max_score NUMERIC DEFAULT 100;

-- 5. Extend answers table
ALTER TABLE public.answers ADD COLUMN IF NOT EXISTS flagged BOOLEAN NOT NULL DEFAULT false;

-- Clean potential duplicates before adding unique constraint
DELETE FROM public.answers a
WHERE a.ctid NOT IN (
    SELECT min(b.ctid)
    FROM public.answers b
    GROUP BY b.submission_id, b.question_id
);

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_constraint WHERE conname = 'answers_submission_question_unique'
    ) THEN
        ALTER TABLE public.answers 
        ADD CONSTRAINT answers_submission_question_unique UNIQUE (submission_id, question_id);
    END IF;
EXCEPTION WHEN duplicate_object THEN
    NULL;
END $$;

-- 6. Ensure tryout_questions exists & backfill from legacy tryouts.question_ids
CREATE TABLE IF NOT EXISTS public.tryout_questions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    tryout_id UUID NOT NULL REFERENCES public.tryouts(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES public.questions(id) ON DELETE CASCADE,
    "order" INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    CONSTRAINT tryout_questions_tryout_question_unique UNIQUE (tryout_id, question_id)
);

CREATE INDEX IF NOT EXISTS tryout_questions_tryout_idx ON public.tryout_questions(tryout_id);
CREATE INDEX IF NOT EXISTS tryout_questions_question_idx ON public.tryout_questions(question_id);

-- Backfill tryout_questions from legacy tryouts.question_ids array if present
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND table_name = 'tryouts' 
          AND column_name = 'question_ids'
    ) THEN
        INSERT INTO public.tryout_questions (tryout_id, question_id, "order")
        SELECT 
            t.id AS tryout_id,
            q_id::uuid AS question_id,
            (ord - 1)::int AS "order"
        FROM public.tryouts t,
             unnest(t.question_ids) WITH ORDINALITY AS q(q_id, ord)
        WHERE q_id IS NOT NULL 
          AND q_id ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$'
          AND EXISTS (SELECT 1 FROM public.questions qu WHERE qu.id = q_id::uuid)
        ON CONFLICT (tryout_id, question_id) DO NOTHING;
    END IF;
END $$;

-- 7. Configure RLS Policies
ALTER TABLE public.tryout_questions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read tryout questions" ON public.tryout_questions;
CREATE POLICY "Anyone can read tryout questions"
ON public.tryout_questions FOR SELECT
USING (true);

DROP POLICY IF EXISTS "Admins can manage tryout questions" ON public.tryout_questions;
CREATE POLICY "Admins can manage tryout questions"
ON public.tryout_questions FOR ALL
USING (public.is_admin());

ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can read published materials" ON public.materials;
CREATE POLICY "Anyone can read published materials"
ON public.materials FOR SELECT
USING (is_published = true OR public.is_admin());

DROP POLICY IF EXISTS "Admins can manage materials" ON public.materials;
CREATE POLICY "Admins can manage materials"
ON public.materials FOR ALL
USING (public.is_admin());
