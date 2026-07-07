export interface MegaColumn {
  title: string;
  links: { label: string; href: string; meta?: string }[];
}

export interface MegaPick {
  label: string;
  href: string;
  priceFrom: string;
  image: string;
}

export interface NavGroup {
  label: string;
  href: string;
  mega?: {
    columns: MegaColumn[];
    picks?: MegaPick[];
  };
}

const u = (id: string) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=600&q=80`;

export const navGroups: NavGroup[] = [
  {
    label: "Andaman",
    href: "/andaman",
    mega: {
      columns: [
        {
          title: "Plan your islands",
          links: [
            { label: "Andaman overview", href: "/andaman" },
            { label: "Andaman itineraries", href: "/packages/domestic/andaman" },
            { label: "Ferry booking", href: "/ferry" },
            { label: "Luxury Andaman stays", href: "/luxury?destination=andaman" },
          ],
        },
        {
          title: "By experience",
          links: [
            { label: "Honeymoon escapes", href: "/honeymoon?destination=andaman" },
            { label: "Scuba & diving", href: "/experiences/scuba-diving" },
            { label: "Island hopping", href: "/destinations/andaman#islands" },
            { label: "Family journeys", href: "/experiences/family?destination=andaman" },
          ],
        },
        {
          title: "By duration",
          links: [
            { label: "Long weekend (3–4 days)", href: "/packages/domestic/andaman?duration=short" },
            { label: "Classic (5–6 days)", href: "/packages/domestic/andaman?duration=classic" },
            { label: "Extended (7+ days)", href: "/packages/domestic/andaman?duration=extended" },
          ],
        },
      ],
      picks: [
        { label: "Andaman Azure Escape", href: "/packages/andaman-azure-escape", priceFrom: "₹58,900", image: u("1559128010-7c1ad6e1b6a5") },
        { label: "Honeymoon: A Quiet Beginning", href: "/packages/andaman-honeymoon-dream", priceFrom: "₹72,400", image: u("1540202404-1b927e27fa8b") },
        { label: "Scuba at Elephant Beach", href: "/experiences/scuba-diving", priceFrom: "₹3,200", image: u("1583212292454-1fe6229603b7") },
      ],
    },
  },
  {
    label: "Domestic",
    href: "/packages/domestic",
    mega: {
      columns: [
        {
          title: "Popular destinations",
          links: [
            { label: "Kerala", href: "/destinations/kerala" },
            { label: "Rajasthan", href: "/destinations/rajasthan" },
            { label: "Ladakh", href: "/destinations/ladakh" },
            { label: "Himachal", href: "/destinations/himachal" },
            { label: "Kashmir", href: "/destinations/kashmir" },
            { label: "Goa", href: "/destinations/goa" },
            { label: "Andaman", href: "/andaman" },
            { label: "Sikkim", href: "/destinations/sikkim" },
          ],
        },
        {
          title: "By trip type",
          links: [
            { label: "Honeymoon packages", href: "/honeymoon" },
            { label: "Family tours", href: "/experiences/family" },
            { label: "Adventure & trekking", href: "/experiences/adventure" },
            { label: "Group tours", href: "/packages/domestic?type=group" },
            { label: "Luxury escapes", href: "/luxury" },
          ],
        },
        {
          title: "By duration",
          links: [
            { label: "Weekend (2–3 days)", href: "/packages/domestic?duration=weekend" },
            { label: "Short break (4–5 days)", href: "/packages/domestic?duration=short" },
            { label: "Week-long (6–8 days)", href: "/packages/domestic?duration=week" },
            { label: "Extended (9+ days)", href: "/packages/domestic?duration=extended" },
          ],
        },
      ],
      picks: [
        { label: "Kerala Backwaters", href: "/packages/kerala-backwaters-slow-living", priceFrom: "₹49,700", image: u("1602216056096-3b40cc0c9944") },
        { label: "Royal Rajasthan", href: "/packages/royal-rajasthan", priceFrom: "₹64,900", image: u("1599661046289-e31897846e41") },
        { label: "Ladakh High Passes", href: "/packages/ladakh-high-passes", priceFrom: "₹72,400", image: u("1626621341517-bbf3d9990a23") },
      ],
    },
  },
  {
    label: "International",
    href: "/packages/international",
    mega: {
      columns: [
        {
          title: "Popular destinations",
          links: [
            { label: "Europe", href: "/destinations/europe" },
            { label: "Japan", href: "/destinations/japan" },
            { label: "Bali", href: "/destinations/bali" },
            { label: "Dubai", href: "/destinations/dubai" },
            { label: "Thailand", href: "/destinations/thailand" },
            { label: "Maldives", href: "/destinations/maldives" },
            { label: "Singapore", href: "/destinations/singapore" },
            { label: "Vietnam", href: "/destinations/vietnam" },
          ],
        },
        {
          title: "By trip type",
          links: [
            { label: "Honeymoon packages", href: "/honeymoon" },
            { label: "Family tours", href: "/experiences/family" },
            { label: "Luxury escapes", href: "/luxury" },
            { label: "Cruise journeys", href: "/experiences/cruise" },
            { label: "Editorial routes", href: "/experiences/cultural" },
          ],
        },
        {
          title: "By duration",
          links: [
            { label: "Short break (4–6 days)", href: "/packages/international?duration=short" },
            { label: "Classic (7–10 days)", href: "/packages/international?duration=classic" },
            { label: "Extended (11–14 days)", href: "/packages/international?duration=extended" },
            { label: "Grand tour (15+ days)", href: "/packages/international?duration=grand" },
          ],
        },
      ],
      picks: [
        { label: "Santorini & Amalfi", href: "/packages/santorini-amalfi-coast", priceFrom: "₹3,84,000", image: u("1613395877344-13d4a8e0d49e") },
        { label: "Quiet Japan", href: "/packages/kyoto-quiet-japan", priceFrom: "₹2,98,000", image: u("1493976040374-85c8e12f0c0e") },
        { label: "Maldives Sanctuary", href: "/packages/maldives-overwater-private", priceFrom: "₹5,28,000", image: u("1514282401047-d79a71a590e8") },
      ],
    },
  },
  { label: "Flights", href: "/flights" },
  { label: "Guides", href: "/guides" },
];
