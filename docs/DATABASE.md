# Database — Ertoba Analytics

Prisma schema, migrations, and database operations.

---

## Schema Overview

Prisma schema defined in `prisma/schema.prisma`.

### Core Tables

**user**
```prisma
model User {
  id        String   @id @default(cuid())
  email     String   @unique
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")
  
  surveys Survey[]
  purchases Purchase[]
  auditLogs AuditLog[]
}
```

**assessment**
```prisma
model Assessment {
  id          String   @id @default(cuid())
  name        String
  description String?
  category    String   // "psychological", "media", "organizational"
  questions   Json     // Array of { id, text, options, etc. }
  createdAt   DateTime @default(now()) @map("created_at")
  
  surveys Survey[]
}
```

**survey_completion**
```prisma
model SurveyCompletion {
  id           String   @id @default(cuid())
  userId       String   @map("user_id")
  assessmentId String   @map("assessment_id")
  
  // Encrypted with AES-256-GCM
  results      Bytes    // Binary encrypted data
  completedAt  DateTime @map("completed_at")
  createdAt    DateTime @default(now()) @map("created_at")
  
  user       User       @relation(fields: [userId], references: [id], onDelete: Cascade)
  assessment Assessment @relation(fields: [assessmentId], references: [id])
  
  @@index([userId])
  @@index([assessmentId])
}
```

**reward_item**
```prisma
model RewardItem {
  id        String   @id @default(cuid())
  name      String
  ertcCost  Int      @map("ertc_cost")
  description String?
  createdAt DateTime @default(now()) @map("created_at")
  
  purchases Purchase[]
}
```

**purchase**
```prisma
model Purchase {
  id        String   @id @default(cuid())
  userId    String   @map("user_id")
  itemId    String   @map("item_id")
  ertcSpent Int      @map("ertc_spent")
  createdAt DateTime @default(now()) @map("created_at")
  
  user User        @relation(fields: [userId], references: [id], onDelete: Cascade)
  item RewardItem  @relation(fields: [itemId], references: [id])
  
  @@index([userId])
  @@index([itemId])
}
```

**audit_log**
```prisma
model AuditLog {
  id         String   @id @default(cuid())
  userId     String?  @map("user_id")
  action     String   // "survey_completed", "purchase_made", "admin_action"
  targetType String   @map("target_type") // "SurveyCompletion", "Purchase"
  targetId   String   @map("target_id")
  metadata   Json?    // Extra context
  createdAt  DateTime @default(now()) @map("created_at")
  
  user User? @relation(fields: [userId], references: [id], onDelete: SetNull)
  
  @@index([userId])
  @@index([createdAt])
}
```

---

## Migrations

Located in `prisma/migrations/`.

### Running Migrations

```bash
# Generate Prisma client (run after schema changes)
npx prisma generate

# Push schema to database (dev or staging)
npx prisma db push

# Migrate production database
DIRECT_URL="postgresql://..." npx prisma db push

# Create a new migration file (for version control)
npx prisma migrate dev --name [migration_name]

# Reset database (dev only – destructive!)
npx prisma db push --skip-generate --force-reset
```

### Migration Files

Each migration creates a SQL file in `prisma/migrations/[timestamp]_[name]/migration.sql`.

Example:
```sql
-- CreateTable User
CREATE TABLE "user" (
  "id" TEXT NOT NULL PRIMARY KEY,
  "email" TEXT NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX "user_email_key" ON "user"("email");
```

---

## Data Integrity

### Constraints

- **User.email:** UNIQUE (one email per user)
- **SurveyCompletion.userId:** Foreign key → User (CASCADE delete)
- **Purchase.userId:** Foreign key → User (CASCADE delete)
- **Purchase.itemId:** Foreign key → RewardItem (RESTRICT)

### Indexes

Indexes on frequently-queried columns:
- `SurveyCompletion(userId)` — fetch user's assessments
- `SurveyCompletion(assessmentId)` — fetch responses to a survey
- `Purchase(userId)` — fetch user's purchases
- `AuditLog(userId, createdAt)` — audit trail queries

---

## Row-Level Security (RLS)

Supabase RLS policies enforce data access:

### Policy: Users See Own Data

```sql
CREATE POLICY "Users can view own surveys"
ON survey_completion
FOR SELECT
USING (auth.uid()::text = user_id);
```

### Policy: Admin Sees All Audit Logs

```sql
CREATE POLICY "Admins can view all audit logs"
ON audit_log
FOR SELECT
USING (
  auth.jwt()->>'email' = 'admin@example.com'
  OR auth.jwt()->>'role' = 'admin'
);
```

**Enable RLS:**
1. Supabase Dashboard → Authentication → RLS
2. Enable RLS for `survey_completion`, `purchase`, `audit_log`
3. Create policies (templates in [SECURITY.md](SECURITY.md))

---

## Encryption

### Encrypted Column: SurveyCompletion.results

- **Type:** BYTEA (binary data)
- **Algorithm:** AES-256-GCM
- **Key:** Stored in env var `ASSESSMENT_ENCRYPTION_KEY`
- **Encryption:** Happens in Server Actions before insert
- **Decryption:** Happens on-demand (never stored in plaintext)

### Encrypt in Server Action

```typescript
// src/app/dashboard/assessment-submit/action.ts
'use server';

import { encryptResults } from '@/lib/encryption';

export async function submitAssessment(data: AssessmentData) {
  const encrypted = await encryptResults(
    data.results,
    process.env.ASSESSMENT_ENCRYPTION_KEY!
  );
  
  await prisma.surveyCompletion.create({
    data: {
      userId: user.id,
      assessmentId: data.assessmentId,
      results: encrypted, // BYTEA
      completedAt: new Date(),
    },
  });
}
```

---

## Seed Data (Optional)

Create `prisma/seed.ts` for test data:

```typescript
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create test assessment
  await prisma.assessment.create({
    data: {
      name: 'Big Five',
      category: 'psychological',
      questions: [{ id: 1, text: 'You are...', options: [...] }],
    },
  });
}

main()
  .then(() => console.log('Seed complete'))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => await prisma.$disconnect());
```

Run with:
```bash
npx prisma db seed
```

---

## Troubleshooting

### Migration Conflicts

If migration files diverge between local and production:

```bash
# Reset dev database to production state
npx prisma db push --skip-generate --force-reset

# Re-apply local changes
npx prisma migrate dev --name [new_migration]
```

### Connection Pooler Issues (Port 6543)

If queries timeout:
1. Check Supabase dashboard for connection pool status
2. Increase pool size: Supabase → Database → Connection pooler
3. Use `DIRECT_URL` for one-off operations (migrations)

### Encryption Key Rotation

To rotate `ASSESSMENT_ENCRYPTION_KEY`:

1. Generate new key
2. Decrypt all `SurveyCompletion.results` with old key
3. Re-encrypt with new key
4. Update env var
5. Test on staging first

---

**Last Updated:** 2026-05-19
**Maintained By:** Goga Kaviladze
