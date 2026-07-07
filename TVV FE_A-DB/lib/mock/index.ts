/**
 * Mock data barrel — dev/offline only (`NEXT_PUBLIC_USE_MOCK=true`).
 *
 * Services import from here when mock mode is on. App routes and components
 * must NOT import from this barrel — use services or `lib/ssg/static-paths`.
 */
export { manualPackages } from "./packages";
export { destinationsMock } from "./destinations";
export { ferryRoutesMock, ferrySchedulesMock, ferryPorts } from "./ferry";
export { airportsMock, flightItinerariesMock } from "./flights";
export { experiencesMock } from "./experiences";
export { guidesMock, reelsMock, andamanSpotlightMock } from "./guides";
export { reviewsMock, trustStatsMock } from "./reviews";
export { faqsMock } from "./faqs";
