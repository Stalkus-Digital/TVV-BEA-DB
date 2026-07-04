/**
 * Named list of frontend-expected content types that have zero Travel OS
 * backend coverage today (see docs/26/29) — used purely to keep the
 * NOT_IMPLEMENTED message text consistent across every stub route rather
 * than each one inventing its own wording.
 */
export const UNIMPLEMENTED_ENGINE = {
  FERRY: "Ferry",
  FLIGHTS: "Flights",
  GUIDES: "Guides",
  EXPERIENCES: "Experiences",
  REVIEWS: "Reviews",
  CALCULATOR: "Calculator",
} as const;

export type UnimplementedEngine = (typeof UNIMPLEMENTED_ENGINE)[keyof typeof UNIMPLEMENTED_ENGINE];
