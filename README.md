# Kino XII

A cinema booking app built for the Redberry Bootcamp XII assignment. Browse films, filter sessions across four venues, pick seats on a live hall map and buy tickets.

## Features

- **Home:** featured films carousel, recently viewed, Now Playing and Coming Soon (with Notify Me).
- **Sessions:** filters for venue, date, format, language and time of day, sorting and pagination, all kept in the URL.
- **Film page:** details, a 7-day session picker grouped by venue and hall, and an age gate for 16+ and 18+ titles.
- **Booking:** a two-step modal. Pick up to 3 seats on a zoomable hall map with ticket types, then hold them for 8 minutes and check out. Handles seats taken by someone else (409), hold expiry and restoring a hold after a reload.
- **Profile:** personal information with validation and profile status, and My Tickets with upcoming and past orders and refunds.
- **Auth:** login and sign-up modals. A protected action continues after logging in, and an expired session opens the login modal and replays the interrupted request.

## Tech stack

React 19, TypeScript, Vite, Tailwind CSS 4, shadcn/ui (Radix), TanStack Query, React Router, react-hook-form with zod, axios, react-zoom-pan-pinch.

## Getting started

Requires Node.js 22.

```bash
npm install
cp .env.example .env
npm run dev
```

`.env` holds `VITE_BASE_URL`, the API's base URL. The value in `.env.example` points to the bootcamp API.

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Starts the dev server |
| `npm run build` | Type-checks and builds to `dist/` |
| `npm run preview` | Serves the production build locally |
| `npm run lint` | Runs ESLint |

## Project structure

```
src/
├── api/            axios client, token store, request functions, API types
├── reactQuery/     query and mutation hooks (cache keys, invalidation)
├── components/     feature folders (auth, booking, home, movie, profile, sessions, ...) and shadcn ui/
├── pages/          route components
├── layouts/        the shared header and footer shell
├── hooks/          shared hooks
└── lib/            formatting, dates and small local stores
```

Files are kebab-case and folders are camelCase.
