-- Schema helper and migration notes

-- Editorial ordering fields for buildings used on the /building index.
-- Run these statements against your database to add the new columns.

ALTER TABLE buildings
  ADD COLUMN IF NOT EXISTS is_featured boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS display_order integer;