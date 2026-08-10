-- DropForeignKey
ALTER TABLE "FloristCompensationRule" DROP CONSTRAINT "FloristCompensationRule_floristId_fkey";

-- DropForeignKey
ALTER TABLE "FloristCompensationRule" DROP CONSTRAINT "FloristCompensationRule_productId_fkey";

-- AlterTable
ALTER TABLE "FloristCompensationRule" ADD COLUMN     "deletedAt" TIMESTAMP(3);

-- CreateIndex
CREATE INDEX "FloristCompensationRule_deletedAt_idx" ON "FloristCompensationRule"("deletedAt");

-- AddForeignKey
ALTER TABLE "FloristCompensationRule" ADD CONSTRAINT "FloristCompensationRule_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FloristCompensationRule" ADD CONSTRAINT "FloristCompensationRule_floristId_fkey" FOREIGN KEY ("floristId") REFERENCES "Florist"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
