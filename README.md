# QuickServe — Enterprise Admin Dashboard

[![CI](https://github.com/edubusiness/quickserve-admin/actions/workflows/ci.yml/badge.svg)](https://github.com/edubusiness/quickserve-admin/actions/workflows/ci.yml)

A premium, dark-first admin dashboard for a multi-service marketplace platform
(bookings, providers, drivers, delivery, payments, analytics). Built as a
polished, runnable foundation that improves on the reference design with a
cleaner layout, smooth animations and a complete runtime theming system.

## Tech stack (this build)

- **Next.js 15** (App Router) + **React 19** + **TypeScript**
- **Tailwind CSS v4** (CSS-first config, `@theme` tokens)
- **Framer Motion** — page/card/sidebar animations, counters, skeletons
- **Recharts** — animated sparklines + revenue/booking analytics
- **Lucide React** — icon set
- Mock data layer in `src/data` (drop-in replaceable with REST/TanStack Query)

> The broader spec (Express + MongoDB + Socket.IO + NextAuth + Cloudinary, etc.)
> is intended for the backend/integration phase. This repo delivers the
> production-grade **frontend foundation** with a mock API surface so the UI is
> fully interactive today and ready to wire to live services.

## Getting started

This is a monorepo: the **Next.js frontend** (root) and an **Express API** (`server/`).

```bash
# 1. API (Express + JWT auth + Socket.IO) — boots with a zero-config in-memory store
cd server && npm install && npm run start      # http://localhost:4000

# 2. Frontend (in a second terminal)
npm install
cp .env.example .env.local                     # set AUTH_SECRET (openssl rand -base64 32)
npm run dev                                     # http://localhost:3000
```

Or run the whole stack (web + API + MongoDB) with Docker:

```bash
docker compose up --build
```

### Demo logins (seeded automatically)

| Role | Email | Password |
|------|-------|----------|
| Super Admin | `admin@quickserve.io` | `admin123` |
| Ops Manager | `manager@quickserve.io` | `manager123` |
| Support | `support@quickserve.io` | `support123` |

## Backend & auth

- **Express + TypeScript API** (`server/`) — modular routes, `asyncHandler` error
  pipeline, Zod validation, CORS, morgan logging.
- **JWT auth** — bcrypt password hashing, `/api/auth/login|register|me`, Bearer
  middleware, and `requireRole(...)` role guards (`super_admin` bypasses all).
- **REST resources** — `bookings`, `customers`, `providers`, `drivers`,
  `payments` each expose list (search + filter + sort + pagination), get,
  create, update, delete and bulk endpoints via a generic router factory.
- **Socket.IO** — emits a synthetic live-activity stream every 5s.
- **Storage** — a **repository abstraction** (`server/src/db/repository.ts`)
  serves every route from either the deterministic in-memory store (no
  `MONGODB_URI`) or **MongoDB via Mongoose** (`MONGODB_URI` set) behind one
  interface. On first Mongo boot the collections + default users are seeded
  (idempotent); search / filter / sort / pagination map to Mongo queries.
  Both modes are verified end-to-end, including data persisting across restarts.
- **NextAuth (Auth.js v5)** — Credentials provider authenticates against the
  Express API, stores the JWT + role in the session. `middleware.ts` protects
  every route, redirecting unauthenticated users to `/login` (with callback).
  `src/lib/api.ts` is a typed, token-aware fetch client.

## Live data (TanStack Query)

The **Bookings, Customers, Providers, Drivers and Payments** pages fetch from the
live Express API via TanStack Query (`src/hooks/use-resources.ts`) — with skeleton
loading states, error + retry UI, and 30s caching. Stat cards are derived from the
fetched data. The `DataTable` keeps its rich client-side search / sort / paginate /
export UX on top of the live collection. The `QueryClient` is provided app-wide in
`src/components/providers.tsx`.

## Tests (40 total)

**Backend** — Vitest + Supertest (22 tests): the query engine (pagination /
search / filter / sort), auth (login, bad password, validation, `/me`,
register), and resource routes (auth required, pagination, filter, sort, create,
**RBAC 403 for the support role**, update, delete, bulk). Hermetic in-memory mode.

**Frontend** — Vitest + Testing Library (18 tests): formatting utils,
the **theme system** (defaults, persistence to localStorage, `<html>` attributes,
hydration, reset), and the **`DataTable`** (paging, search, sort, page nav, bulk
selection + action, empty state).

```bash
cd server && npm test    # 22 backend tests
npm test                 # 18 frontend tests (from repo root)
```

## Forms & mutations (React Hook Form + Zod)

**Customers, Service Providers, Drivers** and **Bookings** have full create/edit
flows (Providers/Drivers forms include a `Controller`-bound toggle for
verified/online): a reusable `Modal`
hosts a `react-hook-form` form validated with a **Zod** schema (`TextField` /
`SelectField` primitives, inline errors). Submits run through
`useResourceMutations` (`src/hooks/use-mutations.ts`) — `useMutation` calls the
API's POST/PATCH/DELETE/bulk endpoints and invalidates the TanStack Query cache
so tables refresh instantly. Bulk-action bars (Block, Mark Completed, Cancel,
Delete) are wired to the bulk endpoint. Writes are role-guarded server-side
(`support` role gets 403 on create). Mutations are **optimistic** — the table
updates instantly, rolls back on error, and re-syncs on settle — and every
action raises a success/error **toast** (`src/components/ui/toast.tsx`).

## Real-time (Socket.IO)

The dashboard **Live Activity Feed** subscribes to the API's Socket.IO stream
(`src/hooks/use-live-activity.ts`): new events animate in at the top with a
"new" tag and a connection-aware **Live / Offline** indicator. The dashboard
**KPI cards** also pull from `GET /api/dashboard/stats` and re-run their count-up
animation when live numbers arrive — falling back to seed values if the API is
down, so the dashboard always renders.

## What's implemented

- **Sticky header** — global search (⌘K), AI Assistant, theme switcher,
  dark/light toggle, language, fullscreen, messages, notifications, profile.
- **Collapsible sidebar** — full nav tree (Operations, Users & Partners,
  Marketplace, Finance, Marketing, Analytics, Platform) with expandable groups,
  badges, and a mobile drawer.
- **Dashboard widgets** — 5 animated KPI cards w/ sparklines + count-up,
  live operations map (animated markers, route preview, zoom controls, legend),
  live activity feed, revenue analytics chart, top services, bookings by city,
  recent bookings, quick actions, profile card, today's summary, AI insights,
  and an Emergency/SOS panel.
- **AI Assistant** — slide-in panel with suggestions, text + voice input affordances.
- **Appearance & Theme settings** (`/settings/appearance`) — three full themes
  (Professional Blue, Royal Purple, Emerald Green) with instant switching,
  preview cards, dark/light mode, reset, and **localStorage persistence**
  (with a pre-hydration script to prevent theme flash).
- **Responsive** — single-column on mobile → up to a 12-column desktop grid,
  no horizontal scroll. Cards stack, charts/tables reflow.
- **Performance** — `next/dynamic` code-splitting for chart/map widgets,
  skeleton loaders, memo-friendly components. **PWA manifest** included.

## Theme system

Themes are CSS variables on `<html>` driven by `data-theme` + `data-mode`,
mapped into Tailwind via `@theme inline` in `src/app/globals.css`. The
`ThemeProvider` (`src/components/theme-provider.tsx`) persists choices to
`localStorage` under `quickserve-theme`. Add a theme by adding one
`[data-theme="..."]` block of tokens — every component picks it up automatically.

## Project structure

```
src/
├── app/                  # App Router pages (dashboard, appearance, catch-all module)
├── components/
│   ├── layout/           # shell, sidebar, header, AI assistant
│   ├── dashboard/        # KPI cards, map, feeds, panels
│   ├── charts/           # sparkline + revenue chart
│   ├── ui/               # card, badge, animated counter
│   └── theme-provider.tsx
├── data/                 # navigation + mock dashboard data
├── lib/                  # utils, tone helpers
├── types/                # shared TypeScript types
└── app/globals.css       # design tokens + 3 themes + utilities
```

## Built-out modules

All reachable from the sidebar; every other link renders a styled scaffold page.

| Route | Module | Highlights |
|-------|--------|-----------|
| `/` | Dashboard | KPIs, live map, feeds, charts, SOS, quick actions |
| `/bookings` | Bookings | Filterable table, bulk actions, CSV/Excel/PDF export |
| `/customers` | Customers | Directory, status, lifetime value |
| `/providers` | Service Providers | Verification, ratings, earnings |
| `/drivers` | Drivers | Live online status, vehicle, trips |
| `/payments` | Payments | Transactions, fees, net revenue, refunds |
| `/services` | Services | Visual catalog grid with active toggles |
| `/reviews` | Reviews | Moderation grid, rating distribution |
| `/analytics/revenue` | Analytics | Bar/area/line/donut charts, KPIs |
| `/settings` | System Settings | General, notifications, security toggles |
| `/settings/appearance` | Appearance | 3 themes, dark/light, persistence |

## Every module is built out

All ~40 sidebar routes render real content. The primary directories (Bookings,
Customers, Providers, Drivers, Payments, Services, Reviews) are bespoke pages
with live API data + CRUD. The remaining ~39 modules (Operations, Marketplace,
Finance, Marketing, Analytics, Platform) are driven by a **config-driven module
system**: declarative configs in `src/data/modules.ts` are rendered by
`src/components/modules/module-renderer.tsx` (dispatched through the `[...slug]`
catch-all). Four render kinds — `table` (full DataTable with stats, filters,
export), `analytics` (chart dashboards), `map` (live map), and `settings`
(toggle groups) — cover everything, so no route is a dead placeholder.

**Reusable building blocks:** `DataTable` (search/sort/paginate/bulk/export/mobile-cards),
`StatCards`, `PageHeader`, `Switch`, `Card`, `Badge`, `AnimatedCounter`,
`Sparkline`, and the analytics chart set.

## Next steps (integration phase)

1. Replace `src/data/*` with TanStack Query hooks against REST endpoints.
2. Add NextAuth + JWT and role-based route guards.
3. Swap the stylized map for React-Leaflet / Google Maps with clustering + sockets.
4. Build out module pages (currently a shared scaffolded placeholder) with
   virtualized tables, filters, CSV/Excel/PDF export.
```
