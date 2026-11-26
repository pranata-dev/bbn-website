-- ============================================================================
-- Migration: 20261127010000_phase1_cbt_concurrency_and_registrations.sql
-- Description: CBT submission concurrency guards, partial-safe answer upserts,
--              atomic tab-switch counter, Excellent Beta RLS isolation,
--              idempotent registration approval, and REGULAR class columns.
-- ============================================================================

-- 1. Collapse duplicate IN_PROGRESS submissions before enforcing one active attempt
--    per (user_id, tryout_id). Older duplicates become TIMED_OUT with score NULL and
--    are graded from persisted answers by the application recovery path.
WITH ranked AS (
  SELECT id,
         row_number() OVER (
           PARTITION BY user_id, tryout_id
           ORDER BY started_at DESC, created_at DESC, id DESC
         ) AS rn
  FROM public.submissions
  WHERE status = 'IN_PROGRESS'
)
UPDATE public.submissions s
SET status = 'TIMED_OUT',
    submitted_at = COALESCE(s.submitted_at, now())
FROM ranked r
WHERE s.id = r.id
  AND r.rn > 1;

CREATE UNIQUE INDEX IF NOT EXISTS submissions_active_user_tryout_uidx
ON public.submissions (user_id, tryout_id)
WHERE status = 'IN_PROGRESS';

-- 2. Deduplicate answers, then ensure UNIQUE (submission_id, question_id).
WITH ranked_answers AS (
  SELECT id,
         row_number() OVER (
           PARTITION BY submission_id, question_id
           ORDER BY created_at DESC, id DESC
         ) AS rn
  FROM public.answers
)
DELETE FROM public.answers a
USING ranked_answers r
WHERE a.id = r.id
  AND r.rn > 1;

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'answers_submission_question_unique'
  ) THEN
    ALTER TABLE public.answers
      ADD CONSTRAINT answers_submission_question_unique UNIQUE (submission_id, question_id);
  END IF;
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- 3. RLS parity for Excellent Beta isolation.
--    FISIKA_X / FISIKA_XI / FISIKA_XII are seeded with track = 'NON_PHYSICS', so they are
--    excluded from free previews and from every university paid track (including 'ALL').
--    Beta access requires all of:
--      a) user_metadata.is_excellent_beta compared as text ('true'), never cast to boolean
--      b) user_metadata.excellent_grade matching the course grade
--      c) public.users.email carrying the server-assigned synthetic grade prefix
--      d) the signed JWT email claim equal to that public.users.email
--    (a) and (b) are user-writable via auth.updateUser(); (c) alone is user-writable via the
--    own-profile UPDATE policy; (d) only changes through a double-confirmed email change,
--    which cannot complete for the unroutable beta.bbn.local domain.
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
  WITH target AS (
    SELECT c.code, c.track
    FROM public.courses c
    WHERE c.id::text = p_course_id
  ),
  me AS (
    SELECT u.id, lower(u.email) AS email
    FROM public.users u
    WHERE u.auth_id::text = auth.uid()::text
    LIMIT 1
  )
  SELECT
    public.is_admin()
    OR (
      COALESCE(p_is_free_preview, false)
      AND NOT EXISTS (
        SELECT 1 FROM target t
        WHERE t.code IN ('FISIKA_X', 'FISIKA_XI', 'FISIKA_XII')
      )
    )
    OR EXISTS (
      SELECT 1
      FROM target t
      CROSS JOIN me m
      WHERE t.code IN ('FISIKA_X', 'FISIKA_XI', 'FISIKA_XII')
        AND (auth.jwt() -> 'user_metadata' ->> 'is_excellent_beta') = 'true'
        AND m.email = lower(COALESCE(auth.jwt() ->> 'email', ''))
        AND (
          (
            t.code = 'FISIKA_X'
            AND upper(COALESCE(auth.jwt() -> 'user_metadata' ->> 'excellent_grade', '')) = 'X'
            AND m.email LIKE 'excellent.x.%@beta.bbn.local'
          )
          OR (
            t.code = 'FISIKA_XI'
            AND upper(COALESCE(auth.jwt() -> 'user_metadata' ->> 'excellent_grade', '')) = 'XI'
            AND m.email LIKE 'excellent.xi.%@beta.bbn.local'
          )
          OR (
            t.code = 'FISIKA_XII'
            AND upper(COALESCE(auth.jwt() -> 'user_metadata' ->> 'excellent_grade', '')) = 'XII'
            AND m.email LIKE 'excellent.xii.%@beta.bbn.local'
          )
        )
    )
    OR EXISTS (
      SELECT 1
      FROM public.subscriptions s
      JOIN me m ON m.id = s.user_id
      WHERE s.status = 'ACTIVE'
        AND s.plan_code <> 'FREE'
        AND (s.expires_at IS NULL OR s.expires_at > now())
        AND NOT EXISTS (
          SELECT 1 FROM target t
          WHERE t.code IN ('FISIKA_X', 'FISIKA_XI', 'FISIKA_XII')
        )
        AND (
          s.track = 'ALL'
          OR NOT EXISTS (SELECT 1 FROM target)
          OR EXISTS (
            SELECT 1 FROM target t
            WHERE t.track IS NULL OR t.track = 'ALL' OR t.track = s.track
          )
        )
    );
$$;

-- 4. Partial-safe answer upsert. Returns false (and writes nothing) unless the submission
--    is IN_PROGRESS. FOR SHARE holds the submission row until commit, so a concurrent
--    finalization UPDATE waits and then re-evaluates its status = 'IN_PROGRESS' predicate.
--    The answer column is only touched when p_has_answer, and flagged only when
--    p_has_flagged, so a flag toggle never clears a saved answer.
DROP FUNCTION IF EXISTS public.upsert_submission_answer(TEXT, TEXT, TEXT, BOOLEAN, BOOLEAN, BOOLEAN);

CREATE FUNCTION public.upsert_submission_answer(
  p_submission_id TEXT,
  p_question_id TEXT,
  p_answer TEXT DEFAULT NULL,
  p_has_answer BOOLEAN DEFAULT false,
  p_flagged BOOLEAN DEFAULT false,
  p_has_flagged BOOLEAN DEFAULT false
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM public.submissions
    WHERE id = p_submission_id AND status = 'IN_PROGRESS'
    FOR SHARE
  ) THEN
    RETURN false;
  END IF;

  INSERT INTO public.answers (id, submission_id, question_id, answer, flagged, created_at)
  VALUES (
    gen_random_uuid()::text,
    p_submission_id,
    p_question_id,
    CASE WHEN p_has_answer THEN p_answer ELSE NULL END,
    CASE WHEN p_has_flagged THEN COALESCE(p_flagged, false) ELSE false END,
    now()
  )
  ON CONFLICT (submission_id, question_id) DO UPDATE SET
    answer = CASE WHEN p_has_answer THEN EXCLUDED.answer ELSE public.answers.answer END,
    flagged = CASE WHEN p_has_flagged THEN EXCLUDED.flagged ELSE public.answers.flagged END;

  RETURN true;
END;
$$;

REVOKE ALL ON FUNCTION public.upsert_submission_answer(TEXT, TEXT, TEXT, BOOLEAN, BOOLEAN, BOOLEAN) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.upsert_submission_answer(TEXT, TEXT, TEXT, BOOLEAN, BOOLEAN, BOOLEAN) TO service_role;

-- 5. Atomic tab_switch_count increment. Returns NULL when the submission is not IN_PROGRESS.
CREATE OR REPLACE FUNCTION public.increment_submission_tab_switch(p_submission_id TEXT)
RETURNS INT
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $$
  UPDATE public.submissions
  SET tab_switch_count = COALESCE(tab_switch_count, 0) + 1
  WHERE id = p_submission_id
    AND status = 'IN_PROGRESS'
  RETURNING tab_switch_count;
$$;

REVOKE ALL ON FUNCTION public.increment_submission_tab_switch(TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.increment_submission_tab_switch(TEXT) TO service_role;

-- 6. Idempotent approval: at most one ACTIVE subscription per registration.
--    Historical rows may legitimately share a registration_id across CANCELLED or EXPIRED
--    states, so the index is limited to ACTIVE rows. Duplicate ACTIVE rows (from the old
--    non-atomic approval flow) keep the newest row and cancel the rest.
--
--    Operator read-only audit query (run manually before applying in production):
--    SELECT registration_id, status, count(*)
--    FROM public.subscriptions
--    WHERE registration_id IS NOT NULL
--    GROUP BY registration_id, status
--    HAVING count(*) > 1
--    ORDER BY count(*) DESC;
WITH ranked_subscriptions AS (
  SELECT id,
         row_number() OVER (
           PARTITION BY registration_id
           ORDER BY created_at DESC, id DESC
         ) AS rn
  FROM public.subscriptions
  WHERE registration_id IS NOT NULL
    AND status = 'ACTIVE'
)
UPDATE public.subscriptions s
SET status = 'CANCELLED'
FROM ranked_subscriptions r
WHERE s.id = r.id
  AND r.rn > 1;

CREATE UNIQUE INDEX IF NOT EXISTS subscriptions_active_registration_uidx
ON public.subscriptions (registration_id)
WHERE registration_id IS NOT NULL AND status = 'ACTIVE';

-- 7. REGULAR class scheduling and notes on registrations.
ALTER TABLE public.registrations
  ADD COLUMN IF NOT EXISTS group_size INT CHECK (group_size IS NULL OR (group_size >= 1 AND group_size <= 20)),
  ADD COLUMN IF NOT EXISTS session_count INT CHECK (session_count IS NULL OR (session_count >= 1 AND session_count <= 30)),
  ADD COLUMN IF NOT EXISTS scheduled_date DATE,
  ADD COLUMN IF NOT EXISTS scheduled_time TEXT CHECK (scheduled_time IS NULL OR scheduled_time ~ '^[0-2][0-9]:[0-5][0-9]$'),
  ADD COLUMN IF NOT EXISTS notes TEXT;

