-- ════════════════════════════════════════════════════════════════════════════
--  0004 — slug history + redirect engine
--
--  Two tables, polymorphic (no hard FKs). The slug-tracking helper writes
--  to both atomically inside a transaction every time an entity's slug
--  changes; the catch-all reads from `redirects` on every URL it doesn't
--  immediately resolve.
-- ════════════════════════════════════════════════════════════════════════════

CREATE TYPE "SluggableEntity" AS ENUM (
  'DESTINATION',
  'DESTINATION_CATEGORY',
  'HOTEL',
  'PACKAGE',
  'GUIDE',
  'FERRY_ROUTE',
  'FLIGHT_ROUTE'
);

CREATE TYPE "RedirectSource" AS ENUM (
  'MANUAL',
  'SLUG_HISTORY',
  'IMPORT'
);

-- ─── slug_history ───────────────────────────────────────────────────────────
CREATE TABLE "slug_history" (
  "id"               BIGSERIAL PRIMARY KEY,

  "entity_type"      "SluggableEntity" NOT NULL,
  "entity_id"        BIGINT NOT NULL,
  "locale"           TEXT NOT NULL DEFAULT 'en',

  "old_slug"         TEXT NOT NULL,
  "old_full_path"    TEXT NOT NULL,
  "new_full_path"    TEXT NOT NULL,

  "changed_at"       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "changed_by_user"  TEXT,
  "reason"           TEXT
);

CREATE INDEX "slug_history_entity_idx"
  ON "slug_history" ("entity_type", "entity_id");

CREATE INDEX "slug_history_old_path_idx"
  ON "slug_history" ("old_full_path");

-- ─── redirects ─────────────────────────────────────────────────────────────
CREATE TABLE "redirects" (
  "id"               BIGSERIAL PRIMARY KEY,

  "from_path"        TEXT NOT NULL UNIQUE,
  "to_path"          TEXT NOT NULL,
  "status_code"      INTEGER NOT NULL DEFAULT 301,
  "locale"           TEXT,

  "source"           "RedirectSource" NOT NULL DEFAULT 'MANUAL',
  "reason"           TEXT,

  "is_active"        BOOLEAN NOT NULL DEFAULT TRUE,
  "created_at"       TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  "updated_at"       TIMESTAMPTZ NOT NULL DEFAULT NOW(),

  CONSTRAINT redirect_status_code_check CHECK (status_code IN (301, 302, 307, 308)),
  CONSTRAINT redirect_from_path_format CHECK (from_path ~ '^/'),
  CONSTRAINT redirect_to_path_format CHECK (to_path ~ '^/'),
  -- No self-loops. A redirect that points to itself is a hot loop.
  CONSTRAINT redirect_no_self_loop CHECK (from_path <> to_path)
);

CREATE INDEX "redirects_from_active_idx"
  ON "redirects" ("from_path", "is_active")
  WHERE "is_active" = TRUE;

CREATE TRIGGER redirects_set_updated_at
  BEFORE UPDATE ON redirects
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
