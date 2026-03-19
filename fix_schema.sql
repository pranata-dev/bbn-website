-- Add new category value
ALTER TYPE "QuestionCategory" ADD VALUE IF NOT EXISTS 'SERIES_POWER';

-- Create QuestionType enum
DO $$ BEGIN
    CREATE TYPE "QuestionType" AS ENUM ('MULTIPLE_CHOICE', 'ESSAY');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Add type column to questions
ALTER TABLE questions ADD COLUMN IF NOT EXISTS type "QuestionType" NOT NULL DEFAULT 'MULTIPLE_CHOICE';
