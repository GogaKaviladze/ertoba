# Database Migration Pipeline

## Overview

This documentation describes the automated database migration pipeline for the Ertoba Analytics Production Database (Supabase).

---

## Architecture

```
git push (main branch)
    ↓
    Prisma migrations/** changes detected
    ↓
GitHub Action db-migrate.yml
    ↓
npx prisma migrate deploy (via Supabase Session Pooler, Port 5432)
    ↓
Production Database (dzcdsmcduywsncdkjnpx)
```

**Important:** The pipeline uses the **Supabase Session Pooler** (`aws-0-<region>.pooler.supabase.com:5432`), not the direct PostgreSQL connection to `db.<ref>.supabase.co:5432`. The Session Pooler is accessible from GitHub Actions and supports DDL with Prepared Statements (unlike the Transaction Pooler on Port 6543, which the app uses).

---

## Components

### 1. GitHub Workflow (`.github/workflows/db-migrate.yml`)

**Triggers:**
- Push to `main` branch
- Changes in path `ertoba-analytics-dashboard/prisma/migrations/**`
- Environment: `production` (requires manual approval on each run)

**Required Secrets (GitHub Repo → Settings → Secrets and variables → Actions):**
| Secret | Source | Description |
|--------|--------|-------------|
| `DATABASE_URL_MIGRATIONS` | Supabase Dashboard → Project Settings → Database → Connection String → **Session pooler** Tab | Full Postgres URL with password, e.g., `postgresql://postgres.<ref>:<pw>@aws-0-<region>.pooler.supabase.com:5432/postgres` |

> **Warning:** Must be the **Session Pooler** (Port 5432 on pooler host) — not the Transaction Pooler (6543, no DDL) and not the Direct Connection to `db.<ref>.supabase.co:5432` (unreachable from GitHub Actions).

### 2. Prisma Schema & Migrations

**Path:** `ertoba-analytics-dashboard/prisma/`

```
prisma/
├── schema.prisma              # Data models + generators
├── migration_lock.toml        # Prisma lock for validation
└── migrations/
    └── 20260411192700_rls_surveycompletion_policies/
        └── migration.sql      # Idempotent SQL statements
```

**migration_lock.toml** — Validates that the migrations/ directory is correctly structured. **Must be committed!**

**Schema Requirement:**
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")  // filled by Supabase CLI
}
```

---

## Writing Migrations

### Rule: Idempotent Statements

Each migration must be safely executable multiple times:

```sql
-- ❌ NOT idempotent (fails on 2nd run)
CREATE POLICY select_own_user ON "User" FOR SELECT USING (auth.uid()::uuid = "id");

-- ✅ Idempotent (safe to run multiple times)
DROP POLICY IF EXISTS select_own_user ON "User";
CREATE POLICY select_own_user ON "User" FOR SELECT USING (auth.uid()::uuid = "id");
```

### Creating a Migration

```bash
cd ertoba-analytics-dashboard

# 1. Modify schema (schema.prisma)
vim prisma/schema.prisma

# 2. Generate migration
npx prisma migrate dev --name <description>
# e.g., npx prisma migrate dev --name add_rls_policies

# 3. Review
cat prisma/migrations/<timestamp>_<name>/migration.sql

# 4. Test locally (with Docker PostgreSQL or local dev DB)
npm run test:db  # if available

# 5. Commit & Push
git add prisma/migrations/
git add prisma/schema.prisma
git commit -m "migration: <description>"
git push
```

After this, the GitHub Action is automatically triggered.

---

## Local Development

### Setup

```bash
cd ertoba-analytics-dashboard

# 1. .env.local with local DB
DATABASE_URL=postgresql://user:password@localhost:5432/ertoba_dev

# 2. Apply migrations
npx prisma migrate dev

# 3. (Optional) Seed data
npx prisma db seed
```

### Rolling Back Applied Migrations

```bash
# Undo the last step (dev mode only)
npx prisma migrate resolve --rolled-back 20260411192700_rls_surveycompletion_policies

# Recreate
npx prisma migrate dev
```

⚠️ **Production:** `migrate resolve` is not available. Only forward!

---

## Troubleshooting

### GitHub Action fails: "Can't reach database server"

**Cause:** GitHub Actions has no direct port 5432 access to Supabase  
**Solution:** Fixed by `supabase db push` (Management API) ✓

### Error: "migration_lock.toml missing"

**Cause:** Migration directory is not recognized by Prisma  
**Solution:**
```bash
touch prisma/migration_lock.toml
cat > prisma/migration_lock.toml << 'EOF'
provider = "postgresql"
EOF
git add prisma/migration_lock.toml
```

### Error: "DATABASE_URL not set"

**Cause:** Supabase CLI could not set the environment variable  
**Solution:** Verify that `schema.prisma` contains `url = env("DATABASE_URL")`

### Error: "Permission denied: CREATE POLICY"

**Cause:** Database user lacks superuser privileges  
**Solution:** `supabase db push` authenticates with `SUPABASE_ACCESS_TOKEN` as project owner — verify token owner.

### Error: "migration already applied" or Migration missing from `_prisma_migrations`

**Cause:** A migration was manually applied via SQL Editor but not registered in Prisma Migration History. `supabase db push` attempts to reapply it.

**Solution:** Register once in the Supabase SQL Editor:

```sql
INSERT INTO "_prisma_migrations" (
  id, checksum, finished_at, migration_name,
  logs, rolled_back_at, started_at, applied_steps_count
) VALUES (
  gen_random_uuid(),
  'manual',
  now(),
  '20260411192700_rls_surveycompletion_policies',  -- Directory name of the migration
  'Applied manually via SQL Editor',
  NULL,
  now(),
  1
);
```

The `migration_name` must exactly match the directory name under `prisma/migrations/`.

---

## Best Practices

### ✅ Do's

- ✅ Migrations are **immutable** (never modify, only create new ones)
- ✅ Idempotent statements (`IF NOT EXISTS`, `DROP IF EXISTS`)
- ✅ Meaningful names: `20260414_add_user_email_unique`
- ✅ Documentation in SQL comments
- ✅ Plan RLS (Row Level Security) first, then implement
- ✅ Design in `schema.prisma`, then `prisma migrate dev`

### ❌ Don'ts

- ❌ Modify old migrations
- ❌ `prisma migrate reset` in Production (DELETES EVERYTHING!)
- ❌ Non-idempotent statements
- ❌ Use `prisma db push` (only migrate via `migrate deploy`)
- ❌ Credentials in migration code

---

## References

- [Prisma Migrations Docs](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- [Supabase CLI Docs](https://supabase.com/docs/reference/cli/supabase-db-push)
- [Row Level Security (RLS)](https://supabase.com/docs/guides/auth/row-level-security)
- [GitHub Environments & Secrets](https://docs.github.com/en/actions/deployment/targeting-different-environments/using-environments-for-deployment)
