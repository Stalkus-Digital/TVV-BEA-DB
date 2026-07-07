import type { Review } from "@/lib/models";

export const reviewsMock: Review[] = [
  {
    name: "Priya & Arjun Mehta",
    location: "Bengaluru",
    date: "March 2026",
    rating: 5,
    title: "A honeymoon they actually noticed",
    body: "Our specialist Anjali spent ninety minutes on the phone before she sent a single itinerary. By the time we landed in Port Blair, the smallest details — the music we like, my husband's allergy — had quietly been handled.",
    tour: "Andaman Honeymoon",
    verified: true,
  },
  {
    name: "The Iyer Family",
    location: "Chennai",
    date: "December 2025",
    rating: 5,
    title: "Three generations, one trip, zero stress",
    body: "We have travelled with three other agencies. None of them planned for my mother's pace the way TVV did. We will never use anyone else.",
    tour: "Kerala Backwaters",
    verified: true,
  },
  {
    name: "Sara K.",
    location: "Mumbai",
    date: "September 2025",
    rating: 5,
    title: "Japan, the way I'd hoped to see it",
    body: "Quiet ryokans, a private tea ceremony, and a Tokyo guide who walked us through Yanaka instead of Shibuya. Felt curated, not scheduled.",
    tour: "Quiet Japan",
    verified: true,
  },
];

export const trustStatsMock = [
  { value: "4.9★", label: "Average traveller rating" },
  { value: "12,400+", label: "Journeys curated" },
  { value: "65+", label: "Global destinations" },
  { value: "24/7", label: "Specialist concierge" },
];
