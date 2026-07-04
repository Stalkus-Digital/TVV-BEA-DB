# 19 — Background Jobs

**Status:** Phase 2 — architecture plan only, no code implemented. No job/queue/scheduler infrastructure exists anywhere in this project. This is the concrete plan for the **Notification Engine**, named in `docs/02_SYSTEM_ARCHITECTURE.md` as an approved-but-unscheduled future module (`CLAUDE.md`'s "Future Engine Modules" section) — this document schedules it, scoped to what Phase 2 stabilization actually needs rather than the full generic event-bus `docs/02`'s Event Flow section sketches.

## Why This Wasn't Built Sooner

Every prior sprint's instructions were explicit that background/async work was out of scope (Payments were never wired to a gateway, AI generation was never live, Notification Engine was explicitly named as deferred). Nothing in the system has needed asynchronous execution because every operation so far completes synchronously against an in-memory store within a single request. Two real gaps exist today specifically *because* nothing runs on a schedule:

## Concrete Job Candidates (from real gaps found in `docs/15`, not invented generically)

### 1. Quote Expiry Sweep — the clearest real gap

`Quote.validTo` exists and `QuotePdfData.isExpired` is *computed* on read (`new Date(quote.validTo).getTime() < Date.now()`), but **nothing ever transitions `Quote.status` when a quote actually expires.** A quote sitting in `SENT` past its `validTo` stays `SENT` forever unless a human explicitly rejects it — `docs/14`'s own status lifecycle diagram never included an automatic path to a would-be `EXPIRED` state (a deliberate decision at the time, per that document: "EXPIRED... left as computed, not stored"). Now that background jobs are being planned, revisit that decision: a scheduled sweep (`GET`/cron-triggered `POST /api/internal/jobs/quote-expiry-sweep`, hourly) that finds every `SENT` quote past `validTo` and marks it `REJECTED` with `rejectionReason: "Expired"` would close this gap without changing Quote's public API shape — it would just start actually enforcing what `validTo` already implies.

### 2. Booking Voucher/Invoice Generation — currently synchronous, fine for now, worth revisiting

`POST /api/bookings/:id/voucher` and `.../invoice` run entirely synchronously within the request (pure data assembly, no PDF rendering yet per `docs/18`). Once `docs/18`'s PDF rendering is implemented, this generation step will become meaningfully slower (headless-Chrome-based rendering in particular can take seconds) — at that point, move generation to an async job (`POST` enqueues a job, returns `202 Accepted` with a job ID, a follow-up `GET` or webhook delivers the finished document). Not needed until PDF rendering exists; flagged here so it isn't rediscovered as a surprise later.

### 3. Supplier Health Re-check

`GET /api/suppliers/:code/health` currently re-checks synchronously, on demand, every time it's called. At real scale (an admin dashboard polling this every few seconds) this becomes wasteful once real HTTP calls to TripJack exist (Sprint 14, still future) — a scheduled background poll (every 1–5 minutes) that writes the result somewhere the read endpoint just returns from would decouple "how often we check" from "how often someone asks." Low priority until Sprint 14 actually wires a real HTTP call — checking a placeholder's health on every request costs nothing today.

### 4. Payment Reminder (identified gap, not yet a real requirement)

`Booking.paymentStatus` can sit at `PARTIAL` indefinitely with no reminder mechanism — a real ops team would likely want a scheduled job flagging bookings with outstanding balances approaching their travel date. No travel-date field currently exists on `Booking` to key this off of (see `docs/08`'s own remaining-TODOs list) — this job cannot be built until that gap is resolved, listed here as a dependency, not a ready-to-build job.

### 5. Search Index Rebuild (future, tied to the still-unscheduled Search Engine)

`docs/02` names a Search Engine as an approved-but-unscheduled future module; Website's own search today is explicitly documented as "a straightforward in-memory filter... NOT the dedicated Search Engine." If/when a real Search Engine is built (still not scheduled, per `CLAUDE.md`), it will need a background reindex job. Listed here for completeness, not proposed as near-term work.

## Recommended Infrastructure: Vercel Cron + Vercel Queues

This project already runs on Vercel. Two of its native primitives cover every job candidate above without introducing a new operational dependency (no separate Redis-backed queue service, no external cron provider):

- **Vercel Cron** (`vercel.ts`'s `crons` config) — for time-based jobs with no per-event trigger: the Quote Expiry Sweep (hourly) and Supplier Health Re-check (every few minutes), once needed.
- **Vercel Queues** — for event-triggered async work: Booking Voucher/Invoice generation once PDF rendering makes it slow enough to warrant decoupling from the request/response cycle.

Both run as ordinary Vercel Functions under Fluid Compute — no new deployment target, no new infrastructure to provision, consistent with this project's stated preference for platform-native tooling over bespoke infrastructure wherever the platform already provides it.

## Design: A New `internal/jobs` Route Namespace

Following the existing `src/app/api/*` convention, scheduled jobs are ordinary route handlers under a namespace excluded from any future public/admin auth gate but protected by a shared secret header (Vercel Cron supports this natively via `Authorization: Bearer $CRON_SECRET`):

```
POST /api/internal/jobs/quote-expiry-sweep      Calls getQuoteService()-equivalent, no new module needed
POST /api/internal/jobs/supplier-health-poll     Calls existing getXHealthCheck() paths, writes a cache
```

Each job handler is a thin wrapper calling existing module service methods — the Quote Expiry Sweep, for example, needs a new `QuoteService.expireOverdue()` method (a small, additive change to Quote's own service, not a new module) that lists `SENT` quotes past `validTo` and calls the existing `reject()` path per quote, reusing every guard `reject()` already enforces rather than writing new status-transition logic.

## What This Plan Does Not Cover

- A generic, docs/02-style event bus ("Booking Created → Generate Voucher → Send Email → Notify CRM → Update Analytics") — that is the full Notification Engine, still correctly unscheduled since CRM/CMS/AI are all explicitly out of scope for the current phase. This document only schedules the narrow, concretely-identified jobs above.
- Email/SMS delivery — no provider decision has been made; the Payment Reminder job candidate depends on this being decided separately, and is listed as blocked, not ready.
