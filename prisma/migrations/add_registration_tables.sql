-- Migration: Add Registration System Tables
-- Description: Creates tables for hybrid registration (Regular Class + UTS Package)
-- Safe: Incremental migration, does NOT modify or drop any existing tables.

-- Create registration type enum
DO $$ BEGIN
    CREATE TYPE "RegistrationType" AS ENUM ('REGULAR', 'UTS');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create registration status enum
DO $$ BEGIN
    CREATE TYPE "RegistrationStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create registrations table
CREATE TABLE IF NOT EXISTS "registrations" (
    "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    "type" "RegistrationType" NOT NULL,
    "name" TEXT NOT NULL,
    "nim" TEXT NOT NULL,
    "subject" TEXT NOT NULL,
    "whatsapp" TEXT NOT NULL,
    "payment_proof_url" TEXT NOT NULL,
    "status" "RegistrationStatus" NOT NULL DEFAULT 'PENDING',
    "reviewed_by" TEXT,
    "reviewed_at" TIMESTAMPTZ,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT now(),
    "updated_at" TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create index for duplicate checks
CREATE INDEX IF NOT EXISTS "registrations_nim_type_idx" ON "registrations" ("nim", "type");

-- Create regular class details table
CREATE TABLE IF NOT EXISTS "regular_class_details" (
    "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    "registration_id" UUID NOT NULL UNIQUE REFERENCES "registrations"("id") ON DELETE CASCADE,
    "group_size" INTEGER NOT NULL,
    "session_count" INTEGER NOT NULL,
    "scheduled_date" TEXT NOT NULL,
    "scheduled_time" TEXT NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create UTS package details table
CREATE TABLE IF NOT EXISTS "uts_package_details" (
    "id" UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    "registration_id" UUID NOT NULL UNIQUE REFERENCES "registrations"("id") ON DELETE CASCADE,
    "package_type" TEXT NOT NULL,
    "created_at" TIMESTAMPTZ NOT NULL DEFAULT now()
);
