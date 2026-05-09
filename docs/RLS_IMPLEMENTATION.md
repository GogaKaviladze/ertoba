# Row Level Security (RLS) Implementation — Issue #64

## Problem
Users could access other users' Big Five assessment results without authorization. This is a **DSGVO/GDPR violation** and a critical security flaw.

## Solution
Implemented PostgreSQL Row Level Security (RLS) policies on Supabase to enforce user-scoped data access at the database level.

---

## Tables Protected

### 1. **SurveyCompletion** (Assessment Results)
- ✅ Users can SELECT **only their own** results
- ✅ Users can INSERT **only their own** completions
- ❌ No UPDATE allowed (write-once, immutable)
- ❌ No DELETE allowed (audit trail)

### 2. **Transaction** (ERTC Spending)
- ✅ Users can SELECT **only their own** transactions
- ✅ Service layer can INSERT on behalf of users
- ❌ No UPDATE allowed (immutable ledger)
- ❌ No DELETE allowed (audit trail)

### 3. **User** (Account Data)
- ✅ Users can SELECT **only their own** user record
- ✅ Users can UPDATE their own profile (username, etc.)
- ❌ No INSERT allowed (account creation via Supabase Auth)
- ❌ No DELETE allowed (prevents account removal via SQL)

### 4. **RewardItem & Assessment** (Public Catalogs)
- ✅ Everyone can SELECT (public marketplace + public assessments)
- ❌ Only admin can INSERT/UPDATE/DELETE

### 5. **PropagandaArticle & DailyPulse** (Public Analytics)
- ✅ Everyone can SELECT (public data visualization)
- ❌ Only data pipeline can write

---

## RLS Policy Logic

Each policy uses `auth.uid()` — the authenticated user's ID from Supabase Auth JWT.

```sql
-- Example: Users can only see their own survey results
CREATE POLICY select_own_completions ON "SurveyCompletion"
  FOR SELECT
  USING (auth.uid()::text = "userId");
```

**How it works:**
1. User logs in → Supabase Auth issues JWT with `user_id` claim
2. Every query is checked: Does `auth.uid()` match the record's `userId`?
3. If NO match → PostgreSQL returns 0 rows (silently denied, no error)

---

## Testing

Run E2E tests to verify RLS:

```bash
# Start test environment with real Supabase (or local emulator)
npm run test:e2e -- tests/rls-surveycompletion.spec.ts
```

**Test Scenarios:**
- ✅ User A cannot read User B's survey results
- ✅ User A can read only their own results
- ✅ User B cannot see User A's transactions
- ✅ Survey completions are immutable (no UPDATE)
- ✅ Transactions are immutable (no DELETE)

---

## Migration & Deployment

1. **Local development:** Run migration via Prisma
   ```bash
   npx prisma migrate deploy
   ```

2. **Supabase Production:** Migration runs automatically on merge to main

3. **Rollback (if needed):**
   ```bash
   npx prisma migrate resolve --rolled-back rls_surveycompletion_policies
   ```

---

## Impact

| Before | After |
|--------|-------|
| ❌ Any authenticated user can read all survey results | ✅ Users can only see their own |
| ❌ No audit trail for data access | ✅ All access logged via RLS (Supabase audit logs) |
| ❌ GDPR non-compliant | ✅ GDPR-compliant (user-scoped data access) |
| ❌ Users could spoof other users' transactions | ✅ Users can only create/view own transactions |

---

## Notes for Future Work

- **#65 (Field-Level Encryption):** Next layer of security. RLS handles access control; encryption handles data-at-rest confidentiality.
- **#66 (Audit Logging):** Track WHO accessed WHAT data and WHEN (complementary to RLS).
- **Service-to-Service Auth:** Service Layer (`src/services/`) will need special auth role or bypass mechanism (e.g., service key) to perform admin operations on behalf of users.

---

## References

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL RLS Docs](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- GDPR Article 32: Technical and organizational measures (data protection)
