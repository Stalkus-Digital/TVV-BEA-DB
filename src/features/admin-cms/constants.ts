import type { StorageCategory } from "./types";

export const CMS_SECTIONS = [
  { href: "/cms", label: "Content Dashboard", description: "Overview of website content sources" },
  { href: "/cms/home", label: "Home Sections", description: "Hero, featured packages & destinations" },
  { href: "/cms/landing-pages", label: "Landing Pages", description: "Dynamic marketing landing pages" },
  { href: "/cms/seo", label: "SEO Pages", description: "Destination & package SEO metadata" },
  { href: "/cms/faqs", label: "FAQ Management", description: "Destination & package FAQs" },
  { href: "/cms/media", label: "Media Browser", description: "Website media files" },
  { href: "/cms/navigation", label: "Navigation Menus", description: "Website top navigation" },
  { href: "/cms/footer", label: "Footer Content", description: "Footer columns and links" },
  { href: "/cms/redirects", label: "Redirect Management", description: "URL redirects" },
  { href: "/cms/pages", label: "Pages", description: "Custom pages with rich text editor" },
  { href: "/cms/guides", label: "Guides (Blogs)", description: "Blog and guide articles" },
] as const;

export const UPLOAD_CATEGORIES: { value: StorageCategory; label: string; description: string }[] = [
  { value: "DESTINATION_IMAGE", label: "Destination image", description: "Public destination imagery" },
  { value: "PACKAGE_IMAGE", label: "Package image", description: "Public package imagery" },
  { value: "GALLERY_IMAGE", label: "Gallery image", description: "Public gallery imagery" },
  { value: "PROFILE_IMAGE", label: "Profile image", description: "Public profile avatars" },
];

export const BACKEND_GAPS = {
  cmsModule: "No CMS Engine module exists — hero banners, navigation, footer, redirects, and static pages are hardcoded in the Website BFF.",
  heroBannerWrite: "Hero banner is static in HomepageService — no admin write API.",
  featuredPackagesCurate: "Featured packages are the first N published packages — no curation API.",
  quickLinksWrite: "Homepage quick links are static — no admin write API.",
  navigationWrite: "Navigation menu is static in NavigationService — no admin write API.",
  footerWrite: "Footer columns are static in NavigationService — no admin write API.",
  redirects: "No redirect management API or model exists.",
  staticPages: "No static pages CMS API exists.",
  guides: "GET/POST /api/v1/guides returns NotImplemented — no Guides Engine.",
  storageList: "No GET /api/storage/list — uploads can be created and deleted by key, but not browsed server-side.",
  galleryUpload: "Destination gallery accepts URL strings only — use Storage upload then paste the returned URL.",
} as const;
