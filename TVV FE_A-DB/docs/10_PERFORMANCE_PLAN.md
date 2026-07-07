# 10. Performance & Optimization Plan

This document establishes the performance goals, load targets, and optimization guidelines for **The Vacation Voice V2**.

---

## 1. Performance Target Metrics (Core Web Vitals)

To deliver a premium experience, we target the following metrics:

| Metric | Target | Optimization Strategy |
| :--- | :--- | :--- |
| **LCP (Largest Contentful Paint)** | `< 2.0s` | High-priority image loading, critical CSS, server pre-rendering |
| **INP (Interaction to Next Paint)**| `< 150ms` | Debouncing user input, optimizing React render loops |
| **CLS (Cumulative Layout Shift)**  | `< 0.05` | Reserving slot sizes for skeletons, layout dimensions on images |
| **TTFB (Time to First Byte)**      | `< 400ms` | Data cache caching, parallelized RSC queries |

---

## 2. Next.js 15 Streaming & Suspense

We use React Suspense to isolate heavy backend lookups and streaming content:
*   **Page skeletons:** Use `loading.tsx` to output immediate layouts (headers, footers) while dynamic server content resolves in the background.
*   **Segmented Suspense:** Wrap components that fetch external resources (like live flights or TripJack pricing lists) in `<Suspense fallback={<SectionSkeleton />}>`. This prevents slow external APIs from blocking the primary page TTFB.

---

## 3. Dynamic Imports & Code Splitting

We dynamically load heavy scripts and widgets that are not required for first-paint rendering.

```typescript
// Example: Dynamic loading of non-critical UI elements
import dynamic from "next/dynamic";

const CalculatorWidget = dynamic(() => import("./CalculatorWidget"), {
  loading: () => <WidgetSkeleton />,
  ssr: false, // Prevent hydration lag on server for browser-only widgets
});
```

### Candidates for Dynamic Import:
*   Interactive Maps & Geographic Visualizers.
*   Custom Cost Calculators and Enquiries Form modals.
*   Customer dashboard booking document editors.
*   Heavy media carousels or video players.

---

## 4. Image & Font Optimization

### 1. next/image
*   **Format:** Automatically serves WebP or AVIF images based on client capabilities.
*   **Sizes:** Never omit the `sizes` attribute. Use responsive sizing tags: `sizes="(min-width: 1024px) 33vw, 100vw"` to prevent downloading desktop dimensions on mobile viewports.
*   **Hero Priority:** Hero visual images must carry `priority={true}` and `fetchPriority="high"` to optimize LCP.
*   **Placeholders:** All cards must use `placeholder="blur"` with a low-res base64 image or gradient fallback.

### 2. next/font
*   We load fonts locally via `next/font/google` to optimize asset delivery.
*   Use `display: swap` to prevent FOIT (Flash of Unstyled Text) during font downloads.
