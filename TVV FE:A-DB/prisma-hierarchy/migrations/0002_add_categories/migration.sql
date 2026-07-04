-- ════════════════════════════════════════════════════════════════════════════
--  0002 — destination_categories
-- ════════════════════════════════════════════════════════════════════════════
--
--  Adds the content-category surface that powers the third URL segment
--  in /[country]/[destination]/[category]. Categories are NOT folded into
--  the geographic destinations tree (see schema.prisma for the rationale);
--  they live in their own table joined to destinations by FK.

CREATE TABLE "destination_categories" (
  "id"               BIGSERIAL PRIMARY KEY,
  "destination_id"   BIGINT NOT NULL REFERENCES "destinations"("id") ON DELETE CASCADE,

  "name"             TEXT NOT NULL,
  "slug"             TEXT NOT NULL,

  "description"      TEXT,
  "meta_title"       TEXT,
  "meta_description" TEXT,
  "seo_content"      TEXT,
  "hero_image_url"   TEXT,

  "sort_order"       INTEGER NOT NULL DEFAULT 0,
  "status"           "DestinationStatus" NOT NULL DEFAULT 'DRAFT',
  "is_featured"      BOOLEAN NOT NULL DEFAULT FALSE,

  "created_at"       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at"       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "published_at"     TIMESTAMPTZ,

  -- defence in depth: same URL-safe slug regex as destinations
  CONSTRAINT category_slug_format CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$')
);

-- A category slug is unique *within* a destination — the same category
-- ("honeymoon-packages") legitimately repeats across destinations.
CREATE UNIQUE INDEX "destination_categories_destination_slug_uq"
  ON "destination_categories" ("destination_id", "slug");

-- Hot index for the public reader: pull published categories under a
-- destination in sort order.
CREATE INDEX "destination_categories_destination_status_sort_idx"
  ON "destination_categories" ("destination_id", "status", "sort_order")
  WHERE "status" = 'PUBLISHED';

-- updated_at touch trigger, same shape as the destinations table.
CREATE TRIGGER destination_categories_set_updated_at
  BEFORE UPDATE ON destination_categories
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- A category can only be attached to a Destination-level row (level=2).
-- Enforce this with a CHECK via a trigger because Postgres CHECK constraints
-- can't reference another table.
CREATE OR REPLACE FUNCTION enforce_category_parent_is_destination() RETURNS TRIGGER AS $$
DECLARE
  parent_level TEXT;
BEGIN
  SELECT level::TEXT INTO parent_level FROM destinations WHERE id = NEW.destination_id;
  IF parent_level IS NULL THEN
    RAISE EXCEPTION 'Category references non-existent destination %', NEW.destination_id;
  END IF;
  IF parent_level <> 'DESTINATION' THEN
    RAISE EXCEPTION 'Categories can only attach to DESTINATION-level rows (got %)', parent_level;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER destination_categories_enforce_parent_level
  BEFORE INSERT OR UPDATE OF destination_id ON destination_categories
  FOR EACH ROW EXECUTE FUNCTION enforce_category_parent_is_destination();
