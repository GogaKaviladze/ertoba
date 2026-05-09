import { gcm } from '@noble/ciphers/aes'
import { hkdf } from '@noble/hashes/hkdf.js'
import { sha256 } from '@noble/hashes/sha2.js'
import { randomBytes } from '@noble/ciphers/webcrypto'

interface EncryptedPayload {
  v: 1
  iv: string
  ct: string
  [key: string]: unknown
}

function isEncryptedPayload(value: unknown): value is EncryptedPayload {
  return (
    typeof value === 'object' &&
    value !== null &&
    (value as EncryptedPayload).v === 1 &&
    typeof (value as EncryptedPayload).iv === 'string' &&
    typeof (value as EncryptedPayload).ct === 'string'
  )
}

function getDerivedKey(): Uint8Array {
  const raw = process.env.ASSESSMENT_ENCRYPTION_KEY
  if (!raw) throw new Error('ASSESSMENT_ENCRYPTION_KEY is not set')

  const keyMaterial = Buffer.from(raw, 'hex')
  if (keyMaterial.length !== 32) {
    throw new Error('ASSESSMENT_ENCRYPTION_KEY must be 32 bytes (64 hex chars)')
  }

  return hkdf(sha256, keyMaterial, undefined, new TextEncoder().encode('ertoba-assessment-v1'), 32)
}

export function encryptJson(data: unknown): EncryptedPayload {
  const key = getDerivedKey()
  const iv = randomBytes(12)
  const plaintext = new TextEncoder().encode(JSON.stringify(data))

  const cipher = gcm(key, iv)
  const ciphertext = cipher.encrypt(plaintext)

  return {
    v: 1,
    iv: Buffer.from(iv).toString('hex'),
    ct: Buffer.from(ciphertext).toString('hex'),
  }
}

export function decryptJson(payload: unknown): unknown {
  if (!isEncryptedPayload(payload)) {
    // Legacy plaintext — return as-is for backwards compatibility
    return payload
  }

  const key = getDerivedKey()
  const iv = Buffer.from(payload.iv, 'hex')
  const ciphertext = Buffer.from(payload.ct, 'hex')

  const cipher = gcm(key, iv)
  const plaintext = cipher.decrypt(ciphertext)

  return JSON.parse(new TextDecoder().decode(plaintext))
}
