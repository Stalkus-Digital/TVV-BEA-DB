import type { SeoMeta } from "./common";

export interface Experience {
  slug: string;
  title: string;
  description: string;
  icon: string;
  image: string;
  /** Optional region scoping when an experience is destination-specific. */
  scope?: "global" | "andaman" | "domestic" | "international";
  count?: number;
  seo?: SeoMeta;
}
