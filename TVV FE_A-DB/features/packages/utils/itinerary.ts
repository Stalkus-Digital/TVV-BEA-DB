import type { ItineraryDay } from "@/lib/models";

export function generateItinerary(
  destinations: { days: number; city: string }[],
  highlights: string[] = [],
): ItineraryDay[] {
  const days: ItineraryDay[] = [];
  let dayNum = 1;

  for (const seg of destinations) {
    for (let i = 0; i < seg.days; i++) {
      const isArrival = i === 0;
      const isDeparture = i === seg.days - 1 && seg === destinations[destinations.length - 1];
      const highlight = highlights[(dayNum - 1) % Math.max(highlights.length, 1)] ?? "";

      days.push({
        day: dayNum,
        title: isArrival
          ? `Arrival in ${seg.city}`
          : isDeparture
            ? `Departure from ${seg.city}`
            : highlight || `${seg.city} — a slow morning, a curated afternoon`,
        city: seg.city,
        description: isArrival
          ? `Your specialist meets you at the airport and transfers you privately to your stay in ${seg.city}. The afternoon is yours — your concierge is on call, and the team has briefed your evening's reservation.`
          : isDeparture
            ? `A leisurely morning before your private transfer to the airport. Your specialist is reachable on the road.`
            : `A handpicked day in ${seg.city} — ${highlight ? highlight.toLowerCase() : "a private experience your specialist has woven into your route"}.`,
        stay: `Handpicked boutique stay, ${seg.city}`,
        meals: isArrival ? "Welcome dinner" : "Breakfast included",
      });
      dayNum++;
    }
  }

  return days;
}

export const DEFAULT_INCLUSIONS = [
  "Hand-selected stays, vetted by our team",
  "Daily breakfast & curated dinners",
  "Private airport transfers",
  "Specialist concierge on call 24/7",
  "All ground transport on the itinerary",
];

export const DEFAULT_EXCLUSIONS = [
  "International / domestic flights (quoted on request)",
  "Travel insurance & visas",
  "Personal expenses, tips",
  "Experiences not listed in inclusions",
];

export function resolveItinerary(
  itinerary: ItineraryDay[] | undefined,
  destinations: { days: number; city: string }[],
  highlights?: string[],
): ItineraryDay[] {
  if (itinerary && itinerary.length > 0) return itinerary;
  return generateItinerary(destinations, highlights);
}
