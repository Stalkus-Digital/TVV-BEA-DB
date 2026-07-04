/** No auth DTO existed before Sprint 17 (the 9 original pairs cover Flight/Hotel Search/Details, Booking, Cancellation, Fare Rules, SSR, Seat Map only) — this is the tenth, added because Authentication/Token Management is this sprint's own explicit requirement. Provisional field shapes, same as every other DTO in this connector (no real TripJack API docs consulted — see docs/10's Remaining TODOs). */
export interface TripJackAuthLoginRequestDTO {
  agencyId: string;
  userId: string;
  password: string;
}
