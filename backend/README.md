# SkillSwap — Backend

Node.js + Express + MongoDB (Mongoose) REST API, JWT auth, and Socket.io real-time chat.

## Folder structure

```
backend/
├── config/         # DB connection
├── controllers/     # Route handler logic
├── middleware/      # auth, validation, error handling
├── models/           # Mongoose schemas (User, Session, Chat, Review)
├── routes/           # Express routers
├── sockets/          # Socket.io real-time chat handler
├── seed/seed.js       # Sample data seed script
├── app.js             # Express app (middleware + routes)
├── server.js           # Entry point (HTTP + Socket.io server)
└── SkillSwap.postman_collection.json  # Import into Postman for manual API testing
```

## 1. Prerequisites

- Node.js 18+ and npm
- A MongoDB Atlas cluster (free tier is fine) — https://www.mongodb.com/cloud/atlas
  - Create a cluster, a database user, and whitelist your IP (or 0.0.0.0/0 for testing)
  - Copy your connection string, it looks like:
    `mongodb+srv://<user>:<password>@cluster0.xxxxx.mongodb.net/skillswap?retryWrites=true&w=majority`

## 2. Setup

```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env` and fill in:
- `MONGO_URI` — your Atlas connection string
- `JWT_SECRET` / `JWT_REFRESH_SECRET` — any long random strings (e.g. generate with `openssl rand -hex 32`)
- `CLIENT_URL` — leave as `http://localhost:5173` (default Vite dev port)

## 3. Seed sample data

This wipes and repopulates your database with 4 sample users, skills, a session, a completed session with a review, and a chat — so you can see the whole app working immediately.

```bash
npm run seed
```

Sample login (all use password `password123`):
- alice@example.com
- bob@example.com
- carol@example.com
- dev@example.com

## 4. Run the server

```bash
npm run dev   # with nodemon auto-reload
# or
npm start
```

The API will be running at `http://localhost:5000`. Health check: `GET http://localhost:5000/api/health`.

## 5. Test the API

Import `SkillSwap.postman_collection.json` into Postman (or use it as a REST Client file), or use curl:

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@example.com","password":"password123"}'
```

Copy the `accessToken` from the response and use it as `Authorization: Bearer <token>` for all other routes.

## API Overview

| Method | Route | Description |
|---|---|---|
| POST | /api/auth/register | Create account |
| POST | /api/auth/login | Log in |
| POST | /api/auth/refresh | Get a new access token |
| POST | /api/auth/logout | Invalidate refresh token |
| GET/PUT | /api/auth/me | Get/update own profile |
| GET | /api/skills/mine | List my skills |
| POST | /api/skills/teach \| /learn | Add a skill |
| DELETE | /api/skills/teach/:id \| /learn/:id | Remove a skill |
| GET | /api/matches | Ranked list of compatible peers |
| POST | /api/sessions | Request a session |
| GET | /api/sessions | List my sessions |
| PUT | /api/sessions/:id/propose \| accept \| complete \| cancel | Manage a session |
| POST | /api/reviews | Review a completed session |
| GET | /api/reviews/user/:userId | View a user's reviews |
| GET/POST | /api/chats... | Conversations + fallback message send |
| GET | /api/users, /api/users/:id | Browse profiles |

Real-time chat uses Socket.io on the same port — see `sockets/chatSocket.js` for events (`join_chat`, `send_message`, `receive_message`, `typing`, `notification`).

## Notes for your viva

- **Matching algorithm** (`utils/matching.js`): compares each user's `skillsToLearn` against candidates' `skillsToTeach` (and vice versa), computes an overlap percentage, and boosts two-way (mutual swap) matches.
- **Auth**: passwords hashed with bcrypt; short-lived access tokens (15 min) + long-lived refresh tokens (7 days) stored on the user document, matching common production JWT patterns.
- **Validation**: `express-validator` on all write routes; centralized error handler in `middleware/errorHandler.js` normalizes Mongoose errors into clean JSON responses.
