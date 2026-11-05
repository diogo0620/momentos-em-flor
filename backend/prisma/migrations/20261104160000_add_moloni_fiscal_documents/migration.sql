CREATE TYPE "MoloniDocumentStatus" AS ENUM ('QUEUED', 'PROCESSING', 'ISSUED', 'FAILED', 'NOT_REQUIRED');

ALTER TABLE "MoloniSettings"
ADD COLUMN "invoiceDocumentSetId" TEXT,
ADD COLUMN "receiptDocumentSetId" TEXT,
ADD COLUMN "paymentMethodId" TEXT,
ADD COLUMN "defaultCustomerId" TEXT,
ADD COLUMN "defaultProductId" TEXT,
ADD COLUMN "defaultTaxId" TEXT,
ADD COLUMN "defaultTaxRate" DECIMAL(5,2),
ADD COLUMN "issueReceiptAfterPayment" BOOLEAN NOT NULL DEFAULT false;

CREATE TABLE "MoloniFiscalDocument" (
    "id" SERIAL NOT NULL,
    "orderId" INTEGER NOT NULL,
    "moloniCustomerId" TEXT,
    "invoiceStatus" "MoloniDocumentStatus" NOT NULL DEFAULT 'QUEUED',
    "invoiceId" TEXT,
    "invoiceIssuedAt" TIMESTAMP(3),
    "receiptStatus" "MoloniDocumentStatus" NOT NULL DEFAULT 'NOT_REQUIRED',
    "receiptId" TEXT,
    "receiptIssuedAt" TIMESTAMP(3),
    "attempts" INTEGER NOT NULL DEFAULT 0,
    "lastAttemptAt" TIMESTAMP(3),
    "lastError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "MoloniFiscalDocument_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "MoloniFiscalDocument_orderId_key" ON "MoloniFiscalDocument"("orderId");
CREATE UNIQUE INDEX "MoloniFiscalDocument_invoiceId_key" ON "MoloniFiscalDocument"("invoiceId");
CREATE UNIQUE INDEX "MoloniFiscalDocument_receiptId_key" ON "MoloniFiscalDocument"("receiptId");
CREATE INDEX "MoloniFiscalDocument_invoiceStatus_idx" ON "MoloniFiscalDocument"("invoiceStatus");
CREATE INDEX "MoloniFiscalDocument_receiptStatus_idx" ON "MoloniFiscalDocument"("receiptStatus");

ALTER TABLE "MoloniFiscalDocument"
ADD CONSTRAINT "MoloniFiscalDocument_orderId_fkey"
FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
