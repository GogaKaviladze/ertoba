# Deployment — Ertoba Analytics on Vercel

Production deployment checklist and configuration.

---

## Pre-Deployment Checklist

Before pushing to production:

- [ ] All tests pass: `npm run test:e2e`
- [ ] Type checking passes: `npm run typecheck`
- [ ] Linting passes: `npm run lint`
- [ ] No secrets in `.env.local` or code
- [ ] No hardcoded admin emails or config values
- [ ] Database migrations applied: `npx prisma db push`
- [ ] Performance targets met (see [ARCHITECTURE.md](ARCHITECTURE.md))
- [ ] Audit logging working: test a transaction and verify `AuditLog` table
- [ ] RLS policies enabled in Supabase dashboard

---

## Environment Variables (Production)

Set these in **Vercel Dashboard → Settings → Environment Variables:**

### Database (Supabase)

```
DATABASE_URL=postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:5432/postgres
```

**Port 6543** = Connection Pooler (required for serverless)
**Port 5432** = Direct connection (used by Prisma for migrations)

### Supabase Auth

```
NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT_REF].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[your-supabase-anon-key]
SUPABASE_SERVICE_ROLE_KEY=[your-supabase-service-role-key]
```

**Never expose `SUPABASE_SERVICE_ROLE_KEY` to the client.** Mark as "Sensitive" in Vercel.

### Encryption

```
ASSESSMENT_ENCRYPTION_KEY=[your-64-char-hex-key]
```

Generate with:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Keep this secret. Rotate quarterly.

### Optional (GitHub, Webhooks)

```
GITHUB_API=ghp_[your-personal-access-token]
REPO_LINK=https://github.com/GogaKaviladze/ertoba
```

---

## Vercel Deployment Steps

### 1. Connect Repository

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Link this repo to a Vercel project
vercel link
```

### 2. Configure Build & Runtime

In `vercel.json` (already committed):

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": ".next",
  "installCommand": "npm install"
}
```

Or in **Vercel Dashboard → Settings → Build & Development:**

- **Framework:** Next.js
- **Build Command:** `npm run build`
- **Output Directory:** `.next`
- **Node.js Version:** 20.x

### 3. Deploy Preview

```bash
# Deploy to staging (preview URL)
vercel --prod=false
```

Test the preview with production env vars before merging.

### 4. Deploy Production

```bash
# Deploy to production
vercel --prod

# Or: Merge to main branch (if GitHub integration enabled)
# Vercel auto-deploys on main push
```

---

## Database Migrations in Production

Migrations are applied **before** the Next.js build starts.

### In Vercel Dashboard

1. **Settings → Environment Variables:** Ensure `DATABASE_URL` and `DIRECT_URL` are set
2. **Build Settings:** Vercel runs build script, which triggers Prisma generation
3. **Migrations:** Executed by CI/CD (if `prisma db push` in build command)

### Manual Migration (if needed)

```bash
# Run migration against production database
DIRECT_URL="postgresql://..." npx prisma db push
```

**Important:** Always test migrations in staging first.

---

## Monitoring & Debugging

### Logs

- **Build Logs:** Vercel Dashboard → Deployments → [deployment] → Build logs
- **Runtime Logs:** Vercel Dashboard → Deployments → [deployment] → Runtime logs

### Performance

- **Vercel Analytics:** Dashboard → Analytics (TTFB, LCP, FID, CLS)
- **Supabase Logs:** Dashboard → Logs (query times, errors)

### Errors

- **Sentry (optional):** [Set up Sentry integration](https://vercel.com/docs/integrations/sentry)
- **Vercel Monitoring:** Built-in edge function errors

---

## Scaling & Limits

| Resource | Limit |
|----------|-------|
| Function Timeout | 60 seconds |
| Payload Size | 4.5 MB |
| Database Connections | Pooler handles ~100 concurrent |
| API Rate Limit | 1,200 req/min (Vercel) |

For higher traffic, consider:
- Caching responses (Next.js ISR, Redis)
- Database replicas (Supabase reads)
- CDN optimization (Vercel Edge Caching)

---

## Rolling Back

### If Deployment Breaks Production

```bash
# Revert to previous deployment
vercel rollback [deployment-id]

# Or: Redeploy last stable commit
git revert [bad-commit] && git push
```

Check Vercel Deployments tab for quick rollback links.

---

## Post-Deployment Checklist

After deploying to production:

- [ ] Homepage loads without errors
- [ ] Auth flow works (sign up, login, logout)
- [ ] Assessment submission works and encrypts data
- [ ] Marketplace UI displays correctly
- [ ] Admin audit log shows recent transactions
- [ ] Email notifications sent (if configured)
- [ ] Performance metrics acceptable (< 2.5s LCP)

---

## Secrets Rotation (Quarterly)

See [SECURITY.md](../SECURITY.md) for credential rotation schedule.

---

**Last Updated:** 2026-05-19
**Maintained By:** Goga Kaviladze
