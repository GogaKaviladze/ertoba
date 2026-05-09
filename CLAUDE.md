# CLAUDE.md

Behavioral guidelines to reduce common LLM coding mistakes. Merge with project-specific instructions as needed.

**Tradeoff:** These guidelines bias toward caution over speed. For trivial tasks, use judgment.

## 1. Think Before Coding

**Don't assume. Don't hide confusion. Surface tradeoffs.**

Before implementing:
- State your assumptions explicitly. If uncertain, ask.
- If multiple interpretations exist, present them - don't pick silently.
- If a simpler approach exists, say so. Push back when warranted.
- If something is unclear, stop. Name what's confusing. Ask.

## 2. Simplicity First

**Minimum code that solves the problem. Nothing speculative.**

- No features beyond what was asked.
- No abstractions for single-use code.
- No "flexibility" or "configurability" that wasn't requested.
- No error handling for impossible scenarios.
- If you write 200 lines and it could be 50, rewrite it.

Ask yourself: "Would a senior engineer say this is overcomplicated?" If yes, simplify.

## 3. Surgical Changes

**Touch only what you must. Clean up only your own mess.**

When editing existing code:
- Don't "improve" adjacent code, comments, or formatting.
- Don't refactor things that aren't broken.
- Match existing style, even if you'd do it differently.
- If you notice unrelated dead code, mention it - don't delete it.

When your changes create orphans:
- Remove imports/variables/functions that YOUR changes made unused.
- Don't remove pre-existing dead code unless asked.

The test: Every changed line should trace directly to the user's request.

## 4. Goal-Driven Execution

**Define success criteria. Loop until verified.**

Transform tasks into verifiable goals:
- "Add validation" → "Write tests for invalid inputs, then make them pass"
- "Fix the bug" → "Write a test that reproduces it, then make it pass"
- "Refactor X" → "Ensure tests pass before and after"

For multi-step tasks, state a brief plan:
```
1. [Step] → verify: [check]
2. [Step] → verify: [check]
3. [Step] → verify: [check]
```

Strong success criteria let you loop independently. Weak criteria ("make it work") require constant clarification.

---

**These guidelines are working if:** fewer unnecessary changes in diffs, fewer rewrites due to overcomplication, and clarifying questions come before implementation rather than after mistakes.

---

## 5. Ertoba-Analytics — Project Conventions

### Issue lösen
1. Neuen Branch erstellen: `git checkout -b fix/issue-XY` (oder `feat/`, `chore/`, `docs/`)
2. Code + Tests schreiben
3. PR erstellen — **nie direkt auf main pushen**

### Testing
```bash
cd ertoba-analytics-dashboard
npm run test:e2e         # Alle Playwright E2E Tests
npm run test:e2e -- --ui # Visuell
```
Neue Features brauchen E2E Tests. Selektoren: `data-testid` bevorzugen.

### Definition of Done
1. Funktionalität implementiert
2. E2E Tests ergänzt
3. PR-Beschreibung enthält Risiko + Testhinweise

### Bekannte Gotchas
**Next.js 16 — Middleware heißt jetzt Proxy:** Datei ist `src/proxy.ts`, Export ist `proxy()` (nicht `middleware()`). Das ist eine offizielle Breaking Change in Next.js 16.

**Prisma v7 + Supabase TLS (Vercel):** `rejectUnauthorized: false` allein reicht nicht. Fix:
```ts
ssl: { rejectUnauthorized: false, checkServerIdentity: () => undefined }
```
Prisma-Calls in Layouts immer mit `.catch(() => fallback)` absichern.

**Datenbank:** Connection Pooler Port 6543 (nicht 5432) in `DATABASE_URL`.

### Referenzen
| Dokument | Inhalt |
|----------|--------|
| [context/ARCH.md](context/ARCH.md) | Tech Stack, Dateistruktur, Data Models |
| [SETUP.md](SETUP.md) | Lokales Setup (Supabase, env vars, Prisma) |
| [SECURITY.md](SECURITY.md) | Security Tasks, Credential-Rotation |

> Issues: https://github.com/GogaKaviladze/Ertoba-Analytics/issues
