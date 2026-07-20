# AI Changelog

## 2026-07-20

PP-002A Approved

Implemented

Inventory

Packages

Ferries

Deployment

42ae8cb

Production Ready

---

PP-002B Sales CRM — Completed

Customers

- CRUD (create, edit, archive, restore)
- Search, filters, pagination
- Customer profile with extended fields
- Booking history (funnel view)
- Payment history API
- Notes (CustomerNote model)
- Activity timeline + audit logs
- Bulk archive
- Toast notifications

Leads (Enquiries)

- CRUD via Enquiry service
- Search, filters (status, type, source, date)
- Lead status pipeline (list + kanban)
- Lead source options (Website, Google Ads, Meta Ads, etc.)
- Follow-up date + priority
- Notes, timeline, audit logs
- Sembark integration preserved

Quotes

- Data management (no PDF quote engine)
- List, create, edit, status workflow
- Customer linking
- Version history + pricing
- Audit logs endpoint

Infrastructure

- Schema migration: followUpDate, priority on enquiries, customer_notes table
- Audit event types: CUSTOMER_*, ENQUIRY_*, QUOTE_*
- Sidebar: Sales CRM group (Leads, Customers, Quotes)
- AdminCustomerService + API routes

Build verified with TypeScript checks and production build.

---

PP-002B Started

Created feature branch

feature/pp-002b-sales-crm
