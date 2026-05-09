# Ertoba Analytics

**Privacy-first OSINT Platform for psychological assessments, media intelligence, and organizational analysis.**

Ertoba Analytics turns open-source intelligence into actionable insight — without compromising user privacy. It is built for researchers, HR teams, and analysts who need ethical, GDPR-compliant tools that treat privacy as a feature, not an afterthought.

> Anonymous-first: no email required to take an assessment. No tracking. No cookies.

---

## Three Intelligence Domains

| Domain | What It Does |
|--------|-------------|
| **Psychological Intelligence** | Big Five personality assessments, burnout indices, team dynamics analysis — for HR teams and org development |
| **Media Intelligence** | Propaganda framing detection, disinformation tracking, narrative analysis — built on 47,000+ Georgian news articles, designed to scale |
| **Organizational Intelligence** | Team health assessments, culture analysis, compliance monitoring — for enterprises and consultancies |

---

## Platform Features

| Feature | Description |
|---------|-------------|
| **Anonymous Assessment** | Take assessments without creating an account — zero friction entry |
| **ERTC Token System** | Gamified reward economy: users earn tokens for completing assessments |
| **Fraud & Compliance** | Statistical fraud case analysis and audit logging |
| **Privacy Controls** | Field-level AES-256-GCM encryption, RLS, rate limiting, zero tracking by default |
| **i18n** | Full support for Georgian (ka), English (en), and German (de) |

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) |
| Frontend | React 19 + TypeScript 5 |
| Styling | Tailwind CSS 4 + Framer Motion |
| Charts | Recharts |
| ORM | Prisma 7 (`@prisma/adapter-pg`) |
| Auth | Supabase Auth (JWT + SSR) |
| Database | Supabase PostgreSQL (Port 6543) |
| Security | AES-256-GCM, Rate Limiting, RLS |
| E2E Tests | Playwright |
| Deployment | Vercel |
| AI Agents | LangGraph / LangChain |

---

## Repository Structure

```
ertoba/
├── src/                      # App Router, Server Actions, Services
├── prisma/                   # Schema, Migrations, Seed
├── tests/                    # Playwright E2E tests
├── data/                     # Generated JSON data
├── scripts/                  # Utility scripts
├── docs/                     # Documentation
├── agents/                   # AI Agent configurations (LangGraph)
└── requirements.txt          # Python dependencies
```

---

## Quick Start

```bash
# 1. Clone and enter the repo
git clone https://github.com/GogaKaviladze/ertoba.git
cd ertoba

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env.local
# Fill in your Supabase credentials (see below)

# 4. Set up the database
npx prisma generate
npx prisma db push

# 5. Start the dev server
npm run dev
```

App runs at [http://localhost:3000](http://localhost:3000).

> For detailed setup instructions including Python pipeline and Supabase configuration, see [SETUP.md](SETUP.md).

### Required Environment Variables

```
NEXT_PUBLIC_SUPABASE_URL=       # Your Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=  # Public anon key
DATABASE_URL=                   # Supabase Connection Pooler, Port 6543
ENCRYPTION_KEY=                 # AES-256-GCM, 32-byte hex string
```

---

## Data Pipeline

Python scripts generate static JSON data for the dashboard:

```bash
cd scripts

# Full categorization of 47K articles
python thesis_insight_analysis.py

# Generate time-series data (or --sample for synthetic test data)
python generate_timeseries.py
python generate_timeseries.py --sample
```

| Script | Output | Purpose |
|--------|--------|---------|
| `thesis_insight_analysis.py` | `data/georgian_thesis_trends.json` | Semantic categorization |
| `generate_timeseries.py` | `data/daily_trends.json` | Daily aggregation |
| `framing_analysis.py` | `data/trends.json` | Gemini API framing analysis |
| `analyze_and_visualize.py` | HTML dashboard | Time-series visualization |

---

## Tests

```bash
npm run test:e2e              # All E2E tests
npm run test:e2e -- --ui      # Visual test runner
npm run test:e2e -- --debug   # Step-through debugger
```

---

## Documentation

| Document | Contents |
|----------|----------|
| [SETUP.md](SETUP.md) | Step-by-step local setup: Supabase, env vars, database, troubleshooting |
| [CONTRIBUTING.md](CONTRIBUTING.md) | How to contribute, branch naming, PR process, team roles |
| [ROADMAP.md](ROADMAP.md) | Project phases: done, in progress, planned |
| [docs/](docs/) | Architecture documentation |
| [agents/README.md](agents/README.md) | Python AI agent (LangGraph) setup and run instructions |
| [SECURITY.md](SECURITY.md) | Security tasks, credential rotation, RLS setup |

---

## Contributing

We welcome contributions. See [CONTRIBUTING.md](CONTRIBUTING.md) for the full guide.

We are particularly looking for:
- **Backend developers** (Prisma, Supabase, Node.js)
- **Data engineers** (Python, LangGraph, NLP pipelines)
- **Frontend developers** (Next.js, React, data visualization)

---

## License

This project is licensed under the [MIT License](LICENSE).
