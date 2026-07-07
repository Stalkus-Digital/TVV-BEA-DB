import type { AndamanTileItem, Guide, Reel } from "@/lib/models";
import { u } from "./_image";

export const guidesMock: Guide[] = [
  {
    slug: "andaman-best-time-to-visit",
    title: "Andaman, season by season — when to go, what to skip",
    excerpt:
      "A field-tested guide to the islands' six microseasons, from the still December mornings to the post-monsoon plankton bloom in October.",
    category: "Andaman",
    readTime: "8 min",
    publishedAt: "2026-03-18",
    image: u("1559128010-7c1ad6e1b6a5", 1200),
    author: "Anjali Menon",
    tags: ["andaman", "season", "planning"],
  },
  {
    slug: "kerala-slow-living-itinerary",
    title: "Kerala, but slowly — a 9-day itinerary built for quiet",
    excerpt: "Three stays, two cooks, one houseboat. A route designed for travellers who want to stop seeing and start noticing.",
    category: "Kerala",
    readTime: "12 min",
    publishedAt: "2026-02-04",
    image: u("1602216056096-3b40cc0c9944", 1200),
    author: "Rohan Iyer",
    tags: ["kerala", "slow-travel", "itinerary"],
  },
  {
    slug: "honeymoon-andaman-vs-maldives",
    title: "Andaman or Maldives — an honest comparison for honeymooners",
    excerpt: "Two archipelagos, two budgets, two very different ideas of paradise. The trade-offs no brochure will print.",
    category: "Honeymoon",
    readTime: "10 min",
    publishedAt: "2026-01-22",
    image: u("1540202404-1b927e27fa8b", 1200),
    author: "Editorial Desk",
    tags: ["honeymoon", "compare"],
  },
  {
    slug: "japan-first-timers-quiet-route",
    title: "First-time Japan — the quiet route through Kyoto and Hakone",
    excerpt: "Skip the queues at Fushimi Inari. A specialist's route, with the ryokans worth the splurge.",
    category: "Japan",
    readTime: "14 min",
    publishedAt: "2026-04-09",
    image: u("1493976040374-85c8e12f0c0e", 1200),
    author: "Maya Tanaka",
    tags: ["japan"],
  },
  {
    slug: "scuba-in-andaman-for-beginners",
    title: "Your first dive — what to expect at Elephant Beach",
    excerpt: "The mechanics, the marine life, the moments of stillness underwater. Written with our PADI partners.",
    category: "Andaman",
    readTime: "6 min",
    publishedAt: "2026-03-02",
    image: u("1583212292454-1fe6229603b7", 1200),
    author: "Marcus Fernandes",
    tags: ["andaman", "scuba"],
  },
  {
    slug: "luxury-without-flash-rajasthan",
    title: "Luxury without flash — Rajasthan's quiet palaces",
    excerpt: "Three Rajasthan stays where service is felt, not performed.",
    category: "Rajasthan",
    readTime: "9 min",
    publishedAt: "2026-02-19",
    image: u("1599661046289-e31897846e41", 1200),
    author: "Editorial Desk",
    tags: ["rajasthan", "luxury"],
  },
];

export const reelsMock: Reel[] = [
  { slug: "havelock-sunrise", title: "Havelock at first light", poster: u("1559128010-7c1ad6e1b6a5", 600), durationLabel: "0:42", destination: "Andaman" },
  { slug: "neil-snorkel", title: "Neil's coral shelf", poster: u("1583212292454-1fe6229603b7", 600), durationLabel: "1:08", destination: "Andaman" },
  { slug: "kyoto-tea", title: "A Kyoto tea ceremony", poster: u("1493976040374-85c8e12f0c0e", 600), durationLabel: "0:56", destination: "Japan" },
  { slug: "santorini-blue", title: "Oia at golden hour", poster: u("1613395877344-13d4a8e0d49e", 600), durationLabel: "0:38", destination: "Greece" },
  { slug: "kerala-houseboat", title: "Kettuvallam mornings", poster: u("1602216056096-3b40cc0c9944", 600), durationLabel: "1:12", destination: "Kerala" },
  { slug: "ubud-rice", title: "Ubud's terraces", poster: u("1537996194471-e657df975ab4", 600), durationLabel: "0:48", destination: "Bali" },
];

export const andamanSpotlightMock: AndamanTileItem[] = [
  { slug: "ferry", title: "Ferry Booking", description: "Makruzz, Green Ocean & ITT — confirmed seats, premium cabins, transfer-included.", image: u("1559128010-7c1ad6e1b6a5", 900), href: "/ferry", meta: "Same-day confirmation" },
  { slug: "honeymoon-escapes", title: "Honeymoon Escapes", description: "Private island dinners, candlelit catamaran sails, secluded villa stays.", image: u("1540202404-1b927e27fa8b", 900), href: "/honeymoon", meta: "From ₹58,900 / couple" },
  { slug: "scuba-experiences", title: "Scuba & Diving", description: "Beginner-to-advanced dives at Elephant Beach, Bharatpur & North Bay.", image: u("1583212292454-1fe6229603b7", 900), href: "/experiences/scuba-diving", meta: "PADI-certified" },
  { slug: "luxury-stays", title: "Luxury Stays", description: "Taj Exotica, Barefoot at Havelock, SeaShell — vetted by our team.", image: u("1571896349842-33c89424de2d", 900), href: "/luxury?destination=andaman", meta: "Handpicked properties" },
  { slug: "island-hopping", title: "Island Hopping", description: "Port Blair · Havelock · Neil · Ross · Baratang — sequenced for slow travel.", image: u("1506929562872-bb421503ef21", 900), href: "/destinations/andaman#islands", meta: "6 islands" },
  { slug: "itineraries", title: "Itineraries", description: "5N6D classic, 7N8D honeymoon, 9N10D family — fully customisable.", image: u("1559128010-7c1ad6e1b6a5", 900), href: "/packages/domestic/andaman", meta: "12 itineraries" },
];
