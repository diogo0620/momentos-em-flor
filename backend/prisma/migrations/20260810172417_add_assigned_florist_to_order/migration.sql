-- AlterTable
ALTER TABLE "Order" ADD COLUMN     "assignedFloristId" INTEGER;

-- AddForeignKey
ALTER TABLE "Order" ADD CONSTRAINT "Order_assignedFloristId_fkey" FOREIGN KEY ("assignedFloristId") REFERENCES "Florist"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
