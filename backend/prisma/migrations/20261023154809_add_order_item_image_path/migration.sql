-- DropIndex
DROP INDEX "OrderItemComponent_orderItemId_idx";

-- AlterTable
ALTER TABLE "OrderItem" ADD COLUMN     "imagePath" TEXT;
