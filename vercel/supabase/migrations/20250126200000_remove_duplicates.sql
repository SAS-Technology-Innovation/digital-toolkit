-- Migration: Remove duplicate apps
-- Keeps the oldest record (by created_at) for each product name
-- This is a one-time cleanup after fixing the sync deduplication logic

-- First, let's see what duplicates exist (for logging)
DO $$
DECLARE
  dup_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO dup_count
  FROM (
    SELECT product, COUNT(*) as cnt
    FROM apps
    GROUP BY product
    HAVING COUNT(*) > 1
  ) dups;

  RAISE NOTICE 'Found % products with duplicates', dup_count;
END $$;

-- Delete duplicates, keeping the oldest record (smallest created_at) for each product
DELETE FROM apps
WHERE id IN (
  SELECT id
  FROM (
    SELECT
      id,
      ROW_NUMBER() OVER (
        PARTITION BY product
        ORDER BY created_at ASC, id ASC
      ) as row_num
    FROM apps
  ) ranked
  WHERE row_num > 1
);

-- Log the result
DO $$
DECLARE
  remaining_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO remaining_count FROM apps;
  RAISE NOTICE 'Cleanup complete. % apps remaining', remaining_count;
END $$;
