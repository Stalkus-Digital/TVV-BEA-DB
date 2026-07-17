/**
 * Map CmsGuide rows → public frontend Guide DTO.
 */

export type CmsGuideContent = {
  body?: string;
  excerpt?: string;
  metaTitle?: string;
  metaDescription?: string;
  coverImage?: string;
  category?: string;
  author?: string;
  tags?: string[];
  readTime?: string;
};

type CmsGuideRow = {
  slug: string;
  title: string;
  content: unknown;
  publishedAt: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
};

function asContent(raw: unknown): CmsGuideContent {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
  return raw as CmsGuideContent;
}

function asImageUrl(value: unknown): string {
  return typeof value === "string" && value.trim() ? value.trim() : "";
}

function estimateReadTime(html: string): string {
  const words = html
    .replace(/<[^>]+>/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;
  const mins = Math.max(1, Math.ceil(words / 200));
  return `${mins} min`;
}

const PLACEHOLDER_IMAGE =
  "https://images.unsplash.com/photo-1488646953014-85cb44e25828?w=1200&q=80";

export function mapCmsGuideToPublic(guide: CmsGuideRow, options: { includeBody?: boolean } = {}) {
  const content = asContent(guide.content);
  const body = typeof content.body === "string" ? content.body : "";
  const includeBody = options.includeBody !== false;

  return {
    slug: guide.slug,
    title: guide.title,
    excerpt: content.excerpt || "",
    ...(includeBody ? { body } : {}),
    category: content.category || "Guides",
    tags: Array.isArray(content.tags) ? content.tags : [],
    readTime: content.readTime || estimateReadTime(body),
    publishedAt: (guide.publishedAt ?? guide.createdAt ?? new Date()).toISOString(),
    updatedAt: guide.updatedAt?.toISOString(),
    image: asImageUrl(content.coverImage) || PLACEHOLDER_IMAGE,
    author: content.author || "TVV Editorial",
    seo: {
      title: content.metaTitle || guide.title,
      description: content.metaDescription || content.excerpt || "",
    },
  };
}
