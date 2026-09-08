# SkillSwap

A peer-to-peer skill exchange platform: list skills you can teach and skills you want
to learn, get matched with compatible peers via a two-way compatibility algorithm,
book learning sessions, chat in real time, and rate each other after sessions.

## Tech stack

| Layer | Choice |
|---|---|
| Frontend | React 19 + Vite (web app — see note in `frontend/README.md` about Expo) |
| Backend | Node.js + Express |
| Database | MongoDB Atlas via Mongoose |
| Auth | JWT (access + refresh tokens) + bcrypt |
| State management | Redux Toolkit |
| Real-time | Socket.io |
| API testing | Postman collection (`backend/SkillSwap.postman_collection.json`) |

## Quick start

1. **Backend** — see `backend/README.md`. In short:
   ```bash
   cd backend
   npm install
   cp .env.example .env   # then fill in your MongoDB Atlas URI + JWT secrets
   npm run seed             # populates sample users/skills/sessions/reviews
   npm run dev
   ```
2. **Frontend** — see `frontend/README.md`. In short:
   ```bash
   cd frontend
   npm install
   cp .env.example .env
   npm run dev
   ```
3. Open `http://localhost:5173` and log in with `alice@example.com` / `password123`.

## What's implemented

- **Auth**: register/login with hashed passwords, JWT access + refresh tokens, protected routes, profile editing.
- **Skill management**: add/remove "skills I can teach" and "skills I want to learn", each with category, proficiency level, and description.
- **Matching**: `backend/utils/matching.js` computes a two-way compatibility score between every pair of users and returns a ranked list with a compatibility %, boosting genuine two-way swaps.
- **Booking**: request a session with date/time + duration, propose/accept new times, mark complete or cancel.
- **Real-time chat**: Socket.io-backed one-on-one chat, persisted to MongoDB, with typing/notification events.
- **Ratings & reviews**: after a session is completed, both participants can leave a 1–5 star review + comment; the reviewee's average rating is recomputed automatically.
- **Dashboard**: overview cards linking to My Skills / My Matches / My Sessions / Chats, top match preview.

## Verified in this sandbox

- All backend modules (models, routes, controllers, middleware, sockets) load and wire together without errors.
- The matching algorithm was unit-tested standalone with sample data and produces correct compatibility scores (see transcript / can be re-run with `node -e` snippets in `backend/utils/matching.js`).
- The frontend builds cleanly with Vite (`npm run build`) — 0 errors, 0 warnings.
- **Not verified here**: a live round-trip against a real MongoDB instance, because this sandboxed environment has no network access to MongoDB's servers (Atlas or local `mongod` binaries). Once you plug in your own Atlas connection string, run `npm run seed` and then walk through the numbered checklist in `frontend/README.md` — that will confirm the full stack end-to-end on your machine.

## Project structure

```
skillswap/
├── backend/     # Express API, Mongoose models, Socket.io, seed script
└── frontend/    # React + Vite app, Redux Toolkit, Socket.io client
```
