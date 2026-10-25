# SIOS — Student Impact & Outcomes System

| Folder        | What it is                                                            |
| ------------- | --------------------------------------------------------------------- |
| `client/`     | React + Vite + Material UI front end                                  |
| `server/`     | Express + Prisma API on Supabase Postgres                             |
| `vercel.json` | Deploys both as one site: `/api/*` → server, everything else → client |

## Getting started

**Read [`server/README.md`](server/README.md)** for development, and **[`docs/SERVICES.md`](docs/SERVICES.md)** for every outside service, key, and DNS record (keep it updated).

The server README covers setup, running the app locally, authentication, the database and migration workflow, deployment, secrets, conventions, and troubleshooting.

Quick version, once your `server/.env` is set up:

```bash
cd server && npm install && npm run dev     # API  → http://localhost:3000
cd client && npm install && npm run dev     # App  → http://localhost:5173  (open this one)
```

`main` auto-deploys to the public dev app on Vercel — treat it as public.
