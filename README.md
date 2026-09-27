# Football World 360

A modular React + Express + Supabase football platform with API-Football integration.

## Included
- Mbappe homepage hero
- EPL/KPL football data gateway
- Fixtures, standings, teams, squads, players and match events/statistics
- Supabase authentication and profiles
- Protected admin role
- News, polls, Player of the Week, quizzes and predictions
- Private messaging, group chats and notifications
- Presence heartbeat
- Authorized media
- Football AI backend endpoint
- Supabase RLS schema and security functions

## Run locally

### Frontend
```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

### Backend
```bash
cd backend
npm install
cp .env.example .env
npm start
```

Backend `.env`:
- `SUPABASE_URL`
- `SUPABASE_PUBLISHABLE_KEY`
- `FOOTBALL_API_KEY`
- `OPENAI_API_KEY` (optional until AI is enabled)

Frontend `.env`:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_API_BASE_URL=http://localhost:8787/api`

## Supabase
Run `supabase/schema.sql` in the Supabase SQL editor. Then create a normal user account and promote the intended owner account to `admin` from the Supabase SQL editor. Do not expose a service-role key in the frontend or GitHub.

## Important
The repository contains environment templates, not secret API keys. API-Football and OpenAI secrets must be supplied through the server environment.
