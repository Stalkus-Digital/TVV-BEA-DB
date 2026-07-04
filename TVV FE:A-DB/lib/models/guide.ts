import type { SeoMeta } from "./common";

export interface Guide {
  slug: string;
  title: string;
  excerpt: string;
  body?: string;          // Markdown / rich text source
  category: string;
  tags?: string[];
  readTime: string;
  publishedAt: string;
  updatedAt?: string;
  image: string;
  author: string;
  authorAvatar?: string;
  seo?: SeoMeta;
}

/* ============================================================
   Storytelling / reels — co-located with editorial content
   ============================================================ */

export interface Reel {
  slug: string;
  title: string;
  poster: string;
  videoUrl?: string;
  durationLabel: string;
  destination: string;
}

/* ============================================================
   Andaman spotlight tiles — homepage / Andaman hub feature
   ============================================================ */

export interface AndamanTileItem {
  slug: string;
  title: string;
  description: string;
  image: string;
  href: string;
  meta?: string;
}
