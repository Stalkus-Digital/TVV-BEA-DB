import type { Experience } from "@/lib/models";
import { u } from "./_image";

export const experiencesMock: Experience[] = [
  { slug: "honeymoon", title: "Honeymoon", description: "Quiet, considered first journeys.", icon: "heart", image: u("1540202404-1b927e27fa8b", 900), count: 42, scope: "global" },
  { slug: "luxury", title: "Luxury Escapes", description: "Private villas, butlered estates.", icon: "gem", image: u("1514282401047-d79a71a590e8", 900), count: 28, scope: "global" },
  { slug: "adventure", title: "Adventure", description: "High passes, dive sites, treks.", icon: "compass", image: u("1626621341517-bbf3d9990a23", 900), count: 36, scope: "global" },
  { slug: "wellness", title: "Wellness", description: "Slow retreats and ayurvedic stays.", icon: "leaf", image: u("1540202404-1b927e27fa8b", 900), count: 22, scope: "global" },
  { slug: "family", title: "Family", description: "Multi-generational travel, well-paced.", icon: "users", image: u("1602216056096-3b40cc0c9944", 900), count: 48, scope: "global" },
  { slug: "scuba-diving", title: "Scuba & Diving", description: "PADI-led dives across the Andaman shelf.", icon: "waves", image: u("1583212292454-1fe6229603b7", 900), count: 18, scope: "andaman" },
  { slug: "culinary", title: "Culinary", description: "Private chef's tables, market mornings.", icon: "utensils", image: u("1528127269322-539801943592", 900), count: 24, scope: "global" },
  { slug: "cultural", title: "Cultural", description: "Heritage walks with local historians.", icon: "landmark", image: u("1599661046289-e31897846e41", 900), count: 30, scope: "global" },
];
