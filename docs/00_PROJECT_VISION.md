# 00 — Project Vision

## Project Name

**TVV Travel OS**

## Purpose

TVV Travel OS is **NOT**:
- an OTA
- a booking website
- a CRM

It **is** an AI-powered Travel Operating System — the operational core and system of record that a travel website, a travel operations team, a sales team, and future AI services all draw from and act through. A website is a client of it. CRM is one module inside it. Neither is what it *is*.

## What It Powers

- TVV Public Website (existing, separate repo — consumes this system's APIs, is not rebuilt by this project)
- Travel Operations (inventory, suppliers, itinerary construction)
- Sales Team (CRM, quoting, bookings)
- Holiday Packages (static, dynamic, and semi-dynamic)
- TripJack (flights & hotels supplier integration)
- Ferry APIs
- AI Services (package generation, content generation)

## Architecture Principles

These six principles are binding on every future design decision for this system:

1. **Supplier Agnostic** — TripJack, Ferry operators, and any future supplier (TBO, HotelBeds, Makruzz, manual/contracted) are interchangeable implementations behind one interface per product type. No business logic ever branches on a supplier's identity.
2. **API First** — every capability (booking, inventory, packages, CRM, AI) is designed as an API before it is designed as a UI. The admin dashboard itself is a client of its own API, same as the public website.
3. **Inventory Driven** — Hotels, Flights, Activities, Transfers, and any future product type are all instances of one inventory model. Nothing sellable exists outside the inventory layer.
4. **Destination First** — Destination is the primary organizing entity the rest of the catalog hangs off: packages, activities, hotels, guides, and landing pages are all scoped to a destination, not the other way around. Browsing, SEO, and content structure start from "where," not from "what product type."
5. **Headless CMS Ready** — content (destinations, guides, landing pages) is structured data served through an API, consumable by the existing website or any future client, never hand-built HTML/PHP tied to one output target.
6. **AI Ready** — every domain object (package, itinerary, content) is structured so an AI generation step can produce it and a human can review/edit it through the identical path a manually-created one would follow. AI is a producer of normal records, not a special case.

## Status of this document

This is the current, canonical statement of vision and principles for the project. It supersedes informal restatements of the same vision made earlier in ad hoc planning documents at the repository root (`README.md`, `ARCHITECTURE_MIGRATION.md`) — those remain as historical working documents from the initial architecture pass and are not deleted, but this `/docs` series is now the primary reference going forward. See `01_CURRENT_SYSTEM_AUDIT.md` for the state of the existing codebase against these principles.
