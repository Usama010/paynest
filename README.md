# PayNest — Real-Time Bidding System

A real-time auction platform where users bid on items and the highest bid updates live via WebSockets.

## Live Demo

- **Frontend:** https://paynest-one.vercel.app
- **Backend API:** https://honest-heart-production-e56f.up.railway.app/api

## Architecture

```
┌─────────────┐     HTTP (REST)      ┌──────────────┐     SQL       ┌────────────┐
│   React +   │ ──────────────────── │   NestJS     │ ──────────── │ PostgreSQL │
│   Vite      │     WebSocket        │   Backend    │              │            │
│   (SPA)     │ ◄═══════════════════ │   (Socket.IO)│              │  users     │
└─────────────┘                      └──────────────┘              │  auctions  │
                                                                   │  bids      │
  Tailwind CSS                        TypeORM ORM                  └────────────┘
  React Router                        Pessimistic Locking
  Socket.IO Client                    Cron Scheduler
```

**Data flow:**
1. User creates auction → `POST /api/auctions` → saved to DB
2. User places bid → `POST /api/auctions/:id/bids` → validated inside a `SELECT ... FOR UPDATE` transaction → saved → WebSocket `new_bid` emitted to room
3. Cron job (every 5s) closes expired auctions → WebSocket `auction_ended` emitted

## Tech Decisions

| Decision | Choice | Reasoning |
|----------|--------|-----------|
| **Database** | PostgreSQL | `SELECT ... FOR UPDATE` for row-level pessimistic locking — essential for race-safe bidding |
| **ORM** | TypeORM | Native pessimistic lock support (`lock: { mode: 'pessimistic_write' }`), first-class NestJS integration |
| **Currency** | Integer cents | Avoids floating-point comparison bugs. $15.50 stored as `1550`. Same pattern as Stripe/PayPal |
| **Real-time** | Socket.IO | Room-based broadcasting (one room per auction), automatic reconnection, widely supported |
| **Frontend** | React + Vite + Tailwind | Fast build, modern tooling, utility-first styling without component library overhead |
| **State** | useState + useContext | Sufficient for 2-page app; Redux would be overkill |

## Race Condition Handling

The bid endpoint uses **pessimistic locking** to prevent two simultaneous bids from both succeeding:

```sql
BEGIN;
  SELECT * FROM auctions WHERE id = $1 FOR UPDATE;  -- locks the row
  -- validate: auction active, bid > current + $1.00 minimum increment
  INSERT INTO bids (...) VALUES (...);
  UPDATE auctions SET current_highest_bid_cents = $new_bid;
COMMIT;  -- releases the lock
```

When two bids arrive simultaneously:
- Bid A acquires the row lock, validates, saves, commits
- Bid B is **blocked** at `FOR UPDATE` until A commits
- B then reads the updated value and is rejected if too low

**Horizontal scaling note:** With multiple server instances, WebSocket events need a Redis adapter (`@socket.io/redis-adapter`) to broadcast across instances. The cron scheduler would also need a distributed lock. Neither is needed for single-instance deployment.

## Setup

### Prerequisites
- Node.js 20+
- PostgreSQL 16+
- Docker & Docker Compose (optional)

### Local Development

```bash
# 1. Clone and install
git clone https://github.com/YOUR_USERNAME/paynest.git
cd paynest

# 2. Backend
cd backend
cp .env.example .env  # edit DB credentials if needed
npm install
npm run start:dev     # runs on http://localhost:3000

# 3. Frontend (new terminal)
cd frontend
npm install
npm run dev           # runs on http://localhost:5173
```

### Docker

```bash
docker compose up --build
# Frontend: http://localhost
# Backend:  http://localhost:3000
```

### Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| `DB_HOST` | localhost | PostgreSQL host |
| `DB_PORT` | 5432 | PostgreSQL port |
| `DB_USERNAME` | postgres | Database user |
| `DB_PASSWORD` | postgres | Database password |
| `DB_NAME` | paynest | Database name |
| `CORS_ORIGIN` | http://localhost:5173 | Allowed CORS origin |
| `PORT` | 3000 | Backend port |

## API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/users` | List all 100 seeded users |
| POST | `/api/auctions` | Create auction |
| GET | `/api/auctions` | List all auctions |
| GET | `/api/auctions/:id` | Get auction with bid history |
| POST | `/api/auctions/:id/bids` | Place bid (race-safe) |

## WebSocket Events

| Direction | Event | Payload |
|-----------|-------|---------|
| Client → Server | `join_auction` | `{ auctionId }` |
| Client → Server | `leave_auction` | `{ auctionId }` |
| Server → Client | `new_bid` | `{ auctionId, amountCents, userId, username, timestamp }` |
| Server → Client | `auction_ended` | `{ auctionId, winnerId, winnerName, winningBidCents }` |

## CI/CD

GitHub Actions pipeline (`.github/workflows/ci.yml`):
1. **Backend job:** lint → test → build (with Postgres service container)
2. **Frontend job:** lint → build
3. **Deploy job:** triggers deploy hooks on push to `main` (Vercel auto-deploys on push, Railway auto-deploys on push)

## Scalability Notes

- **Stateless backend:** No in-memory session state. Can scale horizontally behind a load balancer.
- **WebSocket scaling:** Add `@socket.io/redis-adapter` for multi-instance broadcasting.
- **Database indexes:** Composite index on `(status, endTime)` for the cron query. Index on `(auctionId, createdAt)` for bid history.
- **Connection pooling:** TypeORM uses pg pool by default (10 connections).
- **Railway free tier:** $5/month credit covers small workloads. Backend stays awake while credit lasts.
- **Vercel:** Frontend hosted as static site with automatic deploys on push.
