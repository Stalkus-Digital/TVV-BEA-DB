// Types shared across all Guides builder components

export type SectionType =
  | "hero"
  | "intro"
  | "richtext"
  | "image"
  | "quote"
  | "tips"
  | "faq"
  | "cta"
  | "toc";

export interface ArticleSection {
  id: string;
  type: SectionType;
  heading?: string;
  body?: string;
  imageUrl?: string;
  imageAlt?: string;
  imageCaption?: string;
  quote?: string;
  quoteAuthor?: string;
  tips?: string[];
  faqs?: { q: string; a: string }[];
  ctaText?: string;
  ctaUrl?: string;
  ctaSubtext?: string;
}

export interface SeoData {
  metaTitle: string;
  metaDescription: string;
  slug: string;
  focusKeyword: string;
  secondaryKeywords: string[];
  canonicalUrl: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  noIndex: boolean;
  articleSchema: boolean;
}

export interface Article {
  id: string;
  title: string;
  author: string;
  category: string;
  coverImage: string;
  excerpt: string;
  status: "draft" | "published";
  publishDate: string;
  readTime: number;
  sections: ArticleSection[];
  seo: SeoData;
}

export type EditorPanel = "content" | "seo";

export const CATEGORIES = [
  "Andamans", "Maldives", "Bali", "Dubai", "Kerala",
  "Leh-Ladakh", "Ferry Guide", "Packing Tips", "Travel Hacks", "Hotel Reviews",
];

export const SECTION_TYPE_META: { type: SectionType; label: string; desc: string }[] = [
  { type: "hero",     label: "Hero Banner",        desc: "Full-width cover with title" },
  { type: "intro",    label: "Intro Para",          desc: "Opening paragraph" },
  { type: "richtext", label: "Rich Section",        desc: "Heading + body copy" },
  { type: "image",    label: "Image Block",         desc: "Image with caption" },
  { type: "quote",    label: "Pull Quote",          desc: "Highlighted quote" },
  { type: "tips",     label: "Tips List",           desc: "Bullet tip list" },
  { type: "faq",      label: "FAQ Block",           desc: "Q&A accordion" },
  { type: "cta",      label: "CTA Banner",          desc: "Call-to-action strip" },
  { type: "toc",      label: "Table of Contents",   desc: "Auto-generated TOC" },
];

export function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function newSection(type: SectionType): ArticleSection {
  const id = `s-${Date.now()}`;
  switch (type) {
    case "hero":     return { id, type, heading: "Section Title", body: "Enter description here.", imageUrl: "" };
    case "intro":    return { id, type, body: "Start your article with an engaging introduction..." };
    case "richtext": return { id, type, heading: "New Section Heading", body: "Write your content here..." };
    case "image":    return { id, type, imageUrl: "", imageAlt: "", imageCaption: "" };
    case "quote":    return { id, type, quote: "Enter your pull quote here.", quoteAuthor: "Author Name" };
    case "tips":     return { id, type, heading: "Pro Tips", tips: ["Tip one", "Tip two"] };
    case "faq":      return { id, type, faqs: [{ q: "Question?", a: "Answer." }] };
    case "cta":      return { id, type, heading: "Ready to Book?", body: "Let us plan your perfect trip.", ctaText: "Get a Free Quote", ctaUrl: "#", ctaSubtext: "No commitment required." };
    case "toc":      return { id, type };
    default:         return { id, type: "richtext", heading: "New Section", body: "" };
  }
}

export function newArticle(): Article {
  return {
    id: `G-${Date.now()}`,
    title: "New Article",
    author: "",
    category: "Andamans",
    coverImage: "",
    excerpt: "",
    status: "draft",
    publishDate: new Date().toISOString().split("T")[0],
    readTime: 5,
    sections: [
      { id: "s1", type: "hero", heading: "Article Title", body: "Enter subtitle here.", imageUrl: "" },
      { id: "s2", type: "intro", body: "Start your article with an engaging introduction..." },
    ],
    seo: {
      metaTitle: "",
      metaDescription: "",
      slug: "",
      focusKeyword: "",
      secondaryKeywords: [],
      canonicalUrl: "",
      ogTitle: "",
      ogDescription: "",
      ogImage: "",
      noIndex: false,
      articleSchema: true,
    },
  };
}

export function seoScore(a: Article): { score: number; checks: { pass: boolean; label: string }[] } {
  const seo = a.seo;
  const wordCount = a.sections.reduce((acc, s) => acc + (s.body?.split(" ").length ?? 0), 0);
  const checks = [
    { pass: seo.slug.length > 0,                                                              label: "URL slug is set" },
    { pass: seo.metaTitle.length >= 40 && seo.metaTitle.length <= 60,                        label: "Meta title 40–60 chars" },
    { pass: seo.metaDescription.length >= 120 && seo.metaDescription.length <= 160,          label: "Meta description 120–160 chars" },
    { pass: seo.focusKeyword.length > 0,                                                      label: "Focus keyword set" },
    { pass: seo.focusKeyword.length > 0 && seo.metaTitle.toLowerCase().includes(seo.focusKeyword.toLowerCase()),       label: "Keyword in meta title" },
    { pass: seo.focusKeyword.length > 0 && seo.metaDescription.toLowerCase().includes(seo.focusKeyword.toLowerCase()), label: "Keyword in meta description" },
    { pass: seo.focusKeyword.length > 0 && a.title.toLowerCase().includes(seo.focusKeyword.toLowerCase()),             label: "Keyword in article title" },
    { pass: seo.secondaryKeywords.length >= 2,                                                label: "2+ secondary keywords" },
    { pass: seo.ogImage.length > 0,                                                           label: "OG image is set" },
    { pass: wordCount >= 800,                                                                  label: `Word count ≥ 800 (${wordCount})` },
    { pass: seo.articleSchema,                                                                 label: "Article schema enabled" },
    { pass: a.sections.some(s => s.type === "faq"),                                           label: "FAQ block for rich results" },
  ];
  const score = Math.round((checks.filter(c => c.pass).length / checks.length) * 100);
  return { score, checks };
}

export const MOCK_ARTICLES: Article[] = [
  {
    id: "G-901",
    title: "Top 10 Things to Do in Havelock Island",
    author: "Sarah Jenkins",
    category: "Andamans",
    coverImage: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=80",
    excerpt: "From snorkelling at Elephant Beach to watching sunsets at Radhanagar, here's the definitive Havelock guide.",
    status: "published",
    publishDate: "2026-06-15",
    readTime: 8,
    sections: [
      { id: "s1", type: "hero", heading: "Top 10 Things to Do in Havelock Island", body: "From snorkelling at Elephant Beach to watching sunsets at Radhanagar, here's the definitive guide.", imageUrl: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=80" },
      { id: "s2", type: "intro", body: "Havelock Island — now officially Swaraj Dweep — is the crown jewel of the Andaman archipelago. Whether you're a beach lover, a diver, or someone who just wants to unplug, Havelock delivers." },
      { id: "s3", type: "richtext", heading: "1. Snorkelling at Elephant Beach", body: "Elephant Beach is one of the best snorkelling spots in the Andamans. The water is crystal clear and teeming with marine life." },
      { id: "s4", type: "faq", faqs: [{ q: "How do I get to Havelock Island?", a: "Take a government or private ferry from Port Blair. The journey takes 1.5–2.5 hours depending on the ferry type." }] },
    ],
    seo: {
      metaTitle: "Top 10 Things to Do in Havelock Island | The Vacation Voice",
      metaDescription: "Discover the best activities in Havelock Island — from snorkelling at Elephant Beach to sunsets at Radhanagar. Plan your trip with The Vacation Voice.",
      slug: "things-to-do-havelock-island",
      focusKeyword: "things to do in Havelock Island",
      secondaryKeywords: ["Havelock Island guide", "Havelock beaches", "Andaman travel tips", "Elephant Beach snorkelling"],
      canonicalUrl: "https://thevacationvoice.in/guides/things-to-do-havelock-island",
      ogTitle: "Top 10 Things to Do in Havelock Island",
      ogDescription: "Your complete guide to Havelock Island — beaches, diving, sunsets and more.",
      ogImage: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=1200&q=80",
      noIndex: false,
      articleSchema: true,
    },
  },
  {
    id: "G-902",
    title: "How to Plan the Perfect Maldives Honeymoon",
    author: "Rajesh Koothrapali",
    category: "Maldives",
    coverImage: "https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=1200&q=80",
    excerpt: "Over-water villas, private pools, and sunset dinners — here's how to plan a flawless Maldives honeymoon.",
    status: "published",
    publishDate: "2026-05-28",
    readTime: 10,
    sections: [
      { id: "s1", type: "hero", heading: "How to Plan the Perfect Maldives Honeymoon", body: "Over-water villas, private pools, and sunset dinners — here's your complete guide.", imageUrl: "https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=1200&q=80" },
      { id: "s2", type: "intro", body: "The Maldives is the world's ultimate honeymoon destination. But with hundreds of resorts spread across 26 atolls, planning can feel overwhelming." },
    ],
    seo: {
      metaTitle: "How to Plan the Perfect Maldives Honeymoon | The Vacation Voice",
      metaDescription: "Complete Maldives honeymoon planning guide — best resorts, islands, budgets, and insider tips from travel experts.",
      slug: "maldives-honeymoon-guide",
      focusKeyword: "Maldives honeymoon guide",
      secondaryKeywords: ["Maldives resorts", "over-water villa", "honeymoon packages Maldives"],
      canonicalUrl: "https://thevacationvoice.in/guides/maldives-honeymoon-guide",
      ogTitle: "The Perfect Maldives Honeymoon Guide",
      ogDescription: "Everything you need to know to plan a dreamy Maldives honeymoon.",
      ogImage: "https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=1200&q=80",
      noIndex: false,
      articleSchema: true,
    },
  },
  {
    id: "G-903",
    title: "Understanding Ferry Schedules in Port Blair",
    author: "Sarah Jenkins",
    category: "Ferry Guide",
    coverImage: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80",
    excerpt: "A complete guide to navigating the government and private ferry network in the Andamans.",
    status: "draft",
    publishDate: "2026-07-01",
    readTime: 5,
    sections: [
      { id: "s1", type: "hero", heading: "Understanding Ferry Schedules in Port Blair", body: "A complete guide to navigating the government and private ferry network in the Andamans.", imageUrl: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80" },
    ],
    seo: {
      metaTitle: "Ferry Schedules Port Blair Andamans | The Vacation Voice",
      metaDescription: "Everything you need to know about ferry timings, booking, and routes between Port Blair, Havelock, and Neil Island.",
      slug: "ferry-schedules-port-blair",
      focusKeyword: "ferry schedule Port Blair",
      secondaryKeywords: ["Andaman ferry guide", "Port Blair to Havelock ferry"],
      canonicalUrl: "https://thevacationvoice.in/guides/ferry-schedules-port-blair",
      ogTitle: "Ferry Schedules in Port Blair — Complete Guide",
      ogDescription: "Government and private ferry timings, booking tips, and routes in the Andamans.",
      ogImage: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80",
      noIndex: true,
      articleSchema: false,
    },
  },
];
