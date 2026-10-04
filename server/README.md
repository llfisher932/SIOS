# SIOS Server

Express + Prisma API backed by Supabase Postgres.

Each teammate develops against **their own free Supabase project**. You never need anyone else's database password, and you can migrate or reset your database without affecting the team.

## First-time setup

### 1. Create your Supabase project

1. Sign in at [supabase.com](https://supabase.com) and create a new project.
   - **Region:** East US (North Virginia) — `us-east-1`, so everyone's setup matches.
   - **Database password:** use the generate button and save it in your password manager.
2. Wait for the project to finish provisioning.

### 2. Create your `.env`

```bash
cp .env.example .env
```

In your Supabase project, click **Connect** (top of the dashboard) and fill in `.env`:

| Variable | Where to get it |
|---|---|
| `DATABASE_URL` | **Transaction pooler** connection string (port `6543`). Add `?pgbouncer=true` to the end. |
| `DIRECT_URL` | **Session pooler** connection string (port `5432`). |
| `JWT_SECRET` | Generate your own — it doesn't need to match anyone else's: `node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"` |

Replace `[YOUR-PASSWORD]` in both URLs with your database password.

### 3. Install, migrate, seed

```bash
npm install                 # also generates the Prisma client
npx prisma migrate dev      # builds the tables in your database
npx prisma db seed          # adds test accounts
```

Test account emails and their shared password are in `prisma/seed.ts`.

### 4. Run it

```bash
npm run dev
```

The server runs at `http://localhost:3000` and restarts when you save a file.

## Changing the database schema

1. **Pull `main` first** so you have everyone's latest migrations.
2. Edit `prisma/schema.prisma`.
3. Create and apply a migration to **your** database:
   ```bash
   npx prisma migrate dev --name short_description_of_change
   ```
4. Commit **both** `schema.prisma` and the new folder in `prisma/migrations/`.

When you pull someone else's schema change, run `npx prisma migrate dev` to apply it to your database.

### Rules

- **Never edit or delete a migration folder that's been pushed.** Fix mistakes with a new migration.
- **`migrate dev` is for your own database only.** It can offer to reset (wipe) a database — that's fine for yours, never for the shared one.
- **The shared demo database only ever gets `npx prisma migrate deploy`**, which applies pending migrations and never deletes anything.
- If a merge brings in migrations from two branches, run `npx prisma migrate dev` after merging to confirm everything applies cleanly.

## Secrets

- **Never commit `.env`** (it's gitignored — keep it that way).
- **Never paste connection strings or passwords** into Discord, GroupMe, texts, email, or screenshots.
- If you need to send a secret to a teammate, use a one-time link from a password manager (e.g. Bitwarden Send).
- If a secret leaks, reset it right away: Supabase dashboard → **Project Settings → Database → Reset database password**, then update your `.env`.
- **Only fake data in development.** Never put real scholar or family information in your personal project.

## Troubleshooting

| Problem | Fix |
|---|---|
| Can't connect / timeouts | Free projects **pause after ~1 week of inactivity**. Open your project in the dashboard and click **Restore**. |
| `DATABASE_URL is not set` | You're missing `.env`, or running from the wrong folder — commands run from `server/`. |
| `JWT_SECRET must be set...` | Add a `JWT_SECRET` to `.env` (see step 2). |
| Login says wrong password for test accounts | Someone changed the password in `prisma/seed.ts` — rerun `npx prisma db seed`. |
| Prisma types missing / `Cannot find module '../generated/prisma'` | Run `npx prisma generate`. |
| `migrate dev` wants to reset your database | Fine on **your own** project — say yes, then rerun the seed. |
