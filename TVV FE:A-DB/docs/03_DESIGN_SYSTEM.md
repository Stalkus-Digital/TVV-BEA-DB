# 03. Design System & Style Guide

This document captures the visual variables, style constraints, and design system variables of **The Vacation Voice V2**. These rules enforce a high-end luxury ("Luxe") editorial feel.

---

## 1. Color Palette

Our colors are designed to emulate premium dark-modes combined with airy, high-end warm white pages. 

| Token | Class / Value | HEX | Purpose |
| :--- | :--- | :--- | :--- |
| **Navy (Base)** | `bg-navy` | `#090E17` | Obsidian dark backgrounds, footer |
| **Navy (Soft)** | `bg-navy-soft`| `#131C2A` | Secondary dark panels, active states |
| **Teal (Primary)**| `bg-teal` | `#0E635C` | Accents, primary buttons, links |
| **Teal (Hover)** | `bg-teal-hover`| `#0B4F4A` | Hover triggers |
| **Teal (Light)** | `bg-teal-light`| `#EAF2F1` | Accent backdrops, chips |
| **Gold (Accent)** | `bg-gold` | `#C5A059` | Highlights, specialty indicators |
| **Gold (Light)**  | `bg-gold-light`| `#FDFBF7` | Subdued luxury section backdrops |
| **Cream (Page)**  | `bg-cream` | `#FBFBF9` | Default global page background |
| **Ink (Primary)**  | `text-ink` | `#111827` | Headings, core copy text |
| **Ink (Muted)**    | `text-ink-muted`| `#9CA3AF` | Captions, helpers, disabled labels |

---

## 2. Typography

We pair a classic, elegant display serif with a clean, high-legibility sans-serif font face.

*   **Display Serif (`font-display`):** Georgia, Times New Roman, serif. Used for page titles, headings, and editorial content.
*   **Sans-serif (`font-sans`):** System-ui, -apple-system, sans-serif. Used for body text, form elements, buttons, and navigation.
*   **Monospace (`font-mono`):** SF Mono, Menlo, monospace. Used for technical outputs or status counters.

### Typographic Scales (Tailwind Class Rules)
*   **display:** `clamp(2.5rem, 6vw, 4rem)` | Line-height `1.05`, Letter-spacing `-0.03em` (Elegant thin display titles).
*   **h1:** `2.5rem` | Line-height `1.1`, Letter-spacing `-0.02em` (Main headings).
*   **h2:** `1.75rem` | Line-height `1.2`, Letter-spacing `-0.015em` (Section headings).
*   **h3:** `1.25rem` | Line-height `1.3`, Letter-spacing `-0.01em` (Subsections).
*   **body-lg:** `1.0625rem` | Line-height `1.6` (Intro text, main copy).
*   **body:** `0.9375rem` | Line-height `1.6` (Default body text).
*   **label:** `0.6875rem` | Line-height `1.4`, Letter-spacing `0.1em`, Bold uppercase (Caps elements).
*   **price:** `1.5rem` | Line-height `1.1` (Price highlights).

---

## 3. Border Radii (Apple-Inspired Squircles)

To capture a premium hardware/software feel, we use large, soft squircles for card borders and page layouts.

*   **sm:** `8px` — Buttons, tags, inputs.
*   **md:** `12px` — Smaller widgets, dropdown selectors.
*   **lg:** `16px` — Standard package cards, galleries.
*   **xl:** `24px` — Hero modules, modal panels, search boards.
*   **2xl:** `32px` — Large sectional backdrops.
*   **pill:** `9999px` — Full rounded elements (Buttons, tag chips).

---

## 4. Shadows, Animations, and Visual Extras

### Box Shadows
*   `shadow-card`: `0 8px 30px rgba(0,0,0,0.04)` (Subtle float, visible on clean whites).
*   `shadow-hover`: `0 20px 40px rgba(0,0,0,0.06)` (Smooth lift hover response).
*   `shadow-modal`: `0 24px 64px rgba(0,0,0,0.1)` (Heavy dimensional overlay).

### Transitions & Animations
We use a custom cubic-bezier timing curve for all page transitions to mirror high-end iOS animations.
*   **Default Easing:** `cubic-bezier(0.22, 0.61, 0.36, 1)` (Premium decel).
*   **Default Duration:** `400ms` (Snappy yet visible).
*   **fade-up:** Standard animation for lists and section displays. Starts at `translateY(24px)` and opacity `0`, fading into place over `800ms`.

### Visual Texture
*   **Grain Overlay (`.grain`):** Adds a microscopic SVG noise backdrop (5% opacity, mix-blend-mode overlay) on premium dark sections (`tone="navy"`) to create depth.
*   **Editorial Rule (`.editorial-rule`):** A custom horizontal border that fades out gracefully at the left and right edges.
