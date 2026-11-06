-- ============================================================================
-- Migration: 20260318100000_schema_defaults_and_storage.sql
-- Description: Sets PostgreSQL default values for id/timestamps to streamline
--              inserts and configures Supabase Storage buckets & RLS policies.
-- ============================================================================

-- 1. Column defaults for core tables
ALTER TABLE public.materials ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
ALTER TABLE public.materials ALTER COLUMN created_at SET DEFAULT now();
ALTER TABLE public.materials ALTER COLUMN updated_at SET DEFAULT now();
ALTER TABLE public.materials ALTER COLUMN drive_url SET DEFAULT '';

ALTER TABLE public.questions ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
ALTER TABLE public.questions ALTER COLUMN created_at SET DEFAULT now();
ALTER TABLE public.questions ALTER COLUMN updated_at SET DEFAULT now();
ALTER TABLE public.questions ALTER COLUMN weight SET DEFAULT 1;
ALTER TABLE public.questions ALTER COLUMN type SET DEFAULT 'MULTIPLE_CHOICE';

ALTER TABLE public.tryouts ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
ALTER TABLE public.tryouts ALTER COLUMN created_at SET DEFAULT now();
ALTER TABLE public.tryouts ALTER COLUMN updated_at SET DEFAULT now();

ALTER TABLE public.users ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
ALTER TABLE public.users ALTER COLUMN created_at SET DEFAULT now();
ALTER TABLE public.users ALTER COLUMN updated_at SET DEFAULT now();

ALTER TABLE public.registrations ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
ALTER TABLE public.registrations ALTER COLUMN created_at SET DEFAULT now();
ALTER TABLE public.registrations ALTER COLUMN updated_at SET DEFAULT now();

ALTER TABLE public.submissions ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
ALTER TABLE public.submissions ALTER COLUMN created_at SET DEFAULT now();
ALTER TABLE public.submissions ALTER COLUMN started_at SET DEFAULT now();
ALTER TABLE public.submissions ALTER COLUMN status SET DEFAULT 'IN_PROGRESS';

ALTER TABLE public.answers ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;
ALTER TABLE public.answers ALTER COLUMN created_at SET DEFAULT now();

-- 2. Configure Supabase Storage Buckets
INSERT INTO storage.buckets (id, name, public)
VALUES 
    ('question-images', 'question-images', true),
    ('payment-proofs', 'payment-proofs', false),
    ('material-attachments', 'material-attachments', false)
ON CONFLICT (id) DO UPDATE SET public = EXCLUDED.public;

-- 3. Storage RLS Policies

-- Question Images: Public read, Admin manage
DROP POLICY IF EXISTS "Public Read Question Images" ON storage.objects;
CREATE POLICY "Public Read Question Images"
ON storage.objects FOR SELECT
USING (bucket_id = 'question-images');

DROP POLICY IF EXISTS "Admin Manage Question Images" ON storage.objects;
CREATE POLICY "Admin Manage Question Images"
ON storage.objects FOR ALL
USING (bucket_id = 'question-images' AND public.is_admin())
WITH CHECK (bucket_id = 'question-images' AND public.is_admin());

-- Payment Proofs: Anyone can upload during registration, Owner/Admin read
DROP POLICY IF EXISTS "Anyone Can Upload Payment Proofs" ON storage.objects;
CREATE POLICY "Anyone Can Upload Payment Proofs"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'payment-proofs');

DROP POLICY IF EXISTS "Owner or Admin Read Payment Proofs" ON storage.objects;
CREATE POLICY "Owner or Admin Read Payment Proofs"
ON storage.objects FOR SELECT
USING (
    bucket_id = 'payment-proofs' 
    AND (
        public.is_admin() 
        OR auth.uid()::text = (storage.foldername(name))[1]
    )
);

DROP POLICY IF EXISTS "Admin Manage Payment Proofs" ON storage.objects;
CREATE POLICY "Admin Manage Payment Proofs"
ON storage.objects FOR ALL
USING (bucket_id = 'payment-proofs' AND public.is_admin())
WITH CHECK (bucket_id = 'payment-proofs' AND public.is_admin());

-- Material Attachments: Authenticated read, Admin manage
DROP POLICY IF EXISTS "Authenticated Read Material Attachments" ON storage.objects;
CREATE POLICY "Authenticated Read Material Attachments"
ON storage.objects FOR SELECT
USING (
    bucket_id = 'material-attachments' 
    AND (auth.role() = 'authenticated' OR public.is_admin())
);

DROP POLICY IF EXISTS "Admin Manage Material Attachments" ON storage.objects;
CREATE POLICY "Admin Manage Material Attachments"
ON storage.objects FOR ALL
USING (bucket_id = 'material-attachments' AND public.is_admin())
WITH CHECK (bucket_id = 'material-attachments' AND public.is_admin());
