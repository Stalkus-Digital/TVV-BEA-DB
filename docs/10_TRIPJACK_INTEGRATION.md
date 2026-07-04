# 10 — TripJack Integration

**Status:** Sprint 4 — the full connector architecture is implemented under `src/modules/supplier/adapters/tripjack/`. No live API call exists anywhere in it; every request-shaped method throws `NotImplementedError` after preparing its request log. `docs/04_SUPPLIER_ENGINE.md` covers the Supplier Engine generically; this file is TripJack's own detail.

## Credential & Environment Handling

`TripJackConfig` (`config/tripjack.config.ts`) reads seven values through the shared `validateEnv` pattern — `TRIPJACK_API_URL`, `TRIPJACK_AGENCY_ID`, `TRIPJACK_USER_ID`, `TRIPJACK_PASSWORD`, `TRIPJACK_TOKEN`, `TRIPJACK_TIMEOUT_MS`, `TRIPJACK_RETRY_COUNT` — every default is empty/safe, nothing hardcoded. `isConfigured()` is true only once all four core credential fields are non-empty; today it's always `false`, which is exactly why `health()` reports `NOT_CONFIGURED`. This is the *only* file in the connector that reads `process.env`, directly or indirectly.

## Hotel Mapping

`TripJackHotelMapper.toInventoryHotel()` (`mappers/tripjack-hotel.mapper.ts`) converts a `TripJackHotelSearchResultDTO` into a plain object structurally matching Inventory's `HotelDetails` (`starRating`, `address`, plus a `title`) — **without importing anything from `src/modules/inventory`**. That's deliberate: the Supplier Engine's isolation rule (Sprint 3) is stricter than "don't leak raw DTOs" — it also means never importing Inventory's types, even for a mapper whose whole job is producing an Inventory-shaped object. The output is duck-typed compatible, not type-coupled.

## Flight Mapping

`TripJackFlightMapper.toInventoryFlight()` (`mappers/tripjack-flight.mapper.ts`) does the same for flights — `TripJackFlightSearchResultDTO` → `{originAirportCode, destinationAirportCode, title}`, matching Inventory's `FlightRouteDetails` shape (a Route, not a bookable flight — consistent with `docs/05_INVENTORY_ENGINE.md`'s Flight special case).

Neither mapper is wired into anything yet — they exist, compile, and are ready for whichever future sprint actually calls `InventoryService` through `inventory-supplier-bridge.ts` (still inert, per Sprint 3).

## Error Normalization

`TripJackErrorHandler.toAppError()` (`services/tripjack-error-handler.ts`) is real and working today (pure data transformation, not an API call) — maps a raw `{code, message, statusCode}`-shaped TripJack error into `ValidationError` (400) or `InternalError` (anything else), so a TripJack-specific error code never surfaces past this adapter once real calls exist.

## Everything else built this sprint (not originally sectioned here — added to match what exists)

- **`TripJackClient`** (`client/tripjack.client.ts`) — the sole file that would ever hold a fetch/axios call. Nine methods (`searchFlights`, `getFlightDetails`, `searchHotels`, `getHotelDetails`, `book`, `cancel`, `getFareRules`, `getSsrOptions`, `getSeatMap`), each logging a prepared request (`prepareRequestLog` — API URL, agency ID, timeout, payload; **never** the password/token) and then throwing `NotImplementedError`.
- **`TripJackAuth`** (`services/tripjack-auth.service.ts`) — `getToken()`, same throw pattern; would exchange credentials for a session token.
- **`TripJackResponseParser`** (`services/tripjack-response-parser.ts`) — real and working; validates a raw response object has required keys before a mapper touches it.
- **`TripJackCapabilities`** (`types/tripjack-capabilities.ts`) — TripJack's own internal capability list (`FLIGHT_SEARCH`, `FLIGHT_DETAILS`, `HOTEL_SEARCH`, `HOTEL_DETAILS`, `BOOKING`, `CANCELLATION`, `FARE_RULES`, `SSR`, `SEAT_MAP`) — more granular than, and distinct from, the Supplier-Engine-level `capabilities(): SupplierCapability[]` (`FLIGHTS`, `HOTELS`) the registry actually uses for discovery. `TripJackAdapter.capabilities()` was **not** changed to derive from this list — kept as the already-tested Sprint 3 return value, to avoid any behavior change to the completed Supplier Engine.
- **DTOs** — 9 request + 9 response interfaces under `dto/request/` and `dto/response/`, covering Flight Search, Flight Details, Hotel Search, Hotel Details, Booking, Cancellation, Fare Rules, SSR, Seat Map. All provisional field shapes (no real TripJack API docs consulted) — expect these to change once real integration starts.
- **Mock placeholder responses** (`utils/tripjack-mock-response.ts`) — deterministic fixtures for exercising the mappers/parser before any live response exists.

## Remaining TODOs before live TripJack integration

1. Real TripJack API documentation to correct the 18 provisional DTO shapes.
2. Implement the actual fetch/axios calls inside `TripJackClient`'s nine methods — nothing above that layer should need to change.
3. Real credentials in environment (never in source) — `TripJackConfig.isConfigured()` will then flip true.
4. Decide whether `TripJackAdapter.search()`/`details()`/`book()`/`cancel()` should return real `Result` values built from `TripJackResponseParser` + the mappers, replacing the `NotImplementedError` throws — likely the very next TripJack-specific sprint.
5. Wire `inventory-supplier-bridge.ts` into a real `InventoryService.search()` method — currently inert on the Inventory side.
6. `TripJackAuth.getToken()` needs a real token cache/refresh strategy once it's live (not just a single call).
