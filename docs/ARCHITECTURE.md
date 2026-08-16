# Architecture — Ertoba Analytics

Technical design, data models, and system flow.

---

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|---------|
| **Framework** | Next.js | 16 (App Router, Server Actions) |
| **Frontend** | React + TypeScript | 19 + 5 |
| **Styling** | Tailwind CSS + Framer Motion | 4 |
| **ORM** | Prisma | 7 with `@prisma/adapter-pg` |
| **Database** | Supabase PostgreSQL | Connection Pooler (Port 6543) |
| **Auth** | Supabase Auth | JWT + Server-Side Session |
| **Encryption** | Node.js crypto (AES-256-GCM) | Built-in |
| **Charts** | Recharts | Latest |
| **E2E Tests** | Playwright | Latest |
| **Deployment** | Docker / VPS (GHCR) | Containerized Next.js |
| **AI Agents** | LangGraph / LangChain | Latest |

---

## Database Schema

### Core Models

**User** — User account & auth
```
id (UUID, PK)
email (String, unique)
created_at (DateTime)
updated_at (DateTime)
```

**Assessment** — Assessment definitions (immutable templates)
```
id (UUID, PK)
name (String) — e.g., "Big Five Personality"
description (Text)
category (String) — "psychological", "media", "organizational"
questions (JSONB) — Question templates
created_at (DateTime)
```

**SurveyCompletion** — User responses (encrypted)
```
id (UUID, PK)
user_id (UUID, FK → User)
assessment_id (UUID, FK → Assessment)
results (BYTEA) — AES-256-GCM encrypted JSON
completed_at (DateTime)
created_at (DateTime)
```

**RewardItem** — Purchasable items in marketplace
```
id (UUID, PK)
name (String)
ertc_cost (Integer) — ERTC token cost
description (Text)
created_at (DateTime)
```

**Purchase** — User transaction log
```
id (UUID, PK)
user_id (UUID, FK → User)
item_id (UUID, FK → RewardItem)
ertc_spent (Integer)
created_at (DateTime)
```

**AuditLog** — Admin audit trail
```
id (UUID, PK)
user_id (UUID, FK → User, nullable)
action (String) — e.g., "assessment_completed", "purchase_made"
target_type (String) — e.g., "SurveyCompletion", "Purchase"
target_id (UUID)
metadata (JSONB) — Extra context
created_at (DateTime)
```

### Row-Level Security (RLS)

- **Users** see only their own data
- **Admin** (via `is_admin` claim) sees all audit logs
- **Assessments** are public read-only
- **SurveyCompletions** are user-private

---

## Data Flow

### Assessment Submission
```
1. Frontend: User completes assessment form
   ↓
2. Server Action: POST /dashboard/assessment-submit
   - Validate input
   - Encrypt results with AES-256-GCM
   - Insert SurveyCompletion (encrypted)
   - Create AuditLog entry
   ↓
3. Database: SurveyCompletion stored (encrypted blob)
4. User: Token balance updated (Prisma compute)
```

### Token Economy
```
- User completes assessment → +10 ERTC tokens
- User makes purchase → -X ERTC tokens
- Balance stored in compute field (not table)
- Audit log tracks all transactions
```

---

## File Structure

```
ertoba/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── page.tsx                  # Home / landing
│   │   ├── layout.tsx                # Root layout
│   │   ├── dashboard/
│   │   │   ├── page.tsx              # Dashboard index
│   │   │   ├── assessment-submit/
│   │   │   ├── audit/                # Admin audit log viewer
│   │   │   └── market/               # Marketplace UI
│   │   ├── api/                      # API routes (if any)
│   │   └── auth/                     # Supabase Auth callbacks
│   ├── components/
│   │   ├── features/
│   │   │   ├── assessments/
│   │   │   │   └── big-five.tsx      # Big Five assessment component
│   │   │   ├── contact/
│   │   │   │   └── ContactForm.tsx
│   │   │   └── ...
│   │   └── layout/                   # Headers, footers, nav
│   ├── lib/
│   │   ├── supabase/                 # Supabase client & utils
│   │   ├── encryption.ts             # AES-256-GCM encrypt/decrypt
│   │   ├── auth.ts                   # Auth session helpers
│   │   ├── i18n/                     # Internationalization
│   │   └── ...
│   └── styles/
│       └── globals.css               # Tailwind + custom CSS
├── prisma/
│   ├── schema.prisma                 # Prisma schema
│   └── migrations/
│       └── 0001_init/
│           └── migration.sql
├── tests/
│   └── *.spec.ts                     # Playwright E2E tests
├── agents/                           # Python AI agents
│   ├── main.py
│   └── requirements.txt
├── data/                             # Generated JSON (not committed)
├── scripts/                          # Python data pipelines
├── docs/                             # Documentation
└── .env.example                      # Environment template
```

---

## Service Layer Pattern

### Encryption Service
```typescript
// src/lib/encryption.ts
export async function encryptResults(data: object, key: string): Promise<Buffer> {
  // AES-256-GCM encryption
  // Returns Buffer (stored as BYTEA in DB)
}

export async function decryptResults(encrypted: Buffer, key: string): Promise<object> {
  // AES-256-GCM decryption
}
```

### Supabase Client
```typescript
// src/lib/supabase/client.ts
export const supabaseClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

// Server-side only:
export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);
```

### Server Actions
- All mutations via Server Actions (not API routes)
- Validate auth & RLS on every action
- Log to audit table after changes
- Return typed responses

---

## Security Practices

### Encryption
- **Field-level:** SurveyCompletion.results encrypted with AES-256-GCM
- **Key:** 32-byte hex string (stored in env var `ASSESSMENT_ENCRYPTION_KEY`)
- **Every submission** is encrypted independently

### Row-Level Security (RLS)
- Supabase RLS policies enforce user isolation
- Never bypass with `rejectUnauthorized: false` alone
- Use: `ssl: { rejectUnauthorized: false, checkServerIdentity: () => undefined }`

### Auth Flow
- User signs up via Supabase Auth (email + password or OAuth)
- JWT stored in secure HttpOnly cookie
- Server-side session validated on each request
- SSR renders based on session state

### Secrets Management
- Never commit `.env.local` or credentials
- Use `.env.example` as template
- Production secrets configured via server environment / GitHub Actions secrets
- Rotate keys quarterly via SECURITY.md checklist

---

## Deployment: Docker & VPS

- **Containerization:** Multi-stage Dockerfile running Next.js standalone server
- **Image Registry:** GitHub Container Registry (ghcr.io)
- **CI/CD:** Automated build and SSH deployment to VPS via GitHub Actions
- **Database:** Supabase PostgreSQL connection pooler (Port 6543)

---

## Testing Strategy

- **Unit Tests:** Service functions (encryption, auth helpers)
- **E2E Tests:** Playwright — user flows (assessment submit, purchase, audit log)
- **Integration:** Tests hit real Supabase + database
- **Selectors:** Use `data-testid` attributes for reliability

---

## Performance Targets

| Metric | Target |
|--------|--------|
| TTFB (Time To First Byte) | < 800ms |
| LCP (Largest Contentful Paint) | < 2.5s |
| FID (First Input Delay) | < 100ms |
| CLS (Cumulative Layout Shift) | < 0.1 |

---

**Last Updated:** 2026-05-19
**Maintained By:** Goga Kaviladze
