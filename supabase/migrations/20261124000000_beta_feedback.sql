-- ============================================================================
-- Migration: 20261124000000_beta_feedback.sql
-- Description: Student beta feedback table for Excellent Beta (SAS Fisika).
--              Note: public.users.id is TEXT in this schema, so user_id uses TEXT
--              matching subscriptions.user_id and registrations.user_id.
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.beta_feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id TEXT REFERENCES public.users(id) ON DELETE SET NULL,
    student_name TEXT,
    grade TEXT,
    rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
    category TEXT NOT NULL CHECK (category IN ('MATERI', 'LATIHAN', 'TAMPILAN', 'BUG', 'LAINNYA')),
    message TEXT NOT NULL,
    page_path TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS beta_feedback_created_at_idx
ON public.beta_feedback (created_at DESC);

CREATE INDEX IF NOT EXISTS beta_feedback_grade_idx
ON public.beta_feedback (grade);

ALTER TABLE public.beta_feedback ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can read beta feedback" ON public.beta_feedback;
CREATE POLICY "Admins can read beta feedback"
ON public.beta_feedback FOR SELECT
USING (public.is_admin());

