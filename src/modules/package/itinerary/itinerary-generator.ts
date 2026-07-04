export interface GeneratedItineraryDay {
  dayNumber: number;
  title: string;
  description: string;
}

/**
 * Deterministic, templated scaffolding — explicitly NOT an AI call (Sprint
 * 6 excludes AI). Produces a starting skeleton ("Day 1: Arrival...", filler
 * days, "Day N: Departure...") an ops user then edits by hand. This is what
 * "Generate Itinerary" means this sprint; a real AI-backed version is
 * Sprint 10's job and would sit behind the same PackageItineraryService
 * method, swapped out later — nothing above this function needs to change
 * for that swap.
 */
export function generateSkeletonItinerary(destinationName: string, durationDays: number): GeneratedItineraryDay[] {
  const days: GeneratedItineraryDay[] = [];

  for (let dayNumber = 1; dayNumber <= durationDays; dayNumber += 1) {
    if (dayNumber === 1) {
      days.push({
        dayNumber,
        title: `Arrival in ${destinationName}`,
        description: `Arrive in ${destinationName} and check in. Rest of the day at leisure.`,
      });
    } else if (dayNumber === durationDays) {
      days.push({
        dayNumber,
        title: `Departure from ${destinationName}`,
        description: `Check out and depart from ${destinationName}.`,
      });
    } else {
      days.push({
        dayNumber,
        title: `Explore ${destinationName} — Day ${dayNumber - 1}`,
        description: `Sightseeing and activities in ${destinationName}.`,
      });
    }
  }

  return days;
}
