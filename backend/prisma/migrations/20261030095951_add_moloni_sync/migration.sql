/*
  Warnings:

  - You are about to drop the column `moloniId` on the `Product` table. All the data in the column will be lost.
  - You are about to drop the column `moloniId` on the `TaxCode` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "MoloniSyncStatus" AS ENUM ('NOT_SYNCED', 'PENDING', 'SYNCED', 'FAILED');

-- AlterTable
ALTER TABLE "Product" DROP COLUMN "moloniId";

-- AlterTable
ALTER TABLE "TaxCode" DROP COLUMN "moloniId";

-- DropEnum
DROP TYPE "PricingMarginType";

-- CreateTable
CREATE TABLE "MoloniSync" (
    "id" SERIAL NOT NULL,
    "moloniId" TEXT,
    "status" "MoloniSyncStatus" NOT NULL DEFAULT 'NOT_SYNCED',
    "message" TEXT,
    "lastAttemptAt" TIMESTAMP(3),
    "syncedAt" TIMESTAMP(3),
    "productId" INTEGER,
    "taxCodeId" INTEGER,
    "userId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MoloniSync_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "MoloniSync_productId_key" ON "MoloniSync"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "MoloniSync_taxCodeId_key" ON "MoloniSync"("taxCodeId");

-- CreateIndex
CREATE UNIQUE INDEX "MoloniSync_userId_key" ON "MoloniSync"("userId");

-- CreateIndex
CREATE INDEX "MoloniSync_status_idx" ON "MoloniSync"("status");

-- CreateIndex
CREATE INDEX "MoloniSync_moloniId_idx" ON "MoloniSync"("moloniId");

-- AddForeignKey
ALTER TABLE "MoloniSync" ADD CONSTRAINT "MoloniSync_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MoloniSync" ADD CONSTRAINT "MoloniSync_taxCodeId_fkey" FOREIGN KEY ("taxCodeId") REFERENCES "TaxCode"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MoloniSync" ADD CONSTRAINT "MoloniSync_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
