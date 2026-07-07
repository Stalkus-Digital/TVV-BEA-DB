import type { Destination } from "@/lib/models";
import { u } from "./_image";

export const destinationsMock: Destination[] = [
  { slug: "andaman", name: "Andaman", tagline: "Twin emerald archipelago", region: "andaman", startsFrom: 24900, image: u("1559128010-7c1ad6e1b6a5", 1200), heroImage: u("1559128010-7c1ad6e1b6a5", 2400), description: "Our signature islands — and where TVV runs its own ground operations.", continent: "Asia", countryCode: "IN", isAuthorityHub: true, aliases: ["andamans", "andaman-islands"] },
  { slug: "kerala", name: "Kerala", tagline: "God's own backwaters", region: "domestic", startsFrom: 19500, image: u("1602216056096-3b40cc0c9944", 1200), continent: "Asia", countryCode: "IN" },
  { slug: "rajasthan", name: "Rajasthan", tagline: "Old-world palaces", region: "domestic", startsFrom: 22400, image: u("1599661046289-e31897846e41", 1200), continent: "Asia", countryCode: "IN" },
  { slug: "ladakh", name: "Ladakh", tagline: "High-altitude silence", region: "domestic", startsFrom: 32500, image: u("1626621341517-bbf3d9990a23", 1200), continent: "Asia", countryCode: "IN" },
  { slug: "himachal", name: "Himachal", tagline: "Pine valleys & monasteries", region: "domestic", startsFrom: 16900, image: u("1626621341517-bbf3d9990a23", 1200), continent: "Asia", countryCode: "IN" },
  { slug: "kashmir", name: "Kashmir", tagline: "Saffron meadows", region: "domestic", startsFrom: 28400, image: u("1605649487212-47bdab064df7", 1200), continent: "Asia", countryCode: "IN" },
  { slug: "goa", name: "Goa", tagline: "Coastline & Portuguese cafés", region: "domestic", startsFrom: 14900, image: u("1517457373958-b7bdd4587205", 1200), continent: "Asia", countryCode: "IN" },
  { slug: "sikkim", name: "Sikkim", tagline: "Quiet eastern Himalaya", region: "domestic", startsFrom: 22900, image: u("1626621341517-bbf3d9990a23", 1200), continent: "Asia", countryCode: "IN" },

  { slug: "japan", name: "Japan", tagline: "Refined seasons", region: "international", startsFrom: 248000, image: u("1493976040374-85c8e12f0c0e", 1200), continent: "Asia", countryCode: "JP" },
  { slug: "bali", name: "Bali", tagline: "Forests & cliff villas", region: "international", startsFrom: 124000, image: u("1537996194471-e657df975ab4", 1200), continent: "Asia", countryCode: "ID" },
  { slug: "maldives", name: "Maldives", tagline: "Atoll privacy", region: "international", startsFrom: 312000, image: u("1514282401047-d79a71a590e8", 1200), continent: "Indian Ocean", countryCode: "MV" },
  { slug: "dubai", name: "Dubai", tagline: "Skyline & desert", region: "international", startsFrom: 98000, image: u("1512453979798-5ea266f8880c", 1200), continent: "Middle East", countryCode: "AE" },
  { slug: "singapore", name: "Singapore", tagline: "Gardens & gastronomy", region: "international", startsFrom: 86000, image: u("1525625293386-3f8f99389edd", 1200), continent: "Asia", countryCode: "SG" },
  { slug: "thailand", name: "Thailand", tagline: "Island archipelagos", region: "international", startsFrom: 72400, image: u("1528181304800-259b08848526", 1200), continent: "Asia", countryCode: "TH" },
  { slug: "europe", name: "Europe", tagline: "Old continent, slow road", region: "international", startsFrom: 284000, image: u("1499856871958-5b9627545d1a", 1200), continent: "Europe" },
  { slug: "switzerland", name: "Switzerland", tagline: "Alpine grandeur", region: "international", startsFrom: 312000, image: u("1530841377377-3ff06c0ca713", 1200), continent: "Europe", countryCode: "CH" },
  { slug: "vietnam", name: "Vietnam", tagline: "Coast & cuisine", region: "international", startsFrom: 98000, image: u("1528127269322-539801943592", 1200), continent: "Asia", countryCode: "VN" },
];
