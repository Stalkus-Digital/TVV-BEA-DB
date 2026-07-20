# AI Project Context

## Project Overview
- **Project name:** The Vacation Voice (TVV) Travel OS
- **Business vision:** Operational backend as the Single Source of Truth for packages, destinations, hotels, activities, pricing, CMS content, CRM, and bookings. The public website is a presentation layer only.
- **Product purpose:** Admin Travel OS for catalogue, sales CRM, bookings, payments, CMS, and integrations.
- **End users:** Business owner (single-owner account today). Customer self-service and website consumers via APIs.

## System Architecture
- **Backend / Frontend:** Next.js 15 monolith (App Router) — API routes + admin UI in one repo
- **Database:** PostgreSQL via Prisma
- **Authentication:** JWT sessions; middleware forwards auth headers to route handlers
- **APIs:** REST with standard `{ success, data, message }` envelopes
- **Deployment:** Production-oriented Next.js build; Integration Vault requires `INTEGRATION_SECRETS_KEY` in production

## Technology Stack
- Next.js, TypeScript (strict), Prisma, PostgreSQL
- Tailwind CSS, Lucide icons
- JWT auth, React Query for admin data fetching
- REST APIs under `src/app/api/`
- Domain modules under `src/modules/`; admin UI under `src/features/admin-*`

## Current Project Status
- **Completed:** PP-001 Integrations, PP-002A Product Catalog, **PP-002B Sales CRM** (approved)
- **In Progress / Next:** PP-002C Booking Engine
- **Pending:** PP-002D CMS, PP-002E Admin, QA, Documentation, Launch

## Completed Phases
- **PP-001** — Integrations hub (vault, providers, health)
- **PP-002A** — Destinations, Hotels, Activities, Holiday Packages, Ferry Operators/Rates
- **PP-002B** — Sales CRM: Customers, Leads (Enquiries), Quotes (data management; quotation PDFs remain out of scope / Sembark)

## Current Phase
**PP-002C — Booking Engine**

## Coding Philosophy
- Production-ready code only; no placeholders unless approved
- Reuse existing architecture and UI patterns
- Business rules override implementation preferences
- Never invent undocumented workflows

## Architecture Principles
- Thin API routes → module handlers → services → repositories (Prisma)
- Feature slices for admin UI (`src/features/admin-*`)
- Keep completed modules stable unless fixing real bugs
- Single owner account today — no employee RBAC / lead assignment UI

## Folder Structure
```
src/app/api/          # REST route entry points
src/app/<pages>/      # Admin pages
src/modules/          # Domain services, repos, validation
src/features/admin-*  # Admin UI feature slices
src/components/       # Shared layout / admin components
prisma/               # Schema + migrations
docs/                 # Project governance docs
```

## Database Rules
- Prisma only; no raw SQL unless necessary
- Soft archive preferred over hard delete where established
- Audit logs are append-only

## API Rules
- Validate input server-side
- Authenticate protected routes
- Return standard success/error envelopes
- Record audit events for important mutations with `actorUserId` when available

## UI Standards
- Enterprise SaaS: header, filters, search, table, pagination, drawer detail
- Skeleton/loading, empty, error states; toasts on key actions
- Reuse `WidgetState`, drawer patterns from Product Catalog / CRM

## Security Standards
- JWT + route permission map
- Never trust frontend validation alone
- Secrets via Integration Vault; never log secret values

## Performance Standards
- Paginate list endpoints
- Debounce search
- Avoid client-side full-dataset aggregation for production-scale lists

## Development Workflow
1. Read `AI_CONTEXT.md`, `BUSINESS_RULES.md`, `DEVELOPMENT_RULES.md`, coding/UI standards, roadmap, module specs
2. Implement on feature branch
3. TypeScript + production build before claiming done
4. Update `AI_CHANGELOG.md`
5. Ask before updating `BUSINESS_RULES.md`

## Git Workflow
- Feature branches (e.g. `feature/pp-002b-sales-crm`)
- Conventional commits (`feat(crm): …`)
- No force-push to main; commit only when requested

## Deployment Process
- Prisma migrate deploy for schema changes
- Ensure production env vars (including `INTEGRATION_SECRETS_KEY`) are set
- Verify build before release

## Testing Requirements
- TypeScript (`tsc --noEmit`)
- Production build
- Manual QA of critical CRM/booking flows before approval

## AI Working Instructions
- Follow BUSINESS_RULES.md exactly (Holiday Packages = enquiry-based; Hotels/Activities = direct book; payment optional; no Quote PDF engine until officially approved; no invented RBAC)
- Do not redesign completed modules
- Do not start the next phase until the current phase is approved
- Ask before updating BUSINESS_RULES.md
