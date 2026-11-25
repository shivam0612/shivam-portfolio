-- CreateEnum
CREATE TYPE "MessageStatus" AS ENUM ('NEW', 'READ', 'REPLIED', 'ARCHIVED', 'SPAM');

-- CreateEnum
CREATE TYPE "NotificationStatus" AS ENUM ('PENDING', 'SENT', 'FAILED');

-- CreateTable
CREATE TABLE "contact_messages" (
    "id" UUID NOT NULL,
    "reference" VARCHAR(24) NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "email" VARCHAR(254) NOT NULL,
    "organization" VARCHAR(120),
    "subject" VARCHAR(150) NOT NULL,
    "inquiryType" VARCHAR(64) NOT NULL,
    "message" VARCHAR(5000) NOT NULL,
    "consent" BOOLEAN NOT NULL,
    "status" "MessageStatus" NOT NULL DEFAULT 'NEW',
    "dedupeKey" VARCHAR(64) NOT NULL,
    "notificationStatus" "NotificationStatus" NOT NULL DEFAULT 'PENDING',
    "notificationAttempts" INTEGER NOT NULL DEFAULT 0,
    "notificationLastError" VARCHAR(500),
    "notificationLastAttemptAt" TIMESTAMP(3),
    "notificationNextAttemptAt" TIMESTAMP(3),
    "notifiedAt" TIMESTAMP(3),
    "acknowledgedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contact_messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "contact_messages_reference_key" ON "contact_messages"("reference");

-- CreateIndex
CREATE UNIQUE INDEX "contact_messages_dedupeKey_key" ON "contact_messages"("dedupeKey");

-- CreateIndex
CREATE INDEX "contact_messages_createdAt_idx" ON "contact_messages"("createdAt");

-- CreateIndex
CREATE INDEX "contact_messages_status_createdAt_idx" ON "contact_messages"("status", "createdAt");

-- CreateIndex
CREATE INDEX "contact_messages_notificationStatus_notificationNextAtt_idx" ON "contact_messages"("notificationStatus", "notificationNextAttemptAt");

-- CreateIndex
CREATE INDEX "contact_messages_email_idx" ON "contact_messages"("email");
