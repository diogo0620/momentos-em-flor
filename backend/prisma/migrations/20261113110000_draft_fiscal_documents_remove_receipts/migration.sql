ALTER TYPE "MoloniDocumentStatus" ADD VALUE IF NOT EXISTS 'DRAFT' AFTER 'PROCESSING';

DROP INDEX IF EXISTS "MoloniFiscalDocument_receiptId_key";
DROP INDEX IF EXISTS "MoloniFiscalDocument_receiptStatus_idx";
ALTER TABLE "MoloniFiscalDocument"
  DROP COLUMN IF EXISTS "receiptStatus",
  DROP COLUMN IF EXISTS "receiptId",
  DROP COLUMN IF EXISTS "receiptIssuedAt",
  ADD COLUMN "creditNotePdfUrl" TEXT,
  ADD COLUMN "creditNotePdfUrlUpdatedAt" TIMESTAMP(3),
  ADD COLUMN "creditNoteEmailId" TEXT,
  ADD COLUMN "creditNoteEmailSentAt" TIMESTAMP(3),
  ADD COLUMN "creditNoteEmailLastError" TEXT;
CREATE INDEX "MoloniFiscalDocument_creditNoteEmailSentAt_idx" ON "MoloniFiscalDocument"("creditNoteEmailSentAt");

ALTER TABLE "MoloniSettings"
  DROP COLUMN IF EXISTS "receiptDocumentSetId",
  DROP COLUMN IF EXISTS "issueReceiptAfterPayment",
  ADD COLUMN "createDocumentsAsDraft" BOOLEAN NOT NULL DEFAULT true;
