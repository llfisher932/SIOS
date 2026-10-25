# SIOS — Services, Keys & Domain Setup

The running record of **every outside service, account, secret, and DNS record** SIOS depends on: what each one is for, where it's set, and how to replace it. Keep it current — **update this file in the same commit as any change to a key, service, or DNS record.** It is part of the handoff to Team Nitro.

> **This file never contains actual secret values.** Values live only in: each developer's `server/.env` (gitignored), Vercel's environment variable settings, and the team's password manager. Never paste keys into chat, Discord, email, screenshots, or this file.

_Last updated: 2026-10-24_

---

## At a glance

| Service                       | What it does, in plain English                                       | Account owner (now → at handoff)            | Status                             |
| ----------------------------- | -------------------------------------------------------------------- | ------------------------------------------- | ---------------------------------- |
| **Vercel**                    | Hosts the app — the website people visit and the server behind it    | Student team → **Team Nitro**               | ✅ Live (dev app)                  |
| **Supabase**                  | The database — where accounts and (later) scholar records are stored | Student team → **Team Nitro**               | ✅ Live                            |
| **Resend**                    | Sends the app's emails (password resets, later alerts)               | Student (llfisher932) → **Team Nitro**      | ⚠️ Test mode — domain not verified |
| **teamnitromma.com** (domain) | Team Nitro's web address. SIOS uses `sios.` and `mail.` subdomains   | **Team Nitro** (already)                    | ⏳ DNS records not added yet       |
| **GitHub**                    | Stores the code                                                      | Student (llfisher932/SIOS) → **Team Nitro** | ✅                                 |

---

## Every setting the app uses

**Secret = yes** means treat it like a password.

### Server (`server/.env` locally, Vercel → Settings → Environment Variables in production)

| Name                             | Secret?                        | What it's for                                                                   | Local                                               | Vercel (Production)                                                       |
| -------------------------------- | ------------------------------ | ------------------------------------------------------------------------------- | --------------------------------------------------- | ------------------------------------------------------------------------- |
| `DATABASE_URL`                   | **Yes** (contains DB password) | How the app connects to the database while running                              | Set by hand from your Supabase project              | Not needed — Vercel's Supabase integration provides `POSTGRES_PRISMA_URL` |
| `DIRECT_URL`                     | **Yes** (contains DB password) | How database updates (migrations) connect                                       | Set by hand from your Supabase project              | Not needed — integration provides `POSTGRES_URL_NON_POOLING`              |
| `POSTGRES_PRISMA_URL`            | **Yes**                        | Same as `DATABASE_URL`, provided automatically by Vercel's Supabase integration | —                                                   | Automatic                                                                 |
| `POSTGRES_URL_NON_POOLING`       | **Yes**                        | Same as `DIRECT_URL`, provided automatically                                    | —                                                   | Automatic                                                                 |
| `JWT_SECRET`                     | **Yes**                        | Signs the "you're signed in" cookie so it can't be forged                       | Generate your own                                   | Set by hand (different from anyone's local one)                           |
| `RESEND_API_KEY`                 | **Yes**                        | Lets the app send email through Resend                                          | Optional (without it, emails print to the terminal) | Set by hand                                                               |
| `EMAIL_FROM`                     | No                             | The sender name/address on emails                                               | Optional                                            | Set by hand, **only after the domain is verified in Resend**              |
| `APP_URL`                        | No                             | The app's public address, used in emailed links                                 | Optional (defaults to `http://localhost:5173`)      | Set by hand                                                               |
| `NODE_ENV`, `VERCEL_ENV`, `PORT` | No                             | Tell the app where it's running                                                 | Automatic                                           | Automatic — don't set                                                     |

### Client (`client/.env` locally)

| Name           | Secret? | What it's for                                                                           |
| -------------- | ------- | --------------------------------------------------------------------------------------- |
| `VITE_API_URL` | No      | Only if the client must call a server on a different address. **Normally leave unset.** |

> Anything starting with `VITE_` is visible to anyone using the website. **Never put a secret in a `VITE_` variable.**

---

## Service details

### 1. Vercel — hosting

**What it is (plain English):** the company that runs the SIOS website and server on the internet. When someone visits the app, Vercel serves it.

**How it's set up**

- One Vercel project, configured by `vercel.json` at the repo root: the `client` service (the website) and the `server` service (the API). `/api/*` goes to the server, everything else to the website.
- **Pushing to `main` deploys to production automatically.** Production builds also apply database updates (`server/scripts/migrate-on-deploy.mjs`).
- Supabase is connected through Vercel's **Supabase integration**, which supplies the database settings automatically.
- Custom address: **`sios.teamnitromma.com`** (added in Settings → Domains; needs the `sios` DNS record below).

**Keys:** no Vercel API key is used by the app. Access is by Vercel account login.

**Changing a setting:** Settings → Environment Variables → edit → then **redeploy** (Deployments → latest → ⋯ → Redeploy). Settings only take effect on the next deploy.

**Handoff:** transfer the project to a Vercel account/team owned by Team Nitro (Project Settings → Transfer), or have Team Nitro create the team now and invite the students. Re-check the `sios` DNS record afterwards — Vercel may show a new value.

---

### 2. Supabase — database

**What it is:** the database. It stores every account, and in Phase 1 will store scholar profiles and document records. **The most sensitive service SIOS uses.**

**How it's set up**

- Region: East US (`us-east-1`).
- Each developer has their **own free Supabase project** for development (see `server/README.md`). The Vercel app uses a **separate** project.
- Every table has **row-level security** enabled so Supabase's built-in public API can't read it (see `server/README.md` → "Every new table needs row-level security").

**Keys / secrets**

- The **database password**, embedded in `DATABASE_URL` and `DIRECT_URL`.
- Find connection strings: Supabase dashboard → project → **Connect**.
- **Replace if leaked:** Project Settings → Database → **Reset database password**, then update every `.env` and Vercel (if the integration doesn't update it automatically, redeploy after updating).

**Free-tier note:** free projects pause after ~1 week of inactivity — open the dashboard and click **Restore**.

**Handoff:** the production project must be owned by a Team Nitro organization. Supabase supports transferring a project to another organization (Project Settings → General → Transfer project) — invite a Team Nitro owner to the org first.

---

### 3. `JWT_SECRET` — sign-in security

**What it is:** a long random password that only the server knows. It's used to sign the "you're signed in" cookie, so nobody can fake being signed in.

**How to create one**

```bash
node -e "console.log(require('crypto').randomBytes(48).toString('base64url'))"
```

**Rules:** at least 32 characters; each environment has its own (local, Vercel); never shared between people.

**Replacing it:** set a new value and redeploy. **Everyone gets signed out** of that environment — harmless, they just sign in again. Do this if it ever leaks.

---

### 4. Resend — email

**What it is:** the service that actually delivers the app's emails (password reset links today; application updates and alerts later).

**How it's set up**

- Code: `server/src/mail/mailer.ts` (the only file that sends email).
- In development, emails are also printed to the server terminal. In production, never printed.
- **Current state:** using Resend's **test sender** (`onboarding@resend.dev`), which only delivers to the Resend account owner's email. **Password reset emails don't reach anyone else until `mail.teamnitromma.com` is verified.**

**Keys**

- `RESEND_API_KEY` — always a **sending-only** key (it can send email but can't change the account). Create in Resend → **API Keys** → Create → permission **Sending access**, restricted to the verified domain once there is one.
- **Replace if leaked:** create a new key, update `.env` and Vercel, redeploy, then **delete the old key** in Resend.

**Handoff — ⚠️ do this before sending the DNS email:** the Resend account should be created with a **Team Nitro organization email** (e.g. a shared `sios@teamnitromma.com`), with students invited as members. If the domain is added under a student's account and later moved, Resend generates a new signing key and Team Nitro's DNS person has to add a record again.

---

### 5. Domain & DNS — `teamnitromma.com`

**What it is (plain English):** `teamnitromma.com` is Team Nitro's web address. **DNS** is the settings page for that address — it says where the website lives, where email goes, and which outside services may act on the domain's behalf. SIOS needs a few **new** entries there so that (1) the app can live at `sios.teamnitromma.com` and (2) Resend may send email as `mail.teamnitromma.com`.

**Why subdomains (`sios.`, `mail.`):** Team Nitro's website and staff email run on the main domain. Using subdomains means **SIOS never changes any existing setting** — their website and inboxes can't be affected, and SIOS email reputation is kept separate from their everyday email.

**Where things are**

|                         |                                                                                                                              |
| ----------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Registered at           | Register.com (Network Solutions). Registered 2017, **paid through 2029-06-30**                                               |
| DNS managed at          | **HostPapa** (nameservers `ns1/ns2.websiteservername.com`) → cPanel → **Zone Editor**                                        |
| Website & staff email   | Also on HostPapa — **do not edit existing records**                                                                          |
| Existing email security | SPF and DMARC (`p=none`) already on the main domain; DMARC covers subdomains automatically, so no new DMARC record is needed |

**Records SIOS needs** (all **new**, added in HostPapa → cPanel → Zone Editor → teamnitromma.com)

| Type  | Name                     | Value                                                                    | Purpose                                   | Source                                     |
| ----- | ------------------------ | ------------------------------------------------------------------------ | ----------------------------------------- | ------------------------------------------ |
| TXT   | `resend._domainkey.mail` | DKIM key from Resend (starts `p=MIGf…`)                                  | Proves emails really come from Team Nitro | Resend → Domains → `mail.teamnitromma.com` |
| CNAME | `rsend.mail`             | `rsend.forge.rmta.net`                                                   | Lets Resend send for the subdomain        | Resend                                     |
| CNAME | `send.mail`              | `send.forge.rmta.net`                                                    | Lets Resend send and handle bounces       | Resend                                     |
| CNAME | `sios`                   | value shown in Vercel (currently `7da3d909845b59c3.vercel-dns-017.com.`) | Points `sios.teamnitromma.com` at the app | Vercel → Settings → Domains                |

> ⚠️ The DKIM value **belongs to whichever Resend account added the domain**. The values collected on 2026-10-24 came from the student-owned account. If the domain is (re-)added under the Team Nitro account, **use the new values from that account** — copy them fresh from Resend, don't reuse this table blindly. Always copy full values with the copy buttons; the dashboard shortens them on screen.

**Status:** ⏳ not yet sent to Team Nitro (waiting on the Team Nitro-owned Resend account — see Resend above).

**After the records are added**

1. Vercel → Settings → Domains → **Refresh** on `sios.teamnitromma.com` (should turn green; HTTPS is automatic).
2. Resend → Domains → `mail.teamnitromma.com` → **Verify** (can take minutes to a day).
3. Vercel → Environment Variables (Production): `APP_URL=https://sios.teamnitromma.com`, `EMAIL_FROM=SIOS <no-reply@mail.teamnitromma.com>` → redeploy.
4. Test: request a password reset at `https://sios.teamnitromma.com/forgot-password`.

**Check a record yourself**

```bash
nslookup -type=CNAME send.mail.teamnitromma.com 8.8.8.8
nslookup -type=TXT resend._domainkey.mail.teamnitromma.com 8.8.8.8
nslookup -type=CNAME sios.teamnitromma.com 8.8.8.8
```

**Message template for Team Nitro's HostPapa person**

> **Subject: 10-minute website setting for the SIOS system**
>
> Whoever manages your HostPapa account: please log in, go to **cPanel → Zone Editor**, choose **teamnitromma.com**, and **add** the records below. Please don't change or delete anything already there — your website and current email won't be affected.
>
> _[paste the 4-row table with current values]_
>
> Paste the long TXT value as a single line, and leave TTL on its default. Let us know once it's done and we'll confirm it's working.

---

### 6. GitHub — code

**What it is:** where the code is stored and versioned. Vercel deploys from it.

- Repository: `llfisher932/SIOS` (student-owned).
- **Handoff:** transfer the repository to a Team Nitro GitHub account or organization (Settings → Danger Zone → Transfer). Reconnect Vercel to the new location if prompted.

---

## Handoff checklist

Everything Team Nitro needs to own SIOS without the student team:

- [ ] Shared Team Nitro email for services (e.g. `sios@teamnitromma.com`) created
- [ ] **Resend** account owned by Team Nitro; domain verified there; students removed
- [ ] **Vercel** project owned by a Team Nitro account/team; env vars present; students removed
- [ ] **Supabase** production project owned by a Team Nitro organization; students removed
- [ ] **GitHub** repo transferred to Team Nitro
- [ ] **DNS** records verified (Vercel green, Resend verified)
- [ ] All keys **rotated** after handoff (new `RESEND_API_KEY`, new `JWT_SECRET`, new database password) so no former team member holds a working key
- [ ] Team Nitro has every login stored in **their** password manager
- [ ] This file reviewed with Team Nitro and updated to reflect final owners

---

## Change log

Add a line whenever a key, service, or DNS record changes. **Never record key values.**

| Date       | Change                                                                                                                      | By    |
| ---------- | --------------------------------------------------------------------------------------------------------------------------- | ----- |
| 2026-10-24 | Resend added (student account, test sender). Sending-only key created; **needs rotating** (shared in chat).                 | Logan |
| 2026-10-24 | `sios.teamnitromma.com` added in Vercel; Resend DNS records collected for `mail.teamnitromma.com` (not yet sent to client). | Logan |
| 2026-10-24 | Password reset feature added: new `APP_URL`, `RESEND_API_KEY`, `EMAIL_FROM` settings.                                       | Logan |
