/**
 * Service barrel.
 *
 * Components should import services from this barrel and only call documented
 * service methods. Do not import from "@/lib/mock" or "@/lib/adapters" inside
 * components — those are private to the data layer.
 */

export { packagesService } from "./packages.service";
export { destinationsService } from "./destinations.service";
export { ferryService } from "./ferry.service";
export { flightsService } from "./flights.service";
export { calculatorService } from "./calculator.service";
export { searchService } from "./search.service";
export { guidesService } from "./guides.service";
export { experiencesService } from "./experiences.service";
export { reviewsService } from "./reviews.service";
export { faqsService } from "./faqs.service";

export type { SearchResults } from "./search.service";
