/**
 * One-time migration: encrypts all plaintext SurveyCompletion.results
 * Run with: npx tsx scripts/migrate-encrypt-assessments.ts
 * Requires ASSESSMENT_ENCRYPTION_KEY in environment.
 */
import { PrismaClient, Prisma } from '@prisma/client'
import { encryptJson } from '../src/lib/encryption'

const prisma = new PrismaClient()

function isAlreadyEncrypted(value: unknown): boolean {
  return (
    typeof value === 'object' &&
    value !== null &&
    (value as Record<string, unknown>).v === 1 &&
    typeof (value as Record<string, unknown>).iv === 'string'
  )
}

async function main() {
  const completions = await prisma.surveyCompletion.findMany({
    select: { id: true, results: true },
  })

  const toMigrate = completions.filter(
    (c) => c.results !== null && !isAlreadyEncrypted(c.results)
  )

  console.log(`Found ${toMigrate.length} unencrypted records out of ${completions.length} total.`)

  for (const c of toMigrate) {
    const encrypted = encryptJson(c.results)
    await prisma.surveyCompletion.update({
      where: { id: c.id },
      data: { results: encrypted as Prisma.InputJsonValue },
    })
    console.log(`  Migrated: ${c.id}`)
  }

  console.log('Done.')
}

main()
  .catch((e) => { console.error(e); process.exit(1) })
  .finally(() => prisma.$disconnect())
