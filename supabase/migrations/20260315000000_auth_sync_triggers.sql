-- Migration: Add Auth Synchronization Triggers
-- This migration ensures that the public.users table is always 100% in sync with the auth.users table.
-- It eliminates the "ghost user" problem where an auth user is deleted but the public profile remains,
-- or vice versa.

-- 1. Auto-Create Profile on Signup
CREATE OR REPLACE FUNCTION public.handle_new_user() 
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, auth_id, email, name, role, is_active, created_at, updated_at)
  VALUES (
    gen_random_uuid(), -- Generate a new UUID for the public.users primary key
    NEW.id,            -- The Supabase auth connection
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)), -- Fallback to email prefix if no name
    'STUDENT_BASIC',   -- Default role
    true,              -- Default active status
    now(),
    now()
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate carefully to avoid duplicate trigger errors
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();


-- 2. Auto-Delete Profile on Auth Deletion (Cascade)
CREATE OR REPLACE FUNCTION public.handle_user_deletion() 
RETURNS TRIGGER AS $$
BEGIN
  -- This will cascade delete anything relying on public.users.id
  -- natively if foreign keys with ON DELETE CASCADE are set up.
  DELETE FROM public.users WHERE auth_id = OLD.id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate trigger
DROP TRIGGER IF EXISTS on_auth_user_deleted ON auth.users;
CREATE TRIGGER on_auth_user_deleted
  AFTER DELETE ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_user_deletion();
