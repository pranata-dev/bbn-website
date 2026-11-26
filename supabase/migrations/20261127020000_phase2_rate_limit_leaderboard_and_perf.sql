-- ============================================================================
-- Migration: 20261127020000_phase2_rate_limit_leaderboard_and_perf.sql
-- Description: Serverless Postgres rate limiting, materials.has_content stored
--              column, leaderboard and top-performer SQL RPCs, and indexes.
-- ============================================================================

-- 1. Safely extend SubmissionStatus enum with COMPLETED if the enum exists in public
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE n.nspname = 'public'
      AND t.typname = 'SubmissionStatus'
      AND t.typtype = 'e'
  ) THEN
    ALTER TYPE public."SubmissionStatus" ADD VALUE IF NOT EXISTS 'COMPLETED';
  END IF;
END $$;

-- 2. Serverless rate-limit bucket table (RLS enabled, no anon/authenticated policies)
CREATE TABLE IF NOT EXISTS public.rate_limit_buckets (
  key TEXT PRIMARY KEY,
  count INT NOT NULL DEFAULT 1,
  window_start TIMESTAMPTZ NOT NULL DEFAULT now(),
  expires_at TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS rate_limit_buckets_expires_idx
ON public.rate_limit_buckets (expires_at);

ALTER TABLE public.rate_limit_buckets ENABLE ROW LEVEL SECURITY;

-- Atomic fixed-window rate-limit increment RPC
CREATE OR REPLACE FUNCTION public.check_rate_limit(
  p_key TEXT,
  p_max_requests INT DEFAULT 5,
  p_window_seconds INT DEFAULT 60
)
RETURNS TABLE(allowed BOOLEAN, current_count INT, retry_after_seconds INT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_now TIMESTAMPTZ := now();
  v_count INT;
  v_expires TIMESTAMPTZ;
BEGIN
  DELETE FROM public.rate_limit_buckets
  WHERE ctid IN (
    SELECT ctid FROM public.rate_limit_buckets
    WHERE expires_at <= v_now
    LIMIT 50
  );

  INSERT INTO public.rate_limit_buckets (key, count, window_start, expires_at)
  VALUES (
    p_key,
    1,
    v_now,
    v_now + make_interval(secs => p_window_seconds)
  )
  ON CONFLICT (key) DO UPDATE SET
    count = CASE
      WHEN public.rate_limit_buckets.expires_at <= v_now THEN 1
      ELSE public.rate_limit_buckets.count + 1
    END,
    window_start = CASE
      WHEN public.rate_limit_buckets.expires_at <= v_now THEN v_now
      ELSE public.rate_limit_buckets.window_start
    END,
    expires_at = CASE
      WHEN public.rate_limit_buckets.expires_at <= v_now THEN v_now + make_interval(secs => p_window_seconds)
      ELSE public.rate_limit_buckets.expires_at
    END
  RETURNING count, expires_at INTO v_count, v_expires;

  RETURN QUERY SELECT
    (v_count <= p_max_requests),
    v_count,
    GREATEST(1, CEIL(EXTRACT(EPOCH FROM (v_expires - v_now)))::INT);
END;
$$;

REVOKE ALL ON FUNCTION public.check_rate_limit(TEXT, INT, INT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.check_rate_limit(TEXT, INT, INT) TO service_role;

-- Read-only pre-check RPC for failure-only lockout buckets (does not increment count)
CREATE OR REPLACE FUNCTION public.peek_rate_limit(
  p_key TEXT,
  p_max_requests INT DEFAULT 10
)
RETURNS TABLE(allowed BOOLEAN, current_count INT, retry_after_seconds INT)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
DECLARE
  v_now TIMESTAMPTZ := now();
  v_count INT;
  v_expires TIMESTAMPTZ;
BEGIN
  SELECT b.count, b.expires_at
  INTO v_count, v_expires
  FROM public.rate_limit_buckets b
  WHERE b.key = p_key
    AND b.expires_at > v_now;

  IF NOT FOUND THEN
    RETURN QUERY SELECT true, 0, 0;
    RETURN;
  END IF;

  RETURN QUERY SELECT
    (v_count < p_max_requests),
    v_count,
    GREATEST(1, CEIL(EXTRACT(EPOCH FROM (v_expires - v_now)))::INT);
END;
$$;

REVOKE ALL ON FUNCTION public.peek_rate_limit(TEXT, INT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.peek_rate_limit(TEXT, INT) TO service_role;

-- 3. Stored generated column on materials to avoid fetching full content_md in list queries
ALTER TABLE public.materials
  ADD COLUMN IF NOT EXISTS has_content BOOLEAN
  GENERATED ALWAYS AS (content_md IS NOT NULL AND length(btrim(content_md)) > 0) STORED;

-- 4. Indexes for leaderboard and admin dashboard aggregations
CREATE INDEX IF NOT EXISTS submissions_tryout_status_score_idx
ON public.submissions (tryout_id, status, score DESC);

CREATE INDEX IF NOT EXISTS submissions_status_created_idx
ON public.submissions (status, created_at DESC);

-- 5. Bounded SQL Leaderboard RPC (excludes practice, isolates Excellent Beta vs University)
--    Uses TEXT comparison on course_id to avoid UUID/TEXT operator mismatches across schemas.
CREATE OR REPLACE FUNCTION public.get_leaderboard(
  p_is_excellent_beta BOOLEAN DEFAULT false,
  p_course_id TEXT DEFAULT NULL,
  p_category TEXT DEFAULT NULL,
  p_limit INT DEFAULT 50
)
RETURNS TABLE(
  rank BIGINT,
  user_id TEXT,
  user_name TEXT,
  avatar_url TEXT,
  total_score NUMERIC,
  total_tryouts BIGINT,
  average_score NUMERIC
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  WITH filtered AS (
    SELECT
      s.user_id,
      u.name AS user_name,
      u.avatar_url,
      COALESCE(s.score, 0)::numeric AS score
    FROM public.submissions s
    JOIN public.tryouts t ON t.id = s.tryout_id
    JOIN public.users u ON u.id = s.user_id
    LEFT JOIN public.courses c ON c.id::text = t.course_id::text
    WHERE t.is_practice = false
      AND s.status::text = ANY(ARRAY['COMPLETED', 'SUBMITTED', 'TIMED_OUT'])
      AND (p_category IS NULL OR t.category::text = p_category)
      AND (p_course_id IS NULL OR t.course_id::text = p_course_id)
      AND (
        CASE
          WHEN p_is_excellent_beta THEN
            c.code IN ('FISIKA_X', 'FISIKA_XI', 'FISIKA_XII')
          ELSE
            (c.code IS NULL OR c.code NOT IN ('FISIKA_X', 'FISIKA_XI', 'FISIKA_XII'))
            AND lower(u.email) NOT LIKE '%@beta.bbn.local'
        END
      )
  ),
  agg AS (
    SELECT
      f.user_id,
      MAX(f.user_name) AS user_name,
      MAX(f.avatar_url) AS avatar_url,
      ROUND(SUM(f.score), 2) AS total_score,
      COUNT(*) AS total_tryouts,
      ROUND(AVG(f.score), 2) AS average_score
    FROM filtered f
    GROUP BY f.user_id
  )
  SELECT
    ROW_NUMBER() OVER (ORDER BY a.average_score DESC, a.total_tryouts DESC, a.user_id ASC) AS rank,
    a.user_id,
    a.user_name,
    a.avatar_url,
    a.total_score,
    a.total_tryouts,
    a.average_score
  FROM agg a
  ORDER BY a.average_score DESC, a.total_tryouts DESC, a.user_id ASC
  LIMIT GREATEST(1, LEAST(COALESCE(p_limit, 50), 200));
$$;

REVOKE ALL ON FUNCTION public.get_leaderboard(BOOLEAN, TEXT, TEXT, INT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_leaderboard(BOOLEAN, TEXT, TEXT, INT) TO service_role;

-- 6. User rank summary RPC for student dashboard
CREATE OR REPLACE FUNCTION public.get_user_leaderboard_rank(
  p_user_id TEXT,
  p_is_excellent_beta BOOLEAN DEFAULT false,
  p_course_id TEXT DEFAULT NULL
)
RETURNS TABLE(user_rank BIGINT, total_participants BIGINT)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  WITH ranked AS (
    SELECT
      s.user_id,
      ROW_NUMBER() OVER (
        ORDER BY AVG(COALESCE(s.score, 0)) DESC, COUNT(*) DESC, s.user_id ASC
      ) AS rk
    FROM public.submissions s
    JOIN public.tryouts t ON t.id = s.tryout_id
    JOIN public.users u ON u.id = s.user_id
    LEFT JOIN public.courses c ON c.id::text = t.course_id::text
    WHERE t.is_practice = false
      AND s.status::text = ANY(ARRAY['COMPLETED', 'SUBMITTED', 'TIMED_OUT'])
      AND (p_course_id IS NULL OR t.course_id::text = p_course_id)
      AND (
        CASE
          WHEN p_is_excellent_beta THEN
            c.code IN ('FISIKA_X', 'FISIKA_XI', 'FISIKA_XII')
          ELSE
            (c.code IS NULL OR c.code NOT IN ('FISIKA_X', 'FISIKA_XI', 'FISIKA_XII'))
            AND lower(u.email) NOT LIKE '%@beta.bbn.local'
        END
      )
    GROUP BY s.user_id
  )
  SELECT
    (SELECT rk FROM ranked WHERE user_id = p_user_id),
    (SELECT COUNT(*) FROM ranked);
$$;

REVOKE ALL ON FUNCTION public.get_user_leaderboard_rank(TEXT, BOOLEAN, TEXT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_user_leaderboard_rank(TEXT, BOOLEAN, TEXT) TO service_role;

-- 7. Top performers RPC for Admin Dashboard
CREATE OR REPLACE FUNCTION public.get_top_tryout_performers(p_limit INT DEFAULT 5)
RETURNS TABLE(
  user_id TEXT,
  user_name TEXT,
  user_email TEXT,
  avatar_url TEXT,
  highest_score NUMERIC,
  tryout_title TEXT
)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  WITH best_per_user AS (
    SELECT DISTINCT ON (s.user_id)
      s.user_id,
      u.name AS user_name,
      u.email AS user_email,
      u.avatar_url,
      ROUND(COALESCE(s.score, 0)::numeric, 2) AS highest_score,
      t.title AS tryout_title
    FROM public.submissions s
    JOIN public.tryouts t ON t.id = s.tryout_id
    JOIN public.users u ON u.id = s.user_id
    WHERE t.is_practice = false
      AND s.status::text = ANY(ARRAY['COMPLETED', 'SUBMITTED', 'TIMED_OUT'])
    ORDER BY s.user_id, COALESCE(s.score, 0) DESC, s.submitted_at DESC NULLS LAST
  )
  SELECT
    b.user_id,
    b.user_name,
    b.user_email,
    b.avatar_url,
    b.highest_score,
    b.tryout_title
  FROM best_per_user b
  ORDER BY b.highest_score DESC, b.user_id ASC
  LIMIT GREATEST(1, LEAST(COALESCE(p_limit, 5), 50));
$$;

REVOKE ALL ON FUNCTION public.get_top_tryout_performers(INT) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_top_tryout_performers(INT) TO service_role;

