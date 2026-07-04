# Destination Hierarchy — Developer Guide

> A guided tour through the new geographical hierarchy system. Written for the
> engineer who joins the team six months from now and needs to ship a change
> against it. Read this once. Keep the section headings as a navigation aid.

---

## 0. What this is, what it isn't

**What it is.** A canonical, three-to-four-level tree of geography:

```
REGION  →  COUNTRY  →  DESTINATION  →  SUB_DESTINATION   (optional)
Asia & Pacific → India → Andaman → Havelock Island
```

Every public URL of the form `/destinations-v2/<region>/<country>/<dest>` is
backed by a row in this tree. Every product (holiday package, hotel, activity,
ferry route) will eventually carry a `destinationId` FK that points at this
tree. **This is the single source of truth for "where" on the platform.**

**What it isn't.** It's not the data store for the rest of the application.
Bookings, users, payments, CMS pages — those all stay in the legacy MongoDB
store at `apps/api/prisma/schema.prisma`. The hierarchy lives in a **separate
PostgreSQL database** and Prisma project, and the two coexist.

---

## 1. Why two databases?

The team made a pragmatic call: rather than migrating the entire MongoDB
codebase to Postgres in one painful sprint, we'd build the hierarchy — the
piece that genuinely needs relational integrity, indexed paths, and recursive
queries — on Postgres from day one, and migrate other domains opportunistically.

The downsides of cross-store joins are real but limited:

- Cross-store joins (e.g. "show me all packages in `andaman`") happen at the
  application layer, not in SQL. We accept a second round-trip.
- Cache layers (Next.js `unstable_cache` with tag invalidation) mask the
  cost on every read path that matters.
- The hierarchy table is small (< 10K rows for the lifetime of this product).
  It fits in Postgres' shared buffers and never touches disk for reads.

When MongoDB Locations are eventually migrated into the Postgres hierarchy,
the FK from `HolidayPackage.destinationId` (in Postgres) → `destinations.id`
becomes a native join again. That migration is additive; nothing in the
hierarchy code changes.

---

## 2. The model — adjacency list + materialised path

The single best decision in this design is using **both** parent pointers
**and** a denormalised slug-path string. Here's why each one matters:

### Parent pointers (`parent_id`)

The simple, classical way. Gives us:
- Referential integrity (you can't have an orphan).
- Trivial "find my direct children" queries (`WHERE parent_id = X`).
- A natural place for the `ON DELETE RESTRICT` rule that prevents accidental
  cascade-deletes of entire subtrees from the admin.

### Materialised path (`slug_path`)

The denormalised string `asia-pacific/india/andaman`, UNIQUE-indexed.
Gives us:
- **One indexed btree seek per URL resolution.** No recursive CTE, no
  application-layer walk. The SEO read path — the busiest in the system — is
  exactly one query.
- Cacheable per URL (the path *is* the cache key).
- Easy `LIKE 'asia-pacific/india/%'` queries for "everything under India".

The cost is one expensive write per **rename** (cascade the new prefix to
all descendants). We pay it with a Postgres trigger:

```sql
UPDATE destinations
   SET slug_path = NEW.slug_path || SUBSTR(slug_path, LENGTH(OLD.slug_path) + 1)
 WHERE slug_path LIKE OLD.slug_path || '/%';
```

One UPDATE, executed atomically with the parent rename in the same
transaction. Renames are rare; reads are constant. Worth it.

### Why not Postgres `ltree`?

It's excellent — purpose-built for this exact problem with native operators
like `<@` (ancestor of) and `~` (path matching). We didn't adopt it because:

1. Vendor lock-in: `ltree` operators are non-portable. If we ever move to
   another engine (cloud-managed MySQL, CockroachDB, etc.) we'd be stuck.
2. We don't yet need wildcard ancestry queries. A plain `TEXT` path plus
   `LIKE` covers our access patterns.

If we ever need bulk ancestry-aware queries, swapping `slug_path TEXT` for
`slug_path LTREE` is an additive migration. We have not painted ourselves
into a corner.

---

## 3. File map — where things live

```
tvv 2/
├── prisma-hierarchy/                ← Separate Prisma project (Postgres)
│   ├── schema.prisma                ← models + datasource
│   ├── migrations/
│   │   ├── migration_lock.toml
│   │   └── 0001_init/migration.sql  ← CHECK constraints, triggers, indexes
│   └── seed.ts                      ← Idempotent initial hierarchy
│
├── lib/hierarchy/                   ← Application logic (read this first)
│   ├── index.ts                     ← Public barrel — only file you import from
│   ├── db.ts                        ← Prisma client singleton
│   ├── types.ts                     ← API/UI-facing TypeScript shapes
│   ├── resolve.ts                   ← URL segments → Destination
│   ├── tree.ts                      ← Cached mega-menu tree
│   ├── breadcrumbs.ts               ← root→leaf trail
│   ├── validation.ts                ← admin-side guards (cycle, level, slug)
│   ├── slugify.ts                   ← slug shape rules
│   └── generated/                   ← Prisma-generated client (gitignore later)
│
├── app/
│   ├── api/v2/destinations/         ← Public read API
│   │   ├── tree/route.ts
│   │   ├── by-path/route.ts
│   │   └── [id]/
│   │       ├── breadcrumbs/route.ts
│   │       └── children/route.ts
│   ├── api/v2/admin/destinations/   ← Admin write API
│   │   ├── route.ts                 ← POST (create), GET (list)
│   │   └── [id]/route.ts            ← GET, PATCH (incl. move), DELETE (soft)
│   └── destinations-v2/[...slugs]/  ← Frontend catch-all page
│       └── page.tsx
│
└── docs/
    └── HIERARCHY.md                 ← (this file)
```

---

## 4. The contract — what each module promises

### `lib/hierarchy/index.ts`

Public barrel. Re-exports the only symbols outside code should depend on.
Internal files can move/rename without breaking consumers. **If you're
about to import from `lib/hierarchy/resolve` directly, stop — go through
the barrel.**

### `lib/hierarchy/db.ts`

A singleton `PrismaClient` instance for the hierarchy DB only. Two reasons
for the singleton:

1. Next.js dev mode hot-reloads modules; without the global cache you
   accumulate Postgres connections and trip the max_connections=100 cap.
2. The legacy MongoDB Prisma client and this one live in separate
   `node_modules` paths. Importing `@prisma/client` directly is ambiguous —
   you could get either client depending on resolution order. **Always
   import `hierarchyDb` from `lib/hierarchy`.**

### `lib/hierarchy/resolve.ts`

The single entry point for "given URL segments, give me a row". One indexed
`SELECT WHERE slug_path = $1`. Returns the rich detail shape (everything the
catch-all page renders) or `null` for the route to 404.

By design, this function does **not** separately validate "is India a child
of Asia & Pacific?". The materialised path is structurally correct by
construction: it can only exist if the chain is intact. Reject by missing
match, not by independent traversal.

### `lib/hierarchy/tree.ts`

Builds the mega-menu payload. Strategy:

1. One flat `SELECT` of every PUBLISHED row, ordered by depth then sort.
2. Assemble parent/child pointers in memory via `Map<id, node>`.
3. Wrap in `unstable_cache` with a tag (`destinations:tree`).

Admin writes call `revalidateTag(DESTINATION_TREE_TAG)` to bust this cache.
Until then, every page-load reads from in-memory cache — sub-millisecond.

We don't paginate the tree. It's small; pagination is an active hindrance
when the consumer is a navigation menu that needs the full shape.

### `lib/hierarchy/breadcrumbs.ts`

Decomposes a `slug_path` into all its ancestor prefixes and runs **one** IN
query to fetch them, ordered by depth. No recursion, no N+1, perfectly
cacheable per path.

The constant `ROUTE_PREFIX` at the top is your one-line swap point when we
graduate from `/destinations-v2/*` to `/destinations/*`.

### `lib/hierarchy/validation.ts`

Admin-side guards. These exist solely for UX:

- The DB will reject illegal writes anyway (CHECK constraints + UNIQUE
  indexes). The validators let us surface a clean error message instead of
  a Prisma `P2002` or a constraint name.
- `isLegalParent` is the only function here that issues a query — it walks
  ancestors via a recursive CTE to ensure we're not creating a cycle.

### `lib/hierarchy/slugify.ts`

The regex `^[a-z0-9]+(-[a-z0-9]+)*$` is enforced in **three** places:

1. This file (app-side validation, fast 400 response).
2. The DB CHECK constraint `slug_format` (defence in depth — catches
   anything that bypasses the API).
3. The TypeScript type `DestinationLevel` enum (compile-time).

If you change the regex, change all three. Document the change in a
migration if you change the CHECK constraint.

---

## 5. The DB triggers — why they exist

### `sync_destination_slug_path` (BEFORE INSERT/UPDATE)

Rebuilds `slug_path` from `parent.slug_path || '/' || slug`. This is the
**only** place `slug_path` is written. The application code always sends
`slugPath: ""` on insert; the trigger overwrites it. Two benefits:

- Application code never constructs paths — it's structurally impossible to
  write a broken `slug_path` from JavaScript.
- If anyone runs a raw SQL `UPDATE`, the trigger still keeps the invariant.

### `propagate_slug_path` (AFTER UPDATE)

When a row's `slug_path` changes (because its slug was edited or its parent
was moved), the trigger pushes the new prefix down its subtree:

```sql
UPDATE destinations
   SET slug_path = NEW.slug_path || SUBSTR(slug_path, LENGTH(OLD.slug_path) + 1)
 WHERE slug_path LIKE OLD.slug_path || '/%';
```

One statement, atomic with the parent update. No application-layer recursion.

### `set_updated_at` (BEFORE UPDATE)

Boilerplate. Keeps `updated_at` honest.

---

## 6. Caching strategy

Two layers, both Next.js native:

| Layer | Where | TTL | Invalidation |
|---|---|---|---|
| Page-level ISR | `export const revalidate = 60` in routes | 60s | Time-based |
| Data-level fn cache | `unstable_cache` in `tree.ts`, etc. | 300s | Tag (`destinations:tree`) |

Admin write handlers MUST call `revalidateTag(DESTINATION_TREE_TAG)` after
they commit. That instantly busts the data cache. The page-level ISR is a
backstop — if a tag invalidation is missed, the page is still fresh within
a minute.

**Do not add a third cache layer.** If something needs more aggressive
caching (CDN headers, edge cache), it goes at the response layer via
`Cache-Control`, not as a fourth in-memory cache.

---

## 7. URL strategy and the great rename

**Today** (transition period):

- `/destinations/<slug>` — legacy, MongoDB-backed, single-segment.
- `/destinations-v2/<region>/<country>/<destination>` — new, Postgres-backed,
  hierarchical.

**The swap.** Once Mongo Location data is ETL'd into the Postgres tree:

1. Delete `app/destinations/[slug]/page.tsx`.
2. Move `app/destinations-v2/[...slugs]/page.tsx` → `app/destinations/[...slugs]/page.tsx`.
3. Update `ROUTE_PREFIX` in `lib/hierarchy/breadcrumbs.ts` from
   `"/destinations-v2"` to `"/destinations"`.
4. Add 301 redirects from `/destinations/<slug>` → `/destinations/<resolved-path>`
   in a `middleware.ts` (one-time mapping, then removed once analytics show
   zero traffic on legacy URLs).

The single-segment legacy URLs continue to work because the catch-all
matches single segments too. Mongo Locations that don't yet exist in
Postgres just 404 — which is the desired state during cutover.

---

## 8. SEO

- `<title>` and `<meta description>` are pulled from `metaTitle` /
  `metaDescription` on each row, with sensible defaults to `name` + a
  template.
- The canonical URL is `/destinations-v2/<slug_path>` (will rename in the
  swap above).
- Open Graph + Twitter cards are populated from `heroImageUrl`.
- `hreflang` is wired but inactive — the moment we insert
  `DestinationTranslation` rows for `fr`/`nl`, the `alternates.languages`
  block lights up automatically.

---

## 9. Multilingual readiness

The schema has the `DestinationTranslation` table from day one but
**nothing reads from it yet**. The shape:

```
DestinationTranslation
  (destinationId, locale) → name, slug, metaTitle, metaDescription, seoContent
```

When we add multi-locale support, the changes are:

1. New middleware extracts locale from URL prefix (`/fr/...`).
2. `resolveDestination` accepts a locale and joins on
   `destination_translations` for that locale's slug.
3. Per-locale `slug_path` (`asie-pacifique/inde/andaman`) is computed in
   the same trigger style — but on the translation table, not the canonical.

The architecture is laid out so this is a **purely additive** change. Don't
write English copy inline anywhere — always go through `dest.name`,
`dest.metaTitle`, etc. so when translations land, the same components just
show the localised values.

---

## 10. Domain integration — how packages and hotels hook in

Today, `HolidayPackage.mainLocationId` (in Mongo) points at a flat `Location`
row. The migration target:

```prisma
// In the legacy Mongo schema, when we're ready
model HolidayPackage {
  // ... existing fields ...
  destinationId  String?    // FK across to Postgres destinations.id, stored as the BigInt's string form
}
```

Since the two stores are separate, the FK isn't enforced by the DB. We
enforce it at the application layer in the package service:

1. Admin form fetches the destination tree from `/api/v2/destinations/tree`
   and lets the editor pick a leaf node.
2. On save, the chosen `destinations.id` is stored as a string on the
   package row.
3. Public listing for a destination calls **both**: the hierarchy resolver
   (to get the node + its descendants) AND the packages collection
   filtered by `destinationId IN (<node + descendants>)`.

When we eventually migrate `HolidayPackage` to Postgres, this becomes a
native FK with `ON DELETE RESTRICT`. No application change.

---

## 11. Performance baseline

On the local Postgres 16 install seeded with 18 nodes:

| Query | Plan | Time |
|---|---|---|
| `WHERE slug_path = $1` (resolver) | Index Only Scan on `slug_path_uq` | < 1ms |
| Tree fetch (every published row) | Bitmap Heap Scan on `level_status_idx` | < 5ms |
| Breadcrumbs (IN on 4 prefixes) | Bitmap Index Scan | < 1ms |
| Cycle check (recursive CTE) | Index Scan up the parent chain | < 2ms |

At 10K rows the resolver and breadcrumbs stay flat. The tree fetch grows
linearly with row count but stays under 50ms even at 50K rows; cache it
once and the cost amortises across thousands of page loads.

---

## 12. Local setup — running this from scratch

```bash
# 1. Postgres 16 + tvv_hierarchy database
brew install postgresql@16
brew services start postgresql@16
createdb tvv_hierarchy

# 2. Env
echo 'HIERARCHY_DATABASE_URL="postgresql://USER@localhost:5432/tvv_hierarchy?schema=public"' >> .env

# 3. Schema + migration + seed
cd "tvv 2"
npm install
npm run hierarchy:generate    # generate Prisma client → lib/hierarchy/generated
npm run hierarchy:migrate     # apply prisma-hierarchy/migrations/*
npm run hierarchy:seed        # insert the canonical regions + India + Andaman

# 4. Run dev server
npm run dev                   # http://localhost:3002
# Visit /destinations-v2/asia-pacific/india/andaman
# Hit /api/v2/destinations/tree to see the mega-menu payload
```

To wipe and re-seed:

```bash
npm run hierarchy:reset       # drops + re-applies migrations (no seed)
npm run hierarchy:seed
```

To inspect data:

```bash
npm run hierarchy:studio      # Prisma Studio at localhost:5555
psql -d tvv_hierarchy -c "SELECT slug_path, level, status FROM destinations ORDER BY depth, sort_order;"
```

---

## 13. What's deferred — not built yet, but designed-in

| Feature | Status | Where it slots in |
|---|---|---|
| Admin auth on `/api/v2/admin/*` | TODO | Wrap each handler with the same middleware as legacy `/admin/api/*` |
| ETL from Mongo `Location` | TODO | A one-shot script: walk Locations, build the Region→Country→Destination tree |
| `hreflang` + locale routing | Designed | `app/[locale]/destinations/[...slugs]/page.tsx` + middleware locale extraction |
| `Package.destinationId` FK | Designed | Application-layer FK during the two-store window; native FK post-migration |
| Closure table | Not needed yet | Layer over `destinations` if/when ancestor queries dominate over path lookups |

---

## 14. What you should NOT do

- **Do not write `slug_path` from application code.** The trigger owns it.
  Always send `slugPath: ""` on insert.
- **Do not bypass the `lib/hierarchy/index.ts` barrel.** That's the contract.
  Refactoring internal files is free as long as the barrel holds.
- **Do not hard-delete rows.** Use `status = ARCHIVED`. Downstream domain
  tables FK in here; a hard delete cascades problems.
- **Do not query `@prisma/client` directly** in code that touches the
  hierarchy. Use `hierarchyDb`. The legacy Mongo client and this Postgres
  client share a runtime — direct imports are ambiguous.
- **Do not normalise `depth` away.** It's denormalised on purpose for the
  range-filter hot path. The CHECK constraint keeps it in sync with `level`.

---

## 15. Open questions worth deciding before next sprint

1. **Soft-delete cascade.** When a parent is archived, should children
   archive automatically? Today they don't — they become orphaned. Probably
   wrong long-term, but easy to add later.
2. **Slug history.** When a slug changes, we lose the old URL. A
   `destination_slug_history` table would let middleware emit 301s
   transparently. Maybe worth doing before we go to production.
3. **Sort order management.** Right now `sortOrder` is set per-row; the
   admin needs a dedicated "reorder siblings" endpoint to avoid every
   move-and-save firing N updates.
