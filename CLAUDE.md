# Todo App

A full-stack todo app: an Express 5 API with MongoDB in `backend/`, a React app in `frontend/`.

## Commands

- Backend (`backend/`): `npm run dev` starts the API on http://localhost:3001, `npm run typecheck` checks the types.
- Frontend (`frontend/`): `npm run dev` starts the app on http://localhost:5173, `npm run check` checks the types, `npm run build` builds it.
- `npm run dev` never finishes. **Ask the user to start it**, or start it in the background.
- Run the type check of the part you changed before you say a task is done.

## Stack

- Backend: Node.js 22, ES modules, TypeScript (`strict`), Express 5, mongoose, `cors`. Run with `tsx`, no build step.
- Frontend: Vite, React 19, TypeScript, SWR for loading data. Plain CSS in `src/styles.css`.
- Do not add dependencies without asking.

## Structure

- `backend/src/app.ts` builds the app (CORS, JSON, routes, error handlers), `index.ts` connects to the database and listens.
- `backend/src/routes/todos.ts` has the routes, `models/Todo.ts` the schema, `middleware/errors.ts` the 404 and error handlers.
- `frontend/src/api.ts` holds **all** calls to the API. Components never call `fetch`.
- `docs/api-contract.md` is the contract. If you change the API, change the contract in the same step.

## Rules

- The API follows `docs/api-contract.md`: paths, status codes, field names (`id`, `title`, `done`) and the error format `{ "error": "..." }`.
- Routes call the mongoose model directly. No extra layers.
- **Never read, print, log or commit `backend/.env`.** It holds the connection string. `.env.example` has placeholders only.
- CORS is set up in `backend/src/app.ts`: it allows the origin in `CORS_ORIGIN`, defaulting to `http://localhost:5173`. Do not change it and do not use `*`.
- Use async/await. Name request parameters `request` and `response`. No `any`.
- Only do what the current issue asks for. No authentication, no tests.

## Deployment (Render)

- Backend: Web Service, root `backend`, build `npm install`, start `npm start` (`tsx` is a regular dependency for this). Env: `MONGODB_URI`, `CORS_ORIGIN` (the frontend's URL, no trailing `/`). Render sets `PORT`.
- Frontend: Static Site, root `frontend`, build `npm install && npm run build`, publish `dist`. Env: `VITE_API_URL` = backend URL **ending in `/api`**. It is baked in at build time, so redeploy after changing it.
- Atlas Network Access allows `0.0.0.0/0`, because Render has no fixed IPs.
- Pushing to `main` redeploys both.
