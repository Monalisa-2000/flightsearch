# Flight Search & Price Alert Platform

## Overview

Production-style backend project demonstrating a Skyscanner-like platform with distributed system design patterns, suitable for a senior SDE interview.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Build**: esbuild (CJS bundle)
- **Frontend**: React + Vite + TailwindCSS + shadcn/ui
- **Charts**: Recharts (for A/B experiment dashboard)
- **Animations**: Framer Motion

## System Architecture

### Services

1. **API Gateway** (`artifacts/api-server`) — Express 5, handles auth, routing, rate limiting
2. **Flight Search Service** (`src/routes/flights.ts`) — Aggregates airline APIs, ranks results
3. **Cache Layer** (`src/lib/cache.ts`) — In-memory Redis simulation, TTL 10 min, cache key: `{from}-{to}-{date}-{cabin}-{passengers}`
4. **Price Alert Service** (`src/routes/alerts.ts`) — CRUD for price alerts, stored in PostgreSQL
5. **Price Monitoring Worker** (`src/lib/worker.ts`) — Background job every 5 min, checks active alerts, triggers notifications
6. **Notification Service** (`src/routes/notifications.ts`) — Queue-based, stores notifications in PostgreSQL
7. **Recommendation Service** (`src/routes/recommendations.ts`) — Trending + personalized destinations
8. **A/B Experimentation System** (`src/routes/experiments.ts`) — Deterministic user group assignment, CTR/CVR metrics
9. **Authentication** (`src/routes/auth.ts`) — JWT-based, HMAC-SHA256

### Frontend Pages

- **Home** (`/`) — Hero search, trending destinations
- **Search Results** (`/search`) — Flight list with sort tabs (cheapest/fastest/best), cache hit indicator
- **Price Alerts** (`/alerts`) — Auth-required, manage price alerts
- **Recommendations** (`/recommendations`) — Personalized travel destination grid
- **A/B Tests Dashboard** (`/experiments`) — Bar charts comparing control vs treatment metrics
- **Notifications** (`/notifications`) — Auth-required, price drop notifications
- **System Status** (`/status`) — Worker status, cache metrics, DB health

## Structure

```text
artifacts-monorepo/
├── artifacts/
│   ├── api-server/              # Express API server
│   │   └── src/
│   │       ├── lib/
│   │       │   ├── cache.ts     # In-memory cache (Redis simulation)
│   │       │   ├── flightData.ts # Flight data generator + ranking
│   │       │   ├── jwt.ts       # JWT auth helpers
│   │       │   └── worker.ts    # Price monitoring background worker
│   │       ├── middlewares/
│   │       │   └── auth.ts      # JWT auth middleware
│   │       └── routes/
│   │           ├── auth.ts      # POST /api/auth/register, login, GET /me
│   │           ├── flights.ts   # GET /api/flights/search, /airports
│   │           ├── alerts.ts    # CRUD /api/alerts
│   │           ├── recommendations.ts  # GET /api/recommendations
│   │           ├── experiments.ts      # POST assign/track, GET results
│   │           ├── notifications.ts    # GET /api/notifications
│   │           └── worker.ts    # GET /api/worker/status, POST /trigger
│   └── flight-platform/         # React + Vite frontend
│       └── src/
│           ├── hooks/use-auth.tsx       # Auth context + JWT storage
│           ├── components/
│           │   ├── auth-modal.tsx       # Login/register modal
│           │   ├── flight-card.tsx      # Flight result card
│           │   ├── flight-search-form.tsx
│           │   └── layout.tsx           # Navigation + footer
│           └── pages/
│               ├── home.tsx, search.tsx, alerts.tsx
│               ├── recommendations.tsx, experiments.tsx
│               ├── notifications.tsx, status.tsx
├── lib/
│   ├── api-spec/openapi.yaml    # OpenAPI 3.1 spec (source of truth)
│   ├── api-client-react/        # Generated React Query hooks
│   ├── api-zod/                 # Generated Zod schemas
│   └── db/src/schema/           # Drizzle ORM schema
│       ├── users.ts, alerts.ts, notifications.ts, experiments.ts
└── scripts/
```

## Database Schema

- `users` — id, email, passwordHash, name, createdAt
- `price_alerts` — id, userId, fromAirport, toAirport, targetPrice, currency, currentPrice, status (active/triggered/expired/paused), triggeredAt, expiresAt, lastCheckedAt
- `notifications` — id, userId, type, title, message, read, metadata, createdAt
- `experiment_assignments` — id, userId, experimentId, group, assignedAt
- `experiment_events` — id, userId, experimentId, group, event, createdAt
- `worker_runs` — id, alertsChecked, alertsTriggered, runAt

## Architecture Patterns Demonstrated

- **Microservices**: Each route group is a distinct service boundary
- **Stateless services**: No session state, JWT-based auth
- **Horizontal scalability**: All services are stateless, can run N replicas
- **Caching strategy**: Cache-aside pattern, TTL-based invalidation, cache hit/miss tracking
- **Event-driven**: Worker publishes notifications as events (simulated message queue)
- **Background processing**: Price monitoring worker runs every 5 minutes
- **Failure handling**: Try/catch with logging, alerts process independently
- **A/B experimentation**: Deterministic user assignment, metric tracking
- **Ranking algorithm**: Weighted score (price 40%, duration 35%, stops 25%)

## API Endpoints

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | /api/healthz | No | Health check with service statuses |
| POST | /api/auth/register | No | Register new user |
| POST | /api/auth/login | No | Get JWT token |
| GET | /api/auth/me | JWT | Get current user |
| GET | /api/flights/search | No | Search flights with caching |
| GET | /api/flights/airports | No | Airport autocomplete |
| GET/POST | /api/alerts | JWT | List/create price alerts |
| GET/DELETE | /api/alerts/:id | JWT | Get/delete single alert |
| GET | /api/recommendations | No | Personalized recommendations |
| GET | /api/recommendations/trending | No | Trending destinations |
| POST | /api/experiments/assign | No | Assign A/B experiment group |
| POST | /api/experiments/track | No | Track experiment event |
| GET | /api/experiments/results | No | Get experiment metrics |
| GET | /api/notifications | JWT | User notifications |
| GET | /api/worker/status | No | Worker status |
| POST | /api/worker/trigger | No | Manual worker trigger |

## TypeScript & Composite Projects

Every package extends `tsconfig.base.json` which sets `composite: true`. The root `tsconfig.json` lists all packages as project references.

## Root Scripts

- `pnpm run build` — runs `typecheck` first, then recursively runs `build` in all packages
- `pnpm run typecheck` — runs `tsc --build --emitDeclarationOnly` using project references

## Packages

### `artifacts/api-server` (`@workspace/api-server`)

Express 5 API server with all backend services.

- `pnpm --filter @workspace/api-server run dev` — run dev server
- `pnpm --filter @workspace/api-server run build` — production bundle

### `artifacts/flight-platform` (`@workspace/flight-platform`)

React + Vite frontend.

- `pnpm --filter @workspace/flight-platform run dev` — dev server

### `lib/db` (`@workspace/db`)

- `pnpm --filter @workspace/db run push` — push schema changes

### `lib/api-spec` (`@workspace/api-spec`)

- `pnpm --filter @workspace/api-spec run codegen` — regenerate client hooks + Zod schemas
