# 02 — System Architecture

# TVV Travel OS System Architecture

Version: 2.0

Status: Architecture Approved

---

# Purpose

This document defines the architecture of TVV Travel OS.

It is the foundation for every future development decision.

No module should be implemented without following this architecture.

This document supersedes ad-hoc architectural discussions.

---

# What is TVV Travel OS?

TVV Travel OS is an AI Powered Travel Operating System.

It is NOT

- an OTA
- a booking website
- a CRM

Instead it is the operational platform powering

- TVV Public Website
- Sales Team
- Operations Team
- Package Management
- Inventory
- Supplier Integrations
- AI Services

The public website is only one client of Travel OS.

---

# High Level Architecture

                    TVV Public Website
                           │
                           │ REST / GraphQL APIs
                           ▼
                API Gateway / Travel API
                           │
──────────────────────────────────────────────────────────────
                           │
                     Travel OS Core
                           │
──────────────────────────────────────────────────────────────
      CRM     Inventory     Packages     CMS     Bookings
                           │
──────────────────────────────────────────────────────────────
                    Business Services
                           │
──────────────────────────────────────────────────────────────
 Destination Engine
 Inventory Engine
 Pricing Engine
 Booking Engine
 Supplier Engine
 AI Engine
 Search Engine
 Notification Engine
                           │
──────────────────────────────────────────────────────────────
                  Supplier Adapter Layer
                           │
 TripJack
 Ferry API
 Manual Suppliers
 Future Suppliers
                           │
──────────────────────────────────────────────────────────────
 External Systems

---

# Architectural Philosophy

Every module follows these principles.

## 1. Supplier Agnostic

Business logic must never know

TripJack

Makruzz

TBO

HotelBeds

or any supplier.

Business only knows

Flights

Hotels

Activities

Transfers

Inventory

The Supplier Engine decides where data comes from.

---

## 2. API First

Every feature is implemented as an API first.

The Admin Dashboard uses the same APIs as the website.

No page should directly access the database.

Flow

UI

↓

API

↓

Business Service

↓

Repository

↓

Database

---

## 3. Inventory Driven

Inventory is the heart of the system.

Everything sellable is Inventory.

Inventory Types

Flights

Hotels

Activities

Transfers

Visa

Insurance

Packages reference Inventory.

Bookings reference Inventory.

AI searches Inventory.

Website displays Inventory.

---

## 4. Destination First

Destination is the highest level business object.

Everything belongs to a destination.

Destination

↓

Flights

Hotels

Activities

Transfers

Packages

Blogs

Landing Pages

Guides

SEO

---

## 5. Headless CMS

The admin never renders webpages.

It only manages structured data.

The Website consumes data through APIs.

This allows

Website

Mobile App

Agent Portal

Future Apps

to use the same backend.

---

## 6. AI Ready

AI never creates special records.

AI creates the exact same records a human creates.

Example

Human creates package

↓

Package Table

AI creates package

↓

Package Table

No AI specific database.

---

# Layer Architecture

Layer 1

Presentation

Contains

Website

Admin Dashboard

Mobile Apps

Agent Portal

Responsibilities

Display

Forms

User Interaction

Nothing else.

---

Layer 2

API Layer

Responsibilities

Authentication

Validation

Permissions

Serialization

Routing

No business logic.

---

Layer 3

Business Layer

Contains

CRM

Packages

Bookings

Pricing

CMS

Inventory

Business Rules

No UI.

No database code.

---

Layer 4

Engine Layer

Contains

Destination Engine

Inventory Engine

Booking Engine

Pricing Engine

Supplier Engine

AI Engine

Notification Engine

Search Engine

This is where most logic lives.

---

Layer 5

Supplier Layer

Contains

TripJack

Ferry

Manual

Future Suppliers

Every supplier implements a common interface.

---

Layer 6

Persistence Layer

Contains

PostgreSQL

Redis

Blob Storage

Logs

---

# Module Relationships

Destination Engine

↓

Inventory Engine

↓

Package Builder

↓

Booking Engine

↓

Website

Destination always comes first.

---

Inventory Engine

Provides

Flights

Hotels

Activities

Transfers

Insurance

Visa

Everything consumes Inventory.

---

Supplier Engine

Never called directly.

Only Inventory Engine communicates with suppliers.

Example

Inventory.searchFlights()

↓

TripJack Adapter

↓

TripJack API

Business never knows.

---

Package Builder

Uses

Inventory

Pricing

Destination

AI

Package Builder NEVER talks to TripJack.

---

Booking Engine

Uses

Inventory

Package

Payments

Supplier

Notifications

Booking Engine NEVER queries suppliers directly.

---

Website

Uses APIs only.

Website NEVER

calls TripJack

calls Database

calls Ferry API

Everything goes through Travel API.

---

# Request Flow

Customer

↓

Website

↓

Travel API

↓

Inventory Engine

↓

Supplier Engine

↓

TripJack

↓

Results

↓

Inventory

↓

Website

---

Package Flow

Admin

↓

Package Builder

↓

Inventory Engine

↓

Destination Engine

↓

Pricing Engine

↓

Package

↓

Database

---

Booking Flow

Website

↓

Booking API

↓

Booking Engine

↓

Inventory Validation

↓

Supplier Booking

↓

Payment

↓

Confirmation

↓

Voucher

↓

Website

---

# AI Flow

User

↓

AI Request

↓

AI Engine

↓

Inventory

↓

Destination

↓

Pricing

↓

Supplier

↓

Generated Package

↓

Human Review

↓

Published Package

AI never publishes directly.

---

# Module Ownership

CRM

Owns

Leads

Customers

Sales Pipeline

Tasks

Notes

---

Destination Engine

Owns

Countries

States

Cities

Destinations

Destination SEO

Destination Content

---

Inventory Engine

Owns

Hotels

Flights

Activities

Transfers

Visa

Insurance

Supplier Mapping

---

Supplier Engine

Owns

TripJack

Ferry

Future Suppliers

Health

Credentials

Logs

---

Package Builder

Owns

Package Templates

Package Versions

Pricing Rules

Itinerary

Media

Policies

---

Booking Engine

Owns

Bookings

Booking Items

Travellers

Payments

Documents

Invoices

Refunds

---

CMS

Owns

Blogs

Landing Pages

Guides

FAQs

Media

Website Content

---

AI Engine

Owns

Generation Requests

Generated Content

Prompt History

Review Queue

Recommendations

---

# Communication Rules

Modules cannot directly access each other.

Everything must communicate through Services.

Example

Package Builder

↓

Inventory Service

↓

Supplier Service

↓

TripJack

NOT

Package Builder

↓

TripJack

---

# Future Expansion

Future integrations should require

ZERO

changes to business modules.

Adding

HotelBeds

↓

Create Adapter

Register Supplier

Done.

No Package changes.

No Booking changes.

No Website changes.

---

# Folder Philosophy

Each Engine should become its own bounded context.

Example

src/modules

crm

inventory

supplier

destination

booking

package

pricing

cms

ai

Each module owns

API

Services

Repositories

Validation

Types

No shared business logic.

---

# Security

All external APIs

TripJack

Ferry

Payment Gateway

must be accessed only through backend services.

API Keys never reach frontend.

Supplier credentials are encrypted.

Every API request is logged.

---

# Caching Strategy

Cache

Airport List

Destination List

Hotel Metadata

Static Inventory

Never Cache

Flight Prices

Hotel Prices

Availability

Seat Maps

These must always come live from suppliers.

---

# Event Flow

Future architecture should support events.

Examples

Booking Created

↓

Generate Voucher

↓

Send Email

↓

Notify CRM

↓

Update Analytics

No module should manually trigger another.

---

# Success Criteria

The architecture is considered successful if

A new supplier can be added without changing business logic.

The website never communicates with suppliers.

Packages work regardless of supplier.

AI uses the same APIs as humans.

Every module is independently testable.

Inventory becomes the single source of truth.

Destination remains the anchor entity.

The system scales from one supplier to many without redesign.

---

# Architecture Summary

Presentation Layer

↓

API Layer

↓

Business Layer

↓

Engine Layer

↓

Supplier Layer

↓

Database

The business owns the workflow.

Suppliers only provide inventory.

The website only consumes APIs.

AI is a first-class citizen but never bypasses business rules.

TVV Travel OS becomes the single operational platform for every travel product sold by The Vacation Voice.
