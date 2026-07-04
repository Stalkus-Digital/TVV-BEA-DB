import type { FAQ } from "@/lib/models";

export const faqsMock: FAQ[] = [
  {
    q: "How is TVV different from a regular travel agency?",
    a: "Every journey is designed by a destination specialist, not assembled from a template. We consult before we quote, vet every property we recommend, and remain reachable through your trip — 24 hours a day.",
    category: "how-we-work",
  },
  {
    q: "Do you only operate in the Andamans?",
    a: "The Andamans is our home and signature destination — we run our own ground operations there. Beyond the islands, we curate journeys across India and to 65+ international destinations through carefully vetted partners.",
    category: "destinations",
    tags: ["andaman"],
  },
  {
    q: "Can I customise an itinerary?",
    a: "Yes — every published itinerary is a starting point. Tell your specialist how you travel and the route will be redrawn around you.",
    category: "how-we-work",
  },
  {
    q: "What's the booking process?",
    a: "Share your dates and travel style through the enquiry form. A specialist responds within four working hours with a tailored proposal. Once you approve, we hold inventory and confirm with a 25% deposit.",
    category: "booking",
  },
  {
    q: "Are flights included?",
    a: "Some published packages include economy flights ex-major Indian metros; international and premium-cabin upgrades are quoted on request.",
    category: "booking",
  },
  {
    q: "Do you offer corporate or MICE travel?",
    a: "Yes — TVV runs dedicated incentive, offsite, and conference programmes for teams of 12 to 600. Visit our corporate page or write to corporate@thevacationvoice.com.",
    category: "corporate",
  },
  {
    q: "How do I book Andaman ferries through TVV?",
    a: "Use the ferry page or write to your specialist. We hold inventory on Makruzz, Green Ocean and ITT — same-day confirmation in peak season, transfers included on every booking.",
    category: "andaman",
    tags: ["andaman", "ferry"],
  },
];
