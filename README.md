# Hotel Offer Orchestrator

Node.js, TypeScript, Express, Temporal, Redis, and Docker Compose implementation for the backend assignment.

## What It Does

- Calls two mocked supplier APIs in parallel through a Temporal workflow.
- Deduplicates hotels by name.
- Picks the cheaper offer when both suppliers return the same hotel.
- Saves the deduplicated city result in Redis.
- Uses Redis sorted-set range queries for `minPrice` / `maxPrice` filtering.
- Exposes a bonus `/health` endpoint for supplier and Redis status.

## API

```bash
GET /api/hotels?city=delhi
GET /api/hotels?city=delhi&minPrice=5000&maxPrice=6500
GET /supplierA/hotels?city=delhi
GET /supplierB/hotels?city=delhi
GET /health
```

Example response:

```json
[
  {
    "name": "Holtin",
    "price": 5340,
    "supplier": "Supplier B",
    "commissionPct": 20
  }
]
```

## Run With Docker Compose

```bash
docker compose up --build
```

Services:

- API: `http://localhost:3000`
- Temporal UI: `http://localhost:8080`
- Redis: `localhost:6379`

Test:

```bash
curl "http://localhost:3000/api/hotels?city=delhi"
curl "http://localhost:3000/api/hotels?city=delhi&minPrice=5000&maxPrice=6500"
curl "http://localhost:3000/health"
```

## Local Development

Install dependencies:

```bash
npm install
```

Start Redis and Temporal with Docker Compose:

```bash
docker compose up redis temporal-postgres temporal temporal-ui
```

In one terminal, start the API:

```bash
npm run dev
```

In another terminal, start the Temporal worker:

```bash
npm run worker
```

Run checks:

```bash
npm run typecheck
npm test
```

## Environment Variables

| Variable | Default |
| --- | --- |
| `PORT` | `3000` |
| `SERVICE_BASE_URL` | `http://localhost:3000` |
| `REDIS_URL` | `redis://localhost:6379` |
| `TEMPORAL_ADDRESS` | `localhost:7233` |
| `TEMPORAL_NAMESPACE` | `default` |
| `TEMPORAL_TASK_QUEUE` | `hotel-offers` |

## Notes

- Supplier data is hardcoded in `src/hotelData.ts`.
- The Redis filtering path uses a sorted set keyed by city, e.g. `hotels:delhi:prices`.
- The API refreshes Redis after every `/api/hotels` request by executing the Temporal workflow first.
