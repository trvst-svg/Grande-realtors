# Grande Realtors

Grande Realtors is a full-stack real estate marketplace built for property discovery, agent-assisted sales, and auction-based bidding. The platform combines listing management, role-aware dashboards, buyer inquiries, favorites, messaging, contracts, ratings, and Khalti-powered bid-ticket payments in a single codebase.

## Highlights

- React + Vite frontend for the customer, agent, and admin experiences
- Express API backed by PostgreSQL
- JWT access-token authentication with refresh-token rotation
- Admin approval workflow for new user registrations and property verification
- Auction lifecycle support, including bid-ticket purchase through Khalti sandbox
- Messaging, contracts, seller ratings, and property inquiry flows

## Architecture

### Frontend

The frontend lives in `frontend/` and is responsible for:

- public-facing property browsing
- authentication and session bootstrap
- buyer, agent, and admin dashboard navigation
- auction checkout and bidding flows

### Backend

The backend lives in `backend/` and provides:

- REST endpoints for auth, properties, auctions, dashboards, messaging, ratings, and payments
- PostgreSQL data access through model modules
- upload handling for user and property images
- background polling to open scheduled auctions and trigger notification emails

### Database

The canonical database definition is `backend/db/schema.sql`.

Use `schema.sql` for fresh local setup and for aligning an older local database to the current application shape. The files under `backend/db/migrations/` are best treated as historical reference; the application does not execute them automatically during startup.

## Repository Structure

```text
Grande-realtors/
├── backend/
│   ├── db/
│   │   ├── schema.sql
│   │   ├── migrations/
│   │   └── seeds/
│   ├── package.json
│   └── src/
└── frontend/
    ├── package.json
    └── src/
```

## Prerequisites

- Node.js and npm
- PostgreSQL
- Khalti sandbox credentials for payment testing
- SMTP credentials if email-based flows should run locally

## Environment Configuration

Create environment files before starting the project.

### Backend: `backend/.env`

| Variable | Purpose |
| --- | --- |
| `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` | PostgreSQL connection settings |
| `PORT` | API port, defaults to `5000` |
| `BACKEND_URL` | Public backend base URL used in payment callbacks |
| `FRONTEND_URL` | Frontend base URL used for redirects and email links |
| `CORS_ORIGIN` | Allowed browser origin for credentialed requests |
| `JWT_SECRET` | Secret used to sign access and refresh session data |
| `REFRESH_TOKEN_TTL_DAYS` | Refresh-token lifetime in days |
| `BID_TICKET_AMOUNT` | Bid-ticket fee in NPR |
| `BID_MIN_INCREMENT` | Minimum bid step for auction placement |
| `AUCTION_START_POLL_MS` | Poll interval for opening scheduled auctions |
| `KHALTI_SECRET_KEY` | Khalti secret key |
| `KHALTI_GATEWAY_URL` | Khalti initiate-payment endpoint |
| `KHALTI_LOOKUP_URL` | Khalti payment lookup endpoint |
| `KHALTI_RETURN_URL` | Backend callback URL for Khalti returns |
| `KHALTI_WEBSITE_URL` | Frontend website URL sent to Khalti |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, `SMTP_FROM` | Email transport configuration |

### Frontend: `frontend/.env`

| Variable | Purpose |
| --- | --- |
| `VITE_API_BASE_URL` | Base URL for the Express API, defaults to `http://localhost:5000` |

## Local Setup

### 1. Install dependencies

```bash
cd backend
npm install

cd ../frontend
npm install
```

### 2. Create the database schema

```bash
psql -d <your_database_name> -f backend/db/schema.sql
```

Optional seed data is available under `backend/db/seeds/`.

### 3. Start the backend

```bash
cd backend
npm run dev
```

### 4. Start the frontend

```bash
cd frontend
npm run dev
```

Default local endpoints:

- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`
- Health check: `http://localhost:5000/health`

## Scripts

### Backend

- `npm run dev`: starts the API with `nodemon`

### Frontend

- `npm run dev`: starts the Vite development server
- `npm run build`: creates a production build
- `npm run lint`: runs ESLint
- `npm run preview`: previews the production build locally

## Payment Flow Notes

The auction bid-ticket flow is wired for Khalti sandbox by default. The backend creates a pending ticket, redirects the buyer to Khalti checkout, and verifies the returned `pidx` against Khalti before marking the ticket as `paid` or `failed`.

Recommended sandbox values:

```env
KHALTI_GATEWAY_URL=https://dev.khalti.com/api/v2/epayment/initiate/
KHALTI_LOOKUP_URL=https://dev.khalti.com/api/v2/epayment/lookup/
KHALTI_RETURN_URL=http://localhost:5000/api/payments/khalti/return
KHALTI_WEBSITE_URL=http://localhost:5173
```

Common sandbox test values:

- Ticket fee: `NPR 1000`
- Test Khalti IDs: `9800000000` to `9800000005`
- Test MPIN: `1111`
- Test OTP: `987654`

## Operational Notes

- PostgreSQL must be reachable before the backend starts.
- Bid placement is enforced server-side. Users cannot bid until their ticket status is `paid`.
- The auction notifier runs in the backend process and periodically opens scheduled auctions.
- Email features degrade gracefully when SMTP is not configured, but related notifications will not be sent.
