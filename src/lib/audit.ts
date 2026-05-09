import prisma from '@/lib/prisma'
import { Prisma } from '@prisma/client'

type AuditAction = 'READ' | 'WRITE' | 'DELETE'

export async function writeAuditLog(
  userId: string,
  action: AuditAction,
  entity: string,
  entityId?: string,
  metadata?: Record<string, unknown>
) {
  await prisma.auditLog.create({
    data: {
      userId,
      action,
      entity,
      entityId,
      metadata: metadata as Prisma.InputJsonValue | undefined,
    },
  }).catch(() => {
    // Never let audit failures break the main operation
  })
}
