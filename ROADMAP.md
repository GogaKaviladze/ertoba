# ROADMAP — Ertoba Analytics

**Vision:** Privacy-first OSINT platform for media analysis and civic transparency.
**Status:** Phase 2 active — seeking contributors.

---

## Phase 1: Foundation ✅ Done

| Feature | Status |
|---|---|
| Propaganda framing analysis (47K+ articles, Georgian media) | ✅ |
| Big Five psychological assessment | ✅ |
| ERTC Token system — earn & spend (Gamification) | ✅ |
| Marketplace (RewardItems) | ✅ |
| Supabase Auth (JWT + SSR) | ✅ |
| Field-level encryption AES-256-GCM (PR #95) | ✅ |
| Audit logging (PR #96) | ✅ |
| Rate limiting | ✅ |
| i18n: Georgian / English / German | ✅ |
| Playwright E2E test suite | ✅ |

---

## Phase 2: Platform 🔄 In Progress

| Feature | Status | Needs |
|---|---|---|
| Demo Commitment Tracker (`/demo/26mai`) | 🔄 In Progress | Frontend Dev |
| Fraud Case Report (`/dashboard/reports/fraud`) | 🔄 In Progress | Data Engineer |
| Marketplace UI (`/dashboard/market`) | 📋 Planned | Frontend Dev |
| Surveys (`/dashboard/surveys`) | 📋 Planned | Backend Dev |
| Burnout Assessment | 📋 Planned | Frontend Dev |
| Admin Audit Log viewer (`/dashboard/admin/audit`) | 📋 Planned | Frontend Dev |

---

## Phase 3: Scale 📋 Planned

| Feature | Notes |
|---|---|
| Multi-source OSINT ingestion | Connect TV, social, print feeds |
| Public API (read-only) | Rate-limited, token-authenticated |
| Contributor onboarding docs | Wiki + CONTRIBUTING.md |
| Team expansion | 4 external contributors signaled interest |

---

## Contribute

**We are looking for:**
- **Frontend Dev** — Next.js / React / Tailwind: Marketplace UI, Surveys, Assessments
- **Data Engineer** — Python / SQL: Fraud detection pipeline, OSINT data ingestion
- **Backend Dev** — Node.js / Prisma: Survey actions, API endpoints

Open issues: https://github.com/GogaKaviladze/ertoba/issues
Contact: goga.kaviladze@anthronode.io
