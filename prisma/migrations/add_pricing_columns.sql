-- Add pricing columns to registrations table
-- Safe migration: uses IF NOT EXISTS, does not modify existing data

ALTER TABLE registrations
ADD COLUMN IF NOT EXISTS calculated_price INTEGER;

ALTER TABLE registrations
ADD COLUMN IF NOT EXISTS pricing_tier TEXT;

-- Add a comment for documentation
COMMENT ON COLUMN registrations.calculated_price IS 'Server-calculated total price in IDR';
COMMENT ON COLUMN registrations.pricing_tier IS 'Pricing tier: NORMAL or DISCOUNT';
