# Verification checklist

## Automated checks already run
- Backend: 12/12 JavaScript modules pass `node --check` through `scripts/verify-backend.mjs`.
- Frontend: every local relative import referenced by the source tree resolves to a real file.
- ZIP: contains 66+ real files; no empty placeholder source directories are relied upon.

## Required external verification before deployment
1. Run `npm install` inside `frontend/` and `backend/`.
2. Run `npm run build` inside `frontend/`.
3. Apply `supabase/schema.sql` in the Supabase SQL editor.
4. Configure server environment variables: `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY`, `FOOTBALL_API_KEY` and optionally `OPENAI_API_KEY`.
5. Start backend and verify `/api/health`.
6. Start frontend and verify login, fixtures, standings, teams, messaging, voting, predictions and admin routes.
7. Promote the first owner account to `admin` using the SQL instruction in `docs/SETUP.md`.

API-Football uses GET endpoints and the `x-apisports-key` request header. See the official documentation for current coverage and league/season IDs.
