# SIOS Server

Express + Prisma API backed by Supabase Postgres, deployed to Vercel alongside the React client.

Each teammate develops against **their own free Supabase project**. You never need anyone else's database password, and you can migrate or reset your database without affecting the team.

**Contents:** [Setup](#first-time-setup) · [How it fits together](#how-it-fits-together) · [Auth](#authentication) · [Password reset](#password-reset) · [Database & migrations](#database--migrations) · [Deployment](#deployment-vercel) · [Secrets](#secrets) · [Conventions](#conventions) · [Troubleshooting](#troubleshooting)

---

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
| `DATABASE_URL` | **Transaction pooler** connection string (port `6543`). Add `?pgbouncer=true` to the end. Used by the app at runtime. |
| `DIRECT_URL` | **Session pooler** connection string (port `5432`). Used by the Prisma CLI — migrations need a session connection. |
| `JWT_SECRET` | Generate your own — it doesn't need to match anyone else's: `node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"` |
| `APP_URL` | Optional locally. The client's URL, used in password reset links. Defaults to `http://localhost:5173`. |
| `RESEND_API_KEY` | Optional. A Resend **sending-only** key. Without it, emails are just printed to the terminal. See [Email](#email-resend). |
| `EMAIL_FROM` | Optional. Sender address; defaults to Resend's test sender `onboarding@resend.dev`. |

Replace `[YOUR-PASSWORD]` in both URLs with your database password.

### 3. Install, migrate, seed

```bash
npm install                 # also generates the Prisma client (postinstall runs `prisma generate`)
npx prisma migrate deploy   # builds the tables in your database
npx prisma db seed          # adds test accounts
```

Test account emails and their shared password are in `prisma/seed.ts` (one each of `ACTIVE` staff, `ACTIVE` parent, `PENDING`, and `INACTIVE`).

### 4. Run it

```bash
npm run dev                 # in server/ — API on http://localhost:3000, restarts on save
```

Then, in a second terminal:

```bash
cd ../client && npm install && npm run dev   # app on http://localhost:5173
```

Open **http://localhost:5173**. The Vite dev server forwards `/api/*` to `localhost:3000`, so the client and API behave as one site — the same way Vercel serves them.

---

## How it fits together

```
Browser ──► localhost:5173 (Vite)  ──/api/*──►  localhost:3000 (Express)  ──►  Supabase Postgres
            (Vercel: client service)            (Vercel: server service)
```

**Every route lives under `/api`** (e.g. `POST /api/login`, not `POST /login`). On Vercel, `vercel.json` sends `/api/*` to the server service and everything else to the client.

### Server layout (MVC)

| Folder | Job | Rule of thumb |
|---|---|---|
| `src/router/` | Maps URLs to controller functions | No logic |
| `src/controllers/` | HTTP only: read the request, call the model, pick status codes, set cookies, send JSON | No database access, no business rules |
| `src/models/` | Business rules + database access (Prisma). Returns plain results like `{ ok: false, reason: "INACTIVE" }` | Never touches `req`/`res` |
| `src/auth/` | Small wrappers: argon2 (`password.ts`), JWT + cookie settings (`session.ts`), reset tokens (`resetToken.ts`) | Called by models |
| `src/mail/` | The one place email is sent (`mailer.ts`) | — |
| `src/middleware/` | 404 + error handler | — |
| `src/generated/` | Prisma client, **generated — never edit, gitignored** | Rebuilt by `npm install` / `npx prisma generate` |

`src/index.ts` exports the Express app (Vercel uses the default export) and only calls `app.listen` locally.

---

## Authentication

- **Passwords** are hashed with argon2 (`src/auth/password.ts`). Plain passwords are never stored or logged.
- **Sessions** are an 8-hour signed JWT stored in an **httpOnly cookie** named `sios_session`. Page JavaScript can't read it, so client code never touches it — the browser stores and sends it automatically.
- The client must call the API with `credentials: "include"` (already done in `client/src/api/api.ts`), or the browser drops the cookie.
- Only `ACTIVE` accounts can sign in. Login returns the same error for "no such email" and "wrong password" so it can't be used to discover which emails exist.

| Endpoint | What it does |
|---|---|
| `POST /api/login` | Checks credentials, sets the session cookie, returns `{ account }` |
| `GET /api/login/session` | Returns the signed-in account from the cookie (used to stay signed in across page refreshes), or 401 |
| `POST /api/login/logout` | Clears the cookie |
| `POST /api/password/forgot` | Emails a reset link (see below) |
| `POST /api/password/reset` | Sets a new password from a reset link |

**Every session check re-reads the account from the database**, so deactivating an account cuts off access immediately, even if its cookie hasn't expired. Sessions issued **before the last password change** are rejected (`Account.passwordChangedAt`), which is how a reset signs out other devices.

**JWT caveat:** logout clears the cookie, but a copied token would stay valid until it expires. The database checks above limit the damage; true server-side session revocation would need a `Session` table.

---

## Password reset

1. `POST /api/password/forgot` with an email. If it belongs to an `ACTIVE` account, a one-time link is created and emailed. **The response is identical either way** — never change that.
2. The link (`APP_URL/reset-password?token=...`) opens the client's reset page, which calls `POST /api/password/reset`.

Details:

- Links expire after **30 minutes** and work **once**. Requesting a new link invalidates older ones.
- Only a **SHA-256 hash** of the token is stored (`password_reset_tokens` table), so a database leak can't be used to reset passwords.
- At most **one email per account every 2 minutes**, so the form can't flood an inbox. This is stored in the database — an in-memory rate limiter wouldn't work on Vercel.
- New passwords must be at least **8 characters** (`MIN_PASSWORD_LENGTH`, mirrored in `client/src/views/Forgotpassreset.tsx`).

### Email (Resend)

All email goes through `src/mail/mailer.ts`, which uses [Resend](https://resend.com):

| | `RESEND_API_KEY` set | Not set |
|---|---|---|
| **Development** | Printed to the `npm run dev` terminal **and** sent via Resend | Printed only |
| **Production** | Sent via Resend | Nothing sent (warning logged) |

Production **never prints email** — reset links in logs would let anyone with log access take over accounts. `sendEmail` never throws: a failed send is logged (reason only, never the body) and the forgot-password response stays identical.

**Until the client's domain is verified in Resend**, the sender is Resend's test address `onboarding@resend.dev`, which **only delivers to the Resend account owner's email**. Everyone else (including the `@sios.test` seed accounts) gets rejected — use the printed dev copy instead. To send to anyone:

1. Add the client's domain (ideally a subdomain like `mail.<their-domain>`) in the Resend dashboard and add its DNS records (SPF, DKIM, plus a DMARC record). This needs whoever manages the client's DNS — ask early.
2. Set `EMAIL_FROM="SIOS <no-reply@mail.<their-domain>>"`.
3. Create a new **sending-only** key restricted to that domain and put it in `RESEND_API_KEY` (locally and on Vercel).

Keys: always use a **sending-only** key, never paste keys into chat or commit them, and create the production account under the **client's** organisation email so it survives handoff. Remember to set `APP_URL` on Vercel or links will point at localhost.

---

## Database & migrations

### Changing the schema

1. **Pull `main` first** so you have everyone's latest migrations.
2. Edit `prisma/schema.prisma`.
3. Create and apply a migration to **your** database:
   ```bash
   npx prisma migrate dev --name short_description_of_change
   ```
   While you're still experimenting, `npx prisma db push` syncs your database to the schema without making a migration. Run `migrate dev` once you're happy; only migrations reach other databases.
4. **Add RLS for any new table** to the generated `migration.sql` (see below).
5. Commit **both** `schema.prisma` and the new folder in `prisma/migrations/`.

When you pull someone else's schema change, run `npx prisma migrate deploy` (or `migrate dev`) to apply it to your database.

### Every new table needs row-level security

Supabase exposes tables in the `public` schema through its auto-generated Data API. **`main` auto-deploys to our public Vercel dev app**, so a table without RLS could be readable by anyone with the project URL. Every migration that creates a table must end with:

```sql
ALTER TABLE "your_table_name" ENABLE ROW LEVEL SECURITY;
```

No policies are needed: the server connects as the table owner, which RLS doesn't apply to. RLS with no policies simply blocks the Data API. See `20261020175715_enable_rls` and `20261024181001_password_reset` for examples.

### How `migrate dev` works (and why it can fail)

`migrate dev` creates a temporary empty **shadow database**, replays **every** migration into it from scratch, compares the result with `schema.prisma` to work out the new migration, then deletes it. So every migration must run cleanly on an **empty** database, not just on yours.

### History: the `enable_rls` edit (2026-10-26)

`20261020175715_enable_rls` originally ran `ALTER TABLE "_prisma_migrations" ...` unconditionally. That table doesn't exist in the shadow database, so `migrate dev` failed for everyone with `relation "_prisma_migrations" does not exist`. The line is now wrapped in an existence check.

`migrate deploy` (Vercel, shared database) accepts the edited file without re-running anything. Personal databases created before the edit will report the migration "was modified after it was applied": run `npx prisma migrate reset` once on **your own** database, then `npx prisma db seed`. **Never reset the shared/Vercel database.**

### Rules

- **Never edit or delete a migration folder that's been pushed.** Fix mistakes with a new migration. (The [`enable_rls` edit](#history-the-enable_rls-edit-2026-10-26) was a deliberate, one-time exception.)
- **`migrate dev` and `migrate reset` are for your own database only.** They can wipe data.
- **The shared / Vercel database only ever gets `npx prisma migrate deploy`**, which applies pending migrations and never deletes anything.
- If a merge brings in migrations from two branches, apply them to your database after merging and check `npx prisma migrate status`.
- Run `npx prisma generate` after any schema change (or `npm install`) so the TypeScript types match.
- AI coding agents: Prisma refuses to run `migrate reset` when it detects one. Run destructive commands yourself.

---

## Deployment (Vercel)

- **Pushing to `main` auto-deploys** to the public dev app. Treat `main` as public: real security settings, no debug shortcuts.
- `vercel.json` (repo root) defines two services — `client` (Vite) and `server` (Express) — and routes `/api/*` to the server. Because both are on one domain, the session cookie works without cross-site cookie settings.
- **Migrations run automatically on production builds only.** The server's `build` script (`scripts/migrate-on-deploy.mjs`) runs `prisma migrate deploy` when `VERCEL_ENV=production`. Preview deploys of branches never touch the schema. If a migration fails, the deploy is aborted.
- **Environment variables on Vercel:** the Supabase integration provides `POSTGRES_PRISMA_URL` and `POSTGRES_URL_NON_POOLING`, which the server uses when `DATABASE_URL` / `DIRECT_URL` aren't set. Add `JWT_SECRET`, `APP_URL`, `RESEND_API_KEY`, and `EMAIL_FROM` by hand.
- `NODE_ENV=production` on Vercel turns on the cookie's `secure` flag (HTTPS only) and turns off email printing.
- Serverless means **no in-memory state between requests** (each request may hit a different instance). Anything that must persist — rate limits, throttles, sessions — goes in the database.
- `src/db.ts` adds `uselibpqcompat=true` to the connection string because Vercel's integration URLs use `sslmode=require`, which the `pg` driver otherwise treats as strict certificate verification and rejects Supabase's CA.

---

## Secrets

> Every service, key, and DNS record is tracked in [`docs/SERVICES.md`](../docs/SERVICES.md). Update it whenever you add or change one.

- **Never commit `.env`** (it's gitignored — keep it that way). On old branches where `server/.gitignore` isn't tracked, `.env` **isn't ignored** — don't `git add .` there.
- **Never paste connection strings or passwords** into Discord, GroupMe, texts, email, or screenshots.
- If you need to send a secret to a teammate, use a one-time link from a password manager (e.g. Bitwarden Send).
- If a secret leaks, reset it right away: Supabase dashboard → **Project Settings → Database → Reset database password**, then update your `.env` (and Vercel, if it was the shared one).
- `JWT_SECRET` doesn't need sharing — each environment has its own. Changing it signs everyone out of that environment.
- **Only fake data in development.** Never put real scholar or family information in your personal project or the dev app.

---

## Conventions

- **async/await with `try`/`catch`/`finally`** — no `.then()` / `.catch()` / `.finally()` chains.
- **No deprecated APIs or types** (e.g. React's `SubmitEvent`, not the deprecated `FormEvent`).
- **Server is the only gatekeeper.** The client may hide buttons, but every permission check happens in the API.
- **Never reveal whether an email has an account** — login and forgot-password responses must stay identical for both cases.
- **UI copy uses the client's words:** scholar/student (not kid), youth engagement leader (not teacher), site (not location).

---

## Troubleshooting

| Problem | Fix |
|---|---|
| `npm install` fails: `src\generated\prisma exists and is not empty but doesn't look like a generated Prisma Client` | Usually left over from switching branches. Delete `src/generated` and run `npm install` again — it's gitignored and fully regenerated. |
| `npm install` / `npm run dev` fails with missing `prisma/schema.prisma`, `nodemon.json`, or `src/index.ts` | You're on a branch that predates the backend. `git branch --show-current`; switch to `main` or merge `main` into your branch. |
| `npm run dev` crashes right away | Check the Prisma client exists (`npx prisma generate`) and that `.env` is filled in. |
| Native module errors from `argon2` after changing Node versions | `npm rebuild argon2` (or delete `node_modules` and `npm install`). |
| Can't connect / timeouts | Free Supabase projects **pause after ~1 week of inactivity**. Open the project in the dashboard and click **Restore**. |
| `DATABASE_URL is not set` / `DIRECT_URL is not set` | You're missing `.env`, or running from the wrong folder — commands run from `server/`. |
| `JWT_SECRET must be set...` | Add a `JWT_SECRET` to `.env` (see setup step 2). |
| `404 Not found: POST /login` | Routes are under `/api` — use `/api/login`. |
| `migrate dev` fails: `relation "_prisma_migrations" does not exist` | You have an old copy of `enable_rls`. Pull `main`. |
| `migrate dev` says a migration "was modified after it was applied" | Someone changed a pushed migration (e.g. the `enable_rls` fix). On **your own** database: `npx prisma migrate reset`, then re-seed. Never on the shared one. |
| Login says wrong password for test accounts | Someone changed the password in `prisma/seed.ts` — rerun `npx prisma db seed`. |
| Prisma types missing / `Cannot find module '../generated/prisma'` | Run `npx prisma generate`. |
| Signed in, but refresh logs you out | The client must use `credentials: "include"`, and should call `/api/...` on its own origin (leave `VITE_API_URL` unset) so the cookie isn't treated as cross-site. |
| Can't find the password reset email | In development it's always printed in the `npm run dev` terminal. Resend's test sender only delivers to the Resend account owner until a domain is verified. |
| `Resend rejected ... validation_error: You can only send testing emails to your own email address` | Expected until the client's domain is verified — see [Email](#email-resend). |
| Port 3000 already in use | Another `npm run dev` is still running. Stop it (or find it with `netstat -ano \| findstr :3000`). |
