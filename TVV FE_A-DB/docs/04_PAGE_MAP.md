# 04. Page Map & Routing Schema

This document details the route mapping, layout schemes, and page-level metadata structures for **The Vacation Voice V2**.

---

## 1. Page Map & Layout Allocation

| Route | View File | Layout | Access | Description |
| :--- | :--- | :--- | :--- | :--- |
| `/` | `app/page.tsx` | Root Layout | Public | Landing / Homepage with shelves |
| `/destinations` | `app/destinations/page.tsx` | Root Layout | Public | Directory of regions and countries |
| `/destinations/[...slugs]` | `app/destinations/[...slugs]/page.tsx` | Root Layout | Public | Catch-all dynamic geographic hierarchy |
| `/packages` | `app/packages/page.tsx` | Root Layout | Public | All-packages filter directory |
| `/packages/[slug]` | `app/packages/[slug]/page.tsx` | Root Layout | Public | Detailed package showcase |
| `/search` | `app/search/page.tsx` | Root Layout | Public | Universal search results |
| `/quotes` | `app/quotes/page.tsx` | Root Layout | Public | Custom itinerary quote builder |
| `/login` | `app/(auth)/login/page.tsx` | Auth Layout | Guest | Account login form |
| `/register` | `app/(auth)/register/page.tsx` | Auth Layout | Guest | User registration form |
| `/dashboard` | `app/dashboard/page.tsx` | Dashboard | User | Customer dashboard portal home |
| `/dashboard/bookings` | `app/dashboard/bookings/page.tsx` | Dashboard | User | Past and active booking summary |
| `/dashboard/quotes` | `app/dashboard/quotes/page.tsx` | Dashboard | User | Track custom itinerary requests |
| `/dashboard/profile` | `app/dashboard/profile/page.tsx` | Dashboard | User | Profile settings & account parameters |
| `/dashboard/wishlist` | `app/dashboard/wishlist/page.tsx` | Dashboard | User | Saved package boards |
| `/about` | `app/about/page.tsx` | Root Layout | Public | Corporate mission, concierge teams |
| `/contact` | `app/contact/page.tsx` | Root Layout | Public | Inquiry channels & agency map |
| `/blog` | `app/blog/page.tsx` | Root Layout | Public | Editorial guide directory |
| `/blog/[slug]` | `app/blog/[slug]/page.tsx` | Root Layout | Public | Full-length travel guides |
| `/faq` | `app/faq/page.tsx` | Root Layout | Public | FAQ grid |
| `/privacy` | `app/privacy/page.tsx` | Root Layout | Public | Legal policy text |
| `/terms` | `app/terms/page.tsx` | Root Layout | Public | Booking terms & conditions |

---

## 2. SEO Schema (JSON-LD) Implementations

Every route implements dynamic schema generation to enhance Google SERP presence.

### 1. Homepage (`/`)
*   **Schema Type:** `Organization` & `TravelAgency`.
*   **Includes:** Brand logo, social coordinates, official email, support hotline.

### 2. Destination Landing Page (`/destinations/[...slugs]`)
*   **Schema Type:** `TouristDestination` & `BreadcrumbList`.
*   **Includes:** Region name, editorial description, local imagery, dynamic breadcrumb node trails.

### 3. Package Detail Page (`/packages/[slug]`)
*   **Schema Type:** `TouristTrip` & `Product` & `FAQPage`.
*   **Includes:** Trip title, duration, starting price in INR, availability status, reviews aggregate, tour itinerary items, package FAQs.

### 4. Blog Post (`/blog/[slug]`)
*   **Schema Type:** `Article` & `BreadcrumbList`.
*   **Includes:** Headline, publishing timestamp, author name, publisher details, thumbnail images.

### 5. FAQ page (`/faq`)
*   **Schema Type:** `FAQPage`.
*   **Includes:** Nested Questions and accepted Answers array.

---

## 3. Dynamic Metadata Generation

All dynamic metadata is generated on the server using Next.js `generateMetadata` API, drawing configurations from the unified SEO builder (`lib/hierarchy/seo.ts`).

*   **Fallback Sequence:** Specific Entity Meta Fields (e.g. `metaTitle`) → Fallback Name Text ("India Vacation Packages | TVV") → Default Site Config settings.
*   **Canonical URL:** Built dynamically using the request URL to avoid duplication and keep redirects clean.
