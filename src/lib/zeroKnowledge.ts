import { createHash } from 'crypto'

/**
 * Zero-Knowledge Credential Derivation Helper
 * 
 * Ensures private keys entered by users are never stored in plaintext anywhere
 * in the database or Supabase Auth.
 */

export interface DerivedAnonymousCredentials {
  pseudoEmail: string
  derivedPassword: string
  displayUsername: string
}

export function deriveAnonymousCredentials(rawKey: string): DerivedAnonymousCredentials {
  const cleanKey = rawKey.trim()
  
  // 1. One-way hash of the private key for pseudo-email identifier
  const keyHash = createHash('sha256')
    .update(`ertoba-identity-v1:${cleanKey}`)
    .digest('hex')

  // 2. Separate one-way hash derived for authentication password
  const passwordHash = createHash('sha256')
    .update(`ertoba-auth-v1:${cleanKey}`)
    .digest('hex')

  // 3. Non-reversible public display username tag (e.g. Anon-a1b2c3d4)
  const displayUsername = `Anon-${keyHash.substring(0, 8)}`

  return {
    pseudoEmail: `${keyHash}@ertoba.anon`,
    derivedPassword: passwordHash,
    displayUsername,
  }
}
