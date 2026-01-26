-- Migration: Add product_id column for proper sync deduplication
-- The product_id is a stable unique identifier from Google Sheets (Column W)
-- This prevents duplicate records during sync operations

-- Add product_id column
ALTER TABLE apps ADD COLUMN IF NOT EXISTS product_id TEXT;

-- Create unique index on product_id (allows NULL for backwards compatibility)
CREATE UNIQUE INDEX IF NOT EXISTS idx_apps_product_id ON apps(product_id) WHERE product_id IS NOT NULL;

-- Add comment for documentation
COMMENT ON COLUMN apps.product_id IS 'Stable unique identifier from Google Sheets (Column W). Used for sync deduplication.';
