# @sanctum/api

FeathersJS v5 (Koa + Knex/SQLite) backend for Sanctum.

## Setup

```bash
# from the repo root
npm install
cp apps/backend/.env.example apps/backend/.env   # then edit the values
```

`.env` holds local secrets and is gitignored:

| Variable               | Purpose                                              |
| ---------------------- | ---------------------------------------------------- |
| `PORT`                 | Port the API listens on (default `3030`)             |
| `FEATHERS_AUTH_SECRET` | Secret used to sign JWTs                              |
| `ADMIN_EMAIL`          | Email of the admin user created by `seed:admin`      |
| `ADMIN_PASSWORD`       | Password of that admin user (hashed before storage)  |
| `HOST`                 | Interface to bind (use `0.0.0.0` in production)      |
| `DATABASE_FILE`        | Path to the SQLite file (point at a mounted volume)  |

## Scripts

Run from the repo root with `-w @sanctum/api`, or from `apps/backend/`.

```bash
npm run dev -w @sanctum/api         # start the API with hot reload (tsx watch)
npm run seed:admin -w @sanctum/api  # create/update the admin user from .env
npm run build -w @sanctum/api       # typecheck + compile to lib/
npm start -w @sanctum/api           # run the compiled build
```

The SQLite database is created on first boot at `apps/backend/data/sanctum.sqlite`.

## Authentication

Local (email + password) and JWT strategies are enabled. Log in:

```bash
curl -X POST http://localhost:3030/authentication \
  -H 'Content-Type: application/json' \
  -d '{"strategy":"local","email":"admin@sanctum.local","password":"<ADMIN_PASSWORD>"}'
```

The response contains an `accessToken`. Send it as `Authorization: Bearer <token>`
to call the protected `users` service.

## Deploying to Railway

This service is a long-running Node server with a SQLite file — it cannot run on
Vercel (the frontend lives there). Deploy `apps/backend` to Railway instead.

1. **New Project → Deploy from GitHub repo**, then in the service settings set
   **Root Directory** to `apps/backend`. `railway.json` supplies the build/start
   commands (`npm install && npm run build`, then `npm run start`).
2. Add a **Volume** mounted at e.g. `/data` so the SQLite file survives redeploys.
   Without this, the database (and the admin user) is wiped on every deploy.
3. Set the service **Variables**:

   | Variable               | Value                                             |
   | ---------------------- | ------------------------------------------------- |
   | `HOST`                 | `0.0.0.0`                                          |
   | `FEATHERS_AUTH_SECRET` | a long random string                              |
   | `DATABASE_FILE`        | `/data/sanctum.sqlite` (inside the mounted volume)|
   | `ADMIN_EMAIL`          | your admin email                                  |
   | `ADMIN_PASSWORD`       | a strong password                                 |

   (`PORT` is provided by Railway automatically — don't set it.)
4. After the first deploy, seed the admin user once. Easiest via the Railway
   shell on the service: `npm run seed:admin`.
5. Copy the service's public HTTPS URL and set it as `VITE_API_URL` in the
   **Vercel** project (frontend), then redeploy the frontend.

CORS is locked to the origins in `config/default.json` — the production domain
`https://www.sanctumkiropraktik.se` is already listed there.
