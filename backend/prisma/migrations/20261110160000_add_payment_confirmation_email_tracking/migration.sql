ALTER TABLE "Payment"
ADD COLUMN "confirmationEmailSentAt" TIMESTAMP(3),
ADD COLUMN "confirmationEmailAttempts" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "confirmationEmailLastAttemptAt" TIMESTAMP(3),
ADD COLUMN "confirmationEmailLastError" TEXT;

CREATE INDEX "Payment_confirmationEmailSentAt_idx"
ON "Payment"("confirmationEmailSentAt");
