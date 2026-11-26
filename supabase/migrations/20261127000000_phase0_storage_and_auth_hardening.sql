-- ============================================================================
-- Migration: 20261127000000_phase0_storage_and_auth_hardening.sql
-- Description: Phase 0 P0 Security Remediation:
--              1. Drops public unauthenticated INSERT policy on payment-proofs.
--              2. Drops broad authenticated SELECT policy on material-attachments
--                 so attachments are served exclusively via server-side
--                 entitlement checks and short-lived signed URLs.
--              3. Hardens handle_new_user() trigger against email collisions
--                 without overwriting existing auth_id or role values.
-- ============================================================================

-- 1. Payment proofs must only be uploaded via authenticated server endpoints (service_role)
DROP POLICY IF EXISTS "Anyone Can Upload Payment Proofs" ON storage.objects;

-- 2. Material attachments must be gated by server-side getEntitlements() and short-lived signed URLs
DROP POLICY IF EXISTS "Authenticated Read Material Attachments" ON storage.objects;

-- 3. Prevent handle_new_user() from failing or overwriting auth_id on pre-existing email rows
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (id, auth_id, email, name, role, is_active, created_at, updated_at)
  VALUES (
    gen_random_uuid()::text,
    NEW.id,
    lower(trim(NEW.email)),
    COALESCE(
      NEW.raw_user_meta_data->>'name',
      NEW.raw_user_meta_data->>'full_name',
      split_part(NEW.email, '@', 1)
    ),
    'STUDENT',
    true,
    now(),
    now()
  )
  ON CONFLICT (email) DO NOTHING;

  RETURN NEW;
END;
$$;

-- ============================================================================
-- Operator Read-Only Audit Check (run manually after applying migration):
-- Inspect legacy orphaned public.users rows whose auth_id does not exist in auth.users.
--
-- SELECT u.id, u.email, u.auth_id, u.role, u.is_active, u.created_at
-- FROM public.users u
-- LEFT JOIN auth.users a ON a.id::text = u.auth_id::text
-- WHERE a.id IS NULL
-- ORDER BY u.created_at DESC;
-- ============================================================================

