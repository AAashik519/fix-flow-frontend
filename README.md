# FixFlow frontend

React app for the FixFlow repair-shop dashboard. Shop owners and technicians sign in here. Customers open a public tracking link with no account.

Live app: https://fix-flow-frontend-orpin.vercel.app

## Stack

- React 18, Vite 6, JavaScript
- React Router
- Redux Toolkit and RTK Query
- React Hook Form and Zod
- Tailwind CSS 4
- Recharts, Sonner

## Requirements

- Node.js 20+
- The FixFlow API running locally, or a deployed API URL

## Setup

```bash
cd frontend
npm install
cp .env.example .env
npm run dev
```

The dev server is http://localhost:5173

## Environment

`frontend/.env`

```env
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

For the Vercel build, set the same variable to the deployed API:

```env
VITE_API_BASE_URL=https://fix-flow-backend.vercel.app/api/v1
```

Vite reads this at build time. Change it, then rebuild and redeploy.

## Scripts

| Script | What it does |
| --- | --- |
| `npm run dev` | Start the Vite dev server |
| `npm run build` | Production build in `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Run ESLint |

## Routes

Public:

- `/login`, `/register`, `/forgot-password`, `/reset-password`
- `/track/:trackingToken` — customer repair status, no login

Admin:

- `/dashboard`
- `/customers`, `/customers/new`, `/customers/:id`, `/customers/:id/edit`
- `/devices`
- `/repair-tickets`, `/repair-tickets/new`, `/repair-tickets/:id`, `/repair-tickets/:id/edit`
- `/technicians`
- `/inventory`, `/inventory/:id`
- `/payments`, `/reports`, `/settings`

Technician:

- `/technician`
- `/technician/repairs`
- `/technician/repairs/:id`

Shared after login:

- `/notifications`
- `/profile`

Technicians who open an admin ticket URL are sent to `/access-denied`. Notification clicks for a technician go to `/technician/repairs/:id`.

## Auth

Login and register store `accessToken` in `localStorage`. RTK Query sends it as `Authorization: Bearer` and also sends cookies (`credentials: "include"`). The bearer token is what works when the UI and API are on different Vercel hosts.

Logout clears that token.

## Vercel

`vercel.json` rewrites every path to `index.html`, so routes such as `/reset-password` load the app instead of a platform 404. Redeploy the frontend after changing that file.

## Project layout

```text
src/
  pages/          route screens (admin, technician, auth, public)
  services/api/   RTK Query clients
  components/     shared UI
  layouts/        auth shell and dashboard shell
  routes/         route table and role guard
```
