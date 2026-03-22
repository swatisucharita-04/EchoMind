<div align="center">
  <h1>🧠 EchoMind</h1>
  <p><strong>A premium, AI-powered mental wellness assistant.</strong></p>
  <p>EchoMind combines intelligent journaling, real-time voice/text AI chat, mood analytics, and personalized music therapy into one calming, immersive digital space.</p>
</div>

## ✨ Key Features
- **Premium UI & UX**: Gentle animated mesh gradients, soft glassmorphism, responsive Framer Motion micro-interactions, and a modern aesthetic inspired by top wellness apps.
- **AI-Powered Insights**: Real-time WebSocket conversations with Gemini 2.5 Flash, providing dynamic insights on every journal entry you save.
- **Robust Analytics**: Track 30-day mood distributions and weekly trends through interactive Recharts elements.
- **Rock-Solid Foundation**: Asynchronous FastAPI powered by Supabase PostgreSQL, protected by Clerk JWTs, and backed by a comprehensive `pytest` test suite.

## 🛠️ Tech Stack
| Layer       | Technology                            |
|-------------|---------------------------------------|
| Frontend    | React 18 + Vite + TailwindCSS         |
| Auth        | Clerk (JWT, social login, MFA)        |
| Backend     | FastAPI (Python 3.12, async)          |
| Database    | Supabase PostgreSQL                   |
| AI Chat     | Gemini 2.5 Flash                      |
| TTS         | Murf API                              |
| Music       | Spotify Web API                       |

---

## Project Structure

```
echomind/
├── backend/                  FastAPI app
│   ├── app/
│   │   ├── api/v1/           Route handlers (auth, chat, mood, journal, analytics, music, tts)
│   │   ├── core/             Auth (Clerk JWT), exceptions
│   │   ├── db/               SQLAlchemy async engine + Alembic migrations
│   │   ├── models/           ORM models
│   │   ├── schemas/          Pydantic v2 schemas
│   │   ├── services/         AI, TTS, Spotify, User, Conversation business logic
│   │   ├── config.py         pydantic-settings (reads .env)
│   │   └── main.py           App factory
│   └── requirements.txt
├── frontend/                 React + Vite
│   ├── src/
│   │   ├── api/              Axios client + all API functions
│   │   ├── components/       chat/, mood/, dashboard/, layout/, common/
│   │   ├── hooks/            useChat (WebSocket), useVoice
│   │   ├── pages/            Landing, SignIn, SignUp, Dashboard, Chat, Journal, Analytics, Profile
│   │   ├── store/            Zustand (authStore, uiStore)
│   │   ├── types/            TypeScript interfaces
│   │   ├── lib/              moodUtils
│   │   ├── App.tsx           Router + Clerk auth guards
│   │   └── main.tsx          Clerk + React Query providers
└── supabase_schema.sql       Run once in Supabase SQL editor
```

---

## Step 1 — Supabase Setup

1. Create a project at [supabase.com](https://supabase.com)
2. In the SQL Editor, run the full contents of `supabase_schema.sql`
3. Copy from **Project Settings → API**:
   - `SUPABASE_URL` (Project URL)
   - `SUPABASE_ANON_KEY` (anon/public key)
   - `SUPABASE_SERVICE_ROLE_KEY` (service_role key — keep secret)
4. Copy the database connection string from **Settings → Database**:
   - Use the **connection pooling** URI (port 6543) for production
   - Format: `postgresql+asyncpg://postgres.[ref]:[password]@aws-0-region.pooler.supabase.com:6543/postgres`

---

## Step 2 — Clerk Setup

1. Create a project at [clerk.com](https://clerk.com)
2. In **API Keys**, copy:
   - `CLERK_PUBLISHABLE_KEY` → used in frontend `.env`
   - `CLERK_SECRET_KEY` → used in backend `.env`
3. In **JWT Templates**, confirm the default session token is enabled
4. Find your **JWKS URL**:
   - Format: `https://<your-clerk-domain>.clerk.accounts.dev/.well-known/jwks.json`
   - Copy to `CLERK_JWKS_URL` in backend `.env`
5. In **Paths**, set:
   - Sign-in URL: `/sign-in`
   - Sign-up URL: `/sign-up`
   - After sign-in: `/dashboard`
   - After sign-up: `/dashboard`

---

## Step 3 — API Keys

### Gemini
1. Go to [aistudio.google.com](https://aistudio.google.com) → Get API Key
2. Copy to `GEMINI_API_KEY`

### Murf TTS
1. Sign up at [murf.ai](https://murf.ai) → API Access
2. Copy key to `MURF_API_KEY`

### Spotify
1. Go to [developer.spotify.com](https://developer.spotify.com) → Create App
2. Add `http://localhost:8000` to Redirect URIs (not needed for client credentials)
3. Copy Client ID and Secret to `SPOTIFY_CLIENT_ID` / `SPOTIFY_CLIENT_SECRET`

---

## Step 4 — Local Development

### Backend

```bash
cd backend
cp .env.example .env       # Fill in all values
python -m venv venv
source venv/bin/activate   # Windows: venv\Scripts\activate
pip install -r requirements.txt

# Run database migrations (first time only)
alembic upgrade head

# Start dev server
uvicorn app.main:app --reload --port 8000

# Run comprehensive test suite
pytest -v
```

API docs available at: `http://localhost:8000/docs`

### Frontend

```bash
cd frontend
cp .env.example .env       # Set VITE_CLERK_PUBLISHABLE_KEY
npm install
npm run dev
```

App available at: `http://localhost:5173`

---


## Step 6 — Deploy to Production (Render / Railway / Fly.io)

### Deploy Backend to Render

1. Push `backend/` folder to GitHub
2. Create a new **Web Service** on [render.com](https://render.com)
3. Set:
   - Build command: `pip install -r requirements.txt`
   - Start command: `uvicorn app.main:app --host 0.0.0.0 --port $PORT`
4. Add all environment variables from `.env`
5. After deploy, run migrations: `alembic upgrade head` (Render Shell)

### Deploy Frontend to Vercel

```bash
npm i -g vercel
cd frontend
vercel deploy --prod
```

Set `VITE_CLERK_PUBLISHABLE_KEY` and `VITE_API_BASE_URL` in Vercel project settings.

### Deploy Frontend to Netlify

```bash
npm run build
# Upload dist/ folder or connect GitHub repo
# Set build command: npm run build
# Set publish directory: dist
# Add env variables in Netlify dashboard
```

---

## API Endpoints Reference

| Method | Endpoint                                    | Auth | Description                        |
|--------|---------------------------------------------|------|------------------------------------|
| GET    | `/health`                                   | No   | Health check                       |
| POST   | `/api/v1/auth/sync`                         | Yes  | Upsert Clerk user into our DB      |
| GET    | `/api/v1/users/me`                          | Yes  | Get current user profile           |
| PATCH  | `/api/v1/users/me`                          | Yes  | Update user profile                |
| POST   | `/api/v1/chat/message`                      | Yes  | Single-turn AI chat (REST)         |
| WS     | `/api/v1/chat/ws/{session_id}?token=<jwt>`  | Yes  | Real-time WebSocket chat           |
| GET    | `/api/v1/chat/conversations`               | Yes  | List user's conversations          |
| GET    | `/api/v1/chat/conversations/{id}/messages` | Yes  | Get messages in a conversation     |
| GET    | `/api/v1/mood/history`                      | Yes  | Get mood history                   |
| GET    | `/api/v1/journal/`                          | Yes  | List journal entries               |
| POST   | `/api/v1/journal/`                          | Yes  | Create journal entry               |
| GET    | `/api/v1/journal/{id}`                      | Yes  | Get single entry                   |
| PATCH  | `/api/v1/journal/{id}`                      | Yes  | Update journal entry               |
| DELETE | `/api/v1/journal/{id}`                      | Yes  | Delete journal entry               |
| GET    | `/api/v1/journal/{id}/insight`              | Yes  | Get AI insight for entry           |
| GET    | `/api/v1/analytics/dashboard`               | Yes  | Full analytics payload             |
| GET    | `/api/v1/music/?mood=<mood>`                | Yes  | Get Spotify playlist for mood      |
| POST   | `/api/v1/tts/`                              | Yes  | Generate TTS audio                 |

---

## Clerk Auth Flow (How It Works)

```
User signs in via Clerk (frontend)
        ↓
Clerk issues a JWT (RS256)
        ↓
Frontend stores token (Clerk manages this)
        ↓
Every API request:
  Authorization: Bearer <clerk_jwt>
        ↓
FastAPI core/auth.py:
  1. Extracts token from Authorization header
  2. Fetches Clerk's JWKS endpoint (cached)
  3. Verifies RS256 signature
  4. Extracts sub (clerk_user_id) from claims
  5. Returns { clerk_user_id, payload } to route
        ↓
Route calls user_service.require_user()
  → looks up our users table by clerk_user_id
  → returns User ORM object
        ↓
All DB queries filter by user.id
  → complete data isolation per user
```

---

## Environment Variables Reference

### Backend `.env`
```
APP_ENV=production
ALLOWED_ORIGINS=https://yourdomain.com
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_ANON_KEY=...
SUPABASE_SERVICE_ROLE_KEY=...
DATABASE_URL=postgresql+asyncpg://...
CLERK_SECRET_KEY=sk_live_...
CLERK_PUBLISHABLE_KEY=pk_live_...
CLERK_JWKS_URL=https://xxx.clerk.accounts.dev/.well-known/jwks.json
GEMINI_API_KEY=...
MURF_API_KEY=...
MURF_VOICE_ID=en-US-natalie
SPOTIFY_CLIENT_ID=...
SPOTIFY_CLIENT_SECRET=...
```

### Frontend `.env`
```
VITE_CLERK_PUBLISHABLE_KEY=pk_live_...
VITE_API_BASE_URL=https://api.yourdomain.com
```

---

## Troubleshooting

| Problem | Solution |
|---------|----------|
| 401 on all API calls | Check `CLERK_JWKS_URL` matches your Clerk domain exactly |
| User not found after sign-in | Verify `/api/v1/auth/sync` is called in `App.tsx` after Clerk loads |
| WebSocket disconnect loop | Ensure `?token=` is passed and the JWT is fresh |
| Supabase connection error | Use connection pooling URL (port 6543), not direct (port 5432) |
| TTS not working | Verify `MURF_API_KEY` and that `static/audio/` dir exists |
| Spotify 403 | Regenerate client credentials in Spotify developer dashboard |
| Gemini quota error | Check Google AI Studio quota; consider adding retry logic |
