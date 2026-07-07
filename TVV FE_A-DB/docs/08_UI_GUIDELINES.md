# 08. UI Guidelines & Design Standards

This document establishes the UI patterns, WCAG AA compliance specifications, and motion design guidelines for **The Vacation Voice V2**.

---

## 1. Accessibility (WCAG AA Compliance)

Accessibility is a primary goal. We target WCAG 2.1 Level AA compliance across all components.

### Keyboard Navigation & Focus
*   **Focus Ring Indicator:** We use a restrained focus ring styled with `focus-visible:outline-teal focus-visible:ring-2 focus-visible:ring-offset-2`. Browser default outlines are disabled only when focus-visible is fully customized.
*   **Skip-to-Content:** A persistent skip link is placed as the first element in `layout.tsx` to allow keyboard users to bypass navigation headers.
*   **Aria Roles & Labels:** Use semantic HTML tags (`<nav>`, `<main>`, `<article>`, `<header>`, `<footer>`). Add `aria-expanded` states to drop downs (e.g. MegaMenu) and accordion headers.
*   **Contrast Standards:** Ensure contrast ratios:
    *   Minimum `4.5:1` for body copy and icons.
    *   Minimum `3.0:1` for bold headings.
    *   Teal (`#0E635C`) text over light cream/white provides compliant contrast; do not use light golds or grays for core labels.

---

## 2. Motion Design & Animation Principles

Animations should feel smooth and natural. We use a custom ease-out cubic-bezier curves for transitions.

### Timing & Easing Curves
*   **Transition Curve:** `cubic-bezier(0.22, 0.61, 0.36, 1)` (Premium decel feel).
*   **Duration Scale:**
    *   Hover events / Tooltips: `200ms` (Fast).
    *   Page components entry / Slide ins: `400ms` (Snappy).
    *   Full-page layout transitions: `600ms` to `800ms` (Graceful).

### Framer Motion Standards
*   Avoid triggering layout animations that cause page jitter.
*   Always implement `layoutId` transitions with caution to prevent content jumps.
*   Stagger grid element arrivals: use the `<FadeUp stagger={true}>` component to delay child animations in sequence.

---

## 3. Mobile-First & Responsive Layouts

We design mobile-first to guarantee layout stability on smaller devices.

*   **Responsive Grids:** Design package/destination cards as 1-column layouts on mobile, expanding to 2-columns on tablets (`sm:`), and 3 to 4 columns on large monitors (`lg:`, `xl:`).
*   **Scroll-Snap Rails:** For galleries or package shelves on mobile, use horizontal scroll rails (`.scroll-rail .scroll-snap-x`) instead of force-wrapping cards.
*   **Tap Targets:** Any button, list item, or link must meet the minimum target size of `44x44px` on mobile screens to ensure ease of interaction.
