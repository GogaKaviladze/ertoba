# Ertoba Analytics — Local Setup Guide

Get the dashboard running locally in ~30 minutes.

---

## Prerequisites

- Node.js 20+
- A free [Supabase](https://supabase.com) account
- Git

---

## Step 1 — Clone and navigate

```bash
git clone https://github.com/GogaKaviladze/ertoba.git
cd ertoba
```

---

## Step 2 — Create a Supabase project

1. Go to [supabase.com](https://supabase.com) and create a new project (free plan is enough).
2. Wait for the project to finish provisioning (~1 minute).
3. Note your **Project Reference ID** (visible in the project URL: `https://supabase.com/dashboard/project/<PROJECT_REF>`).

---

## Step 3 — Configure environment variables

```bash
cp .env.example .env.local
```

Open `.env.local` and fill in every value:

| Variable | Where to find it |
|---|---|
| `DATABASE_URL` | Supabase Dashboard → Project Settings → Database → **Connection string** (Transaction mode, port **6543**) |
| `DIRECT_URL` | Same page, **Direct connection** string (port **5432**) |
| `NEXT_PUBLIC_SUPABASE_URL` | Project Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Project Settings → API → `anon` / `public` key |
| `SUPABASE_SERVICE_ROLE_KEY` | Project Settings → API → `service_role` key — **never expose to the client** |
| `ASSESSMENT_ENCRYPTION_KEY` | Generate once with the command below — store safely |
| `GITHUB_API` | GitHub → Settings → Developer settings → Personal access tokens |
| `REPO_LINK` | Your fork's full GitHub URL |

Generate the encryption key:

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

> The `DATABASE_URL` uses port **6543** (Supabase Connection Pooler / PgBouncer).
> The `DIRECT_URL` uses port **5432** (direct connection, required for Prisma migrations).

---

## Step 4 — Install dependencies and push the database schema

```bash
npm install
npx prisma generate
npx prisma db push
```

`prisma db push` applies the schema directly to your Supabase database without creating migration files — suitable for local development.

---

## Step 5 — Start the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Useful Development Commands

```bash
npm run dev              # Start Next.js dev server
npm run build            # Production build (run before committing)
npm run lint             # ESLint check
npm run test:e2e         # Playwright E2E tests
npm run test:e2e -- --ui # Playwright with visual UI
npx prisma studio        # Browser-based DB viewer at localhost:5555
```

---

## Auth — Supabase Redirect URLs

For Supabase Auth to work locally you must add the redirect URL in your Supabase project:

1. Supabase Dashboard → Authentication → URL Configuration
2. Add `http://localhost:3000/**` to **Redirect URLs**

---

## Troubleshooting

### Prisma TLS error on Vercel / production

Prisma v7's `adapter-pg` wraps TLS errors before `pg` can apply its flags. Add both options:

```ts
ssl: { rejectUnauthorized: false, checkServerIdentity: () => undefined }
```

### `P1001` — Can't reach database server

- Confirm `DATABASE_URL` uses port **6543**, not 5432.
- Check that your Supabase project is not paused (free-tier projects pause after inactivity).

### `P3014` — Prisma schema drift

Run `npx prisma db push --force-reset` to reset and re-apply the schema.  
**Warning:** this drops all data. Only use on a dev project.

### Supabase Auth redirect loop

Verify the Redirect URL in the Supabase Dashboard matches the URL you are accessing locally (including protocol and port).

---

## Python Agent

The `agents/` directory contains a LangGraph-based analysis agent.
See [`agents/README.md`](agents/README.md) for setup and usage.
