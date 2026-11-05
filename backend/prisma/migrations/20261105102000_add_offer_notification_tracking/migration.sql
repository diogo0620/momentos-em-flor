ALTER TABLE "OrderOffer"
ADD COLUMN "notificationSentAt" TIMESTAMP(3),
ADD COLUMN "notificationAttempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "notificationLastAttemptAt" TIMESTAMP(3),
ADD COLUMN "notificationLastError" TEXT;

CREATE INDEX "OrderOffer_notificationSentAt_expiresAt_idx"
ON "OrderOffer"("notificationSentAt", "expiresAt");
