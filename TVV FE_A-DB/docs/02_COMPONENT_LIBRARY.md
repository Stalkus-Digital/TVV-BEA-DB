# 02. Component Library Catalog

This document catalogs the reusable components in **The Vacation Voice V2**. It organizes components into layout shells, design system primitives, cards, sections, interactive forms, and loading states.

---

## 1. Core Layout Components
*Location: `/components/layout/`*

These components define the persistent structural frame of the application.

### [Navbar](file:///Users/rahulnair/Desktop/TVV%20FE:A-DB/components/layout/Navbar.tsx)
*   **Purpose:** Primary site navigation. Displays logo, main routes, quick links, and plan buttons.
*   **Behavior:** Sticky top, translucent glassmorphism with overlay blur on scroll.
*   **Props:** None. Responsive mobile drawer integration.

### [MegaMenu](file:///Users/rahulnair/Desktop/TVV%20FE:A-DB/components/layout/MegaMenu.tsx)
*   **Purpose:** Multi-column dropdown panel for destinations and packages.
*   **Behavior:** Appears on group hover inside Navbar. Includes delay timers to prevent accidental closures.
*   **Props:** `group: NavigationGroup`, `open: boolean`.

### [Footer](file:///Users/rahulnair/Desktop/TVV%20FE:A-DB/components/layout/Footer.tsx)
*   **Purpose:** Standard footer containing site maps, contact details, social hooks, legal links, and newsletters.
*   **Props:** None.

### [ConciergeWidget](file:///Users/rahulnair/Desktop/TVV%20FE:A-DB/components/layout/ConciergeWidget.tsx)
*   **Purpose:** Persistent chat/Whatsapp concierge hook at bottom-right corner.
*   **Props:** None.

---

## 2. Design System Primitives (Shared UI)
*Location: `/components/ui/`*

Polished, theme-aligned layout and typography primitives.

### [Button](file:///Users/rahulnair/Desktop/TVV%20FE:A-DB/components/ui/Button.tsx)
*   **Variants:** `primary` (teal-filled), `ghost` (transparent text-teal), `outline` (thin gray border), `outline-light` (white-bordered for dark backgrounds), `gold` (champagne-filled), `link` (underline text).
*   **Sizes:** `sm` (height 40px, font 11px), `md` (height 48px, font 12px), `lg` (height 56px, font 13px).
*   **Style details:** Full pill radius (`rounded-full`), capitalized letter-spacing tracking (`0.1em`).

### [Container](file:///Users/rahulnair/Desktop/TVV%20FE:A-DB/components/ui/Container.tsx)
*   **Sizes:** `narrow` (max-w-3xl), `default` (max-w-6xl), `wide` (max-w-1400px).
*   **Padding:** Default responsive horizontal margins (`px-6 lg:px-8`).

### [Section](file:///Users/rahulnair/Desktop/TVV%20FE:A-DB/components/ui/Section.tsx)
*   **Tones:** `cream` (warm luxury white), `white`, `surface` (cool gray), `navy` (dark deep obsidian), `gold-light` (soft beige).
*   **Padding sizes:** `tight` (py-10), `default` (py-16 to py-24), `loose` (py-20 to py-section).

### [Breadcrumb](file:///Users/rahulnair/Desktop/TVV%20FE:A-DB/components/ui/Breadcrumb.tsx)
*   **Purpose:** Path navigation showing nested paths.
*   **Props:** `items: Array<{ label: string; href?: string }>`, `invert?: boolean` (white text for dark headers).

### [JsonLd](file:///Users/rahulnair/Desktop/TVV%20FE:A-DB/components/ui/JsonLd.tsx)
*   **Purpose:** Serializes a schema object into `<script type="application/ld+json">`.
*   **Props:** `data: object | object[]`.

---

## 3. Specialized Cards
*Location: `/components/cards/`*

These visual wrappers process models and display listings.

| Component Name | Source Model | Style Details | Hover Effect |
| :--- | :--- | :--- | :--- |
| **PackageCard** | `Package` | 4:3 Aspect Image, Teal labels, pricing strip | Translate-Y up, shadow glow |
| **DestinationCard**| `Destination` | Background image, custom labels (Region/Level) | Zoom image, overlay gradient |
| **ExperienceCard** | `Experience` | Portrait card, caption and subtitle overlay | Fade-up detail box |
| **GuideCard** | `Guide` | Editorial layout, reading time, author, date | Border-color transition |
| **ReelCard** | `Reel` | Mobile aspect 9:16, video player trigger overlay| Pulse play icon |

---

## 4. Skeletal States
*Location: `/components/skeletons/`*

Used during dynamic data loading transitions to reduce CLS (Cumulative Layout Shift).

*   **PackageCardSkeleton:** Imitates image proportions, title bars, and pricing tags.
*   **DestinationCardSkeleton:** Mimics background-image grids.
*   **SectionSkeleton:** Simulates section header blocks and a 3-column card grid.
