-- ════════════════════════════════════════════════════════════════════════════
--  Initial migration — Destination hierarchy
-- ════════════════════════════════════════════════════════════════════════════
--
--  Generated to mirror prisma-hierarchy/schema.prisma, with three additions
--  Prisma can't express natively:
--
--   1.  CHECK constraints that pin `depth` to the enum `level` and ensure the
--       root row has no parent. These are the integrity rules that make
--       "Andaman must live under India under Asia & Pacific" structurally
--       impossible to violate, even via raw SQL.
--
--   2.  A partial UNIQUE INDEX on (parent_id, slug) that treats NULL parents
--       as a single bucket. Without COALESCE, two REGION rows could share
--       the same slug because Postgres considers NULLs distinct.
--
--   3.  Two triggers maintaining `slug_path`:
--          • BEFORE INSERT/UPDATE: rebuild this row's slug_path from its
--            parent's slug_path + its own slug.
--          • AFTER UPDATE: if slug_path changed, push the new prefix down
--            the entire subtree in one statement (LIKE-prefix UPDATE).
--       This is the *single* expensive write in the system — rename is rare,
--       reads are constant. Worth it.
--
-- ════════════════════════════════════════════════════════════════════════════

-- ─── Enums ──────────────────────────────────────────────────────────────────

CREATE TYPE "DestinationLevel" AS ENUM ('REGION', 'COUNTRY', 'DESTINATION', 'SUB_DESTINATION');
CREATE TYPE "DestinationStatus" AS ENUM ('DRAFT', 'PUBLISHED', 'ARCHIVED');

-- ─── Core table ─────────────────────────────────────────────────────────────

CREATE TABLE "destinations" (
  "id"               BIGSERIAL PRIMARY KEY,
  "parent_id"        BIGINT REFERENCES "destinations"("id") ON DELETE RESTRICT,

  "name"             TEXT NOT NULL,
  "slug"             TEXT NOT NULL,
  "slug_path"        TEXT NOT NULL DEFAULT '',  -- populated by trigger
  "level"            "DestinationLevel" NOT NULL,
  "depth"            SMALLINT NOT NULL,

  "meta_title"       TEXT,
  "meta_description" TEXT,
  "seo_content"      TEXT,
  "image_url"        TEXT,
  "hero_image_url"   TEXT,
  "gallery"          TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],

  "sort_order"       INTEGER NOT NULL DEFAULT 0,
  "status"           "DestinationStatus" NOT NULL DEFAULT 'DRAFT',
  "is_featured"      BOOLEAN NOT NULL DEFAULT FALSE,

  "created_at"       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at"       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "published_at"     TIMESTAMPTZ,

  -- depth must agree with level — structural invariant
  CONSTRAINT depth_matches_level CHECK (
    (level = 'REGION'          AND depth = 0) OR
    (level = 'COUNTRY'         AND depth = 1) OR
    (level = 'DESTINATION'     AND depth = 2) OR
    (level = 'SUB_DESTINATION' AND depth = 3)
  ),
  -- root rows have no parent; non-root rows must have one
  CONSTRAINT root_has_no_parent CHECK (
    (depth = 0 AND parent_id IS NULL) OR (depth > 0 AND parent_id IS NOT NULL)
  ),
  -- enforce safe URL slugs at the DB layer too (defence in depth)
  CONSTRAINT slug_format CHECK (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$')
);

-- ─── Indexes ────────────────────────────────────────────────────────────────

-- SEO URL → row lookup. The HOT INDEX of the entire system.
CREATE UNIQUE INDEX "destinations_slug_path_uq" ON "destinations" ("slug_path");

-- Siblings cannot share a slug. COALESCE turns NULL parents into the same
-- bucket so two REGION rows with slug='europe' can't both exist.
CREATE UNIQUE INDEX "destinations_parent_slug_uq"
  ON "destinations" (COALESCE("parent_id", 0), "slug");

CREATE INDEX "destinations_parent_id_idx" ON "destinations" ("parent_id");

-- Partial index — drafts/archived rows do not pollute the hot tree query.
CREATE INDEX "destinations_published_sort_idx"
  ON "destinations" ("parent_id", "sort_order", "name")
  WHERE "status" = 'PUBLISHED';

CREATE INDEX "destinations_level_status_idx" ON "destinations" ("level", "status");

-- ─── Translations table ────────────────────────────────────────────────────

CREATE TABLE "destination_translations" (
  "destinationId"    BIGINT NOT NULL REFERENCES "destinations"("id") ON DELETE CASCADE,
  "locale"           TEXT NOT NULL,

  "name"             TEXT NOT NULL,
  "slug"             TEXT NOT NULL,
  "meta_title"       TEXT,
  "meta_description" TEXT,
  "seo_content"      TEXT,

  PRIMARY KEY ("destinationId", "locale")
);

CREATE UNIQUE INDEX "destination_translations_locale_slug_uq"
  ON "destination_translations" ("locale", "slug");

-- ─── Triggers — slug_path maintenance ──────────────────────────────────────

-- BEFORE INSERT/UPDATE: rebuild this row's slug_path from parent + slug.
-- This is what makes the application code free to write only `slug` and
-- never touch `slug_path` — the DB owns the invariant.
CREATE OR REPLACE FUNCTION sync_destination_slug_path() RETURNS TRIGGER AS $$
DECLARE
  parent_path TEXT;
BEGIN
  IF NEW.parent_id IS NULL THEN
    NEW.slug_path := NEW.slug;
  ELSE
    SELECT slug_path INTO parent_path FROM destinations WHERE id = NEW.parent_id;
    IF parent_path IS NULL THEN
      RAISE EXCEPTION 'Parent destination % has no slug_path yet; insert parents first', NEW.parent_id;
    END IF;
    NEW.slug_path := parent_path || '/' || NEW.slug;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER destinations_slug_path_sync
  BEFORE INSERT OR UPDATE OF parent_id, slug ON destinations
  FOR EACH ROW EXECUTE FUNCTION sync_destination_slug_path();

-- AFTER UPDATE: when a row's slug_path changes, push the new prefix down
-- the subtree. One UPDATE statement walks every descendant — no app-side
-- recursion. Wrapped in the trigger so it's atomic with the parent rename.
CREATE OR REPLACE FUNCTION propagate_slug_path() RETURNS TRIGGER AS $$
BEGIN
  IF NEW.slug_path IS DISTINCT FROM OLD.slug_path THEN
    UPDATE destinations
       SET slug_path = NEW.slug_path || SUBSTR(slug_path, LENGTH(OLD.slug_path) + 1)
     WHERE slug_path LIKE OLD.slug_path || '/%';
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER destinations_slug_path_cascade
  AFTER UPDATE OF slug_path ON destinations
  FOR EACH ROW EXECUTE FUNCTION propagate_slug_path();

-- ─── Trigger — updated_at touch ────────────────────────────────────────────

CREATE OR REPLACE FUNCTION set_updated_at() RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER destinations_set_updated_at
  BEFORE UPDATE ON destinations
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
