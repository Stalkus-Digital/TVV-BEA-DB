# Module Specifications

Status legend: **Approved** = shipped and accepted · **Partial** = code exists, phase incomplete · **Planned** = roadmap only

---

# Customers — Approved (PP-002B)

Purpose

Manage all customer records in Travel OS.

Features

- Create / Edit / Archive / Restore
- Search, filters, pagination
- Customer profile
- Notes
- Booking history (relationship funnel)
- Quote history
- Payment history (read from booking payments)
- Timeline + Audit log
- Duplicate prevention (email / phone)

Out of current scope

- Tags, documents portal (customer self-service docs exist separately)
- Multi-user assignment / RBAC

Primary APIs

- `/api/admin/customers`
- `/api/admin/customers/:id`
- `/api/admin/customers/:id/archive|restore`
- `/api/admin/customers/:id/notes`
- `/api/admin/customers/:id/payments`
- `/api/admin/customers/:id/audit-logs`

---

# Leads (Enquiries) — Approved (PP-002B)

Purpose

Manage incoming enquiries / leads. Enquiry is the CRM lead source of truth.

Features

- CRUD
- Lead status pipeline (list + kanban)
- Lead source
- Follow-up date + priority
- Notes
- Timeline + Audit
- Push to Sembark on create (async)

Deferred

- Employee lead assignment (single owner; UI disabled)
- Conversion automation beyond manual status / quote workflows

Primary APIs

- `/api/admin/enquiries`
- `/api/admin/enquiries/:id`
- `/api/admin/enquiries/:id/status`
- `/api/admin/enquiries/:id/follow-up`
- `/api/admin/enquiries/:id/notes`
- `/api/admin/enquiries/:id/audit-logs`

---

# Quotes — Approved for current workflow (PP-002B)

Purpose

Store and manage quote records needed for Travel OS operations.

Features

- List / create / update / status workflow
- Items, pricing, versions
- Customer linking
- Convert handoff / create booking from approved quote (booking module)
- Timeline (version-based)

Explicitly not current scope

- Quote PDF engine as primary quotation channel (Sembark handles discussions)
- Full quote builder as replacement for Sembark

Primary APIs

- `/api/quotes` and nested item / pricing / version / status routes
- `/api/quotes/:id/audit-logs` (read; writers may be completed in later polish)

---

# Bookings — Partial (foundation exists; PP-002C)

Purpose

Manage bookings across Hotel, Activity, and Holiday Package journeys.

Existing (codebase)

- Booking, BookingItem, Traveller, PassengerDocument
- Status lifecycle APIs (confirm, cancel, ticket, complete)
- Notes, timeline, status history
- Invoice / voucher generation endpoints
- Admin Bookings UI (All / Hotels / Holidays / Activities)
- Create from approved quote
- Website external booking bridge

PP-002C focus

- Unify quote→booking conversion (`convertedBookingId`)
- Enterprise polish (search/filters/empty/toast/audit parity with CRM)
- First-class product fields (hotel/activity) instead of `internalNotes` scraping
- Payment optional workflows end-to-end
- Email confirmation hooks (when email infrastructure ready)
- TripJack fulfillment integration points
- Ferry remains catalogue-only unless explicitly scoped later

---

# Payments — Partial (PP-002C)

Purpose

Track optional payments against bookings.

Existing

- `BookingPayment` model
- Manual admin payment recording
- Razorpay / PhonePe checkout + webhooks
- Refund / reconcile routes
- Customer payment history on CRM profile

PP-002C focus

- Admin payment UX consistency
- Clear optional-payment status rules
- Invoice linkage
- Preserve payment history (no hard deletes)

---

# CMS — Planned (PP-002D)

Blogs, landing pages, SEO pages, media, publishing.

---

# Destinations / Inventory / Holiday Packages / Ferries — Approved (PP-002A)

Catalogue modules. Do not redesign unless fixing bugs.

Ferries today: operators, routes, rates, credentials scaffolding — **not** a ferry booking engine.

---

# Integrations — Approved (PP-001)

Vault, provider configs, health. Payment gateways and Sembark used by CRM/booking flows.

---

# Users / Roles / Notifications / Settings — Planned (PP-002E)

Single owner account today. RBAC and employee workflows deferred.
