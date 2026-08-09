import { test, expect } from '@playwright/test'
import { deriveAnonymousCredentials } from '../src/lib/zeroKnowledge'

test.describe('Zero-Knowledge Security Suite', () => {
  test('deriveAnonymousCredentials produces one-way SHA-256 hashed credentials without raw key', () => {
    const rawKey = 'ertoba-key-secret-user-private-key-12345'
    const creds = deriveAnonymousCredentials(rawKey)

    // Raw key MUST NOT appear in pseudoEmail, derivedPassword, or displayUsername
    expect(creds.pseudoEmail).not.toContain(rawKey)
    expect(creds.derivedPassword).not.toContain(rawKey)
    expect(creds.displayUsername).not.toContain(rawKey)

    // Pseudo-email must be valid SHA-256 hex string + @ertoba.anon
    expect(creds.pseudoEmail).toMatch(/^[a-f0-9]{64}@ertoba\.anon$/)

    // Password must be 64-character SHA-256 hex string
    expect(creds.derivedPassword).toMatch(/^[a-f0-9]{64}$/)

    // Display username must be formatted as Anon-XXXXXXXX
    expect(creds.displayUsername).toMatch(/^Anon-[a-f0-9]{8}$/)
  })

  test('deriveAnonymousCredentials is deterministic for the same key', () => {
    const key = 'user-key-abcdef'
    const res1 = deriveAnonymousCredentials(key)
    const res2 = deriveAnonymousCredentials(key)

    expect(res1.pseudoEmail).toBe(res2.pseudoEmail)
    expect(res1.derivedPassword).toBe(res2.derivedPassword)
    expect(res1.displayUsername).toBe(res2.displayUsername)
  })

  test('different keys produce completely distinct pseudo-emails and passwords', () => {
    const keyA = 'user-key-aaaaaa'
    const keyB = 'user-key-bbbbbb'
    const resA = deriveAnonymousCredentials(keyA)
    const resB = deriveAnonymousCredentials(keyB)

    expect(resA.pseudoEmail).not.toBe(resB.pseudoEmail)
    expect(resA.derivedPassword).not.toBe(resB.derivedPassword)
    expect(resA.displayUsername).not.toBe(resB.displayUsername)
  })
})
