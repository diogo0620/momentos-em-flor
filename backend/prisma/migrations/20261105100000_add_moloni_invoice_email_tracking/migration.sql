ALTER TABLE "MoloniFiscalDocument"
ADD COLUMN "invoiceEmailId" TEXT,
ADD COLUMN "invoiceEmailSentAt" TIMESTAMP(3),
ADD COLUMN "invoiceEmailLastError" TEXT;

CREATE INDEX "MoloniFiscalDocument_invoiceEmailSentAt_idx"
ON "MoloniFiscalDocument"("invoiceEmailSentAt");
