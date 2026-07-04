# TVV Travel OS

## Purpose

**A Travel Operating System.**

Not a travel website. Not an OTA. Not a CRM.

TVV Travel OS is the operational core that powers all three — it is the system of record for inventory, suppliers, packages, and bookings, exposed as an API. A website, an agent portal, a customer portal, and a mobile app are all *clients* of it, not parts of it. CRM (leads/pipeline) is one module inside it, not its identity.

## Vision

**An AI-powered Travel ERP.**

Not a booking engine with an admin panel bolted on — an operating system that TripJack, TBO, HotelBeds, Makruzz, and every future supplier plug into identically, that AI generates packages against using the same data every human agent works from, and that any future customer-facing surface (existing website, mobile app, agent portal, customer portal) consumes through one stable API rather than its own bespoke integration.

## Architecture

```
Website  (existing — not rebuilt; see WEBSITE_API.md)
   ↓
Travel API   (versioned, public-facing facade — WEBSITE_API.md)
   ↓
Travel OS    (business services: Bookings, Packages, CRM, AI — PACKAGE_BUILDER.md, DATABASE_SCHEMA.md)
   ↓
Inventory Layer   (one polymorphic catalog for every product kind — INVENTORY_SYSTEM.md)
   ↓
Supplier Layer   (ports & adapters — business code never knows a supplier's name — SUPPLIER_ABSTRACTION_LAYER.md)
   ↓
TripJack   (supplier #1 — just an adapter, not a special case)
   ↓
Future Suppliers   (TBO, HotelBeds, Makruzz, Manual — additive, zero change above this line)
```

Each arrow is a hard boundary, not a suggestion: a layer only ever talks to the one directly below it, and nothing above the Travel API layer is allowed to know a supplier's name exists (enforced structurally — see `SUPPLIER_ABSTRACTION_LAYER.md` §1.3).

## Principles

| Principle | Where it's enforced |
|---|---|
| **Supplier Agnostic** | `suppliers` table + `inventory_item_mappings` + Ports/Adapters — TripJack is a row, never a table name or an `if` branch (`SUPPLIER_ABSTRACTION_LAYER.md`) |
| **API First** | Every layer above Inventory is consumed through a versioned API, including the admin's own UI — the existing website is proof this already works without touching its code (`WEBSITE_API.md`) |
| **Inventory Driven** | Hotels, Flights, Activities, Transfers, Visa, Insurance are all one `inventory_items` table with kind-specific extensions — Bookings and Packages reference `inventory_item_id`, never a per-domain table (`INVENTORY_SYSTEM.md`) |
| **Modular** | Each domain (Inventory, Suppliers, Packages, CRM, AI, Website API) is an independent folder with its own ports, services, and state — addable/removable without touching the others |
| **Enterprise** | Versioned APIs with deprecation windows, immutable package/booking version history, audit logging, RBAC-ready — not startup-grade shortcuts (`WEBSITE_API.md` §11, `PACKAGE_BUILDER.md` §3.4, `DATABASE_SCHEMA.md` §1.1) |

## Current Stack

| Layer | Choice | Status |
|---|---|---|
| Framework | Next.js (App Router) | ✅ in place today |
| UI | React, TypeScript, Tailwind | ✅ in place today |
| ORM | Prisma | ⏳ decided, not yet installed — no ORM exists in the codebase yet |
| Database | PostgreSQL | ⏳ decided, not yet provisioned — no database exists in the codebase yet |

**Honest gap note:** today's `package.json` has Next.js/React/TypeScript/Tailwind and nothing else — no ORM, no database, no `process.env` usage at all (see `ARCHITECTURE_MIGRATION.md` §1). Declaring Prisma + PostgreSQL as the stack is a real decision, but it's not yet reflected in the repo. Per the standing migration principles (`ARCHITECTURE_MIGRATION.md` §6), introducing them is an **additive** step — Phase 0/3 of the migration plan — not a rewrite: Prisma schema and a Postgres connection get added alongside the existing static pages, and each page cuts over to real data one at a time, exactly as already planned.

## Future

| Item | How the architecture already accommodates it |
|---|---|
| **AI** | Already modeled (`ai_generation_requests`/`outputs`, `packages.ai_generated_from_id`) — AI Studio produces a draft package through the same publish/version path any agent uses (`PACKAGE_BUILDER.md` §1.4) |
| **TripJack** | Supplier adapter #1 (`SUPPLIER_ABSTRACTION_LAYER.md` Phase B) |
| **TBO, HotelBeds, Makruzz** | Additive adapters — new folder + new `suppliers` row each, zero change to Inventory/Bookings/Packages (`SUPPLIER_ABSTRACTION_LAYER.md` Phase D) |
| **Mobile App** | A fourth API consumer, no different in kind from the existing website — this is the direct payoff of "API First": it didn't need to be anticipated to be supported |
| **Agent Portal** | A new consumer with a broader, authenticated scope than the public Travel API (partner/agent-facing booking on behalf of customers) — reuses the same Inventory/Package/Booking services, with its own auth tier alongside the two already defined in `WEBSITE_API.md` §9 (service-to-service, customer OTP) |
| **Customer Portal** | Extends the lightweight OTP-based booking lookup already scoped in `WEBSITE_API.md` §9 into a fuller self-service account — additive, not a redesign |

The fact that Mobile App, Agent Portal, and Customer Portal all slot in as "just another client of the Travel API" rather than requiring backend changes is the concrete validation of the API-First and Inventory-Driven principles above — that's what they're *for*.

**Resolves an open question from `WEBSITE_API.md` §3/§8:** "Not an OTA" confirms the flights/booking scope assumed there — indicative pricing and agent-mediated booking, not self-serve OTA checkout. If that changes later, it changes as an additive scope expansion to those sections, not a redesign.

## Governing Principles

Never delete existing features. Reuse existing pages. Refactor gradually. Minimize breaking changes. Always preserve backward compatibility. Explain why before replacing anything. Never rewrite everything at once.

Full detail and the concrete expand→migrate→cut over→contract sequencing this implies: `ARCHITECTURE_MIGRATION.md` §6.

## Document Index

| Document | Covers |
|---|---|
| [ARCHITECTURE_MIGRATION.md](ARCHITECTURE_MIGRATION.md) | Current-state audit, phased migration plan, governing principles |
| [DATABASE_SCHEMA.md](DATABASE_SCHEMA.md) | Base ERD, table list, indexes, caching, future expansion |
| [SUPPLIER_ABSTRACTION_LAYER.md](SUPPLIER_ABSTRACTION_LAYER.md) | Ports & Adapters, TripJack/TBO/HotelBeds/Makruzz/Manual, offer-ref opacity |
| [INVENTORY_SYSTEM.md](INVENTORY_SYSTEM.md) | Polymorphic `inventory_items` core, kind registry, supplier mapping |
| [PACKAGE_BUILDER.md](PACKAGE_BUILDER.md) | Static/Dynamic/Semi-Dynamic packages, versioning, pricing, templates |
| [WEBSITE_API.md](WEBSITE_API.md) | Full public API list for the existing (unmodified) website, auth, caching, versioning |

**Status:** design/planning phase throughout — no implementation exists yet for any of the above beyond the current static Next.js prototype.
