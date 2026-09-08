# SkillSwap — Frontend

React 19 + Vite, Redux Toolkit for state, React Router for navigation, Socket.io client for real-time chat.

(Built with Vite instead of Expo/React Native — this is a full web app experience that runs in the browser. If you specifically need a React Native/Expo mobile app shell, the Redux slices and API layer in `src/features/` and `src/api/` are UI-framework-agnostic and can be reused almost as-is in an Expo project; only the `pages/` and `components/` would need to be rebuilt with React Native primitives and React Navigation.)

## Folder structure

```
frontend/
├── src/
│   ├── api/            # axios client (with token refresh) + socket.io client
│   ├── app/             # Redux store
│   ├── features/        # Redux slices: auth, skills, matches, sessions, chat
│   ├── components/       # Navbar, StarRating, Spinner, ReviewModal
│   ├── pages/             # Login, Register, Dashboard, Skills, Matches, Sessions, Chats, Profile
│   ├── routes/             # ProtectedRoute guard
│   ├── App.jsx              # Router setup
│   └── main.jsx              # Entry point (Redux Provider)
```

## 1. Setup

Make sure the backend is already running (see `backend/README.md`) and seeded with sample data.

```bash
cd frontend
npm install
cp .env.example .env
```

`.env` defaults to `http://localhost:5000` for both the API and Socket.io — only change these if your backend runs elsewhere.

## 2. Run

```bash
npm run dev
```

Open `http://localhost:5173`. Log in with a seeded account, e.g.:
- **alice@example.com** / password123

## 3. What to try (to verify end-to-end)

1. Log in as **alice@example.com**.
2. Go to **My Skills** — see her seeded skills, add a new one.
3. Go to **My Matches** — Bob should show up with a high compatibility % (she can teach him React, he can teach her Guitar — a two-way swap).
4. Click **Book a session** on Bob's match card and send a request.
5. Open a second browser (or incognito window), log in as **bob@example.com**, go to **My Sessions**, and **Accept** the request Alice just sent — this proves the two accounts are really talking to the same backend/DB.
6. Go to **Chats** in both windows — send a message from one and watch it appear instantly in the other (Socket.io real-time chat).
7. As the teacher, mark the session **complete**, then have the other user **leave a review** — check the reviewed user's **Profile** page to see their average star rating update.

## Build for production

```bash
npm run build
```

Output goes to `frontend/dist/` — verified to build cleanly with zero errors/warnings.
