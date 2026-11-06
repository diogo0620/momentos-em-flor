/*
  Warnings:

  - Added the required column `taxAmount` to the `Order` table without a default value. This is not possible if the table is not empty.
  - Added the required column `taxAmount` to the `OrderItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `taxRate` to the `OrderItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `taxCodeId` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "taxAmount" DECIMAL(10,2) NOT NULL;

-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "taxAmount" DECIMAL(10,2) NOT NULL,
ADD COLUMN     "taxRate" DECIMAL(5,2) NOT NULL;

-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "taxCodeId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "TaxCode" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "rate" DECIMAL(5,2) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),

    CONSTRAINT "TaxCode_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "TaxCode_code_key" ON "TaxCode"("code");

-- CreateIndex
CREATE INDEX "TaxCode_active_idx" ON "TaxCode"("active");

-- CreateIndex
CREATE INDEX "TaxCode_deletedAt_idx" ON "TaxCode"("deletedAt");

-- CreateIndex
CREATE INDEX "Product_taxCodeId_idx" ON "Product"("taxCodeId");

-- AddForeignKey
ALTER TABLE "Product" ADD CONSTRAINT "Product_taxCodeId_fkey" FOREIGN KEY ("taxCodeId") REFERENCES "TaxCode"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
