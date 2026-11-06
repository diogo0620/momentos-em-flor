/*
  Warnings:

  - You are about to drop the column `lineTotal` on the `OrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `productDescription` on the `OrderItem` table. All the data in the column will be lost.
  - You are about to drop the column `productName` on the `OrderItem` table. All the data in the column will be lost.
  - Added the required column `grossAmount` to the `OrderItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `OrderItem` table without a default value. This is not possible if the table is not empty.
  - Added the required column `netAmount` to the `OrderItem` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "OrderItem" DROP COLUMN "lineTotal",
DROP COLUMN "productDescription",
DROP COLUMN "productName",
ADD COLUMN     "description" TEXT,
ADD COLUMN     "grossAmount" DECIMAL(10,2) NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL,
ADD COLUMN     "netAmount" DECIMAL(10,2) NOT NULL,
ADD COLUMN     "taxCodeId" INTEGER,
ALTER COLUMN "productId" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "OrderItem_taxCodeId_idx" ON "OrderItem"("taxCodeId");

-- AddForeignKey
ALTER TABLE "OrderItem" ADD CONSTRAINT "OrderItem_taxCodeId_fkey" FOREIGN KEY ("taxCodeId") REFERENCES "TaxCode"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
