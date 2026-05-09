# Database Migration Pipeline

## Überblick

Diese Dokumentation beschreibt die automatisierte Datenbank-Migrationspipeline für die Ertoba Analytics Production Database (Supabase).

---

## Architektur

```
git push (main branch)
    ↓
    Prisma migrations/** Änderungen erkannt
    ↓
GitHub Action db-migrate.yml
    ↓
npx prisma migrate deploy (via Supabase Session Pooler, Port 5432)
    ↓
Production Database (dzcdsmcduywsncdkjnpx)
```

**Wichtig:** Die Pipeline nutzt den **Supabase Session Pooler** (`aws-0-<region>.pooler.supabase.com:5432`), nicht die direkte PostgreSQL-Verbindung zu `db.<ref>.supabase.co:5432`. Der Session Pooler ist aus GitHub Actions erreichbar und unterstützt DDL mit Prepared Statements (anders als der Transaction Pooler auf Port 6543, den die App nutzt).

---

## Komponenten

### 1. GitHub Workflow (`.github/workflows/db-migrate.yml`)

**Trigger:**
- Push zu `main` Branch
- Änderungen im Pfad `ertoba-analytics-dashboard/prisma/migrations/**`
- Environment: `production` (benötigt manuelles Approval bei jedem Run)

**Secrets erforderlich (GitHub Repo → Settings → Secrets and variables → Actions):**
| Secret | Quelle | Beschreibung |
|--------|--------|-------------|
| `DATABASE_URL_MIGRATIONS` | Supabase Dashboard → Project Settings → Database → Connection String → **Session pooler** Tab | Vollständige Postgres-URL mit Password, z.B. `postgresql://postgres.<ref>:<pw>@aws-0-<region>.pooler.supabase.com:5432/postgres` |

> **Achtung:** Es muss der **Session Pooler** (Port 5432 am Pooler-Host) sein — nicht der Transaction Pooler (6543, kein DDL) und nicht die Direct Connection zu `db.<ref>.supabase.co:5432` (aus GitHub Actions unerreichbar).

### 2. Prisma Schema & Migrationen

**Pfad:** `ertoba-analytics-dashboard/prisma/`

```
prisma/
├── schema.prisma              # Datenmodelle + Generatoren
├── migration_lock.toml        # Prisma Lock für Validierung
└── migrations/
    └── 20260411192700_rls_surveycompletion_policies/
        └── migration.sql      # Idempotente SQL-Statements
```

**migration_lock.toml** — Validiert dass das migrations/ Verzeichnis korrekt struktur ist. **Muss committed sein!**

**Schema-Anforderung:**
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")  // wird von Supabase CLI gefüllt
}
```

---

## Migrationen schreiben

### Regel: Idempotente Statements

Jede Migration muss mehrmals sicher ausgeführt werden können:

```sql
-- ❌ NICHT idempotent (schlägt fehl bei 2. Run)
CREATE POLICY select_own_user ON "User" FOR SELECT USING (auth.uid()::uuid = "id");

-- ✅ Idempotent (sicher mehrfach ausführbar)
DROP POLICY IF EXISTS select_own_user ON "User";
CREATE POLICY select_own_user ON "User" FOR SELECT USING (auth.uid()::uuid = "id");
```

### Migration erstellen

```bash
cd ertoba-analytics-dashboard

# 1. Schema ändern (schema.prisma)
vim prisma/schema.prisma

# 2. Migration generieren
npx prisma migrate dev --name <beschreibung>
# z.B. npx prisma migrate dev --name add_rls_policies

# 3. Überprüfen
cat prisma/migrations/<timestamp>_<name>/migration.sql

# 4. Lokal testen (mit Docker PostgreSQL oder lokaler Dev-DB)
npm run test:db  # falls vorhanden

# 5. Commit & Push
git add prisma/migrations/
git add prisma/schema.prisma
git commit -m "migration: <beschreibung>"
git push
```

Danach wird GitHub Action automatisch ausgelöst.

---

## Lokale Entwicklung

### Setup

```bash
cd ertoba-analytics-dashboard

# 1. .env.local mit lokaler DB
DATABASE_URL=postgresql://user:password@localhost:5432/ertoba_dev

# 2. Migrations anwenden
npx prisma migrate dev

# 3. (Optional) Seed-Daten
npx prisma db seed
```

### Vergebene Migrationen zurückrollen

```bash
# Letzten Schritt rückgängig machen (dev mode nur)
npx prisma migrate resolve --rolled-back 20260411192700_rls_surveycompletion_policies

# Neu erstellen
npx prisma migrate dev
```

⚠️ **Production:** `migrate resolve` ist nicht verfügbar. Nur vorwärts!

---

## Troubleshooting

### GitHub Action schlägt fehl: "Can't reach database server"

**Ursache:** GitHub Actions hat keinen direkten Port 5432 Zugang zu Supabase  
**Lösung:** Wird durch `supabase db push` (Management API) behoben ✓

### Fehler: "migration_lock.toml missing"

**Ursache:** Migration-Verzeichnis wird von Prisma nicht erkannt  
**Lösung:**
```bash
touch prisma/migration_lock.toml
cat > prisma/migration_lock.toml << 'EOF'
provider = "postgresql"
EOF
git add prisma/migration_lock.toml
```

### Fehler: "DATABASE_URL not set"

**Ursache:** Supabase CLI konnte Umgebungsvariable nicht setzen  
**Lösung:** Überprüfe dass `schema.prisma` `url = env("DATABASE_URL")` hat

### Fehler: "Permission denied: CREATE POLICY"

**Ursache:** Database-Benutzer hat keine Superuser-Rechte
**Lösung:** `supabase db push` authentifiziert sich mit dem `SUPABASE_ACCESS_TOKEN` als Projekt-Owner — Token-Owner prüfen.

### Fehler: "migration already applied" oder Migration fehlt in `_prisma_migrations`

**Ursache:** Eine Migration wurde manuell via SQL Editor ausgeführt, aber nicht in der Prisma Migration History registriert. `supabase db push` versucht sie erneut anzuwenden.

**Lösung:** Einmalig im Supabase SQL Editor registrieren:

```sql
INSERT INTO "_prisma_migrations" (
  id, checksum, finished_at, migration_name,
  logs, rolled_back_at, started_at, applied_steps_count
) VALUES (
  gen_random_uuid(),
  'manual',
  now(),
  '20260411192700_rls_surveycompletion_policies',  -- Ordnername der Migration
  'Applied manually via SQL Editor',
  NULL,
  now(),
  1
);
```

`migration_name` muss exakt dem Ordnernamen unter `prisma/migrations/` entsprechen.

---

## Best Practices

### ✅ Do's

- ✅ Migrationen sind **unveränderlich** (nie ändern, nur neue erstellen)
- ✅ Idempotente Statements (`IF NOT EXISTS`, `DROP IF EXISTS`)
- ✅ Aussagekräftige Namen: `20260414_add_user_email_unique`
- ✅ Dokumentation in SQL-Kommentaren
- ✅ RLS (Row Level Security) zuerst planen, dann implementieren
- ✅ In `schema.prisma` entwerfen, dann `prisma migrate dev`

### ❌ Don'ts

- ❌ Alte Migrationen editieren
- ❌ `prisma migrate reset` in Production (LÖSCHT ALLES!)
- ❌ Nicht-idempotente Statements
- ❌ `prisma db push` verwenden (nur Migration über `migrate deploy`)
- ❌ Credentials in Migrations-Code

---

## Referenzen

- [Prisma Migrations Docs](https://www.prisma.io/docs/concepts/components/prisma-migrate)
- [Supabase CLI Docs](https://supabase.com/docs/reference/cli/supabase-db-push)
- [Row Level Security (RLS)](https://supabase.com/docs/guides/auth/row-level-security)
- [GitHub Environments & Secrets](https://docs.github.com/en/actions/deployment/targeting-different-environments/using-environments-for-deployment)
