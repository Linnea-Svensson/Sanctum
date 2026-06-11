# @sanctum/api

FeathersJS v5 (Koa + Knex/SQLite) backend for Sanctum.

## Setup

```bash
# from the repo root
npm install
cp apps/api/.env.example apps/api/.env   # then edit the values
```

`.env` holds local secrets and is gitignored:

| Variable               | Purpose                                              |
| ---------------------- | ---------------------------------------------------- |
| `PORT`                 | Port the API listens on (default `3030`)             |
| `FEATHERS_AUTH_SECRET` | Secret used to sign JWTs                              |
| `ADMIN_EMAIL`          | Email of the admin user created by `seed:admin`      |
| `ADMIN_PASSWORD`       | Password of that admin user (hashed before storage)  |

## Scripts

Run from the repo root with `-w @sanctum/api`, or from `apps/api/`.

```bash
npm run dev -w @sanctum/api         # start the API with hot reload (tsx watch)
npm run seed:admin -w @sanctum/api  # create/update the admin user from .env
npm run build -w @sanctum/api       # typecheck + compile to lib/
npm start -w @sanctum/api           # run the compiled build
```

The SQLite database is created on first boot at `apps/api/data/sanctum.sqlite`.

## Authentication

Local (email + password) and JWT strategies are enabled. Log in:

```bash
curl -X POST http://localhost:3030/authentication \
  -H 'Content-Type: application/json' \
  -d '{"strategy":"local","email":"admin@sanctum.local","password":"<ADMIN_PASSWORD>"}'
```

The response contains an `accessToken`. Send it as `Authorization: Bearer <token>`
to call the protected `users` service.
