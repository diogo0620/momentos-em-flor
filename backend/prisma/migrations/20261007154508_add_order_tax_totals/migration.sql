-- CreateTable
CREATE TABLE "OrderTaxTotal" (
    "id" SERIAL NOT NULL,
    "orderId" INTEGER NOT NULL,
    "taxCodeId" INTEGER NOT NULL,
    "netAmount" DECIMAL(10,2) NOT NULL,
    "taxAmount" DECIMAL(10,2) NOT NULL,
    "grossAmount" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OrderTaxTotal_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "OrderTaxTotal_orderId_idx" ON "OrderTaxTotal"("orderId");

-- CreateIndex
CREATE INDEX "OrderTaxTotal_taxCodeId_idx" ON "OrderTaxTotal"("taxCodeId");

-- CreateIndex
CREATE UNIQUE INDEX "OrderTaxTotal_orderId_taxCodeId_key" ON "OrderTaxTotal"("orderId", "taxCodeId");

-- AddForeignKey
ALTER TABLE "OrderTaxTotal" ADD CONSTRAINT "OrderTaxTotal_orderId_fkey" FOREIGN KEY ("orderId") REFERENCES "Order"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OrderTaxTotal" ADD CONSTRAINT "OrderTaxTotal_taxCodeId_fkey" FOREIGN KEY ("taxCodeId") REFERENCES "TaxCode"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
