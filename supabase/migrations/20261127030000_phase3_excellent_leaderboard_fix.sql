-- ============================================================================
-- Migration: 20261127030000_phase3_excellent_leaderboard_fix.sql
-- Description: Include practice SAS packages (is_practice = true) in
--              Excellent Beta leaderboard and rank RPCs while continuing to
--              exclude practice sets from university leaderboards.
-- ============================================================================

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
    WHERE (p_is_excellent_beta OR t.is_practice = false)
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
    WHERE (p_is_excellent_beta OR t.is_practice = false)
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

