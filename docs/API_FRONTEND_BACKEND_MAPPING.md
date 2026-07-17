# API Frontend–Backend Mapping (backend mirror)

See frontend repo `docs/API_FRONTEND_BACKEND_MAPPING.md` for the full gap matrix.

## Endpoints added this sprint

- `GET /api/destinations/roots` — market parent destinations
- `GET /api/website/destinations/tree` — nested tree under roots
- `GET /api/website/packages?tripType=HONEYMOON|FAMILY|...`
- `GET /api/website/site-settings`
- `GET /api/website/reviews`
- `GET /api/website/reviews/trust-stats`
- `GET /api/website/faqs?category=`

## Schema

- `packages.tripType` — optional enum string
- Market roots — destinations with slugs `andaman`, `domestic`, `international`, `parentDestinationId: null`
