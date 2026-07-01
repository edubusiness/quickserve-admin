# Deploying QuickServe

Three pieces: **MongoDB Atlas** (database) → **Render** (API) → **Vercel** (web).
Deploy in that order, because each later step needs the previous one's URL.

```
Browser ──► Vercel (Next.js web)  ──►  Render (Express API)  ──►  MongoDB Atlas
             NEXT_PUBLIC_API_URL         MONGODB_URI
```

---

## 1. MongoDB Atlas (database)

1. Create a free **M0** cluster at <https://cloud.mongodb.com>.
2. **Database Access** → add a user (username + password).
3. **Network Access** → allow `0.0.0.0/0` (or Render's egress IPs).
4. **Connect → Drivers** → copy the connection string, e.g.
   `mongodb+srv://USER:PASS@cluster0.xxxx.mongodb.net/quickserve?retryWrites=true&w=majority`
   (add `/quickserve` as the db name before the `?`).

Keep this string — it's `MONGODB_URI`.

---

## 2. Render (API)

The repo ships a **`render.yaml`** blueprint that builds `server/Dockerfile`.

1. Render → **New + → Blueprint** → pick this GitHub repo → apply.
   (Or **New + → Web Service → Docker**, root `server/`, Dockerfile `./server/Dockerfile`.)
2. Set the two secret env vars (the blueprint marks them `sync:false`):
   - **`MONGODB_URI`** = the Atlas string from step 1.
   - **`CLIENT_ORIGIN`** = your Vercel URL (fill in after step 3; use a placeholder first, then update).
   - `JWT_SECRET` is auto-generated; `PORT=4000`, `NODE_ENV=production`, `JWT_EXPIRES_IN=7d` are preset.
3. Deploy. Health check is `GET /health`. On first boot the API **auto-seeds** the DB
   (default users + demo data) — idempotent, so restarts won't duplicate.
4. Note the service URL, e.g. `https://quickserve-api.onrender.com` — that's your **API URL**.

> Free Render services sleep when idle; the first request after a while is slow (cold start).

---

## 3. Vercel (web)

Vercel auto-detects Next.js (a minimal `vercel.json` is included).

1. Vercel → **Add New → Project** → import this repo → **root directory = repo root**.
2. Add **Environment Variables** (Production):

   | Key | Value |
   |-----|-------|
   | `NEXT_PUBLIC_API_URL` | your Render API URL (e.g. `https://quickserve-api.onrender.com`) |
   | `API_URL` | same Render API URL (used server-side by NextAuth) |
   | `NEXTAUTH_URL` | your Vercel URL (e.g. `https://quickserve-admin.vercel.app`) |
   | `NEXTAUTH_SECRET` | `openssl rand -base64 32` |
   | `AUTH_SECRET` | same as `NEXTAUTH_SECRET` |

   > `NEXT_PUBLIC_API_URL` is **baked at build time** — changing it later needs a redeploy.

3. Deploy. Copy the production URL.
4. **Back in Render**, set `CLIENT_ORIGIN` to that Vercel URL (comma-separate if you also
   want preview URLs) and redeploy the API — this is what CORS allows.

---

## 4. Verify

1. Open the Vercel URL → you should hit the login screen.
2. Sign in with the seeded super-admin: **`admin@quickserve.io` / `admin123`**
   (also `manager@quickserve.io / manager123`, `support@quickserve.io / support123`).
3. Load Bookings / Services / Categories — data comes from Render → Atlas, and CRUD persists.

**⚠️ Change the seeded passwords** (or seeding logic) before any real use.

---

## Gotchas

- **CORS 4xx** → `CLIENT_ORIGIN` on Render must exactly match the Vercel origin (scheme + host, no trailing slash).
- **401 right after login** → `JWT_SECRET` changed between token issue and verify; log in again. The web app self-heals 401s by bouncing to `/login`.
- **Auth calls fail server-side** → `API_URL` must be set on Vercel (NextAuth runs server-side and can't use the browser's localhost default).
- **Local full stack** → `docker compose up --build` runs Mongo + API + web together (see `docker-compose.yml`).
