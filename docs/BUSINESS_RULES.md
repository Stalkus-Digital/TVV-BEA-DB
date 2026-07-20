# Business Rules Maintenance

This document represents the approved business workflows of The Vacation Voice Travel OS.

It must never be updated automatically based on code changes.

Whenever a new feature, workflow, or module is completed, the AI assistant must first ask the Project Owner whether the feature has been approved as part of the official business process.

Only after explicit approval may this document be updated.

The AI assistant must ask the following questions before making any changes to BUSINESS_RULES.md:

1. Has this feature been fully implemented?
2. Has it been tested and verified?
3. Is it now part of the official business workflow?
4. Should BUSINESS_RULES.md be updated to reflect this feature?
5. Are there any existing business rules that should be modified or removed?

Only after receiving confirmation should BUSINESS_RULES.md be updated.

This document must always describe the current approved business process, not future plans or partially implemented features.

# BUSINESS_RULES.md

# The Vacation Voice (TVV) Travel OS
## Business Rules & Operational Logic

**Version:** 1.1
**Status:** Active
**Last Updated:** 20 July 2026

---

# 1. Purpose

This document defines the official business rules for The Vacation Voice Travel OS.

Every AI assistant, developer, and contributor must follow these rules.

Business rules override implementation preferences.

If a workflow is not documented here, do not invent one.

---

# 2. Product Vision

The Travel OS is the operational backend for The Vacation Voice.

The website is only a customer-facing presentation layer.

The backend is the Single Source of Truth for all business data.

The website should never contain hardcoded business information.

All packages, destinations, hotels, activities, pricing, CMS content and bookings should originate from the backend.

---

# 3. Business Model

The Vacation Voice currently operates using **two different booking journeys.**

## Journey A – Holiday Packages (Human Assisted Sales)

Holiday Packages are **not booked directly online.**

Customer Journey:

Visitor

↓

Website

↓

Package Enquiry Form

↓

Lead Created

↓

Lead pushed to Sembark CRM

↓

Sales Team Follow-up

↓

Custom Quote prepared manually

↓

Customer Approval

↓

Booking created

↓

Payment (Optional based on business process)

↓

Trip Confirmed

The Travel OS is **not responsible for generating or sending package quotations.**

All quotation discussions currently happen inside **Sembark CRM**.

---

## Journey B – Hotels & Activities (Direct Booking)

Hotels and Activities support direct customer bookings.

Customer Journey:

Visitor

↓

Website

↓

Search

↓

Select Hotel / Activity

↓

Book

↓

Booking Created

↓

Optional Online Payment

↓

Booking Confirmation

↓

Booking pushed to Sembark CRM

↓

Operations Follow-up

Payment is **optional**.

Some bookings may be confirmed before payment depending on operational requirements.

---

# 4. Lead Rules

Every enquiry creates exactly one Lead.

Supported Lead Sources:

- Website
- Google Ads
- Meta Ads
- WhatsApp
- Phone
- Email
- Referral
- Manual Entry

Each Lead contains:

- Status
- Source
- Notes
- Timeline
- Audit History

Current system has only one business owner.

Lead assignment is not implemented.

Future employee assignment will be added later.

---

# 5. Customer Rules

Customers are created through:

- Lead conversion
- Direct Booking
- Manual creation

Duplicate customers should be prevented using:

- Email
- Phone Number

Customer Profile stores:

- Contact Information
- Quotes
- Bookings
- Payments
- Timeline
- Notes

---

# 6. Quote Rules

Current Business Process:

Holiday Package quotations are created and managed inside **Sembark CRM**.

Travel OS currently stores customer information and booking data.

Travel OS should not generate quotation PDFs until that feature is officially implemented.

Future quote generation inside Travel OS is planned but is **not part of the current implementation**.

---

# 7. Booking Rules

Bookings may originate from:

- Holiday Package confirmation
- Hotel booking
- Activity booking

Booking Status:

- Pending
- Confirmed
- Cancelled
- Completed

Booking stores:

- Customer
- Products
- Pricing
- Notes
- Timeline
- Payment Status

---

# 8. Payment Rules

Payment is optional.

Business decides whether payment is collected:

- Before confirmation
- After confirmation
- Offline
- Online

Supported methods:

- Payment Gateway
- UPI
- Bank Transfer
- Credit Card
- Cash
- Manual Entry

Payment history must never be deleted.

Refunds must preserve original transactions.

---

# 9. Holiday Package Rules

Holiday Packages contain:

- Destination
- Hotels
- Activities
- Ferry
- Pricing
- Itinerary
- Gallery
- SEO Content
- Inclusions
- Exclusions

Package Status:

- Draft
- Published
- Archived

Only Published packages appear on the website.

Packages currently generate enquiries rather than instant bookings.

---

# 10. Destination Rules

Destination is the parent entity.

Hotels belong to Destinations.

Activities belong to Destinations.

Holiday Packages belong to Destinations.

No orphan records should exist.

---

# 11. Inventory Rules

Inventory currently includes:

- Hotels
- Activities

Transfers are **not part of the current implementation** and should not be treated as active inventory.

Inventory Status:

- Draft
- Published
- Archived

Archived inventory should never appear on the website.

---

# 12. Ferry Rules

Ferry module manages:

- Operators
- Routes
- Rates
- Supplier Credentials

Future availability management will be implemented later.

---

# 13. CMS Rules

CMS manages:

- Blogs
- Landing Pages
- SEO Pages
- Website Content
- Media

Website content should never be hardcoded.

---

# 14. User Rules

Current implementation supports a **single owner account**.

Role Based Access Control (RBAC) is **not implemented yet**.

Employee management is planned for a future phase.

AI assistants must not assume multiple-user workflows currently exist.

---

# 15. Audit Rules

Important actions should generate:

- Audit Log
- Timestamp
- User
- Entity
- Previous Value
- New Value

Audit history should remain permanent.

---

# 16. Activity Timeline

Major modules should maintain chronological activity.

Typical events:

- Created
- Updated
- Published
- Archived
- Restored
- Booking Created
- Payment Recorded

---

# 17. Email Rules

Email notifications are planned.

Once email service is configured:

Customers should automatically receive:

- Booking Confirmation
- Booking ID
- Booking Details

This functionality should integrate with the system when email infrastructure is available.

Until then, email workflows are considered pending.

---

# 18. Website Rules

Website consumes backend APIs only.

Never hardcode:

- Packages
- Hotels
- Activities
- Destinations
- SEO Content
- Pricing

---

# 19. API Rules

Every API should:

- Validate Input
- Authenticate User
- Return Standard Responses
- Handle Errors
- Log Failures

---

# 20. Security Rules

Every protected endpoint requires:

- Authentication
- Input Validation
- Audit Logging

Frontend validation is never sufficient.

---

# 21. AI Development Rules

Every AI assistant must:

- Read AI_CONTEXT.md before coding.
- Follow DEVELOPMENT_RULES.md.
- Follow PROJECT_ROADMAP.md.
- Never redesign completed modules.
- Never implement future features unless explicitly requested.
- Never assume Role Based Access exists.
- Never assume Quote Engine exists.
- Never assume Payment is mandatory.
- Never assume Holiday Packages support instant checkout.
- Ask for clarification whenever business logic is unclear.

---

# 22. Current Project Status

Completed:

- Integrations
- Product Catalog

Current Phase:

- Sales CRM

Upcoming:

- Booking Engine
- CMS
- Administration

Future enhancements should be tracked in PROJECT_ROADMAP.md rather than treated as existing functionality.

---

END OF DOCUMENT