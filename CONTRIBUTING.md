# Contributing to Ertoba Analytics

Thank you for your interest in contributing to Ertoba Analytics — a privacy-first OSINT platform for media analysis and propaganda detection.

This document covers everything you need to get started as a contributor.

---

## Prerequisites

Before contributing, make sure you have the following installed:

| Tool | Version | Purpose |
|------|---------|---------|
| Node.js | 20+ | Next.js app |
| npm | 9+ | Package management |
| Python | 3.11+ | Data pipeline scripts |
| Git | any recent | Version control |
| Supabase account | — | Database & Auth (free tier works) |

> For full local setup instructions, see **SETUP.md** (coming soon).

---

## We Are Looking For

We are actively seeking contributors in these areas:

- **Backend Developer** — Prisma 7, Supabase PostgreSQL, Next.js Server Actions, RLS policies
- **Data Engineer** — Python pipelines, LangGraph/LangChain agents, NLP/framing analysis
- **Frontend Developer** — Next.js 16, React 19, Tailwind CSS 4, Recharts, data visualization

If you are unsure where to start, check the [open issues](https://github.com/GogaKaviladze/Ertoba-Analytics/issues) and look for the `good first issue` label.

---

## Branch Naming

Always create a new branch for your work. Never push directly to `main`.

| Prefix | Use case |
|--------|----------|
| `feat/` | New feature or enhancement |
| `fix/` | Bug fix |
| `chore/` | Maintenance, refactoring, config changes |
| `docs/` | Documentation only |

Examples:
```bash
git checkout -b feat/assessment-export
git checkout -b fix/token-balance-overflow
git checkout -b docs/setup-guide
```

---

## Commit Format

We follow conventional commits. Keep messages concise and in English.

```
feat: add Big Five assessment result export
fix: correct ERTC token balance calculation on dashboard
refactor: extract encryption logic into standalone service
docs: add Supabase RLS setup instructions
test: add E2E test for assessment submission flow
```

Rules:
- Use imperative mood ("add", not "added" or "adds")
- Reference the issue number when applicable: `fix: token overflow (#42)`
- One logical change per commit

---

## Pull Request Process

1. **Branch** — Create a feature/fix branch from `main` (see naming above)
2. **Develop** — Implement your changes with tests
3. **Test locally** — Run E2E tests before opening a PR
4. **Open PR** — Target `main`, fill in the PR template
5. **Review** — Address feedback; at least one approval required
6. **Merge** — Squash merge into `main`

### PR Description Must Include

- What changed and why
- How to test the change manually
- Any performance impact (positive or negative)
- Risk level and edge cases considered

---

## Definition of Done

Every contribution must satisfy all of the following before merging:

- [ ] Functionality is implemented and working
- [ ] E2E tests added or updated (Playwright)
- [ ] Performance impact assessed (TTFB < 800ms, LCP < 2.5s)
- [ ] No secrets or credentials committed
- [ ] PR description includes risk assessment and test instructions

---

## Running Tests

```bash
cd ertoba-analytics-dashboard
npm run test:e2e              # All E2E tests
npm run test:e2e -- --ui      # Visual test runner
npm run test:e2e -- --debug   # Step-through debugger
```

New features require E2E test coverage. Use `data-testid` attributes for selectors.

---

## Code Conventions

- **TypeScript strict mode** — no `any` unless absolutely necessary
- **Server Actions** for mutations, not API routes
- **Service layer** for business logic — keep components thin
- **RLS** for all database access — never bypass row-level security
- **No secrets in code** — use `.env.local` locally, Vercel env vars in production

For full architecture details and design patterns, see [context/ARCH.md](context/ARCH.md).

---

## Security

If you discover a security vulnerability, do **not** open a public issue. Contact the maintainer directly at goga.kaviladze@anthronode.io.

See [SECURITY.md](SECURITY.md) for our security practices and pre-production checklist.

---

## Questions?

Open a [GitHub issue](https://github.com/GogaKaviladze/Ertoba-Analytics/issues) or reach out via goga.kaviladze@anthronode.io.
