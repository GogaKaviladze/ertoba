-- CreateTable
CREATE TABLE "AuditLog" (
    "id"        TEXT NOT NULL,
    "userId"    TEXT NOT NULL,
    "action"    TEXT NOT NULL,
    "entity"    TEXT NOT NULL,
    "entityId"  TEXT,
    "metadata"  JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- Retention: auto-delete entries older than 12 months
-- Run periodically: DELETE FROM "AuditLog" WHERE "createdAt" < NOW() - INTERVAL '12 months';
