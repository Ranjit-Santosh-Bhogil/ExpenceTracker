# Expense Tracker

Full-stack expense tracker with a React frontend, Node.js + Express API, and PostgreSQL database.

## Architecture

```
React (Vite)  →  Node.js + Express  →  PostgreSQL
```

The original Python/FastAPI backend is preserved in `backend/` for reference. The active API lives in `backend-node/`.

## Project Structure

```
ExpenceTracker/
├── frontend/          # React + Vite UI
├── backend-node/      # Node.js + Express + Prisma API (active)
└── backend/           # Legacy Python/FastAPI API (kept for reference)
```

## Prerequisites

- Node.js 18+
- PostgreSQL database (Neon, local Postgres, etc.)
- npm

## Quick Start

### 1. Database

Use the same PostgreSQL database as the Python backend. Copy your connection string into `backend-node/.env`:

```env
DATABASE_URL="postgresql://user:password@host:5432/dbname?sslmode=require"
SECRET_KEY="your-secret-key-change-this-in-production"
PORT=3000
ALLOWED_ORIGINS="http://localhost:5173,https://expence-tracker-gamma-dun.vercel.app"
```

**Important:** Keep `SECRET_KEY` identical to the Python backend so existing JWT tokens and bcrypt password hashes remain valid.

### 2. Node.js API

```bash
cd backend-node
cp .env.example .env
# Edit .env with your DATABASE_URL and SECRET_KEY

npm install
npm run db:generate
npm start
```

The API runs at `http://127.0.0.1:3000`.

For development with auto-reload:

```bash
npm run dev
```

### 3. React Frontend

```bash
cd frontend
npm install
npm run dev
```

The frontend proxies API requests through `/api` → `http://127.0.0.1:3000` during development.

For production, set:

```env
VITE_API_URL=https://your-node-api.example.com
```

## API Endpoints

| Method | Route | Auth | Description |
|--------|-------|------|-------------|
| POST | `/register` | No | Register a new user |
| POST | `/login` | No | Login and receive JWT |
| GET | `/me` | Yes | Current user profile |
| GET/POST | `/expenses` | Yes | List / create expenses |
| PUT/DELETE | `/expenses/:id` | Yes | Update / delete expense |
| GET/POST | `/income` | Yes | List / create income |
| PUT/DELETE | `/income/:id` | Yes | Update / delete income |
| GET | `/dashboard` | Yes | Dashboard summary |

All protected routes require `Authorization: Bearer <token>`.

## Testing

```bash
cd backend-node
npm test
```

Integration tests require `DATABASE_URL` in `.env`. The health check runs without a database.

## Migration Notes (Python → Node.js)

### What was migrated

- All REST endpoints with the same paths and response shapes
- JWT authentication (HS256, 24-hour expiry)
- bcrypt password hashing (compatible with existing user passwords)
- PostgreSQL schema: `users`, `expenses`, `income`
- Input validation and FastAPI-compatible error format (`{ detail: "..." }`)
- CORS configuration

### What was not changed

- PostgreSQL database, schema, relationships, and data
- React frontend (minimal proxy/config updates only)
- Python backend (preserved in `backend/`)

### Frontend changes

- Vite dev proxy target: port `8000` → `3000`
- Default `API_BASE_URL` fallback: `/api` for local dev
- Auth error message updated for port 3000

### Switching from Python to Node.js

1. Start the Node.js API (`backend-node`) instead of Uvicorn
2. Point the frontend to port 3000 (already configured for local dev)
3. Use the same `DATABASE_URL` and `SECRET_KEY`
4. Verify login, expenses, income, and dashboard flows
5. Retire the Python backend only after verification

## Legacy Python Backend

To run the original FastAPI backend for comparison:

```bash
cd backend
pip install -r requirements.txt
# Set DATABASE_URL in backend/.env
uvicorn app.main:app --reload --port 8000
```
