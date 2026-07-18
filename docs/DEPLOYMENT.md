# Deployment — Ertoba Analytics on Hetzner (Docker + Caddy)

Production deployment checklist and configuration.

The app runs as a Docker container on a shared Hetzner VPS. The VPS already
hosts other services (Affine, n8n, …) behind a central, statically configured
Caddy container that terminates TLS for all domains. Ertoba does **not** run
its own Caddy — it joins the existing external Docker network `caddy_net` and
the central Caddy reverse-proxies to it by container name. Deployment is
automatic: every push to `main` builds a Docker image, pushes it to GHCR, and
triggers a deploy on the VPS via GitHub Actions (`.github/workflows/deploy.yml`).

The database is external (Supabase); the VPS never runs a DB container.
Migrations are handled by the separate `.github/workflows/db-migrate.yml`
workflow and are not part of this document.

---

## Pre-Deployment Checklist

Before pushing to production:

- [ ] All tests pass: `npm run test:e2e`
- [ ] Type checking passes: `npm run typecheck`
- [ ] Linting passes: `npm run lint`
- [ ] No secrets in `.env.local` or code
- [ ] No hardcoded admin emails or config values
- [ ] Database migrations applied: `npx prisma migrate deploy`
- [ ] Performance targets met (see [ARCHITECTURE.md](ARCHITECTURE.md))
- [ ] Audit logging working: test a transaction and verify `AuditLog` table
- [ ] RLS policies enabled in Supabase dashboard

---

## One-Time VPS Setup

These steps are done once by hand on the VPS, outside of this repository.

### 1. Create the `deploy` Linux user

Ertoba's files, SSH access, and Docker Compose project are owned by a
dedicated non-root user, kept separate from whatever user runs Affine/n8n:

```bash
adduser deploy
usermod -aG docker deploy
```

Generate a dedicated SSH keypair for GitHub Actions to use (do this as
`deploy`, not root):

```bash
su - deploy
ssh-keygen -t ed25519 -C "github-actions-deploy" -f ~/.ssh/github_actions_ed25519 -N ""
cat ~/.ssh/github_actions_ed25519.pub >> ~/.ssh/authorized_keys
```

The private key (`~/.ssh/github_actions_ed25519`) becomes the `VPS_SSH_KEY`
GitHub secret (see below). Password login can be disabled for `deploy` in
`/etc/ssh/sshd_config` (`PasswordAuthentication no`, or per-user via a
`Match User deploy` block) once the key-based login is confirmed working —
this only affects `deploy`, not root or other users on the box.

### 2. Create the app directory and `.env`

```bash
mkdir -p /home/deploy/ertoba
```

Copy `docker-compose.yml` from this repo to `/home/deploy/ertoba/docker-compose.yml`,
and create `/home/deploy/ertoba/.env` by hand with the production values listed
under [Environment Variables](#environment-variables-production) below. This
file is never committed and is not managed by CI.

### 3. DNS

Point an A record for `yourdomain.com` at the VPS's IP address.

### 4. Add Ertoba to the central Caddyfile

The central Caddy container's Caddyfile lives under `/srv` on the VPS
(root-owned, shared across all hosted domains). Add:

```
yourdomain.com {
  reverse_proxy ertoba-app:3000
}
```

Then reload the central Caddy container so it picks up the change, e.g.:

```bash
docker exec <central-caddy-container> caddy reload --config /etc/caddy/Caddyfile
```

(Exact container name/config path depends on the existing central Caddy setup.)

### 5. GitHub repository secrets

Set these under **Settings → Secrets and variables → Actions**:

| Secret | Value |
|---|---|
| `VPS_HOST` | VPS IP or hostname |
| `VPS_USER` | `deploy` |
| `VPS_SSH_KEY` | private half of the keypair generated in step 1 |
| `NEXT_PUBLIC_SUPABASE_URL` | same value as in production `.env` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | same value as in production `.env` |
| `NEXT_PUBLIC_SITE_URL` | `https://yourdomain.com` |

The last three are needed because Next.js inlines `NEXT_PUBLIC_*` variables
into the client bundle **at build time**, so they must be available to the
Docker build in CI, not just in the runtime `.env` on the VPS.

---

## Environment Variables (Production)

Stored in `/home/deploy/ertoba/.env` on the VPS (loaded via `env_file` in
`docker-compose.yml`), and mirrored as GitHub secrets for the `NEXT_PUBLIC_*`
build-time values (see above).

### Database (Supabase)

```
DATABASE_URL=postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:6543/postgres?pgbouncer=true
DIRECT_URL=postgresql://postgres.[PROJECT_REF]:[PASSWORD]@aws-0-eu-central-1.pooler.supabase.com:5432/postgres
```

**Port 6543** = Connection Pooler
**Port 5432** = Direct connection (used by Prisma for migrations)

### Supabase Auth

```
NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT_REF].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[your-supabase-anon-key]
SUPABASE_SERVICE_ROLE_KEY=[your-supabase-service-role-key]
```

**Never expose `SUPABASE_SERVICE_ROLE_KEY` to the client** — it is a
server-only runtime variable, never a build arg.

### Site URL

```
NEXT_PUBLIC_SITE_URL=https://yourdomain.com
```

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
REPO_LINK=https://github.com/<your-username>/ertoba
```

---

## Automatic Deployment Flow

On every push to `main`, `.github/workflows/deploy.yml` runs:

1. Checkout, Node 20 setup, `npm ci`
2. `npm run lint` and `npm run typecheck` — gate, aborts on failure
3. Build the Docker image (multi-stage, `output: 'standalone'`), passing
   `NEXT_PUBLIC_*` secrets as build args
4. Push the image to `ghcr.io/gogakaviladze/ertoba` tagged `:latest` and
   `:<commit-sha>`
5. SSH into the VPS as `deploy` and run:
   ```bash
   cd /home/deploy/ertoba
   docker compose pull
   docker compose up -d --remove-orphans
   docker image prune -f
   ```

E2E tests (Playwright) are **not** part of this pipeline — they need live
Supabase credentials and stay a manual pre-merge step (see the checklist
above) to avoid spreading test secrets into CI.

---

## Manual / Local Verification

To reproduce the production build locally before pushing:

```bash
npm run lint
npm run typecheck

docker build \
  --build-arg NEXT_PUBLIC_SUPABASE_URL=... \
  --build-arg NEXT_PUBLIC_SUPABASE_ANON_KEY=... \
  --build-arg NEXT_PUBLIC_SITE_URL=http://localhost:3000 \
  -t ertoba:local .

docker run --rm -p 3000:3000 --env-file .env.local ertoba:local
curl localhost:3000
```

---

## Monitoring & Debugging

### Logs

```bash
docker compose -f /home/deploy/ertoba/docker-compose.yml logs -f app
```

The central Caddy container's access/error logs are outside this repo's
Compose project; check them on the central Caddy container directly.

### Performance

- **Supabase Logs:** Dashboard → Logs (query times, errors)

### Errors

- **Sentry (optional):** wire up via `@sentry/nextjs` if needed; not currently configured.

---

## Scaling & Limits

The VPS has 2 vCPU / 4 GB RAM, shared with other services (Affine, n8n).
There is no serverless-style autoscaling — capacity is whatever the box has
available minus the other containers. If Ertoba's load grows:

- Add response caching (Next.js ISR, Redis)
- Move to a dedicated VPS or add a second app replica behind the central Caddy
- Watch `docker stats` on the host to catch resource contention with the
  other services early

---

## Rolling Back

Pin the previous known-good image tag instead of `:latest`:

```bash
# On the VPS, as deploy
cd /home/deploy/ertoba
sed -i 's#ertoba:latest#ertoba:<previous-sha>#' docker-compose.yml
docker compose up -d
```

Or revert the bad commit and let the pipeline redeploy `:latest`:

```bash
git revert [bad-commit] && git push
```

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

**Last Updated:** 2026-07-17
